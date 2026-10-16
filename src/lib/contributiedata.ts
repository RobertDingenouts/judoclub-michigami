// Eén data-haal-logica voor het contributieoverzicht (ContributieBoard).
// Zowel de pagina /admin/contributie als de widget op het startscherm gebruikt
// dit — dezelfde rijen, dezelfde regels (periodefilter, PROEF/SENIOREN uit).
import { db } from '@/lib/db'
import type { Prisma } from '@prisma/client'

export type ContribItem = { omschrijving: string; bedrag: number }
export type ContribRij = {
  memberId: string; paymentId: string | null; naam: string; groep: string | null
  status: string; amount: number; note: string | null
  items: ContribItem[] | null; clubStatus: string; leaveDate: string
  paidAt: string; dueDate: string; invoiceNumber: string | null
  vervald: boolean; nietBetaald: boolean
}

function safeItems(s: string): ContribItem[] | null {
  try {
    const v = JSON.parse(s)
    return Array.isArray(v) ? v : null
  } catch { return null }
}

export function kwartaalLabel(d: Date): string {
  return `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`
}

function kwartaalRange(label: string): { start: Date; end: Date } | null {
  const m = label.match(/^(\d{4})-Q([1-4])$/)
  if (!m) return null
  const y = Number(m[1]), q = Number(m[2])
  return { start: new Date(Date.UTC(y, (q - 1) * 3, 1)), end: new Date(Date.UTC(y, q * 3, 0)) }
}

// Zet het volgende kwartaal klaar zodra het in beeld komt: periode + facturen
// voor iedereen die aan het begin van die periode lid is. Idempotent — bestaande
// periodes/facturen worden nooit aangeraakt.
async function aanmaakPayments(period: { id: string; amount: Prisma.Decimal | number; start: Date; end: Date }) {
  const leden = await db.member.findMany({
    where: {
      clubStatus: { notIn: ['PROEF', 'GESTOPT'] },
      joinDate: { lte: period.end },
      OR: [{ leaveDate: null }, { leaveDate: { gte: period.start } }],
      // Alleen leden die in deze periode nog géén rij hebben (idempotent).
      payments: { none: { periodId: period.id } },
    },
    select: { id: true, clubStatus: true },
  })
  if (leden.length === 0) return
  // Backfill in een al gestarte periode: vervaldatum wordt vandaag, anders staat
  // een pas ingeschreven lid meteen 'te laat' in het overzicht.
  const due = period.start < new Date() ? new Date() : period.start
  await db.payment.createMany({
    data: leden.map(m => ({
      memberId: m.id, periodId: period.id, amount: period.amount, dueDate: due,
      // Vrijgestelden én reserves zijn voorgoed vrijgesteld: elke nieuwe periode
      // krijgt meteen VIJGESTELD, nooit OPEN (anders staan trainers e.d.
      // structureel 'schuldig' in het overzicht).
      status: (m.clubStatus === 'VRIJGESTELD' || m.clubStatus === 'RESERVE') ? 'VIJGESTELD' : 'OPEN',
    })),
    skipDuplicates: true,
  })
}

async function zorgVoorPeriode(label: string) {
  const range = kwartaalRange(label)
  if (!range) return null
  const bestaand = await db.contributionPeriod.findUnique({ where: { label } })
  if (bestaand) {
    // Wie pas ná het aanmaken van de periode inschreef (of in die periode van
    // PROEF naar LID ging) kreeg destijds geen payment-rij → geen factuur
    // mogelijk. Backfill die rijen alsnog, maar alleen voor de lopende of
    // toekomstige periode — verleden periodes laten we met rust.
    if (bestaand.end >= new Date()) await aanmaakPayments(bestaand)
    return bestaand
  }
  const created = await db.contributionPeriod.create({ data: { label, start: range.start, end: range.end } })
  await aanmaakPayments(created)
  return created
}

export async function contributieData(label: string, opts: { toonGestopt?: boolean } = {}) {
  const nu = new Date()
  // Toon altijd één kwartaal vooruit: het kwartaal ná het huidige bestaat nog,
  // maar kun je nu al inzien (en eraan werken).
  const volgende = kwartaalLabel(new Date(nu.getTime() + 91 * 864e5))
  const [bestaande, period] = await Promise.all([
    db.contributionPeriod.findMany({ orderBy: { start: 'asc' } }),
    zorgVoorPeriode(label),
  ])
  const periodes = bestaande.map(p => ({ label: p.label }))
  if (!periodes.some(p => p.label === volgende)) periodes.push({ label: volgende })
  // Let op: `notIn` op een nullable kolom sluit in SQL ook NULL uit → leden
  // zonder primaryGroup zouden hiermee verdwijnen uit de contributie.
  const rows = await db.member.findMany({
    where: {
      clubStatus: { notIn: ['PROEF'] },
      OR: [{ primaryGroup: null }, { primaryGroup: { not: 'SENIOREN' } }],
    },
    orderBy: [{ primaryGroup: 'asc' }, { lastName: 'asc' }],
    include: { payments: { where: { period: { label } } } },
  })

  if (!period) return { periodes, data: [] as ContribRij[], period, totaalOpen: 0 }

  // Toon alleen leden die in deze periode lid waren: ingeschreven vóór periode-einde
  // en (nog niet uitgeschreven OF pas uitgeschreven ná periode-start).
  const data: ContribRij[] = rows
    .filter(m => {
      // Gestopte leden standaard niet in beeld (betalingen blijven gewoon in de
      // database en in de Excel-export; ?gestopt=1 toont ze weer).
      if (!opts.toonGestopt && m.clubStatus === 'GESTOPT') return false
      if (period) {
        if (m.joinDate && m.joinDate > period.end) return false
        if (m.leaveDate && m.leaveDate < period.start) return false
      }
      // Leden zonder payment in een VERLEDEN periode: niet tonen (ze waren er niet of hoorden er niet bij)
      if (m.payments.length === 0 && period && period.end < nu) return false
      return true
    })
    .map(m => {
      const p = m.payments[0]
      const unpaid = p ? ['OPEN', 'HERINNERING1', 'HERINNERING2'].includes(p.status) : false
      // 'Open' = schuld is pas als de vervaldatum (of anders het periode-einde)
      // verstreken is. Zolang de datum in de toekomst ligt is het bedrag nog
      // niet verschuldigd en tonen we het niet als open.
      const vervalDatum = p?.dueDate ?? period?.end
      const vervald = unpaid && !!vervalDatum && vervalDatum < nu
      // 'Niet betaald' = factuur nog openstaande (ongeacht datum) → daar maak je
      // facturen voor aan en kun je meewerken. 'Vervald/schuldig' = de officiële
      // betaaldatum is verstreken → pas dan is er sprake van schuld en mogen er
      // herinneringen uit.
      const nietBetaald = unpaid
      return {
        memberId: m.id,
        paymentId: p?.id ?? null,
        naam: `${m.firstName} ${m.lastName}`,
        groep: m.primaryGroup,
        status: p?.status ?? 'GEEN',
        amount: p ? Number(p.amount) : 42,
        note: p?.note ?? null,
        items: (p as any)?.items ? safeItems((p as any).items) : null,
        clubStatus: m.clubStatus,
        leaveDate: m.leaveDate?.toISOString().slice(0, 10) ?? '',
        paidAt: p?.paidAt?.toISOString().slice(0, 10) ?? '',
        dueDate: (p as any)?.dueDate?.toISOString().slice(0, 10) ?? '',
        invoiceNumber: (p as any)?.invoiceNumber ?? null,
        vervald,
        nietBetaald,
      }
    })

  const totaalOpen = data
    .filter(m => m.vervald)
    .reduce((s, m) => s + Number(m.amount), 0)

  return { periodes, data, period, totaalOpen }
}
