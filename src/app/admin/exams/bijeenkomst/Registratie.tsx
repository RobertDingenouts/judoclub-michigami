'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { eisenVoorBelt, BELT_SEQ, BELT_NL } from '@/lib/examen-eisen'
import { getBeltColor } from '@/lib/belt-utils'
import type { BeltLevel } from '@prisma/client'

interface Attempt {
  id: string; memberId: string; naam: string; huidigeBelt: string | null; beltLevel: string
  status: string; examDate: string | null; categoryResults: Record<string, boolean>; heeftDiploma: boolean
}
interface Props {
  sitting: { id: string; date: string; groep: string; groepLabel: string; title: string | null; examiners: string | null }
  attempts: Attempt[]
  kandidaten: { memberId: string; naam: string; doel: string }[]
}

function Chip({ belt }: { belt: string | null }) {
  return <span className="inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-gray-400 align-middle" style={{ backgroundColor: getBeltColor(belt as BeltLevel | null) }} />
}

export default function Registratie({ sitting, attempts: init, kandidaten }: Props) {
  const router = useRouter()
  const [attempts, setAttempts] = useState(init)
  const [kies, setKies] = useState('')
  const [examiners, setExaminers] = useState(sitting.examiners || 'Pascal, Robert')
  const [busy, setBusy] = useState<string | null>(null)

  const klaar = attempts.filter(a => a.status !== 'SCHEDULED').length

  async function patch(id: string, body: Record<string, unknown>, refill = false) {
    setBusy(id)
    await fetch(`/api/admin/examens/attempts/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setBusy(null)
    if (refill) router.refresh()
  }

  function toggleVak(id: string, vakId: string, current: Record<string, boolean>) {
    const next = { ...current, [vakId]: !current[vakId] }
    setAttempts(a => a.map(x => x.id === id ? { ...x, categoryResults: next } : x))
    patch(id, { categoryResults: next })
  }

  async function status(id: string, s: 'PASSED' | 'FAILED') {
    setBusy(id)
    const res = await fetch(`/api/admin/examens/attempts/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: s, examDate: sitting.date, examiner: examiners }),
    })
    if (res.ok) router.refresh()
    setBusy(null)
  }

  async function addKandidaat() {
    if (!kies) return
    const k = kandidaten.find(x => x.memberId === kies)
    if (!k) return
    await fetch(`/api/admin/examens/sittings/${sitting.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'add', memberId: k.memberId, beltLevel: k.doel }) })
    router.refresh()
  }

  return (
    <div className="space-y-4 print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/exams" className="text-xs text-[#a90000] hover:underline">← Terug naar examens</Link>
          <h1 className="mt-1 text-xl font-bold text-[#2a2a2a]">Examenregistratie — {sitting.groepLabel}</h1>
          <p className="text-sm text-gray-500">{new Date(sitting.date + 'T12:00').toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {klaar}/{attempts.length} geregistreerd</p>
        </div>
        <Link href={`/admin/exams/print?sitting=${sitting.id}`} className="rounded-sm bg-[#2a2a2a] px-4 py-2 text-sm font-medium text-white hover:bg-black">🖨 Print lijst</Link>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-sm border border-gray-200 bg-white p-3 text-sm shadow-sm">
        <label className="text-xs font-medium text-gray-600">Examenleiding<br />
          <input value={examiners} onChange={e => setExaminers(e.target.value)} onBlur={() => fetch(`/api/admin/examens/sittings/${sitting.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ examiners }) })} className="mt-1 block w-52 rounded-sm border border-gray-300 px-2 py-1 text-sm focus:border-[#a90000] focus:outline-none" />
        </label>
        <div className="ml-auto flex items-end gap-2">
          <select value={kies} onChange={e => setKies(e.target.value)} className="rounded-sm border border-gray-300 px-2 py-1.5 text-sm">
            <option value="">+ Kandidaat toevoegen…</option>
            {kandidaten.map(k => <option key={k.memberId} value={k.memberId}>{k.naam} — {BELT_NL[k.doel] || k.doel}</option>)}
          </select>
          <button onClick={addKandidaat} disabled={!kies} className="rounded-sm border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-40">Toevoegen</button>
        </div>
      </div>

      {attempts.map(a => {
        const vakken = eisenVoorBelt(a.beltLevel) ?? []
        const goed = vakken.filter(v => a.categoryResults[v.id]).length
        const done = a.status !== 'SCHEDULED'
        return (
          <div key={a.id} className={`rounded-sm border bg-white p-4 shadow-sm ${a.status === 'COMPLETED_PASSED' ? 'border-green-300 bg-green-50/40' : a.status === 'COMPLETED_FAILED' ? 'border-red-300 bg-red-50/40' : 'border-gray-200'}`}>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="min-w-40 font-semibold text-[#2a2a2a]">{a.naam}</span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <Chip belt={a.huidigeBelt} /> →
                <select value={a.beltLevel} disabled={done} onChange={e => { setAttempts(x => x.map(y => y.id === a.id ? { ...y, beltLevel: e.target.value, categoryResults: {} } : y)); patch(a.id, { beltLevel: e.target.value }) }} className="rounded-sm border border-gray-300 px-1 py-0.5 text-xs disabled:opacity-60">
                  {BELT_SEQ.map(b => <option key={b} value={b}>{BELT_NL[b]}</option>)}
                </select>
              </span>
              {vakken.length > 0 && <span className="text-xs text-gray-500">{goed}/{vakken.length} vakken af</span>}
              {a.status === 'COMPLETED_PASSED' && <span className="rounded-sm bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">✓ Geslaagd{a.heeftDiploma ? ' · diploma klaar' : ''}</span>}
              {a.status === 'COMPLETED_FAILED' && <span className="rounded-sm bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">✗ Niet geslaagd</span>}
              {a.status === 'SCHEDULED' && <span className="rounded-sm bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">Gepland</span>}
              <span className="ml-auto flex items-center gap-2">
                {busy === a.id && <span className="text-xs text-gray-400">…</span>}
                {done && <button onClick={() => patch(a.id, { status: 'SCHEDULED' }, true)} className="text-xs text-gray-500 hover:underline">Heropenen</button>}
                {!done && <button onClick={() => patch(a.id, {}, false)} className="text-xs text-gray-500 hover:underline">Bewaar</button>}
                {!done && <button onClick={() => status(a.id, 'PASSED')} className="rounded-sm bg-green-700 px-3 py-1 text-xs font-medium text-white hover:bg-green-800">✓ Geslaagd</button>}
                {!done && <button onClick={() => status(a.id, 'FAILED')} className="rounded-sm bg-red-700 px-3 py-1 text-xs font-medium text-white hover:bg-red-800">✗ Gezakt</button>}
                <button onClick={() => { setAttempts(x => x.filter(y => y.id !== a.id)); fetch(`/api/admin/examens/attempts/${a.id}`, { method: 'DELETE' }) }} className="text-xs text-gray-400 hover:text-red-600">✕</button>
              </span>
            </div>
            {vakken.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3 lg:grid-cols-4">
                {vakken.map(v => (
                  <label key={v.id} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input type="checkbox" checked={!!a.categoryResults[v.id]} disabled={done} onChange={() => toggleVak(a.id, v.id, a.categoryResults)} className="h-4 w-4 accent-[#a90000]" />
                    <span className="text-[#2a2a2a]">{v.naam}</span>
                    <span className="text-xs text-gray-500">{v.aantal}×</span>
                  </label>
                ))}
              </div>
            )}
            <p className="mt-2 text-[11px] text-gray-400">Examendatum: {new Date(sitting.date + 'T12:00').toLocaleDateString('nl-NL')} · bij geslaagd: band automatisch bijgewerkt + verifieerbaar diploma</p>
          </div>
        )
      })}
    </div>
  )
}
