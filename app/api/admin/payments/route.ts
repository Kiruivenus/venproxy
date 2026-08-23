import { type NextRequest, NextResponse } from "next/server"
import { getDb, generateUnique4DigitCode } from "@/lib/mongodb"
import { requireAdmin } from "@/lib/auth"
import type { Transaction } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(request.url)
    
    const db = await getDb()

    // Retrieve all transactions, sorted newest first
    const transactions = await db
      .collection<Transaction>("transactions")
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    // Retrieve all webhook logs
    const webhookLogs = await db
      .collection("webhook_logs")
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray()

    // Calculate metrics
    const successfulTransactions = transactions.filter((t) => t.status === "SUCCESS")
    const deposits = successfulTransactions.filter((t) => t.type === "deposit")
    
    const totalDeposits = deposits.reduce((acc, t) => acc + t.amount, 0)
    
    // Today's deposits
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    const todayDeposits = deposits
      .filter((t) => new Date(t.createdAt) >= startOfToday)
      .reduce((acc, t) => acc + t.amount, 0)

    const pendingPaymentsCount = transactions.filter(
      (t) => t.status === "PENDING" || t.status === "PROCESSING"
    ).length
    
    const successfulPaymentsCount = successfulTransactions.length
    
    const failedPaymentsCount = transactions.filter(
      (t) => t.status === "FAILED" || t.status === "CANCELLED" || t.status === "EXPIRED"
    ).length

    const revenueGenerated = successfulTransactions.reduce((acc, t) => acc + t.amount, 0)

    // Format transactions for admin presentation
    const formattedTransactions = transactions.map((t) => ({
      id: t._id.toString(),
      userId: t.userId.toString(),
      reference: t.reference,
      phone: t.phone,
      amount: t.amount,
      currency: t.currency,
      provider: t.provider,
      status: t.status,
      paymentMethod: t.paymentMethod,
      receiptNumber: t.receiptNumber || "",
      resultCode: t.resultCode || "",
      resultDescription: t.resultDescription || "",
      type: t.type,
      targetId: t.targetId?.toString() || "",
      createdAt: t.createdAt,
      processedAt: t.processedAt || null,
    }))

    const formattedWebhookLogs = webhookLogs.map((l) => ({
      id: l._id.toString(),
      reference: l.reference || "",
      transactionId: l.transactionId || "",
      status: l.status,
      error: l.error || "",
      payload: l.payload,
      createdAt: l.createdAt,
    }))

    // Retrieve all proxy purchases sorted by purchasedAt newest first
    const purchases = await db
      .collection("purchases")
      .find({})
      .sort({ purchasedAt: -1 })
      .toArray()

    // Walk through and run on-the-fly migration for any purchases missing uniqueCode
    for (const p of purchases) {
      if (!p.uniqueCode) {
        try {
          const code = await generateUnique4DigitCode(db)
          await db.collection("purchases").updateOne({ _id: p._id }, { $set: { uniqueCode: code } })
          p.uniqueCode = code // Update in-memory reference as well
        } catch (err) {
          console.error("Migration uniqueCode generation failed for purchase:", p._id, err)
        }
      }
    }

    // Resolve user emails and order phone numbers in bulk
    const userIds = purchases.map((p) => p.userId)
    const orderIds = purchases.map((p) => p.orderId)

    const users = await db
      .collection("users")
      .find({ _id: { $in: userIds } })
      .toArray()
    const userMap = new Map(users.map((u: any) => [u._id.toString(), u.email]))

    const orders = await db
      .collection("orders")
      .find({ _id: { $in: orderIds } })
      .toArray()
    const orderPhoneMap = new Map(orders.map((o: any) => [o._id.toString(), o.phoneNumber || "Balance Payment"]))

    const formattedPurchases = purchases.map((p: any) => ({
      id: p._id.toString(),
      userId: p.userId.toString(),
      userEmail: userMap.get(p.userId.toString()) || "Unknown User",
      orderId: p.orderId.toString(),
      phoneNumber: orderPhoneMap.get(p.orderId.toString()) || "Balance Payment",
      proxyString: p.proxy.username && p.proxy.password 
        ? `${p.proxy.username}:${p.proxy.password}@${p.proxy.ip}:${p.proxy.port}`
        : `${p.proxy.ip}:${p.proxy.port}`,
      country: p.proxy.country,
      countryCode: p.proxy.countryCode,
      purchasedAt: p.purchasedAt,
      expiresAt: p.expiresAt,
      uniqueCode: p.uniqueCode || "N/A"
    }))

    return NextResponse.json({
      success: true,
      transactions: formattedTransactions,
      webhookLogs: formattedWebhookLogs,
      purchases: formattedPurchases,
      stats: {
        totalDeposits,
        todayDeposits,
        pendingPaymentsCount,
        successfulPaymentsCount,
        failedPaymentsCount,
        revenueGenerated,
      },
    })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden" || error.message.includes("vercel resources exceeded")) {
      return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 403 })
    }
    console.error("Admin payments fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch admin payments" }, { status: 500 })
  }
}
