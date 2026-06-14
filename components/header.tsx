"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Sun, Moon, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface HeaderProps {
  user?: { email: string; name: string | null; role: string } | null
  onOpenMobile?: () => void
}

export function Header({ user, onOpenMobile }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [balance, setBalance] = useState<number>(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!user) return
    fetch("/api/user/balance")
      .then((res) => res.json())
      .then((data) => {
        if (data.balance !== undefined) {
          setBalance(data.balance)
        }
      })
      .catch(() => {})
  }, [user])

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U"
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <header className="h-16 bg-white/40 dark:bg-zinc-950/40 backdrop-blur border-b border-slate-100 dark:border-zinc-800/80 sticky top-0 z-30 flex items-center justify-between px-6 md:px-8">
      {/* Left Side: Breadcrumb & Mobile menu trigger */}
      <div className="flex items-center gap-3">
        {onOpenMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onOpenMobile} 
            className="md:hidden h-8 w-8 text-slate-500"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-zinc-400">
          <span>Workspace</span>
          <span className="text-slate-350 dark:text-zinc-600">/</span>
          <span className="text-slate-800 dark:text-zinc-200 font-extrabold">My Dashboard</span>
        </div>
      </div>

      {/* Right Side: Flex row utility pills */}
      <div className="flex items-center gap-3.5">
        {/* Dynamic M-Pesa balance pill — only shown when logged in */}
        {user && (
          <Link
            href="/topup"
            className="flex items-center gap-1.5 rounded-full border border-blue-100 dark:border-blue-900/35 px-3 py-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50/35 dark:bg-blue-950/15 hover:bg-blue-50/60 dark:hover:bg-blue-950/25 transition-colors"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white font-black text-[9px] leading-none">
              M
            </span>
            <span>KES {balance.toLocaleString()}</span>
          </Link>
        )}

        {/* Theme Toggle switch */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8.5 w-8.5 rounded-full border border-slate-100 dark:border-zinc-850 hover:bg-slate-50 dark:hover:bg-zinc-900 text-slate-500"
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

        {/* User profile pill — only shown when logged in */}
        {user && (
          <div className="flex items-center gap-2 rounded-full border border-slate-100 dark:border-zinc-850 bg-slate-50/50 dark:bg-zinc-900/40 px-3 py-1 text-slate-700 dark:text-zinc-300">
            <Avatar className="h-5 w-5 bg-blue-600 text-white flex items-center justify-center font-bold text-[9px] rounded-full">
              <AvatarFallback className="bg-blue-600 text-white font-extrabold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-bold hidden sm:inline-block leading-none">
              {(user.name || user.email).toLowerCase()}
            </span>
          </div>
        )}
      </div>
    </header>
  )
}
