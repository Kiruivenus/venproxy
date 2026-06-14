import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardLayoutClient } from "@/components/dashboard-layout-client"
import { TopUpForm } from "@/components/topup-form"
import { ServicePaused } from "@/components/service-paused"
import { getPlatformSettings } from "@/app/admin/platform-actions"
import { Wallet } from "lucide-react"

export const metadata = {
  title: "Top Up - RayProxy Hub",
  description: "Add funds to your account instantly via M-Pesa",
}

export default async function TopUpPage() {
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
      <div className="space-y-6 max-w-xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100/50 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/30 shadow-2xs">
            <Wallet className="h-3.5 w-3.5" strokeWidth={2} />
            <span>Account Balance</span>
          </div>
          <h1 className="font-sans font-extrabold text-3xl md:text-4xl text-slate-900 dark:text-white tracking-tight text-center">
            Top Up Balance
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 text-base max-w-lg text-center">
            Add funds to your account instantly via M-Pesa.
          </p>
        </div>

        <div>
          {platformSettings.disableMpesaDeposits ? (
            <ServicePaused serviceName="M-Pesa Deposits" />
          ) : (
            <TopUpForm currentBalance={session.user.balance || 0} />
          )}
        </div>
      </div>
    </DashboardLayoutClient>
  )
}
