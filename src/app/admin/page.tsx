import { db } from '@/lib/db'
import { kwartaalVan } from '@/lib/admin2'
import { archivePassedStops } from '@/lib/leden-status'
import { ensureUpcomingDays, markeerVakantieDagen } from '@/lib/lessen'
import { getBeltLabel, getNextBelt, isSlipBelt, isYouth } from '@/lib/belt-utils'
import { lessenGridData } from '@/lib/lessendata'
import { contributieData } from '@/lib/contributiedata'
import { findLesDag, lesModusProps, type LesModusProps } from '@/lib/lesdata'
import type { BeltLevel } from '@prisma/client'
import AdminDashboard, { type DashData, type LedenRow } from './dashboard/AdminDashboard'

export const dynamic = 'force-dynamic'

export default async function AdminStart() {
  const now = new Date()
  const todayIso = now.toISOString().slice(0, 10)
  const kw = kwartaalVan(now)
  // Lesdagen aanvullen én bestaande dagen markeren die in een vakantie vallen.
  await ensureUpcomingDays(12)
  await markeerVakantieDagen()
  await archivePassedStops()

  const [
    actieveLeden, pendingApps, openPayments, nogTeBetalen, allePeriodes,
    komendeDagen, dagenWeek,
    attTotal,
    ledenVoorExamen, gevlagden, recentGestopt, groeiRuW, zoekAlle,
    openRekeningen, recentBetald,
    examOpen, diplomaRecent,
  ] = await Promise.all([
    db.member.count({ where: { isActive: true } }),
    db.membershipApplication.findMany({ where: { status: 'PENDING' }, orderBy: { createdAt: 'desc' }, take: 10 }),
    db.payment.aggregate({
      where: {
        status: { in: ['OPEN', 'HERINNERING1', 'HERINNERING2'] },
        period: { label: kw },
        // Vrijgestelden zijn voorgoed buiten beeld, en een bedrag is pas schuld
        // als de vervaldatum verstreken is.
        member: { clubStatus: { not: 'VRIJGESTELD' } },
        dueDate: { lt: now },
      },
      _count: true, _sum: { amount: true },
    }),
    // "Nog te betalen": alle openstaande facturen van deze periode, óók die nog
    // niet vervallen zijn. De startpagina laat zien hoeveel er nog INKOMEND is,
    // niet alleen de schuld.
    db.payment.aggregate({
      where: {
        status: { in: ['OPEN', 'HERINNERING1', 'HERINNERING2'] },
        period: { label: kw },
        member: { clubStatus: { notIn: ['VRIJGESTELD', 'RESERVE'] } },
      },
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
      // Vlaggen-leden. `STOPPING` is legacy-spelling uit oude data; meenemen kost
      // niets en voorkomt dat zo'n lid nergens zichtbaar is.
      where: { clubStatus: { in: ['RESERVE', 'STOPPING', 'STOPPEND'] } },
      select: { id: true, firstName: true, lastName: true, clubStatus: true, primaryGroup: true },
      orderBy: { lastName: 'asc' }, take: 14,
    }),
    db.member.findMany({
      where: { clubStatus: 'GESTOPT' },
      select: { id: true, firstName: true, lastName: true, leaveDate: true },
      orderBy: { leaveDate: 'desc' }, take: 60,
    }),
    // CRM-groei: ruwe data voor de kwartaalgrafiek (nieuwe/gestopte/proef-leden).
    db.member.findMany({
      select: { joinDate: true, leaveDate: true, clubStatus: true },
    }),
    // Zoekdataset startpagina: WERKELIJK iedereen (ook senioren, trainers,
    // vrijgestelden, gearchiveerden) — de examenlijst laat die groepen weg,
    // waardoor zoeken op bijv. "Pascal" of "Robin" niets opleverde.
    db.member.findMany({
      select: { id: true, firstName: true, lastName: true, primaryGroup: true, currentBelt: true, isActive: true, clubStatus: true },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    }),
    db.payment.findMany({
      where: {
        status: { in: ['OPEN', 'HERINNERING1', 'HERINNERING2'] },
        period: { label: kw },
        member: { clubStatus: { not: 'VRIJGESTELD' } },
        dueDate: { lt: now },
      },
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

  // ── De drie "pagina-als-widget" datasets: exact dezelfde libs als de
  //    losse pagina's, dus startscherm en pagina tonen identical content. ──
  const [lessen, contributie, lesDag] = await Promise.all([
    lessenGridData({ periode: kw }),
    contributieData(kw),
    findLesDag(),
  ])
  const lesmodus: LesModusProps | null = lesDag ? await lesModusProps(lesDag) : null

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
  }).filter(e => e.maanden === null || e.maanden >= 3)
    // Sorteer op tijd in de vorige band vóór het afkappen. De bronquery sorteert
    // op achternaam, dus zonder dit zag je 14 willekeurige namen in plaats van
    // de leden die het langst op hun volgende band wachten.
    .sort((a, b) => {
      const am = a.maanden ?? 9999
      const bm = b.maanden ?? 9999
      return bm - am
    })
    .slice(0, 14)

  const attAanw = attTotal.find(g => g.status === 'AANWEZIG')?._count ?? 0
  const attAlle = attTotal.reduce((s, g) => s + g._count, 0)

  // ── Leden-verrijking (ledenwidget + examenwidget) ─────────────────────────
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

  // ── CRM-groei: per kwartaal (terugkijkend 8) instroom/uitroom/proef ──────
  const groeiKwartalen: { key: string; label: string; nieuw: number; gestopt: number; proef: number }[] = []
  for (let i = 7; i >= 0; i--) {
    const dt = new Date(now.getFullYear(), now.getMonth() - i * 3, 1)
    const y = dt.getFullYear(), q = Math.floor(dt.getMonth() / 3) + 1
    groeiKwartalen.push({ key: `${y}Q${q}`, label: `Q${q} '${String(y).slice(2)}`, nieuw: 0, gestopt: 0, proef: 0 })
  }
  const groeiIdx = (d: Date) => groeiKwartalen.findIndex(x => x.key === `${d.getFullYear()}Q${Math.floor(d.getMonth() / 3) + 1}`)
  let proefNu = 0
  for (const m of groeiRuW) {
    const isProef = m.clubStatus === 'PROEF'
    if (isProef) proefNu++
    if (m.joinDate) { const i = groeiIdx(m.joinDate); if (i >= 0) groeiKwartalen[i][isProef ? 'proef' : 'nieuw']++ }
    if (m.leaveDate) { const i = groeiIdx(m.leaveDate); if (i >= 0) groeiKwartalen[i].gestopt++ }
  }

  const d: DashData = {
    nowIso: now.toISOString(),
    kwLabel: kw,
    periodes: allePeriodes.map(p => p.label),
    tiles: {
      actieveLeden,
      contributieOpen: openPayments._count ?? 0,
      contributieSom: Number(openPayments._sum.amount ?? 0),
      contributieNog: nogTeBetalen._count ?? 0,
      contributieNogSom: Number(nogTeBetalen._sum.amount ?? 0),
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
    // Lessen & contributie: dezelfde datasets als de losse pagina's.
    lessen: { dagen: lessen.dagen, leden: lessen.leden, trainers: lessen.trainers, cellen: lessen.cellen },
    lesmodus,
    contributie: { rows: contributie.data, periode: kw, periodId: contributie.period?.id ?? '', totaalOpen: contributie.totaalOpen },
    leden: rijkeLeden,
    zoekAlle: zoekAlle.map(m => ({ id: m.id, naam: `${m.firstName} ${m.lastName}`, groep: m.primaryGroup ?? '', belt: m.currentBelt, inactief: !m.isActive })),
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
    groei: { kwartalen: groeiKwartalen, proefNu },
  }

  return <AdminDashboard d={d} />
}
