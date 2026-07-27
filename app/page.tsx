import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PublicNavBar } from "@/components/public-navbar"
import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Globe, Shield, Zap, Clock, CreditCard, Server, Star, Quote, ArrowRight, CheckCircle2, Phone, UserPlus, Lock } from "lucide-react"
import Link from "next/link"
import { ScrollReveal } from "@/components/scroll-reveal"

const customerReviews = [
  {
    name: "James Mwangi",
    location: "Nairobi, Kenya",
    rating: 5,
    review: "Excellent service! Got my proxies instantly after M-Pesa payment. Very reliable and fast.",
    avatar: "JM",
  },
  {
    name: "Sarah Ochieng",
    location: "Kisumu, Kenya",
    rating: 5,
    review: "Best proxy service I've used. The dashboard is easy to navigate and proxies work perfectly.",
    avatar: "SO",
  },
  {
    name: "David Kimani",
    location: "Mombasa, Kenya",
    rating: 5,
    review: "Been using Proxiva for 3 months now. Never had any downtime. Highly recommended!",
    avatar: "DK",
  },
  {
    name: "Grace Wanjiku",
    location: "Nakuru, Kenya",
    rating: 5,
    review: "The M-Pesa integration is seamless. I can buy proxies anytime without any hassle.",
    avatar: "GW",
  },
  {
    name: "Peter Otieno",
    location: "Eldoret, Kenya",
    rating: 5,
    review: "Great customer experience. Proxies are fast and the prices are very competitive.",
    avatar: "PO",
  },
  {
    name: "Mary Akinyi",
    location: "Thika, Kenya",
    rating: 5,
    review: "I love how I can track my active and expired proxies easily. Very organized service.",
    avatar: "MA",
  },
]

export default async function HomePage() {
  const session = await getSession()

  // Auto-redirect logged-in users straight to their dashboard
  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20 text-foreground transition-colors duration-300">
      <PublicNavBar mode="landing" />

      <main>
        {/* HERO SECTION WITH BACKGROUND PHOTO */}
        <section className="relative overflow-hidden pt-32 pb-24 md:pt-44 md:pb-36 border-b border-border/40 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/hero-bg.png')" }}>
          {/* Semi-transparent dark overlay to make background image highly visible while keeping text legible */}
          <div className="absolute inset-0 bg-slate-950/50 z-0" />

          <div className="container relative z-10 mx-auto px-4 text-center max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-8 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
              </span>
              Now supporting automated M-Pesa integration
            </div>
            
            <h1 className="text-balance text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.15] text-white">
              Premium Proxies. <br />
              <span className="text-blue-400">
                Instant Access.
              </span>
            </h1>
            
            <p className="mx-auto max-w-2xl text-base md:text-lg text-slate-300 mb-10 leading-relaxed font-medium">
              Power your data operations. Pay securely with M-Pesa, activate instantly. Trusted across Kenya for speed and absolute privacy.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-sm bg-primary hover:bg-primary/95 text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all duration-200" asChild>
                <Link href="/buy">
                  Explore Plans
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-sm bg-slate-900/40 hover:bg-slate-800/60 text-white border-white/20 hover:border-white/40 backdrop-blur-xs rounded-xl transition-all duration-200" asChild>
                <Link href="/docs">Docs & Support</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* FEATURES BENTO GRID */}
        <section className="py-24 relative bg-slate-50/50 dark:bg-transparent">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white">Why Choose Proxiva?</h2>
              <p className="text-base text-muted-foreground font-medium">
                Pristine, secure infrastructure engineered for data scapers and modern developers.
              </p>
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
              {/* Card 1: Multiple Countries */}
              <ScrollReveal className="md:col-span-2" delay={0} direction="up">
                <Card className="h-full bg-card border-border/50 rounded-2xl p-6 shadow-sm flex flex-col justify-between group hover:border-primary/45 transition-all duration-300">
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
                    <div className="lg:col-span-3 space-y-4">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                        <Globe className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Multiple Countries</CardTitle>
                      <CardDescription className="text-sm font-medium leading-relaxed">
                        Access premium residential and datacenter IPs from diverse locations worldwide. Bypass geo-blocking constraints seamlessly and scrape from anywhere.
                      </CardDescription>
                      <div className="pt-2 flex flex-wrap gap-2 opacity-80">
                        {["🇺🇸 USA", "🇬🇧 UK", "🇩🇪 Germany", "🇰🇪 Kenya", "🇿🇦 South Africa", "🇮🇳 India"].map((c, i) => (
                          <span key={i} className="text-xs bg-muted px-2.5 py-1 rounded-full font-semibold">{c}</span>
                        ))}
                      </div>
                    </div>
                    {/* Generated Global Map Graphic (Borderless & transparent background container) */}
                    <div className="lg:col-span-2 flex justify-center items-center">
                      <div className="relative w-full max-w-[200px] aspect-square p-0 flex items-center justify-center overflow-hidden">
                        <img 
                          src="/feature-countries.png" 
                          alt="Global connected proxy nodes map illustration" 
                          className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition-transform duration-500" 
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </ScrollReveal>

              {/* Card 2: Instant Delivery */}
              <ScrollReveal delay={100} direction="up">
                <Card className="h-full bg-card border-border/50 rounded-2xl p-6 shadow-sm flex flex-col justify-between group hover:border-primary/45 transition-all duration-300">
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg font-bold text-slate-900 dark:text-white mb-2">Instant Delivery</CardTitle>
                      <CardDescription className="text-sm font-medium leading-relaxed">
                        No support queues or validation lag. Your proxy endpoints are provisioned immediately after checkout.
                      </CardDescription>
                    </div>

                    {/* Generated Instant Delivery Graphic (Borderless & transparent background container) */}
                    <div className="relative w-full aspect-video p-0 flex items-center justify-center overflow-hidden mt-4">
                      <img 
                        src="/feature-instant.png" 
                        alt="Instant automated setup speed stream illustration" 
                        className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </Card>
              </ScrollReveal>

              {/* Card 3: M-Pesa Checkout Card */}
              <ScrollReveal className="md:row-span-2" delay={0} direction="up">
                <Card className="h-full bg-card border-border/50 rounded-2xl p-6 shadow-sm flex flex-col justify-between group hover:border-primary/45 transition-all duration-300">
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="h-10 w-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                        <Phone className="h-5 w-5 text-emerald-600 dark:text-emerald-450" />
                      </div>
                      <CardTitle className="text-lg font-bold text-slate-900 dark:text-white mb-2">M-Pesa Checkout</CardTitle>
                      <CardDescription className="text-sm font-medium leading-relaxed">
                        Seamless automated STK Push. Enter your active phone number, receive a pin prompt on your device, and get credited in real-time.
                      </CardDescription>
                    </div>

                    {/* Generated M-Pesa Checkout Graphic (Borderless & transparent background container) */}
                    <div className="relative w-full aspect-video p-0 flex items-center justify-center overflow-hidden mt-4">
                      <img 
                        src="/feature-mpesa.png" 
                        alt="Automated M-Pesa checkout STK push illustration" 
                        className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </Card>
              </ScrollReveal>

              {/* Card 4: Flexible Duration */}
              <ScrollReveal delay={100} direction="up">
                <Card className="h-full bg-card border-border/50 rounded-2xl p-6 shadow-sm flex flex-col justify-between group hover:border-primary/45 transition-all duration-300">
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg font-bold text-slate-900 dark:text-white mb-2">Flexible Duration</CardTitle>
                      <CardDescription className="text-sm font-medium leading-relaxed">
                        Choose from daily, weekly, or monthly subscription plans tailored exactly to your runtime constraints.
                      </CardDescription>
                    </div>

                    {/* Generated Plan Duration Graphic (Borderless & transparent background container) */}
                    <div className="relative w-full aspect-video p-0 flex items-center justify-center overflow-hidden mt-4">
                      <img 
                        src="/feature-duration.png" 
                        alt="Flexible daily, weekly, monthly schedules plan illustration" 
                        className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </Card>
              </ScrollReveal>

              {/* Card 5: Secure & Private */}
              <ScrollReveal delay={200} direction="up">
                <Card className="h-full bg-card border-border/50 rounded-2xl p-6 shadow-sm flex flex-col justify-between group hover:border-primary/45 transition-all duration-300">
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                        <Lock className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg font-bold text-slate-900 dark:text-white mb-2">Secure & Private</CardTitle>
                      <CardDescription className="text-sm font-medium leading-relaxed">
                        High-level server configurations ensure your proxy endpoints and traffic requests stay private.
                      </CardDescription>
                    </div>

                    {/* Generated Encryption Shield Graphic (Borderless & transparent background container) */}
                    <div className="relative w-full aspect-video p-0 flex items-center justify-center overflow-hidden mt-4">
                      <img 
                        src="/feature-secure.png" 
                        alt="Secure AES encryption shield lock illustration" 
                        className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </Card>
              </ScrollReveal>

              {/* Card 6: 99.9% Uptime */}
              <ScrollReveal className="md:col-span-2" delay={100} direction="up">
                <Card className="h-full bg-card border-border/50 rounded-2xl p-6 shadow-sm flex flex-col justify-between group hover:border-primary/45 transition-all duration-300">
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center w-full">
                    <div className="lg:col-span-3 space-y-4">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                        <Server className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">99.9% Infrastructure Uptime</CardTitle>
                      <CardDescription className="text-sm font-medium leading-relaxed">
                        Hosted on redundant cloud architectures built to withstand large concurrency peaks and high request rates without packet loss.
                      </CardDescription>
                    </div>
                    {/* Generated Server Uptime Graphic (Borderless & transparent background container) */}
                    <div className="lg:col-span-2 flex justify-center items-center">
                      <div className="relative w-full max-w-[200px] aspect-square p-0 flex items-center justify-center overflow-hidden">
                        <img 
                          src="/feature-uptime.png" 
                          alt="99.9% uptime server cloud database illustration" 
                          className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-24 border-y border-border/40 bg-zinc-950/30">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">How It Works</h2>
              <p className="text-base text-muted-foreground font-medium">Provision proxies instantly in three straightforward steps.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 relative">
              <ScrollReveal delay={0} direction="up">
                <div className="flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-2xl bg-card border border-border/50 flex items-center justify-center mb-6 shadow-sm relative group">
                    <UserPlus className="h-7 w-7 text-primary" />
                    <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center border-2 border-background">1</div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Create Account</h3>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">Sign up in seconds to access the main client workspace panel.</p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={150} direction="up">
                <div className="flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-2xl bg-card border border-border/50 flex items-center justify-center mb-6 shadow-sm relative group">
                    <CreditCard className="h-7 w-7 text-primary" />
                    <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center border-2 border-background">2</div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Pay via M-Pesa</h3>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">Trigger an STK push payment via your local Safaricom phone line.</p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={300} direction="up">
                <div className="flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-2xl bg-card border border-border/50 flex items-center justify-center mb-6 shadow-sm relative group">
                    <CheckCircle2 className="h-7 w-7 text-primary" />
                    <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center border-2 border-background">3</div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Get Proxies</h3>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">Access credentials immediately from the billing log dashboard.</p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <section className="py-24">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">Trusted by Thousands</h2>
              <p className="text-base text-muted-foreground font-medium">See why local businesses and scraping teams rely on Proxiva.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {customerReviews.map((review, index) => (
                <ScrollReveal key={index} delay={index * 100} direction="up">
                  <Card className="h-full relative bg-card border-border/50 p-6 rounded-2xl shadow-sm hover:border-primary/45 transition-all duration-300">
                    <Quote className="absolute right-6 top-6 h-8 w-8 text-primary/10" />
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-bold text-sm shadow-inner">
                        {review.avatar}
                      </div>
                      <div>
                        <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">{review.name}</CardTitle>
                        <CardDescription className="text-xs font-semibold">{review.location}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-0.5 mb-4">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-muted-foreground/90">"{review.review}"</p>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-20 relative overflow-hidden border-t border-border/40 bg-zinc-950/20">
          <div className="container mx-auto px-4 text-center relative z-10 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">Ready to Get Started?</h2>
            <p className="text-base text-muted-foreground font-medium mb-8">
              Create an account and purchase your first high-performance residential proxy package in minutes.
            </p>
            <Button size="lg" className="h-12 px-8 text-sm bg-primary hover:bg-primary/95 text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform" asChild>
              <Link href="/buy">
                Browse Proxies
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
