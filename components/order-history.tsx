"use client"

import { useState, useEffect } from "react"
import { Loader2, Receipt } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Order {
  id: string
  country: string
  duration: string
  price: number
  status: string
  createdAt: string
  paidAt?: string
}

export function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/user/orders")
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const normStatus = status.toLowerCase()
    switch (normStatus) {
      case "paid":
      case "completed":
      case "active":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30">
            Completed
          </span>
        )
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/50 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30">
            Pending
          </span>
        )
      case "failed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/50 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/30">
            Failed
          </span>
        )
      case "cancelled":
      case "expired":
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-50 text-slate-600 border border-slate-200/50 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700/60 capitalize">
            {status}
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 bg-white dark:bg-card border border-slate-100 dark:border-border rounded-2xl shadow-xs">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 dark:border-border py-16 text-center bg-white dark:bg-card p-6 shadow-xs">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 mb-4">
          <Receipt className="h-6 w-6" strokeWidth={1.5} />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-zinc-200">No orders yet</h3>
        <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500 max-w-xs mx-auto">
          Your complete transaction and payment history will appear here once you place your first order.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Desktop view - Pristine Table Container */}
      <div className="hidden md:block bg-white dark:bg-card shadow-xs border border-slate-100 dark:border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-100 dark:border-border hover:bg-transparent">
                <TableHead className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-zinc-500 uppercase py-4 pl-6">
                  DATE
                </TableHead>
                <TableHead className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-zinc-500 uppercase py-4">
                  COUNTRY
                </TableHead>
                <TableHead className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-zinc-500 uppercase py-4">
                  DURATION
                </TableHead>
                <TableHead className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-zinc-500 uppercase py-4">
                  PRICE
                </TableHead>
                <TableHead className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-zinc-500 uppercase py-4 pr-6">
                  STATUS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const date = new Date(order.createdAt)
                const year = date.getUTCFullYear()
                const month = String(date.getUTCMonth() + 1).padStart(2, "0")
                const day = String(date.getUTCDate()).padStart(2, "0")
                
                const displayCountry = order.country && order.country.trim() !== "" ? order.country : null
                const displayDuration = order.duration && order.duration.trim() !== "" ? order.duration : null

                return (
                  <TableRow 
                    key={order.id}
                    className="hover:bg-slate-50/45 dark:hover:bg-slate-900/40 transition-colors border-b border-slate-100 dark:border-border last:border-b-0"
                  >
                    <TableCell className="py-4 pl-6 text-xs font-medium text-slate-600 dark:text-zinc-400">
                      {`${month}/${day}/${year}`}
                    </TableCell>
                    <TableCell className="py-4 text-xs font-semibold text-slate-800 dark:text-zinc-200">
                      {displayCountry || <span className="text-slate-300 dark:text-zinc-650 font-bold">—</span>}
                    </TableCell>
                    <TableCell className="py-4 text-xs text-slate-600 dark:text-zinc-400 capitalize">
                      {displayDuration || <span className="text-slate-300 dark:text-zinc-650 font-bold">—</span>}
                    </TableCell>
                    <TableCell className="py-4 text-xs font-extrabold text-slate-900 dark:text-white">
                      KES {order.price.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-4 pr-6">
                      {getStatusBadge(order.status)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile view - Card-Based List View */}
      <div className="block md:hidden space-y-3">
        {orders.map((order) => {
          const date = new Date(order.createdAt)
          const year = date.getUTCFullYear()
          const month = String(date.getUTCMonth() + 1).padStart(2, "0")
          const day = String(date.getUTCDate()).padStart(2, "0")
          const displayCountry = order.country && order.country.trim() !== "" ? order.country : null
          const displayDuration = order.duration && order.duration.trim() !== "" ? order.duration : null

          return (
            <div 
              key={order.id} 
              className="bg-white dark:bg-card border border-slate-150 dark:border-border p-4 rounded-xl shadow-xs space-y-3"
            >
              {/* Top line: Date and Price */}
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-medium text-slate-550 dark:text-zinc-400">
                  {`${month}/${day}/${year}`}
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                  KES {order.price.toLocaleString()}
                </span>
              </div>
              
              {/* Bottom line: Status Pill and Location / Duration */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-400">
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">
                    {displayCountry || <span className="text-slate-300 dark:text-zinc-600 font-bold">—</span>}
                  </span>
                  {displayDuration && (
                    <>
                      <span className="text-slate-300 dark:text-zinc-700">•</span>
                      <span className="capitalize">{displayDuration}</span>
                    </>
                  )}
                </div>
                <div>
                  {getStatusBadge(order.status)}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
