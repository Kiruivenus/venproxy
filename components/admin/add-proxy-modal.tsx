"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus } from "lucide-react"

interface PricingItem {
  id: string
  country: string
  countryCode: string
}

interface AddProxyModalProps {
  pricing: PricingItem[]
  onAdd: (proxyData: any) => Promise<boolean>
  noPricingConfigured: boolean
}

export function AddProxyModal({ pricing, onAdd, noPricingConfigured }: AddProxyModalProps) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    ip: "",
    port: "",
    username: "",
    password: "",
    country: "",
    countryCode: "",
    maxUsage: "10",
    expiresAt: "",
  })

  const handleCountrySelect = (countryName: string) => {
    const selectedPricing = pricing.find((p) => p.country === countryName)
    if (selectedPricing) {
      setForm((prev) => ({
        ...prev,
        country: selectedPricing.country,
        countryCode: selectedPricing.countryCode,
      }))
    }
  }

  const handleSubmit = async () => {
    if (!form.ip || !form.port || !form.country) return
    setSubmitting(true)
    const success = await onAdd({
      ...form,
      port: Number.parseInt(form.port) || 0,
      maxUsage: Number.parseInt(form.maxUsage) || 10,
    })
    setSubmitting(false)
    if (success) {
      setOpen(false)
      setForm({
        ip: "",
        port: "",
        username: "",
        password: "",
        country: "",
        countryCode: "",
        maxUsage: "10",
        expiresAt: "",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={noPricingConfigured}>
          <Plus className="mr-2 h-4 w-4" />
          Add Proxy
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Proxy</DialogTitle>
          <DialogDescription>Enter the proxy details</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>IP Address</Label>
              <Input
                value={form.ip}
                onChange={(e) => setForm((prev) => ({ ...prev, ip: e.target.value }))}
                placeholder="192.168.1.1"
              />
            </div>
            <div className="space-y-2">
              <Label>Port</Label>
              <Input
                value={form.port}
                onChange={(e) => setForm((prev) => ({ ...prev, port: e.target.value }))}
                placeholder="8080"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Username (optional)</Label>
              <Input
                value={form.username}
                onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Password (optional)</Label>
              <Input
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Country</Label>
            <Select value={form.country} onValueChange={handleCountrySelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {pricing.map((p) => (
                  <SelectItem key={p.id} value={p.country}>
                    {p.country} ({p.countryCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Max Usage</Label>
              <Input
                type="number"
                value={form.maxUsage}
                onChange={(e) => setForm((prev) => ({ ...prev, maxUsage: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Expires At</Label>
              <Input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => setForm((prev) => ({ ...prev, expiresAt: e.target.value }))}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={submitting || !form.country || !form.ip || !form.port}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Proxy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
