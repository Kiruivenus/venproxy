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

    // Get current balance from users collection
    const user = await db.collection("users").findOne({ _id: session.user._id })
    const balance = user?.balance || 0

    // Retrieve user deposit transactions
    const depositTransactions = await db
      .collection<Transaction>("transactions")
      .find({ 
        userId: session.user._id,
        type: "deposit"
      })
      .toArray()

    const successfulDeposits = depositTransactions.filter(t => t.status === "SUCCESS")
    const totalDeposits = successfulDeposits.reduce((acc, t) => acc + t.amount, 0)
    const successfulDepositsCount = successfulDeposits.length
    
    // Retrieve pending transactions (all types)
    const pendingTransactionsCount = await db
      .collection<Transaction>("transactions")
      .countDocuments({
        userId: session.user._id,
        status: { $in: ["PENDING", "PROCESSING"] }
      })

    return NextResponse.json({
      success: true,
      balance,
      totalDeposits,
      successfulDepositsCount,
      pendingTransactionsCount,
    })
  } catch (error) {
    console.error("Wallet overview fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch wallet overview metrics" }, { status: 500 })
  }
}
