"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { updateProfile } from "@/app/dashboard/settings/actions"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
})

type ProfileFormValues = z.infer<typeof profileSchema>

interface SettingsProfileFormProps {
  user: {
    email: string
    name: string
  }
}

export function SettingsProfileForm({ user }: SettingsProfileFormProps) {
  const { toast } = useToast()
  const [isPending, setIsPending] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
    },
  })

  async function onSubmit(data: ProfileFormValues) {
    setIsPending(true)
    try {
      const result = await updateProfile(data)
      if (result.success) {
        toast({
          title: "Profile Updated",
          description: result.message,
        })
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
    <div className="bg-white dark:bg-card rounded-2xl shadow-xs border border-slate-200 dark:border-border p-6 md:p-8 mb-6">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-border pb-4 mb-6">Personal Information</h2>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 max-w-xl">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-700 dark:text-zinc-300 font-semibold text-sm">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={user.email}
            disabled
            className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-zinc-500 cursor-not-allowed w-full h-12 rounded-xl border border-slate-200 dark:border-border px-4"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name" className="text-slate-700 dark:text-zinc-300 font-semibold text-sm">Full Name</Label>
          <Input
            id="name"
            {...form.register("name")}
            className="w-full h-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-4 text-slate-900 dark:text-white focus:border-blue-600 dark:focus:border-blue-600 focus:ring-1 focus:ring-blue-650 transition-all outline-none"
          />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive font-medium">{form.formState.errors.name.message}</p>
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
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </form>
    </div>
  )
}
