import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardLayoutClient } from "@/components/dashboard-layout-client"
import { DashboardTabs } from "@/components/dashboard-tabs"
import { getPlatformSettings } from "@/app/admin/platform-actions"

export default async function DashboardPage() {
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

  return (
    <DashboardLayoutClient user={{ email: session.user.email, name: session.user.name, role: session.user.role }}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-sans tracking-tight">
              My Dashboard
            </h1>
            <p className="text-slate-500 dark:text-zinc-400 mt-2 text-sm font-medium">
              View and manage your active proxies and premium email accounts.
            </p>
          </div>
        </div>

        <div className="mt-2">
          <DashboardTabs />
        </div>
      </div>
    </DashboardLayoutClient>
  )
}
