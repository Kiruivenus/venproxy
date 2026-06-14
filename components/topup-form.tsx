"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle, Wallet, AlertCircle } from "lucide-react"

interface TopUpFormProps {
  currentBalance: number
}

const quickAmounts = [100, 250, 500, 1000]

const MpesaWhiteIcon = () => (
  <svg viewBox="0 0 100 100" className="h-5 w-5 flex-shrink-0 animate-pulse-slow" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="22" fill="transparent"/>
    <path d="M20 70V30L42 54L64 30V70" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="82" cy="50" r="10" fill="white"/>
  </svg>
)

export function TopUpForm({ currentBalance }: TopUpFormProps) {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "pending" | "success" | "failed">("idle")

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    setPaymentStatus("idle")

    const numAmount = Number.parseInt(amount)
    if (isNaN(numAmount) || numAmount < 10) {
      setError("Minimum top-up amount is KES 10")
      setLoading(false)
      return
    }

    // Validate phone number
    const cleanPhone = phoneNumber.replace(/\D/g, "")
    if (!cleanPhone.match(/^(254|0)?[17]\d{8}$/)) {
      setError("Please enter a valid M-Pesa phone number")
      setLoading(false)
      return
    }

    const formattedPhone = cleanPhone.startsWith("254")
      ? cleanPhone
      : cleanPhone.startsWith("0")
        ? `254${cleanPhone.slice(1)}`
        : `254${cleanPhone}`

    try {
      // Create top-up
      const topUpRes = await fetch("/api/topup/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: numAmount, phoneNumber: formattedPhone }),
      })

      const topUpData = await topUpRes.json()

      if (!topUpRes.ok) {
        setError(topUpData.error || "Failed to create top-up")
        setLoading(false)
        return
      }

      // Initiate STK Push
      setPaymentStatus("pending")
      const stkRes = await fetch("/api/mpesa/stk-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topUpId: topUpData.topUp.id }),
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
      const maxAttempts = 30

      const pollInterval = setInterval(async () => {
        attempts++

        if (attempts >= maxAttempts) {
          clearInterval(pollInterval)
          setPaymentStatus("failed")
          setError("Payment timeout. If money was deducted, your balance will be updated shortly.")
          setLoading(false)
          return
        }

        try {
          const statusRes = await fetch(`/api/mpesa/query-status?checkoutRequestId=${stkData.checkoutRequestId}&type=topup`, { cache: "no-store" })
          const statusData = await statusRes.json()

          if (statusData.status === "completed") {
            clearInterval(pollInterval)
            setPaymentStatus("success")
            setTimeout(() => {
              router.push("/dashboard")
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

  return (
    <div className="w-full max-w-xl mx-auto bg-white dark:bg-card rounded-2xl shadow-md border border-slate-200 dark:border-border overflow-hidden animate-in fade-in duration-500">
      {/* Current Balance Header */}
      <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-t-2xl border-b border-slate-100 dark:border-border flex justify-between items-center">
        <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
          CURRENT BALANCE
        </span>
        <div className="bg-blue-100 dark:bg-blue-950/45 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full font-bold flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          <span>KES {currentBalance.toLocaleString()}</span>
        </div>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-6 bg-white dark:bg-card rounded-b-2xl">
        {error && (
          <div className="rounded-xl bg-destructive/10 p-3 text-xs font-semibold text-destructive flex items-center gap-2 border border-destructive/20 animate-in fade-in">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {paymentStatus === "pending" && (
          <div className="rounded-xl bg-blue-50/20 dark:bg-slate-900/50 p-5 text-center border border-indigo-100/40 dark:border-border space-y-2 animate-in fade-in">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
            <p className="font-bold text-sm text-slate-800 dark:text-zinc-200">Check your phone for M-Pesa prompt</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Enter your secure PIN to complete this payment</p>
          </div>
        )}

        {paymentStatus === "success" && (
          <div className="rounded-xl bg-emerald-50/65 dark:bg-emerald-950/20 p-5 text-center border border-emerald-100/40 dark:border-emerald-900/30 space-y-2 animate-in fade-in">
            <CheckCircle className="mx-auto h-8 w-8 text-emerald-600 dark:text-emerald-450 animate-bounce" />
            <p className="font-bold text-sm text-emerald-700 dark:text-emerald-400">Top-up Successful!</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Redirecting to your dashboard...</p>
          </div>
        )}

        {paymentStatus !== "success" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-2 block">
                AMOUNT (KES)
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={10}
                required
                className="w-full h-14 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-600 dark:focus:border-blue-600 focus:ring-1 focus:ring-blue-650 transition-all outline-none font-semibold shadow-xs"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleQuickAmount(amt)}
                    className={`px-4 py-2 border rounded-full text-sm font-semibold transition-colors cursor-pointer ${
                      amount === amt.toString() 
                      ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800" 
                      : "bg-slate-50 dark:bg-slate-900/50 hover:bg-blue-50/40 dark:hover:bg-slate-900 border-slate-200 dark:border-border text-slate-700 dark:text-zinc-300 hover:text-blue-700 dark:hover:text-blue-400"
                    }`}
                  >
                    KES {amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-2 block">
                M-PESA PHONE NUMBER
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0712345678 or 254712345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className="w-full h-14 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-600 dark:focus:border-blue-600 focus:ring-1 focus:ring-blue-650 transition-all outline-none font-semibold shadow-xs"
              />
              <p className="text-[11px] font-medium text-slate-550 dark:text-zinc-500 mt-2">
                You will receive an STK push on this number
              </p>
            </div>
          </>
        )}

        {paymentStatus !== "success" && (
          <Button 
            type="submit" 
            className="w-full h-14 mt-2 bg-[#00A859] hover:bg-[#008f4c] text-white font-bold text-lg rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all focus:ring-2 focus:ring-[#00A859] focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer" 
            disabled={loading || !amount || !phoneNumber}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin text-white" />
                Processing...
              </>
            ) : (
              <>
                <MpesaWhiteIcon />
                {amount && !isNaN(Number(amount)) ? `Top Up KES ${Number(amount).toLocaleString()}` : "Initiate Top Up"}
              </>
            )}
          </Button>
        )}
      </form>
    </div>
  )
}
