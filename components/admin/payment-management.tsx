"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { 
  CreditCard, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  RefreshCw, 
  Download, 
  FileText, 
  Eye,
  Calendar,
  AlertCircle,
  Database,
  Loader2
} from "lucide-react"

interface Transaction {
  id: string
  userId: string
  reference: string
  phone: string
  amount: number
  currency: string
  provider: string
  status: string
  paymentMethod: string
  receiptNumber: string
  resultCode: string
  resultDescription: string
  type: string
  targetId: string
  createdAt: string
  processedAt: string | null
}

interface WebhookLog {
  id: string
  reference: string
  transactionId: string
  status: string
  error: string
  payload: any
  createdAt: string
}

interface Stats {
  totalDeposits: number
  todayDeposits: number
  pendingPaymentsCount: number
  successfulPaymentsCount: number
  failedPaymentsCount: number
  revenueGenerated: number
}

export function PaymentManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([])
  const [stats, setStats] = useState<Stats>({
    totalDeposits: 0,
    todayDeposits: 0,
    pendingPaymentsCount: 0,
    successfulPaymentsCount: 0,
    failedPaymentsCount: 0,
    revenueGenerated: 0,
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [dateFilter, setDateFilter] = useState("")
  const [selectedPayload, setSelectedPayload] = useState<any | null>(null)
  const [retryingLogId, setRetryingLogId] = useState<string | null>(null)
  const [activeSubTab, setActiveSubTab] = useState<"history" | "webhooks">("history")

  useEffect(() => {
    fetchPaymentsData()
  }, [])

  const fetchPaymentsData = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/payments")
      const data = await res.json()
      if (data.success) {
        setTransactions(data.transactions || [])
        setWebhookLogs(data.webhookLogs || [])
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch admin payments data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRetryWebhook = async (logId: string) => {
    setRetryingLogId(logId)
    try {
      const res = await fetch("/api/admin/webhooks/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logId }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        alert("Webhook re-processed successfully!")
        fetchPaymentsData()
      } else {
        alert(data.error || "Failed to re-process webhook.")
      }
    } catch {
      alert("Something went wrong.")
    } finally {
      setRetryingLogId(null)
    }
  }

  const exportCSV = () => {
    const headers = ["Reference", "User ID", "Type", "Amount", "Phone", "Receipt Number", "Status", "Date"]
    const rows = filteredTransactions.map((tx) => [
      tx.reference,
      tx.userId,
      tx.type,
      tx.amount,
      tx.phone,
      tx.receiptNumber,
      tx.status,
      new Date(tx.createdAt).toLocaleString(),
    ])

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `payments_export_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = 
      tx.reference.toLowerCase().includes(search.toLowerCase()) ||
      tx.userId.toLowerCase().includes(search.toLowerCase()) ||
      (tx.receiptNumber && tx.receiptNumber.toLowerCase().includes(search.toLowerCase())) ||
      tx.phone.includes(search)

    const matchesStatus = statusFilter === "ALL" || tx.status === statusFilter
    const matchesType = typeFilter === "ALL" || tx.type === typeFilter
    
    let matchesDate = true
    if (dateFilter) {
      const txDateStr = new Date(tx.createdAt).toISOString().split("T")[0]
      matchesDate = txDateStr === dateFilter
    }

    return matchesSearch && matchesStatus && matchesType && matchesDate
  })

  const getStatusBadge = (status: string) => {
    const norm = status.toUpperCase()
    switch (norm) {
      case "SUCCESS":
      case "COMPLETED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-250/20">
            Success
          </span>
        )
      case "PENDING":
      case "PROCESSING":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-250/20">
            Pending
          </span>
        )
      case "FAILED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-450 border border-rose-250/20">
            Failed
          </span>
        )
      case "CANCELLED":
      case "EXPIRED":
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-slate-50 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 border border-slate-200 capitalize">
            {status.toLowerCase()}
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Admin Payment KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* KPI 1: Revenue Generated */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 p-4 rounded-xl flex flex-col justify-between h-24">
          <div className="flex items-center justify-between text-slate-450 dark:text-zinc-500">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Revenue</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <h4 className="text-base font-black text-slate-900 dark:text-white mt-1">
            KES {stats.revenueGenerated.toLocaleString()}
          </h4>
        </div>

        {/* KPI 2: Total Deposits */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 p-4 rounded-xl flex flex-col justify-between h-24">
          <div className="flex items-center justify-between text-slate-450 dark:text-zinc-500">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Deposits Volume</span>
            <CreditCard className="h-4 w-4 text-blue-500" />
          </div>
          <h4 className="text-base font-black text-slate-900 dark:text-white mt-1">
            KES {stats.totalDeposits.toLocaleString()}
          </h4>
        </div>

        {/* KPI 3: Today's Deposits */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 p-4 rounded-xl flex flex-col justify-between h-24">
          <div className="flex items-center justify-between text-slate-450 dark:text-zinc-500">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Today's volume</span>
            <Calendar className="h-4 w-4 text-teal-500" />
          </div>
          <h4 className="text-base font-black text-slate-900 dark:text-white mt-1">
            KES {stats.todayDeposits.toLocaleString()}
          </h4>
        </div>

        {/* KPI 4: Pending Payments */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 p-4 rounded-xl flex flex-col justify-between h-24">
          <div className="flex items-center justify-between text-slate-450 dark:text-zinc-500">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Pending Tasks</span>
            <Clock className="h-4 w-4 text-amber-500 animate-pulse" />
          </div>
          <h4 className="text-base font-black text-slate-900 dark:text-white mt-1">
            {stats.pendingPaymentsCount}
          </h4>
        </div>

        {/* KPI 5: Success Payments */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 p-4 rounded-xl flex flex-col justify-between h-24">
          <div className="flex items-center justify-between text-slate-450 dark:text-zinc-500">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Successful Payouts</span>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </div>
          <h4 className="text-base font-black text-slate-900 dark:text-white mt-1">
            {stats.successfulPaymentsCount}
          </h4>
        </div>

        {/* KPI 6: Failed Payments */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 p-4 rounded-xl flex flex-col justify-between h-24">
          <div className="flex items-center justify-between text-slate-450 dark:text-zinc-500">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Failed Operations</span>
            <XCircle className="h-4 w-4 text-rose-500" />
          </div>
          <h4 className="text-base font-black text-slate-900 dark:text-white mt-1">
            {stats.failedPaymentsCount}
          </h4>
        </div>
      </div>

      {/* Selector sub-tabs */}
      <div className="flex border-b border-slate-250 dark:border-zinc-800 gap-6">
        <button
          onClick={() => setActiveSubTab("history")}
          className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeSubTab === "history"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-300"
          }`}
        >
          Transactions Ledger
        </button>
        <button
          onClick={() => setActiveSubTab("webhooks")}
          className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeSubTab === "webhooks"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-300"
          }`}
        >
          Webhook Callback Logs
        </button>
      </div>

      {/* Tab CONTENT 1: Transactions History list */}
      {activeSubTab === "history" && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 space-y-4 shadow-3xs">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative w-52">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ref, User, Phone, Receipt..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 dark:border-zinc-850 bg-slate-50/50 dark:bg-zinc-950 text-[11px] text-slate-800 dark:text-zinc-200 placeholder:text-slate-450 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-all font-semibold"
                />
              </div>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 rounded-lg border border-slate-200 dark:border-zinc-850 bg-slate-50/50 dark:bg-zinc-950 text-[11px] font-bold text-slate-700 dark:text-zinc-350 px-2 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="SUCCESS">Success</option>
                <option value="FAILED">Failed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              {/* Type filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-8 rounded-lg border border-slate-200 dark:border-zinc-850 bg-slate-50/50 dark:bg-zinc-950 text-[11px] font-bold text-slate-700 dark:text-zinc-350 px-2 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Operations</option>
                <option value="deposit">Deposits</option>
                <option value="proxy">Proxy Buys</option>
                <option value="email">Email Buys</option>
              </select>

              {/* Date Filter */}
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="h-8 rounded-lg border border-slate-200 dark:border-zinc-850 bg-slate-50/50 dark:bg-zinc-950 text-[11px] font-bold text-slate-700 dark:text-zinc-350 px-2 focus:outline-none cursor-pointer"
              />

              {dateFilter && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setDateFilter("")} 
                  className="h-8 text-xs text-slate-500 font-bold hover:text-slate-800"
                >
                  Clear Date
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchPaymentsData}
                className="h-8 gap-1.5 text-xs font-bold"
                disabled={loading}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                Reload
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportCSV}
                className="h-8 gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600"
                disabled={filteredTransactions.length === 0}
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Table list */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
              <FileText className="h-8 w-8 mx-auto text-slate-350 mb-2" />
              <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">No payment transaction records match filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-100 dark:border-border hover:bg-transparent">
                    <TableHead className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase py-3 pl-3">REFERENCE</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase py-3">USER / PHONE</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase py-3">TYPE</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase py-3">AMOUNT</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase py-3">RECEIPT / MODE</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase py-3">STATUS</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase py-3 pr-3 text-right">DATE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((tx) => (
                    <TableRow 
                      key={tx.id}
                      className="hover:bg-slate-55/35 dark:hover:bg-zinc-800/25 border-b border-slate-100 dark:border-zinc-800/80 last:border-0"
                    >
                      <TableCell className="py-3 pl-3 text-xs font-bold text-slate-800 dark:text-zinc-200">
                        {tx.reference}
                      </TableCell>
                      <TableCell className="py-3 text-xs">
                        <p className="font-semibold text-slate-800 dark:text-zinc-200 truncate max-w-[120px]" title={tx.userId}>
                          {tx.userId}
                        </p>
                        <span className="text-[9px] text-slate-450 dark:text-zinc-500 font-bold block mt-0.5">
                          {tx.phone}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-extrabold capitalize ${
                          tx.type === "deposit" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-750"
                        }`}>
                          {tx.type}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-xs font-extrabold text-slate-900 dark:text-white">
                        {tx.currency} {tx.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="py-3 text-xs">
                        <p className="font-bold text-slate-800 dark:text-zinc-200">
                          {tx.receiptNumber || <span className="text-slate-350 dark:text-zinc-650">—</span>}
                        </p>
                        <span className="text-[9px] text-slate-450 dark:text-zinc-500 font-bold uppercase block mt-0.5">
                          {tx.paymentMethod}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        {getStatusBadge(tx.status)}
                      </TableCell>
                      <TableCell className="py-3 pr-3 text-right text-[11px] font-medium text-slate-650 dark:text-zinc-400">
                        {new Date(tx.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* Tab CONTENT 2: Webhook logs list */}
      {activeSubTab === "webhooks" && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 space-y-4 shadow-3xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white"> PalPluss Callback Event Streams</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Verify incoming API payload signals and triggers</p>
            </div>
            <Button variant="outline" size="sm" onClick={fetchPaymentsData} className="h-8 gap-1.5 text-xs font-bold">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Sync Stream
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
            </div>
          ) : webhookLogs.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
              <Database className="h-8 w-8 mx-auto text-slate-350 mb-2" />
              <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">No webhook event logs captured in database</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-100 dark:border-border hover:bg-transparent">
                    <TableHead className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase py-3 pl-3">REFERENCE / TX ID</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase py-3">STATUS</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase py-3">OUTCOME DETAILS</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase py-3">ARRIVED TIME</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase py-3 pr-3 text-right">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhookLogs.map((log) => (
                    <TableRow 
                      key={log.id}
                      className="hover:bg-slate-55/35 dark:hover:bg-zinc-800/25 border-b border-slate-100 dark:border-zinc-800/80 last:border-0"
                    >
                      <TableCell className="py-3 pl-3 text-xs">
                        <p className="font-bold text-slate-800 dark:text-zinc-200 leading-tight">
                          {log.reference || <span className="text-slate-350 dark:text-zinc-650">—</span>}
                        </p>
                        <span className="text-[9px] text-slate-450 dark:text-zinc-500 font-bold block mt-0.5">
                          ID: {log.transactionId || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-xs">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[8px] font-extrabold capitalize ${
                          log.status === "processed" 
                            ? "bg-emerald-50 text-emerald-700" 
                            : log.status === "duplicate" 
                              ? "bg-amber-50 text-amber-700" 
                              : "bg-rose-50 text-rose-700"
                        }`}>
                          {log.status}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-xs font-medium text-slate-650 dark:text-zinc-400 max-w-[200px] truncate">
                        {log.error ? (
                          <span className="text-rose-650 flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                            {log.error}
                          </span>
                        ) : (
                          "Signal processed successfully"
                        )}
                      </TableCell>
                      <TableCell className="py-3 text-[11px] font-medium text-slate-650 dark:text-zinc-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="py-3 pr-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-slate-100"
                            onClick={() => setSelectedPayload(log.payload)}
                            title="Inspect JSON Payload"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[10px] font-bold text-slate-700"
                            disabled={retryingLogId === log.id || log.status === "processed" || log.status === "duplicate"}
                            onClick={() => handleRetryWebhook(log.id)}
                          >
                            {retryingLogId === log.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              "Retry Signal"
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* JSON Payload Inspection Modal Overlay */}
      {selectedPayload && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-5 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Inspect Event Payload Data</h4>
              <button 
                className="text-xs font-bold text-slate-500 hover:text-slate-800 p-1 cursor-pointer" 
                onClick={() => setSelectedPayload(null)}
              >
                Close
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 bg-slate-950 font-mono text-[10px] text-emerald-400 rounded-b-2xl select-text leading-relaxed">
              <pre>{JSON.stringify(selectedPayload, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
