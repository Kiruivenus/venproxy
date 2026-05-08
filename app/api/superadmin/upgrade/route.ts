import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { requireSuperAdmin } from "@/lib/auth"
import type { WebsiteSettings } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    await requireSuperAdmin()
    const { cardDetails } = await request.json()
    
    // Sandbox validation
    const cleanCard = cardDetails.cardNumber.replace(/\s/g, "")
    if (cleanCard !== "4242424242424242") {
      return NextResponse.json({ error: "Invalid card. Use sandbox card 4242 4242 4242 4242 for testing." }, { status: 400 })
    }
    
    const db = await getDb()
    const settings = await db.collection<WebsiteSettings>("website_settings").findOne({})
    
    if (!settings) {
      return NextResponse.json({ error: "Settings not initialized" }, { status: 400 })
    }

    const duration = settings.subscriptionDuration || "1month"
    console.log(`Processing upgrade for duration: ${duration}`)
    
    let extensionMs = 0
    switch (duration) {
      case "1min": extensionMs = 60 * 1000; break
      case "1day": extensionMs = 24 * 60 * 60 * 1000; break
      case "1week": extensionMs = 7 * 24 * 60 * 60 * 1000; break
      case "2weeks": extensionMs = 14 * 24 * 60 * 60 * 1000; break
      case "1month": extensionMs = 30 * 24 * 60 * 60 * 1000; break
      default: extensionMs = 30 * 24 * 60 * 60 * 1000; break
    }

    const now = new Date()
    const currentExpiry = new Date(settings.subscriptionExpiresAt)
    
    // For 1min testing, we reset the expiry to now + 1min to allow testing the expiration flow.
    // For other durations, we extend the current expiry if it's still active.
    let baseDate = now
    if (duration !== "1min" && currentExpiry > now) {
      baseDate = currentExpiry
    }
    
    const newExpiry = new Date(baseDate.getTime() + extensionMs)

    await db.collection("website_settings").updateOne(
      { _id: settings._id },
      { 
        $set: { 
          subscriptionActive: true,
          subscriptionExpiresAt: newExpiry,
          lastPaymentAt: now,
          updatedAt: now
        } 
      }
    )

    return NextResponse.json({ 
      success: true, 
      message: "Upgrade successful! Subscription extended.",
      newExpiry 
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}
