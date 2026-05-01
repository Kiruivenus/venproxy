import type { Metadata } from "next"
import { SupportContent } from "./support-content"
import { getSession } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Support - RayProxy Hub",
  description: "Get support from our team via WhatsApp and Telegram",
}

export default async function SupportPage() {
  const session = await getSession()
  const user = session?.user ? { email: session.user.email, name: session.user.name, role: session.user.role } : null
  
  return <SupportContent user={user} />
}
