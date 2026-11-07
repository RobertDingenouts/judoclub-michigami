'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BeltVak } from '@/components/admin/BeltVak'
import { GROEP_LABEL, STATUS_INFO } from '@/lib/admin2'
import { getNextBelt, isSlipBelt, isYouth } from '@/lib/belt-utils'
import { BELT_COLORS } from '@/lib/student-progress-types'
import { usePropSync } from '@/lib/use-prop-sync'
import type { BeltLevel } from '@prisma/client'

export type DagCel = { id: string; datum: string; groep: string; locatie: string; cancelled: boolean; activity: string | null; vakantie?: boolean }
export type LidRef = { id: string; naam: string; clubStatus: string; groep: string; groepen?: string[]; dateOfBirth: string | null; currentBelt: string | null; joinDate?: string | null }

const CYCLE: (string | null)[] = ['AANWEZIG', 'AFGEMELD', 'ZIEK', 'NIET_AANWEZIG', 'PROEFLES', null]
const LOC_KORT: Record<string, string> = { STEENBERGEN: 'Knotwilg', OUD_VOSSEMEER: 'Vossenkuil' }
const CLUBSTATUS_LABEL: Record<string, string> = { LID: 'Lid', RESERVE: 'Reserve', STOPPEND: 'Stopt binnenkort', GESTOPT: 'Gestopt', PROEF: 'Proeflid', VRIJGESTELD: 'Vrijgesteld' }
const BAND_VOLGORDE: string[] = ['WIT', 'WIT_GEEL', 'GEEL', 'GEEL_ORANJE', 'ORANJE', 'ORANJE_GROEN', 'GROEN', 'GROEN_BLAUW', 'BLAUW', 'BLAUW_BRUIN', 'BRUIN', 'ZWART_1']

type SortKey = 'band' | 'jong' | 'lidSinds' | 'naam' | 'oud' | 'bandOmlaag' | 'aanwezig' | 'aanwezigOmlaag'
// Standaard = band (kleur); daarna leeftijd, lid sinds — zelfde standaard als Leden.
// (Groep staat hier niet: het rooster is al in groepen opgedeeld.)
const SORTOPTIES: { key: SortKey; label: string }[] = [
  { key: 'band', label: 'Band (kleur, licht→donker)' },
  { key: 'jong', label: 'Leeftijd jong→oud' },
  { key: 'lidSinds', label: 'Lid sinds (nieuwst eerst)' },
  { key: 'naam', label: 'Naam A→Z' },
  { key: 'oud', label: 'Leeftijd oud→jong' },
  { key: 'bandOmlaag', label: 'Band hoog→laag' },
  { key: 'aanwezig', label: 'Aanwezig % laag→hoog' },
  { key: 'aanwezigOmlaag', label: 'Aanwezig % hoog→laag' },
]

function leeftijd(dob: string | null): number | null {
  if (!dob) return null
  const d = new Date(dob), n = new Date()
  let a = n.getFullYear() - d.getFullYear()
  if (n.getMonth() < d.getMonth() || (n.getMonth() === d.getMonth() && n.getDate() < d.getDate())) a--
  return a
}

export function KwartaalGrid({ dagen, leden, trainers = [], cellen }: { dagen: DagCel[]; leden: LidRef[]; trainers?: LidRef[]; cellen: Record<string, string> }) {
  const router = useRouter()
  const [local, setLocal] = useState<Record<string, string | null>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [statussen, setStatussen] = usePropSync(leden, 'clubStatus')
  const [activities, setActivities] = usePropSync(dagen, 'activity')
  const [editDag, setEditDag] = useState<string | null>(null)
  const [editVal, setEditVal] = useState('')
  const [sort, setSort] = useState<SortKey>('band')
  // Compact start níét uit window.innerWidth (server rendert zonder window ->
  // hydration-mismatch). Eerst false, dan in useEffect op mobiel aanzetten.
  const [compact, setCompact] = useState(false)
  useEffect(() => {
    if (window.innerWidth < 768) setCompact(true)
  }, [])
  const [openLid, setOpenLid] = useState<string | null>(null)
  const [undoStapel, setUndoStapel] = useState<{ mid: string; naam: string; prev: string }[]>([])

  async function vlag(mid: string, clubStatus: string, naam: string, wasGestopt: boolean) {
    const prev = statussen[mid] ?? 'LID'
    setUndoStapel(p => [...p, { mid, naam, prev }])
    setStatussen(mid, clubStatus)
    await fetch('/api/admin2/member-status', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      // Een al gestopt lid houdt zijn echte stopdatum; alleen bij een verse
      // stopzetten zetten we de datum van nu.
      body: JSON.stringify({ memberId: mid, clubStatus, leaveDate: wasGestopt ? undefined : new Date().toISOString().slice(0, 10) }),
    })
    if (clubStatus === 'GESTOPT') router.refresh()
  }

  async function undo() {
    const last = undoStapel[undoStapel.length - 1]
    if (!last) return
    setUndoStapel(p => p.slice(0, -1))
    setStatussen(last.mid, last.prev)
    await fetch('/api/admin2/member-status', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId: last.mid, clubStatus: last.prev }),
    })
    router.refresh()
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
    setActivities(dagId, editVal)
    setEditDag(null)
    await fetch('/api/admin2/trainingday', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: dagId, activity: editVal || null }),
    })
    router.refresh()
  }

  // Vakantie van een hele les: iedereen in de groep op 🏖 + optionele reden
  // (bv. 'Zomervakantie'), die automatisch in de website-agenda verschijnt.
  const [vakDag, setVakDag] = useState<string | null>(null)
  const [vakReden, setVakReden] = useState('')
  async function zetVakantie(dagId: string, vakantie: boolean) {
    setVakDag(null)
    await fetch('/api/admin2/les-vakantie', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trainingDayId: dagId, vakantie, reden: vakReden || undefined }),
    })
    setVakReden('')
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
      case 'lidSinds': return c.sort((a, b) => (b.joinDate ?? '').localeCompare(a.joinDate ?? ''))
      case 'aanwezig': return c.sort((a, b) => aantallen(a, gd).pct - aantallen(b, gd).pct)
      case 'aanwezigOmlaag': return c.sort((a, b) => aantallen(b, gd).pct - aantallen(a, gd).pct)
    }
  }

  // Eén blok per groep (volgorde zoals GROEPEN), alleen groepen met lessen
  const groepen = [...new Set(dagen.map(d => d.groep))]
  const volgorde = ['VRIJDAG_1E', 'VRIJDAG_2E', 'WOENSDAG']
  groepen.sort((a, b) => volgorde.indexOf(a) - volgorde.indexOf(b))

  const celKlas = compact ? 'h-5 w-5 text-[10px]' : 'h-8 w-8 text-sm'

  return (
    <div className="space-y-5">
      {/* Dashboard-balk: sorteren + weergave */}
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2">
        <span className="text-xs font-semibold text-gray-600">Sorteer:</span>
        <select value={sort} onChange={e => setSort(e.target.value as SortKey)}
          className="rounded-sm border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-700 focus:border-[#a90000] focus:outline-none">
          {SORTOPTIES.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
        </select>
        <div className="ml-auto flex items-center gap-1.5">
          {undoStapel.length > 0 && (
            <button onClick={undo} className="rounded-sm border border-green-400 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100"
              title={`Laatste wijziging ongedaan maken: ${undoStapel[undoStapel.length - 1].naam} → ${CLUBSTATUS_LABEL[undoStapel[undoStapel.length - 1].prev] ?? undoStapel[undoStapel.length - 1].prev}`}>
              ↩ {undoStapel[undoStapel.length - 1].naam.split(' ')[0]} terugdraaien
            </button>
          )}
          <button onClick={() => setCompact(c => !c)}
            className={`rounded-sm border px-3 py-1.5 text-xs font-medium ${compact ? 'border-[#a90000] bg-[#fdf6f6] text-[#a90000]' : 'border-gray-300 bg-white text-gray-600'}`}>
            {compact ? '▦ Ingeklapt' : '⬜ Groot'}
          </button>
        </div>
      </div>

      {groepen.map(g => {
        const gdagen = dagen.filter(d => d.groep === g)
        const gleden = sorteer(leden.filter(l => (l.groepen?.length ? l.groepen : [l.groep]).includes(g)), gdagen)
        return (
          <div key={g} className="overflow-x-auto rounded-md border border-gray-200 bg-white">
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
                        className={`relative px-0.5 py-1 text-center align-top ${d.vakantie ? 'bg-gray-100' : ''} ${compact ? 'min-w-[26px]' : 'min-w-[46px]'}`}>
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
                        {vakDag === d.id ? (
                          <div className="absolute left-1/2 top-full z-30 mt-1 w-44 -translate-x-1/2 rounded-sm border border-sky-400 bg-white p-2 text-left shadow-lg" onClick={e => e.stopPropagation()}>
                            <p className="mb-1 text-[10px] font-semibold text-sky-700">Vakantie — reden?</p>
                            <input autoFocus value={vakReden} onChange={e => setVakReden(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') zetVakantie(d.id, true); if (e.key === 'Escape') setVakDag(null) }}
                              placeholder="bv. Zomervakantie"
                              className="w-full rounded border border-gray-300 px-1.5 py-1 text-[11px] focus:border-sky-500 focus:outline-none" />
                            <div className="mt-1.5 flex gap-1">
                              <button onClick={() => zetVakantie(d.id, true)} className="flex-1 rounded bg-sky-600 px-2 py-1 text-[10px] font-semibold text-white">🏖 Vakantie</button>
                              <button onClick={() => setVakDag(null)} className="rounded border border-gray-300 px-2 py-1 text-[10px] text-gray-500">✕</button>
                            </div>
                            <p className="mt-1 text-[9px] leading-tight text-gray-400">Iedereen in deze groep wordt als vakantie geregistreerd en het verschijnt in de agenda.</p>
                          </div>
                        ) : (
                          <button onClick={() => { setVakDag(d.id); setVakReden('') }}
                            className={`mt-0.5 block w-full rounded px-1 py-0.5 text-[10px] ${d.vakantie ? 'bg-sky-100 text-sky-700 font-semibold' : 'text-gray-300 hover:bg-sky-50 hover:text-sky-600'}`}
                            title={d.vakantie ? 'Vakantie — klik om uit te zetten of de reden te zien' : 'Deze les op vakantie zetten (iedereen in de groep)'}>
                            {d.vakantie ? '🏖 uit?' : '🏖'}
                          </button>
                        )}
                        {d.vakantie && vakDag !== d.id && (
                          <button onClick={() => zetVakantie(d.id, false)} className="mt-0.5 block w-full text-[9px] text-sky-600 hover:underline" title="Vakantie van deze les uitzetten">terug</button>
                        )}
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
                  const dob = leeftijd(l.dateOfBirth)
                  const open = openLid === l.id
                  return [
                    <tr key={l.id} className={`group border-b border-gray-100 last:border-0 ${gestopt ? 'bg-gray-100/70' : ''}`}>
                      <td className={`sticky left-0 z-10 px-2 py-1 group-hover:bg-gray-50 ${compact ? 'bg-white/80 backdrop-blur-sm' : 'bg-white'}`}>
                        <button onClick={() => setOpenLid(open ? null : l.id)} className={`flex w-full items-center gap-1.5 whitespace-nowrap text-left ${gestopt ? 'opacity-50' : ''}`} title="Klik voor alle gegevens en knoppen van dit lid">
                          <span title={`Band: ${l.currentBelt ?? 'nog geen'}`}><BeltVak belt={l.currentBelt} size={10} /></span>
                          <span className={`truncate font-medium ${compact ? 'max-w-[104px]' : ''} ${gestopt ? 'text-gray-400 line-through' : 'text-[#2a2a2a]'}`}>{l.naam}</span>
                          {!compact && dob !== null && <span className="text-[10px] text-gray-400">{dob}jr</span>}
                          {statussen[l.id] === 'STOPPEND' && <span className="rounded bg-amber-100 px-1 text-[9px] font-semibold text-amber-700">stopt?</span>}
                          {statussen[l.id] === 'RESERVE' && <span className="rounded bg-sky-100 px-1 text-[9px] font-semibold text-sky-700">reserve</span>}
                          <span className={`ml-auto text-[10px] text-gray-300 ${open ? 'rotate-180' : ''}`}>▾</span>
                        </button>
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
                              className={`mx-auto flex ${celKlas} items-center justify-center rounded-sm border transition-all ${
                                busy === key ? 'opacity-50' : ''
                              } ${gestopt ? 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-40' : info ? info.klas : 'border-gray-100 bg-gray-50 text-gray-300'}`}
                              title={info ? info.label : 'leeg'}>
                              {info ? info.emoji : '·'}
                            </button>
                          </td>
                        )
                      })}
                      <td className="px-2 text-center font-semibold whitespace-nowrap">{meet ? <span className={gestopt ? 'text-gray-400' : ''}><span className="text-green-700">{aanw}</span><span className="text-gray-400">/</span>{meet}</span> : '—'}</td>
                    </tr>,
                    open && (
                      <tr key={l.id + 'detail'} className="border-b border-gray-100 bg-[#fdfaf7]">
                        <td colSpan={gdagen.length + 2} className="px-3 py-2">
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-600">
                            <span className="font-semibold text-[#2a2a2a]">{l.naam}</span>
                            {dob !== null && <span>{dob} jaar</span>}
                            <span>lid sinds {l.joinDate ? new Date(l.joinDate).toLocaleDateString('nl-NL', { month: 'short', year: 'numeric' }) : '—'}</span>
                            <span>{GROEP_LABEL[l.groep] ?? l.groep}</span>
                            <span>aanwezig: {meet ? `${aanw}/${meet}` : 'nog geen lessen'}</span>
                            <span className={gestopt ? 'font-semibold text-gray-500' : ''}>status: {CLUBSTATUS_LABEL[l.clubStatus] ?? l.clubStatus}</span>
                            <span className="ml-auto flex items-center gap-1.5">
                              <Link href={`/admin/students/${l.id}`} className="rounded border border-gray-300 bg-white px-2 py-1 font-semibold text-gray-600 hover:border-[#a90000] hover:text-[#a90000]">👤 Dossier</Link>
                              {!gestopt && <button onClick={() => vlag(l.id, 'STOPPEND', l.naam, false)} className="rounded border border-amber-300 bg-white px-2 py-1 font-semibold text-amber-600 hover:bg-amber-50">⚑ stopt?</button>}
                              {!gestopt && <button onClick={() => vlag(l.id, 'GESTOPT', l.naam, false)} className="rounded border border-gray-300 bg-white px-2 py-1 font-semibold text-gray-500 hover:border-red-400 hover:text-red-600">⛔ gestopt</button>}
                              {gestopt && <button onClick={() => vlag(l.id, 'LID', l.naam, true)} className="rounded border border-green-300 bg-white px-2 py-1 font-semibold text-green-700 hover:bg-green-50">↩ weer lid</button>}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ),
                  ]
                })}
                {gleden.length === 0 && (
                  <tr><td colSpan={gdagen.length + 2} className="px-3 py-4 text-center text-gray-400">Geen leden in deze groep</td></tr>
                )}
                {/* Trainers/instructeurs: altijd onderaan, kruisbaar bij elke les */}
                {trainers.map(t => {
                  const { aanw, meet } = aantallen(t, gdagen)
                  return (
                    <tr key={t.id} className="border-t border-gray-200 bg-[#f6f3ee]">
                      <td className={`sticky left-0 z-10 px-2 py-1 ${compact ? 'bg-[#f6f3ee]/85 backdrop-blur-sm' : 'bg-[#f6f3ee]'}`}>
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <span title={`Band: ${t.currentBelt ?? 'nog geen'}`}><BeltVak belt={t.currentBelt} size={10} /></span>
                          <span className="font-medium text-[#2a2a2a]">{t.naam}</span>
                          <span className="rounded bg-[#2a2a2a] px-1 text-[9px] font-semibold text-white">trainer</span>
                        </div>
                      </td>
                      {gdagen.map(d => {
                        if (d.vakantie) return <td key={d.id} className="bg-gray-100/70 p-0.5 text-center text-[10px] text-gray-300" title="Geen les — vakantie">·</td>
                        const key = `${t.id}|${d.id}`
                        const s = get(t.id, d.id)
                        const info = s ? STATUS_INFO[s] : null
                        return (
                          <td key={d.id} className="p-0.5 text-center">
                            <button onClick={() => cycle(t.id, d.id)}
                              className={`mx-auto flex ${celKlas} items-center justify-center rounded-sm border transition-all ${busy === key ? 'opacity-50' : ''} ${info ? info.klas : 'border-gray-200 bg-white text-gray-300'}`}
                              title={info ? info.label : 'leeg'}>
                              {info ? info.emoji : '·'}
                            </button>
                          </td>
                        )
                      })}
                      <td className="px-2 text-center font-semibold whitespace-nowrap">{meet ? <span><span className="text-green-700">{aanw}</span><span className="text-gray-400">/</span>{meet}</span> : '—'}</td>
                    </tr>
                  )
                })}
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
        Cel: tik om te wisselen ✅ → 🅰 → 🤒 → ❌ → leeg · kolomkop boven = lesmodus · “+” onder de datum = activiteit van die les · klik een naam = uitklappen (leeftijd, lid sinds, statusknoppen, dossier) · per ongeluk gestopt? ↩-knop bovenaan draait het direct terug
      </p>
    </div>
  )
}
