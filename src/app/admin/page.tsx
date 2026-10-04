import { db } from '@/lib/db'
import { kwartaalVan } from '@/lib/admin2'
import { ensureUpcomingDays, markeerVakantieDagen } from '@/lib/lessen'
import { vakantieOp } from '@/data/vakanties'
import { getBeltLabel, getNextBelt, isSlipBelt, isYouth } from '@/lib/belt-utils'
import type { BeltLevel } from '@prisma/client'
import AdminDashboard, { type DashData, type LedenRow } from './dashboard/AdminDashboard'

export const dynamic = 'force-dynamic'

const HIST_LESSEN = 12 // aantal lessen per groep in de aanwezigheidswidget

export default async function AdminStart() {
  const now = new Date()
  const todayIso = now.toISOString().slice(0, 10)
  const kw = kwartaalVan(now)
  // Lesdagen aanvullen én bestaande dagen markeren die in een vakantie vallen.
  await ensureUpcomingDays(12)
  await markeerVakantieDagen()

  const [
    actieveLeden, pendingApps, openPayments, allePeriodes,
    komendeDagen, dagenWeek,
    attTotal,
    ledenVoorExamen, gevlagden, recentGestopt,
    historieDagen, historieAtt,
    openRekeningen, recentBetald,
    examOpen, diplomaRecent,
  ] = await Promise.all([
    db.member.count({ where: { isActive: true } }),
    db.membershipApplication.findMany({ where: { status: 'PENDING' }, orderBy: { createdAt: 'desc' }, take: 10 }),
    db.payment.aggregate({
      where: { status: { in: ['OPEN', 'HERINNERING1', 'HERINNERING2'] }, period: { label: kw } },
      _count: true, _sum: { amount: true },
    }),
    db.contributionPeriod.findMany({ orderBy: { start: 'asc' }, select: { label: true } }),
    db.trainingDay.findMany({
      where: { date: { gte: new Date(todayIso) }, cancelled: false },
      orderBy: [{ date: 'asc' }, { group: 'asc' }], take: 8,
      include: { attendance: true },
    }),
    db.trainingDay.findMany({
      where: { date: { gte: new Date(now.getTime() - 7 * 864e5), lte: now }, cancelled: false },
      include: { attendance: true },
      orderBy: { date: 'asc' },
    }),
    db.attendance.groupBy({ by: ['status'], _count: true }),
    // Let op: Prisma's `notIn`/`NOT` op een nullable kolom sluit in SQL ook de
    // NULL-waarden uit. Leden zonder primaryGroup zouden daardoor stilletjes
    // verdwijnen — vandaar de expliciete OR in plaats van een filter.
    db.member.findMany({
      where: {
        isActive: true, clubStatus: { notIn: ['PROEF'] },
        OR: [{ primaryGroup: null }, { primaryGroup: { not: 'SENIOREN' } }],
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      select: {
        id: true, firstName: true, lastName: true, primaryGroup: true, clubStatus: true,
        currentBelt: true, dateOfBirth: true, joinDate: true, bondsnummer: true,
        payments: { where: { period: { label: kw } }, select: { id: true, status: true, amount: true } },
        bondHistory: { orderBy: { awardedAt: 'desc' }, take: 1, select: { awardedAt: true } },
        examAttempts: { orderBy: { examDate: 'desc' }, take: 1, select: { examDate: true, status: true, beltLevel: true } },
        courseProgress: { where: { isPassed: true }, select: { beltLevel: true } },
      },
    }),
    db.member.findMany({
      where: { clubStatus: { in: ['RESERVE', 'STOPPING', 'STOPPEND'] } },
      select: { id: true, firstName: true, lastName: true, clubStatus: true, primaryGroup: true },
      orderBy: { lastName: 'asc' }, take: 14,
    }),
    db.member.findMany({
      where: { clubStatus: 'GESTOPT' },
      select: { id: true, firstName: true, lastName: true, leaveDate: true },
      orderBy: { leaveDate: 'desc' }, take: 8,
    }),
    // Historie voor de aanwezigheidswidget: per groep de laatste lessen.
// Per groep apart ophalen zodat elke groep zeker zijn volledige reeks krijgt
// (een globale take verdeelt de groepen ongelijk).
    Promise.all(['VRIJDAG_1E', 'VRIJDAG_2E', 'VRIJDAG_3E', 'WOENSDAG'].map(g =>
      db.trainingDay.findMany({
        where: { date: { lte: now }, cancelled: false, group: g },
        orderBy: { date: 'desc' },
        take: 12,
        select: { id: true, date: true, group: true, location: true, activity: true, notes: true },
      })
    )).then(r => r.flat()),
    db.attendance.findMany({
      where: { trainingDay: { date: { gte: new Date(now.getTime() - 90 * 864e5) }, group: { in: ['VRIJDAG_1E', 'VRIJDAG_2E', 'VRIJDAG_3E', 'WOENSDAG'] } } },
      select: { memberId: true, trainingDayId: true, status: true },
    }),
    db.payment.findMany({
      where: { status: { in: ['OPEN', 'HERINNERING1', 'HERINNERING2'] }, period: { label: kw } },
      include: { member: { select: { id: true, firstName: true, lastName: true, primaryGroup: true } } },
      orderBy: { amount: 'desc' }, take: 20,
    }),
    db.payment.findMany({
      where: { status: 'BETAALD', period: { label: kw } },
      include: { member: { select: { firstName: true, lastName: true } } },
      orderBy: { paidAt: 'desc' }, take: 8,
    }),
    db.examAttempt.findMany({
      where: { status: 'SCHEDULED' },
      include: { member: { select: { firstName: true, lastName: true } } },
      orderBy: { examDate: 'asc' }, take: 10,
    }),
    db.diploma.count({ where: { awardedAt: { gte: new Date(now.getTime() - 180 * 864e5) } } }),
  ])

  // ---- Aanwezigheidswidget: per groep de laatste HIST_LESSEN lessen
  const groepen = ['VRIJDAG_1E', 'VRIJDAG_2E', 'VRIJDAG_3E', 'WOENSDAG']
  const perGroep = new Map<string, typeof historieDagen>()
  for (const g of groepen) perGroep.set(g, [])
  for (const d of historieDagen) {
    const lijst = perGroep.get(d.group)
    if (lijst && lijst.length < HIST_LESSEN) lijst.push(d)
  }
  for (const lijst of perGroep.values()) lijst.reverse() // oud → nieuw
  const dagIds = new Set([...perGroep.values()].flat().map(d => d.id))
  const cellen: Record<string, string> = {}
  for (const a of historieAtt) if (dagIds.has(a.trainingDayId)) cellen[`${a.memberId}|${a.trainingDayId}`] = a.status

  const aanwezigheidGroepen = groepen.map(g => {
    const dagen = perGroep.get(g) ?? []
    return {
      groep: g,
      locatie: dagen[0]?.location ?? (g === 'WOENSDAG' ? 'OUD_VOSSEMEER' : 'STEENBERGEN'),
      dagen: dagen.map(d => ({
        id: d.id,
        datum: d.date.toISOString().slice(0, 10),
        activity: d.activity,
        // Vakantiedagen tellen niet mee in de opkomstpercentage.
        // Vakantie wordt op GROEP bepaald (rooster is autoritair); historische
        // rijen kunnen een onjuiste locatie hebben.
        vakantie: vakantieOp(d.date.toISOString().slice(0, 10), d.group) !== null,
      })),
    }
  })

  // ---- Trend laatste 7 dagen
  const trend = dagenWeek.map(d => {
    const relevant = d.attendance.filter(a => a.status !== 'VAKANTIE')
    const aanw = d.attendance.filter(a => a.status === 'AANWEZIG').length
    return {
      label: d.date.toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' }),
      pct: relevant.length ? Math.round((aanw / relevant.length) * 100) : 0,
      aanw, van: relevant.length,
    }
  }).filter(t => t.van > 0)

  // ---- Examenkandidaten (in beeld op basis van tijd in vorige band)
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
  }).filter(e => e.maanden === null || e.maanden >= 3).slice(0, 14)

  const attAanw = attTotal.find(g => g.status === 'AANWEZIG')?._count ?? 0
  const attAlle = attTotal.reduce((s, g) => s + g._count, 0)

  // ── Leden-verrijking (gedeeld door ledenwidget + aanwezigheid-wolkje) ──────
  const rijkeLeden: LedenRow[] = ledenVoorExamen.map(m => {
    const youth = isYouth(m.dateOfBirth)
    const volgende = getNextBelt(m.currentBelt as BeltLevel, youth)
    const laatsteEx = m.examAttempts[0]
    return {
      id: m.id,
      naam: `${m.firstName} ${m.lastName}`,
      groep: m.primaryGroup ?? '',
      clubStatus: m.clubStatus,
      belt: m.currentBelt,
      dob: m.dateOfBirth?.toISOString().slice(0, 10) ?? null,
      betaling: m.payments[0]?.status ?? 'GEEN',
      paymentId: m.payments[0]?.id ?? null,
      bedrag: m.payments[0] ? Number(m.payments[0].amount) : null,
      lidSinds: m.joinDate?.toISOString().slice(0, 10) ?? null,
      bondsnummer: m.bondsnummer,
      laatsteBand: m.bondHistory[0]?.awardedAt.toISOString().slice(0, 10) ?? null,
      laatsteExamen: laatsteEx?.examDate?.toISOString().slice(0, 10) ?? null,
      laatsteExamenStatus: laatsteEx?.status ?? null,
      volgendeBand: volgende as string | null,
      volgendeBandSlip: volgende ? isSlipBelt(volgende) : false,
      cursusJapans: m.courseProgress.length > 0,
    }
  })

  const d: DashData = {
    nowIso: now.toISOString(),
    kwLabel: kw,
    periodes: allePeriodes.map(p => p.label),
    tiles: {
      actieveLeden,
      contributieOpen: openPayments._count ?? 0,
      contributieSom: Number(openPayments._sum.amount ?? 0),
      inschrijvingen: pendingApps.length,
      aanwPct: attAlle ? Math.round((attAanw / attAlle) * 100) : 0,
      aanwVan: attAanw, aanwNoem: attAlle,
      examensGepland: examOpen.length,
      diplomaRecent,
    },
    komendeLessen: komendeDagen.map(l => ({
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
    aanwezigheidGroepen,
    // Leden zonder groep horen niet in het lesrooster; ze blijven wel in de ledenwidget.
    aanwezigheidLeden: rijkeLeden.filter(l => l.groep !== ''),
    cellen,
    leden: rijkeLeden,
    openRekeningen: openRekeningen.map(p => ({
      paymentId: p.id, lidId: p.member.id, naam: `${p.member.firstName} ${p.member.lastName}`,
      groep: p.member.primaryGroup ?? '', bedrag: Number(p.amount), status: p.status,
    })),
    recentBetald: recentBetald.map(p => ({
      naam: `${p.member.firstName} ${p.member.lastName}`, bedrag: Number(p.amount),
      datum: p.paidAt?.toISOString().slice(0, 10) ?? '',
    })),
    inschrijvingen: pendingApps.map(a => ({
      id: a.id, naam: `${a.firstName} ${a.lastName}`, email: a.email,
      groep: a.preferredGroup ?? '', datum: a.createdAt.toISOString().slice(0, 10),
    })),
    geplandeExamens: examOpen.map(e => ({
      id: e.id, naam: `${e.member.firstName} ${e.member.lastName}`,
      datum: e.examDate?.toISOString().slice(0, 10) ?? '',
    })),
    vlaggen: gevlagden.map(m => ({ id: m.id, naam: `${m.firstName} ${m.lastName}`, status: m.clubStatus, groep: m.primaryGroup ?? '' })),
    recentGestopt: recentGestopt.map(m => ({
      id: m.id, naam: `${m.firstName} ${m.lastName}`, leaveDate: m.leaveDate?.toISOString().slice(0, 10) ?? null,
    })),
  }

  return <AdminDashboard d={d} />
}