import { contributieData } from '@/lib/contributiedata'
import { ContributieBoard } from './ContributieBoard'

export const dynamic = 'force-dynamic'

// De rijen komen uit src/lib/contributiedata.ts — exact dezelfde bron als de
// contributiewidget op het startscherm. Eén lijst, geen twee.
export default async function ContributiePage({
  searchParams,
}: { searchParams: Promise<{ periode?: string }> }) {
  const params = await searchParams
  const nu = new Date()
  const label = params.periode || `${nu.getFullYear()}-Q${Math.floor(nu.getMonth() / 3) + 1}`

  const { periodes, data, period, totaalOpen } = await contributieData(label)
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
        <a href={`/api/admin2/export?lijst=contributie&periode=${label}`}
          className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-[#a90000] hover:text-[#a90000]">⬇ Excel ({label})</a>
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

      <ContributieBoard rows={data} periode={label} periodId={period?.id ?? ''} totaalOpen={totaalOpen} />
    </div>
  )
}
