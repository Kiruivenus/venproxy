import crypto from "crypto"

/**
 * Initiates an STK Push payment request via PalPluss API.
 */
export async function initiateStkPush({
  amount,
  phone,
  reference,
  description = "Payment",
  callbackUrl,
}: {
  amount: number
  phone: string
  reference: string
  description?: string
  callbackUrl?: string
}) {
  const apiKey = process.env.PALPLUSS_API_KEY
  if (!apiKey) {
    throw new Error("PALPLUSS_API_KEY is not configured in environment variables.")
  }

  const baseUrl = process.env.PALPLUSS_BASE_URL || "https://api.palpluss.com"
  const url = `${baseUrl}/v1/payments/stk`

  const auth = Buffer.from(`${apiKey}:`).toString("base64")

  // Generate callbackUrl from request domain if not explicitly provided
  const finalCallbackUrl = callbackUrl || `${process.env.NEXT_PUBLIC_APP_URL || ""}/api/webhooks/palpluss`

  // Format phone number to clean digits starting with 254
  let formattedPhone = phone.replace(/\D/g, "")
  if (formattedPhone.startsWith("0")) {
    formattedPhone = "254" + formattedPhone.slice(1)
  } else if (!formattedPhone.startsWith("254")) {
    formattedPhone = "254" + formattedPhone
  }

  const payload = {
    amount,
    phone: formattedPhone,
    phone_number: formattedPhone, // Compatibility duplicate
    accountReference: reference,
    account_reference: reference, // Compatibility duplicate
    transactionDesc: description,
    transaction_desc: description, // Compatibility duplicate
    callbackUrl: finalCallbackUrl,
    callback_url: finalCallbackUrl, // Compatibility duplicate
  }

  console.log(`[PalPluss SDK] Initiating STK push to ${url} with payload:`, JSON.stringify(payload))

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  const rawText = await response.text()
  let data
  try {
    data = JSON.parse(rawText)
  } catch {
    throw new Error(`PalPluss API returned non-JSON response: ${rawText.slice(0, 200)}`)
  }

  if (!response.ok) {
    throw new Error(data.message || data.error || `PalPluss STK Push failed with HTTP ${response.status}`)
  }

  const innerData = data.data || data
  return {
    success: true,
    transactionId: innerData.transactionId || innerData.id || innerData.transaction_id,
    checkoutRequestId: innerData.providerCheckoutId || innerData.checkoutRequestId || innerData.checkout_request_id || innerData.id,
    message: data.message || innerData.message || innerData.resultDescription || "STK Push initiated successfully",
    raw: data,
  }
}

/**
 * Queries the current transaction status from PalPluss.
 */
export async function queryTransaction(transactionId: string) {
  const apiKey = process.env.PALPLUSS_API_KEY
  if (!apiKey) {
    throw new Error("PALPLUSS_API_KEY is not configured in environment variables.")
  }

  const baseUrl = process.env.PALPLUSS_BASE_URL || "https://api.palpluss.com"
  const url = `${baseUrl}/v1/transactions/${transactionId}`

  const auth = Buffer.from(`${apiKey}:`).toString("base64")

  console.log(`[PalPluss SDK] Querying transaction ${transactionId} via ${url}`)

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  })

  const rawText = await response.text()
  let data
  try {
    data = JSON.parse(rawText)
  } catch {
    throw new Error(`PalPluss API returned non-JSON response: ${rawText.slice(0, 200)}`)
  }

  if (!response.ok) {
    throw new Error(data.message || data.error || `PalPluss query failed with HTTP ${response.status}`)
  }

  const innerData = data.data || data
  return {
    success: true,
    status: (innerData.status || "PENDING").toUpperCase(), // EXPECTED: SUCCESS, FAILED, PENDING, CANCELLED, EXPIRED
    amount: innerData.amount,
    phone: innerData.phone || innerData.phone_number,
    reference: innerData.accountReference || innerData.account_reference || innerData.external_reference || innerData.reference,
    receiptNumber: innerData.receiptNumber || innerData.receipt_number || innerData.mpesa_receipt || innerData.mpesaReceiptNumber,
    resultCode: innerData.resultCode || innerData.result_code || "0",
    resultDescription: innerData.resultDescription || innerData.result_description || innerData.result_desc || data.message || innerData.message || "Success",
    raw: data,
  }
}

/**
 * Verifies webhook request signature using timing-safe comparison.
 */
export function verifyWebhookSignature(headers: Headers, rawBody: string): boolean {
  const secret = process.env.PALPLUSS_WEBHOOK_SECRET
  if (!secret) {
    console.warn("[PalPluss SDK] PALPLUSS_WEBHOOK_SECRET is not configured. Webhook verification bypassed.")
    return true
  }

  const signature = 
    headers.get("x-palpluss-signature") || 
    headers.get("palpluss-signature") || 
    headers.get("x-webhook-signature") ||
    headers.get("x-signature")

  if (!signature) {
    console.error("[PalPluss SDK] Webhook signature verification failed: Missing signature header.")
    return false
  }

  try {
    const computedSignatureHex = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex")

    const computedSignatureBase64 = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("base64")

    const sigBuffer = Buffer.from(signature, signature.length === 44 ? "base64" : "hex")
    const computedBuffer = Buffer.from(
      signature.length === 44 ? computedSignatureBase64 : computedSignatureHex,
      signature.length === 44 ? "base64" : "hex"
    )

    if (sigBuffer.length !== computedBuffer.length) {
      return false
    }

    return crypto.timingSafeEqual(sigBuffer, computedBuffer)
  } catch (error) {
    console.error("[PalPluss SDK] Webhook signature verification error:", error)
    return false
  }
}
