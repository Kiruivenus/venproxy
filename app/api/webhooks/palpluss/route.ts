import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { type Db, ObjectId } from "mongodb"
import type { Order, Proxy, ProxyPurchase, Transaction, WalletLedger } from "@/lib/types"
import { verifyWebhookSignature } from "@/lib/palpluss"
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
  const rawBody = await request.text()
  
  // Verify webhook authenticity
  const headers = request.headers
  const isAuthentic = verifyWebhookSignature(headers, rawBody)
  if (!isAuthentic) {
    console.error("[PalPluss Webhook] Invalid webhook signature detected.")
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  let body: any
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  // Convert headers to a standard record object for logging
  const headerRecord: Record<string, string> = {}
  headers.forEach((value, key) => {
    headerRecord[key] = value
  })

  // Return HTTP 200 immediately to prevent timing out the webhook dispatch
  const response = NextResponse.json({ success: true, message: "Webhook accepted" })

  // Process payment asynchronously
  ;(async () => {
    try {
      const db = await getDb()
      
      // Parse webhook payload
      const event = body.event || body.event_type || (body.status === "success" ? "transaction.success" : "transaction.failed")
      const tx = body.transaction || body.data || body
      
      const transactionId = tx.id || tx.transactionId || tx.transaction_id
      const reference = tx.accountReference || tx.account_reference || tx.reference || tx.external_reference
      const phone = tx.phone || tx.phone_number
      const amount = Number(tx.amount || tx.value)
      const receiptNumber = tx.receiptNumber || tx.receipt_number || tx.mpesa_receipt || tx.mpesaReceiptNumber
      const resultCode = String(tx.resultCode !== undefined ? tx.resultCode : (tx.result_code !== undefined ? tx.result_code : "0"))
      const resultDescription = tx.resultDescription || tx.result_description || tx.message || "Success"
      
      console.log(`[PalPluss Webhook] Processing event: ${event}, Ref: ${reference}, Status: ${tx.status || "N/A"}`)

      // Log webhook callback received
      const logId = new ObjectId()
      await db.collection("webhook_logs").insertOne({
        _id: logId,
        payload: body,
        headers: headerRecord,
        status: "processing",
        reference,
        transactionId,
        createdAt: new Date(),
      })

      // Find local Transaction record matching the reference or provider transaction ID
      const transaction = await db.collection<Transaction>("transactions").findOne({
        $or: [{ reference }, { transactionId }],
      })

      if (!transaction) {
        console.warn(`[PalPluss Webhook] Transaction not found for ref: ${reference} or transactionId: ${transactionId}`)
        await db.collection("webhook_logs").updateOne(
          { _id: logId },
          { $set: { status: "failed", error: "Associated transaction not found in database" } }
        )
        return
      }

      // Check for duplicate processing
      if (transaction.status === "SUCCESS" || transaction.status === "FAILED") {
        console.log(`[PalPluss Webhook] Webhook duplicate: Transaction ${transaction.reference} is already completed. Bypassing.`)
        await db.collection("webhook_logs").updateOne(
          { _id: logId },
          { $set: { status: "duplicate", message: "Transaction already processed" } }
        )
        return
      }

      // Process Success or Fail state
      const isSuccess = 
        event === "transaction.success" || 
        tx.status === "SUCCESS" || 
        tx.status === "success" || 
        tx.status === "paid" || 
        resultCode === "0"

      if (isSuccess) {
        // Update local transaction to SUCCESS atomically
        const updateResult = await db.collection<Transaction>("transactions").updateOne(
          { 
            _id: transaction._id, 
            status: { $in: ["PENDING", "PROCESSING"] } 
          },
          {
            $set: {
              status: "SUCCESS",
              transactionId: transactionId || transaction.transactionId,
              receiptNumber,
              resultCode,
              resultDescription,
              processedAt: new Date(),
              updatedAt: new Date(),
            },
          }
        )

        if (updateResult.modifiedCount > 0) {
          // Process based on type
          if (transaction.type === "deposit") {
            // Credit user wallet
            const user = await db.collection("users").findOne({ _id: transaction.userId })
            if (user) {
              const balanceBefore = user.balance || 0
              const balanceAfter = balanceBefore + amount

              // Atomically update balance
              await db.collection("users").updateOne(
                { _id: transaction.userId },
                { $inc: { balance: amount } }
              )

              // Insert Ledger record
              const ledger: WalletLedger = {
                _id: new ObjectId(),
                userId: transaction.userId,
                amount,
                type: "deposit",
                reference: transaction.reference,
                transactionId: transaction._id,
                balanceBefore,
                balanceAfter,
                createdAt: new Date(),
              }
              await db.collection("wallet_ledgers").insertOne(ledger)

              // Update top-up status
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

              // In-app Notification
              await db.collection("notifications").insertOne({
                _id: new ObjectId(),
                userId: transaction.userId,
                title: "Deposit Successful",
                message: `Your wallet has been credited with KES ${amount.toLocaleString()}. Receipt: ${receiptNumber}.`,
                type: "success",
                read: false,
                createdAt: new Date(),
              })

              // Email Notification
              await sendDepositSuccessfulEmail(user.email, user.name || user.email, amount, transaction.reference, receiptNumber)
            }
          } else if (transaction.type === "proxy") {
            // Handle proxy purchase order
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

              // Notifications
              await db.collection("notifications").insertOne({
                _id: new ObjectId(),
                userId: order.userId,
                title: proxy ? "Proxy Activated" : "Proxy Purchase Failed",
                message: proxy 
                  ? `Your proxy order was processed successfully. Details available on dashboard.`
                  : `Your payment was accepted but no proxies were available. Please contact support.`,
                type: proxy ? "success" : "error",
                read: false,
                createdAt: new Date(),
              })
            }
          } else if (transaction.type === "email") {
            // Handle email purchase order
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

                await db.collection("notifications").insertOne({
                  _id: new ObjectId(),
                  userId: emailOrder.userId,
                  title: "Emails Purchased",
                  message: `Successfully purchased ${emailOrder.quantity} ${emailOrder.domain} email accounts.`,
                  type: "success",
                  read: false,
                  createdAt: new Date(),
                })
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

                await db.collection("notifications").insertOne({
                  _id: new ObjectId(),
                  userId: emailOrder.userId,
                  title: "Email Purchase Failed",
                  message: `Failed to process email purchase: Insufficient emails available.`,
                  type: "error",
                  read: false,
                  createdAt: new Date(),
                })
              }
            }
          }
        } else {
          console.log(`[PalPluss Webhook] Transaction ${transaction.reference} already finalized. Bypassing processing.`)
          await db.collection("webhook_logs").updateOne(
            { _id: logId },
            { $set: { status: "duplicate", message: "Transaction already processed by another thread" } }
          )
          return
        }
      } else {
        // Handle failed payment callback atomically
        const updateResult = await db.collection<Transaction>("transactions").updateOne(
          { 
            _id: transaction._id, 
            status: { $in: ["PENDING", "PROCESSING"] } 
          },
          {
            $set: {
              status: "FAILED",
              transactionId: transactionId || transaction.transactionId,
              resultCode,
              resultDescription,
              processedAt: new Date(),
              updatedAt: new Date(),
            },
          }
        )

        if (updateResult.modifiedCount > 0) {
          // Update target status
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

          // Notifications
          if (transaction.type === "deposit") {
            const user = await db.collection("users").findOne({ _id: transaction.userId })
            if (user) {
              await sendDepositFailedEmail(user.email, user.name || user.email, amount, transaction.reference, resultDescription)
            }

            await db.collection("notifications").insertOne({
              _id: new ObjectId(),
              userId: transaction.userId,
              title: "Deposit Failed",
              message: `Your deposit of KES ${amount.toLocaleString()} failed: ${resultDescription}.`,
              type: "error",
              read: false,
              createdAt: new Date(),
            })
          }
        } else {
          console.log(`[PalPluss Webhook] Transaction ${transaction.reference} already finalized. Bypassing fail processing.`)
        }
      }

      await db.collection("webhook_logs").updateOne(
        { _id: logId },
        { $set: { status: "processed" } }
      )
    } catch (bgError: any) {
      console.error("[PalPluss Webhook] Background webhook execution failed:", bgError)
    }
  })()

  return response
}
