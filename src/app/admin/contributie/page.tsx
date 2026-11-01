import { contributieData } from '@/lib/contributiedata'
import { ContributieBoard } from './ContributieBoard'
import { PeriodeSelect } from './PeriodeSelect'

export const dynamic = 'force-dynamic'

// De rijen komen uit src/lib/contributiedata.ts — exact dezelfde bron als de
// contributiewidget op het startscherm. Eén lijst, geen twee.
export default async function ContributiePage({
  searchParams,
}: { searchParams: Promise<{ periode?: string; gestopt?: string }> }) {
  const params = await searchParams
  const nu = new Date()
  const label = params.periode || `${nu.getFullYear()}-Q${Math.floor(nu.getMonth() / 3) + 1}`
  const toonGestopt = params.gestopt === '1'

  const { periodes, data, period, totaalOpen } = await contributieData(label, { toonGestopt })
  const open = data.filter(d => d.vervald)
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
          className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-[#a90000] hover:text-[#a90000]">⬇ Excel ({label})</a>
      </div>

      {/* Periode-selectie: ingeklapt in één dropdown, ook op de telefoon compact */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Periode</span>
        <PeriodeSelect periodes={periodes.map(p => p.label)} huidige={label} gestopt={toonGestopt} />
        <span className="text-xs text-gray-400">volgend kwartaal verschijnt automatisch</span>
      </div>

      <ContributieBoard rows={data} periode={label} periodId={period?.id ?? ''} totaalOpen={totaalOpen} toonGestopt={toonGestopt} />
    </div>
  )
}
