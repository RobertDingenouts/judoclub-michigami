import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { kandidatenVoorGroep } from '@/lib/examens'
import { BeltLevel, ExamStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  try {
    const sittings = await db.examSitting.findMany({
      orderBy: { date: 'desc' },
      include: { attempts: { select: { id: true, status: true } } },
    })
    return NextResponse.json(sittings)
  } catch (error) {
    console.error('examens GET:', error)
    return NextResponse.json({ error: 'Ophalen mislukt (details in serverlogboek)' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  let body: { date?: string; group?: string; title?: string; type?: string }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Ongeldige JSON' }, { status: 400 }) }
  const { date, group, title, type } = body
  if (!date || !group) return NextResponse.json({ error: 'date en group zijn verplicht' }, { status: 400 })
  // Geen stille fallback: alleen geldige types, anders had je per ongeluk een examen i.p.v. proef
  if (type !== undefined && type !== 'PROEF' && type !== 'EXAMEN') {
    return NextResponse.json({ error: 'type moet PROEF of EXAMEN zijn' }, { status: 400 })
  }
  const zittingType = type === 'PROEF' ? 'PROEF' : 'EXAMEN'

  const datum = new Date(date + 'T12:00:00')
  const kandidaten = await kandidatenVoorGroep(group)
  // PROEF: alle kandidaten automatisch erbij (wekelijks testen).
  // EXAMEN: leeg starten — kandidaten komen binnen via "Klaar voor examen" in het overzicht
  // of handmatig via "+ Kandidaat toevoegen". (Robert: niet automatisch iedereen op een examenmoment.)
  const kandidatenVoorZitting = zittingType === 'PROEF' ? kandidaten : []

  try {
  const sitting = await db.examSitting.upsert({
    where: { date_group_type: { date: datum, group, type: zittingType } },
    create: {
      date: datum, group, type: zittingType, title: title || null,
      attempts: {
        create: kandidatenVoorZitting.map(k => ({
          memberId: k.memberId, userId: k.userId, beltLevel: k.doel as BeltLevel, status: ExamStatus.SCHEDULED,
        })),
      },
    },
    update: {},
    include: { attempts: true },
  })
  return NextResponse.json({ id: sitting.id, toegevoegd: sitting.attempts.length })
  } catch (error) {
    console.error('examens POST:', error)
    return NextResponse.json({ error: 'Zitting aanmaken mislukt (details in serverlogboek)' }, { status: 500 })
  }
}
