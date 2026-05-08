import { NextResponse } from "next/server"
import { checkSubscription } from "@/lib/subscription"

export async function GET() {
  try {
    const isActive = await checkSubscription()
    return NextResponse.json({ isExpired: !isActive })
  } catch (error) {
    return NextResponse.json({ isExpired: false })
  }
}
