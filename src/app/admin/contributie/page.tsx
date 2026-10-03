import { db } from '@/lib/db'
import { ContributieBoard } from './ContributieBoard'
import { PAYMENT_INFO } from '@/lib/admin2'

export const dynamic = 'force-dynamic'

export default async function ContributiePage({
  searchParams,
}: { searchParams: Promise<{ periode?: string }> }) {
  const params = await searchParams
  const nu = new Date()
  const defaultPeriode = `${nu.getFullYear()}-Q${Math.floor(nu.getMonth() / 3) + 1}`
  const label = params.periode || defaultPeriode

  const [periodes, rows] = await Promise.all([
    db.contributionPeriod.findMany({ orderBy: { start: 'asc' } }),
    db.member.findMany({
      where: { clubStatus: { notIn: ['PROEF'] }, primaryGroup: { notIn: ['SENIOREN'] } },
      orderBy: [{ primaryGroup: 'asc' }, { lastName: 'asc' }],
      include: { payments: { where: { period: { label } } } },
    }),
  ])

  const period = periodes.find(p => p.label === label)

  // Toon alleen leden die in deze periode lid waren: ingeschreven vóór periode-einde
  // en (nog niet uitgeschreven OF pas uitgeschreven ná periode-start).
  const data = rows
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

  const open = data.filter(d => ['OPEN', 'HERINNERING1', 'HERINNERING2'].includes(d.status))
  const betaald = data.filter(d => d.status === 'BETAALD')

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#2a2a2a]">Contributie</h1>
          <p className="mt-1 text-sm text-gray-500">
            {betaald.length} betaald · {open.length} open · €{open.reduce((s, d) => s + d.amount, 0).toFixed(0)} te goed
          </p>
        </div>
      </div>

      {/* Periode tabs */}
      <div className="flex flex-wrap gap-1.5">
        {periodes.map(p => (
          <a key={p.label} href={`/admin/contributie?periode=${p.label}`}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium ${p.label === label ? 'border-[#a90000] bg-[#a90000] text-white' : 'border-gray-300 bg-white text-gray-600'}`}>
            {p.label}
          </a>
        ))}
      </div>

      <ContributieBoard rows={data} periode={label} periodId={period?.id ?? ''} />
    </div>
  )
}

function safeItems(s: string): { omschrijving: string; bedrag: number }[] | null {
  try {
    const v = JSON.parse(s)
    return Array.isArray(v) ? v : null
  } catch { return null }
}
