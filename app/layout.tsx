import type React from "react"
import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { getPlatformSettings } from "@/app/admin/platform-actions"
import "./globals.css"

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPlatformSettings()
  const name = settings.companyName || "RayProxy Hub"
  const logoUrl = settings.companyLogoUrl

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
      default: `${name} | Premium Residential Proxies Kenya`,
      template: `%s | ${name}`,
    },
    description:
      "Get high-performance residential proxies instantly. Secure M-Pesa payments, 99.9% uptime, and global coverage. The #1 proxy service in Kenya.",
    keywords: [
      "Residential Proxies Kenya",
      "M-Pesa Proxy Payment",
      "Buy Proxies Kenya",
      name,
      "Anonymous Browsing",
      "Data Scraping Proxies",
      "Cheap Proxies Kenya",
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
      process.env.NEXT_PUBLIC_APP_URL || "https://rayproxy.com"
    ),
    alternates: { canonical: "/" },
    openGraph: {
      title: `${name} | Premium Residential Proxies`,
      description:
        "Purchase premium proxies instantly with M-Pesa. Global coverage and high-speed residential IPs.",
      url: "/",
      siteName: name,
      images: [
        {
          url: logoUrl || "/og-image.png",
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
      title: `${name} | Premium Residential Proxies`,
      description:
        "Instant proxy delivery with M-Pesa. Premium residential IPs for secure browsing.",
      images: [logoUrl || "/og-image.png"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plusJakartaSans.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
