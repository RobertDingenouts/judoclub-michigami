import { db } from '@/lib/db'
import { kwartaalVan } from '@/lib/admin2'
import { ensureUpcomingDays } from '@/lib/lessen'
import { getBeltLabel, getNextBelt, isYouth } from '@/lib/belt-utils'
import type { BeltLevel } from '@prisma/client'
import AdminDashboard, { type DashData } from './dashboard/AdminDashboard'

export const dynamic = 'force-dynamic'

export default async function AdminStart() {
  const now = new Date()
  const todayIso = now.toISOString().slice(0, 10)
  const kw = kwartaalVan(now)
  await ensureUpcomingDays(10)

  const [
    actieveLeden, pendingApps, openPayments,
    dagenVandaag, dagenWeek,
    recenteAanwezigheid, geplandeExamens, ledenVoorExamen,
    gevlagden, recentGestopt,
  ] = await Promise.all([
    db.member.count({ where: { isActive: true } }),
    db.membershipApplication.count({ where: { status: 'PENDING' } }),
    db.payment.aggregate({
      where: { status: { in: ['OPEN', 'HERINNERING1', 'HERINNERING2'] }, period: { label: kw } },
      _count: true, _sum: { amount: true },
    }),
    db.trainingDay.findMany({
      where: { date: { gte: new Date(todayIso) }, cancelled: false },
      orderBy: [{ date: 'asc' }, { group: 'asc' }], take: 6,
      include: { attendance: true },
    }),
    db.trainingDay.findMany({
      where: { date: { gte: new Date(now.getTime() - 7 * 864e5), lte: now }, cancelled: false },
      include: { attendance: true },
      orderBy: { date: 'asc' },
    }),
    db.attendance.groupBy({ by: ['status'], _count: true }),
    db.examAttempt.count({ where: { status: 'SCHEDULED' } }),
    db.member.findMany({
      where: { isActive: true, currentBelt: { not: null }, primaryGroup: { notIn: ['SENIOREN'] } },
      include: { bondHistory: { orderBy: { awardedAt: 'desc' }, take: 1 } },
      orderBy: [{ lastName: 'asc' }],
    }),
    db.member.findMany({
      where: { clubStatus: { in: ['RESERVE', 'STOPPEND'] } },
      select: { id: true, firstName: true, lastName: true, clubStatus: true },
      orderBy: { lastName: 'asc' }, take: 12,
    }),
    db.member.findMany({
      where: { clubStatus: 'GESTOPT' },
      select: { id: true, firstName: true, lastName: true, leaveDate: true },
      orderBy: { leaveDate: 'desc' }, take: 8,
    }),
  ])

  const trend = dagenWeek.map(d => {
    const relevant = d.attendance.filter(a => a.status !== 'VAKANTIE')
    const aanw = d.attendance.filter(a => a.status === 'AANWEZIG').length
    return {
      label: d.date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }),
      pct: relevant.length ? Math.round((aanw / relevant.length) * 100) : 0,
    }
  }).filter(t => t.pct > 0)

  const examList = ledenVoorExamen.map(m => {
    const youth = isYouth(m.dateOfBirth)
    const last = m.bondHistory[0]
    const next = getNextBelt(m.currentBelt as BeltLevel, youth)
    const maanden = last ? Math.round((now.getTime() - last.awardedAt.getTime()) / (30.44 * 864e5)) : null
    return {
      id: m.id, naam: `${m.firstName} ${m.lastName}`,
      belt: m.currentBelt as string,
      next: next ? getBeltLabel(next) : '—',
      maanden,
    }
  }).filter(e => e.maanden === null || e.maanden >= 3).slice(0, 12)

  const attTotal = recenteAanwezigheid.reduce((s, g) => s + g._count, 0)
  const attAanw = recenteAanwezigheid.find(g => g.status === 'AANWEZIG')?._count ?? 0

  const d: DashData = {
    nowIso: now.toISOString(),
    actieveLeden,
    kwLabel: kw,
    tiles: {
      contributieOpen: openPayments._count ?? 0,
      contributieSom: Number(openPayments._sum.amount ?? 0),
      inschrijvingen: pendingApps,
      aanwVan: attAanw, aanwNoem: attTotal, aanwPct: attTotal ? Math.round((attAanw / attTotal) * 100) : 0,
      examensGepland: geplandeExamens,
    },
    upcoming: dagenVandaag.map(l => ({
      id: l.id,
      datum: l.date.toISOString().slice(0, 10),
      groep: l.group,
      activity: l.activity,
      aanw: l.attendance.filter(a => a.status === 'AANWEZIG').length,
      afg: l.attendance.filter(a => a.status === 'AFGEMELD').length,
      ingevuld: l.attendance.length > 0,
    })),
    trend,
    examList,
    vlaggen: gevlagden.map(m => ({ id: m.id, naam: `${m.firstName} ${m.lastName}`, status: m.clubStatus })),
    recentGestopt: recentGestopt.map(m => ({
      id: m.id, naam: `${m.firstName} ${m.lastName}`,
      leaveDate: m.leaveDate?.toISOString().slice(0, 10) ?? null,
    })),
  }

  return <AdminDashboard d={d} />
}
