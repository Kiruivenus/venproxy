"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Globe, Loader2, Mail, Lock, ArrowRight, User, ShieldCheck, Eye, EyeOff } from "lucide-react"
import { PublicNavBar } from "@/components/public-navbar"
import { BrandLogo } from "@/components/brand-logo"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: email.toLowerCase().trim(), password, confirmPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Registration failed")
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <PublicNavBar mode="register" />
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
            Build Faster with <br />
            <span className="text-accent">Premium Proxies</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
            Join thousands of developers bypassing restrictions and scaling data extraction globally.
          </p>
          
          <div className="mt-10 space-y-4">
            <div className="flex items-center gap-3 text-foreground/90">
              <ShieldCheck className="h-5 w-5 text-accent" />
              <span>Bank-level encryption and security</span>
            </div>
            <div className="flex items-center gap-3 text-foreground/90">
              <Globe className="h-5 w-5 text-accent" />
              <span>Access to 10M+ IPs worldwide</span>
            </div>
          </div>
        </div>
        
        {/* Trust Indicators */}
        <div className="relative z-10 flex items-center gap-6 text-sm font-medium text-muted-foreground/80">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(var(--color-accent),0.8)]" />
            <span>Systems Operational</span>
          </div>
          <div className="h-1 w-1 rounded-full bg-border" />
          <span>SOC2 Certified</span>
          <div className="h-1 w-1 rounded-full bg-border" />
          <span>99.9% Uptime</span>
        </div>
      </div>

      {/* Right Auth Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto bg-zinc-950">
        {/* Soft blur, reduced clarity background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-[0.70] pointer-events-none filter blur-[4px]" 
          style={{ backgroundImage: `url('/login-bg.png')` }}
        />
        {/* Uniform low-opacity overlay to keep image clear from top to bottom while maintaining text contrast */}
        <div className="absolute inset-0 bg-zinc-950/25 pointer-events-none" />
        
        
        {/* Form container floating directly on background */}
        <div className="w-full max-w-[390px] relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out my-8">
          <div className="lg:hidden flex items-center justify-center mb-8">
            <BrandLogo size="lg" textColor="text-white" />
          </div>

          <div className="text-center lg:text-left mb-6 font-sans">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Create an account</h2>
            <p className="text-sm text-zinc-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-medium">Join thousands of satisfied users today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 font-sans">
            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-bold text-zinc-300 uppercase tracking-wider drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                Full Name
              </Label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-accent transition-colors duration-300" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="pl-10 h-12 bg-zinc-900/60 backdrop-blur-md border-zinc-800/80 text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent transition-all duration-300 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-zinc-300 uppercase tracking-wider drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                Email Address
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-accent transition-colors duration-300" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-12 bg-zinc-900/60 backdrop-blur-md border-zinc-800/80 text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent transition-all duration-300 font-medium"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold text-zinc-300 uppercase tracking-wider drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-accent transition-colors duration-300" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-10 h-12 bg-zinc-900/60 backdrop-blur-md border-zinc-800/80 text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent transition-all duration-300 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
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
                  <p className="text-xs text-zinc-400 mt-1.5 text-right font-medium drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                    {strength <= 1 && "Weak"}
                    {strength === 2 && "Fair"}
                    {strength === 3 && "Good"}
                    {strength >= 4 && "Strong"}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-bold text-zinc-300 uppercase tracking-wider drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                Confirm Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-accent transition-colors duration-300" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pl-10 pr-10 h-12 bg-zinc-900/60 backdrop-blur-md border-zinc-800/80 text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent transition-all duration-300 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="group w-full h-12 mt-4 bg-accent hover:bg-accent/90 text-background font-semibold text-base transition-all duration-300 shadow-[0_0_15px_rgba(var(--color-accent),0.2)] hover:shadow-[0_0_25px_rgba(var(--color-accent),0.4)]" 
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-5 w-5 opacity-70 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-zinc-400 mt-6 font-semibold drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
            Already have an account?{" "}
            <Link href="/login" className="font-extrabold text-white hover:text-accent transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
