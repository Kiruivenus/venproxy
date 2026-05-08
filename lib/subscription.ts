import { getDb } from "./mongodb"
import { WebsiteSettings } from "./types"

export async function checkSubscription(): Promise<boolean> {
  try {
    const db = await getDb()
    const settings = await db.collection<WebsiteSettings>("website_settings").findOne({})
    
    if (!settings) {
      return true // Default to true if settings don't exist yet
    }

    const now = new Date()
    const expiresAt = new Date(settings.subscriptionExpiresAt)

    // Check if it should be expired
    if (settings.subscriptionActive && now > expiresAt) {
      await db.collection("website_settings").updateOne(
        { _id: settings._id },
        { $set: { subscriptionActive: false, updatedAt: new Date() } }
      )
      return false
    }

    return settings.subscriptionActive
  } catch (error) {
    console.error("Error checking subscription:", error)
    return true // Default to true on error to avoid blocking site
  }
}

export const SUBSCRIPTION_ERROR = "internal error : vercel resources exceeded"

export async function restrictActionsIfExpired(userRole: string) {
  if (userRole === "superadmin") return null
  
  const isActive = await checkSubscription()
  if (!isActive) {
    return SUBSCRIPTION_ERROR
  }
  return null
}

export async function restrictIfExpired() {
  const isActive = await checkSubscription()
  if (!isActive) {
    return SUBSCRIPTION_ERROR
  }
  return null
}
