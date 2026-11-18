'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { eisenVoorBelt, BELT_SEQ, BELT_NL } from '@/lib/examen-eisen'
import { getBeltColor } from '@/lib/belt-utils'
import { BeltBadge } from '@/components/admin/BeltBadge'
import type { BeltLevel } from '@prisma/client'

interface Attempt {
  id: string; memberId: string; naam: string; huidigeBelt: string | null; beltLevel: string
  status: string; examDate: string | null; categoryResults: Record<string, boolean>; heeftDiploma: boolean; klaar: boolean
}
interface Props {
  sitting: { id: string; date: string; groep: string; groepLabel: string; title: string | null; examiners: string | null; type: string; proefTitel?: string | null }
  attempts: Attempt[]
  kandidaten: { memberId: string; naam: string; doel: string }[]
}

export default function Registratie({ sitting, attempts: init, kandidaten }: Props) {
  const router = useRouter()
  const [attempts, setAttempts] = useState(init)
  const [kies, setKies] = useState('')
  const [examiners, setExaminers] = useState(sitting.examiners || 'Pascal, Robert')
  const [busy, setBusy] = useState<string | null>(null)
  const [kopiëren, setKopiëren] = useState(false)

  const proef = sitting.type === 'PROEF'
  const afgerond = attempts.filter(a => a.status !== 'SCHEDULED').length
  const klaarVoorExamen = attempts.filter(a => a.klaar).length

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

  function toggleKlaar(id: string, current: boolean) {
    setAttempts(a => a.map(x => x.id === id ? { ...x, klaar: !current } : x))
    patch(id, { klaar: !current })
  }

  async function status(id: string, s: 'PASSED' | 'FAILED') {
    setBusy(id)
    const res = await fetch(`/api/admin/examens/attempts/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: s, examDate: sitting.date, examiner: examiners }),
    })
    if (res.ok) router.refresh()
    else alert((await res.json()).error || 'Mislukt')
    setBusy(null)
  }

  async function addKandidaat() {
    if (!kies) return
    const k = kandidaten.find(x => x.memberId === kies)
    if (!k) return
    await fetch(`/api/admin/examens/sittings/${sitting.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'add', memberId: k.memberId, beltLevel: k.doel }) })
    router.refresh()
  }

  async function neemProefOver() {
    setKopiëren(true)
    const res = await fetch(`/api/admin/examens/sittings/${sitting.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'copyProef' }) })
    setKopiëren(false)
    if (res.ok) router.refresh()
    else alert((await res.json()).error || 'Overnemen mislukt')
  }

  return (
    <div className="space-y-4 print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/exams" className="text-xs text-[#a90000] hover:underline">← Terug naar examens</Link>
          <h1 className="mt-1 text-xl font-bold text-[#2a2a2a]">
            {proef ? 'Proefexamen' : 'Examenregistratie'} — {sitting.groepLabel}
            {proef && <span className="ml-2 rounded-sm bg-amber-100 px-2 py-0.5 align-middle text-xs font-medium text-amber-800">oefenfase · nog geen cijfer</span>}
          </h1>
          <p className="text-sm text-gray-500">
            {new Date(sitting.date + 'T12:00').toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} ·{' '}
            {proef ? `${klaarVoorExamen}/${attempts.length} klaar voor examen` : `${afgerond}/${attempts.length} geregistreerd`}
          </p>
          {proef && <p className="text-xs text-gray-400">Vink per week de vakken af die goed waren — alles blijft bewaard. Wordt er een examen-zitting aangemaakt, dan starten die vakken al afgevinkt.</p>}
        </div>
        <Link href={`/print/examen?sitting=${sitting.id}`} className="rounded-sm bg-[#2a2a2a] px-4 py-2 text-sm font-medium text-white hover:bg-black">🖨 Print lijst</Link>
        <Link href={`/print/diplomas?sitting=${sitting.id}`} className="rounded-sm bg-[#a90000] px-4 py-2 text-sm font-medium text-white hover:bg-[#8c0000]">🎓 Diploma's</Link>
      </div>

      {!proef && sitting.proefTitel && (
        <div className="flex flex-wrap items-center gap-3 rounded-sm border border-amber-200 bg-amber-50 p-3 text-sm">
          <span className="text-amber-800">Proefexamen gevonden (<span className="font-medium">{sitting.proefTitel}</span>): de lijst start met <span className="font-medium">alleen de kandidaten die daar op "klaar" stonden</span>, met lege vakjes — je checkt op de examendatum alles opnieuw. Iemand erbij? Handmatig toevoegen rechtsboven.</span>
          <button onClick={neemProefOver} disabled={kopiëren} className="ml-auto rounded-sm border border-amber-400 bg-white px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-50">
            {kopiëren ? 'Overnemen…' : '↺ Klaar-markeringen uit proef overnemen'}
          </button>
        </div>
      )}

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
          <div key={a.id} className={`rounded-sm border border-gray-200 p-4 shadow-sm ${a.status === 'COMPLETED_PASSED' ? 'bg-green-50/40' : a.status === 'COMPLETED_FAILED' ? 'bg-red-50/40' : proef && a.klaar ? 'bg-green-50/60' : 'bg-white'}`} style={{ borderLeft: `5px solid ${getBeltColor(a.beltLevel as BeltLevel)}` }}>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="min-w-40 font-semibold text-[#2a2a2a]">{a.naam}</span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <BeltBadge belt={a.huidigeBelt} height="h-3.5" width="w-[1.6rem]" /> →
                <select value={a.beltLevel} disabled={done} onChange={e => { setAttempts(x => x.map(y => y.id === a.id ? { ...y, beltLevel: e.target.value, categoryResults: {} } : y)); patch(a.id, { beltLevel: e.target.value }) }} className="rounded-sm border border-gray-300 px-1 py-0.5 text-xs disabled:opacity-60">
                  {BELT_SEQ.map(b => <option key={b} value={b}>{BELT_NL[b]}</option>)}
                </select>
              </span>
              {vakken.length > 0 && <span className={`text-xs ${goed === vakken.length && vakken.length > 0 ? 'font-medium text-green-700' : 'text-gray-500'}`}>{goed}/{vakken.length} vakken af</span>}
              {proef && a.klaar && <span className="rounded-sm bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">✓ Klaar voor examen</span>}
              {!proef && a.klaar && a.status === 'SCHEDULED' && <span className="rounded-sm bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800" title="Stond op het proefexamen op klaar">✓ klaar volgens proef</span>}
              {a.status === 'COMPLETED_PASSED' && <span className="rounded-sm bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">✓ Geslaagd{a.heeftDiploma ? ' · diploma klaar' : ''}</span>}
              {a.status === 'COMPLETED_FAILED' && <span className="rounded-sm bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">✗ Niet geslaagd</span>}
              {a.status === 'SCHEDULED' && !proef && <span className="rounded-sm bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">Gepland</span>}
              <span className="ml-auto flex items-center gap-2">
                {busy === a.id && <span className="text-xs text-gray-400">…</span>}
                {!proef && ['WIT', 'GEEL', 'ORANJE', 'GROEN', 'BLAUW', 'BRUIN_1', 'BRUIN_2', 'BRUIN_3'].includes(a.beltLevel) && (
                  <Link href={`/print/diploma/${a.id}`} target="_blank" className="rounded-sm border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50">🖨 Diploma</Link>
                )}
                {done && <button onClick={() => patch(a.id, { status: 'SCHEDULED' }, true)} className="text-xs text-gray-500 hover:underline">Heropenen</button>}
                {!done && !proef && <button onClick={() => patch(a.id, {}, false)} className="text-xs text-gray-500 hover:underline">Bewaar</button>}
                {proef && (
                  a.klaar
                    ? <button onClick={() => toggleKlaar(a.id, true)} className="rounded-sm border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50">Nog niet klaar</button>
                    : <button onClick={() => toggleKlaar(a.id, false)} className="rounded-sm bg-green-700 px-3 py-1 text-xs font-medium text-white hover:bg-green-800">✓ Klaar voor examen</button>
                )}
                {!done && !proef && <button onClick={() => status(a.id, 'PASSED')} className="rounded-sm bg-green-700 px-3 py-1 text-xs font-medium text-white hover:bg-green-800">✓ Geslaagd</button>}
                {!done && !proef && <button onClick={() => status(a.id, 'FAILED')} className="rounded-sm bg-red-700 px-3 py-1 text-xs font-medium text-white hover:bg-red-800">✗ Gezakt</button>}
                <button onClick={() => { if (!confirm('Kandidaat van deze bijeenkomst verwijderen?')) return; setAttempts(x => x.filter(y => y.id !== a.id)); fetch(`/api/admin/examens/attempts/${a.id}`, { method: 'DELETE' }).then(r => { if (!r.ok) alert('Verwijderen mislukt') }) }} className="rounded-sm border border-red-200 px-2 py-0.5 text-xs font-medium text-red-600 hover:bg-red-50">✕ Verwijderen</button>
              </span>
            </div>
            {vakken.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3 lg:grid-cols-4">
                {vakken.map(v => (
                  <label key={v.id} className={`flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1 text-sm transition-colors ${a.categoryResults[v.id] ? 'bg-green-50' : 'hover:bg-gray-50'}`}>
                    <input type="checkbox" checked={!!a.categoryResults[v.id]} disabled={done} onChange={() => toggleVak(a.id, v.id, a.categoryResults)} className="h-4 w-4 accent-[#a90000]" />
                    <span className="text-[#2a2a2a]">{v.naam}</span>
                    <span className="ml-auto rounded-full bg-gray-100 px-1.5 text-[11px] font-medium text-gray-600">{v.aantal}×</span>
                  </label>
                ))}
              </div>
            )}
            <p className="mt-2 text-[11px] text-gray-400">
              {proef
                ? 'Proefexamen: hier wordt níét geslaagd of gezakt — zet kandidaten die er klaar voor zijn op "Klaar voor examen" en maak daarna een examen-zitting aan.'
                : `Examendatum: ${new Date(sitting.date + 'T12:00').toLocaleDateString('nl-NL')} · bij geslaagd: band automatisch bijgewerkt + verifieerbaar diploma`}
            </p>
          </div>
        )
      })}
    </div>
  )
}
