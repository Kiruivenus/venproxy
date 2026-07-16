import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { requireAdmin } from "@/lib/auth"
import { type Db, ObjectId } from "mongodb"
import type { Order, Proxy, ProxyPurchase, Transaction, WalletLedger } from "@/lib/types"
import { sendDepositSuccessfulEmail, sendDepositFailedEmail } from "@/lib/mail"

// Helper function to find available proxies
async function findAvailableProxyForCallback(db: Db, country: string, userId: ObjectId) {
  const userPurchases = await db
    .collection<ProxyPurchase>("purchases")
    .find({
      userId,
      expiresAt: { $gt: new Date() },
    })
    .toArray()

  const purchasedProxyIds = userPurchases.map((p: ProxyPurchase) => p.proxyId)

  const now = new Date()
  const sixHoursFromNow = new Date(now.getTime() + 6 * 60 * 60 * 1000)

  const freshProxy = await db
    .collection<Proxy>("proxies")
    .find({
      country,
      isActive: true,
      expiresAt: { $gt: sixHoursFromNow },
      $expr: { $lt: ["$currentUsage", "$maxUsage"] },
      _id: { $nin: purchasedProxyIds },
    })
    .sort({ expiresAt: -1 })
    .limit(1)
    .toArray()

  if (freshProxy.length > 0) {
    return freshProxy[0]
  }

  const anyProxy = await db
    .collection<Proxy>("proxies")
    .find({
      country,
      isActive: true,
      expiresAt: { $gt: now },
      $expr: { $lt: ["$currentUsage", "$maxUsage"] },
      _id: { $nin: purchasedProxyIds },
    })
    .sort({ expiresAt: -1 })
    .limit(1)
    .toArray()

  return anyProxy.length > 0 ? anyProxy[0] : null
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    
    const { logId } = await request.json()
    if (!logId) {
      return NextResponse.json({ error: "Log ID is required" }, { status: 400 })
    }

    const db = await getDb()

    const log = await db.collection("webhook_logs").findOne({ _id: new ObjectId(logId) })
    if (!log) {
      return NextResponse.json({ error: "Webhook log not found" }, { status: 404 })
    }

    const body = log.payload
    const event = body.event || body.event_type || (body.status === "success" ? "transaction.success" : "transaction.failed")
    const tx = body.transaction || body.data || body
    
    const transactionId = tx.id || tx.transactionId || tx.transaction_id
    const reference = tx.accountReference || tx.account_reference || tx.reference || tx.external_reference
    const phone = tx.phone || tx.phone_number
    const amount = Number(tx.amount || tx.value)
    const receiptNumber = tx.receiptNumber || tx.receipt_number || tx.mpesa_receipt || tx.mpesaReceiptNumber
    const resultCode = String(tx.resultCode !== undefined ? tx.resultCode : (tx.result_code !== undefined ? tx.result_code : "0"))
    const resultDescription = tx.resultDescription || tx.result_description || tx.message || "Success"

    const transaction = await db.collection<Transaction>("transactions").findOne({
      $or: [{ reference }, { transactionId }],
    })

    if (!transaction) {
      return NextResponse.json({ error: "Associated transaction not found for this log" }, { status: 404 })
    }

    // Check if already processed
    if (transaction.status === "SUCCESS" || transaction.status === "FAILED") {
      await db.collection("webhook_logs").updateOne(
        { _id: new ObjectId(logId) },
        { $set: { status: "processed", message: "Transaction already processed prior to retry" } }
      )
      return NextResponse.json({ success: true, message: "Transaction was already finalized" })
    }

    const isSuccess = 
      event === "transaction.success" || 
      tx.status === "SUCCESS" || 
      tx.status === "success" || 
      tx.status === "paid" || 
      resultCode === "0"

    if (isSuccess) {
      // Mark SUCCESS atomically
      const updateResult = await db.collection<Transaction>("transactions").updateOne(
        { 
          _id: transaction._id, 
          status: { $in: ["PENDING", "PROCESSING"] } 
        },
        {
          $set: {
            status: "SUCCESS",
            receiptNumber,
            resultCode,
            resultDescription,
            processedAt: new Date(),
            updatedAt: new Date(),
          },
        }
      )

      if (updateResult.modifiedCount > 0) {
        if (transaction.type === "deposit") {
          const user = await db.collection("users").findOne({ _id: transaction.userId })
          if (user) {
            const balanceBefore = user.balance || 0
            const balanceAfter = balanceBefore + amount

            await db.collection("users").updateOne(
              { _id: transaction.userId },
              { $inc: { balance: amount } }
            )

            // Ledger
            await db.collection("wallet_ledgers").insertOne({
              _id: new ObjectId(),
              userId: transaction.userId,
              amount,
              type: "deposit",
              reference: transaction.reference,
              transactionId: transaction._id,
              balanceBefore,
              balanceAfter,
              createdAt: new Date(),
            })

            // Topup status
            await db.collection("topups").updateOne(
              { _id: transaction.targetId },
              {
                $set: {
                  status: "completed",
                  mpesaReceiptNumber: receiptNumber,
                  completedAt: new Date(),
                },
              }
            )

            // Notifications
            await db.collection("notifications").insertOne({
              _id: new ObjectId(),
              userId: transaction.userId,
              title: "Deposit Successful (Retried)",
              message: `Your wallet was credited with KES ${amount.toLocaleString()} after admin manual reconciliation.`,
              type: "success",
              read: false,
              createdAt: new Date(),
            })

            sendDepositSuccessfulEmail(user.email, user.name || user.email, amount, transaction.reference, receiptNumber).catch((e) =>
              console.error("Failed to send retry success email:", e)
            )
          }
        } else if (transaction.type === "proxy") {
          const order = await db.collection<Order>("orders").findOne({ _id: transaction.targetId })
          if (order && order.status === "pending") {
            const selectedProxy = await findAvailableProxyForCallback(db, order.country, order.userId)
            let proxy = null

            if (selectedProxy) {
              proxy = await db
                .collection<Proxy>("proxies")
                .findOneAndUpdate({ _id: selectedProxy._id }, { $inc: { currentUsage: 1 } }, { returnDocument: "after" })
            }

            if (proxy) {
              const purchase: ProxyPurchase = {
                _id: new ObjectId(),
                userId: order.userId,
                proxyId: proxy._id,
                orderId: order._id,
                proxy: {
                  ip: proxy.ip,
                  port: proxy.port,
                  username: proxy.username,
                  password: proxy.password,
                  country: proxy.country,
                  countryCode: proxy.countryCode,
                },
                expiresAt: proxy.expiresAt,
                purchasedAt: new Date(),
              }

              await db.collection<ProxyPurchase>("purchases").insertOne(purchase)

              if (proxy.currentUsage >= proxy.maxUsage) {
                await db.collection<Proxy>("proxies").updateOne({ _id: proxy._id }, { $set: { isActive: false } })
              }
            }

            await db.collection<Order>("orders").updateOne(
              { _id: order._id },
              {
                $set: {
                  status: proxy ? "paid" : "failed",
                  failureReason: proxy ? undefined : "No proxies available in this country",
                  mpesaReceiptNumber: receiptNumber,
                  paidAt: new Date(),
                },
              }
            )
          }
        } else if (transaction.type === "email") {
          const emailOrder = await db.collection("emailOrders").findOne({ _id: transaction.targetId })
          if (emailOrder && emailOrder.status === "pending") {
            const availableEmails = await db
              .collection("emails")
              .find({
                domainId: emailOrder.domainId,
                status: "available",
              })
              .limit(emailOrder.quantity)
              .toArray()

            if (availableEmails.length >= emailOrder.quantity) {
              const emailIds = availableEmails.map((e) => e._id)
              await db.collection("emails").updateMany(
                { _id: { $in: emailIds } },
                { $set: { status: "sold" } }
              )

              await db.collection("emailPurchases").insertOne({
                userId: emailOrder.userId,
                orderId: emailOrder._id,
                emails: availableEmails.map((e) => ({
                  emailAddress: e.emailAddress,
                  password: e.password,
                  domain: e.domain,
                  server: e.server,
                })),
                quantity: emailOrder.quantity,
                domain: emailOrder.domain,
                totalPrice: emailOrder.totalPrice,
                purchasedAt: new Date(),
              })

              await db.collection("emailOrders").updateOne(
                { _id: emailOrder._id },
                {
                  $set: {
                    status: "paid",
                    mpesaReceiptNumber: receiptNumber,
                    paidAt: new Date(),
                  },
                }
              )
            } else {
              await db.collection("emailOrders").updateOne(
                { _id: emailOrder._id },
                {
                  $set: {
                    status: "failed",
                    failureReason: "Insufficient emails available for this domain",
                  },
                }
              )
            }
          }
        }
      } else {
        console.log(`[Admin Retry] Transaction ${transaction.reference} was already updated. Skipping retry fulfillment.`)
      }
    } else {
      // Mark FAILED atomically
      const updateResult = await db.collection<Transaction>("transactions").updateOne(
        { 
          _id: transaction._id, 
          status: { $in: ["PENDING", "PROCESSING"] } 
        },
        {
          $set: {
            status: "FAILED",
            resultCode,
            resultDescription,
            processedAt: new Date(),
            updatedAt: new Date(),
          },
        }
      )

      if (updateResult.modifiedCount > 0) {
        const updateCollectionName = 
          transaction.type === "email" ? "emailOrders" : (transaction.type === "proxy" ? "orders" : "topups")
        
        await db.collection(updateCollectionName).updateOne(
          { _id: transaction.targetId },
          {
            $set: {
              status: "failed",
              failureReason: resultDescription,
            },
          }
        )

        if (transaction.type === "deposit") {
          const user = await db.collection("users").findOne({ _id: transaction.userId })
          if (user) {
            sendDepositFailedEmail(user.email, user.name || user.email, transaction.amount, transaction.reference, resultDescription).catch((e) =>
              console.error("Failed to send retry failed email:", e)
            )
          }
        }
      } else {
        console.log(`[Admin Retry] Transaction ${transaction.reference} was already updated. Skipping retry failure handling.`)
      }
    }

    await db.collection("webhook_logs").updateOne(
      { _id: new ObjectId(logId) },
      { $set: { status: "processed" } }
    )

    return NextResponse.json({ success: true, message: "Webhook log retried and processed successfully" })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden" || error.message.includes("vercel resources exceeded")) {
      return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 403 })
    }
    console.error("Webhook log retry error:", error)
    return NextResponse.json({ error: "Failed to retry webhook log" }, { status: 500 })
  }
}
