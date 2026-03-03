import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { requireAdmin } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin()
        const { id } = await params
        const db = await getDb()

        const userId = new ObjectId(id)

        // Fetch all types of transactions
        const [orders, emailOrders, topups] = await Promise.all([
            db.collection("orders").find({ userId, status: { $in: ["paid", "failed", "cancelled"] } }).toArray(),
            db.collection("emailOrders").find({ userId, status: { $in: ["paid", "failed", "cancelled"] } }).toArray(),
            db.collection("topups").find({ userId, status: { $in: ["completed", "failed"] } }).toArray(),
        ])

        // Normalize transactions
        const transactions = [
            ...orders.map((o) => ({
                id: o._id.toString(),
                type: "proxy_purchase",
                description: `Proxy Purchase - ${o.country} (${o.duration})`,
                amount: o.price,
                status: o.status,
                date: o.createdAt,
                isNegative: true,
            })),
            ...emailOrders.map((eo) => ({
                id: eo._id.toString(),
                type: "email_purchase",
                description: `Email Purchase - ${eo.quantity} x ${eo.domain}`,
                amount: eo.totalPrice,
                status: eo.status,
                date: eo.createdAt,
                isNegative: true,
            })),
            ...topups.map((t) => ({
                id: t._id.toString(),
                type: "topup",
                description: "Balance Top-up",
                amount: t.amount,
                status: t.status,
                date: t.createdAt,
                isNegative: false,
                mpesaCode: t.mpesaReceiptNumber,
            })),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        return NextResponse.json({ transactions })
    } catch (error: any) {
        console.error("User transactions fetch error:", error)
        return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
    }
}
