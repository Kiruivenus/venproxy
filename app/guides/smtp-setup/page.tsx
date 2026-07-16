import { getSession } from '@/lib/auth'
import { DashboardLayoutClient } from '@/components/dashboard-layout-client'
import { PublicNavBar } from '@/components/public-navbar'
import { SMTPSetupContent } from './smtp-setup-content'

export const metadata = {
  title: 'SMTP Setup Guide - Proxiva',
  description: 'Configure email sending for your application',
}

export default async function SMTPSetupGuidePage() {
  const session = await getSession()
  const user = session?.user ? { email: session.user.email, name: session.user.name, role: session.user.role } : null

  if (user) {
    return (
      <DashboardLayoutClient user={user}>
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold font-sans tracking-tight text-slate-900 dark:text-white">SMTP Setup Guide</h1>
            <p className="mt-2 text-lg text-slate-500 dark:text-zinc-400">
              Configure email sending for your application
            </p>
          </div>
          <SMTPSetupContent isEmbedded={true} />
        </div>
      </DashboardLayoutClient>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNavBar mode="landing" />
      <main className="flex-1 container mx-auto px-4 pt-28 pb-16">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold font-sans tracking-tight text-slate-900 dark:text-white">SMTP Setup Guide</h1>
          <p className="mt-2 text-lg text-slate-500 dark:text-zinc-400">
            Configure email sending for your application
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <SMTPSetupContent isEmbedded={false} />
        </div>
      </main>
    </div>
  )
}
