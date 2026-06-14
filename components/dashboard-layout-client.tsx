"use client"

import { useState } from "react"
import { Sidebar } from "@/components/Sidebar"
import { Header } from "@/components/header"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"

interface DashboardLayoutClientProps {
  user: { email: string; name: string; role: string }
  children: React.ReactNode
}

export function DashboardLayoutClient({ user, children }: DashboardLayoutClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex transition-colors duration-300">
      {/* Persistent desktop left sidebar */}
      <aside className="hidden md:block w-64 h-screen sticky top-0 flex-shrink-0 z-40">
        <Sidebar user={user} />
      </aside>

      {/* Main viewport area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <Header user={user} onOpenMobile={() => setMobileOpen(true)} />

        {/* Mobile menu drawer */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="p-0 w-64 h-full border-r border-slate-200">
            <SheetTitle className="sr-only">Navigation Sidebar</SheetTitle>
            <Sidebar user={user} onCloseMobile={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}
