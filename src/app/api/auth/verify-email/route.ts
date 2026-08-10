import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/auth/verify-email?token=xxx
// Bevestigt een e-mailadres (registratie of wijziging).
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.redirect(new URL('/?verify=missing', request.url))
  }

  try {
    const user = await db.user.findFirst({ where: { emailVerifyToken: token }, include: { member: true } })
    if (!user) {
      return NextResponse.redirect(new URL('/?verify=invalid', request.url))
    }

    if (user.emailVerifyExpires && user.emailVerifyExpires < new Date()) {
      return NextResponse.redirect(new URL('/?verify=expired', request.url))
    }

    const newEmail = user.pendingEmail || user.email

    if (newEmail) {
      // Controleer of het (nieuwe) adres niet al van een ander account is
      if (user.pendingEmail) {
        const clash = await db.user.findFirst({
          where: { email: user.pendingEmail, NOT: { id: user.id } },
        })
        if (clash) {
          // Terugdraaien: pending wissen, oude email blijft actief
          await db.user.update({
            where: { id: user.id },
            data: { pendingEmail: null, emailVerifyToken: null, emailVerifyExpires: null },
          })
          return NextResponse.redirect(new URL('/?verify=clash', request.url))
        }
      }

      await db.user.update({
        where: { id: user.id },
        data: {
          email: newEmail,
          pendingEmail: null,
          emailVerified: new Date(),
          emailVerifyToken: null,
          emailVerifyExpires: null,
        },
      })

      // Sync naar member-record
      if (user.member) {
        await db.member.update({
          where: { id: user.member.id },
          data: { email: newEmail },
        })
      }
    } else {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date(), emailVerifyToken: null, emailVerifyExpires: null },
      })
    }

    return NextResponse.redirect(new URL('/?verify=success', request.url))
  } catch (error) {
    console.error('Verify email error:', error)
    return NextResponse.redirect(new URL('/?verify=error', request.url))
  }
}
