import { notFound } from "next/navigation"
import Link from "next/link"
import { landingPagesData } from "@/lib/landing-pages-data"
import { PublicNavBar } from "@/components/public-navbar"
import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowRight, CheckCircle2, ChevronRight, Shield, Globe, Zap, Clock } from "lucide-react"
import { JsonLd } from "@/components/json-ld"
import { Metadata } from "next"

interface PageProps {
  params: Promise<{ "product-slug": string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { "product-slug": productSlug } = await params
  const data = landingPagesData[productSlug]
  if (!data) return {}

  const canonicalUrl = `https://www.proxiva.co.ke/${productSlug}`

  return {
    title: data.title,
    description: data.description,
    keywords: data.keywords.join(", "),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: data.title,
      description: data.description,
      url: canonicalUrl,
      images: [
        {
          url: "https://www.proxiva.co.ke/og-image.png",
          width: 1200,
          height: 630,
          alt: data.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: data.description,
      images: ["https://www.proxiva.co.ke/og-image.png"],
    },
  }
}

export async function generateStaticParams() {
  return Object.keys(landingPagesData).map(slug => ({
    "product-slug": slug,
  }))
}

export default async function LandingPage({ params }: PageProps) {
  const { "product-slug": productSlug } = await params
  const data = landingPagesData[productSlug]
  if (!data) notFound()

  // Generate dynamic schemas
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.proxiva.co.ke"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Proxies",
        "item": `https://www.proxiva.co.ke/${data.slug}`
      }
    ]
  }

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": data.h1,
    "description": data.description,
    "image": "https://www.proxiva.co.ke/og-image.png",
    "offers": {
      "@type": "Offer",
      "price": data.startingPrice.replace("$", ""),
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": `https://www.proxiva.co.ke/${data.slug}`
    }
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": data.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20 text-foreground transition-colors duration-300">
      <JsonLd data={[breadcrumbSchema, productSchema, faqSchema]} />
      <PublicNavBar mode="landing" />

      <main className="pt-16">
        {/* BREADCRUMB */}
        <div className="bg-slate-50 dark:bg-zinc-950/60 border-b border-border/40 py-3.5">
          <div className="container mx-auto px-4 max-w-6xl">
            <nav className="flex items-center gap-2 text-xs font-semibold text-muted-foreground/80">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground">{data.h1}</span>
            </nav>
          </div>
        </div>

        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 border-b border-border/40 bg-radial-gradient">
          <div className="container relative z-10 mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  Enterprise Proxy Solutions
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-slate-900 dark:text-white">
                  {data.h1}
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                  {data.heroDescription}
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                  <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-sm bg-primary hover:bg-primary/95 text-white font-bold rounded-xl shadow-lg shadow-primary/20" asChild>
                    <Link href="/buy">
                      Explore Plans
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-sm font-bold rounded-xl" asChild>
                    <Link href="/register">
                      Create Account
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Pricing teaser card */}
              <div className="lg:col-span-5">
                <Card className="border border-border/40 shadow-xl bg-white dark:bg-zinc-950/60 p-6 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px]" />
                  <CardHeader className="p-0 pb-4">
                    <CardTitle className="text-xl font-extrabold text-slate-900 dark:text-white">Proxy Plan Pricing</CardTitle>
                    <p className="text-xs text-muted-foreground font-semibold mt-1">Starting from just {data.startingPrice}</p>
                  </CardHeader>
                  <CardContent className="p-0 space-y-6">
                    <p className="text-sm text-muted-foreground/90 font-medium leading-relaxed">
                      {data.pricingIntro}
                    </p>
                    <div className="space-y-3">
                      {data.features.slice(0, 4).map((feature, i) => (
                        <div key={i} className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 dark:text-zinc-300">
                          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full h-11 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-bold rounded-xl" asChild>
                      <Link href="/buy">
                        Buy with M-Pesa
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* DETAILED CONTENT SECTION */}
        <section className="py-20 bg-slate-50/50 dark:bg-zinc-900/10">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-12 text-center">
              Why Choose Our {data.h1}?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {data.benefits.map((benefit, i) => (
                <Card key={i} className="border border-border/40 bg-white dark:bg-zinc-950 p-6 rounded-2xl hover:shadow-md transition-shadow">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                    {i === 0 ? <Globe className="h-5.5 w-5.5" /> : i === 1 ? <Shield className="h-5.5 w-5.5" /> : <Zap className="h-5.5 w-5.5" />}
                  </div>
                  <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-3">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground/90 font-medium leading-relaxed">{benefit.text}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQS SECTION */}
        <section className="py-20 border-t border-border/40">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2 text-center">Frequently Asked Questions</h2>
            <p className="text-sm text-muted-foreground text-center font-medium mb-12">Learn more about our {data.h1} plans and M-Pesa integration.</p>

            <Accordion type="single" collapsible className="w-full space-y-4">
              {data.faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border border-border/40 rounded-xl px-2.5 bg-white dark:bg-zinc-950">
                  <AccordionTrigger className="text-sm font-bold text-slate-950 dark:text-white hover:no-underline py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground font-medium leading-relaxed pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* FINAL CTA SECTION */}
        <section className="py-20 border-t border-border/40 bg-zinc-950/20">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">Start Scraping with High-Speed IPs</h2>
            <p className="text-base text-muted-foreground font-medium mb-8">
              Access Proxiva's premium {data.h1} instantly. Buy with M-Pesa STK Push. Uptime guaranteed.
            </p>
            <Button size="lg" className="h-12 px-8 text-sm bg-primary hover:bg-primary/95 text-white font-bold rounded-xl shadow-lg shadow-primary/20" asChild>
              <Link href="/buy">
                Purchase Proxy Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border/40 bg-slate-100 dark:bg-zinc-950 py-16 text-muted-foreground">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <BrandLogo size="sm" className="mb-6 text-foreground font-bold" />
              <p className="text-sm font-medium leading-relaxed max-w-xs">
                Premium proxy infrastructure for modern teams. Reliable, secure, and delivered instantly.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground mb-4 uppercase tracking-wider">Platform</h3>
              <ul className="space-y-3 text-sm font-medium">
                <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
                <li><Link href="/buy" className="hover:text-primary transition-colors">Buy Proxies</Link></li>
                <li><Link href="/login" className="hover:text-primary transition-colors">Dashboard</Link></li>
                <li><Link href="/docs" className="hover:text-primary transition-colors">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground mb-4 uppercase tracking-wider">Legal</h3>
              <ul className="space-y-3 text-sm font-medium">
                <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/support" className="hover:text-primary transition-colors">Support Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold">
            <p>&copy; {new Date().getFullYear()} Proxiva. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
              Systems Operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
