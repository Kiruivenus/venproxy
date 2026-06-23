"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProxyManagement } from "@/components/admin/proxy-management"
import { PricingManagement } from "@/components/admin/pricing-management"
import { OrderManagement } from "@/components/admin/order-management"
import { UserManagement } from "@/components/admin/user-management"
import { EmailManagement } from "@/components/admin/email-management"
import { SupportSettings } from "@/components/admin/support-settings"
import { Analytics } from "@/components/admin/analytics"
import { PlatformSettingsForm } from "@/components/admin/platform-settings-form"
import { PaymentManagement } from "@/components/admin/payment-management"
import { Server, DollarSign, Receipt, Users, Mail, MessageCircle, BarChart3, Settings, CreditCard } from "lucide-react"
import type { PlatformSettings } from "@/app/admin/platform-actions"

interface AdminDashboardProps {
  platformSettings: PlatformSettings
}

export function AdminDashboard({ platformSettings }: AdminDashboardProps) {
  return (
    <Tabs defaultValue="analytics" className="w-full">
      <TabsList className="flex flex-wrap h-auto w-full justify-start gap-1 bg-white/60 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-805 p-1 rounded-2xl mb-8 shadow-2xs">
        <TabsTrigger value="analytics" className="flex-1 min-w-[110px] gap-2 py-2 px-3 text-xs font-bold rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-450 data-[state=active]:shadow-xs transition-all text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer">
          <BarChart3 className="h-4 w-4" />
          <span>Analytics</span>
        </TabsTrigger>
        <TabsTrigger value="payments" className="flex-1 min-w-[110px] gap-2 py-2 px-3 text-xs font-bold rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-450 data-[state=active]:shadow-xs transition-all text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer">
          <CreditCard className="h-4 w-4" />
          <span>Payments</span>
        </TabsTrigger>
        <TabsTrigger value="proxies" className="flex-1 min-w-[110px] gap-2 py-2 px-3 text-xs font-bold rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-450 data-[state=active]:shadow-xs transition-all text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer">
          <Server className="h-4 w-4" />
          <span>Proxies</span>
        </TabsTrigger>
        <TabsTrigger value="emails" className="flex-1 min-w-[110px] gap-2 py-2 px-3 text-xs font-bold rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-450 data-[state=active]:shadow-xs transition-all text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer">
          <Mail className="h-4 w-4" />
          <span>Emails</span>
        </TabsTrigger>
        <TabsTrigger value="pricing" className="flex-1 min-w-[110px] gap-2 py-2 px-3 text-xs font-bold rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-450 data-[state=active]:shadow-xs transition-all text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer">
          <DollarSign className="h-4 w-4" />
          <span>Pricing</span>
        </TabsTrigger>
        <TabsTrigger value="orders" className="flex-1 min-w-[110px] gap-2 py-2 px-3 text-xs font-bold rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-450 data-[state=active]:shadow-xs transition-all text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer">
          <Receipt className="h-4 w-4" />
          <span>Orders</span>
        </TabsTrigger>
        <TabsTrigger value="users" className="flex-1 min-w-[110px] gap-2 py-2 px-3 text-xs font-bold rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-450 data-[state=active]:shadow-xs transition-all text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer">
          <Users className="h-4 w-4" />
          <span>Users</span>
        </TabsTrigger>
        <TabsTrigger value="support" className="flex-1 min-w-[110px] gap-2 py-2 px-3 text-xs font-bold rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-450 data-[state=active]:shadow-xs transition-all text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer">
          <MessageCircle className="h-4 w-4" />
          <span>Support</span>
        </TabsTrigger>
        <TabsTrigger value="platform" className="flex-1 min-w-[110px] gap-2 py-2 px-3 text-xs font-bold rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-450 data-[state=active]:shadow-xs transition-all text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer">
          <Settings className="h-4 w-4" />
          <span>Platform Settings</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="analytics" className="mt-6">
        <Analytics />
      </TabsContent>

      <TabsContent value="payments" className="mt-6">
        <PaymentManagement />
      </TabsContent>

      <TabsContent value="proxies" className="mt-6">
        <ProxyManagement />
      </TabsContent>

      <TabsContent value="emails" className="mt-6">
        <EmailManagement />
      </TabsContent>

      <TabsContent value="pricing" className="mt-6">
        <PricingManagement />
      </TabsContent>

      <TabsContent value="orders" className="mt-6">
        <OrderManagement />
      </TabsContent>

      <TabsContent value="users" className="mt-6">
        <UserManagement />
      </TabsContent>

      <TabsContent value="support" className="mt-6">
        <SupportSettings />
      </TabsContent>

      <TabsContent value="platform" className="mt-6">
        <PlatformSettingsForm initialSettings={platformSettings} />
      </TabsContent>
    </Tabs>
  )
}
