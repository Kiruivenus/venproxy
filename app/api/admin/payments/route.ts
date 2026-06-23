import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
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

    return NextResponse.json({
      success: true,
      transactions: formattedTransactions,
      webhookLogs: formattedWebhookLogs,
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
