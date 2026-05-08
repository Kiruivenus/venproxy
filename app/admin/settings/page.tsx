import { requireSuperAdmin } from "@/lib/auth"
import { Header } from "@/components/header"
import { SettingsForm } from "@/components/superadmin/settings-form"
import { ShieldAlert } from "lucide-react"

export default async function SettingsPage() {
  const user = await requireSuperAdmin()

  return (
    <div className="min-h-screen bg-background">
      <Header user={{ email: user.email, name: user.name, role: user.role }} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <ShieldAlert className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">SuperAdmin Settings</h1>
            <p className="text-muted-foreground mt-1">Configure platform-wide subscription and limits</p>
          </div>
        </div>

        <SettingsForm />
      </main>
    </div>
  )
}
