"use server"

import { requireAuth, hashPassword, verifyPassword } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"
import { z } from "zod"

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
})

export async function updateProfile(data: { name: string }) {
  try {
    const user = await requireAuth()
    
    const validatedData = updateProfileSchema.parse(data)

    const db = await getDb()
    await db.collection("users").updateOne(
      { _id: user._id },
      { $set: { name: validatedData.name } }
    )

    return { success: true, message: "Profile updated successfully" }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: "Failed to update profile" }
  }
}

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export async function changePassword(data: z.infer<typeof changePasswordSchema>) {
  try {
    const user = await requireAuth()

    const validatedData = changePasswordSchema.parse(data)

    // Compare current password
    const isValid = await verifyPassword(validatedData.currentPassword, user.password)
    if (!isValid) {
      return { success: false, error: "Incorrect current password" }
    }

    // Hash new password
    const hashedPassword = await hashPassword(validatedData.newPassword)

    // Update in DB
    const db = await getDb()
    await db.collection("users").updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword } }
    )

    return { success: true, message: "Password updated successfully" }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: "Failed to change password" }
  }
}
