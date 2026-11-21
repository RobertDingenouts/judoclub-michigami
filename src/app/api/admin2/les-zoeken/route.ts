import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'
import { getBeltColor, getNextBelt, isSlipBelt, isYouth } from '@/lib/belt-utils'
import type { BeltLevel } from '@prisma/client'

export const dynamic = 'force-dynamic'

// GET ?q=<naam>&dag=<trainingDayId> — leden zoeken om TIJDELIJK aan één les
// toe te voegen (lid uit een andere groep, oud-lid dat meedoet, iemand van de
// andere locatie). Er ontstaat alleen een Attendance-rij voor die ene lesdag:
// de hoofdgroep van het lid blijft onaangeroerd, dus niets permanent verzet.
export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Geen admin' }, { status: 403 })
  const q = (req.nextUrl.searchParams.get('q') || '').trim()
  const dagId = req.nextUrl.searchParams.get('dag') || ''
  if (q.length < 2) return NextResponse.json({ resultaten: [] })

  const dag = await db.trainingDay.findUnique({ where: { id: dagId } })
  if (!dag) return NextResponse.json({ error: 'Onbekende lesdag' }, { status: 400 })

  const leden = await db.member.findMany({
    where: {
      OR: [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
      ],
    },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    take: 12,
    select: {
      id: true, firstName: true, lastName: true, clubStatus: true, isActive: true,
      primaryGroup: true, isTrainer: true, dateOfBirth: true, currentBelt: true,
      portraitRights: true, nameMention: true,
      user: { select: { role: true } },
      attendance: { where: { trainingDayId: dag.id }, select: { status: true } },
    },
  })

  const bandInfo = (m: { currentBelt: BeltLevel | null; dateOfBirth: Date | null }) => {
    const jeugd = isYouth(m.dateOfBirth)
    const volgende = getNextBelt(m.currentBelt, jeugd)
    return {
      huidig: m.currentBelt,
      huidigKleur: m.currentBelt ? getBeltColor(m.currentBelt) : '#7C3AED',
      volgende,
      volgendeKleur: getBeltColor(volgende),
      slip: volgende ? isSlipBelt(volgende) : false,
    }
  }

  return NextResponse.json({
    resultaten: leden.map(m => ({
      id: m.id,
      naam: `${m.firstName} ${m.lastName}`,
      clubStatus: m.clubStatus,
      actief: m.isActive,
      groep: m.primaryGroup,
      alOpDag: m.attendance.length > 0,
      trainer: m.isTrainer || m.user?.role === 'INSTRUCTOR',
      band: bandInfo(m),
      geenPortret: m.portraitRights === false,
      geenNaam: m.nameMention === false,
    })),
  })
}
