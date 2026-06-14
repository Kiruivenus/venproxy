import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { hashPassword, createSession, type User } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const { email, password, confirmPassword, name } = await request.json()

    // Subscription check
    const { checkSubscription, SUBSCRIPTION_ERROR } = await import("@/lib/subscription")
    const isActive = await checkSubscription()
    if (!isActive) {
      return NextResponse.json({ error: SUBSCRIPTION_ERROR }, { status: 403 })
    }

    // Platform settings: check if registration is disabled
    const { getPlatformSettings } = await import("@/app/admin/platform-actions")
    const platformSettings = await getPlatformSettings()
    if (platformSettings.disableUserRegistration) {
      return NextResponse.json({ error: "Registration is currently closed." }, { status: 403 })
    }

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match." }, { status: 400 })
    }

    const db = await getDb()

    const existingUser = await db.collection<User>("users").findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    const user: User = {
      _id: new ObjectId(),
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: "user",
      balance: 0,
      isBanned: false,
      createdAt: new Date(),
    }

    await db.collection<User>("users").insertOne(user)
    await createSession(user._id)

    return NextResponse.json({ success: true, user: { email: user.email, name: user.name, role: user.role } })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
