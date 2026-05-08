import { cookies } from "next/headers"
import { getDb } from "./mongodb"
import bcrypt from "bcryptjs"
import { ObjectId } from "mongodb"
import { checkSubscription, SUBSCRIPTION_ERROR } from "./subscription"

export interface User {
  _id: ObjectId
  email: string
  password: string
  name: string
  role: "user" | "admin" | "superadmin"
  balance: number
  isBanned: boolean
  createdAt: Date
}

export interface Session {
  _id: ObjectId
  userId: ObjectId
  token: string
  expiresAt: Date
  createdAt: Date
}

function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let token = ""
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createSession(userId: ObjectId): Promise<string> {
  const db = await getDb()
  const token = generateToken()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  await db.collection<Session>("sessions").insertOne({
    _id: new ObjectId(),
    userId,
    token,
    expiresAt,
    createdAt: new Date(),
  })

  const cookieStore = await cookies()
  cookieStore.set("session_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  })

  return token
}

export async function getSession(): Promise<{ user: User; session: Session } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value

  if (!token) return null

  const db = await getDb()
  const session = await db.collection<Session>("sessions").findOne({
    token,
    expiresAt: { $gt: new Date() },
  })

  if (!session) return null

  const user = await db.collection<User>("users").findOne({ _id: session.userId })
  if (!user) return null

  return { user, session }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value

  if (token) {
    const db = await getDb()
    await db.collection("sessions").deleteOne({ token })
  }

  cookieStore.delete("session_token")
}



export async function requireAuth(): Promise<User> {
  const session = await getSession()
  if (!session) {
    throw new Error("Unauthorized")
  }

  // Subscription check (Superadmin and Admin are exempt from the total lockout)
  if (session.user.role !== "superadmin" && session.user.role !== "admin") {
    const isActive = await checkSubscription()
    if (!isActive) {
      throw new Error(SUBSCRIPTION_ERROR)
    }
  }

  return session.user
}

export async function requireAdmin(): Promise<User> {
  const user = await requireAuth()
  if (user.role !== "admin" && user.role !== "superadmin") {
    throw new Error("Forbidden")
  }
  return user
}

export async function requireSuperAdmin(): Promise<User> {
  const user = await requireAuth()
  if (user.role !== "superadmin") {
    throw new Error("Forbidden")
  }
  return user
}
