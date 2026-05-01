import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { DashboardTabs } from "@/components/dashboard-tabs"
import { LayoutDashboard } from "lucide-react"

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-accent/30">
      <Header user={{ email: session.user.email, name: session.user.name, role: session.user.role }} />

      <main className="container mx-auto px-4 py-16 md:py-20 relative">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[0%] left-[10%] w-[30%] h-[30%] bg-accent/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[100px]" />
        </div>

        <div className="mx-auto max-w-5xl relative z-10">
          <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-4">
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-foreground">
              My Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              View and manage your active proxies and premium email accounts.
            </p>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            <DashboardTabs />
          </div>
        </div>
      </main>
    </div>
  )
}
