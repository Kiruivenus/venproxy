"use client"

import Link from "next/link"
import { useState } from "react"
import { CloudLightning } from "lucide-react"
import { useBranding } from "@/lib/use-branding"

interface BrandLogoProps {
  /** Visual style: 'sidebar' = small square icon + name, 'auth' = larger panel logo */
  size?: "sm" | "md" | "lg"
  className?: string
}

export function BrandLogo({ size = "sm", className = "" }: BrandLogoProps) {
  const { companyName, companyLogoUrl } = useBranding()
  const [isWide, setIsWide] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Height and font sizing configurations
  const heightClass = {
    sm: "h-8",
    md: "h-9",
    lg: "h-12",
  }[size]

  const textClass = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl md:text-3xl",
  }[size]

  const iconBoxSize = {
    sm: "h-8 w-8",
    md: "h-9 w-9",
    lg: "h-12 w-12",
  }[size]

  const iconSize = {
    sm: "h-4.5 w-4.5",
    md: "h-5 w-5",
    lg: "h-7 w-7",
  }[size]

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    if (img.naturalWidth && img.naturalHeight) {
      // If aspect ratio is greater than 1.15, consider it wide/rectangular (it contains text/words)
      if (img.naturalWidth / img.naturalHeight > 1.15) {
        setIsWide(true)
      }
    }
  }

  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 ${className}`}>
      {companyLogoUrl && !imageError ? (
        <div className={`flex ${heightClass} items-center justify-center flex-shrink-0`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={companyLogoUrl}
            alt={companyName}
            onLoad={handleImageLoad}
            onError={() => setImageError(true)}
            className={`${heightClass} w-auto max-w-[180px] md:max-w-[220px] object-contain flex-shrink-0 transition-all duration-300`}
          />
        </div>
      ) : (
        <div className={`flex ${iconBoxSize} items-center justify-center rounded-xl flex-shrink-0 bg-blue-600 text-white shadow-sm`}>
          <CloudLightning className={`${iconSize} stroke-[2]`} />
        </div>
      )}

      {/* Only render text if:
          1. There is no custom logo
          2. The custom logo failed to load
          3. The custom logo is NOT wide (meaning it is a square/vertical icon-only logo, so we show the name next to it)
      */}
      {(!companyLogoUrl || imageError || !isWide) && (
        <span className={`${textClass} font-extrabold tracking-tight text-slate-900 dark:text-white font-sans truncate max-w-[180px]`}>
          {companyName || "RayProxy Hub"}
        </span>
      )}
    </Link>
  )
}

