import type React from "react"
import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { getPlatformSettings } from "@/app/admin/platform-actions"
import { BrandingProvider } from "@/lib/use-branding"
import "./globals.css"

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPlatformSettings()
  const name = settings.companyName || "Proxiva"
  const logoUrl = settings.companyLogoUrl
  const ogImageUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://www.proxiva.co.ke"}/og-image.png`

  const icons: Metadata["icons"] = logoUrl
    ? {
        icon: [{ url: logoUrl }, { url: logoUrl, type: "image/png" }],
        shortcut: logoUrl,
        apple: logoUrl,
      }
    : {
        icon: [
          { url: "/favicon.png" },
          { url: "/icon.png", type: "image/png" },
        ],
        shortcut: "/favicon.png",
        apple: "/apple-touch-icon.png",
      }

  return {
    title: {
      default: `${name} | Buy Premium Proxies & Residential Proxies Kenya`,
      template: `%s | ${name}`,
    },
    description:
      "Proxiva is the #1 provider of high-speed premium residential proxies in Kenya. Buy secure HTTP/Socks5 proxies instantly using M-Pesa. Uptime guaranteed, 99.9% success rate, anonymous browsing, and web scraping support.",
    keywords: [
      "proxiva",
      "proxiva proxy",
      "proxiva.co.ke",
      "proxiva co ke",
      "proxiva.co",
      "proxy",
      "proxies",
      "proxy purchase",
      "buy proxies",
      "buy proxies kenya",
      "buy proxy",
      "residential proxies",
      "residential proxies kenya",
      "residential proxy",
      "best proxies",
      "cheap proxies",
      "cheap proxy",
      "mpesa proxies",
      "mpesa proxy",
      "buy proxies with mpesa",
      "kenyan proxies",
      "private proxies",
      "socks5 proxy kenya",
      "http proxy kenya",
      "anonymous proxy",
      "web scraping proxy",
      "secure proxy",
      "rayproxy",
      "rayproxy hub",
      "iproyal",
      "strong proxy",
      "best proxy",
      "socks5 proxy",
      "residential proxy network",
      "buy proxies online",
      "residential proxies for scraping",
      "best proxies kenya",
      "socks5 proxies kenya",
      "http proxies kenya",
      name
    ],
    authors: [{ name: `${name} Team` }],
    creator: name,
    publisher: name,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_APP_URL || "https://www.proxiva.co.ke"
    ),
    alternates: { canonical: "/" },
    openGraph: {
      title: `${name} | Premium Residential Proxies & Proxy Purchase`,
      description:
        "Buy premium proxies instantly with M-Pesa. Proxiva offers high-speed anonymous residential, mobile, and datacenter IPs with 99.9% uptime.",
      url: "https://www.proxiva.co.ke",
      siteName: name,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${name} Premium Proxies`,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} | Premium Residential Proxies & Proxy Purchase`,
      description:
        "Proxiva offers high-speed anonymous residential, mobile, and datacenter IPs in Kenya. Buy proxies instantly with M-Pesa.",
      images: [ogImageUrl],
    },
    icons,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  }
}

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const settings = await getPlatformSettings()
  const branding = {
    companyName: settings.companyName || "Proxiva",
    companyLogoUrl: settings.companyLogoUrl || "",
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plusJakartaSans.variable} font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <BrandingProvider initialBranding={branding}>
            {children}
            <Toaster />
            <Analytics />
          </BrandingProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
