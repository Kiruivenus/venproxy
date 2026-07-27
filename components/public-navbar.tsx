"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { Sun, Moon, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useBranding } from "@/lib/use-branding"
import { BrandLogo } from "@/components/brand-logo"

interface PublicNavBarProps {
  mode?: "landing" | "login" | "register"
}

export function PublicNavBar({ mode = "landing" }: PublicNavBarProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { companyName, companyLogoUrl } = useBranding()

  useEffect(() => setMounted(true), [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/80 backdrop-blur-md border-b border-border/70 flex items-center justify-between px-6 md:px-10">
      {/* Logo */}
      <div className="flex items-center">
        <BrandLogo size="sm" />
      </div>

      {/* Desktop Navigation Links */}
      <div className="hidden md:flex items-center gap-6">
        {mode === "landing" && (
          <>
            <Link
              href="/blog"
              className="text-sm font-semibold text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/docs"
              className="text-sm font-semibold text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Docs
            </Link>
          </>
        )}
      </div>

      {/* Action Buttons and Theme Toggle (Desktop and Mobile) */}
      <div className="flex items-center gap-3">
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-500" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        )}

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {mode === "landing" && (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors px-3 py-1.5"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                Get Started
              </Link>
            </>
          )}

          {mode === "login" && (
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 text-sm font-semibold border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 px-4 py-2 rounded-lg transition-colors"
            >
              Create Account
            </Link>
          )}

          {mode === "register" && (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm font-semibold border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 px-4 py-2 rounded-lg transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Hamburger Menu Toggle Button (Mobile Only) */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 md:hidden rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="sr-only">Toggle Mobile Menu</span>
        </Button>
      </div>

      {/* Mobile Menu Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-background border-b border-border/70 shadow-lg md:hidden flex flex-col p-6 gap-4 z-40 transition-all animate-in fade-in slide-in-from-top-5 duration-200">
          {mode === "landing" && (
            <>
              <Link
                href="/blog"
                className="text-sm font-semibold text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white py-2 border-b border-border/40"
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                href="/docs"
                className="text-sm font-semibold text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white py-2 border-b border-border/40"
                onClick={() => setMobileMenuOpen(false)}
              >
                Docs
              </Link>
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white py-2 border-b border-border/40"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-1.5 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition-colors shadow-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </>
          )}

          {mode === "login" && (
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-1.5 text-sm font-bold border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 py-3 rounded-xl transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Create Account
            </Link>
          )}

          {mode === "register" && (
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-1.5 text-sm font-bold border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 py-3 rounded-xl transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
