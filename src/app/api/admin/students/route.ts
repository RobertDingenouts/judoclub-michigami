import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin, hashPassword } from '@/lib/auth'
import { sendEmail, buildAccountWelcomeEmail } from '@/lib/email'
import type { BeltLevel } from '@prisma/client'
import { Role } from '@prisma/client'

export const dynamic = 'force-dynamic'

// GET - List students (handled by page.tsx server component)
export async function GET(request: Request) {
  const admin = await isAdmin()
  if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  const belt = searchParams.get('belt') || ''

  const where: any = { isActive: true }
  if (query) {
    where.OR = [
      { firstName: { contains: query, mode: 'insensitive' } },
      { lastName: { contains: query, mode: 'insensitive' } },
    ]
  }
  if (belt) where.currentBelt = belt as BeltLevel

  const students = await db.member.findMany({
    where,
    orderBy: { lastName: 'asc' },
    include: {
      user: { select: { email: true, role: true, currentBelt: true } },
      examAttempts: { where: { status: 'COMPLETED_PASSED' }, select: { beltLevel: true, examDate: true } },
    },
  })

  return NextResponse.json({ students })
}

// POST - Create new student
export async function POST(request: Request) {
  const admin = await isAdmin()
  if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, dateOfBirth, currentBelt, location, emergencyContactName, emergencyContactPhone, medicalNotes } = body

    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'Naam is verplicht' }, { status: 400 })
    }

    const normalizedEmail = email?.trim() ? email.trim().toLowerCase() : null
    const hasEmail = !!normalizedEmail

    let tempPassword: string | null = null
    let mailSent = false
    let userId: string = ''

    // Check if email already exists (only if email provided)
    if (hasEmail) {
      const existingUser = await db.user.findUnique({
        where: { email: normalizedEmail },
      })

      if (existingUser) {
        return NextResponse.json({ error: 'Er is al een lid met dit e-mailadres' }, { status: 409 })
      }
    }

    // Create User record (required for Member relation).
    // Met e-mail = direct inlogbaar account: tijdelijk wachtwoord + welkomstmail.
    let passwordHash: string | null = null
    if (hasEmail) {
      tempPassword = crypto.randomUUID().replace(/-/g, '').slice(0, 8)
      passwordHash = await hashPassword(tempPassword)
    }

    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        name: `${firstName} ${lastName}`,
        role: Role.MEMBER,
        passwordHash,
      },
    })
    userId = user.id

    const member = await db.member.create({
      data: {
        userId,
        firstName,
        lastName,
        email: email?.trim() || null,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        currentBelt: currentBelt as BeltLevel | null,
        location: location || null,
        emergencyContactName,
        emergencyContactPhone,
        medicalNotes,
      },
    })

    // Welkomstmail met tijdelijk wachtwoord.
    // Best-effort: toevoegen slaagt ook als de mail niet doorkomt, het tijdelijke
    // wachtwoord wordt hier in de UI weergegeven.
    if (hasEmail && tempPassword) {
      try {
        const tpl = buildAccountWelcomeEmail(`${firstName} ${lastName}`.trim(), normalizedEmail, tempPassword)
        await sendEmail({ to: normalizedEmail, subject: tpl.subject, html: tpl.html })
        mailSent = true
      } catch (mailErr) {
        console.error('[ADMIN/STUDENTS] Welkomstmail mislukt:', mailErr)
      }
    }

    return NextResponse.json({
      success: true,
      member: { ...member, userId },
      hasAccount: !!userId,
      tempPassword,
      mailSent,
      message: hasEmail
        ? (mailSent
            ? 'Student toegevoegd — account aangemaakt en inloggegevens verstuurd'
            : 'Student toegevoegd — account aangemaakt, e-mail kon niet versturen (gebruik het tijdelijke wachtwoord hieronder)')
        : 'Student toegevoegd zonder account (geen e-mail ingevuld)',
    })
  } catch (error) {
    console.error('Create student error:', error)
    return NextResponse.json({ error: 'Fout bij aanmaken student' }, { status: 500 })
  }
}
