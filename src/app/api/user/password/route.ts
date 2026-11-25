import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { verifyPassword, hashPassword } from '@/lib/auth'
import { sendEmail, buildPasswordChangedEmail } from '@/lib/email'
import { rateLimit, clientIp } from '@/lib/ratelimit'

export const dynamic = 'force-dynamic'

// POST - Change user password
export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  if (!rateLimit('pwchange:' + clientIp(request), 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Te veel pogingen — probeer later opnieuw.' }, { status: 429 })
  }

  try {
    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Beide wachtwoorden zijn verplicht' }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Nieuw wachtwoord moet minimaal 8 tekens zijn' }, { status: 400 })
    }

    // Verify current password (getCurrentUser bevat bewust geen hash — vers opzoeken)
    const dbUser = await db.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } })
    if (!dbUser?.passwordHash) {
      return NextResponse.json({ error: 'Wachtwoord wijzigen niet mogelijk (geen wachtwoord ingesteld)' }, { status: 400 })
    }

    const valid = await verifyPassword(currentPassword, dbUser.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Huidig wachtwoord is onjuist' }, { status: 401 })
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword)

    // Update password
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
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

    return NextResponse.json({ success: true, message: 'Wachtwoord succesvol gewijzigd' })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json({ error: 'Fout bij wijzigen wachtwoord' }, { status: 500 })
  }
}