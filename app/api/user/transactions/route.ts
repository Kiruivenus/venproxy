import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"
import type { Transaction } from "@/lib/types"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()

    const transactions = await db
      .collection<Transaction>("transactions")
      .find({ userId: session.user._id })
      .sort({ createdAt: -1 })
      .toArray()

    const formattedTransactions = transactions.map((t) => ({
      id: t._id.toString(),
      reference: t.reference,
      amount: t.amount,
      currency: t.currency,
      provider: t.provider,
      status: t.status,
      paymentMethod: t.paymentMethod,
      receiptNumber: t.receiptNumber || "",
      resultDescription: t.resultDescription || "",
      type: t.type,
      createdAt: t.createdAt,
      processedAt: t.processedAt || null,
    }))

    return NextResponse.json({
      success: true,
      transactions: formattedTransactions,
    })
  } catch (error) {
    console.error("Transactions fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}
