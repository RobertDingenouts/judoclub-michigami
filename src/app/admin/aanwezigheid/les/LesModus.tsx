'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { STATUS_INFO } from '@/lib/admin2'

type Lid = { id: string; naam: string; status: string | null; gast?: boolean; hist: Record<string, string>; band?: { huidig: string | null; huidigKleur: string; volgende: string | null; volgendeKleur: string; slip: boolean } }
type DagInfo = { id: string; datum: string; groep: string; groepLabel: string; activity: string | null; vakantie?: boolean; cancelled: boolean }
type DagTab = { id: string; label: string; actief: boolean }
type HistDag = { id: string; label: string }

const KNoppen: { status: string; kort: string }[] = [
  { status: 'AANWEZIG', kort: '✅' },
  { status: 'AFGEMELD', kort: '🅰' },
  { status: 'ZIEK', kort: '🤒' },
  { status: 'NIET_AANWEZIG', kort: '❌' },
  { status: 'VAKANTIE', kort: '🏖' },
]

export function LesModus({ dag, leden: initLeden, recenteDagen, historie }: { dag: DagInfo; leden: Lid[]; recenteDagen: DagTab[]; historie: HistDag[] }) {
  const router = useRouter()
  const [leden, setLeden] = useState(initLeden)
  const [activity, setActivity] = useState(dag.activity ?? '')
  const [opgeslagen, setOpgeslagen] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [gastNaam, setGastNaam] = useState<string | null>(null)
  const [gastBusy, setGastBusy] = useState(false)

  async function voegGastToe() {
    if (!gastNaam?.trim() || gastBusy) return
    setGastBusy(true)
    try {
      const res = await fetch('/api/admin2/gast', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ naam: gastNaam.trim(), groep: dag.groep }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error)
      setLeden(prev => prev.some(l => l.id === j.id) ? prev : [...prev, { id: j.id, naam: j.naam, status: null, gast: true, hist: {} }])
      setGastNaam(null)
      setOpgeslagen(`${j.naam} toegevoegd als gast`)
    } catch (e) {
      setOpgeslagen(`Fout: ${(e as Error).message}`)
    } finally {
      setGastBusy(false)
    }
  }

  async function zetStatus(lidId: string, status: string | null) {
    setBusy(lidId)
    setLeden(prev => prev.map(l => l.id === lidId ? { ...l, status } : l))
    try {
      const res = await fetch('/api/admin2/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: lidId, trainingDayId: dag.id, status }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setOpgeslagen(`${new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })} opgeslagen`)
    } catch (e) {
      setOpgeslagen(`Fout: ${(e as Error).message}`)
    } finally {
      setBusy(null)
    }
  }

  async function slaActivityOp(next: string) {
    setActivity(next)
    try {
      await fetch('/api/admin2/trainingday', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: dag.id, activity: next }),
      })
    } catch { /* stil */ }
  }

  const tellen = (s: string) => leden.filter(l => l.status === s).length
  const aantalAanwezig = (l: Lid) => Object.values(l.hist).filter(s => s === 'AANWEZIG').length
  const aantalMetData = (l: Lid) => Object.values(l.hist).filter(s => s && s !== 'VAKANTIE').length

  return (
    <div className="space-y-4">
      {/* Dagwissel */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {recenteDagen.map(d => (
          <Link key={d.id} href={`/admin/aanwezigheid/les?dag=${d.id}`}
            className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-medium ${d.actief ? 'border-[#a90000] bg-[#a90000] text-white' : 'border-gray-300 bg-white text-gray-600'}`}>
            {d.label}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-[#2a2a2a]">
            {new Date(dag.datum).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}
            {dag.vakantie && <span className="ml-2 align-middle rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-600">🏖 Geen les — vakantie</span>}
          </h1>
          <p className="text-sm text-gray-500">{dag.groepLabel} · {leden.length} leden</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full bg-green-100 px-2.5 py-1 text-green-800">{tellen('AANWEZIG')} ✅</span>
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-800">{tellen('AFGEMELD')} 🅰</span>
          <span className="rounded-full bg-red-100 px-2.5 py-1 text-red-800">{tellen('NIET_AANWEZIG')} ❌</span>
          {opgeslagen && <span className="text-gray-400">{opgeslagen}</span>}
        </div>
      </div>

      {/* Lesonderwerp */}
      <div className="rounded-xl border border-gray-200 bg-white p-3">
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">🎯 Onderwerp / activiteit van deze les</label>
        <input value={activity} onChange={e => setActivity(e.target.value)}
          onBlur={() => slaActivityOp(activity)}
          placeholder="bv. valvastheid + grondwerk"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none" />
      </div>

      {/* Gast / proefles toevoegen */}
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-3">
        {gastNaam === null ? (
          <button onClick={() => setGastNaam('')} className="text-sm font-medium text-[#a90000]">+ Gast / proefles toevoegen</button>
        ) : (
          <div className="flex gap-2">
            <input autoFocus value={gastNaam} onChange={e => setGastNaam(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && voegGastToe()}
              placeholder="Naam gast (voor + achternaam)"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#a90000] focus:outline-none" />
            <button onClick={voegGastToe} disabled={!gastNaam.trim() || gastBusy}
              className="rounded-lg bg-[#a90000] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {gastBusy ? '…' : 'Toevoegen'}
            </button>
            <button onClick={() => setGastNaam(null)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-500">✕</button>
          </div>
        )}
      </div>

      {/* Ledenlijst met grote knoppen */}
      <div className="space-y-2">
        {leden.map(l => (
          <div key={l.id} className={`rounded-xl border bg-white p-3 ${busy === l.id ? 'opacity-60' : ''}`}>
            <div className="mb-2 flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-semibold text-[#2a2a2a]">
                <span>{l.naam}</span>
                {l.band && (
                  <span className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-1.5 py-0.5" title={`Band: ${l.band.huidig ?? 'nog geen band'} → volgende: ${l.band.volgende ?? '—'}${l.band.slip ? ' (met slip)' : ''}`}>
                    <span className="h-3 w-3 rounded-full border border-gray-300" style={{ background: l.band.huidigKleur }} />
                    <span className="text-[9px] text-gray-400">→</span>
                    <span className={`h-3 w-3 rounded-full border border-gray-300 ${l.band.slip ? 'ring-1 ring-[#a90000]/40' : ''}`} style={{ background: l.band.volgendeKleur }} />
                    {l.band.slip && <span className="text-[9px] font-semibold text-[#a90000]">slip</span>}
                  </span>
                )}
                {l.gast && <span className="rounded border border-sky-300 bg-sky-50 px-1.5 py-0.5 text-[10px] font-medium text-sky-700">gast</span>}
              </p>
              <div className="flex items-center gap-2">
                {historie.length > 0 && (
                  <span className="flex items-center gap-1.5" title={`Laatste ${historie.length} lessen van deze groep`}>
                    <span className="hidden items-center gap-0.5 sm:flex">
                      {historie.map(h => {
                        const s = l.hist[h.id]
                        return <span key={h.id} className={`flex h-5 w-5 items-center justify-center rounded text-[10px] ${s ? STATUS_INFO[s]?.klas ?? 'bg-gray-100' : 'bg-gray-50 text-gray-300 border border-gray-100'}`}>{s ? STATUS_INFO[s]?.emoji : '·'}</span>
                      })}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">{aantalAanwezig(l)}/{aantalMetData(l)} eerdere</span>
                  </span>
                )}
                {l.status && (
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_INFO[l.status]?.klas ?? ''}`}>
                    {STATUS_INFO[l.status]?.emoji} {STATUS_INFO[l.status]?.label}
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {KNoppen.map(k => (
                <button key={k.status} onClick={() => zetStatus(l.id, l.status === k.status ? null : k.status)}
                  className={`min-h-[44px] rounded-lg border text-base font-semibold transition-all ${
                    l.status === k.status
                      ? 'border-[#a90000] bg-[#a90000] text-white shadow-inner'
                      : 'border-gray-200 bg-gray-50 text-gray-500 active:scale-95'
                  }`}
                  title={STATUS_INFO[k.status]?.label}>
                  {k.kort}
                </button>
              ))}
            </div>
          </div>
        ))}
        {leden.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
            Geen leden in deze groep. Wijs groepen toe via Leden → lid → Bewerken.
          </div>
        )}
      </div>

      <p className="text-center text-[11px] text-gray-400">Tik een knop nogmaals om te wissen · alles slaat automatisch op</p>
    </div>
  )
}
