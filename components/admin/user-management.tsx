"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Search, UserX, UserCheck, Shield, Users, ArrowUpRight, ArrowDownLeft, Wallet } from "lucide-react"

interface User {
  id: string
  email: string
  name: string
  role: string
  balance: number
  isBanned: boolean
  createdAt: string
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; user: User | null; action: "ban" | "unban" }>({
    open: false,
    user: null,
    action: "ban",
  })
  const [historyModal, setHistoryModal] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null,
  })
  const [transactions, setTransactions] = useState<any[]>([])
  const [loadingTransactions, setLoadingTransactions] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users")
      const data = await res.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async (userId: string) => {
    setLoadingTransactions(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}/transactions`)
      const data = await res.json()
      setTransactions(data.transactions || [])
    } catch (error) {
      console.error("Failed to fetch transactions:", error)
    } finally {
      setLoadingTransactions(false)
    }
  }

  useEffect(() => {
    if (historyModal.user) {
      fetchTransactions(historyModal.user.id)
    } else {
      setTransactions([])
    }
  }, [historyModal.user])

  const handleBanAction = async () => {
    if (!confirmDialog.user) return

    setActionLoading(confirmDialog.user.id)
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: confirmDialog.user.id,
          action: confirmDialog.action,
        }),
      })

      if (res.ok) {
        setUsers(
          users.map((u) => (u.id === confirmDialog.user!.id ? { ...u, isBanned: confirmDialog.action === "ban" } : u)),
        )
      }
    } catch (error) {
      console.error("Failed to update user:", error)
    } finally {
      setActionLoading(null)
      setConfirmDialog({ open: false, user: null, action: "ban" })
    }
  }

  const filteredUsers = users.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()),
  )

  const stats = {
    total: users.length,
    banned: users.filter((u) => u.isBanned).length,
    admins: users.filter((u) => u.role === "admin").length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <UserX className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.banned}</p>
              <p className="text-sm text-muted-foreground">Banned Users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.admins}</p>
              <p className="text-sm text-muted-foreground">Admins</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setHistoryModal({ open: true, user })}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                      </TableCell>
                      <TableCell>KES {user.balance.toLocaleString()}</TableCell>
                      <TableCell>
                        {user.isBanned ? (
                          <Badge variant="destructive">Banned</Badge>
                        ) : (
                          <Badge variant="outline" className="border-green-500 text-green-500">
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        {user.role !== "admin" && (
                          <Button
                            variant={user.isBanned ? "outline" : "destructive"}
                            size="sm"
                            disabled={actionLoading === user.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              setConfirmDialog({
                                open: true,
                                user,
                                action: user.isBanned ? "unban" : "ban",
                              })
                            }}
                          >
                            {actionLoading === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : user.isBanned ? (
                              <>
                                <UserCheck className="mr-1 h-4 w-4" />
                                Unban
                              </>
                            ) : (
                              <>
                                <UserX className="mr-1 h-4 w-4" />
                                Ban
                              </>
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.action === "ban" ? "Ban User" : "Unban User"}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === "ban"
                ? `Are you sure you want to ban ${confirmDialog.user?.name}? They will be logged out and unable to access their account.`
                : `Are you sure you want to unban ${confirmDialog.user?.name}? They will be able to log in again.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBanAction}
              className={
                confirmDialog.action === "ban"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >
              {confirmDialog.action === "ban" ? "Ban User" : "Unban User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Transaction History Modal */}
      <Dialog open={historyModal.open} onOpenChange={(open) => setHistoryModal({ ...historyModal, open })}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Transaction History
            </DialogTitle>
            <DialogDescription>
              Showing full financial history for {historyModal.user?.name} ({historyModal.user?.email})
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 pt-2">
            {loadingTransactions ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground animate-pulse">Loading financial records...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-2">
                  <ArrowUpRight className="h-6 w-6 text-muted-foreground opacity-20" />
                </div>
                <p className="font-medium">No transactions found</p>
                <p className="text-sm text-muted-foreground">This user has not made any purchases or top-ups yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${t.isNegative ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-500'}`}>
                        {t.isNegative ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-semibold">{t.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-muted-foreground">
                            {new Date(t.date).toLocaleDateString()} at {new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {t.mpesaCode && (
                            <>
                              <span className="text-xs text-muted-foreground">•</span>
                              <Badge variant="outline" className="text-[10px] font-mono py-0 h-4 border-primary/20 bg-primary/5">
                                {t.mpesaCode}
                              </Badge>
                            </>
                          )}
                          <Badge variant="secondary" className="text-[10px] py-0 h-4 uppercase">
                            {t.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold tracking-tight ${t.isNegative ? 'text-destructive' : 'text-green-500'}`}>
                        {t.isNegative ? '-' : '+'} KES {t.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
