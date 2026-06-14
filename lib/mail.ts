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
          width: 36px;
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
