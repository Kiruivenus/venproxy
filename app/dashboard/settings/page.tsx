import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardLayoutClient } from "@/components/dashboard-layout-client"
import { SettingsProfileForm } from "@/components/settings-profile-form"
import { SettingsPasswordForm } from "@/components/settings-password-form"

export const metadata = {
  title: "Settings - RayProxy Hub",
  description: "Manage your personal information and security preferences.",
}

export default async function SettingsPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const user = {
    email: session.user.email,
    name: session.user.name || "",
    role: session.user.role,
  }

  return (
    <DashboardLayoutClient user={user}>
      <div className="max-w-4xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="font-sans font-extrabold text-3xl md:text-4xl text-slate-900 dark:text-white tracking-tight">
            Account Settings
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 text-base mt-2">
            Manage your personal information and security preferences.
          </p>
        </div>

        <div className="space-y-6">
          <SettingsProfileForm user={{ email: user.email, name: user.name }} />
          <SettingsPasswordForm />
        </div>
      </div>
    </DashboardLayoutClient>
  )
}
