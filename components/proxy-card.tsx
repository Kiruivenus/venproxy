"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, Globe, Clock, RefreshCw, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ProxyCardProps {
  proxy: {
    id: string
    ip: string
    port: number
    username?: string
    password?: string
    country: string
    countryCode: string
    expiresAt: string
    purchasedAt: string
    status?: "available" | "expired" | "dead"
    uniqueCode?: string
  }
  isExpired?: boolean
  onReplaced?: () => void
}

function formatPurchasedTime(purchasedAtStr?: string, id?: string) {
  let date: Date | null = null
  if (purchasedAtStr) {
    const parsed = new Date(purchasedAtStr)
    if (!isNaN(parsed.getTime())) {
      date = parsed
    }
  }
  if (!date && id && id.length === 24) {
    const sec = parseInt(id.substring(0, 8), 16)
    if (!isNaN(sec)) {
      date = new Date(sec * 1000)
    }
  }
  if (!date) return null

  const now = new Date()
  const diffMs = Math.max(0, now.getTime() - date.getTime())
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "just now"
  if (diffMins === 1) return "1 min ago"
  if (diffMins < 60) return `${diffMins} mins ago`
  if (diffHours === 1) return "1 hr ago"
  if (diffHours < 24) return `${diffHours} hrs ago`
  if (diffDays === 1) return "1 day ago"
  return `${diffDays} days ago`
}

export function ProxyCard({ proxy, isExpired = false, onReplaced }: ProxyCardProps) {
  const [copied, setCopied] = useState(false)
  const [replacing, setReplacing] = useState(false)
  const { toast } = useToast()

  const expiresAt = new Date(proxy.expiresAt)
  const purchasedTimeText = formatPurchasedTime(proxy.purchasedAt, proxy.id)

  const proxyString =
    proxy.username && proxy.password
      ? `${proxy.username}:${proxy.password}@${proxy.ip}:${proxy.port}`
      : `${proxy.ip}:${proxy.port}`

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(proxyString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReplace = async () => {
    setReplacing(true)
    try {
      const res = await fetch("/api/user/proxies/replace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchaseId: proxy.id }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        toast({
          title: "Proxy Replaced Successfully!",
          description: data.message || "Your dead proxy has been replaced with a working proxy.",
        })
        if (onReplaced) {
          onReplaced()
        }
      } else {
        toast({
          variant: "destructive",
          title: data.error?.includes("active") ? "Proxy Is Still Active" : "Replacement Notice",
          description: data.error || "Failed to replace proxy.",
        })
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to communicate with replacement service. Please try again.",
      })
    } finally {
      setReplacing(false)
    }
  }

  const getFlagEmoji = (countryCode: string) => {
    if (!countryCode) return "🌐"
    let code = countryCode.toUpperCase().trim()
    
    // Map common 3-letter codes to 2-letter codes
    const alpha3ToAlpha2: { [key: string]: string } = {
      USA: "US",
      KEN: "KE",
      GBR: "GB",
      DEU: "DE",
      FRA: "FR",
      ESP: "ES",
      MAR: "MA",
      ZAF: "ZA",
      IND: "IN",
      NGA: "NG",
      HKG: "HK",
      SGP: "SG",
    }

    if (alpha3ToAlpha2[code]) {
      code = alpha3ToAlpha2[code]
    }

    const cleanCode = code.slice(0, 2)
    if (!/^[A-Z]{2}$/.test(cleanCode)) {
      return "🌐"
    }

    const codePoints = cleanCode
      .split("")
      .map(char => 127397 + char.charCodeAt(0))
    try {
      return String.fromCodePoint(...codePoints)
    } catch {
      return "🌐"
    }
  }

  const isDead = proxy.status === "dead"
  const statusColor = isDead
    ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40"
    : isExpired
    ? "destructive"
    : "default"
  const statusLabel = isDead ? "Dead" : isExpired ? "Expired" : "Active"

  return (
    <Card
      className={`overflow-hidden bg-white dark:bg-card border rounded-2xl shadow-xs transition-all duration-300 hover:shadow-md hover:border-blue-500/20 dark:hover:border-blue-500/35 ${
        isExpired
          ? "opacity-60 border-slate-100 dark:border-border"
          : isDead
          ? "border-rose-300 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/15"
          : "border-slate-100 dark:border-border"
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-extrabold text-slate-800 dark:text-zinc-200">
          <span className="text-xl flex-shrink-0" role="img" aria-label={proxy.country}>
            {getFlagEmoji(proxy.countryCode)}
          </span>
          <span className="truncate">{proxy.country}</span>
        </CardTitle>
        <Badge variant={statusColor === "destructive" ? "destructive" : "default"} className={statusColor}>
          {statusLabel}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Combined Proxy Field */}
        <div className="flex items-center justify-between gap-2.5 rounded-xl bg-slate-50/50 dark:bg-zinc-950/40 border border-slate-100 dark:border-zinc-800/60 p-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">Proxy</p>
            <code className="font-semibold text-xs font-mono break-all text-slate-800 dark:text-zinc-200">
              {proxyString}
            </code>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            disabled={isExpired}
            className="flex-shrink-0 hover:bg-slate-100 dark:hover:bg-zinc-800 h-8 w-8 rounded-lg p-0 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
            title="Copy proxy"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-450" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Unique Identifier */}
        {proxy.uniqueCode && (
          <div className="flex items-center justify-between pt-1 border-t border-slate-100/50 dark:border-zinc-800/30">
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">ID Code</span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-450 bg-blue-50/50 dark:bg-blue-950/20 px-2 py-0.5 rounded">
              #{proxy.uniqueCode}
            </span>
          </div>
        )}

        {/* Purchased Time (Original Purchase Time) */}
        {purchasedTimeText && (
          <div className="flex items-center justify-between pt-1 border-t border-slate-100/50 dark:border-zinc-800/30">
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Purchased</span>
            <span
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300"
              title={proxy.purchasedAt ? `Original purchase: ${new Date(proxy.purchasedAt).toLocaleString()}` : undefined}
            >
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>{purchasedTimeText}</span>
            </span>
          </div>
        )}

        {/* Expiry Time */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100/50 dark:border-zinc-800/30">
          <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Expires (UTC)</span>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            {(() => {
              const year = expiresAt.getUTCFullYear()
              const month = String(expiresAt.getUTCMonth() + 1).padStart(2, "0")
              const day = String(expiresAt.getUTCDate()).padStart(2, "0")
              const hours = String(expiresAt.getUTCHours()).padStart(2, "0")
              const minutes = String(expiresAt.getUTCMinutes()).padStart(2, "0")
              return `${month}/${day}/${year} ${hours}:${minutes}`
            })()}
          </span>
        </div>

        {/* Replace Proxy Action */}
        {!isExpired && (
          <div className="pt-2 border-t border-slate-100/50 dark:border-zinc-800/30">
            <Button
              variant={isDead ? "destructive" : "outline"}
              size="sm"
              onClick={handleReplace}
              disabled={replacing}
              className={`w-full h-9 rounded-xl font-bold gap-2 text-xs transition-all cursor-pointer ${
                isDead
                  ? "bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                  : "border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-850 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {replacing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>{isDead ? "Replacing Proxy..." : "Checking Status..."}</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>{isDead ? "Replace Dead Proxy" : "Replace Proxy"}</span>
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

