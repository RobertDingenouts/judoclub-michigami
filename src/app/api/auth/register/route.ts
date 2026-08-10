import { NextRequest, NextResponse } from 'next/server'
import { register, generateToken } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendEmail, buildVerificationEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body as { name: string; email: string; password: string }

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Vul alle velden in' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Wachtwoord moet minimaal 6 karakters zijn' },
        { status: 400 }
      )
    }

    const result = await register(name, email, password)
    if (!result.success) {
      return NextResponse.json(result, { status: 409 })
    }

    // Verificatiemail versturen
    try {
      const normalized = email.trim().toLowerCase()
      const user = await db.user.findFirst({ where: { email: normalized } })
      if (user) {
        const token = generateToken()
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 uur
        await db.user.update({
          where: { id: user.id },
          data: { emailVerifyToken: token, emailVerifyExpires: expires },
        })
        const tpl = buildVerificationEmail(name.trim(), token)
        await sendEmail({ to: normalized, subject: tpl.subject, html: tpl.html })
      }
    } catch (mailErr) {
      // Registratie is gelukt; verificatiemail is best-effort
      console.error('Verificatiemail na registratie mislukt:', mailErr)
    }

    return NextResponse.json({ success: true, user: result.user })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { success: false, error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}
