import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { BeltLevel, ExamStatus, DiplomaType } from '@prisma/client'
import { verifCode } from '@/lib/examens'

export const dynamic = 'force-dynamic'

// PATCH /api/admin/examens/attempts/<id>
// body: { status?, beltLevel?, examDate?, examiner?, categoryResults?, notes? }
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  const { id } = await params
  const body = await request.json()

  const data: any = {}
  for (const k of ['status', 'beltLevel', 'examDate', 'examiner', 'categoryResults', 'notes'] as const) {
    if (body[k] !== undefined) data[k] = body[k]
  }
  if (body.status === 'PASSED') data.status = ExamStatus.COMPLETED_PASSED
  if (body.status === 'FAILED') data.status = ExamStatus.COMPLETED_FAILED
  if (typeof data.examDate === 'string') data.examDate = new Date(data.examDate + 'T12:00:00')

  const bestaand = await db.examAttempt.findUnique({ where: { id }, include: { member: { select: { id: true, firstName: true, lastName: true, userId: true } }, diploma: { select: { id: true } } } })
  if (!bestaand) return NextResponse.json({ error: 'Examen niet gevonden' }, { status: 404 })

  const probeerGeslaagd = body.status === 'PASSED' && bestaand.status !== ExamStatus.COMPLETED_PASSED

  const result = await db.$transaction(async (tx) => {
    const updated = await tx.examAttempt.update({ where: { id }, data })

    if (probeerGeslaagd) {
      const belt = updated.beltLevel as BeltLevel
      const datum = updated.examDate ?? new Date()
      // 1. bondhistorie: graad vastleggen op examen Datum
      await tx.bondHistory.upsert({
        where: { memberId_belt: { memberId: bestaand.memberId, belt } },
        create: { memberId: bestaand.memberId, belt, awardedAt: datum, source: 'EXAM' },
        update: { awardedAt: datum, source: 'EXAM' },
      })
      // 2. huidige band optrekken
      await tx.member.update({ where: { id: bestaand.memberId }, data: { currentBelt: belt } })
      await tx.user.update({ where: { id: bestaand.userId }, data: { currentBelt: belt } })
      // 3. diploma aanmaken als nog niet vorhanden
      if (!bestaand.diploma) {
        let code = verifCode()
        while (await tx.diploma.findUnique({ where: { verificationCode: code } })) code = verifCode()
        await tx.diploma.create({
          data: {
            type: DiplomaType.BELT_EXAM,
            title: `Examen ${belt.replace(/_/g, ' ').toLowerCase()}`,
            description: `Geslaagd op ${datum.toLocaleDateString('nl-NL')}`,
            recipientId: bestaand.memberId,
            userId: bestaand.userId,
            beltLevel: belt,
            examAttemptId: updated.id,
            verificationCode: code,
            awardedAt: datum,
          },
        })
      }
    }
    return updated
  })
  return NextResponse.json(result)
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  const { id } = await params
  await db.examAttempt.delete({ where: { id } }).catch(() => {})
  return NextResponse.json({ ok: true })
}
