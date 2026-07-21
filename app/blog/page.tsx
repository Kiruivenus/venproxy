import Link from "next/link"
import { blogPosts } from "@/lib/blog-posts"
import { PublicNavBar } from "@/components/public-navbar"
import { BrandLogo } from "@/components/brand-logo"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight, Calendar, User, Clock, ArrowRight } from "lucide-react"
import { JsonLd } from "@/components/json-ld"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Enterprise Proxy Blog: Insights, Guides & Tutorials | Proxiva",
  description: "Read expert articles on residential, mobile, and datacenter proxy servers. Learn about dynamic rotation, scraping strategies, and M-Pesa payments in Kenya.",
  alternates: {
    canonical: "https://www.proxiva.co.ke/blog",
  },
  openGraph: {
    title: "Enterprise Proxy Blog: Insights, Guides & Tutorials | Proxiva",
    description: "Read expert articles on residential, mobile, and datacenter proxy servers. Learn about dynamic rotation, scraping strategies, and M-Pesa payments in Kenya.",
    url: "https://www.proxiva.co.ke/blog",
    type: "website",
  },
}

export default function BlogIndex() {
  const posts = Object.values(blogPosts)

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Proxiva Proxy Resource Blog",
    "description": "Educational articles, guides, and tutorials on proxy servers, web scraping, and automation.",
    "url": "https://www.proxiva.co.ke/blog",
    "publisher": {
      "@type": "Organization",
      "name": "Proxiva",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.proxiva.co.ke/favicon.png"
      }
    }
  }

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20 text-foreground transition-colors duration-300">
      <JsonLd data={webPageSchema} />
      <PublicNavBar mode="landing" />

      <main className="pt-16">
        {/* BREADCRUMB */}
        <div className="bg-slate-50 dark:bg-zinc-950/60 border-b border-border/40 py-3.5">
          <div className="container mx-auto px-4 max-w-6xl">
            <nav className="flex items-center gap-2 text-xs font-semibold text-muted-foreground/80">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground">Blog</span>
            </nav>
          </div>
        </div>

        {/* HERO SECTION */}
        <section className="py-16 text-center border-b border-border/40 bg-radial-gradient">
          <div className="container mx-auto px-4 max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
              Proxiva Insights & Guides
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed font-medium">
              Deep dives into web scraping architecture, proxy rotation technologies, digital marketing security, and localized Kenyan automation guidelines.
            </p>
          </div>
        </section>

        {/* ARTICLES GRID */}
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Card key={post.slug} className="border border-border/40 bg-white dark:bg-zinc-950 rounded-2xl overflow-hidden hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="p-6 pb-2 flex flex-wrap gap-4 text-xs font-semibold text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {post.date}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {post.readTime}</span>
                    </div>
                    <CardHeader className="px-6 py-2">
                      <CardTitle className="text-lg font-bold leading-snug hover:text-primary transition-colors">
                        <Link href={`/blog/${post.slug}`}>{post.h1}</Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 py-2">
                      <p className="text-sm text-muted-foreground/90 font-medium leading-relaxed line-clamp-3">
                        {post.introduction}
                      </p>
                    </CardContent>
                  </div>
                  <div className="p-6 pt-4 border-t border-border/10 bg-slate-50/50 dark:bg-zinc-900/10">
                    <Button variant="link" className="p-0 h-auto font-bold text-sm text-primary hover:text-primary/90 flex items-center gap-1.5" asChild>
                      <Link href={`/blog/${post.slug}`}>
                        Read Article
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
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
