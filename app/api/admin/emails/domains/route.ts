import { getDb } from "@/lib/mongodb"
import { requireAdmin } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    await requireAdmin()

    const db = await getDb()
    const domains = await db.collection("emailDomains").find({}).toArray()

    return NextResponse.json({
      domains: domains.map((d) => ({
        _id: d._id.toString(),
        domain: d.domain,
        type: d.type,
        server: d.server,
      })),
    })
  } catch (error: any) {
    if (error.message.includes("vercel resources exceeded") || error.message === "Forbidden" || error.message === "Unauthorized") {
      return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 403 })
    }
    console.error("[v0] Error fetching email domains:", error)
    return NextResponse.json({ error: "Failed to fetch email domains" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin()
    const { restrictActionsIfExpired } = await import("@/lib/subscription")
    const restricted = await restrictActionsIfExpired(user.role)
    if (restricted) return NextResponse.json({ error: restricted }, { status: 403 })

    const { domain, type, server } = await request.json()

    if (!domain || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDb()
    const result = await db.collection("emailDomains").insertOne({
      domain,
      type,
      server: type === "rayproxy" ? server : null,
      isEnabled: true,
      createdAt: new Date(),
    })

    return NextResponse.json({ id: result.insertedId.toString() }, { status: 201 })
  } catch (error: any) {
    if (error.message.includes("vercel resources exceeded") || error.message === "Forbidden" || error.message === "Unauthorized") {
      return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 403 })
    }
    console.error("[v0] Error creating email domain:", error)
    return NextResponse.json({ error: "Failed to create email domain" }, { status: 500 })
  }
}
