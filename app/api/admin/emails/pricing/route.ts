import { getDb } from "@/lib/mongodb"
import { requireAdmin } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    await requireAdmin()

    const db = await getDb()
    const pricing = await db
      .collection("emailPricing")
      .aggregate([
        {
          $lookup: {
            from: "emailDomains",
            localField: "domainId",
            foreignField: "_id",
            as: "domainData",
          },
        },
        { $unwind: "$domainData" },
      ])
      .toArray()

    return NextResponse.json({
      pricing: pricing.map((p) => ({
        id: p._id.toString(),
        domainId: p.domainId.toString(),
        domain: p.domainData.domain,
        pricePerEmail: p.pricePerEmail,
        isEnabled: p.isEnabled,
      })),
    })
  } catch (error: any) {
    if (error.message.includes("vercel resources exceeded") || error.message === "Forbidden" || error.message === "Unauthorized") {
      return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 403 })
    }
    console.error("[v0] Error fetching email pricing:", error)
    return NextResponse.json({ error: "Failed to fetch email pricing" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin()
    const { restrictActionsIfExpired } = await import("@/lib/subscription")
    const restricted = await restrictActionsIfExpired(user.role)
    if (restricted) return NextResponse.json({ error: restricted }, { status: 403 })

    const { domainId, pricePerEmail } = await request.json()

    if (!domainId || !pricePerEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDb()

    // Check if pricing already exists for this domain
    const existing = await db.collection("emailPricing").findOne({
      domainId: new ObjectId(domainId),
    })

    if (existing) {
      return NextResponse.json(
        { error: "Pricing already exists for this domain" },
        { status: 400 }
      )
    }

    const result = await db.collection("emailPricing").insertOne({
      domainId: new ObjectId(domainId),
      pricePerEmail,
      isEnabled: true,
      createdAt: new Date(),
    })

    return NextResponse.json({ id: result.insertedId.toString() }, { status: 201 })
  } catch (error: any) {
    if (error.message.includes("vercel resources exceeded") || error.message === "Forbidden" || error.message === "Unauthorized") {
      return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 403 })
    }
    console.error("[v0] Error creating email pricing:", error)
    return NextResponse.json({ error: "Failed to create email pricing" }, { status: 500 })
  }
}
