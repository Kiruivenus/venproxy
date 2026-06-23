"use client"

import { useState, useEffect } from "react"
import { TopUpForm } from "@/components/topup-form"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Wallet, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  Receipt, 
  Search,
  ArrowDownCircle,
  HelpCircle,
  FileText
} from "lucide-react"

interface WalletOverview {
  balance: number
  totalDeposits: number
  successfulDepositsCount: number
  pendingTransactionsCount: number
}

interface Transaction {
  id: string
  reference: string
  amount: number
  currency: string
  provider: string
  status: string
  paymentMethod: string
  receiptNumber: string
  resultDescription: string
  type: string
  createdAt: string
}

export function WalletHub({ currentBalance }: { currentBalance: number }) {
  const [overview, setOverview] = useState<WalletOverview>({
    balance: currentBalance,
    totalDeposits: 0,
    successfulDepositsCount: 0,
    pendingTransactionsCount: 0,
  })
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadingOverview, setLoadingOverview] = useState(true)
  const [loadingTransactions, setLoadingTransactions] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchOverview()
    fetchTransactions()
  }, [])

  const fetchOverview = async () => {
    try {
      const res = await fetch("/api/user/wallet-overview")
      const data = await res.json()
      if (data.success) {
        setOverview({
          balance: data.balance,
          totalDeposits: data.totalDeposits,
          successfulDepositsCount: data.successfulDepositsCount,
          pendingTransactionsCount: data.pendingTransactionsCount,
        })
      }
    } catch (error) {
      console.error("Failed to fetch wallet overview:", error)
    } finally {
      setLoadingOverview(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/user/transactions")
      const data = await res.json()
      if (data.success) {
        setTransactions(data.transactions)
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error)
    } finally {
      setLoadingTransactions(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const norm = status.toUpperCase()
    switch (norm) {
      case "SUCCESS":
      case "COMPLETED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30">
            Success
          </span>
        )
      case "PENDING":
      case "PROCESSING":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200/50 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30 animate-pulse">
            Pending
          </span>
        )
      case "FAILED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200/50 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/30">
            Failed
          </span>
        )
      case "CANCELLED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-50 text-slate-650 border border-slate-200/50 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700/60">
            Cancelled
          </span>
        )
      case "EXPIRED":
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700 capitalize">
            {status.toLowerCase()}
          </span>
        )
    }
  }

  const filteredTransactions = transactions.filter(t => 
    t.reference.toLowerCase().includes(search.toLowerCase()) ||
    (t.receiptNumber && t.receiptNumber.toLowerCase().includes(search.toLowerCase())) ||
    t.type.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Wallet Overview KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* Card 1: Balance */}
        <div className="bg-white dark:bg-card border border-slate-200 dark:border-border p-5 rounded-2xl shadow-2xs flex flex-col justify-between h-28 relative overflow-hidden group hover:border-blue-400 dark:hover:border-blue-800 transition-all duration-300">
          <div className="absolute top-[-10px] right-[-10px] h-16 w-16 bg-blue-50/40 dark:bg-blue-950/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] md:text-xs font-bold text-slate-450 dark:text-zinc-500 uppercase tracking-wider">
              Available Balance
            </span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 z-10">
            <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white truncate">
              {loadingOverview ? (
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              ) : (
                `KES ${(overview.balance || 0).toLocaleString()}`
              )}
            </h3>
          </div>
        </div>

        {/* Card 2: Total Deposits */}
        <div className="bg-white dark:bg-card border border-slate-200 dark:border-border p-5 rounded-2xl shadow-2xs flex flex-col justify-between h-28 relative overflow-hidden group hover:border-emerald-400 dark:hover:border-emerald-950 transition-all duration-300">
          <div className="absolute top-[-10px] right-[-10px] h-16 w-16 bg-emerald-50/40 dark:bg-emerald-950/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] md:text-xs font-bold text-slate-450 dark:text-zinc-500 uppercase tracking-wider">
              Total Deposits
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 z-10">
            <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white truncate">
              {loadingOverview ? (
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              ) : (
                `KES ${(overview.totalDeposits || 0).toLocaleString()}`
              )}
            </h3>
          </div>
        </div>

        {/* Card 3: Successful Deposits Count */}
        <div className="bg-white dark:bg-card border border-slate-200 dark:border-border p-5 rounded-2xl shadow-2xs flex flex-col justify-between h-28 relative overflow-hidden group hover:border-teal-400 dark:hover:border-teal-950 transition-all duration-300">
          <div className="absolute top-[-10px] right-[-10px] h-16 w-16 bg-teal-50/40 dark:bg-teal-950/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] md:text-xs font-bold text-slate-450 dark:text-zinc-500 uppercase tracking-wider">
              Success Transactions
            </span>
            <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 z-10">
            <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white truncate">
              {loadingOverview ? (
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              ) : (
                overview.successfulDepositsCount
              )}
            </h3>
          </div>
        </div>

        {/* Card 4: Pending Transactions */}
        <div className="bg-white dark:bg-card border border-slate-200 dark:border-border p-5 rounded-2xl shadow-2xs flex flex-col justify-between h-28 relative overflow-hidden group hover:border-amber-400 dark:hover:border-amber-950 transition-all duration-300">
          <div className="absolute top-[-10px] right-[-10px] h-16 w-16 bg-amber-50/40 dark:bg-amber-950/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] md:text-xs font-bold text-slate-450 dark:text-zinc-500 uppercase tracking-wider">
              Pending Operations
            </span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <Clock className="h-4 w-4 animate-pulse" />
            </div>
          </div>
          <div className="mt-2 z-10">
            <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white truncate">
              {loadingOverview ? (
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              ) : (
                overview.pendingTransactionsCount
              )}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Core View Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <TopUpForm currentBalance={overview.balance} />
          </div>
        </div>

        {/* Right Audit Ledger History List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Transaction History</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Verify your payment audit ledger details</p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-4 rounded-xl border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-all font-medium"
                />
              </div>
            </div>

            {loadingTransactions ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-slate-150 dark:border-border rounded-xl">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 mb-3">
                  <Receipt className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">No transactions recorded</h4>
                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 max-w-xs mx-auto">
                  Your payment audit history will appear here once you initiate a deposit.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-slate-100 dark:border-border hover:bg-transparent">
                      <TableHead className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase py-3 pl-3">Ref / Date</TableHead>
                      <TableHead className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase py-3">Type</TableHead>
                      <TableHead className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase py-3">Amount</TableHead>
                      <TableHead className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase py-3">Receipt / Mode</TableHead>
                      <TableHead className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase py-3 pr-3 text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((tx) => {
                      const date = new Date(tx.createdAt)
                      const formattedDate = date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })
                      
                      return (
                        <TableRow 
                          key={tx.id}
                          className="hover:bg-slate-55/30 dark:hover:bg-slate-905/30 transition-colors border-b border-slate-100 dark:border-border last:border-0"
                        >
                          <TableCell className="py-3 pl-3">
                            <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 leading-tight">
                              {tx.reference}
                            </p>
                            <span className="text-[9px] text-slate-450 dark:text-zinc-500 font-bold leading-none mt-0.5 block">
                              {formattedDate}
                            </span>
                          </TableCell>
                          <TableCell className="py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold capitalize ${
                              tx.type === "deposit" 
                                ? "bg-emerald-50/60 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450" 
                                : "bg-blue-50/60 text-blue-750 dark:bg-blue-950/20 dark:text-blue-400"
                            }`}>
                              {tx.type}
                            </span>
                          </TableCell>
                          <TableCell className="py-3 text-xs font-extrabold text-slate-900 dark:text-white">
                            {tx.currency} {tx.amount.toLocaleString()}
                          </TableCell>
                          <TableCell className="py-3">
                            <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 leading-tight">
                              {tx.receiptNumber || <span className="text-slate-350 dark:text-zinc-650">—</span>}
                            </p>
                            <span className="text-[9px] text-slate-450 dark:text-zinc-500 font-bold leading-none uppercase mt-0.5 block">
                              {tx.paymentMethod}
                            </span>
                          </TableCell>
                          <TableCell className="py-3 pr-3 text-right">
                            {getStatusBadge(tx.status)}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
