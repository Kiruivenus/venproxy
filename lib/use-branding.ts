"use client"

import React, { createContext, useContext } from "react"

export interface BrandingData {
  companyName: string
  companyLogoUrl: string
}

const BrandingContext = createContext<BrandingData | null>(null)

export function BrandingProvider({
  initialBranding,
  children,
}: {
  initialBranding: BrandingData
  children: React.ReactNode
}) {
  return React.createElement(BrandingContext.Provider, { value: initialBranding }, children)
}

export function useBranding(): BrandingData {
  const context = useContext(BrandingContext)
  if (!context) {
    // Ultimate safety fallback if context is completely missing
    return { companyName: "", companyLogoUrl: "" }
  }
  return context
}
