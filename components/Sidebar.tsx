"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useBranding } from "@/lib/use-branding"
import {
  LayoutDashboard,
  Globe,
  Mail,
  CreditCard,
  Settings,
  Shield,
  History,
  LogOut,
  CloudLightning,
  BookOpen,
  LifeBuoy,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface SidebarProps {
  user: { email: string; name: string; role: string }
  onCloseMobile?: () => void
}

export function Sidebar({ user, onCloseMobile }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [balance, setBalance] = useState<number>(0)
  const branding = useBranding()

  useEffect(() => {
    fetch("/api/user/balance")
      .then((res) => res.json())
      .then((data) => {
        if (data.balance !== undefined) {
          setBalance(data.balance)
        }
      })
      .catch(() => {})
  }, [])

  const getInitials = (name: string) => {
    if (!name) return "U"
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
    router.refresh()
  }

  const categories = [
    {
      title: "WORKSPACE",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      title: "ACCOUNT",
      items: [
        { label: "Buy Proxies", href: "/buy", icon: Globe },
        { label: "Buy Emails", href: "/buy-emails", icon: Mail },
        { label: "Order History", href: "/dashboard/orders", icon: History },
        { label: "Billing & Top Up", href: "/topup", icon: CreditCard },
        { label: "Settings", href: "/dashboard/settings", icon: Settings },
      ],
    },
  ]

  const isAdmin = user.role === "admin" || user.role === "superadmin"
  if (isAdmin) {
    categories.push({
      title: "ADMIN",
      items: [
        { label: "Admin Panel", href: "/admin", icon: Shield },
      ],
    })
  }

  categories.push({
    title: "HELP & RESOURCES",
    items: [
      { label: "Documentation", href: "/docs", icon: BookOpen },
      { label: "Support", href: "/support", icon: LifeBuoy },
    ],
  })

  return (
    <div className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground z-40">
      {/* Brand/Logo Section */}
      <div className="p-6 pb-2">
        <Link href="/" className="flex items-center gap-2.5 px-1">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0 overflow-hidden ${branding.companyLogoUrl ? "bg-transparent" : "bg-blue-600 text-white shadow-sm"}`}>
            {branding.companyLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={branding.companyLogoUrl}
                alt={branding.companyName}
                className="h-full w-full object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
              />
            ) : (
              <CloudLightning className="h-5 w-5 stroke-[2]" />
            )}
          </div>
          <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white font-sans truncate">
            {branding.companyName}
          </span>
        </Link>
      </div>

      {/* Link Groups - Scrollable Section */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {categories.map((cat, catIdx) => (
          <div key={catIdx} className="space-y-2">
            <h4 className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-zinc-500 uppercase px-2">
              {cat.title}
            </h4>
            <nav className="space-y-0.5">
              {cat.items.map((item, itemIdx) => {
                const isActive =
                  pathname === item.href ||
                  (item.href === "/docs" &&
                    (pathname.startsWith("/docs") ||
                      pathname.startsWith("/guides")))
                return (
                  <Link
                    key={itemIdx}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                        : "text-slate-650 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-800/60"
                    }`}
                  >
                    <item.icon className={`h-4.5 w-4.5 ${isActive ? "text-blue-600 dark:text-blue-450" : "text-slate-400 dark:text-zinc-500"}`} strokeWidth={1.75} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Pin User Profile Card to Bottom */}
      <div className="p-6 pt-4 border-t border-slate-100 dark:border-zinc-800/80">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div suppressHydrationWarning className="flex items-center justify-between text-xs font-semibold bg-slate-50/50 dark:bg-zinc-950/30 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/45 transition-all cursor-pointer">
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar className="h-7 w-7 bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] rounded-full">
                  <AvatarFallback className="bg-blue-600 text-white font-extrabold">{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="truncate">
                  <p className="font-bold text-slate-800 dark:text-zinc-200 truncate leading-tight">{user.name}</p>
                  <p className="text-[9px] text-slate-400 truncate leading-none mt-0.5">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100/50 dark:border-emerald-900/30 px-2 py-0.5 rounded-full text-[10px] text-emerald-700 dark:text-emerald-450 font-bold flex-shrink-0">
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-600 text-white font-black text-[8px]">M</span>
                <span>KES {balance}</span>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 mt-[-10px] ml-2">
            <div className="px-3 py-2 border-b border-border/40">
              <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
            <DropdownMenuItem asChild>
              <Link href="/dashboard">My Proxies</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/orders">Order History</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/topup">Top Up Balance</Link>
            </DropdownMenuItem>
            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Admin Panel
                  </Link>
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/5">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
