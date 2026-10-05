// Eén data-haal-logica voor het contributieoverzicht (ContributieBoard).
// Zowel de pagina /admin/contributie als de widget op het startscherm gebruikt
// dit — dezelfde rijen, dezelfde regels (periodefilter, PROEF/SENIOREN uit).
import { db } from '@/lib/db'

export type ContribItem = { omschrijving: string; bedrag: number }
export type ContribRij = {
  memberId: string; paymentId: string | null; naam: string; groep: string | null
  status: string; amount: number; note: string | null
  items: ContribItem[] | null; clubStatus: string; leaveDate: string
}

function safeItems(s: string): ContribItem[] | null {
  try {
    const v = JSON.parse(s)
    return Array.isArray(v) ? v : null
  } catch { return null }
}

export async function contributieData(label: string) {
  const nu = new Date()
  const [periodes, rows] = await Promise.all([
    db.contributionPeriod.findMany({ orderBy: { start: 'asc' } }),
    // Let op: `notIn` op een nullable kolom sluit in SQL ook NULL uit → leden
    // zonder primaryGroup zouden hiermee verdwijnen uit de contributie.
    db.member.findMany({
      where: {
        clubStatus: { notIn: ['PROEF'] },
        OR: [{ primaryGroup: null }, { primaryGroup: { not: 'SENIOREN' } }],
      },
      orderBy: [{ primaryGroup: 'asc' }, { lastName: 'asc' }],
      include: { payments: { where: { period: { label } } } },
    }),
  ])

  const period = periodes.find(p => p.label === label)

  // Toon alleen leden die in deze periode lid waren: ingeschreven vóór periode-einde
  // en (nog niet uitgeschreven OF pas uitgeschreven ná periode-start).
  const data: ContribRij[] = rows
    .filter(m => {
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
      }
    })

  const totaalOpen = data
    .filter(m => ['OPEN', 'HERINNERING1', 'HERINNERING2'].includes(m.status))
    .reduce((s, m) => s + Number(m.amount), 0)

  return { periodes, data, period, totaalOpen }
}
