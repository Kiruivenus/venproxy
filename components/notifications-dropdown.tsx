"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, CheckCircle, Info, AlertTriangle, X, CheckCheck } from "lucide-react"

interface NotificationItem {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  createdAt: string
}

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchNotifications()
    
    // Check periodically for updates (every 20s)
    const interval = setInterval(fetchNotifications, 20000)

    // Close dropdown on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      clearInterval(interval)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/user/notifications")
      const data = await res.json()
      if (data.success) {
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/user/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      const data = await res.json()
      if (data.success) {
        setNotifications(notifications.map((n) => ({ ...n, read: true })))
      }
    } catch (error) {
      console.error("Failed to mark notifications read:", error)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch("/api/user/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      if (data.success) {
        setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
      }
    } catch (error) {
      console.error("Failed to mark notification read:", error)
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
      case "warning":
      case "error":
        return <AlertTriangle className="h-4 w-4 text-rose-500 flex-shrink-0" />
      case "info":
      default:
        return <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-8.5 w-8.5 rounded-full border border-slate-100 dark:border-zinc-850 bg-white dark:bg-zinc-900/40 hover:bg-slate-50 dark:hover:bg-zinc-900 text-slate-500 dark:text-zinc-400 flex items-center justify-center transition-all cursor-pointer outline-none"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-600 text-white font-extrabold text-[9px] border border-white dark:border-zinc-950 scale-90 animate-bounce-slow">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-3 duration-200">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-zinc-850 flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 dark:text-zinc-200">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="h-3 w-3" />
                Mark all read
              </button>
            )}
          </div>

          {/* List content */}
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-900">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-450 dark:text-zinc-550 flex flex-col items-center justify-center">
                <Bell className="h-6 w-6 text-slate-300 dark:text-zinc-700 mb-1" />
                <span className="text-xs font-bold">No notifications yet</span>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => !item.read && markAsRead(item.id)}
                  className={`px-4 py-3 flex gap-3 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-zinc-900/40 transition-colors ${
                    !item.read ? "bg-blue-50/20 dark:bg-blue-950/5" : ""
                  }`}
                >
                  {getNotificationIcon(item.type)}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold text-slate-805 dark:text-zinc-200 truncate ${
                      !item.read ? "font-extrabold" : "font-semibold"
                    }`}>
                      {item.title}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium leading-tight mt-0.5 break-words">
                      {item.message}
                    </p>
                    <span className="text-[8px] text-slate-400 dark:text-zinc-500 font-bold mt-1 block">
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {!item.read && (
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 self-center flex-shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
