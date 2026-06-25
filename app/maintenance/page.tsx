import Link from "next/link"
import { CloudLightning, Wrench } from "lucide-react"
import { getPlatformSettings } from "@/app/admin/platform-actions"

export const metadata = {
  title: "Maintenance | RayProxy Hub",
  description: "We are currently performing scheduled maintenance. We'll be back shortly.",
}

export default async function MaintenancePage() {
  const settings = await getPlatformSettings()
  const companyName = settings.companyName || "RayProxy Hub"
  const companyLogoUrl = settings.companyLogoUrl

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md text-center space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          {companyLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={companyLogoUrl}
              alt={companyName}
              className="h-16 w-auto max-w-[240px] object-contain flex-shrink-0"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
              <CloudLightning className="h-9 w-9 stroke-[2]" />
            </div>
          )}
        </div>

        {/* Icon */}
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 border-4 border-amber-200">
            <Wrench className="h-10 w-10 text-amber-600" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h1 className="font-sans font-extrabold text-3xl text-slate-900 tracking-tight">
            Under Maintenance
          </h1>
          <p className="text-slate-500 text-base max-w-sm mx-auto leading-relaxed">
            We&apos;re performing scheduled maintenance to improve your experience.
            We&apos;ll be back online shortly. Thank you for your patience!
          </p>
        </div>

        {/* Status card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
            <span className="text-sm font-semibold text-slate-700">
              Maintenance in progress
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 ml-5">
            All services will resume shortly. Your data and account are safe.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          ← Back to Homepage
        </Link>
      </div>
    </div>
  )
}
