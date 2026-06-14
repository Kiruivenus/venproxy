"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { changePassword } from "@/app/dashboard/settings/actions"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type PasswordFormValues = z.infer<typeof passwordSchema>

export function SettingsPasswordForm() {
  const { toast } = useToast()
  const [isPending, setIsPending] = useState(false)

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(data: PasswordFormValues) {
    setIsPending(true)
    try {
      const result = await changePassword(data)
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
        form.reset()
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong.",
      })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="bg-white dark:bg-card rounded-2xl shadow-xs border border-slate-200 dark:border-border p-6 md:p-8">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-border pb-4 mb-6">Security & Password</h2>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 max-w-xl">
        <div className="space-y-2">
          <Label htmlFor="currentPassword" className="text-slate-700 dark:text-zinc-300 font-semibold text-sm">Current Password</Label>
          <Input
            id="currentPassword"
            type="password"
            {...form.register("currentPassword")}
            className="w-full h-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-4 text-slate-900 dark:text-white focus:border-blue-600 dark:focus:border-blue-600 focus:ring-1 focus:ring-blue-650 transition-all outline-none"
          />
          {form.formState.errors.currentPassword && (
            <p className="text-sm text-destructive font-medium">{form.formState.errors.currentPassword.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-slate-700 dark:text-zinc-300 font-semibold text-sm">New Password</Label>
          <Input
            id="newPassword"
            type="password"
            {...form.register("newPassword")}
            className="w-full h-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-4 text-slate-900 dark:text-white focus:border-blue-600 dark:focus:border-blue-600 focus:ring-1 focus:ring-blue-650 transition-all outline-none"
          />
          {form.formState.errors.newPassword && (
            <p className="text-sm text-destructive font-medium">{form.formState.errors.newPassword.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-zinc-300 font-semibold text-sm">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            {...form.register("confirmPassword")}
            className="w-full h-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-4 text-slate-900 dark:text-white focus:border-blue-600 dark:focus:border-blue-600 focus:ring-1 focus:ring-blue-650 transition-all outline-none"
          />
          {form.formState.errors.confirmPassword && (
            <p className="text-sm text-destructive font-medium">{form.formState.errors.confirmPassword.message}</p>
          )}
        </div>

        <Button 
          type="submit" 
          disabled={isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 h-11 rounded-xl transition-colors w-fit mt-4 cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Password"
          )}
        </Button>
      </form>
    </div>
  )
}
