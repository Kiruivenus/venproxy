import { getDb } from "@/lib/mongodb"
import { hashPassword } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"

function generateResetCode(): string {
  return Math.random().toString().substring(2, 8)
}

import { sendEmail, getStyledEmailTemplate } from "@/lib/mail"

async function sendResetEmail(email: string, code: string): Promise<boolean> {
  let companyName = "RayProxy Hub"
  let companyLogoUrl = ""
  try {
    const db = await getDb()
    const settings = await db.collection("website_settings").findOne({})
    if (settings) {
      companyName = settings.companyName || "RayProxy Hub"
      companyLogoUrl = settings.companyLogoUrl || ""
    }
  } catch (e) {
    console.error("Failed to query settings for reset email:", e)
  }

  const content = `
    <h2>Password Reset Request</h2>
    <p>We received a request to reset your password for your ${companyName} account. Use the verification code below to proceed with the reset:</p>
    <div class="code-box">
      <div class="code">${code}</div>
    </div>
    <p>This code is valid for <strong>30 minutes</strong>. If you did not make this request, please ignore this email or contact support if you have concerns.</p>
  `
  const footerText = "Premium Proxies, Instant Access."
  const html = getStyledEmailTemplate("Password Reset", content, footerText, companyName, companyLogoUrl)

  return await sendEmail({
    to: email,
    subject: `${companyName} - Password Reset Code`,
    html,
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, code, password, action } = body

    if (!email || !action) {
      return NextResponse.json({ error: "Email and action are required" }, { status: 400 })
    }

    const lowercaseEmail = email.toLowerCase()

    const db = await getDb()
    const usersCollection = db.collection("users")

    // Step 1: Send reset code
    if (action === "send-code") {
      const user = await usersCollection.findOne({ email: lowercaseEmail })

      if (!user) {
        return NextResponse.json({ error: "User not found. Please check your email address." }, { status: 404 })
      }

      const resetCode = generateResetCode()
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            resetCode: resetCode,
            resetCodeExpires: expiresAt,
          },
        }
      )

      const emailSent = await sendResetEmail(lowercaseEmail, resetCode)

      if (!emailSent) {
        return NextResponse.json(
          { error: "Failed to send reset code. Please try again later." },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true }, { status: 200 })
    }

    // Step 2: Verify reset code
    if (action === "verify-code") {
      const user = await usersCollection.findOne({ email: lowercaseEmail })

      if (!user || !user.resetCode) {
        return NextResponse.json({ error: "Invalid reset code" }, { status: 400 })
      }

      if (user.resetCode !== code) {
        return NextResponse.json({ error: "Invalid reset code" }, { status: 400 })
      }

      if (new Date() > new Date(user.resetCodeExpires)) {
        return NextResponse.json({ error: "Reset code has expired" }, { status: 400 })
      }

      return NextResponse.json({ success: true }, { status: 200 })
    }

    // Step 3: Reset password
    if (action === "reset-password") {
      if (!password || password.length < 6 || !code) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 })
      }

      const user = await usersCollection.findOne({ email: lowercaseEmail })

      if (!user || user.resetCode !== code) {
        return NextResponse.json({ error: "Invalid reset request" }, { status: 400 })
      }

      if (new Date() > new Date(user.resetCodeExpires)) {
        return NextResponse.json({ error: "Reset code has expired" }, { status: 400 })
      }

      const hashedPassword = await hashPassword(password)

      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            password: hashedPassword,
            resetCode: null,
            resetCodeExpires: null,
          },
        }
      )

      return NextResponse.json({ success: true }, { status: 200 })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
