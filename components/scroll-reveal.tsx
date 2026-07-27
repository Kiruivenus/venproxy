"use client"

import React, { useEffect, useRef, useState } from "react"

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  direction?: "up" | "down" | "left" | "right" | "fade"
  delay?: number // delay in milliseconds
  duration?: number // duration in seconds
}

export function ScrollReveal({
  children,
  className = "",
  direction = "up",
  delay = 0,
  duration = 0.6,
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Trigger animation whenever it scrolls into viewport from top or bottom
        setIsVisible(entry.isIntersecting)
      },
      {
        threshold: 0.1, // trigger when 10% of card is visible
        rootMargin: "-20px 0px -20px 0px" // subtle bounds offset to look cleaner
      }
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [])

  // Configure transform paths based on animation direction
  const getDirectionClass = () => {
    switch (direction) {
      case "up":
        return isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
      case "down":
        return isVisible ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0"
      case "left":
        return isVisible ? "translate-x-0 opacity-100" : "translate-x-12 opacity-0"
      case "right":
        return isVisible ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"
      case "fade":
      default:
        return isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
    }
  }

  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${getDirectionClass()} ${className}`}
      style={{
        transitionDuration: `${duration}s`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
