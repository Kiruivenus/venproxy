import { type NextRequest, NextResponse } from "next/server"
import { getPlatformSettings } from "@/app/admin/platform-actions"

export const dynamic = "force-dynamic"

export async function GET(_req: NextRequest) {
  const settings = await getPlatformSettings()
  return NextResponse.json({
    companyName: settings.companyName,
    companyLogoUrl: settings.companyLogoUrl,
  })
}
