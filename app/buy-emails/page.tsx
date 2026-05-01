import { getSession } from "@/lib/auth"
import { Header } from "@/components/header"
import { EmailPurchaseForm } from "@/components/email-purchase-form"
import { redirect } from "next/navigation"
import { Mail } from "lucide-react"

export const metadata = {
  title: "Buy Emails - RayProxy Hub",
  description: "Purchase premium email accounts from RayProxy Hub",
}

export default async function BuyEmailsPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

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
              <Mail className="h-4 w-4" />
              Premium Email Accounts
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
              Buy Email Accounts
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Select your preferred email domain and purchase premium, high-trust accounts for your business operations.
            </p>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            <EmailPurchaseForm />
          </div>
        </div>
      </main>
    </div>
  )
}
