import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin, hashPassword } from '@/lib/auth'
import { sendEmail, buildAdminWelcomeEmail } from '@/lib/email'
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
      user: { omit: { passwordHash: true, resetToken: true, resetTokenExpires: true } },
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

    // Datumvelden: lege string/null mag wissen; onparsebare invoer afwijzen i.p.v. Invalid Date
    for (const veld of ['dateOfBirth', 'joinDate'] as const) {
      if (body[veld] !== undefined && body[veld] !== null && body[veld] !== '' && isNaN(new Date(body[veld]).getTime())) {
        return NextResponse.json({ error: `Ongeldige datum in ${veld}` }, { status: 400 })
      }
    }

    // Update member fields
    const memberData: any = {
      ...(body.firstName !== undefined && { firstName: body.firstName }),
      ...(body.lastName !== undefined && { lastName: body.lastName }),
      ...(body.email !== undefined && { email: body.email ? String(body.email).trim().toLowerCase() : null }),
      ...(body.phone !== undefined && { phone: body.phone }),
      ...(body.dateOfBirth !== undefined && { dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null }),
      ...(body.currentBelt !== undefined && body.currentBelt !== '' && { currentBelt: body.currentBelt as BeltLevel }),
      ...(body.currentBelt === '' && { currentBelt: null }),
      ...(body.location !== undefined && { location: body.location || null }),
      ...(body.gender !== undefined && { gender: body.gender || null }),
      ...(body.phone2 !== undefined && { phone2: body.phone2 || null }),
      ...(body.whatsappGroup !== undefined && { whatsappGroup: body.whatsappGroup || null }),
      ...(body.address !== undefined && { address: body.address || null }),
      ...(body.postalCode !== undefined && { postalCode: body.postalCode || null }),
      ...(body.city !== undefined && { city: body.city || null }),
      ...(body.remarks !== undefined && { remarks: body.remarks || null }),
      ...(body.clubStatus !== undefined && body.clubStatus && { clubStatus: body.clubStatus }),
      ...(body.isTrainer !== undefined && { isTrainer: body.isTrainer }),
      ...(body.portraitRights !== undefined && { portraitRights: body.portraitRights }),
      ...(body.nameMention !== undefined && { nameMention: body.nameMention }),
      ...(body.joinDate !== undefined && { joinDate: body.joinDate ? new Date(body.joinDate) : undefined }), // joinDate is niet-nullbaar: legen kan niet wissen, only set
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
    if (body.currentBelt !== undefined || body.role !== undefined || body.joinDate !== undefined) {
      await db.user.update({
        where: { id: member.userId },
        data: {
          ...(body.currentBelt !== undefined && { currentBelt: body.currentBelt as BeltLevel || null }),
          ...(body.role !== undefined && { role: body.role as Role }),
          ...(body.joinDate !== undefined && { joinDate: body.joinDate ? new Date(body.joinDate) : undefined }),
        },
      })
    }

    // Sync active status to user (gedeactiveerd lid = geen inlog meer)
    if (body.isActive !== undefined) {
      await db.user.update({
        where: { id: member.userId },
        data: { is_active: body.isActive },
      })
    }

    // Set password if provided (only when the member has a linked user account)
    if (body.tempPassword && body.tempPassword.trim() && member.userId) {
      const passwordHash = await hashPassword(body.tempPassword.trim())
      await db.user.update({
        where: { id: member.userId },
        data: { passwordHash },
      })

      // Welkomstmail met tijdelijk wachtwoord (best-effort)
      if (body.email) {
        try {
          const tpl = buildAdminWelcomeEmail(
            member.firstName || (body.firstName as string) || 'lid',
            body.email.trim().toLowerCase(),
            body.tempPassword.trim()
          )
          await sendEmail({ to: body.email.trim().toLowerCase(), subject: tpl.subject, html: tpl.html })
        } catch (mailErr) {
          console.error('Welkomstmail mislukt:', mailErr)
        }
      }
    }

    return NextResponse.json({ success: true, member: updatedMember })
  } catch (error) {
    console.error('Update student error:', error)
    const msg = 'Bewerken mislukt (details in serverlogboek)'
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
      // Hard delete - cascade: exam results → exam attempts → diplomas →
      // course progress → member → user (alle FK's opschonen, anders P2003)
      const member = await db.member.findUnique({
        where: { id },
        include: { user: true },
      })
      if (!member) {
        return NextResponse.json({ error: 'Student niet gevonden' }, { status: 404 })
      }
      // Alle FK-tabellen op Member opschonen (schema-check 2026-10: Attendance,
      // BondHistory, Competition, CourseProgress, Diploma, ExamAttempt, Payment).
      // Ontbraken van Attendance/Payment/BondHistory/Competition gaven P2003
      // ("Fout bij verwijderen student") bij definitief verwijderen uit archief.
      // MembershipApplication.memberId bevat het User-id (geen FK, dus geen
      // P2003), maar netjes op null zetten houdt de inschrijvingen consistent.
      await db.membershipApplication.updateMany({ where: { memberId: member.userId }, data: { memberId: null } })
      await db.$transaction([
        db.examResult.deleteMany({ where: { attempt: { memberId: id } } }),
        db.examAttempt.deleteMany({ where: { memberId: id } }),
        db.diploma.deleteMany({ where: { recipientId: id } }),
        db.courseProgress.deleteMany({ where: { memberId: id } }),
        db.attendance.deleteMany({ where: { memberId: id } }),
        db.payment.deleteMany({ where: { memberId: id } }),
        db.bondHistory.deleteMany({ where: { memberId: id } }),
        db.competition.deleteMany({ where: { memberId: id } }),
        db.member.delete({ where: { id } }),
        db.user.delete({ where: { id: member.userId } }),
      ])
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
