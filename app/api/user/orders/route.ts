import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"
import type { Order } from "@/lib/types"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()

    const proxyOrders = await db
      .collection<Order>("orders")
      .find({ userId: session.user._id })
      .sort({ createdAt: -1 })
      .toArray()

    const emailOrders = await db
      .collection("emailOrders")
      .find({ userId: session.user._id })
      .sort({ createdAt: -1 })
      .toArray()

    const formattedProxyOrders = proxyOrders.map((o) => ({
      id: o._id.toString(),
      type: "proxy",
      country: o.country,
      duration: o.duration,
      price: o.price,
      status: o.status,
      createdAt: o.createdAt,
      paidAt: o.paidAt,
    }))

    const formattedEmailOrders = emailOrders.map((o) => ({
      id: o._id.toString(),
      type: "email",
      domain: o.domain,
      quantity: o.quantity,
      price: o.totalPrice,
      status: o.status,
      createdAt: o.createdAt,
      paidAt: o.paidAt,
    }))

    const allOrders = [...formattedProxyOrders, ...formattedEmailOrders].sort((a, b) => {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    })

    return NextResponse.json({
      orders: allOrders,
    })
  } catch (error) {
    console.error("Orders fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
