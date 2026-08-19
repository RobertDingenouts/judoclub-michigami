import { NextResponse } from 'next/server'
import { getCurrentUser, generateToken } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendEmail, buildVerificationEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

// POST /api/auth/resend-verification
// Stuurt een verse e-mailverificatielink naar het (al ingevulde) adres van de
// ingelogde gebruiker. Nodig voor accounts die vóór de e-mailverificatie-logica
// zijn aangemaakt: die hebben geen verificatiemail ooit ontvangen en konden
// hun adres niet bevestigen.
export async function POST() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
  }

  const email = (user.email || '').trim().toLowerCase()
  if (!email) {
    return NextResponse.json({ error: 'Geen e-mailadres ingevuld' }, { status: 400 })
  }

  if (user.emailVerified) {
    return NextResponse.json({ success: true, message: 'Je e-mail is al bevestigd.' })
  }

  try {
    const token = generateToken()
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 uur
    await db.user.update({
      where: { id: user.id },
      data: { emailVerifyToken: token, emailVerifyExpires: expires },
    })

    const tpl = buildVerificationEmail(user.name || 'lid', token)
    await sendEmail({ to: email, subject: tpl.subject, html: tpl.html })

    return NextResponse.json({
      success: true,
      message: `We hebben een nieuwe bevestigingsmail gestuurd naar ${email}.`,
    })
  } catch (mailErr) {
    console.error('Resend verificatiemail mislukt:', mailErr)
    return NextResponse.json(
      {
        success: false,
        error:
          'De e-mail kon niet verzonden worden (SMTP-configuratie mist op deze server). Neem contact op met de club om je adres te laten bevestigen.',
      },
      { status: 502 }
    )
  }
}