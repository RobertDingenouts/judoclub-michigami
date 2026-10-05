import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'
import { VAKANTIE_HANDMATIG } from '@/lib/lessen'

export const dynamic = 'force-dynamic'

// POST { trainingDayId, vakantie: boolean }
// Vakantie afzetten voor een les: de dag wordt gemarkeerd ('Geen les' + handmatige
// vakantienotitie) en ALLE leden van die groep — inclusief gasten die al ingeschreven
// staan — krijgen status VAKANTIE. Uitzetten (vakantie=false) verwijdert alleen de
// VAKANTIE-aanwezigheid van die dag; echte registraties blijven intact.
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Geen admin' }, { status: 403 })
  const { trainingDayId, vakantie } = await req.json()
  if (!trainingDayId || typeof vakantie !== 'boolean')
    return NextResponse.json({ error: 'trainingDayId + vakantie nodig' }, { status: 400 })

  const day = await db.trainingDay.findUnique({ where: { id: trainingDayId } })
  if (!day) return NextResponse.json({ error: 'Lesdag niet gevonden' }, { status: 404 })

  if (vakantie) {
    await db.trainingDay.update({
      where: { id: trainingDayId },
      data: { activity: 'Geen les', notes: VAKANTIE_HANDMATIG },
    })
    const [bestaand, leden] = await Promise.all([
      db.attendance.findMany({ where: { trainingDayId }, select: { memberId: true } }),
      db.member.findMany({ where: { isActive: true, primaryGroup: day.group }, select: { id: true } }),
    ])
    const hebben = new Set(bestaand.map(a => a.memberId))
    const nieuw = leden.map(l => l.id).filter(id => !hebben.has(id))
    await db.$transaction([
      db.attendance.updateMany({ where: { trainingDayId }, data: { status: 'VAKANTIE' } }),
      db.attendance.createMany({ data: nieuw.map(id => ({ memberId: id, trainingDayId, status: 'VAKANTIE' })), skipDuplicates: true }),
    ])
    return NextResponse.json({ ok: true, count: hebben.size + nieuw.length })
  }

  // Uit: alleen vakantie-regels weg; de vakantiemarkering van de dag ook.
  // (Voor zover de datum in een officiële vakantie ligt zet markeerVakantieDagen
  // de 'Geen les'-markering bij het eerstvolgende laden weer terug — netjes.)
  await db.$transaction([
    db.attendance.deleteMany({ where: { trainingDayId, status: 'VAKANTIE' } }),
    db.trainingDay.update({
      where: { id: trainingDayId },
      data: { notes: null, ...(day.activity === 'Geen les' ? { activity: null } : {}) },
    }),
  ])
  return NextResponse.json({ ok: true })
}
