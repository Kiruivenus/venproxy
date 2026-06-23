import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { requireAuth } from "@/lib/auth"
import { ObjectId } from "mongodb"
import type { TopUp } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { restrictActionsIfExpired } = await import("@/lib/subscription")
    const restricted = await restrictActionsIfExpired(user.role)
    if (restricted) return NextResponse.json({ error: restricted }, { status: 403 })
    const { amount, phoneNumber } = await request.json()

    if (!amount || !phoneNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (amount < 1) {
      return NextResponse.json({ error: "Minimum top-up amount is KES 1" }, { status: 400 })
    }

    const db = await getDb()

    const topUp: TopUp = {
      _id: new ObjectId(),
      userId: user._id,
      amount,
      phoneNumber,
      status: "pending",
      createdAt: new Date(),
    }

    await db.collection<TopUp>("topups").insertOne(topUp)

    return NextResponse.json({
      success: true,
      topUp: {
        id: topUp._id.toString(),
        amount: topUp.amount,
      },
    })
  } catch (error: any) {
    if (error.message.includes("vercel resources exceeded")) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    console.error("Create top-up error:", error)
    return NextResponse.json({ error: "Failed to create top-up" }, { status: 500 })
  }
}
