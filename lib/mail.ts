import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
})

interface SendEmailOptions {
    to: string
    subject: string
    html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
    const mailOptions = {
        from: `"RayProxy Hub" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html,
    }

    try {
        const info = await transporter.sendMail(mailOptions)
        console.log("Email sent: %s", info.messageId)
        return true
    } catch (error) {
        console.error("Error sending email:", error)
        return false
    }
}

export function getStyledEmailTemplate(title: string, content: string, footerText: string) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #e0e0e0;
          background-color: #0a0a0a;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #161616;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          border: 1px solid #333;
        }
        .header {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          color: #ffffff;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: 1px;
        }
        .content {
          padding: 40px 30px;
        }
        .content h2 {
          color: #ffffff;
          margin-top: 0;
        }
        .code-box {
          background-color: #000000;
          border: 1px solid #3b82f6;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 25px 0;
        }
        .code {
          font-family: 'Courier New', Courier, monospace;
          font-size: 36px;
          font-weight: 700;
          color: #3b82f6;
          letter-spacing: 8px;
        }
        .footer {
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
          background-color: #0f0f0f;
          border-top: 1px solid #222;
        }
        .btn {
          display: inline-block;
          padding: 12px 24px;
          background-color: #3b82f6;
          color: #ffffff;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>RAYPROXY HUB</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>${footerText}</p>
          <p>&copy; ${new Date().getFullYear()} RayProxy Hub. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
