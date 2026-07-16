"use client"

import { useEffect, useState } from "react"
import { X, MessageCircle, ArrowRight } from "lucide-react"

interface WhatsappModalProps {
  show?: boolean
  whatsappUrl?: string
}

export function WhatsappModal({ show = false, whatsappUrl = "" }: WhatsappModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!show || !whatsappUrl) return

    // Check localStorage to see if the user previously dismissed the modal
    const dismissed = localStorage.getItem("proxiva_whatsapp_modal_dismissed")
    if (!dismissed) {
      // Delay showing the modal slightly for a smoother entry feel
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [show, whatsappUrl])

  const handleDismiss = () => {
    localStorage.setItem("proxiva_whatsapp_modal_dismissed", "true")
    setIsOpen(false)
  }

  const handleJoin = () => {
    window.open(whatsappUrl, "_blank", "noopener,noreferrer")
    handleDismiss()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-900 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-350">
        
        {/* Top-Right Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-350 transition-colors p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-900 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* WhatsApp Icon Box with green pulsing animation glow */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
          <div className="relative h-16 w-16 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-450">
            <MessageCircle className="h-9 w-9 stroke-[2]" />
          </div>
        </div>

        {/* Text Details */}
        <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
          Join WhatsApp Group
        </h3>
        <p className="text-sm font-semibold text-muted-foreground leading-relaxed mb-6">
          Get real-time proxy status reports, daily operational updates, exclusive promo codes, and faster notifications directly on your phone.
        </p>

        {/* Actions Button Panel */}
        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={handleJoin}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 w-full transition-all cursor-pointer shadow-lg shadow-emerald-600/20 hover:scale-[1.01] active:scale-[0.99]"
          >
            Join WhatsApp Group
            <ArrowRight className="h-4 w-4" />
          </button>
          
          <button
            onClick={handleDismiss}
            className="border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900/50 text-slate-700 dark:text-zinc-300 font-bold h-12 rounded-xl flex items-center justify-center w-full transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
          >
            Maybe Later
          </button>
        </div>

      </div>
    </div>
  )
}
