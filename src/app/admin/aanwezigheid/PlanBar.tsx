'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

// Plant lesdagen volgens het weekpatroon. Opties: rest van dit jaar, heel volgend jaar, of eigen bereik.
export function PlanBar({ rangeLabel }: { rangeLabel: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [melding, setMelding] = useState<string | null>(null)
  const [van, setVan] = useState('')
  const [tot, setTot] = useState('')

  async function plan(v: string, t: string) {
    setBusy(true)
    setMelding(null)
    try {
      const res = await fetch('/api/admin2/planweken', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ van: v, tot: t }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error ?? 'fout')
      setMelding(j.gemaakt === 0 ? 'Alles al gepland ✅' : `${j.gemaakt} lesdagen gepland ✅`)
      router.refresh()
    } catch (e) {
      setMelding(`Fout: ${(e as Error).message}`)
    } finally {
      setBusy(false)
    }
  }

  const nu = new Date()
  const restVanDitJaar = () => plan(nu.toISOString().slice(0, 10), `${nu.getFullYear()}-12-31`)
  const heelVolgendJaar = () => plan(`${nu.getFullYear() + 1}-01-01`, `${nu.getFullYear() + 1}-12-31`)

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
      <span className="text-xs font-semibold text-gray-600">📅 Plannen:</span>
      <button onClick={restVanDitJaar} disabled={busy} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-[#a90000] disabled:opacity-50">rest {nu.getFullYear()}</button>
      <button onClick={heelVolgendJaar} disabled={busy} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-[#a90000] disabled:opacity-50">heel {nu.getFullYear() + 1}</button>
      <input type="date" value={van} onChange={e => setVan(e.target.value)} className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs" />
      <span className="text-xs text-gray-400">t/m</span>
      <input type="date" value={tot} onChange={e => setTot(e.target.value)} className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs" />
      <button onClick={() => van && tot && plan(van, tot)} disabled={busy || !van || !tot} className="rounded-lg bg-[#a90000] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#8c0000] disabled:opacity-50">Plan weken</button>
      {melding && <span className="text-xs font-medium text-green-700">{melding}</span>}
      <span className="ml-auto text-[11px] text-gray-400">huidig beeld: {rangeLabel}</span>
    </div>
  )
}
