"use client"

import Link from "next/link"
import { CloudLightning } from "lucide-react"
import { useBranding } from "@/lib/use-branding"

interface BrandLogoProps {
  /** Visual style: 'sidebar' = small square icon + name, 'auth' = larger panel logo */
  size?: "sm" | "lg"
  className?: string
}

export function BrandLogo({ size = "sm", className = "" }: BrandLogoProps) {
  const { companyName, companyLogoUrl } = useBranding()

  const iconSize = size === "lg" ? "h-10 w-10" : "h-8 w-8"
  const textSize = size === "lg" ? "text-2xl" : "text-base"

  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 ${className}`}>
      <div className={`flex ${iconSize} items-center justify-center rounded-xl flex-shrink-0 overflow-hidden ${companyLogoUrl ? "bg-transparent" : "bg-blue-600 text-white shadow-sm"}`}>
        {companyLogoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={companyLogoUrl}
            alt={companyName}
            className="h-full w-full object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
          />
        ) : (
          <CloudLightning className={size === "lg" ? "h-6 w-6 stroke-[2]" : "h-4.5 w-4.5 stroke-[2]"} />
        )}
      </div>
      <span className={`${textSize} font-extrabold tracking-tight text-slate-900 dark:text-white font-sans`}>
        {companyName}
      </span>
    </Link>
  )
}
