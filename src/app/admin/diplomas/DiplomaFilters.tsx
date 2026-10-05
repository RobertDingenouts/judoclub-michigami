'use client'

// Filter- en sorteerbalk voor de diplomalijst. Alles gaat via URL-parameters,
// zodat de server blijft filteren (en de lijst dus ook bij veel diploma's klopt).
// De balk is standaard ingeklapt; het actieve filter is altijd zichtbaar als pil.
import { useRouter } from 'next/navigation'

export type DiplomaFilterState = {
  type: string; band: string; jaar: string; q: string; sort: string
}

const SORTEN: Record<string, string> = {
  '': 'Nieuwste eerst',
  'oud': 'Oudste eerst',
  'naam': 'Naam A–Z',
  'lid': 'Lid A–Z',
}

export function DiplomaFilters({ state, types, banden, jaren, totaal }: {
  state: DiplomaFilterState
  types: Record<string, string>
  banden: string[]
  jaren: string[]
  totaal: number
}) {
  const router = useRouter()

  function zet(veld: string, waarde: string) {
    const p = new URLSearchParams()
    const next = { ...state, [veld]: waarde }
    for (const [k, v] of Object.entries(next)) if (v) p.set(k, v)
    router.push(`/admin/diplomas${p.toString() ? `?${p}` : ''}`)
  }

  const actief = [
    state.type && types[state.type],
    state.band && `band ${state.band.toLowerCase()}`,
    state.jaar && `jaar ${state.jaar}`,
    state.q && `“${state.q}”`,
  ].filter(Boolean) as string[]

  const sel = 'rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs focus:border-[#a90000] focus:outline-none'

  return (
    <details className="rounded-xl border border-gray-200 bg-white" open={actief.length > 0}>
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-sm font-semibold text-[#2a2a2a] [&::-webkit-details-marker]:hidden">
        <span>⚙️ Filter & sorteren</span>
        {actief.length > 0
          ? <span className="rounded-full bg-[#a90000]/10 px-2 py-0.5 text-[11px] font-medium text-[#a90000]">{actief.join(' · ')}</span>
          : <span className="text-xs font-normal text-gray-400">alles ({totaal})</span>}
        {actief.length > 0 && (
          <button onClick={e => { e.preventDefault(); router.push('/admin/diplomas') }}
            className="ml-auto text-xs font-normal text-gray-400 hover:text-[#a90000]">wissen ✕</button>
        )}
      </summary>
      <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 px-3 py-2.5">
        <select value={state.type} onChange={e => zet('type', e.target.value)} className={sel} aria-label="Type">
          <option value="">Alle types</option>
          {Object.entries(types).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
        <select value={state.band} onChange={e => zet('band', e.target.value)} className={sel} aria-label="Band">
          <option value="">Alle banden</option>
          {banden.map(b => <option key={b} value={b}>{b.charAt(0) + b.slice(1).toLowerCase()}</option>)}
        </select>
        <select value={state.jaar} onChange={e => zet('jaar', e.target.value)} className={sel} aria-label="Jaar">
          <option value="">Alle jaren</option>
          {jaren.map(j => <option key={j} value={j}>{j}</option>)}
        </select>
        <select value={state.sort} onChange={e => zet('sort', e.target.value)} className={sel} aria-label="Sorteren">
          {Object.entries(SORTEN).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
        <input defaultValue={state.q} onKeyDown={e => { if (e.key === 'Enter') zet('q', (e.target as HTMLInputElement).value) }}
          placeholder="Zoek naam of titel…" className={`${sel} min-w-[140px] flex-1`} aria-label="Zoeken" />
      </div>
    </details>
  )
}
