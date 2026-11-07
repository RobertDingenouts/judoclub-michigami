import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { BeltLevel, ExamStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

// POST body: { action: 'add', memberId, beltLevel } | { action: 'remove', attemptId } | { action: 'sync' }
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  const { id } = await params
  const body = await request.json()

  if (body.action === 'add') {
    const m = await db.member.findUnique({ where: { id: body.memberId } })
    if (!m) return NextResponse.json({ error: 'Lid niet gevonden' }, { status: 404 })
    const existing = await db.examAttempt.findFirst({ where: { sittingId: id, memberId: m.id } })
    if (existing) return NextResponse.json({ ok: true, id: existing.id })
    const a = await db.examAttempt.create({
      data: { sittingId: id, memberId: m.id, userId: m.userId, beltLevel: body.beltLevel as BeltLevel, status: ExamStatus.SCHEDULED },
    })
    return NextResponse.json({ ok: true, id: a.id })
  }
  if (body.action === 'sync') {
    const { kandidatenVoorGroep } = await import('@/lib/examens')
    const sitting = await db.examSitting.findUnique({ where: { id }, include: { attempts: { select: { memberId: true, status: true } } } })
    if (!sitting) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })
    const kandidaten = await kandidatenVoorGroep(sitting.group)
    const bestaand = new Set(sitting.attempts.map(a => a.memberId))
    let toegevoegd = 0
    for (const k of kandidaten) {
      if (bestaand.has(k.memberId)) continue
      await db.examAttempt.create({ data: { sittingId: id, memberId: k.memberId, userId: k.userId, beltLevel: k.doel as BeltLevel, status: ExamStatus.SCHEDULED } })
      toegevoegd++
    }
    return NextResponse.json({ ok: true, toegevoegd })
  }
  if (body.action === 'copyProef') {
    // Alleen de klaar-vlag overnemen uit het meest recente proefexamen (vakken blijven leeg: op het examen wordt opnieuw gecheckt)
    const sitting = await db.examSitting.findUnique({ where: { id }, include: { attempts: { select: { id: true, memberId: true } } } })
    if (!sitting) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })
    const proef = await db.examSitting.findFirst({
      where: { group: sitting.group, type: 'PROEF', date: { lte: sitting.date } },
      orderBy: { date: 'desc' },
      include: { attempts: { select: { memberId: true, klaar: true } } },
    })
    if (!proef) return NextResponse.json({ error: 'Geen proefexamen gevonden voor deze groep' }, { status: 404 })
    const source = new Map(proef.attempts.map(a => [a.memberId, a]))
    let overgenomen = 0
    for (const a of sitting.attempts) {
      if (!source.get(a.memberId)?.klaar) continue
      await db.examAttempt.update({ where: { id: a.id }, data: { klaar: true } })
      overgenomen++
    }
    return NextResponse.json({ ok: true, overgenomen })
  }
  return NextResponse.json({ error: 'Onbekende actie' }, { status: 400 })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  const { id } = await params
  const body = await request.json()
  const data: any = {}
  for (const k of ['title', 'examiners'] as const) if (body[k] !== undefined) data[k] = body[k]
  const s = await db.examSitting.update({ where: { id }, data })
  return NextResponse.json(s)
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  const { id } = await params
  const afgerond = await db.examAttempt.count({ where: { sittingId: id, status: { in: ['COMPLETED_PASSED', 'COMPLETED_FAILED'] } } })
  if (afgerond > 0) return NextResponse.json({ error: 'Bijeenkomst bevat afgeronde examens — niet verwijderbaar' }, { status: 400 })
  await db.examAttempt.deleteMany({ where: { sittingId: id } })
  await db.examSitting.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
