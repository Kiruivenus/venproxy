"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, Globe, Clock, Eye, EyeOff } from "lucide-react"

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
  }
  isExpired?: boolean
}

export function ProxyCard({ proxy, isExpired = false }: ProxyCardProps) {
  const [copied, setCopied] = useState(false)

  const expiresAt = new Date(proxy.expiresAt)

  const proxyString =
    proxy.username && proxy.password
      ? `${proxy.username}:${proxy.password}@${proxy.ip}:${proxy.port}`
      : `${proxy.ip}:${proxy.port}`

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(proxyString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getFlagEmoji = (countryCode: string) => {
    if (!countryCode) return "🌐"
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map(char => 127397 + char.charCodeAt(0))
    try {
      return String.fromCodePoint(...codePoints)
    } catch (e) {
      return "🌐"
    }
  }

  const statusColor = proxy.status === "dead" ? "bg-red-500/20 text-red-500" : isExpired ? "destructive" : "default"
  const statusLabel = proxy.status === "dead" ? "Dead" : isExpired ? "Expired" : "Active"

  return (
    <Card className={`overflow-hidden bg-white dark:bg-card border border-slate-100 dark:border-border rounded-2xl shadow-xs transition-all duration-300 hover:shadow-md hover:border-blue-500/20 dark:hover:border-blue-500/35 ${isExpired || proxy.status === "dead" ? "opacity-60" : ""}`}>
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
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">Proxy Link</p>
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
      </CardContent>
    </Card>
  )
}
