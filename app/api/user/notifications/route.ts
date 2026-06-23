import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()

    const notifications = await db
      .collection("notifications")
      .find({ userId: session.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray()

    const formattedNotifications = notifications.map((n) => ({
      id: n._id.toString(),
      title: n.title,
      message: n.message,
      type: n.type || "info",
      read: n.read ?? false,
      createdAt: n.createdAt,
    }))

    return NextResponse.json({
      success: true,
      notifications: formattedNotifications,
    })
  } catch (error) {
    console.error("Notifications fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
