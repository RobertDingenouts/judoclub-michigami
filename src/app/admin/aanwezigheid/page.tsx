import Link from 'next/link'
import { lessenGridData } from '@/lib/lessendata'
import { KwartaalGrid } from './KwartaalGrid'
import { GROEPEN, STATUS_INFO } from '@/lib/admin2'
import { PlanBar } from './PlanBar'

export const dynamic = 'force-dynamic'

// De data komt uit src/lib/lessendata.ts — exact dezelfde bron als de
// lessenwidget op het startscherm. Eén soort aanwezigheidslijst, geen twee.
export default async function AanwezigheidPage({
  searchParams,
}: { searchParams: Promise<{ periode?: string; groepen?: string; van?: string; tot?: string }> }) {
  const params = await searchParams
  const g = await lessenGridData({
    periode: params.periode,
    van: params.van,
    tot: params.tot,
    groepen: params.groepen ? params.groepen.split(',').filter(Boolean) : undefined,
  })
  const { periodes, periode, rangeLabel, groepen, alleLesGroepen, dagen, leden, trainers, cellen } = g
  const nu = new Date()

  const qs = (extra: Record<string, string>) => {
    const p = new URLSearchParams({ periode, groepen: groepen.join(','), ...extra })
    // Belangrijk: bij een expliciete periodeswitch (Q4, Q3, …) de vrij-reeks
    // (van/tot van "heel <jaar>") NIET meenemen — anders blijft de pagina in
    // die reeks hangen en "kun je niet meer op Q4/Q3 klikken".
    if (params.van && params.tot && extra.periode === undefined) { p.set('van', params.van); p.set('tot', params.tot) }
    return `/admin/aanwezigheid?${p.toString()}`
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#2a2a2a]">Lessen & aanwezigheid</h1>
          <p className="mt-1 text-sm text-gray-500">klik een cel om te wisselen · klik een kolomkop voor de lesmodus van die les</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/api/admin2/export?lijst=aanwezigheid"
            className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-[#a90000] hover:text-[#a90000]">⬇ Excel</a>
          <Link href="/admin/aanwezigheid/les" className="rounded-md bg-[#a90000] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#8c0000]">✏️ Lesmodus</Link>
        </div>
      </div>

      {/* Periode tabs */}
      <div className="flex flex-wrap items-center gap-1.5">
        {periodes.map(p => (
          <Link key={p.label} href={qs({ periode: p.label })}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium ${p.label === periode && !params.van ? 'border-[#a90000] bg-[#a90000] text-white' : 'border-gray-300 bg-white text-gray-600'}`}>{p.label}</Link>
        ))}
        <Link href={`/admin/aanwezigheid?periode=&van=${nu.getFullYear() + 1}-01-01&tot=${nu.getFullYear() + 2}-01-01&groepen=${groepen.join(',')}`}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-medium ${params.van ? 'border-[#a90000] bg-[#a90000] text-white' : 'border-gray-300 bg-white text-gray-600'}`}>
          📅 heel {nu.getFullYear() + 1}
        </Link>
      </div>

      {/* Groepen: aan/uit + alles selecteren */}
      <div className="flex flex-wrap items-center gap-1.5">
        {GROEPEN.filter(g => g.value !== 'SENIOREN').map(gr => {
          const aan = groepen.includes(gr.value)
          const next = aan ? groepen.filter(x => x !== gr.value) : [...groepen, gr.value]
          return (
            <a key={gr.value} href={qs({ groepen: next.join(',') || 'GEEN' })}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium ${aan ? 'border-[#2a2a2a] bg-[#2a2a2a] text-white' : 'border-gray-300 bg-white text-gray-400'}`}>
              {aan ? '✓ ' : ''}{gr.label}
            </a>
          )
        })}
        <a href={qs({ groepen: alleLesGroepen.join(',') })} className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-[#a90000]">Alles</a>
        <span className="ml-1 text-[11px] text-gray-400">meerdere groepen = blokken onder elkaar</span>
      </div>

      {/* Plannen vooruit */}
      <PlanBar rangeLabel={rangeLabel} />

      {/* Legenda */}
      <div className="flex flex-wrap gap-2 text-xs">
        {Object.entries(STATUS_INFO).map(([k, v]) => (
          <span key={k} className={`rounded-full border px-2.5 py-1 ${v.klas}`}>{v.emoji} {v.label}</span>
        ))}
        <span className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-gray-400">· leeg = niet ingevuld</span>
        <span className="rounded-full border border-[#a90000]/30 bg-[#fdf6f6] px-2.5 py-1 text-[#a90000]">🎯 = activiteit/onderwerp</span>
      </div>

      {groepen.length === 0 || dagen.length === 0 ? (
        <div className="rounded-md border border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
          {groepen.length === 0 ? 'Geen groep geselecteerd — klik hierboven een groep.' : `Geen lessen in ${rangeLabel}. Gebruik "📅 Plannen" om het vooruit te plannen.`}
        </div>
      ) : (
        <KwartaalGrid dagen={dagen} leden={leden} trainers={trainers} cellen={cellen} />
      )}
    </div>
  )
}
