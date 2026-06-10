import { getSession } from "@/lib/auth"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Globe, Shield, Zap, Clock, CreditCard, Server, Star, Quote, ArrowRight, CheckCircle2, Phone, UserPlus, Lock } from "lucide-react"
import Link from "next/link"

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
    review: "Been using RayProxy Hub for 3 months now. Never had any downtime. Highly recommended!",
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

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-accent/30">
      <Header
        user={session?.user ? { email: session.user.email, name: session.user.name, role: session.user.role } : null}
      />

      <main>
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-32 pb-24 md:pt-48 md:pb-32 border-b border-border/40">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] bg-accent/15 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px]" />
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay" />
          </div>

          <div className="container relative z-10 mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              Now supporting M-Pesa integration
            </div>
            
            <h1 className="text-balance text-5xl md:text-7xl font-extrabold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
              Premium Proxies <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-emerald-400">
                Instant Access
              </span>
            </h1>
            
            <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
              Scale your data extraction with high-quality proxies from multiple countries. Pay securely with M-Pesa and get instant access to your infrastructure.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg group bg-accent hover:bg-accent/90 text-background font-semibold shadow-[0_0_20px_rgba(var(--color-accent),0.3)] hover:shadow-[0_0_30px_rgba(var(--color-accent),0.5)] transition-all duration-300 rounded-xl" asChild>
                <Link href="/buy">
                  Buy Proxies Now
                  <ArrowRight className="ml-2 h-5 w-5 opacity-70 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg bg-background/50 backdrop-blur-sm border-border/60 hover:bg-muted/50 transition-all duration-300 rounded-xl" asChild>
                <Link href="/register">Create Account</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* TRUST BAR */}
        <section className="py-8 border-b border-border/40 bg-zinc-950/30">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">
              Trusted by thousands of users across Kenya
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Placeholder Trust Logos - replace with real ones if needed */}
              <div className="flex items-center gap-2 font-bold text-xl"><Shield className="h-6 w-6" /> SecureNet</div>
              <div className="flex items-center gap-2 font-bold text-xl"><Globe className="h-6 w-6" /> DataScrape</div>
              <div className="flex items-center gap-2 font-bold text-xl"><Server className="h-6 w-6" /> InfraScale</div>
              <div className="flex items-center gap-2 font-bold text-xl"><Zap className="h-6 w-6" /> SpeedProxy</div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="py-24 relative">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">Why Choose RayProxy Hub?</h2>
              <p className="text-lg text-muted-foreground">
                Built for performance, reliability, and ease of use.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Globe, title: "Multiple Countries", desc: "Access premium residential and datacenter IPs from diverse locations." },
                { icon: Zap, title: "Instant Delivery", desc: "Your proxies are active immediately after successful payment confirmation." },
                { icon: Phone, title: "M-Pesa Payment", desc: "Seamless and secure local payments via automated M-Pesa STK Push." },
                { icon: Clock, title: "Flexible Duration", desc: "Choose from daily, weekly, or monthly plans that fit your project scale." },
                { icon: Lock, title: "Secure & Private", desc: "Military-grade encryption ensures your proxy credentials stay private." },
                { icon: Server, title: "99.9% Uptime", desc: "Highly available infrastructure built to handle your heaviest workloads." },
              ].map((feature, idx) => (
                <Card key={idx} className="group relative overflow-hidden bg-zinc-950/40 border-border/40 backdrop-blur-md hover:bg-zinc-900/60 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-accent/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-accent/20 transition-all duration-300">
                      <feature.icon className="h-6 w-6 text-accent" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base mt-2">{feature.desc}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-24 bg-zinc-950/30 border-y border-border/40 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-accent/5 rounded-[100%] blur-[100px] pointer-events-none" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">How It Works</h2>
              <p className="text-lg text-muted-foreground">Start using your proxies in three simple steps.</p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4 lg:gap-12 relative max-w-5xl mx-auto">
              <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-border to-transparent z-0" />
              
              <div className="relative z-10 flex flex-col items-center text-center max-w-[280px]">
                <div className="h-24 w-24 rounded-2xl bg-zinc-900 border border-border/50 flex items-center justify-center mb-6 shadow-xl relative group">
                  <div className="absolute inset-0 bg-accent/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <UserPlus className="h-10 w-10 text-muted-foreground group-hover:text-accent transition-colors" />
                  <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-accent text-background font-bold flex items-center justify-center shadow-lg border-2 border-background">1</div>
                </div>
                <h3 className="text-xl font-bold mb-2">Create Account</h3>
                <p className="text-muted-foreground">Sign up in seconds and access our intuitive dashboard.</p>
              </div>

              <div className="relative z-10 flex flex-col items-center text-center max-w-[280px]">
                <div className="h-24 w-24 rounded-2xl bg-zinc-900 border border-border/50 flex items-center justify-center mb-6 shadow-xl relative group">
                  <div className="absolute inset-0 bg-accent/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CreditCard className="h-10 w-10 text-muted-foreground group-hover:text-accent transition-colors" />
                  <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-accent text-background font-bold flex items-center justify-center shadow-lg border-2 border-background">2</div>
                </div>
                <h3 className="text-xl font-bold mb-2">Pay via M-Pesa</h3>
                <p className="text-muted-foreground">Select your plan and complete payment securely via your phone.</p>
              </div>

              <div className="relative z-10 flex flex-col items-center text-center max-w-[280px]">
                <div className="h-24 w-24 rounded-2xl bg-zinc-900 border border-border/50 flex items-center justify-center mb-6 shadow-xl relative group">
                  <div className="absolute inset-0 bg-accent/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CheckCircle2 className="h-10 w-10 text-muted-foreground group-hover:text-accent transition-colors" />
                  <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-accent text-background font-bold flex items-center justify-center shadow-lg border-2 border-background">3</div>
                </div>
                <h3 className="text-xl font-bold mb-2">Get Proxies</h3>
                <p className="text-muted-foreground">Credentials are delivered instantly to your dashboard and email.</p>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Trusted by Thousands</h2>
              <p className="text-lg text-muted-foreground">See what developers and businesses are saying about RayProxy Hub.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {customerReviews.map((review, index) => (
                <Card key={index} className="relative bg-zinc-950/40 border-border/40 backdrop-blur-sm transition-all hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-1 duration-300">
                  <CardHeader className="p-6">
                    <Quote className="absolute right-6 top-6 h-10 w-10 text-accent/10" />
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/20 text-accent font-bold">
                        {review.avatar}
                      </div>
                      <div>
                        <CardTitle className="text-base text-foreground/90">{review.name}</CardTitle>
                        <CardDescription className="text-sm">{review.location}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-1 mb-4">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                      ))}
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground/90">"{review.review}"</p>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-24 relative overflow-hidden border-t border-border/40">
          <div className="absolute inset-0 bg-accent/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] bg-accent/20 rounded-full blur-[150px] pointer-events-none" />
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-foreground">Ready to Get Started?</h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Create an account and purchase your first high-performance proxy in minutes.
            </p>
            <Button size="lg" className="h-14 px-10 text-lg group bg-accent hover:bg-accent/90 text-background font-semibold shadow-[0_0_30px_rgba(var(--color-accent),0.4)] hover:shadow-[0_0_45px_rgba(var(--color-accent),0.6)] transition-all duration-300 rounded-xl" asChild>
              <Link href="/buy">
                Browse Proxies
                <ArrowRight className="ml-2 h-5 w-5 opacity-70 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border/40 bg-zinc-950 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-border/40 p-0.5 overflow-hidden">
                  <img src="/logo.png" alt="RayProxy" className="h-[145%] w-auto max-w-none object-contain -translate-y-[8%]" />
                </div>
                <span className="text-xl font-bold tracking-tight">RayProxy Hub</span>
              </Link>
              <p className="text-muted-foreground max-w-sm leading-relaxed">
                Premium proxy infrastructure for modern teams. Reliable, secure, and delivered instantly.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Platform</h3>
              <ul className="space-y-3">
                <li><Link href="/" className="text-muted-foreground hover:text-accent transition-colors">Home</Link></li>
                <li><Link href="/buy" className="text-muted-foreground hover:text-accent transition-colors">Buy Proxies</Link></li>
                <li><Link href="/login" className="text-muted-foreground hover:text-accent transition-colors">Dashboard</Link></li>
                <li><Link href="/docs" className="text-muted-foreground hover:text-accent transition-colors">Documentation</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><Link href="#" className="text-muted-foreground hover:text-accent transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-accent transition-colors">Privacy Policy</Link></li>
                <li><Link href="/support" className="text-muted-foreground hover:text-accent transition-colors">Support Contact</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} RayProxy Hub. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex h-2 w-2 rounded-full bg-accent"></span>
              Systems Operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
