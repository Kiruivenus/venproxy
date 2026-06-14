"use client"

import { useState, useEffect } from "react"

export interface BrandingData {
  companyName: string
  companyLogoUrl: string
}

const DEFAULT: BrandingData = { companyName: "RayProxy Hub", companyLogoUrl: "" }

/**
 * Fetches branding from /api/branding once on mount.
 * Returns immediately with defaults so UI never flashes blank.
 */
export function useBranding(): BrandingData {
  const [branding, setBranding] = useState<BrandingData>(DEFAULT)

  useEffect(() => {
    fetch("/api/branding")
      .then((res) => res.json())
      .then((data: BrandingData) => {
        if (data.companyName) setBranding(data)
      })
      .catch(() => {})
  }, [])

  return branding
}
