import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await request.json().catch(() => ({ id: null }))

    const db = await getDb()

    if (id) {
      // Mark specific notification as read
      await db.collection("notifications").updateOne(
        { _id: new ObjectId(id), userId: session.user._id },
        { $set: { read: true } }
      )
    } else {
      // Mark all notifications as read for this user
      await db.collection("notifications").updateMany(
        { userId: session.user._id, read: false },
        { $set: { read: true } }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Notifications marked as read",
    })
  } catch (error) {
    console.error("Mark notifications read error:", error)
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 })
  }
}
