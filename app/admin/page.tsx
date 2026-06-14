import { requireAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { getPlatformSettings } from "@/app/admin/platform-actions"
import Link from "next/link"
import { LayoutDashboard } from "lucide-react"

export default async function AdminPage() {
  try {
    const user = await requireAdmin()
    const platformSettings = await getPlatformSettings()

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Header user={{ email: user.email, name: user.name, role: user.role }} />

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-sans font-extrabold text-3xl text-slate-900 dark:text-white tracking-tight">
                Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                Manage proxies, pricing, users, and platform settings.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 px-4 py-2 rounded-lg text-sm font-semibold transition-colors w-fit"
            >
              <LayoutDashboard className="h-4 w-4" />
              Return to User Dashboard
            </Link>
          </div>

          <AdminDashboard platformSettings={platformSettings} />
        </main>
      </div>
    )
  } catch {
    redirect("/login")
  }
}
