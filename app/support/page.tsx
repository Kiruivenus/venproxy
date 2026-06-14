import type { Metadata } from "next"
import { SupportContent } from "./support-content"
import { getSession } from "@/lib/auth"
import { DashboardLayoutClient } from "@/components/dashboard-layout-client"
import { PublicNavBar } from "@/components/public-navbar"

export const metadata: Metadata = {
  title: "Support - RayProxy Hub",
  description: "Get support from our team via WhatsApp and Telegram",
}

export default async function SupportPage() {
  const session = await getSession()
  const user = session?.user ? { email: session.user.email, name: session.user.name, role: session.user.role } : null
  
  if (user) {
    return (
      <DashboardLayoutClient user={user}>
        <SupportContent user={user} isEmbedded={true} />
      </DashboardLayoutClient>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNavBar mode="landing" />
      <div className="flex-1 pt-24 pb-16">
        <SupportContent user={user} isEmbedded={false} />
      </div>
    </div>
  )
}
