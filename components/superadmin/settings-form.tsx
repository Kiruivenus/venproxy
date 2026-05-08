"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, Calendar, Clock, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface WebsiteSettings {
  subscriptionActive: boolean
  subscriptionDuration: "1min" | "1day" | "1week" | "2weeks" | "1month"
  subscriptionExpiresAt: string
  lastPaymentAt?: string
}

export function SettingsForm() {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [duration, setDuration] = useState<string>("")

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/superadmin/settings")
      const data = await res.json()
      if (res.ok) {
        setSettings(data)
        setDuration(data.subscriptionDuration)
      } else {
        toast.error(data.error || "Failed to fetch settings")
      }
    } catch (error) {
      toast.error("An error occurred while fetching settings")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/superadmin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionDuration: duration }),
      })
      if (res.ok) {
        toast.success("Settings updated successfully")
        fetchSettings()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to update settings")
      }
    } catch (error) {
      toast.error("An error occurred while saving")
    } finally {
      setSaving(false)
    }
  }

  const getTimeRemaining = (expiry: string) => {
    const total = Date.parse(expiry) - Date.parse(new Date().toString())
    if (total <= 0) return "Expired"
    
    const seconds = Math.floor((total / 1000) % 60)
    const minutes = Math.floor((total / 1000 / 60) % 60)
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
    const days = Math.floor(total / (1000 * 60 * 60 * 24))

    if (days > 0) return `${days}d ${hours}h remaining`
    if (hours > 0) return `${hours}h ${minutes}m remaining`
    if (minutes > 0) return `${minutes}m ${seconds}s remaining`
    return `${seconds}s remaining`
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    )
  }

  if (!settings) return null

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card className="bg-zinc-950/40 border-border/40 backdrop-blur-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Website Subscription Status</CardTitle>
              <CardDescription>Monitor your platform's active status</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={fetchSettings} disabled={loading} className="h-8 w-8 text-muted-foreground hover:text-white">
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
              <Badge variant={settings.subscriptionActive ? "default" : "destructive"} className={settings.subscriptionActive ? "bg-green-500/20 text-green-500 hover:bg-green-500/30" : ""}>
                {settings.subscriptionActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border/40 bg-zinc-900/50 p-4 space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Calendar className="h-4 w-4" />
                <span>Expires At</span>
              </div>
              <p className="text-lg font-bold">
                {new Date(settings.subscriptionExpiresAt).toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl border border-border/40 bg-zinc-900/50 p-4 space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Clock className="h-4 w-4" />
                <span>Time Remaining</span>
              </div>
              <p className={`text-lg font-bold ${!settings.subscriptionActive ? "text-destructive" : "text-accent"}`}>
                {getTimeRemaining(settings.subscriptionExpiresAt)}
              </p>
            </div>
          </div>

          {!settings.subscriptionActive && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">Your website subscription has expired. Please upgrade to restore full functionality.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-zinc-950/40 border-border/40 backdrop-blur-md">
        <CardHeader>
          <CardTitle>Subscription Configuration</CardTitle>
          <CardDescription>Set the duration for your next subscription renewal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="duration">Renewal Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger id="duration" className="h-11 bg-zinc-950/40 border-border/50">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1min">1 Minute (Testing)</SelectItem>
                <SelectItem value="1day">1 Day</SelectItem>
                <SelectItem value="1week">1 Week</SelectItem>
                <SelectItem value="2weeks">2 Weeks</SelectItem>
                <SelectItem value="1month">1 Month</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This duration will be applied when you make a payment on the Upgrade page.
            </p>
          </div>
        </CardContent>
        <CardFooter className="border-t border-border/10 pt-6 flex flex-col items-stretch gap-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground italic">
              {duration !== settings.subscriptionDuration ? "⚠️ You have unsaved changes" : "✅ Current configuration is active"}
            </p>
            <Button 
              className="bg-accent hover:bg-accent/90 text-background font-bold px-8 shadow-lg shadow-accent/20"
              disabled={saving || duration === settings.subscriptionDuration}
              onClick={handleSave}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Configuration
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
