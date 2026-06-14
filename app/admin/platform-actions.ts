"use server"

import { requireAdmin } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"

export interface PlatformSettings {
  disableProxyPurchase: boolean
  disableMpesaDeposits: boolean
  disableEmailPurchase: boolean
  disableUserRegistration: boolean
  maintenanceMode: boolean
  companyName: string
  companyLogoUrl: string
}

const DEFAULT_SETTINGS: PlatformSettings = {
  disableProxyPurchase: false,
  disableMpesaDeposits: false,
  disableEmailPurchase: false,
  disableUserRegistration: false,
  maintenanceMode: false,
  companyName: "RayProxy Hub",
  companyLogoUrl: "",
}

export async function getPlatformSettings(): Promise<PlatformSettings> {
  try {
    const db = await getDb()
    const doc = await db.collection("website_settings").findOne({})
    if (!doc) return DEFAULT_SETTINGS
    return {
      disableProxyPurchase: doc.disableProxyPurchase ?? false,
      disableMpesaDeposits: doc.disableMpesaDeposits ?? false,
      disableEmailPurchase: doc.disableEmailPurchase ?? false,
      disableUserRegistration: doc.disableUserRegistration ?? false,
      maintenanceMode: doc.maintenanceMode ?? false,
      companyName: doc.companyName ?? "RayProxy Hub",
      companyLogoUrl: doc.companyLogoUrl ?? "",
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export async function updatePlatformSettings(data: Partial<PlatformSettings>) {
  try {
    await requireAdmin()
    const db = await getDb()
    await db.collection("website_settings").updateOne(
      {},
      { $set: data },
      { upsert: true }
    )
    return { success: true, message: "Settings saved successfully" }
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Forbidden") {
      return { success: false, error: "You are not authorized to change these settings." }
    }
    return { success: false, error: "Failed to save settings" }
  }
}
