import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { requireSuperAdmin } from "@/lib/auth"
import { ObjectId } from "mongodb"
import type { WebsiteSettings } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin()
    const db = await getDb()
    
    let settings = await db.collection<WebsiteSettings>("website_settings").findOne({})
    
    if (!settings) {
      // Initialize default settings if not found
      const defaultSettings: any = {
        subscriptionActive: true,
        subscriptionDuration: "1month",
        subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
      const result = await db.collection("website_settings").insertOne(defaultSettings)
      settings = { ...defaultSettings, _id: result.insertedId }
    }

    // Check if subscription has expired
    const now = new Date()
    if (settings.subscriptionActive && now > new Date(settings.subscriptionExpiresAt)) {
      console.log(`Subscription expired for ${settings._id}. Disabling...`)
      await db.collection("website_settings").updateOne(
        { _id: settings._id },
        { $set: { subscriptionActive: false, updatedAt: new Date() } }
      )
      settings.subscriptionActive = false
    }

    return NextResponse.json(settings)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireSuperAdmin()
    const { subscriptionDuration } = await request.json()
    console.log(`Saving subscription duration: ${subscriptionDuration}`)
    const db = await getDb()

    const result = await db.collection("website_settings").updateOne(
      {},
      { 
        $set: { 
          subscriptionDuration,
          updatedAt: new Date() 
        } 
      },
      { upsert: true }
    )
    console.log(`Update result: ${JSON.stringify(result)}`)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}
