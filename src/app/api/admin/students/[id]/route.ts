import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin, hashPassword } from '@/lib/auth'
import type { BeltLevel, Role, ExamStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

// GET - Get single student
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await isAdmin()
  if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 })

  const { id } = await params

  const member = await db.member.findUnique({
    where: { id },
    include: {
      user: true,
      examAttempts: { include: { results: true }, orderBy: { examDate: 'desc' } },
      courseProgress: true,
      diplomas: { orderBy: { awardedAt: 'desc' } },
    },
  })

  if (!member) return NextResponse.json({ error: 'Student niet gevonden' }, { status: 404 })

  return NextResponse.json({ member })
}

// PATCH - Update student
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await isAdmin()
  if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 })

  try {
    const { id } = await params
    const body = await request.json()

    const member = await db.member.findUnique({ where: { id } })
    if (!member) return NextResponse.json({ error: 'Student niet gevonden' }, { status: 404 })

    // Update member fields
    const memberData: any = {
      ...(body.firstName !== undefined && { firstName: body.firstName }),
      ...(body.lastName !== undefined && { lastName: body.lastName }),
      ...(body.email !== undefined && { email: body.email }),
      ...(body.phone !== undefined && { phone: body.phone }),
      ...(body.dateOfBirth !== undefined && { dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined }),
      ...(body.currentBelt !== undefined && body.currentBelt !== '' && { currentBelt: body.currentBelt as BeltLevel }),
      ...(body.currentBelt === '' && { currentBelt: null }),
      ...(body.location !== undefined && { location: body.location || null }),
      ...(body.joinDate !== undefined && { joinDate: body.joinDate ? new Date(body.joinDate) : undefined }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.trainingGroups !== undefined && { trainingGroups: body.trainingGroups }),
      ...(body.primaryGroup !== undefined && { primaryGroup: body.primaryGroup || null }),
      ...(body.emergencyContactName !== undefined && { emergencyContactName: body.emergencyContactName }),
      ...(body.emergencyContactPhone !== undefined && { emergencyContactPhone: body.emergencyContactPhone }),
      ...(body.medicalNotes !== undefined && { medicalNotes: body.medicalNotes }),
    }
    
    const updatedMember = await db.member.update({
      where: { id },
      data: memberData,
    })

    // Sync email to user if changed (so member can login)
    if (body.email !== undefined) {
      const emailValue = body.email && body.email.trim() ? body.email.trim().toLowerCase() : null
      await db.user.update({
        where: { id: member.userId },
        data: { email: emailValue },
      })
    }

    // Sync belt/role/joinDate to user if changed
    if (body.currentBelt || body.role !== undefined || body.joinDate !== undefined) {
      await db.user.update({
        where: { id: member.userId },
        data: {
          ...(body.currentBelt !== undefined && { currentBelt: body.currentBelt as BeltLevel || null }),
          ...(body.role !== undefined && { role: body.role as Role }),
          ...(body.joinDate !== undefined && { joinDate: body.joinDate ? new Date(body.joinDate) : undefined }),
        },
      })
    }

    // Set password if provided
    if (body.tempPassword && body.tempPassword.trim()) {
      const passwordHash = await hashPassword(body.tempPassword.trim())
      await db.user.update({
        where: { id: member.userId },
        data: { passwordHash },
      })
    }

    return NextResponse.json({ success: true, member: updatedMember })
  } catch (error) {
    console.error('Update student error:', error)
    const msg = error instanceof Error ? error.message : 'Onbekende fout'
    return NextResponse.json({ error: `Fout bij bijwerken student: ${msg}` }, { status: 500 })
  }
}

// DELETE - Soft delete student (or permanent with ?permanent=true)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await isAdmin()
  if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 })

  try {
    const { id } = await params
    const url = new URL(request.url)
    const permanent = url.searchParams.get('permanent') === 'true'

    if (permanent) {
      // Hard delete - also delete related records
      await db.member.delete({ where: { id } })
    } else {
      // Soft delete
      await db.member.update({ where: { id }, data: { isActive: false } })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete student error:', error)
    return NextResponse.json({ error: 'Fout bij verwijderen student' }, { status: 500 })
  }
}
