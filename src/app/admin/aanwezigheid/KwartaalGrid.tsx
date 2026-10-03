'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { GROEP_LABEL, STATUS_INFO } from '@/lib/admin2'

export type DagCel = { id: string; datum: string; groep: string; locatie: string; cancelled: boolean; activity: string | null }
export type LidRef = { id: string; naam: string; clubStatus: string; groep: string }

const CYCLE: (string | null)[] = ['AANWEZIG', 'AFGEMELD', 'ZIEK', 'NIET_AANWEZIG', null]
const LOC_KORT: Record<string, string> = { STEENBERGEN: 'Knotwilg', OUD_VOSSEMEER: 'Vossenkuil' }

export function KwartaalGrid({ dagen, leden, cellen }: { dagen: DagCel[]; leden: LidRef[]; cellen: Record<string, string> }) {
  const router = useRouter()
  const [local, setLocal] = useState<Record<string, string | null>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [statussen, setStatussen] = useState<Record<string, string>>(Object.fromEntries(leden.map(l => [l.id, l.clubStatus])))
  const [activities, setActivities] = useState<Record<string, string | null>>(Object.fromEntries(dagen.map(d => [d.id, d.activity])))
  const [editDag, setEditDag] = useState<string | null>(null)
  const [editVal, setEditVal] = useState('')

  async function vlag(mid: string, clubStatus: string) {
    setStatussen(p => ({ ...p, [mid]: clubStatus }))
    await fetch('/api/admin2/member-status', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId: mid, clubStatus, leaveDate: new Date().toISOString().slice(0, 10) }),
    })
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

  // Eén blok per groep (volgorde zoals GROEPEN), alleen groepen met lessen
  const groepen = [...new Set(dagen.map(d => d.groep))]
  const volgorde = ['VRIJDAG_1E', 'VRIJDAG_2E', 'VRIJDAG_3E', 'WOENSDAG']
  groepen.sort((a, b) => volgorde.indexOf(a) - volgorde.indexOf(b))

  return (
    <div className="space-y-5">
      {groepen.map(g => {
        const gdagen = dagen.filter(d => d.groep === g)
        const gleden = leden.filter(l => l.groep === g)
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
                      <th key={d.id} className="min-w-[46px] px-1 py-1.5 text-center align-top">
                        <button onClick={() => router.push(`/admin/aanwezigheid/les?dag=${d.id}`)} className="block w-full hover:text-[#a90000]" title="Open deze les in de lesmodus">
                          <span className="block text-[10px] font-normal text-gray-400">{dt.toLocaleDateString('nl-NL', { weekday: 'short' })}</span>
                          <span className="block font-semibold text-gray-700">{dt.toLocaleDateString('nl-NL', { day: 'numeric' })}/{dt.toLocaleDateString('nl-NL', { month: 'numeric' })}</span>
                        </button>
                        {editDag === d.id ? (
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
                        )}
                        {d.cancelled && <span className="mt-0.5 block text-[10px] font-semibold text-red-600">GEANN. (verzet)</span>}
                      </th>
                    )
                  })}
                  <th className="px-2 py-2 text-center font-semibold text-gray-500">%</th>
                </tr>
              </thead>
              <tbody>
                {gleden.map(l => {
                  let aanw = 0, meetellend = 0
                  for (const d of gdagen) {
                    const s = get(l.id, d.id)
                    if (s && s !== 'VAKANTIE') { meetellend++; if (s === 'AANWEZIG') aanw++ }
                  }
                  return (
                    <tr key={l.id} className="border-b border-gray-100 last:border-0">
                      <td className="sticky left-0 z-10 bg-white px-3 py-1.5">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <span className="font-medium text-[#2a2a2a]">{l.naam}</span>
                          <button onClick={() => vlag(l.id, statussen[l.id] === 'STOPPEND' ? 'LID' : 'STOPPEND')} title="Markeren als stopt?"
                            className={`rounded px-1 text-[11px] ${statussen[l.id] === 'STOPPEND' ? 'bg-amber-400 text-white' : 'text-gray-300 hover:text-amber-500'}`}>⚠️</button>
                          <button onClick={() => vlag(l.id, statussen[l.id] === 'GESTOPT' ? 'LID' : 'GESTOPT')} title="Definitief gestopt (naar archief)"
                            className={`rounded px-1 text-[11px] ${statussen[l.id] === 'GESTOPT' ? 'bg-gray-500 text-white' : 'text-gray-300 hover:text-gray-600'}`}>⛔</button>
                        </div>
                      </td>
                      {gdagen.map(d => {
                        const key = `${l.id}|${d.id}`
                        const s = get(l.id, d.id)
                        const info = s ? STATUS_INFO[s] : null
                        return (
                          <td key={d.id} className="p-0.5 text-center">
                            <button onClick={() => cycle(l.id, d.id)}
                              className={`mx-auto flex h-8 w-8 items-center justify-center rounded-md border text-sm transition-all ${
                                busy === key ? 'opacity-50' : ''
                              } ${info ? info.klas : 'border-gray-100 bg-gray-50 text-gray-300'}`}
                              title={info ? info.label : 'leeg'}>
                              {info ? info.emoji : '·'}
                            </button>
                          </td>
                        )
                      })}
                      <td className="px-2 text-center font-semibold text-gray-600">{meetellend ? `${Math.round((aanw / meetellend) * 100)}%` : '—'}</td>
                    </tr>
                  )
                })}
                {gleden.length === 0 && (
                  <tr><td colSpan={gdagen.length + 2} className="px-3 py-4 text-center text-gray-400">Geen leden met deze groep als hoofdgroep</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )
      })}
      <p className="text-[11px] text-gray-400">
        Cel: tik om te wisselen ✅ → 🅰 → 🤒 → ❌ → leeg · kolomkop boven = lesmodus · “+” onder de datum = activiteit/onderwerp van die les invullen.
      </p>
    </div>
  )
}
