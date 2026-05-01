import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { TopUpForm } from "@/components/topup-form"
import { Wallet } from "lucide-react"

export default async function TopUpPage() {
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
          <div className="absolute top-[0%] right-[20%] w-[30%] h-[30%] bg-accent/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[20%] left-[20%] w-[20%] h-[20%] bg-accent/5 rounded-full blur-[100px]" />
        </div>

        <div className="mx-auto max-w-lg relative z-10">
          <div className="mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
              <Wallet className="h-4 w-4" />
              Account Balance
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
              Top Up Balance
            </h1>
            <p className="text-lg text-muted-foreground">
              Add funds to your account instantly via M-Pesa.
            </p>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            <TopUpForm currentBalance={session.user.balance || 0} />
          </div>
        </div>
      </main>
    </div>
  )
}
