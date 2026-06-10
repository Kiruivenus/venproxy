import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { requireAuth } from "@/lib/auth"
import type { Order, TopUp } from "@/lib/types"
import { ObjectId } from "mongodb"

async function getMpesaAccessToken(): Promise<string> {
  const consumerKey = process.env.MPESA_CONSUMER_KEY
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64")

  const response = await fetch("https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  })

  const data = await response.json()
  return data.access_token
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    const { orderId, topUpId, type } = await request.json()

    if (!orderId && !topUpId) {
      return NextResponse.json({ error: "Order ID or TopUp ID required" }, { status: 400 })
    }

    const db = await getDb()
    let amount: number
    let phoneNumber: string
    let accountReference: string
    let transactionDesc: string
    let updateCollection: string
    let documentId: ObjectId

    if (orderId && type === "email") {
      const order = await db.collection("emailOrders").findOne({
        _id: new ObjectId(orderId),
        userId: user._id,
        status: "pending",
      })

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 })
      }

      amount = order.totalPrice
      phoneNumber = order.phoneNumber
      accountReference = order._id.toString().slice(-12)
      transactionDesc = "EmailBuy"
      updateCollection = "emailOrders"
      documentId = order._id
    } else if (orderId) {
      const order = await db.collection<Order>("orders").findOne({
        _id: new ObjectId(orderId),
        userId: user._id,
        status: "pending",
      })

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 })
      }

      amount = order.price
      phoneNumber = order.phoneNumber || ""
      accountReference = order._id.toString().slice(-12)
      transactionDesc = "ProxyBuy"
      updateCollection = "orders"
      documentId = order._id
    } else {
      const topUp = await db.collection<TopUp>("topups").findOne({
        _id: new ObjectId(topUpId),
        userId: user._id,
        status: "pending",
      })

      if (!topUp) {
        return NextResponse.json({ error: "Top-up not found" }, { status: 404 })
      }

      amount = topUp.amount
      phoneNumber = topUp.phoneNumber
      accountReference = topUp._id.toString().slice(-12)
      transactionDesc = "TopUp"
      updateCollection = "topups"
      documentId = topUp._id
    }

    const accessToken = await getMpesaAccessToken()
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, 14)
    const shortcode = process.env.MPESA_SHORTCODE
    const passkey = process.env.MPESA_PASSKEY
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64")

    // Determine PartyB based on the purchase type
    const mpesaPartyB = type === "email" 
      ? (process.env.MPESA_EMAILS_PARTY_B || "5679822")
      : (process.env.MPESA_PARTY_B || "5679822")

    const stkPushResponse = await fetch("https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerBuyGoodsOnline",
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: Number(mpesaPartyB),
        PhoneNumber: phoneNumber,
        CallBackURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/mpesa/callback`,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc,
      }),
    })

    const stkData = await stkPushResponse.json()

    if (stkData.ResponseCode === "0") {
      await db
        .collection(updateCollection)
        .updateOne({ _id: documentId }, { $set: { mpesaCheckoutRequestId: stkData.CheckoutRequestID } })

      return NextResponse.json({
        success: true,
        message: "STK Push sent. Please check your phone.",
        checkoutRequestId: stkData.CheckoutRequestID,
      })
    } else {
      return NextResponse.json({ error: "Failed to initiate payment" }, { status: 500 })
    }
  } catch (error: any) {
    if (error.message.includes("vercel resources exceeded")) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    console.error("STK Push error:", error)
    return NextResponse.json({ error: "Payment initiation failed" }, { status: 500 })
  }
}
