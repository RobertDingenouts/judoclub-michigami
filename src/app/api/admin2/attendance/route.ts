import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// POST { memberId, trainingDayId, status | null }  — null = registratie verwijderen
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Geen admin' }, { status: 403 })
  const body = await req.json()
  const { memberId, trainingDayId, status } = body

  if (!memberId || !trainingDayId) return NextResponse.json({ error: 'memberId + trainingDayId nodig' }, { status: 400 })

  if (status === null || status === 'NIET_AANWEZIG') {
    // wis registratie: cel "leeg" in de Excel = geen registratie
    await db.attendance.deleteMany({ where: { memberId, trainingDayId } })
    return NextResponse.json({ ok: true, status: null })
  }

  const valid = ['AANWEZIG', 'AFGEMELD', 'ZIEK', 'VERZET', 'VAKANTIE']
  if (!valid.includes(status)) return NextResponse.json({ error: `Ongeldige status: ${status}` }, { status: 400 })

  const rec = await db.attendance.upsert({
    where: { memberId_trainingDayId: { memberId, trainingDayId } },
    create: { memberId, trainingDayId, status },
    update: { status },
  })
  return NextResponse.json({ ok: true, status: rec.status })
}
