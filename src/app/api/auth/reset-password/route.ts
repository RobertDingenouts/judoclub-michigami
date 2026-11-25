import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { sendEmail, buildPasswordChangedEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

// POST /api/auth/reset-password  { token, newPassword }
// Verwerkt een wachtwoord-reset via de link uit de mail.
export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json()

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Ongeldig verzoek' }, { status: 400 })
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Wachtwoord moet minimaal 8 tekens zijn' }, { status: 400 })
    }

    const user = await db.user.findFirst({ where: { resetToken: token } })
    if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      return NextResponse.json({ error: 'Deze link is ongeldig of verlopen' }, { status: 400 })
    }

    // Token atomisch claimen: een tweede (gelijktijdige) poging met dezelfde link grijpt mis
    const claimed = await db.user.updateMany({
      where: { id: user.id, resetToken: token, resetTokenExpires: { gt: new Date() } },
      data: { resetToken: null, resetTokenExpires: null },
    })
    if (claimed.count === 0) {
      return NextResponse.json({ error: 'Deze link is ongeldig of verlopen' }, { status: 400 })
    }

    const passwordHash = await hashPassword(newPassword)

    await db.user.update({
      where: { id: user.id },
      data: { passwordHash },
    })

    // Beveiligingsmelding
    if (user.email) {
      try {
        const tpl = buildPasswordChangedEmail(user.name || 'lid')
        await sendEmail({ to: user.email, subject: tpl.subject, html: tpl.html })
      } catch (mailErr) {
        console.error('Wachtwoord-gewijzigd mail mislukt:', mailErr)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Er is een fout opgetreden' }, { status: 500 })
  }
}
