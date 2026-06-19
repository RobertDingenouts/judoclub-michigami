import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'
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

    let userId: string | null = null

    // Only create User account if email is provided
    if (email && email.trim()) {
      const existingUser = await db.user.findUnique({
        where: { email: email.trim().toLowerCase() },
      })

      if (existingUser) {
        return NextResponse.json({ error: 'Er is al een lid met dit e-mailadres' }, { status: 409 })
      }

      // Create user without password — lid moet zich eerst registreren of admin stelt wachtwoord in
      const user = await db.user.create({
        data: {
          email: email.trim().toLowerCase(),
          name: `${firstName} ${lastName}`,
          role: Role.MEMBER,
        },
      })
      userId = user.id
    }

    const member = await db.member.create({
      data: {
        userId: userId!,
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

    return NextResponse.json({
      success: true,
      member: { ...member, userId },
      hasAccount: !!userId,
      message: userId ? 'Student toegevoegd met account' : 'Student toegevoegd zonder account (geen e-mail ingevuld)',
    })
  } catch (error) {
    console.error('Create student error:', error)
    return NextResponse.json({ error: 'Fout bij aanmaken student' }, { status: 500 })
  }
}
