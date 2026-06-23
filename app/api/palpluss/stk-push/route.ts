import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { requireAuth } from "@/lib/auth"
import type { Order, TopUp, Transaction } from "@/lib/types"
import { ObjectId } from "mongodb"
import { initiateStkPush } from "@/lib/palpluss"
import { sendDepositPendingEmail } from "@/lib/mail"

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
    let prefix = "DEP"
    let updateCollection = "topups"
    let documentId: ObjectId
    let transactionType: "deposit" | "proxy" | "email" = "deposit"

    if (orderId && type === "email") {
      const order = await db.collection("emailOrders").findOne({
        _id: new ObjectId(orderId),
        userId: user._id,
        status: "pending",
      })

      if (!order) {
        return NextResponse.json({ error: "Email Order not found or not pending" }, { status: 404 })
      }

      amount = order.totalPrice
      phoneNumber = order.phoneNumber
      prefix = "EML"
      updateCollection = "emailOrders"
      documentId = order._id
      transactionType = "email"
    } else if (orderId) {
      const order = await db.collection<Order>("orders").findOne({
        _id: new ObjectId(orderId),
        userId: user._id,
        status: "pending",
      })

      if (!order) {
        return NextResponse.json({ error: "Proxy Order not found or not pending" }, { status: 404 })
      }

      amount = order.price
      phoneNumber = order.phoneNumber || ""
      prefix = "PRX"
      updateCollection = "orders"
      documentId = order._id
      transactionType = "proxy"
    } else {
      const topUp = await db.collection<TopUp>("topups").findOne({
        _id: new ObjectId(topUpId),
        userId: user._id,
        status: "pending",
      })

      if (!topUp) {
        return NextResponse.json({ error: "Top-up not found or not pending" }, { status: 404 })
      }

      amount = topUp.amount
      phoneNumber = topUp.phoneNumber
      prefix = "DEP"
      updateCollection = "topups"
      documentId = topUp._id
      transactionType = "deposit"
    }

    // Generate unique reference
    const uniqueRef = `${prefix}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`

    // Create a new pending transaction log
    const transaction: Transaction = {
      _id: new ObjectId(),
      userId: user._id,
      reference: uniqueRef,
      phone: phoneNumber,
      amount,
      currency: "KES",
      provider: "palpluss",
      status: "PENDING",
      paymentMethod: "mpesa",
      createdAt: new Date(),
      updatedAt: new Date(),
      type: transactionType,
      targetId: documentId,
    }

    await db.collection<Transaction>("transactions").insertOne(transaction)

    // Trigger STK Push via PalPluss
    try {
      const stkResult = await initiateStkPush({
        amount,
        phone: phoneNumber,
        reference: uniqueRef,
        description: `${transactionType.toUpperCase()} Purchase ${uniqueRef}`,
      })

      if (stkResult.success) {
        // Save returned checkout and transaction IDs
        await db.collection<Transaction>("transactions").updateOne(
          { _id: transaction._id },
          {
            $set: {
              transactionId: stkResult.transactionId,
              providerCheckoutId: stkResult.checkoutRequestId,
              status: "PROCESSING",
              updatedAt: new Date(),
            },
          }
        )

        // Update target collection
        await db.collection(updateCollection).updateOne(
          { _id: documentId },
          {
            $set: {
              palplussTransactionId: stkResult.transactionId,
              palplussReference: uniqueRef,
              status: "pending",
            },
          }
        )

        // Send email notification for deposits
        if (transactionType === "deposit") {
          // Asynchronous email dispatch (no await to prevent request block)
          sendDepositPendingEmail(user.email, user.name || user.email, amount, uniqueRef).catch((e) =>
            console.error("Failed to send pending email:", e)
          )

          // Create initial in-app notification
          await db.collection("notifications").insertOne({
            _id: new ObjectId(),
            userId: user._id,
            title: "Deposit Initiated",
            message: `Your deposit of KES ${amount.toLocaleString()} is pending. Check your phone for M-Pesa prompt.`,
            type: "info",
            read: false,
            createdAt: new Date(),
          })
        }

        return NextResponse.json({
          success: true,
          message: "STK Push initiated successfully.",
          transactionId: stkResult.transactionId,
          checkoutRequestId: stkResult.checkoutRequestId,
          reference: uniqueRef,
        })
      } else {
        throw new Error("Initiation unsuccessful")
      }
    } catch (stkError: any) {
      console.error("PalPluss STK Push API call failed:", stkError)

      // Mark transaction as failed
      await db.collection<Transaction>("transactions").updateOne(
        { _id: transaction._id },
        {
          $set: {
            status: "FAILED",
            resultCode: "1",
            resultDescription: stkError.message || "PalPluss STK Push failed to send",
            updatedAt: new Date(),
          },
        }
      )

      await db.collection(updateCollection).updateOne(
        { _id: documentId },
        {
          $set: {
            status: "failed",
            failureReason: stkError.message || "Failed to initiate PalPluss STK push",
          },
        }
      )

      return NextResponse.json({ error: stkError.message || "Failed to initiate payment prompt" }, { status: 500 })
    }
  } catch (error: any) {
    if (error.message.includes("vercel resources exceeded")) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    console.error("PalPluss stk-push route error:", error)
    return NextResponse.json({ error: "Internal payment processing error" }, { status: 500 })
  }
}
