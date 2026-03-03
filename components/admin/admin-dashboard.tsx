"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProxyManagement } from "@/components/admin/proxy-management"
import { PricingManagement } from "@/components/admin/pricing-management"
import { OrderManagement } from "@/components/admin/order-management"
import { UserManagement } from "@/components/admin/user-management"
import { EmailManagement } from "@/components/admin/email-management"
import { SupportSettings } from "@/components/admin/support-settings"
import { Analytics } from "@/components/admin/analytics"
import { Server, DollarSign, Receipt, Users, Mail, MessageCircle, BarChart3 } from "lucide-react"

export function AdminDashboard() {
  return (
    <Tabs defaultValue="analytics" className="w-full">
      <TabsList className="flex flex-wrap h-auto w-full justify-start gap-1 bg-muted/50 p-1">
        <TabsTrigger value="analytics" className="flex-1 min-w-[100px] gap-2">
          <BarChart3 className="h-4 w-4" />
          <span>Analytics</span>
        </TabsTrigger>
        <TabsTrigger value="proxies" className="flex-1 min-w-[100px] gap-2">
          <Server className="h-4 w-4" />
          <span>Proxies</span>
        </TabsTrigger>
        <TabsTrigger value="emails" className="flex-1 min-w-[100px] gap-2">
          <Mail className="h-4 w-4" />
          <span>Emails</span>
        </TabsTrigger>
        <TabsTrigger value="pricing" className="flex-1 min-w-[100px] gap-2">
          <DollarSign className="h-4 w-4" />
          <span>Pricing</span>
        </TabsTrigger>
        <TabsTrigger value="orders" className="flex-1 min-w-[100px] gap-2">
          <Receipt className="h-4 w-4" />
          <span>Orders</span>
        </TabsTrigger>
        <TabsTrigger value="users" className="flex-1 min-w-[100px] gap-2">
          <Users className="h-4 w-4" />
          <span>Users</span>
        </TabsTrigger>
        <TabsTrigger value="support" className="flex-1 min-w-[100px] gap-2">
          <MessageCircle className="h-4 w-4" />
          <span>Support</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="analytics" className="mt-6">
        <Analytics />
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
    </Tabs>
  )
}
