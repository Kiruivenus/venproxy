import { getSession } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"
import { Header } from "@/components/header"
import { ProxyPurchaseForm } from "@/components/proxy-purchase-form"
import type { Pricing } from "@/lib/types"
import { redirect } from "next/navigation"
import { Globe } from "lucide-react"

export default async function BuyPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const db = await getDb()
  const pricing = await db.collection<Pricing>("pricing").find({ isEnabled: true }).toArray()

  const pricingData = pricing.map((p) => ({
    country: p.country,
    countryCode: p.countryCode,
    daily: p.daily,
  }))

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-accent/30">
      <Header user={{ email: session.user.email, name: session.user.name, role: session.user.role }} />

      <main className="container mx-auto px-4 py-16 md:py-24 relative">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[0%] right-[10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] left-[10%] w-[30%] h-[30%] bg-accent/5 rounded-full blur-[100px]" />
        </div>

        <div className="mx-auto max-w-3xl relative z-10">
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
              <Globe className="h-4 w-4" />
              Premium Proxies
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
              Buy Proxies
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Select your preferred country and purchase highly reliable residential and datacenter proxies.
            </p>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            <ProxyPurchaseForm pricing={pricingData} userId={session.user._id.toString()} />
          </div>
        </div>
      </main>
    </div>
  )
}
