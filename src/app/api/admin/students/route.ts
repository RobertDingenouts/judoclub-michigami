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

    // Create user record (password hashed with bcrypt)
    const user = await db.user.create({
      data: {
        email: email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@local`,
        name: `${firstName} ${lastName}`,
        role: Role.MEMBER,
        currentBelt: currentBelt as BeltLevel | null,
      },
    })

    const member = await db.member.create({
      data: {
        userId: user.id,
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        currentBelt: currentBelt as BeltLevel | null,
        location: location || null,
        emergencyContactName,
        emergencyContactPhone,
        medicalNotes,
      },
    })

    return NextResponse.json({ success: true, member: { ...member, userId: user.id } })
  } catch (error) {
    console.error('Create student error:', error)
    return NextResponse.json({ error: 'Fout bij aanmaken student' }, { status: 500 })
  }
}
