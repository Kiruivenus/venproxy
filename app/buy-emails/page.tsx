import { getSession } from "@/lib/auth"
import { DashboardLayoutClient } from "@/components/dashboard-layout-client"
import { EmailPurchaseForm } from "@/components/email-purchase-form"
import { ServicePaused } from "@/components/service-paused"
import { getPlatformSettings } from "@/app/admin/platform-actions"
import { redirect } from "next/navigation"
import { Mail } from "lucide-react"

export const metadata = {
  title: "Buy Emails - RayProxy Hub",
  description: "Purchase premium email accounts from RayProxy Hub",
}

export default async function BuyEmailsPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const platformSettings = await getPlatformSettings()

  // Maintenance mode redirect for non-admins
  if (
    platformSettings.maintenanceMode &&
    session.user.role !== "admin" &&
    session.user.role !== "superadmin"
  ) {
    redirect("/maintenance")
  }

  const user = {
    email: session.user.email,
    name: session.user.name || "",
    role: session.user.role,
  }

  return (
    <DashboardLayoutClient user={user}>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/80 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-100/50 dark:border-blue-900/30 shadow-2xs mb-4">
            <Mail className="h-3.5 w-3.5" strokeWidth={2} />
            <span>Premium Email Accounts</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2 font-sans tracking-tight">
            Buy Email Accounts
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium leading-relaxed">
            Select your preferred email domain and purchase premium, high-trust accounts for your business operations.
          </p>
        </div>

        <div>
          {platformSettings.disableEmailPurchase ? (
            <ServicePaused serviceName="Email Purchase" />
          ) : (
            <EmailPurchaseForm />
          )}
        </div>
      </div>
    </DashboardLayoutClient>
  )
}
