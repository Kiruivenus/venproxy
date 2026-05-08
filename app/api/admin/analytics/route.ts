import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { requireAdmin } from "@/lib/auth"
import type { Order, EmailOrder } from "@/lib/types"
import { startOfDay, startOfWeek, subDays, format } from "date-fns"

export async function GET() {
    try {
        await requireAdmin()

        const db = await getDb()
        const now = new Date()
        const todayStart = startOfDay(now)
        const weekStart = startOfWeek(now)

        // Parallel data fetching
        const [orders, emailOrders] = await Promise.all([
            db.collection<Order>("orders").find({ status: "paid" }).toArray(),
            db.collection<EmailOrder>("emailOrders").find({ status: "paid" }).toArray(),
        ])

        // Metrics calculation
        const todayProxyOrders = orders.filter(o => o.paidAt && o.paidAt >= todayStart)
        const todayEmailOrders = emailOrders.filter(o => o.paidAt && o.paidAt >= todayStart)

        const revenueToday = todayProxyOrders.reduce((sum, o) => sum + o.price, 0) +
            todayEmailOrders.reduce((sum, o) => sum + o.totalPrice, 0)

        const proxiesSoldToday = todayProxyOrders.length

        const totalRevenue = orders.reduce((sum, o) => sum + o.price, 0) +
            emailOrders.reduce((sum, o) => sum + o.totalPrice, 0)

        // Chart data (Last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = subDays(todayStart, 6 - i)
            const dateStr = format(date, "MMM dd")

            const dayProxySales = orders.filter(o =>
                o.paidAt &&
                o.paidAt >= startOfDay(date) &&
                o.paidAt < startOfDay(subDays(date, -1))
            ).length

            const dayEmailSales = emailOrders.filter(o =>
                o.paidAt &&
                o.paidAt >= startOfDay(date) &&
                o.paidAt < startOfDay(subDays(date, -1))
            ).reduce((sum, o) => sum + o.quantity, 0)

            return {
                name: dateStr,
                proxies: dayProxySales,
                emails: dayEmailSales,
            }
        })

        // Top countries for proxies
        const countrySales: Record<string, number> = {}
        orders.forEach(o => {
            countrySales[o.country] = (countrySales[o.country] || 0) + 1
        })

        const topCountries = Object.entries(countrySales)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5)

        return NextResponse.json({
            summary: {
                proxiesSoldToday,
                revenueToday,
                totalRevenue,
            },
            chartData: last7Days,
            topCountries,
        })
    } catch (error: any) {
        if (error.message === "Unauthorized" || error.message === "Forbidden" || error.message.includes("vercel resources exceeded")) {
            return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 403 })
        }
        console.error("Admin analytics error:", error)
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
    }
}
