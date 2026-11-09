import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"
import type { Proxy, ProxyPurchase } from "@/lib/types"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { purchaseId } = body

    if (!purchaseId) {
      return NextResponse.json({ error: "Purchase ID is required" }, { status: 400 })
    }

    const db = await getDb()
    const now = new Date()

    // 1. Fetch user's purchase
    let purchaseObjectId: ObjectId
    try {
      purchaseObjectId = new ObjectId(purchaseId)
    } catch {
      return NextResponse.json({ error: "Invalid purchase ID format" }, { status: 400 })
    }

    const purchase = await db.collection<ProxyPurchase>("purchases").findOne({
      _id: purchaseObjectId,
      userId: new ObjectId(session.user._id),
    })

    if (!purchase) {
      return NextResponse.json({ error: "Purchased proxy record not found" }, { status: 404 })
    }

    // 2. Check if purchase has expired
    if (new Date(purchase.expiresAt) <= now) {
      return NextResponse.json(
        { error: "This proxy has expired. Expired proxies do not qualify for replacement." },
        { status: 400 }
      )
    }

    // 3. Look up current proxy in proxies collection
    const currentProxy = await db.collection<Proxy>("proxies").findOne({
      _id: purchase.proxyId,
    })

    if (!currentProxy) {
      return NextResponse.json({ error: "Associated proxy could not be found" }, { status: 404 })
    }

    // 4. Strict dead verification:
    // "only dead proxies qualifies for replacement not full proxies or expired proxies"
    // "if proxy is still active then no replacement,"
    // "when replace button is clicked it should check its status on database if dead , if proxy is full then its not dead"
    if (currentProxy.status !== "dead") {
      if (currentProxy.currentUsage >= currentProxy.maxUsage) {
        return NextResponse.json(
          {
            error:
              "This proxy is at full capacity but is still active in our system (not marked as dead). Only proxies verified as dead by admin qualify for replacement.",
          },
          { status: 400 }
        )
      }
      return NextResponse.json(
        {
          error:
            "This proxy is still active in our database and has not been marked as dead by admin. If your proxy is not connecting, please contact support to verify.",
        },
        { status: 400 }
      )
    }

    // 5. Find qualifying replacement proxies:
    // Qualifying criteria:
    // - Same country
    // - Only 4 proxies qualify: 1 below (older than purchased) or any 3 above (newer than purchased)
    // - Priority 1: Proxy below. If full / unavailable, check the 3 above.

    const userOtherPurchases = await db
      .collection<ProxyPurchase>("purchases")
      .find({
        userId: new ObjectId(session.user._id),
        expiresAt: { $gt: now },
        _id: { $ne: purchase._id },
      })
      .toArray()
    const userActiveProxyIds = userOtherPurchases.map((p) => p.proxyId.toString())

    const currentCreatedAt = currentProxy.createdAt
      ? new Date(currentProxy.createdAt)
      : currentProxy._id.getTimestamp()

    // 1 below: closest older proxy in same country
    const proxyBelowCandidates = await db
      .collection<Proxy>("proxies")
      .find({
        country: currentProxy.country,
        _id: { $ne: currentProxy._id },
        $or: [
          { createdAt: { $lt: currentCreatedAt } },
          { createdAt: currentCreatedAt, _id: { $lt: currentProxy._id } },
        ],
      })
      .sort({ createdAt: -1, _id: -1 })
      .limit(1)
      .toArray()

    const proxyBelow = proxyBelowCandidates[0] || null

    // up to 3 above: closest newer proxies in same country (at top of purchased one)
    const proxiesAboveCandidates = await db
      .collection<Proxy>("proxies")
      .find({
        country: currentProxy.country,
        _id: { $ne: currentProxy._id },
        $or: [
          { createdAt: { $gt: currentCreatedAt } },
          { createdAt: currentCreatedAt, _id: { $gt: currentProxy._id } },
        ],
      })
      .sort({ createdAt: 1, _id: 1 })
      .limit(3)
      .toArray()

    function isCandidateEligible(candidate: Proxy | null): candidate is Proxy {
      if (!candidate) return false
      if (candidate.status === "dead" || candidate.status === "expired") return false
      if (candidate.isActive === false) return false
      if (new Date(candidate.expiresAt) <= now) return false
      if (candidate.currentUsage >= candidate.maxUsage) return false
      if (userActiveProxyIds.includes(candidate._id.toString())) return false
      return true
    }

    let replacementProxy: Proxy | null = null

    // 1st priority: proxy below
    if (proxyBelow && isCandidateEligible(proxyBelow)) {
      const claimed = await db.collection<Proxy>("proxies").findOneAndUpdate(
        {
          _id: proxyBelow._id,
          status: { $nin: ["dead", "expired"] },
          isActive: true,
          expiresAt: { $gt: now },
          $expr: { $lt: ["$currentUsage", "$maxUsage"] },
        },
        { $inc: { currentUsage: 1 } },
        { returnDocument: "after" }
      )
      if (claimed) {
        replacementProxy = claimed
      }
    }

    // If proxy below was not eligible or could not be claimed: consider above ones
    if (!replacementProxy) {
      for (const candidate of proxiesAboveCandidates) {
        if (isCandidateEligible(candidate)) {
          const claimed = await db.collection<Proxy>("proxies").findOneAndUpdate(
            {
              _id: candidate._id,
              status: { $nin: ["dead", "expired"] },
              isActive: true,
              expiresAt: { $gt: now },
              $expr: { $lt: ["$currentUsage", "$maxUsage"] },
            },
            { $inc: { currentUsage: 1 } },
            { returnDocument: "after" }
          )
          if (claimed) {
            replacementProxy = claimed
            break
          }
        }
      }
    }

    // If still no replacement found among qualifying 4 proxies:
    if (!replacementProxy) {
      return NextResponse.json(
        {
          error:
            "No replacement proxy is currently available in this pool (qualifying proxies are at full capacity or unavailable). Please wait for proxies to be updated or contact support.",
        },
        { status: 409 }
      )
    }

    // 6. Replacement successful! Apply database updates:
    // Decrement currentUsage on old dead proxy
    await db.collection("proxies").updateOne(
      { _id: currentProxy._id, currentUsage: { $gt: 0 } },
      { $inc: { currentUsage: -1 } }
    )

    // If new proxy reached capacity, mark isActive: false
    if (replacementProxy.currentUsage >= replacementProxy.maxUsage) {
      await db.collection<Proxy>("proxies").updateOne(
        { _id: replacementProxy._id },
        { $set: { isActive: false } }
      )
    }

    // Update purchase record
    await db.collection<ProxyPurchase>("purchases").updateOne(
      { _id: purchase._id },
      {
        $set: {
          proxyId: replacementProxy._id,
          proxy: {
            ip: replacementProxy.ip,
            port: replacementProxy.port,
            username: replacementProxy.username,
            password: replacementProxy.password,
            country: replacementProxy.country,
            countryCode: replacementProxy.countryCode,
          },
          expiresAt: replacementProxy.expiresAt,
          replacedAt: new Date(),
          previousProxyId: currentProxy._id,
        },
      }
    )

    return NextResponse.json({
      success: true,
      message: "Proxy successfully replaced with a new working proxy!",
      proxy: {
        id: purchase._id.toString(),
        proxyId: replacementProxy._id.toString(),
        ip: replacementProxy.ip,
        port: replacementProxy.port,
        username: replacementProxy.username,
        password: replacementProxy.password,
        country: replacementProxy.country,
        countryCode: replacementProxy.countryCode,
        expiresAt: replacementProxy.expiresAt,
        status: "available",
      },
    })
  } catch (error: any) {
    console.error("Proxy replacement error:", error)
    return NextResponse.json({ error: "Failed to replace proxy" }, { status: 500 })
  }
}

