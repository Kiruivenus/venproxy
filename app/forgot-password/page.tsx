"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Globe, Loader2, Mail, Lock, ArrowRight, ArrowLeft, ShieldCheck, KeyRound, CheckCircle2 } from "lucide-react"
import { PublicNavBar } from "@/components/public-navbar"
import { BrandLogo } from "@/components/brand-logo"

type Step = "request" | "reset" | "success"

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("request")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const getPasswordStrength = () => {
    if (!password) return 0
    let score = 0
    if (password.length >= 8) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1
    return score
  }

  const strength = getPasswordStrength()

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim(), action: "send-code" }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to send reset code")
        return
      }

      setStep("reset")
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (!code) {
      setError("Please enter the reset code")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim(), code, password, action: "reset-password" }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to reset password")
        return
      }

      setStep("success")
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <PublicNavBar mode="login" />
      {/* Left Visual Section */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between pt-28 pb-12 px-12 relative overflow-hidden bg-zinc-950 border-r border-border/40">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-background to-background" />
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[60%] rounded-full bg-accent/10 blur-[120px]" />
        
        {/* Branding */}
        <div className="relative z-10">
          <BrandLogo size="lg" className="transition-transform hover:scale-105 duration-300" />
        </div>

        {/* Hero Message */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <h1 className="text-5xl font-bold tracking-tight mb-6 leading-[1.1]">
            Secure Account <br />
            <span className="text-accent">Recovery</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
            Follow the steps to securely verify your identity and regain access to your Proxiva account.
          </p>
          
          <div className="mt-10 space-y-4">
            <div className="flex items-center gap-3 text-foreground/90">
              <ShieldCheck className="h-5 w-5 text-accent" />
              <span>Encrypted verification process</span>
            </div>
          </div>
        </div>
        
        {/* Trust Indicators */}
        <div className="relative z-10 flex items-center gap-6 text-sm font-medium text-muted-foreground/80">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(var(--color-accent),0.8)]" />
            <span>Secure process</span>
          </div>
          <div className="h-1 w-1 rounded-full bg-border" />
          <span>SOC2 Certified</span>
        </div>
      </div>

      {/* Right Auth Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        {/* Mobile Background Elements */}
        <div className="absolute inset-0 bg-background lg:hidden z-0">
          <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-accent/5 to-transparent" />
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent/10 blur-[80px]" />
        </div>
        
        <div className="w-full max-w-[420px] relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out py-8">
          <div className="lg:hidden flex items-center justify-center mb-10">
            <BrandLogo size="lg" />
          </div>

          <div className="mb-8">
            <Link href="/login" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6 group">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Login
            </Link>
            <h2 className="text-3xl font-semibold tracking-tight mb-2 text-foreground">
              {step === "request" && "Recover access"}
              {step === "reset" && "Reset password"}
              {step === "success" && "Success!"}
            </h2>
            <p className="text-muted-foreground">
              {step === "request" && "Enter your email to receive a reset code."}
              {step === "reset" && "Check your email for the reset code and enter your new password."}
              {step === "success" && "Your password has been successfully reset."}
            </p>
          </div>

          {/* Request Code Step */}
          {step === "request" && (
            <form onSubmit={handleSendCode} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
              {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-in fade-in slide-in-from-top-2">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground/90">
                  Email Address
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors duration-300" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-12 bg-zinc-950/40 backdrop-blur-md border-border/50 focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent transition-all duration-300"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="group w-full h-12 mt-4 bg-accent hover:bg-accent/90 text-background font-semibold text-base transition-all duration-300 shadow-[0_0_15px_rgba(var(--color-accent),0.3)] hover:shadow-[0_0_25px_rgba(var(--color-accent),0.5)]" 
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Send Reset Code
                    <ArrowRight className="ml-2 h-5 w-5 opacity-70 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Enter Code + New Password Step */}
          {step === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
              {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-in fade-in slide-in-from-top-2">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="code" className="text-sm font-medium text-foreground/90">
                    Reset Code
                  </Label>
                  <button 
                    type="button" 
                    onClick={() => setStep("request")}
                    className="text-xs text-accent hover:text-accent/80 transition-colors"
                  >
                    Resend code
                  </button>
                </div>
                <div className="relative group">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors duration-300" />
                  <Input
                    id="code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    className="pl-10 h-12 bg-zinc-950/40 backdrop-blur-md border-border/50 focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent transition-all duration-300"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground/90">
                  New Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors duration-300" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 h-12 bg-zinc-950/40 backdrop-blur-md border-border/50 focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent transition-all duration-300"
                  />
                </div>
                {password.length > 0 && (
                  <div className="pt-2 animate-in fade-in duration-300">
                    <div className="flex gap-1 h-1.5 w-full rounded-full overflow-hidden">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`flex-1 transition-all duration-500 ${
                            strength >= i 
                              ? strength <= 2 ? "bg-amber-500" : "bg-accent" 
                              : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5 text-right">
                      {strength <= 1 && "Weak"}
                      {strength === 2 && "Fair"}
                      {strength === 3 && "Good"}
                      {strength >= 4 && "Strong"}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground/90">
                  Confirm Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors duration-300" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pl-10 h-12 bg-zinc-950/40 backdrop-blur-md border-border/50 focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent transition-all duration-300"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="group w-full h-12 mt-4 bg-accent hover:bg-accent/90 text-background font-semibold text-base transition-all duration-300 shadow-[0_0_15px_rgba(var(--color-accent),0.3)] hover:shadow-[0_0_25px_rgba(var(--color-accent),0.5)]" 
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Reset Password
                    <ArrowRight className="ml-2 h-5 w-5 opacity-70 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Success Step */}
          {step === "success" && (
            <div className="flex flex-col items-center justify-center space-y-6 py-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 border border-accent/20">
                <CheckCircle2 className="h-10 w-10 text-accent" />
              </div>
              <div className="text-center">
                <p className="text-muted-foreground mb-8">
                  Your password has been successfully reset. You can now use your new password to sign in.
                </p>
                <Button asChild className="group w-full h-12 bg-accent hover:bg-accent/90 text-background font-semibold text-base transition-all duration-300 shadow-[0_0_15px_rgba(var(--color-accent),0.3)] hover:shadow-[0_0_25px_rgba(var(--color-accent),0.5)]">
                  <Link href="/login">
                    Back to Login
                    <ArrowRight className="ml-2 h-5 w-5 opacity-70 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
