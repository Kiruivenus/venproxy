import { PauseCircle } from "lucide-react"

interface ServicePausedProps {
  serviceName: string
}

export function ServicePaused({ serviceName }: ServicePausedProps) {
  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-amber-200 overflow-hidden animate-in fade-in duration-500">
      <div className="bg-amber-50 border-b border-amber-100 p-5 flex items-center gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100 border border-amber-200">
          <PauseCircle className="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <h2 className="text-base font-bold text-amber-900">{serviceName} Paused</h2>
          <p className="text-xs text-amber-700 mt-0.5">This service is temporarily paused by the administrator.</p>
        </div>
      </div>
      <div className="p-5 bg-white">
        <p className="text-sm text-slate-600 leading-relaxed">
          We apologize for the inconvenience. Our team is working to restore this feature as soon as possible.
          Please check back later or contact support if you need immediate assistance.
        </p>
      </div>
    </div>
  )
}
