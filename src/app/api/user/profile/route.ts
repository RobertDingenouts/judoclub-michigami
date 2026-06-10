import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// PATCH - Update user profile
export async function PATCH(request: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  try {
    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      emergencyContactName,
      emergencyContactPhone,
      medicalNotes,
    } = body

    // If email is being changed, update user record too
    if (email && email !== user.email) {
      const existing = await db.user.findUnique({ where: { email } })
      if (existing) {
        return NextResponse.json({ error: 'Dit e-mailadres is al in gebruik' }, { status: 400 })
      }
      await db.user.update({
        where: { id: user.id },
        data: { email },
      })
    }

    const updatedMember = await db.member.update({
      where: { id: user.member!.id },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(dateOfBirth !== undefined && { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined }),
        ...(emergencyContactName !== undefined && { emergencyContactName }),
        ...(emergencyContactPhone !== undefined && { emergencyContactPhone }),
        ...(medicalNotes !== undefined && { medicalNotes }),
      },
      include: { user: true },
    })

    // Sync name to user if changed
    if (firstName || lastName) {
      await db.user.update({
        where: { id: user.id },
        data: { name: `${updatedMember.firstName} ${updatedMember.lastName}` },
      })
    }

    return NextResponse.json({ success: true, member: updatedMember })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Fout bij bijwerken profiel' }, { status: 500 })
  }
}

// GET - Get current user profile (for consistency)
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  return NextResponse.json({
    success: true,
    member: {
      firstName: user.member?.firstName || '',
      lastName: user.member?.lastName || '',
      email: user.member?.email || user.email,
      phone: user.member?.phone || '',
      dateOfBirth: user.member?.dateOfBirth?.toISOString().split('T')[0] || '',
      emergencyContactName: user.member?.emergencyContactName || '',
      emergencyContactPhone: user.member?.emergencyContactPhone || '',
      medicalNotes: user.member?.medicalNotes || '',
    },
  })
}