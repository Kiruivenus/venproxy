import { getSession } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"
import { DashboardLayoutClient } from "@/components/dashboard-layout-client"
import { ProxyPurchaseForm } from "@/components/proxy-purchase-form"
import { ServicePaused } from "@/components/service-paused"
import { getPlatformSettings } from "@/app/admin/platform-actions"
import type { Pricing } from "@/lib/types"
import { redirect } from "next/navigation"
import { Globe } from "lucide-react"

export default async function BuyPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const [platformSettings, db] = await Promise.all([
    getPlatformSettings(),
    getDb(),
  ])

  // Maintenance mode redirect for non-admins
  if (
    platformSettings.maintenanceMode &&
    session.user.role !== "admin" &&
    session.user.role !== "superadmin"
  ) {
    redirect("/maintenance")
  }

  const pricing = await db.collection<Pricing>("pricing").find({ isEnabled: true }).toArray()

  const pricingData = pricing.map((p) => ({
    country: p.country,
    countryCode: p.countryCode,
    daily: p.daily,
  }))

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
            <Globe className="h-3.5 w-3.5" strokeWidth={2} />
            <span>Premium Proxies</span>
          </div>
          <h1 className="font-sans font-extrabold text-3xl md:text-4xl text-slate-900 dark:text-white tracking-tight text-center">
            Buy Proxies
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 text-base max-w-lg text-center">
            Select your preferred country and purchase highly reliable residential and datacenter proxies.
          </p>
        </div>

        <div>
          {platformSettings.disableProxyPurchase ? (
            <ServicePaused serviceName="Proxy Purchase" />
          ) : (
            <ProxyPurchaseForm pricing={pricingData} userId={session.user._id.toString()} />
          )}
        </div>
      </div>
    </DashboardLayoutClient>
  )
}
