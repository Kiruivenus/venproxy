import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardLayoutClient } from "@/components/dashboard-layout-client"
import { OrderHistory } from "@/components/order-history"

export default async function OrdersPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const user = {
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
  }

  return (
    <DashboardLayoutClient user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
            Order History
          </h1>
          <p className="mt-1.5 text-xs md:text-sm text-slate-500 dark:text-zinc-400 font-medium">
            Manage and view all your past transactions and invoice details
          </p>
        </div>

        <OrderHistory />
      </div>
    </DashboardLayoutClient>
  )
}
