import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { kandidatenVoorGroep } from '@/lib/examens'
import { BeltLevel, ExamStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  const sittings = await db.examSitting.findMany({
    orderBy: { date: 'desc' },
    include: { attempts: { select: { id: true, status: true } } },
  })
  return NextResponse.json(sittings)
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  const { date, group, title, type } = await request.json() as { date?: string; group?: string; title?: string; type?: string }
  if (!date || !group) return NextResponse.json({ error: 'date en group zijn verplicht' }, { status: 400 })
  const zittingType = type === 'PROEF' ? 'PROEF' : 'EXAMEN'

  const datum = new Date(date + 'T12:00:00')
  const kandidaten = await kandidatenVoorGroep(group)
  // Info uit het meest recente proefexamen: vakken worden NIET voorgevinkt (op het examen wordt opnieuw gecheckt),
  // alleen de klaar-vlag gaat mee als markering.
  const bronProef = zittingType === 'EXAMEN'
    ? await db.examSitting.findFirst({
        where: { group, type: 'PROEF', date: { lte: datum } },
        orderBy: { date: 'desc' },
        include: { attempts: { select: { memberId: true, klaar: true } } },
      })
    : null
  const proefKlaar = new Map((bronProef?.attempts ?? []).map(a => [a.memberId, a.klaar]))
  // Examenlijst = alleen kandidaten die op het proefexamen op "klaar" stonden; rest kan handmatig worden toegevoegd.
  // Zonder proefexamen van tevoren: gewoon alle kandidaten (oude gedrag).
  const kandidatenVoorZitting = zittingType === 'EXAMEN' && bronProef
    ? kandidaten.filter(k => proefKlaar.get(k.memberId))
    : kandidaten

  const sitting = await db.examSitting.upsert({
    where: { date_group_type: { date: datum, group, type: zittingType } },
    create: {
      date: datum, group, type: zittingType, title: title || null,
      attempts: {
        create: kandidatenVoorZitting.map(k => ({
          memberId: k.memberId, userId: k.userId, beltLevel: k.doel as BeltLevel, status: ExamStatus.SCHEDULED,
          ...(zittingType === 'EXAMEN' && proefKlaar.get(k.memberId) ? { klaar: true } : {}),
        })),
      },
    },
    update: {},
    include: { attempts: true },
  })
  return NextResponse.json({ id: sitting.id, toegevoegd: sitting.attempts.length })
}
