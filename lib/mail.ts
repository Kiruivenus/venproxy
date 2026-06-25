import nodemailer from "nodemailer"
import { getDb } from "./mongodb"

interface SendEmailOptions {
    to: string
    subject: string
    html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
    // 1. Fetch dynamic settings from database
    let smtpSettings: any = null
    try {
        const db = await getDb()
        smtpSettings = await db.collection("website_settings").findOne({})
    } catch (e) {
        console.error("Failed to fetch SMTP settings from DB:", e)
    }

    const host = smtpSettings?.smtpHost || (process.env.GMAIL_USER ? "smtp.gmail.com" : "")
    const user = smtpSettings?.smtpUser || process.env.GMAIL_USER
    const pass = smtpSettings?.smtpPass || process.env.GMAIL_APP_PASSWORD
    const port = smtpSettings?.smtpPort ? Number(smtpSettings.smtpPort) : 587
    const sender = smtpSettings?.smtpSender || user || "noreply@rayproxy.com"
    const companyName = smtpSettings?.companyName || "RayProxy Hub"

    // 2. Fallback to debug log if no credentials are set
    if (!user || !pass) {
        console.log("\n=========================================")
        console.log("[SMTP DEBUG FALLBACK] Credentials missing in DB and .env")
        console.log(`To: ${to}`)
        console.log(`Subject: ${subject}`)
        console.log("HTML Content:")
        console.log(html)
        console.log("=========================================\n")
        return true
    }

    // 3. Create dynamic transporter
    try {
        const dynamicTransporter = nodemailer.createTransport({
            host: host || "smtp.gmail.com",
            port: port,
            secure: port === 465,
            auth: {
                user: user,
                pass: pass,
            },
        })

        const mailOptions = {
            from: `"${companyName}" <${sender}>`,
            to,
            subject,
            html,
        }

        const info = await dynamicTransporter.sendMail(mailOptions)
        console.log("Email sent: %s", info.messageId)
        return true
    } catch (error) {
        console.error("Error sending email:", error)
        return false
    }
}

export function getStyledEmailTemplate(
    title: string,
    content: string,
    footerText: string,
    companyName: string = "RayProxy Hub",
    companyLogoUrl: string = ""
) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #1a1a1a;
          background-color: #f4f5f7;
          margin: 0;
          padding: 0;
        }
        .wrapper {
          width: 100%;
          background-color: #f4f5f7;
          padding: 40px 0;
        }
        .container {
          max-width: 560px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid #e1e4ea;
        }
        .header {
          padding: 32px 32px 20px 32px;
          text-align: center;
          border-bottom: 1px solid #f0f2f5;
        }
        .logo-container {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .logo-img {
          height: 36px;
          width: auto;
          max-width: 180px;
          object-fit: contain;
          border-radius: 8px;
        }
        .logo-text {
          font-size: 20px;
          font-weight: 850;
          color: #0f172a;
          letter-spacing: -0.5px;
          text-transform: capitalize;
        }
        .content {
          padding: 32px;
        }
        .content h2 {
          color: #0f172a;
          font-size: 22px;
          font-weight: 700;
          margin-top: 0;
          margin-bottom: 16px;
          letter-spacing: -0.4px;
        }
        .content p {
          color: #475569;
          font-size: 15px;
          margin-top: 0;
          margin-bottom: 16px;
        }
        .code-box {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          margin: 24px 0;
        }
        .code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 38px;
          font-weight: 800;
          color: #2563eb;
          letter-spacing: 6px;
          line-height: 1;
        }
        .footer {
          padding: 24px 32px;
          text-align: center;
          font-size: 13px;
          color: #94a3b8;
          background-color: #f8fafc;
          border-top: 1px solid #f0f2f5;
        }
        .footer p {
          margin: 4px 0;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <div class="logo-container">
              ${companyLogoUrl ? `
                <img src="${companyLogoUrl}" alt="${companyName}" class="logo-img" />
              ` : `
                <div style="background-color: #2563eb; color: #ffffff; height: 32px; width: 32px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-weight: 900; font-size: 16px;">V</div>
              `}
              <span class="logo-text">${companyName}</span>
            </div>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p>${footerText}</p>
            <p>&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
    `
}

export async function sendDepositPendingEmail(email: string, name: string, amount: number, reference: string): Promise<boolean> {
    let companyName = "RayProxy Hub"
    let companyLogoUrl = ""
    try {
        const db = await getDb()
        const settings = await db.collection("website_settings").findOne({})
        if (settings) {
            companyName = settings.companyName || "RayProxy Hub"
            companyLogoUrl = settings.companyLogoUrl || ""
        }
    } catch (e) {
        console.error("Failed to query settings for pending deposit email:", e)
    }

    const content = `
        <h2>Deposit Initiated</h2>
        <p>Hi ${name || "User"},</p>
        <p>A deposit of <strong>KES ${amount.toLocaleString()}</strong> has been initiated for your ${companyName} account. Please verify the details below:</p>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 18px 0; font-size: 14px;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="color: #64748b; padding: 4px 0;">Reference:</td>
                    <td style="font-weight: bold; text-align: right; color: #0f172a;">${reference}</td>
                </tr>
                <tr>
                    <td style="color: #64748b; padding: 4px 0;">Amount:</td>
                    <td style="font-weight: bold; text-align: right; color: #0f172a;">KES ${amount.toLocaleString()}</td>
                </tr>
                <tr>
                    <td style="color: #64748b; padding: 4px 0;">Status:</td>
                    <td style="font-weight: bold; text-align: right; color: #f59e0b;">Pending PIN entry</td>
                </tr>
            </table>
        </div>
        <p>Check your M-Pesa phone for a prompt asking you to enter your secure PIN to complete this payment. If you did not initiate this request, you can ignore the M-Pesa prompt.</p>
    `
    const footerText = "Safe and Secure Payments."
    const html = getStyledEmailTemplate("Deposit Initiated", content, footerText, companyName, companyLogoUrl)

    return await sendEmail({
        to: email,
        subject: `${companyName} - Deposit Initiated (KES ${amount.toLocaleString()})`,
        html,
    })
}

export async function sendDepositSuccessfulEmail(email: string, name: string, amount: number, reference: string, receiptNumber: string): Promise<boolean> {
    let companyName = "RayProxy Hub"
    let companyLogoUrl = ""
    try {
        const db = await getDb()
        const settings = await db.collection("website_settings").findOne({})
        if (settings) {
            companyName = settings.companyName || "RayProxy Hub"
            companyLogoUrl = settings.companyLogoUrl || ""
        }
    } catch (e) {
        console.error("Failed to query settings for successful deposit email:", e)
    }

    const content = `
        <div style="text-align: center; margin-bottom: 20px;">
            <div style="display: inline-flex; align-items: center; justify-content: center; height: 50px; width: 50px; border-radius: 50%; color: #ffffff; font-size: 24px; font-weight: bold; margin-bottom: 10px; background-color: #10b981;">✓</div>
        </div>
        <h2>Deposit Successful!</h2>
        <p>Hi ${name || "User"},</p>
        <p>Your deposit has been completed successfully and credited to your wallet balance. Here is your transaction summary:</p>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 18px 0; font-size: 14px;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="color: #64748b; padding: 4px 0;">Reference:</td>
                    <td style="font-weight: bold; text-align: right; color: #0f172a;">${reference}</td>
                </tr>
                <tr>
                    <td style="color: #64748b; padding: 4px 0;">Receipt Number:</td>
                    <td style="font-weight: bold; text-align: right; color: #0f172a;">${receiptNumber}</td>
                </tr>
                <tr>
                    <td style="color: #64748b; padding: 4px 0;">Amount:</td>
                    <td style="font-weight: bold; text-align: right; color: #10b981;">KES ${amount.toLocaleString()}</td>
                </tr>
                <tr>
                    <td style="color: #64748b; padding: 4px 0;">Status:</td>
                    <td style="font-weight: bold; text-align: right; color: #10b981;">Completed</td>
                </tr>
            </table>
        </div>
        <p>You can now use your updated balance to purchase proxies or email accounts directly from your dashboard.</p>
    `
    const footerText = "Thank you for using our services."
    const html = getStyledEmailTemplate("Deposit Successful", content, footerText, companyName, companyLogoUrl)

    return await sendEmail({
        to: email,
        subject: `${companyName} - Deposit Successful (KES ${amount.toLocaleString()})`,
        html,
    })
}

export async function sendDepositFailedEmail(email: string, name: string, amount: number, reference: string, reason: string): Promise<boolean> {
    let companyName = "RayProxy Hub"
    let companyLogoUrl = ""
    try {
        const db = await getDb()
        const settings = await db.collection("website_settings").findOne({})
        if (settings) {
            companyName = settings.companyName || "RayProxy Hub"
            companyLogoUrl = settings.companyLogoUrl || ""
        }
    } catch (e) {
        console.error("Failed to query settings for failed deposit email:", e)
    }

    const content = `
        <div style="text-align: center; margin-bottom: 20px;">
            <div style="display: inline-flex; align-items: center; justify-content: center; height: 50px; width: 50px; border-radius: 50%; color: #ffffff; font-size: 24px; font-weight: bold; margin-bottom: 10px; background-color: #ef4444;">✗</div>
        </div>
        <h2>Deposit Failed</h2>
        <p>Hi ${name || "User"},</p>
        <p>We are sorry, but your deposit request of <strong>KES ${amount.toLocaleString()}</strong> has failed. Details of the transaction are below:</p>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 18px 0; font-size: 14px;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="color: #64748b; padding: 4px 0;">Reference:</td>
                    <td style="font-weight: bold; text-align: right; color: #0f172a;">${reference}</td>
                </tr>
                <tr>
                    <td style="color: #64748b; padding: 4px 0;">Amount:</td>
                    <td style="font-weight: bold; text-align: right; color: #0f172a;">KES ${amount.toLocaleString()}</td>
                </tr>
                <tr>
                    <td style="color: #64748b; padding: 4px 0;">Failure Reason:</td>
                    <td style="font-weight: bold; text-align: right; color: #ef4444;">${reason || "Transaction cancelled by user or timed out."}</td>
                </tr>
            </table>
        </div>
        <p>No funds were deducted from your M-Pesa account. If funds were deducted, please contact support and provide the reference code above for manual verification.</p>
    `
    const footerText = "Need help? Contact support."
    const html = getStyledEmailTemplate("Deposit Failed", content, footerText, companyName, companyLogoUrl)

    return await sendEmail({
        to: email,
        subject: `${companyName} - Deposit Failed (KES ${amount.toLocaleString()})`,
        html,
    })
}
