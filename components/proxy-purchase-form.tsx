"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, CheckCircle, XCircle, AlertCircle, Wallet, Smartphone } from "lucide-react"

interface PricingItem {
  country: string
  countryCode: string
  daily: number
}

interface AvailableProxy {
  id: string
  country: string
  expiresAt: string
}

interface ProxyPurchaseFormProps {
  pricing: PricingItem[]
  userId?: string
}

const MpesaWhiteIcon = () => (
  <svg viewBox="0 0 100 100" className="h-5 w-5 flex-shrink-0 animate-pulse-slow" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="22" fill="transparent"/>
    <path d="M20 70V30L42 54L64 30V70" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="82" cy="50" r="10" fill="white"/>
  </svg>
)

export function ProxyPurchaseForm({ pricing, userId }: ProxyPurchaseFormProps) {
  const router = useRouter()
  const [country, setCountry] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "balance">("mpesa")
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [available, setAvailable] = useState<boolean | null>(null)
  const [availableProxy, setAvailableProxy] = useState<AvailableProxy | null>(null)
  const [error, setError] = useState("")
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "pending" | "success" | "failed">("idle")
  const [balance, setBalance] = useState<number>(0)
  const [balanceLoading, setBalanceLoading] = useState(true)

  const selectedPricing = pricing.find((p) => p.country === country)
  const price = selectedPricing ? selectedPricing.daily : 0
  const hasEnoughBalance = balance >= price

  useEffect(() => {
    fetchBalance()
  }, [])

  useEffect(() => {
    if (country) {
      checkAvailability()
    }
  }, [country])

  const fetchBalance = async () => {
    try {
      const res = await fetch("/api/user/balance")
      if (res.ok) {
        const data = await res.json()
        setBalance(data.balance || 0)
      }
    } catch {
      // User might not be logged in
    } finally {
      setBalanceLoading(false)
    }
  }

  const checkAvailability = async () => {
    setChecking(true)
    try {
      const url = new URL("/api/proxies/available", window.location.origin)
      url.searchParams.set("country", country)
      if (userId) {
        url.searchParams.set("userId", userId)
      }
      const res = await fetch(url.toString())
      const data = await res.json()
      setAvailable(data.available)
      if (data.available && data.proxy) {
        setAvailableProxy(data.proxy)
      } else {
        setAvailableProxy(null)
      }
    } catch {
      setAvailable(null)
      setAvailableProxy(null)
    } finally {
      setChecking(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    setPaymentStatus("idle")

    let formattedPhone = ""
    if (paymentMethod === "mpesa") {
      // Validate phone number (Kenyan format)
      const cleanPhone = phoneNumber.replace(/\D/g, "")
      if (!cleanPhone.match(/^(254|0)?[17]\d{8}$/)) {
        setError("Please enter a valid M-Pesa phone number")
        setLoading(false)
        return
      }

      formattedPhone = cleanPhone.startsWith("254")
        ? cleanPhone
        : cleanPhone.startsWith("0")
          ? `254${cleanPhone.slice(1)}`
          : `254${cleanPhone}`
    }

    try {
      const orderRes = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country,
          duration: "daily",
          phoneNumber: formattedPhone,
          paymentMethod,
        }),
      })

      const orderData = await orderRes.json()

      if (!orderRes.ok) {
        setError(orderData.error || "Failed to create order")
        setLoading(false)
        return
      }

      // If paid with balance, redirect immediately
      if (orderData.paid) {
        setPaymentStatus("success")
        setTimeout(() => {
          router.push("/dashboard")
          router.refresh()
        }, 1500)
        return
      }

      // Initiate STK Push for M-Pesa
      setPaymentStatus("pending")
      const stkRes = await fetch("/api/palpluss/stk-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderData.order.id }),
      })

      const stkData = await stkRes.json()

      if (!stkRes.ok) {
        setError(stkData.error || "Failed to initiate payment")
        setPaymentStatus("failed")
        setLoading(false)
        return
      }

      // Poll for payment status
      let attempts = 0
      const maxAttempts = 30 // 60 seconds

      const pollInterval = setInterval(async () => {
        attempts++

        if (attempts >= maxAttempts) {
          clearInterval(pollInterval)
          setPaymentStatus("failed")
          setError("Payment timeout. Please try again.")
          setLoading(false)
          return
        }

        try {
          const statusRes = await fetch(`/api/palpluss/query-status?checkoutRequestId=${stkData.checkoutRequestId}&type=proxy`, { cache: "no-store" })
          const statusData = await statusRes.json()

          if (statusData.status === "paid" || statusData.status === "completed") {
            clearInterval(pollInterval)
            setPaymentStatus("success")
            setTimeout(() => {
              router.push("/dashboard?tab=active")
              router.refresh()
            }, 2000)
          } else if (statusData.status === "failed") {
            clearInterval(pollInterval)
            setPaymentStatus("failed")
            setError(statusData.error || "Payment failed. Please try again.")
            setLoading(false)
          }
        } catch {
          // Continue polling
        }
      }, 2000)
    } catch {
      setError("Something went wrong")
      setPaymentStatus("failed")
      setLoading(false)
    }
  }

  if (pricing.length === 0) {
    return (
      <div className="max-w-xl mx-auto bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-md p-12 text-center animate-in fade-in duration-500">
        <AlertCircle className="mx-auto h-12 w-12 text-slate-400 dark:text-zinc-550 mb-3" />
        <p className="text-sm font-semibold text-slate-650 dark:text-zinc-400">
          No proxies available at the moment. Please check back later.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-md border border-slate-200 dark:border-zinc-800/80 overflow-hidden animate-in fade-in duration-500">
      {/* Wallet Row (Header of the card) */}
      <div className="bg-slate-50 dark:bg-zinc-900/60 p-6 rounded-t-2xl border-b border-slate-100 dark:border-zinc-800/85 flex justify-between items-center">
        <div>
          <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
            WALLET BALANCE
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {balanceLoading ? (
              <span className="inline-block h-6 w-20 bg-slate-200 dark:bg-zinc-850 animate-pulse rounded-md mt-1" />
            ) : (
              `KES ${balance.toLocaleString()}`
            )}
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          type="button" 
          onClick={() => router.push("/topup")}
          className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-450 dark:hover:bg-emerald-900/10 px-4 py-2 rounded-full text-sm font-semibold transition-colors border-0 h-auto"
        >
          Top Up
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-6 bg-white dark:bg-zinc-900 rounded-b-2xl">
        {error && (
          <div className="rounded-xl bg-destructive/10 p-3 text-xs font-semibold text-destructive flex items-center gap-2 border border-destructive/20 animate-in fade-in">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {paymentStatus === "pending" && (
          <div className="rounded-xl bg-indigo-50/50 dark:bg-zinc-800/40 p-5 text-center border border-indigo-100/40 dark:border-zinc-800 space-y-2 animate-in fade-in">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
            <p className="font-bold text-sm text-slate-800 dark:text-zinc-200">Check your phone for M-Pesa prompt</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Enter your secure PIN to complete this payment</p>
          </div>
        )}

        {paymentStatus === "success" && (
          <div className="rounded-xl bg-emerald-50/65 dark:bg-emerald-950/20 p-5 text-center border border-emerald-100/40 dark:border-emerald-900/30 space-y-2 animate-in fade-in">
            <CheckCircle className="mx-auto h-8 w-8 text-emerald-600 dark:text-emerald-450 animate-bounce" />
            <p className="font-bold text-sm text-emerald-700 dark:text-emerald-400">Payment Successful!</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Redirecting secure session to your dashboard...</p>
          </div>
        )}

        {paymentStatus !== "success" && (
          <>
            {/* Region Selector */}
            <div>
              <Label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-2 block">
                SELECT REGION
              </Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="w-full h-14 bg-white dark:bg-zinc-900 border border-slate-350 dark:border-zinc-800 rounded-xl px-4 flex items-center justify-between text-slate-700 dark:text-zinc-300 hover:border-slate-400 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none cursor-pointer text-sm font-semibold shadow-2xs">
                  <SelectValue placeholder="Choose a country..." />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-md">
                  {pricing.map((p) => (
                    <SelectItem 
                      key={p.countryCode} 
                      value={p.country}
                      className="text-xs font-semibold py-2.5 focus:bg-indigo-50 dark:focus:bg-zinc-800/80 focus:text-indigo-600 dark:focus:text-indigo-400 rounded-lg cursor-pointer"
                    >
                      {p.country} — KES {p.daily}/day
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {checking && <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-550 mt-1.5 animate-pulse">Checking network availability...</p>}
              {available === true && !checking && (
                <p className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-450 mt-1.5">
                  <CheckCircle className="h-4 w-4" /> <span>Region Node Available</span>
                </p>
              )}
              {available === false && !checking && (
                <p className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-450 mt-1.5">
                  <XCircle className="h-4 w-4" /> <span>Region Node Unavailable</span>
                </p>
              )}
            </div>

            {selectedPricing && (
              <>
                <div className="rounded-xl border border-slate-100 dark:border-zinc-850 bg-slate-50/50 dark:bg-zinc-900/40 p-4 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-550 dark:text-zinc-400 uppercase">
                    <span>Daily Access</span>
                    <span className="text-sm font-black text-slate-800 dark:text-white">KES {selectedPricing.daily}</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-400 dark:text-zinc-550">
                    Provides immediate access to a premium, high-speed proxy.
                  </p>
                  {availableProxy && (
                    <div className="border-t border-slate-100 dark:border-zinc-800/80 pt-2.5 mt-2.5 flex justify-between text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                      <span>Proxy Expires (UTC):</span>
                      <span className="text-indigo-600 dark:text-indigo-400">
                        {(() => {
                          const date = new Date(availableProxy.expiresAt)
                          const year = date.getUTCFullYear()
                          const month = String(date.getUTCMonth() + 1).padStart(2, "0")
                          const day = String(date.getUTCDate()).padStart(2, "0")
                          const hours = String(date.getUTCHours()).padStart(2, "0")
                          const minutes = String(date.getUTCMinutes()).padStart(2, "0")
                          return `${month}/${day}/${year} at ${hours}:${minutes}`
                        })()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-3">
                  <Label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                    Payment Method
                  </Label>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(v) => setPaymentMethod(v as "mpesa" | "balance")}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div>
                      <RadioGroupItem
                        value="balance"
                        id="balance"
                        className="peer sr-only"
                        disabled={!hasEnoughBalance && price > 0}
                      />
                      <Label
                        htmlFor="balance"
                        className={`flex cursor-pointer flex-col items-center justify-between rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-4 hover:bg-slate-50/50 dark:hover:bg-zinc-800/40 peer-data-[state=checked]:border-indigo-650 peer-data-[state=checked]:bg-indigo-50/10 peer-data-[state=checked]:text-indigo-600 dark:peer-data-[state=checked]:border-indigo-500 dark:peer-data-[state=checked]:bg-indigo-950/20 dark:peer-data-[state=checked]:text-indigo-400 transition-all duration-200 shadow-2xs ${
                          !hasEnoughBalance && price > 0 ? "cursor-not-allowed opacity-50 bg-slate-50 dark:bg-zinc-900/20" : ""
                        }`}
                      >
                        <Wallet className="mb-2 h-5 w-5 stroke-[1.5]" />
                        <span className="text-xs font-bold">Wallet Balance</span>
                        {!hasEnoughBalance && price > 0 && (
                          <span className="mt-1.5 text-[9px] font-bold text-rose-650 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 rounded-full">
                            Insufficient
                          </span>
                        )}
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="mpesa" id="mpesa" className="peer sr-only" />
                      <Label
                        htmlFor="mpesa"
                        className="flex cursor-pointer flex-col items-center justify-between rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-4 hover:bg-slate-50/50 dark:hover:bg-zinc-800/40 peer-data-[state=checked]:border-indigo-650 peer-data-[state=checked]:bg-indigo-50/10 peer-data-[state=checked]:text-indigo-600 dark:peer-data-[state=checked]:border-indigo-500 dark:peer-data-[state=checked]:bg-indigo-950/20 dark:peer-data-[state=checked]:text-indigo-400 transition-all duration-200 shadow-2xs"
                      >
                        <Smartphone className="mb-2 h-5 w-5 stroke-[1.5]" />
                        <span className="text-xs font-bold">M-Pesa</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {paymentMethod === "mpesa" && (
                  <div className="space-y-2 animate-in fade-in">
                    <Label htmlFor="phone" className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                      M-Pesa Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="0712345678 or 254712345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      className="h-12 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 hover:border-slate-300 dark:hover:border-zinc-705 text-sm font-semibold rounded-xl transition-all shadow-xs"
                    />
                    <p className="text-[10px] font-medium text-slate-400 dark:text-zinc-500">
                      You will receive an STK push prompt on your mobile phone
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {paymentStatus !== "success" && (
          <Button
            type="submit"
            className="w-full h-14 mt-4 bg-[#00A859] hover:bg-[#008f4c] text-white font-bold text-lg rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all focus:ring-2 focus:ring-[#00A859] focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
            disabled={
              loading ||
              !country ||
              available === false ||
              (paymentMethod === "mpesa" && !phoneNumber) ||
              (paymentMethod === "balance" && !hasEnoughBalance)
            }
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin text-white" />
                Processing...
              </>
            ) : paymentMethod === "balance" ? (
              <>
                <Wallet className="h-5 w-5 stroke-[2.5]" />
                <span>Pay KES {price} from Balance</span>
              </>
            ) : (
              <>
                <MpesaWhiteIcon />
                <span>Pay KES {price} via M-Pesa</span>
              </>
            )}
          </Button>
        )}
      </form>
    </div>
  )
}
