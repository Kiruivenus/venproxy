"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { updatePlatformSettings, type PlatformSettings } from "@/app/admin/platform-actions"
import { useToast } from "@/components/ui/use-toast"
import {
  ShieldAlert,
  ShoppingCart,
  Mail,
  CreditCard,
  UserX,
  Loader2,
  Building2,
  Image as ImageIcon,
  Key,
} from "lucide-react"

interface PlatformSettingsFormProps {
  initialSettings: PlatformSettings
}

export function PlatformSettingsForm({ initialSettings }: PlatformSettingsFormProps) {
  const { toast } = useToast()
  const [settings, setSettings] = useState<PlatformSettings>(initialSettings)
  const [savingToggles, setSavingToggles] = useState<string | null>(null)
  const [savingBranding, setSavingBranding] = useState(false)
  const [brandingName, setBrandingName] = useState(initialSettings.companyName)
  const [brandingLogo, setBrandingLogo] = useState(initialSettings.companyLogoUrl)
  const [savingSmtp, setSavingSmtp] = useState(false)
  const [smtpHost, setSmtpHost] = useState(initialSettings.smtpHost || "")
  const [smtpPort, setSmtpPort] = useState(initialSettings.smtpPort || 587)
  const [smtpUser, setSmtpUser] = useState(initialSettings.smtpUser || "")
  const [smtpPass, setSmtpPass] = useState(initialSettings.smtpPass || "")
  const [smtpSender, setSmtpSender] = useState(initialSettings.smtpSender || "")

  const handleToggle = async (key: keyof PlatformSettings, value: boolean) => {
    const prev = settings[key]
    setSettings((s) => ({ ...s, [key]: value }))
    setSavingToggles(key)
    try {
      const result = await updatePlatformSettings({ [key]: value })
      if (result.success) {
        toast({ title: "Saved", description: result.message })
      } else {
        setSettings((s) => ({ ...s, [key]: prev }))
        toast({ variant: "destructive", title: "Error", description: result.error })
      }
    } catch {
      setSettings((s) => ({ ...s, [key]: prev }))
      toast({ variant: "destructive", title: "Error", description: "Failed to save." })
    } finally {
      setSavingToggles(null)
    }
  }

  const handleSaveBranding = async () => {
    setSavingBranding(true)
    try {
      const result = await updatePlatformSettings({
        companyName: brandingName,
        companyLogoUrl: brandingLogo,
      })
      if (result.success) {
        setSettings((s) => ({ ...s, companyName: brandingName, companyLogoUrl: brandingLogo }))
        toast({ title: "Branding Saved", description: result.message })
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error })
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to save branding." })
    } finally {
      setSavingBranding(false)
    }
  }

  const handleSaveSmtp = async () => {
    setSavingSmtp(true)
    try {
      const result = await updatePlatformSettings({
        smtpHost,
        smtpPort: Number(smtpPort),
        smtpUser,
        smtpPass,
        smtpSender,
      })
      if (result.success) {
        setSettings((s) => ({
          ...s,
          smtpHost,
          smtpPort: Number(smtpPort),
          smtpUser,
          smtpPass,
          smtpSender,
        }))
        toast({ title: "SMTP Settings Saved", description: result.message })
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error })
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to save SMTP settings." })
    } finally {
      setSavingSmtp(false)
    }
  }

  const toggleItems = [
    {
      key: "maintenanceMode" as keyof PlatformSettings,
      label: "Maintenance Mode",
      description: "Turn off the entire user-facing app. Admins still have access.",
      icon: ShieldAlert,
      danger: true,
    },
    {
      key: "disableProxyPurchase" as keyof PlatformSettings,
      label: "Disable Proxy Purchase",
      description: "Stop all new proxy orders across the platform.",
      icon: ShoppingCart,
      danger: false,
    },
    {
      key: "disableEmailPurchase" as keyof PlatformSettings,
      label: "Disable Email Purchase",
      description: "Stop all new email account orders.",
      icon: Mail,
      danger: false,
    },
    {
      key: "disableMpesaDeposits" as keyof PlatformSettings,
      label: "Disable M-Pesa Deposits",
      description: "Hide M-Pesa top-up options for all users.",
      icon: CreditCard,
      danger: false,
    },
    {
      key: "disableUserRegistration" as keyof PlatformSettings,
      label: "Disable User Registration",
      description: "Prevent new accounts from signing up.",
      icon: UserX,
      danger: false,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Card 1: Platform Toggles */}
      <div className="bg-white dark:bg-card rounded-2xl shadow-xs border border-slate-200 dark:border-border p-6 md:p-8">
        <div className="border-b border-slate-100 dark:border-border pb-4 mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Platform Controls</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Toggle platform features on/off instantly. Changes take effect immediately.</p>
        </div>

        <div className="space-y-5">
          {toggleItems.map((item) => {
            const isActive = !!settings[item.key]
            const isSaving = savingToggles === item.key
            const Icon = item.icon
            return (
              <div
                key={item.key}
                className={`flex items-start justify-between gap-4 p-4 rounded-xl border transition-colors ${
                  isActive && item.danger
                    ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/35"
                    : isActive
                    ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/35"
                    : "bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800/60"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                      isActive && item.danger
                        ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                        : isActive
                        ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <Label
                      htmlFor={item.key}
                      className={`text-sm font-bold cursor-pointer ${
                        isActive && item.danger
                          ? "text-red-700 dark:text-red-400"
                          : isActive
                          ? "text-amber-700 dark:text-amber-450"
                          : "text-slate-800 dark:text-zinc-255"
                      }`}
                    >
                      {item.label}
                    </Label>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
                  <Switch
                    id={item.key}
                    checked={isActive}
                    onCheckedChange={(v) => handleToggle(item.key, v)}
                    disabled={isSaving}
                    className={isActive && item.danger ? "data-[state=checked]:bg-red-600" : ""}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Card 2: Branding & Identity */}
      <div className="bg-white dark:bg-card rounded-2xl shadow-xs border border-slate-200 dark:border-border p-6 md:p-8">
        <div className="border-b border-slate-100 dark:border-border pb-4 mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Branding & Identity</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Customize how your platform presents itself to users.</p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-zinc-300">
              <Building2 className="h-4 w-4 text-slate-450" />
              Company / Platform Name
            </Label>
            <Input
              id="companyName"
              value={brandingName}
              onChange={(e) => setBrandingName(e.target.value)}
              placeholder="e.g. RayProxy Hub"
              className="h-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-600 dark:focus:border-blue-600 focus:ring-1 focus:ring-blue-650 transition-all outline-none font-semibold"
            />
            <p className="text-xs text-slate-450 dark:text-zinc-500">This name appears in the sidebar and navigation.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyLogo" className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-zinc-300">
              <ImageIcon className="h-4 w-4 text-slate-450" />
              Logo URL
            </Label>
            <Input
              id="companyLogo"
              value={brandingLogo}
              onChange={(e) => setBrandingLogo(e.target.value)}
              placeholder="https://your-domain.com/logo.png"
              className="h-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-600 dark:focus:border-blue-600 focus:ring-1 focus:ring-blue-650 transition-all outline-none font-medium"
            />
            <p className="text-xs text-slate-455 dark:text-zinc-500">Use an HTTPS URL. Supports any shape (square, wide, or rectangular).</p>
          </div>

          {brandingLogo && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={brandingLogo}
                alt="Brand logo preview"
                className="h-10 w-auto max-w-[150px] rounded-lg object-contain border border-slate-200 dark:border-slate-800 bg-white dark:bg-transparent"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
              />
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-zinc-200">Logo Preview</p>
                <p className="text-[11px] text-slate-400 dark:text-zinc-400">{brandingName}</p>
              </div>
            </div>
          )}

          <Button
            onClick={handleSaveBranding}
            disabled={savingBranding}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-6 h-11 transition-colors w-full mt-2 cursor-pointer"
          >
            {savingBranding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Branding"
            )}
          </Button>
        </div>
      </div>
    </div>

      {/* Card 3: SMTP Settings */}
      <div className="bg-white dark:bg-card rounded-2xl shadow-xs border border-slate-200 dark:border-border p-6 md:p-8">
        <div className="border-b border-slate-100 dark:border-border pb-4 mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">SMTP Email Server Settings</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Configure your SMTP settings to dynamically send transactional emails (like password reset codes).</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="smtpHost" className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-zinc-300">
              SMTP Host
            </Label>
            <Input
              id="smtpHost"
              value={smtpHost}
              onChange={(e) => setSmtpHost(e.target.value)}
              placeholder="e.g. smtp.gmail.com or mail.rayproxy.com"
              className="h-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-600 dark:focus:border-blue-600 focus:ring-1 focus:ring-blue-650 transition-all outline-none font-medium"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="smtpPort" className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-zinc-300">
              SMTP Port
            </Label>
            <Input
              id="smtpPort"
              type="number"
              value={smtpPort}
              onChange={(e) => setSmtpPort(Number(e.target.value))}
              placeholder="587"
              className="h-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-600 dark:focus:border-blue-600 focus:ring-1 focus:ring-blue-650 transition-all outline-none font-medium"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="smtpUser" className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-zinc-300">
              SMTP Username
            </Label>
            <Input
              id="smtpUser"
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
              placeholder="e.g. support@yourdomain.com"
              className="h-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-600 dark:focus:border-blue-600 focus:ring-1 focus:ring-blue-650 transition-all outline-none font-medium"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="smtpPass" className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-zinc-300">
              SMTP Password
            </Label>
            <Input
              id="smtpPass"
              type="password"
              value={smtpPass}
              onChange={(e) => setSmtpPass(e.target.value)}
              placeholder="••••••••••••••••"
              className="h-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-600 dark:focus:border-blue-600 focus:ring-1 focus:ring-blue-650 transition-all outline-none font-medium"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="smtpSender" className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-zinc-300">
              SMTP Sender Email (From)
            </Label>
            <Input
              id="smtpSender"
              value={smtpSender}
              onChange={(e) => setSmtpSender(e.target.value)}
              placeholder="e.g. noreply@yourdomain.com"
              className="h-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-600 dark:focus:border-blue-600 focus:ring-1 focus:ring-blue-650 transition-all outline-none font-medium"
            />
          </div>
        </div>

        <Button
          onClick={handleSaveSmtp}
          disabled={savingSmtp}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-6 h-11 transition-colors w-full mt-6 cursor-pointer"
        >
          {savingSmtp ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving SMTP Settings...
            </>
          ) : (
            "Save SMTP Settings"
          )}
        </Button>
      </div>
    </div>
  )
}
