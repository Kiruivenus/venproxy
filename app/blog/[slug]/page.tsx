import { notFound } from "next/navigation"
import Link from "next/link"
import { blogPosts } from "@/lib/blog-posts"
import { PublicNavBar } from "@/components/public-navbar"
import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ChevronRight, Calendar, User, Clock, ArrowLeft, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react"
import { JsonLd } from "@/components/json-ld"
import { Metadata } from "next"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = blogPosts[slug]
  if (!post) return {}

  const canonicalUrl = `https://www.proxiva.co.ke/blog/${slug}`

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: post.title,
      description: post.description,
      url: canonicalUrl,
      images: [
        {
          url: "https://www.proxiva.co.ke/og-image.png",
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      type: "article",
      publishedTime: new Date(post.date).toISOString(),
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: ["https://www.proxiva.co.ke/og-image.png"],
    },
  }
}

export async function generateStaticParams() {
  return Object.keys(blogPosts).map(slug => ({
    slug: slug,
  }))
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = blogPosts[slug]
  if (!post) notFound()

  // Generate dynamic schemas
  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.h1,
    "description": post.description,
    "image": "https://www.proxiva.co.ke/og-image.png",
    "datePublished": new Date(post.date).toISOString(),
    "author": {
      "@type": "Organization",
      "name": "Proxiva"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Proxiva",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.proxiva.co.ke/favicon.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.proxiva.co.ke/blog/${post.slug}`
    }
  }

  // Schema for FAQ inside the article
  const faqSchema = post.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": post.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null

  // Fetch 2 random other posts for internal linking recommendations
  const otherPosts = Object.values(blogPosts)
    .filter(p => p.slug !== post.slug)
    .slice(0, 2)

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20 text-foreground transition-colors duration-300">
      <JsonLd data={faqSchema ? [blogPostingSchema, faqSchema] : blogPostingSchema} />
      <PublicNavBar mode="landing" />

      <main className="pt-16">
        {/* BREADCRUMB */}
        <div className="bg-slate-50 dark:bg-zinc-950/60 border-b border-border/40 py-3.5">
          <div className="container mx-auto px-4 max-w-4xl">
            <nav className="flex items-center gap-2 text-xs font-semibold text-muted-foreground/80">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground truncate max-w-xs">{post.h1}</span>
            </nav>
          </div>
        </div>

        {/* ARTICLE HEADER */}
        <article className="py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="space-y-6 mb-10 border-b border-border/40 pb-10">
              <Button variant="ghost" className="p-0 hover:bg-transparent font-bold text-xs text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors" asChild>
                <Link href="/blog">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Blog
                </Link>
              </Button>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-slate-900 dark:text-white">
                {post.h1}
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed font-medium italic">
                "{post.introduction}"
              </p>
              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-semibold text-muted-foreground">
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {post.date}</span>
                <span className="flex items-center gap-1.5"><User className="h-4 w-4" /> {post.author}</span>
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {post.readTime}</span>
              </div>
            </div>

            {/* ARTICLE CONTENT */}
            <div 
              className="prose prose-slate dark:prose-invert max-w-none text-sm md:text-base leading-relaxed text-slate-800 dark:text-zinc-300 font-medium space-y-6"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* FAQS SECTION */}
            {post.faqs.length > 0 && (
              <div className="mt-16 pt-10 border-t border-border/40 space-y-6">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="h-5.5 w-5.5 text-primary" />
                  Article FAQs
                </h3>
                <div className="space-y-4">
                  {post.faqs.map((faq, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-zinc-950 border border-border/40 rounded-xl p-5">
                      <h4 className="text-sm font-bold text-slate-950 dark:text-white mb-2">{faq.question}</h4>
                      <p className="text-sm text-muted-foreground font-medium leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* INTERNAL LINKING BOX (CTA to Proxies) */}
            <Card className="mt-16 border border-primary/20 bg-primary/5 dark:bg-primary/10 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Need Premium Proxies?
                </h3>
                <p className="text-xs text-muted-foreground font-medium max-w-md">
                  Proxiva offers dynamic residential, mobile carrier and static ISP proxies with instant delivery and secure M-Pesa automated billing.
                </p>
              </div>
              <Button className="bg-primary hover:bg-primary/95 text-white font-bold h-10 px-6 rounded-xl text-xs flex-shrink-0 shadow-lg shadow-primary/20" asChild>
                <Link href="/buy">
                  Buy Proxies with M-Pesa
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </Card>

            {/* RECOMMENDATIONS */}
            <div className="mt-20 pt-10 border-t border-border/40">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-8">Related Articles</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {otherPosts.map((other) => (
                  <Card key={other.slug} className="border border-border/40 bg-white dark:bg-zinc-950 p-5 rounded-2xl hover:shadow-sm transition-shadow">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">{other.date}</span>
                    <h4 className="text-sm font-bold text-slate-950 dark:text-white hover:text-primary transition-colors mb-3">
                      <Link href={`/blog/${other.slug}`}>{other.h1}</Link>
                    </h4>
                    <Link href={`/blog/${other.slug}`} className="text-xs font-bold text-primary hover:text-primary/90 flex items-center gap-1">
                      Read Post
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Card>
                ))}
              </div>
            </div>

          </div>
        </article>
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
