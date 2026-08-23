"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import { Sun, Moon, Menu, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { NotificationsDropdown } from "@/components/notifications-dropdown"

interface HeaderProps {
  user?: { email: string; name: string | null; role: string } | null
  onOpenMobile?: () => void
}

export function Header({ user, onOpenMobile }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
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

  const getPageTitle = () => {
    if (!pathname) return "Dashboard"
    if (pathname === "/dashboard") return "My Dashboard"
    if (pathname === "/dashboard/orders") return "Order History"
    if (pathname === "/dashboard/settings") return "Account Settings"
    if (pathname === "/buy") return "Buy Proxies"
    if (pathname === "/buy-emails") return "Purchase Emails"
    if (pathname === "/topup") return "Wallet & Top Up"
    if (pathname === "/settings") return "Settings"
    if (pathname === "/support") return "Help & Support"
    if (pathname.startsWith("/docs")) return "Documentation"
    if (pathname.startsWith("/admin")) return "Admin Dashboard"
    
    const segments = pathname.split("/").filter(Boolean)
    if (segments.length === 0) return "Dashboard"
    const lastSegment = segments[segments.length - 1]
    return lastSegment
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <header className="h-16 bg-background/40 backdrop-blur border-b border-border sticky top-0 z-30 flex items-center justify-between px-6 md:px-8">
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
        <div className="text-sm font-extrabold text-slate-800 dark:text-zinc-200">
          {getPageTitle()}
        </div>
      </div>

      {/* Right Side: Flex row utility pills */}
      <div className="flex items-center gap-3.5">
        {/* Dynamic wallet balance pill — only shown when logged in */}
        {user && (
          <Link
            href="/topup"
            className="flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-[11px] font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-850 hover:border-slate-300 dark:hover:border-zinc-700 transition-all shadow-3xs"
          >
            <Wallet className="h-3.5 w-3.5 text-blue-600 dark:text-blue-450" />
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

        {/* Notifications Dropdown */}
        {user && <NotificationsDropdown />}

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
