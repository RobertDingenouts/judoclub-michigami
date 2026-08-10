import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateToken } from '@/lib/auth'
import { sendEmail, buildPasswordResetEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

// POST /api/auth/forgot-password  { email }
// Stuurt een reset-link als het account bestaat (geen info-lek: altijd 200).
export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ success: true })
    }

    const normalized = String(email).trim().toLowerCase()
    const user = await db.user.findFirst({ where: { email: normalized } })

    if (user) {
      const token = generateToken()
      const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 uur

      await db.user.update({
        where: { id: user.id },
        data: { resetToken: token, resetTokenExpires: expires },
      })

      try {
        const tpl = buildPasswordResetEmail(user.name || 'lid', token)
        await sendEmail({ to: normalized, subject: tpl.subject, html: tpl.html })
      } catch (mailErr) {
        console.error('Resetmail mislukt:', mailErr)
        return NextResponse.json(
          { success: false, error: 'Kon geen e-mail versturen. Probeer later opnieuw.' },
          { status: 500 }
        )
      }
    }

    // Altijd succes (ook als het adres niet bestaat) om account-enumeration te voorkomen
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ success: false, error: 'Er is een fout opgetreden' }, { status: 500 })
  }
}
