import { env } from '../config/env.js'

interface EmailPayload {
  to: string
  subject: string
  html: string
}

async function sendEmail(payload: EmailPayload): Promise<void> {
  if (!env.BREVO_API_KEY && !env.RESEND_API_KEY) {
    console.log('[Email] No email provider configured. Would have sent:', payload.subject, 'to', payload.to)
    return
  }

  // Use Resend if configured
  if (env.RESEND_API_KEY) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'AEFORYN <noreply@aeforyn.com>',
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
      }),
    })
    if (!response.ok) {
      const err = await response.text()
      console.error('[Email] Resend error:', err)
    }
    return
  }

  // Fall back to Brevo SMTP via API
  if (env.BREVO_API_KEY) {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'AEFORYN', email: 'noreply@aeforyn.com' },
        to: [{ email: payload.to }],
        subject: payload.subject,
        htmlContent: payload.html,
      }),
    })
    if (!response.ok) {
      const err = await response.text()
      console.error('[Email] Brevo error:', err)
    }
  }
}

export async function sendDelegationAccessEmail(params: {
  delegateEmail: string
  delegateName: string
  ownerName: string
  platforms: string[]
  expiresAt: Date
  accessToken: string
}): Promise<void> {
  const { delegateEmail, delegateName, ownerName, platforms, expiresAt, accessToken } = params
  const accessUrl = `${env.FRONTEND_URL}/delegate-access?token=${accessToken}`
  const expiryFormatted = expiresAt.toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg', dateStyle: 'medium', timeStyle: 'short' })
  const platformList = platforms.map((p) => `<li style="margin: 4px 0;">${p}</li>`).join('')

  await sendEmail({
    to: delegateEmail,
    subject: `${ownerName} has given you temporary access via AEFORYN`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Inter', system-ui, sans-serif; background: #071E1C; color: #F0FDF4; max-width: 560px; margin: 0 auto; padding: 40px 24px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <span style="font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 22px; color: #C9A84C; letter-spacing: 4px;">AEFORYN</span>
  </div>
  <div style="background: #0A2422; border: 1px solid rgba(201,168,76,0.15); border-radius: 16px; padding: 32px;">
    <h1 style="font-size: 22px; font-weight: 700; color: #F0FDF4; margin: 0 0 8px;">Hi ${delegateName},</h1>
    <p style="color: #86EFAC; margin: 0 0 24px; line-height: 1.6;">
      <strong style="color: #F0FDF4;">${ownerName}</strong> has granted you temporary access to the following platform credential(s) via AEFORYN's secure access system:
    </p>
    <ul style="color: #86EFAC; padding-left: 20px; margin: 0 0 24px;">
      ${platformList}
    </ul>
    <p style="color: #86EFAC; margin: 0 0 24px; line-height: 1.6;">
      Use the secure link below to access the credentials. Each password can only be revealed once in this session.
    </p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${accessUrl}" style="background: linear-gradient(135deg, #C9A84C, #9A7A35); color: #071E1C; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 14px; text-decoration: none; display: inline-block;">
        Access Secure Link
      </a>
    </div>
    <div style="background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 10px; padding: 16px; margin: 0 0 24px;">
      <p style="color: #EF4444; font-weight: 700; margin: 0 0 6px;">⚠ Important</p>
      <p style="color: #86EFAC; margin: 0; line-height: 1.6; font-size: 14px;">
        <strong style="color: #F0FDF4;">This link expires at ${expiryFormatted} SAST.</strong> Once expired it cannot be reused. Do not share this link with anyone else. All activity in this session is logged and visible to ${ownerName}.
      </p>
    </div>
    <p style="color: rgba(134,239,172,0.5); font-size: 12px; margin: 0; text-align: center;">
      This email was sent by AEFORYN on behalf of ${ownerName}. If you were not expecting this, please ignore it.
    </p>
  </div>
</body>
</html>`,
  })
}

export async function sendExpiryOwnerEmail(params: {
  ownerEmail: string
  delegateName: string
  platforms: string[]
}): Promise<void> {
  const { ownerEmail, delegateName, platforms } = params
  const platformList = platforms.map((p) => `<strong>${p}</strong>`).join(', ')

  await sendEmail({
    to: ownerEmail,
    subject: `Action required: Change your passwords after ${delegateName}'s session`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Inter', system-ui, sans-serif; background: #071E1C; color: #F0FDF4; max-width: 560px; margin: 0 auto; padding: 40px 24px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <span style="font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 22px; color: #C9A84C; letter-spacing: 4px;">AEFORYN</span>
  </div>
  <div style="background: #0A2422; border: 1px solid rgba(201,168,76,0.15); border-radius: 16px; padding: 32px;">
    <h1 style="font-size: 22px; font-weight: 700; color: #F0FDF4; margin: 0 0 8px;">Session ended</h1>
    <p style="color: #86EFAC; margin: 0 0 16px; line-height: 1.6;">
      <strong style="color: #F0FDF4;">${delegateName}'s</strong> temporary access has expired. Their secure link is now invalid.
    </p>
    <div style="background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.2); border-radius: 10px; padding: 16px; margin: 0 0 24px;">
      <p style="color: #F59E0B; font-weight: 700; margin: 0 0 6px;">🔐 Important security step</p>
      <p style="color: #86EFAC; margin: 0; line-height: 1.6; font-size: 14px;">
        You should now change your password on ${platformList} to keep your account secure. AEFORYN can guide you through this — open the app and check your notifications.
      </p>
    </div>
    <div style="text-align: center;">
      <a href="${env.FRONTEND_URL}/shared-access" style="background: linear-gradient(135deg, #C9A84C, #9A7A35); color: #071E1C; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 13px; text-decoration: none; display: inline-block;">
        View in AEFORYN
      </a>
    </div>
  </div>
</body>
</html>`,
  })
}
