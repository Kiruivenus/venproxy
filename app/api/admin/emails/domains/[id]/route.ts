import { getDb } from "@/lib/mongodb"
import { requireAdmin } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await requireAdmin()
    const { restrictActionsIfExpired } = await import("@/lib/subscription")
    const restricted = await restrictActionsIfExpired(user.role)
    if (restricted) return NextResponse.json({ error: restricted }, { status: 403 })

    const { domain, type, server } = await request.json()

    if (!domain || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDb()
    await db.collection("emailDomains").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          domain,
          type,
          server: type === "rayproxy" ? server : null,
        },
      }
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message.includes("vercel resources exceeded") || error.message === "Forbidden" || error.message === "Unauthorized") {
      return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 403 })
    }
    console.error("[v0] Error updating email domain:", error)
    return NextResponse.json({ error: "Failed to update email domain" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await requireAdmin()
    const { restrictActionsIfExpired } = await import("@/lib/subscription")
    const restricted = await restrictActionsIfExpired(user.role)
    if (restricted) return NextResponse.json({ error: restricted }, { status: 403 })

    const db = await getDb()
    const result = await db.collection("emailDomains").deleteOne({
      _id: new ObjectId(id),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message.includes("vercel resources exceeded") || error.message === "Forbidden" || error.message === "Unauthorized") {
      return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 403 })
    }
    console.error("[v0] Error deleting email domain:", error)
    return NextResponse.json({ error: "Failed to delete email domain" }, { status: 500 })
  }
}
