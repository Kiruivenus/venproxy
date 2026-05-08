import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const { restrictIfExpired } = await import("@/lib/subscription")
    const restricted = await restrictIfExpired()
    if (restricted) return NextResponse.json({ error: restricted }, { status: 403 })

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
        { $match: { "domainData.isEnabled": true, isEnabled: true } },
      ])
      .toArray()

    return NextResponse.json({
      pricing: pricing.map((p) => ({
        domainId: p.domainId.toString(),
        domain: p.domainData.domain,
        pricePerEmail: p.pricePerEmail,
      })),
    })
  } catch (error) {
    console.error("[v0] Error fetching email pricing:", error)
    return NextResponse.json({ error: "Failed to fetch email pricing" }, { status: 500 })
  }
}
