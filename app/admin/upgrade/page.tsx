import { requireSuperAdmin } from "@/lib/auth"
import { Header } from "@/components/header"
import { UpgradeForm } from "@/components/superadmin/upgrade-form"

export default async function UpgradePage() {
  const user = await requireSuperAdmin()

  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-12 md:py-20">
      <UpgradeForm userName={user.name} />
    </div>
  )
}
