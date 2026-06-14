"use client"

import Link from "next/link"
import { CloudLightning } from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useBranding } from "@/lib/use-branding"

interface PublicNavBarProps {
  mode?: "landing" | "login" | "register"
}

export function PublicNavBar({ mode = "landing" }: PublicNavBarProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { companyName, companyLogoUrl } = useBranding()

  useEffect(() => setMounted(true), [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/80 backdrop-blur-md border-b border-border/70 flex items-center px-6 md:px-10">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl flex-shrink-0 overflow-hidden ${companyLogoUrl ? "bg-transparent" : "bg-blue-600 text-white shadow-sm"}`}>
          {companyLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={companyLogoUrl}
              alt={companyName}
              className="h-full w-full object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
            />
          ) : (
            <CloudLightning className="h-4.5 w-4.5 stroke-[2]" />
          )}
        </div>
        <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
          {companyName}
        </span>
      </Link>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-500" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        )}

        {mode === "landing" && (
          <>
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors px-3 py-1.5"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </>
        )}

        {mode === "login" && (
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 text-sm font-semibold border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 px-4 py-2 rounded-lg transition-colors"
          >
            Create Account
          </Link>
        )}

        {mode === "register" && (
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm font-semibold border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 px-4 py-2 rounded-lg transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  )
}
