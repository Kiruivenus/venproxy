import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { requireAuth } from "@/lib/auth"
import type { Db } from "mongodb"
import { ObjectId } from "mongodb"
import type { Order, Proxy, ProxyPurchase, Transaction, WalletLedger } from "@/lib/types"
import { queryTransaction } from "@/lib/palpluss"
import { sendDepositSuccessfulEmail, sendDepositFailedEmail } from "@/lib/mail"

// Helper function to find available proxies (identical to callback)
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

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    
    // Accept either reference, checkoutRequestId, or transactionId for maximum flexibility
    let reference = searchParams.get("reference")
    let checkoutRequestId = searchParams.get("checkoutRequestId")
    let transactionId = searchParams.get("transactionId")
    
    if (reference === "undefined" || !reference) reference = null
    if (checkoutRequestId === "undefined" || !checkoutRequestId) checkoutRequestId = null
    if (transactionId === "undefined" || !transactionId) transactionId = null
    
    if (!reference && !checkoutRequestId && !transactionId) {
      return NextResponse.json({ error: "Query parameter (reference, checkoutRequestId, or transactionId) is required" }, { status: 400 })
    }

    const db = await getDb()
    
    // Find transaction record locally
    let query: any = {}
    if (reference) query.reference = reference
    else if (checkoutRequestId) query.$or = [{ providerCheckoutId: checkoutRequestId }, { transactionId: checkoutRequestId }]
    else if (transactionId) query.transactionId = transactionId

    const transaction = await db.collection<Transaction>("transactions").findOne(query)

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // Verify ownership
    if (transaction.userId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // If already finalized, return immediately
    if (transaction.status === "SUCCESS") {
      return NextResponse.json({ 
        status: "completed", 
        receiptNumber: transaction.receiptNumber 
      })
    }
    if (transaction.status === "FAILED" || transaction.status === "CANCELLED" || transaction.status === "EXPIRED") {
      return NextResponse.json({ 
        status: "failed", 
        error: transaction.resultDescription || "Transaction failed" 
      })
    }

    // If still pending/processing and has a provider transaction ID, query PalPluss directly
    if (transaction.transactionId && (transaction.status === "PENDING" || transaction.status === "PROCESSING")) {
      try {
        console.log(`[Query Status API] Polling PalPluss API directly for transaction: ${transaction.transactionId}`)
        const apiStatus = await queryTransaction(transaction.transactionId)
        
        if (apiStatus.success && apiStatus.status !== "PENDING" && apiStatus.status !== "PROCESSING") {
          // Re-fetch in case a webhook completed it in the background while we queried
          const latestTx = await db.collection<Transaction>("transactions").findOne({ _id: transaction._id })
          if (latestTx && (latestTx.status === "SUCCESS" || latestTx.status === "FAILED")) {
            return NextResponse.json({ 
              status: latestTx.status === "SUCCESS" ? "completed" : "failed", 
              receiptNumber: latestTx.receiptNumber 
            })
          }

          const isFinalSuccess = apiStatus.status === "SUCCESS"
          const receiptNumber = apiStatus.receiptNumber || "QUERY_" + transaction.reference
          
          if (isFinalSuccess) {
            // Atomically update Transaction status from pending/processing to SUCCESS
            const updateResult = await db.collection<Transaction>("transactions").updateOne(
              { 
                _id: transaction._id, 
                status: { $in: ["PENDING", "PROCESSING"] } 
              },
              {
                $set: {
                  status: "SUCCESS",
                  receiptNumber,
                  resultCode: apiStatus.resultCode,
                  resultDescription: apiStatus.resultDescription,
                  processedAt: new Date(),
                  updatedAt: new Date(),
                },
              }
            )

            // If modifiedCount is 0, it means it was already processed by another concurrent process
            if (updateResult.modifiedCount > 0) {
              // Update Target
              if (transaction.type === "deposit") {
                const userData = await db.collection("users").findOne({ _id: transaction.userId })
                if (userData) {
                  const balanceBefore = userData.balance || 0
                  const balanceAfter = balanceBefore + transaction.amount

                  await db.collection("users").updateOne(
                    { _id: transaction.userId },
                    { $inc: { balance: transaction.amount } }
                  )

                  // Ledger
                  const ledger: WalletLedger = {
                    _id: new ObjectId(),
                    userId: transaction.userId,
                    amount: transaction.amount,
                    type: "deposit",
                    reference: transaction.reference,
                    transactionId: transaction._id,
                    balanceBefore,
                    balanceAfter,
                    createdAt: new Date(),
                  }
                  await db.collection("wallet_ledgers").insertOne(ledger)

                  // Topup Status
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
                    message: `Your deposit of KES ${transaction.amount.toLocaleString()} was successful.`,
                    type: "success",
                    read: false,
                    createdAt: new Date(),
                  })

                  // Email
                  sendDepositSuccessfulEmail(userData.email, userData.name || userData.email, transaction.amount, transaction.reference, receiptNumber).catch((e) =>
                    console.error("Failed to send query success email:", e)
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
              console.log(`[Query Status API] Transaction ${transaction.reference} already finalized by another thread. Skipping fulfillment.`)
            }

            return NextResponse.json({ status: "completed", receiptNumber })
          } else {
            // Transaction failed on PalPluss side. Atomically update Transaction status from pending/processing to FAILED
            const updateResult = await db.collection<Transaction>("transactions").updateOne(
              { 
                _id: transaction._id, 
                status: { $in: ["PENDING", "PROCESSING"] } 
              },
              {
                $set: {
                  status: "FAILED",
                  resultCode: apiStatus.resultCode,
                  resultDescription: apiStatus.resultDescription,
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
                    failureReason: apiStatus.resultDescription,
                  },
                }
              )

              if (transaction.type === "deposit") {
                const userData = await db.collection("users").findOne({ _id: transaction.userId })
                if (userData) {
                  sendDepositFailedEmail(userData.email, userData.name || userData.email, transaction.amount, transaction.reference, apiStatus.resultDescription).catch((e) =>
                    console.error("Failed to send query failed email:", e)
                  )
                }

                await db.collection("notifications").insertOne({
                  _id: new ObjectId(),
                  userId: transaction.userId,
                  title: "Deposit Failed",
                  message: `Your deposit of KES ${transaction.amount.toLocaleString()} failed: ${apiStatus.resultDescription}.`,
                  type: "error",
                  read: false,
                  createdAt: new Date(),
                })
              }
            } else {
              console.log(`[Query Status API] Transaction ${transaction.reference} already finalized by another thread. Skipping failure processing.`)
            }

            return NextResponse.json({ status: "failed", error: apiStatus.resultDescription })
          }
        }
      } catch (pollError) {
        console.error("[Query Status API] Direct status poll error:", pollError)
      }
    }

    // Default return pending if still not finalized
    return NextResponse.json({ status: "pending" })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden" || error.message.includes("vercel resources exceeded")) {
      return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 403 })
    }
    console.error("PalPluss query-status route error:", error)
    return NextResponse.json({ error: "Failed to query transaction status" }, { status: 500 })
  }
}
