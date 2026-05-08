import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { requireAdmin } from "@/lib/auth"

export async function GET() {
  try {
    await requireAdmin()

    const db = await getDb()
    let config = await db.collection("supportConfig").findOne({})

    if (!config) {
      config = {
        whatsappNumber: "",
        whatsappGroup: "",
        telegramAgent: "",
        telegramGroup: "",
      }
    }

    return NextResponse.json({ config })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden" || error.message.includes("vercel resources exceeded")) {
      return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 403 })
    }
    console.error("Failed to fetch support config:", error)
    return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin()
    const { restrictActionsIfExpired } = await import("@/lib/subscription")
    const restricted = await restrictActionsIfExpired(user.role)
    if (restricted) return NextResponse.json({ error: restricted }, { status: 403 })

    const body = await request.json()
    const db = await getDb()

    await db.collection("supportConfig").updateOne(
      {},
      {
        $set: {
          whatsappNumber: body.whatsappNumber || "",
          whatsappGroup: body.whatsappGroup || "",
          telegramAgent: body.telegramAgent || "",
          telegramGroup: body.telegramGroup || "",
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden" || error.message.includes("vercel resources exceeded")) {
      return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 403 })
    }
    console.error("Failed to update support config:", error)
    return NextResponse.json({ error: "Failed to update config" }, { status: 500 })
  }
}
