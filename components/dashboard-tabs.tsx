"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProxyCard } from "@/components/proxy-card"
import { Loader2, Package, Clock, Mail, Copy, Eye, EyeOff, AlertCircle, Globe } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Proxy {
  id: string
  ip: string
  port: number
  username?: string
  password?: string
  country: string
  countryCode: string
  expiresAt: string
  purchasedAt: string
  isExpired: boolean
}

interface PurchasedEmail {
  id: string
  emailAddress: string
  password: string
  domain: string
  server?: string
  purchasedAt: string
}

const ActiveProxyIllustration = () => (
  <div className="relative h-36 w-36 mb-6 flex items-center justify-center">
    <svg viewBox="0 0 100 100" className="h-full w-full text-blue-600 animate-pulse-slow" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Server Box 1 */}
      <rect x="15" y="12" width="70" height="20" rx="6" className="fill-blue-600/5 stroke-blue-600" strokeWidth="2" />
      <circle cx="28" cy="22" r="2.5" className="fill-emerald-500 animate-pulse" />
      <line x1="38" y1="22" x2="60" y2="22" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2" className="text-muted-foreground/30" />
      
      {/* Server Box 2 */}
      <rect x="15" y="40" width="70" height="20" rx="6" className="fill-blue-600/5 stroke-blue-600" strokeWidth="2" />
      <circle cx="28" cy="50" r="2.5" className="fill-emerald-500 animate-pulse" />
      <line x1="38" y1="50" x2="60" y2="50" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2" className="text-muted-foreground/30" />
      
      {/* Server Box 3 */}
      <rect x="15" y="68" width="70" height="20" rx="6" className="fill-blue-600/5 stroke-blue-600" strokeWidth="2" />
      <circle cx="28" cy="78" r="2.5" className="fill-emerald-500 animate-pulse" />
      <line x1="38" y1="78" x2="60" y2="78" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2" className="text-muted-foreground/30" />

      {/* Connection Linkages */}
      <path d="M85 22C90 22 90 50 85 50" stroke="currentColor" strokeWidth="1.5" className="text-blue-600/30" />
      <circle cx="85" cy="50" r="2" fill="currentColor" className="text-blue-600" />
    </svg>
  </div>
)

const ExpiredProxyIllustration = () => (
  <div className="relative h-36 w-36 mb-6 flex items-center justify-center opacity-65">
    <svg viewBox="0 0 100 100" className="h-full w-full text-zinc-400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="12" width="70" height="20" rx="6" className="fill-zinc-500/5 stroke-zinc-400" strokeWidth="2" />
      <circle cx="28" cy="22" r="2.5" className="fill-zinc-400" />
      
      <rect x="15" y="40" width="70" height="20" rx="6" className="fill-zinc-500/5 stroke-zinc-400" strokeWidth="2" />
      <circle cx="28" cy="50" r="2.5" className="fill-zinc-400" />

      <circle cx="50" cy="50" r="16" className="fill-background stroke-zinc-400" strokeWidth="2" />
      <path d="M50 40 V50 H58" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  </div>
)

const EmailIllustration = () => (
  <div className="relative h-36 w-36 mb-6 flex items-center justify-center">
    <svg viewBox="0 0 100 100" className="h-full w-full text-blue-600" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="25" width="70" height="50" rx="8" className="fill-blue-600/5 stroke-blue-600" strokeWidth="2.5" />
      <path d="M15 32L50 55L85 32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="78" cy="25" r="4.5" className="fill-blue-600 animate-pulse" />
    </svg>
  </div>
)

export function DashboardTabs() {
  const [activeProxies, setActiveProxies] = useState<Proxy[]>([])
  const [expiredProxies, setExpiredProxies] = useState<Proxy[]>([])
  const [purchasedEmails, setPurchasedEmails] = useState<PurchasedEmail[]>([])
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set())
  const [copiedItem, setCopiedItem] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("active")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const tab = params.get("tab")
      if (tab === "active" || tab === "expired" || tab === "emails") {
        setActiveTab(tab)
      }
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const [activeRes, expiredRes, emailsRes, balanceRes] = await Promise.all([
        fetch("/api/user/proxies?type=active"),
        fetch("/api/user/proxies?type=expired"),
        fetch("/api/user/emails"),
        fetch("/api/user/balance"),
      ])

      const activeData = await activeRes.json()
      const expiredData = await expiredRes.json()
      const emailsData = await emailsRes.json()
      const balanceData = await balanceRes.json()

      setActiveProxies(activeData.proxies || [])
      setExpiredProxies(expiredData.proxies || [])
      setPurchasedEmails(emailsData.emails || [])
      if (balanceData.balance !== undefined) {
        setBalance(balanceData.balance)
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 bg-white dark:bg-card border border-slate-100 dark:border-border rounded-2xl shadow-xs">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Metric Cards Section (Single Horizontal Card) */}
      <div className="bg-white dark:bg-card border border-slate-100 dark:border-border rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch justify-between gap-4 sm:gap-0">
        {/* Active Proxies */}
        <div className="flex-1 flex items-center gap-3 px-2 sm:px-4">
          <div className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-450 flex items-center justify-center">
            <Globe className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-wider leading-none">Active Proxies</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1 leading-tight">{activeProxies.length}</h3>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px bg-slate-150/80 dark:bg-zinc-800 my-1" />

        {/* Expired Proxies */}
        <div className="flex-1 flex items-center gap-3 px-2 sm:px-4">
          <div className="h-9 w-9 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-450 flex items-center justify-center">
            <Clock className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-wider leading-none">Expired Proxies</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1 leading-tight">{expiredProxies.length}</h3>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px bg-slate-150/80 dark:bg-zinc-800 my-1" />

        {/* Emails */}
        <div className="flex-1 flex items-center gap-3 px-2 sm:px-4">
          <div className="h-9 w-9 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-450 flex items-center justify-center">
            <Mail className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-wider leading-none">Emails</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1 leading-tight">{purchasedEmails.length}</h3>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px bg-slate-150/80 dark:bg-zinc-800 my-1" />

        {/* Wallet Balance (Linkable to topup) */}
        <Link href="/topup" className="flex-1 flex items-center gap-3 px-2 sm:px-4 hover:opacity-85 transition-opacity group cursor-pointer">
          <div className="h-9 w-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450 flex items-center justify-center">
            <span className="font-extrabold text-[10px]">KES</span>
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-wider leading-none group-hover:text-emerald-500 transition-colors">Balance</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1 leading-tight">KES {balance.toLocaleString()}</h3>
          </div>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Pill-shaped container Segmented tabs */}
        <TabsList className="flex w-full max-w-md bg-white/60 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80 p-1 rounded-full h-auto mb-8 shadow-2xs">
          <TabsTrigger 
            value="active" 
            className="flex-1 gap-1.5 py-2 px-3 text-xs font-bold rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-450 data-[state=active]:shadow-xs transition-all text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            <Package className="h-3.5 w-3.5" />
          <span>Active</span>
          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-slate-50 dark:bg-zinc-950 text-slate-500 dark:text-zinc-400 border border-slate-100 dark:border-zinc-800">
            {activeProxies.length}
          </span>
        </TabsTrigger>
        <TabsTrigger 
          value="expired" 
          className="flex-1 gap-1.5 py-2 px-3 text-xs font-bold rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-450 data-[state=active]:shadow-xs transition-all text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          <Clock className="h-3.5 w-3.5" />
          <span>Expired</span>
          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-slate-50 dark:bg-zinc-950 text-slate-500 dark:text-zinc-400 border border-slate-100 dark:border-zinc-800">
            {expiredProxies.length}
          </span>
        </TabsTrigger>
        <TabsTrigger 
          value="emails" 
          className="flex-1 gap-1.5 py-2 px-3 text-xs font-bold rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-450 data-[state=active]:shadow-xs transition-all text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          <Mail className="h-3.5 w-3.5" />
          <span>Emails</span>
          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-slate-50 dark:bg-zinc-950 text-slate-500 dark:text-zinc-400 border border-slate-100 dark:border-zinc-800">
            {purchasedEmails.length}
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="active" className="mt-2 outline-none">
        {activeProxies.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-2xl p-12 text-center shadow-sm max-w-2xl mx-auto flex flex-col items-center justify-center">
            <ActiveProxyIllustration />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No active proxies yet.</h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium max-w-sm mb-6 leading-relaxed">
              Deploy your first high-performance proxy instantly using M-Pesa.
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-6 font-semibold shadow-xs transition-colors" asChild>
              <Link href="/buy">Purchase New Proxy</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeProxies.map((proxy) => (
              <ProxyCard key={proxy.id} proxy={proxy} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="expired" className="mt-2 outline-none">
        {expiredProxies.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-2xl p-12 text-center shadow-sm max-w-2xl mx-auto flex flex-col items-center justify-center">
            <ExpiredProxyIllustration />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No expired proxies.</h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium max-w-sm mb-6 leading-relaxed">
              Your historical proxy configurations will appear here once they expire.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {expiredProxies.map((proxy) => (
              <ProxyCard key={proxy.id} proxy={proxy} isExpired />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="emails" className="mt-2 outline-none">
        {purchasedEmails.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-2xl p-12 text-center shadow-sm max-w-2xl mx-auto flex flex-col items-center justify-center">
            <EmailIllustration />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No purchased emails yet.</h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium max-w-sm mb-6 leading-relaxed">
              Deploy your secure messaging profiles instantly using M-Pesa.
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-6 font-semibold shadow-xs transition-colors" asChild>
              <Link href="/buy-emails">Purchase New Emails</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {purchasedEmails.map((email) => {
              const passwordVisible = visiblePasswords.has(email.id)
              const isCopied = copiedItem === email.id

              const handleCopy = (text: string, type: string) => {
                navigator.clipboard.writeText(text)
                setCopiedItem(`${email.id}-${type}`)
                setTimeout(() => setCopiedItem(null), 2000)
              }

              const togglePasswordVisibility = () => {
                setVisiblePasswords((prev) => {
                  const newSet = new Set(prev)
                  if (newSet.has(email.id)) {
                    newSet.delete(email.id)
                  } else {
                    newSet.add(email.id)
                  }
                  return newSet
                })
              }

              return (
                <Card key={email.id} className="overflow-hidden border-l-4 border-l-blue-600 bg-white dark:bg-zinc-900 border-y border-r border-slate-100 dark:border-zinc-800/60 shadow-xs transition-all duration-300">
                  <CardContent className="p-5">
                    <div className="space-y-4">
                      {/* Email Address */}
                      <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50/50 dark:bg-zinc-950/40 border border-slate-100 dark:border-zinc-800/60 p-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-550 mb-1">Email Address</p>
                          <p className="font-semibold text-sm break-all text-slate-800 dark:text-zinc-200">{email.emailAddress}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(email.emailAddress, "email")}
                          className="flex-shrink-0 hover:bg-slate-100 dark:hover:bg-zinc-800"
                          title="Copy email address"
                        >
                          <Copy className={`h-4 w-4 ${copiedItem === `${email.id}-email` ? "text-blue-600" : "text-slate-400"}`} />
                        </Button>
                      </div>

                      {/* Password */}
                      <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50/50 dark:bg-zinc-950/40 border border-slate-100 dark:border-zinc-800/60 p-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-550 mb-1">Password</p>
                          <p className="font-semibold text-sm font-mono text-slate-850 dark:text-zinc-250">
                            {passwordVisible ? email.password : "•".repeat(email.password.length)}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={togglePasswordVisibility}
                            className="hover:bg-slate-100 dark:hover:bg-zinc-800"
                            title="Toggle password visibility"
                          >
                            {passwordVisible ? (
                              <EyeOff className="h-4 w-4 text-slate-450" />
                            ) : (
                              <Eye className="h-4 w-4 text-slate-450" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(email.password, "password")}
                            className="hover:bg-slate-100 dark:hover:bg-zinc-800"
                            title="Copy password"
                          >
                            <Copy className={`h-4 w-4 ${copiedItem === `${email.id}-password` ? "text-blue-600" : "text-slate-400"}`} />
                          </Button>
                        </div>
                      </div>

                      {/* Server Info */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-slate-50/50 dark:bg-zinc-950/40 border border-slate-100 dark:border-zinc-800/60 p-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-550 mb-1">Domain</p>
                          <p className="font-semibold text-sm text-slate-800 dark:text-zinc-200">{email.domain}</p>
                        </div>
                        {email.server && (
                          <div className="flex items-center justify-between gap-2 rounded-lg bg-slate-50/50 dark:bg-zinc-950/40 border border-slate-100 dark:border-zinc-800/60 p-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-550 mb-1">Server</p>
                              <p className="font-mono text-xs break-all text-slate-800 dark:text-zinc-250">{email.server}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(email.server || "", "server")}
                              className="flex-shrink-0 hover:bg-slate-100 dark:hover:bg-zinc-800"
                              title="Copy server"
                            >
                              <Copy className={`h-4 w-4 ${copiedItem === `${email.id}-server` ? "text-blue-600" : "text-slate-400"}`} />
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Purchase Date */}
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide pt-3 border-t border-slate-100 dark:border-zinc-800/80">
                        Purchased (UTC):{" "}
                        {(() => {
                          const date = new Date(email.purchasedAt)
                          const year = date.getUTCFullYear()
                          const month = String(date.getUTCMonth() + 1).padStart(2, "0")
                          const day = String(date.getUTCDate()).padStart(2, "0")
                          const hours = String(date.getUTCHours()).padStart(2, "0")
                          const minutes = String(date.getUTCMinutes()).padStart(2, "0")
                          return `${month}/${day}/${year} at ${hours}:${minutes}`
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </TabsContent>
    </Tabs>
  </div>
  )
}
