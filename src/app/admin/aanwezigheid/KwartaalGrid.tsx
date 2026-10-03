'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { STATUS_INFO } from '@/lib/admin2'

type Dag = { id: string; datum: string; cancelled: boolean; activity: string | null }
type LidRef = { id: string; naam: string; clubStatus: string }

const CYCLE: (string | null)[] = ['AANWEZIG', 'AFGEMELD', 'ZIEK', 'NIET_AANWEZIG', null]

export function KwartaalGrid({ dagen, leden, cellen }: { dagen: Dag[]; leden: LidRef[]; cellen: Record<string, string> }) {
  const router = useRouter()
  const [local, setLocal] = useState<Record<string, string | null>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [statussen, setStatussen] = useState<Record<string, string>>(Object.fromEntries(leden.map(l => [l.id, l.clubStatus])))

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

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="sticky left-0 z-10 bg-gray-50 px-3 py-2 text-left font-semibold text-gray-600">Lid</th>
            {dagen.map(d => {
              const dt = new Date(d.datum)
              return (
                <th key={d.id} className="px-1 py-2 text-center font-medium text-gray-500" title={d.activity ?? ''}>
                  <button onClick={() => router.push(`/admin/aanwezigheid/les?dag=${d.id}`)} className="hover:text-[#a90000]">
                    {dt.toLocaleDateString('nl-NL', { day: 'numeric' })}/{dt.toLocaleDateString('nl-NL', { month: 'numeric' })}
                    {d.activity && <div className="mx-auto mt-0.5 h-1 w-6 rounded bg-[#a90000]" title={`🎯 ${d.activity}`} />}
                  </button>
                </th>
              )
            })}
            <th className="px-2 py-2 text-center font-semibold text-gray-500">%</th>
          </tr>
        </thead>
        <tbody>
          {leden.map(l => {
            let aanw = 0, meetellend = 0
            for (const d of dagen) {
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
                {dagen.map(d => {
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
        </tbody>
      </table>
      <p className="border-t border-gray-100 px-3 py-2 text-[11px] text-gray-400">
        Tik een cel om door te wisselen: ✅ → 🅰 → 🤒 → ❌ → leeg. Kolomkop = naar de lesmodus van die dag.
      </p>
    </div>
  )
}
