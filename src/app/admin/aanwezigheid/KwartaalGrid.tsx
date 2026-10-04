'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { GROEP_LABEL, STATUS_INFO } from '@/lib/admin2'
import { getNextBelt, isSlipBelt, isYouth } from '@/lib/belt-utils'
import { BELT_COLORS } from '@/lib/student-progress-types'
import type { BeltLevel } from '@prisma/client'

export type DagCel = { id: string; datum: string; groep: string; locatie: string; cancelled: boolean; activity: string | null; vakantie?: boolean }
export type LidRef = { id: string; naam: string; clubStatus: string; groep: string; dateOfBirth: string | null; currentBelt: string | null }

const CYCLE: (string | null)[] = ['AANWEZIG', 'AFGEMELD', 'ZIEK', 'NIET_AANWEZIG', null]
const LOC_KORT: Record<string, string> = { STEENBERGEN: 'Knotwilg', OUD_VOSSEMEER: 'Vossenkuil' }
const BAND_VOLGORDE: string[] = ['WIT', 'WIT_GEEL', 'GEEL', 'GEEL_ORANJE', 'ORANJE', 'ORANJE_GROEN', 'GROEN', 'GROEN_BLAUW', 'BLAUW', 'BLAUW_BRUIN', 'BRUIN', 'ZWART_1']

type SortKey = 'naam' | 'jong' | 'oud' | 'band' | 'bandOmlaag' | 'aanwezig' | 'aanwezigOmlaag'
const SORTOPTIES: { key: SortKey; label: string }[] = [
  { key: 'naam', label: 'Naam A→Z' },
  { key: 'jong', label: 'Leeftijd jong→oud' },
  { key: 'oud', label: 'Leeftijd oud→jong' },
  { key: 'band', label: 'Band laag→hoog' },
  { key: 'bandOmlaag', label: 'Band hoog→laag' },
  { key: 'aanwezig', label: 'Aanwezig % laag→hoog' },
  { key: 'aanwezigOmlaag', label: 'Aanwezig % hoog→laag' },
]

function bandStippen(l: LidRef) {
  const jeugd = isYouth(l.dateOfBirth ? new Date(l.dateOfBirth) : null)
  const volgende = getNextBelt(l.currentBelt as BeltLevel | null, jeugd)
  return {
    huidigKleur: l.currentBelt ? (BELT_COLORS as Record<string, string>)[l.currentBelt] ?? '#ccc' : '#7C3AED',
    volgendeKleur: volgende ? (BELT_COLORS as Record<string, string>)[volgende] ?? '#ccc' : '#eee',
    slip: volgende ? isSlipBelt(volgende) : false,
    volgende: volgende as string | null,
  }
}

function leeftijd(dob: string | null): number | null {
  if (!dob) return null
  const d = new Date(dob), n = new Date()
  let a = n.getFullYear() - d.getFullYear()
  if (n.getMonth() < d.getMonth() || (n.getMonth() === d.getMonth() && n.getDate() < d.getDate())) a--
  return a
}

export function KwartaalGrid({ dagen, leden, cellen }: { dagen: DagCel[]; leden: LidRef[]; cellen: Record<string, string> }) {
  const router = useRouter()
  const [local, setLocal] = useState<Record<string, string | null>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [statussen, setStatussen] = useState<Record<string, string>>(Object.fromEntries(leden.map(l => [l.id, l.clubStatus])))
  const [verwijderd, setVerwijderd] = useState<string[]>([])
  const [activities, setActivities] = useState<Record<string, string | null>>(Object.fromEntries(dagen.map(d => [d.id, d.activity])))
  const [editDag, setEditDag] = useState<string | null>(null)
  const [editVal, setEditVal] = useState('')
  const [sort, setSort] = useState<SortKey>('naam')
  const [compact, setCompact] = useState(false)

  async function vlag(mid: string, clubStatus: string) {
    setStatussen(p => ({ ...p, [mid]: clubStatus }))
    await fetch('/api/admin2/member-status', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId: mid, clubStatus, leaveDate: new Date().toISOString().slice(0, 10) }),
    })
    if (clubStatus === 'GESTOPT') router.refresh()
  }

  const get = (mid: string, dagId: string) => {
    const key = `${mid}|${dagId}`
    return key in local ? local[key] : (cellen[key] ?? null)
  }

  async function cycle(mid: string, dagId: string) {
    const key = `${mid}|${dagId}`
    const cur = get(mid, dagId)
    const next = CYCLE[(CYCLE.indexOf(cur ?? null) + 1) % CYCLE.length]
    setBusy(key)
    setLocal(p => ({ ...p, [key]: next }))
    try {
      const res = await fetch('/api/admin2/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: mid, trainingDayId: dagId, status: next }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
    } catch {
      setLocal(p => ({ ...p, [key]: cur ?? null }))
    } finally {
      setBusy(null)
    }
  }

  async function slaActivity(dagId: string) {
    setActivities(p => ({ ...p, [dagId]: editVal || null }))
    setEditDag(null)
    await fetch('/api/admin2/trainingday', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: dagId, activity: editVal || null }),
    })
    router.refresh()
  }

  const aantallen = (l: LidRef, gd: DagCel[]) => {
    let aanw = 0, meet = 0
    for (const d of gd) {
      // Vakantiedagen tellen niet mee in het percentage
      if (d.vakantie) continue
      const s = get(l.id, d.id)
      if (s && s !== 'VAKANTIE') { meet++; if (s === 'AANWEZIG') aanw++ }
    }
    return { aanw, meet, pct: meet ? aanw / meet : -1 }
  }

  function sorteer(arr: LidRef[], gd: DagCel[]): LidRef[] {
    const c = [...arr]
    switch (sort) {
      case 'naam': return c.sort((a, b) => a.naam.localeCompare(b.naam))
      case 'jong': return c.sort((a, b) => (b.dateOfBirth ?? '0000').localeCompare(a.dateOfBirth ?? '0000'))
      case 'oud': return c.sort((a, b) => (a.dateOfBirth ?? '9999').localeCompare(b.dateOfBirth ?? '9999'))
      case 'band': return c.sort((a, b) => BAND_VOLGORDE.indexOf(a.currentBelt ?? '') - BAND_VOLGORDE.indexOf(b.currentBelt ?? ''))
      case 'bandOmlaag': return c.sort((a, b) => BAND_VOLGORDE.indexOf(b.currentBelt ?? '') - BAND_VOLGORDE.indexOf(a.currentBelt ?? ''))
      case 'aanwezig': return c.sort((a, b) => aantallen(a, gd).pct - aantallen(b, gd).pct)
      case 'aanwezigOmlaag': return c.sort((a, b) => aantallen(b, gd).pct - aantallen(a, gd).pct)
    }
  }

  // Eén blok per groep (volgorde zoals GROEPEN), alleen groepen met lessen
  const groepen = [...new Set(dagen.map(d => d.groep))]
  const volgorde = ['VRIJDAG_1E', 'VRIJDAG_2E', 'VRIJDAG_3E', 'WOENSDAG']
  groepen.sort((a, b) => volgorde.indexOf(a) - volgorde.indexOf(b))

  const celKlas = compact ? 'h-6 w-6 text-[11px]' : 'h-8 w-8 text-sm'

  return (
    <div className="space-y-5">
      {/* Dashboard-balk: sorteren + weergave */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
        <span className="text-xs font-semibold text-gray-600">Sorteer:</span>
        <select value={sort} onChange={e => setSort(e.target.value as SortKey)}
          className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-700 focus:border-[#a90000] focus:outline-none">
          {SORTOPTIES.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
        </select>
        <div className="ml-auto flex items-center gap-1.5">
          <button onClick={() => setCompact(c => !c)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${compact ? 'border-[#a90000] bg-[#fdf6f6] text-[#a90000]' : 'border-gray-300 bg-white text-gray-600'}`}>
            {compact ? '▦ Ingeklapt' : '⬜ Groot'}
          </button>
        </div>
      </div>

      {groepen.map(g => {
        const gdagen = dagen.filter(d => d.groep === g)
        const gleden = sorteer(leden.filter(l => l.groep === g && !verwijderd.includes(l.id)), gdagen)
        return (
          <div key={g} className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
              <h2 className="text-sm font-bold text-[#2a2a2a]">{GROEP_LABEL[g] ?? g}
                <span className="ml-2 text-xs font-normal text-gray-400">{LOC_KORT[gdagen[0]?.locatie] ?? gdagen[0]?.locatie} · {gdagen.length} lessen</span>
              </h2>
              <span className="text-[11px] text-gray-400">{gleden.length} leden</span>
            </div>
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="sticky left-0 z-10 bg-gray-50 px-3 py-2 text-left font-semibold text-gray-600">Lid</th>
                  {gdagen.map(d => {
                    const dt = new Date(d.datum)
                    const act = activities[d.id]
                    return (
                      <th key={d.id}
                        className={`px-1 py-1.5 text-center align-top ${d.vakantie ? 'bg-gray-100' : ''} ${compact ? 'min-w-[34px]' : 'min-w-[46px]'}`}>
                        <button onClick={() => router.push(`/admin/aanwezigheid/les?dag=${d.id}`)} className="block w-full hover:text-[#a90000]" title={d.vakantie ? 'Geen les (vakantie) — klik voor de lesdetails' : 'Open deze les in de lesmodus'}>
                          <span className="block text-[10px] font-normal text-gray-400">{dt.toLocaleDateString('nl-NL', { weekday: 'short' })}</span>
                          <span className={`block font-semibold ${d.vakantie ? 'text-gray-400' : 'text-gray-700'}`}>
                            {d.vakantie ? '🏖' : `${dt.toLocaleDateString('nl-NL', { day: 'numeric' })}/${dt.toLocaleDateString('nl-NL', { month: 'numeric' })}`}
                          </span>
                        </button>
                        {!compact && (editDag === d.id ? (
                          <input autoFocus value={editVal} onChange={e => setEditVal(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') slaActivity(d.id); if (e.key === 'Escape') setEditDag(null) }}
                            onBlur={() => slaActivity(d.id)} placeholder="onderwerp…"
                            className="mt-1 w-20 rounded border border-[#a90000] px-1 py-0.5 text-center text-[10px]" />
                        ) : (
                          <button onClick={() => { setEditDag(d.id); setEditVal(act ?? '') }}
                            className={`mt-1 block w-full truncate rounded px-1 py-0.5 text-[10px] ${act ? 'bg-[#fdf6f6] font-medium text-[#a90000]' : 'text-gray-300 hover:bg-gray-100'}`}
                            title={act ? 'Bewerk activiteit' : '+ activiteit/onderwerp'}>
                            {act ? `🎯 ${act}` : '+'}
                          </button>
                        ))}
                        {d.cancelled && <span className="mt-0.5 block text-[10px] font-semibold text-red-600">GEANN. (verzet)</span>}
                      </th>
                    )
                  })}
                  <th className="px-2 py-2 text-center font-semibold text-gray-500">Aanw.</th>
                </tr>
              </thead>
              <tbody>
                {gleden.map(l => {
                  const { aanw, meet } = aantallen(l, gdagen)
                  const gestopt = statussen[l.id] === 'GESTOPT'
                  const b = bandStippen(l)
                  const dob = leeftijd(l.dateOfBirth)
                  return (
                    <tr key={l.id} className={`group border-b border-gray-100 last:border-0 ${gestopt ? 'bg-gray-100/70' : ''}`}>
                      <td className="sticky left-0 z-10 bg-white px-3 py-1.5 group-hover:bg-gray-50">
                        <div className={`flex items-center gap-2 whitespace-nowrap ${gestopt ? 'opacity-50' : ''}`}>
                          <span className="flex items-center gap-0.5" title={`Band: ${l.currentBelt ?? 'nog geen'} → volgende: ${b.volgende ?? '—'}${b.slip ? ' (met slip)' : ''}`}>
                            <span className="h-2.5 w-2.5 rounded-full border border-gray-300" style={{ background: b.huidigKleur }} />
                            <span className={`h-2.5 w-2.5 rounded-full border border-gray-300 ${b.slip ? 'ring-1 ring-[#a90000]/40' : ''}`} style={{ background: b.volgendeKleur }} />
                          </span>
                          <span className={`font-medium ${gestopt ? 'text-gray-400 line-through' : 'text-[#2a2a2a]'}`}>{l.naam}</span>
                          {dob !== null && <span className="text-[10px] text-gray-400">{dob}jr</span>}
                          {statussen[l.id] === 'STOPPEND' && <span className="rounded bg-amber-100 px-1 text-[9px] font-semibold text-amber-700">stopt?</span>}
                          {statussen[l.id] === 'RESERVE' && <span className="rounded bg-sky-100 px-1 text-[9px] font-semibold text-sky-700">reserve</span>}
                          {/* Subtiele vlagknoppen: pas zichtbaar bij hover */}
                          {!gestopt && (
                            <span className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                              <button onClick={() => vlag(l.id, 'STOPPEND')} title="Markeren als stopt?" className="rounded px-1 text-[11px] text-gray-300 hover:text-amber-500">⚑</button>
                              <button onClick={() => vlag(l.id, 'GESTOPT')} title="Definitief gestopt — rij wordt grijs, daarna uit de lijst halen" className="rounded px-1 text-[11px] text-gray-300 hover:text-gray-600">⛔</button>
                            </span>
                          )}
                          {gestopt && (
                            <button onClick={() => setVerwijderd(p => [...p, l.id])} title="Uit dit overzicht halen (archief blijft behouden)"
                              className="rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-gray-500 hover:border-red-400 hover:text-red-600">✕ uit lijst</button>
                          )}
                        </div>
                      </td>
                      {gdagen.map(d => {
                        // Vakantiedag: grijs, niet klikbaar — er is geen les gegeven
                        if (d.vakantie) {
                          return (
                            <td key={d.id} className="bg-gray-100/70 p-0.5 text-center text-[10px] text-gray-300" title="Geen les — vakantie">·</td>
                          )
                        }
                        const key = `${l.id}|${d.id}`
                        const s = get(l.id, d.id)
                        const info = s ? STATUS_INFO[s] : null
                        return (
                          <td key={d.id} className="p-0.5 text-center">
                            <button onClick={() => !gestopt && cycle(l.id, d.id)} disabled={gestopt}
                              className={`mx-auto flex ${celKlas} items-center justify-center rounded-md border transition-all ${
                                busy === key ? 'opacity-50' : ''
                              } ${gestopt ? 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-40' : info ? info.klas : 'border-gray-100 bg-gray-50 text-gray-300'}`}
                              title={info ? info.label : 'leeg'}>
                              {info ? info.emoji : '·'}
                            </button>
                          </td>
                        )
                      })}
                      <td className="px-2 text-center font-semibold whitespace-nowrap">{meet ? <span className={gestopt ? 'text-gray-400' : ''}><span className="text-green-700">{aanw}</span><span className="text-gray-400">/</span>{meet}</span> : '—'}</td>
                    </tr>
                  )
                })}
                {gleden.length === 0 && (
                  <tr><td colSpan={gdagen.length + 2} className="px-3 py-4 text-center text-gray-400">Geen leden met deze groep als hoofdgroep</td></tr>
                )}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200 bg-gray-50">
                  <td className="sticky left-0 z-10 bg-gray-50 px-3 py-1.5 text-[11px] font-semibold text-gray-500">Aanwezig / leden</td>
                  {gdagen.map(d => {
                    const aanw = gleden.filter(l => get(l.id, d.id) === 'AANWEZIG').length
                    return <td key={d.id} className="px-1 py-1.5 text-center text-[11px] font-semibold whitespace-nowrap"><span className="text-green-700">{aanw}</span><span className="text-gray-400">/</span><span className="text-gray-500">{gleden.length}</span></td>
                  })}
                  <td className="px-2 text-center text-[11px] font-semibold text-gray-500">{(() => {
                    const tot = gleden.reduce((s, l) => s + aantallen(l, gdagen).aanw, 0)
                    const meet = gleden.reduce((s, l) => s + aantallen(l, gdagen).meet, 0)
                    return meet ? <span><span className="text-green-700">{tot}</span>/<span className="text-gray-500">{meet}</span></span> : '—'
                  })()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )
      })}
      <p className="text-[11px] text-gray-400">
        Cel: tik om te wisselen ✅ → 🅰 → 🤒 → ❌ → leeg · kolomkop boven = lesmodus · “+” onder de datum = activiteit van die les · zweef over een naam voor de vlagknoppen (⚑ stopt? · ⛔ gestopt → rij grijs, ✕ haalt uit lijst)
      </p>
    </div>
  )
}
