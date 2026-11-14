'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { eisenVoorBelt, BELT_REQ_ID } from '@/lib/examen-eisen'
import { getTechniquesForBelt } from '@/data/exam-requirements'
import { BeltBadge } from '@/components/admin/BeltBadge'
import { getBeltColor } from '@/lib/belt-utils'
import type { BeltLevel } from '@prisma/client'

export interface PrepRij {
  memberId: string
  firstName: string
  lastName: string
  currentBelt: string | null
  doel: string
  sinds: string // ISO — datum sinds huidige band/slip
  sindsBron: string // voor de tooltip
  checked: Record<string, true>
  planned: { attemptId: string; sittingId: string | null; datum: string } | null
}
export interface PrepGroep {
  groep: string
  label: string
  subtext: string
  rijen: PrepRij[]
}

// ---------------------------------------------------------------------------
// Band-klok: groen (<0,5 jr) → oranje (0,5–1 jr) → rood (>1 jr), met exact jaartal
// ---------------------------------------------------------------------------
function BandKlok({ sinds, bron }: { sinds: string; bron: string }) {
  const jaren = (Date.now() - new Date(sinds).getTime()) / (365.25 * 24 * 3600 * 1000)
  const kleur = jaren < 0.5 ? '#15803d' : jaren < 1 ? '#ea580c' : '#dc2626'
  const frac = Math.max(0, Math.min(1, jaren))
  const r = 6.5, cx = 8, cy = 8
  const hoek = frac * 2 * Math.PI
  const x = cx + r * Math.sin(hoek)
  const y = cy - r * Math.cos(hoek)
  const nx = cx + (r - 1.5) * Math.sin(hoek)
  const ny = cy - (r - 1.5) * Math.cos(hoek)
  const groteBoog = hoek > Math.PI ? 1 : 0
  return (
    <span className="inline-flex items-center gap-0.5" title={`${jaren.toFixed(1).replace('.', ',')} jaar in deze band/slip (${bron})`}>
      <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0" aria-hidden>
        <circle cx={cx} cy={cy} r={r} fill="white" />
        {frac > 0.003 && (frac >= 0.999
          ? <circle cx={cx} cy={cy} r={r} fill={kleur} opacity={0.28} />
          : <path d={`M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 ${groteBoog} 1 ${x.toFixed(2)} ${y.toFixed(2)} Z`} fill={kleur} opacity={0.28} />)}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={kleur} strokeWidth="1.4" />
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={kleur} strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <span className="text-[10px] font-bold tabular-nums" style={{ color: kleur }}>{jaren.toFixed(1).replace('.', ',')}</span>
    </span>
  )
}

// Vakken +technieklijst voor een doelband (technieklijst = officieel examen-eisen, eerste N per vak)
function gebruikteVakken(doel: string) {
  const vakken = eisenVoorBelt(doel) ?? []
  const techs = getTechniquesForBelt(BELT_REQ_ID[doel] ?? '')
  return vakken.map(v => ({ ...v, technieken: techs[v.id] ?? [] }))
}

function VoorbereidingsRij({ rij }: { rij: PrepRij }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [checked, setChecked] = useState<Record<string, true>>(rij.checked)
  const [planned, setPlanned] = useState(rij.planned)
  const [klaarOpen, setKlaarOpen] = useState(false)
  const [klaarDatum, setKlaarDatum] = useState('')
  const [busy, setBusy] = useState(false)
  const [sinds, setSinds] = useState(rij.sinds.slice(0, 10))

  const vakken = useMemo(() => gebruikteVakken(rij.doel), [rij.doel])
  const alles = useMemo(() => vakken.flatMap(v => v.technieken.map(t => `${v.id}|${t.nameJa}`)), [vakken])
  const gedaan = alles.filter(k => checked[k]).length
  const pct = alles.length ? Math.round((gedaan / alles.length) * 100) : 0

  function toggle(key: string) {
    const next = { ...checked }
    const nowChecked = !next[key]
    if (nowChecked) next[key] = true
    else delete next[key]
    setChecked(next)
    fetch('/api/admin/examens/prep', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId: rij.memberId, targetBelt: rij.doel, key, checked: nowChecked }),
    }).then(r => { if (!r.ok) { alert('Opslaan mislukt'); setChecked(checked) } })
  }

  async function klaarZetten() {
    if (!klaarDatum) return
    setBusy(true)
    const res = await fetch('/api/admin/examens/klaar', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId: rij.memberId, date: klaarDatum, beltLevel: rij.doel }),
    })
    setBusy(false)
    if (!res.ok) { alert((await res.json()).error || 'Mislukt'); return }
    const j = await res.json()
    setPlanned({ attemptId: j.attemptId, sittingId: j.sittingId, datum: klaarDatum })
    setKlaarOpen(false)
    router.refresh()
  }

  async function planningWeg() {
    if (!planned) return
    if (!confirm('Planning verwijderen? Het lid is dan weer niet ingepland voor examen.')) return
    setBusy(true)
    await fetch('/api/admin/examens/klaar', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attemptId: planned.attemptId }),
    })
    setBusy(false)
    setPlanned(null)
    router.refresh()
  }

  async function beltSindsOpslaan(d: string) {
    setSinds(d)
    await fetch('/api/admin/examens/prep', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId: rij.memberId, beltSince: d || null }),
    })
    router.refresh()
  }

  const doelLabel = { WIT: 'wit', WIT_GEEL: 'wit/geel', GEEL: 'geel', GEEL_ORANJE: 'geel/oranje', ORANJE: 'oranje', ORANJE_GROEN: 'oranje/groen', GROEN: 'groen', GROEN_BLAUW: 'groen/blauw', BLAUW: 'blauw', BLAUW_BRUIN: 'blauw/bruin', BRUIN: 'bruin' }[rij.doel] || rij.doel

  return (
    <div className="mb-0.5 overflow-hidden rounded-sm border-l-4 bg-gray-50/60 transition-colors hover:bg-gray-100" style={{ borderLeftColor: getBeltColor(rij.doel as BeltLevel) }}>
      <div className="grid grid-cols-[1.45rem_minmax(0,1fr)_auto] items-center gap-x-1.5 py-1.5 pl-1 pr-2 text-sm">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex h-6 w-6 items-center justify-center rounded-sm border border-gray-300 bg-white text-[10px] text-gray-600 hover:bg-gray-100"
          title={open ? 'Dichtklappen' : 'Technieken uitklappen'}
        >
          {open ? '▾' : '▸'}
        </button>
        <span className="truncate font-medium text-[#2a2a2a]">{rij.firstName} {rij.lastName}</span>
        <span className="flex items-center gap-x-1.5 text-[11px]">
          <span className="flex items-center gap-1">
            <BeltBadge belt={rij.currentBelt} height="h-3.5" width="w-[1.6rem]" />
            <BandKlok sinds={rij.sinds} bron={rij.sindsBron} />
          </span>
          <span className="text-gray-400">→</span>
          <BeltBadge belt={rij.doel} height="h-3.5" width="w-[1.6rem]" />
          <span className="hidden font-semibold text-[#2a2a2a] sm:inline">{doelLabel}</span>
          {alles.length > 0 && (
            <span className={`ml-1 hidden items-center gap-1 md:flex`}>
              <span className="h-1.5 w-14 overflow-hidden rounded-full bg-gray-200"><span className="block h-full rounded-full bg-green-600" style={{ width: `${pct}%` }} /></span>
              <span className="text-[10px] tabular-nums text-gray-500">{gedaan}/{alles.length}</span>
            </span>
          )}
          {planned ? (
            <span className="flex items-center gap-1 rounded-sm bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-800">
              📅 examen {planned.datum.split('-').reverse().join('-')}
              {planned.sittingId && <Link href={`/admin/exams/bijeenkomst/${planned.sittingId}`} className="underline hover:text-green-950">↗</Link>}
            </span>
          ) : (
            <button onClick={() => setKlaarOpen(o => !o)} className="rounded-sm border border-green-700 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-green-800 hover:bg-green-50">
              ✓ Klaar?
            </button>
          )}
        </span>
      </div>

      {klaarOpen && !planned && (
        <div className="flex flex-wrap items-center gap-2 border-t border-green-200 bg-green-50/70 px-3 py-2 text-xs">
          <span className="font-medium text-green-900">Examendatum {doelLabel} voor {rij.firstName}:</span>
          <input type="date" value={klaarDatum} onChange={e => setKlaarDatum(e.target.value)} className="rounded-sm border border-green-300 px-2 py-1 focus:outline-none" />
          <button onClick={klaarZetten} disabled={!klaarDatum || busy} className="rounded-sm bg-green-700 px-3 py-1 font-medium text-white hover:bg-green-800 disabled:opacity-40">
            {busy ? 'Opslaan…' : '✓ Inplannen'}
          </button>
          <button onClick={() => setKlaarOpen(false)} className="text-gray-500 hover:underline">Annuleren</button>
        </div>
      )}

      {open && (
        <div className="border-t border-gray-200 bg-white px-3 py-3">
          <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <span className="font-semibold text-[#2a2a2a]">Vakken &amp; technieken — {gedaan}/{alles.length} af ({pct}%)</span>
            <span className="h-1.5 w-32 overflow-hidden rounded-full bg-gray-200"><span className="block h-full rounded-full bg-green-600" style={{ width: `${pct}%` }} /></span>
            <label className="ml-auto flex items-center gap-1.5 text-gray-500">
              Band/slip sinds
              <input
                type="date" value={sinds}
                onChange={e => beltSindsOpslaan(e.target.value)}
                className="rounded-sm border border-gray-300 px-1.5 py-0.5 text-[11px] focus:border-[#a90000] focus:outline-none"
                title={`Bron: ${rij.sindsBron}. Pas aan als de datum niet klopt — de klok herberekent meteen.`}
              />
            </label>
          </div>
          <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {vakken.map(v => {
              const af = v.technieken.filter(t => checked[`${v.id}|${t.nameJa}`]).length
              if (v.technieken.length === 0) {
                return (
                  <div key={v.id} className="rounded-sm bg-amber-50/70 px-2 py-1.5 text-xs text-amber-900">
                    <span className="font-semibold">{v.naam}</span> · {v.aantal}× — wordt op de examendag zelf getest, niet afvinkbaar
                  </div>
                )
              }
              return (
                <div key={v.id}>
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-gray-500">
                    {v.naam} <span className={`font-normal normal-case ${af === v.technieken.length ? 'text-green-700' : 'text-gray-400'}`}>{af}/{v.technieken.length}</span>
                  </p>
                  <div className="space-y-0.5">
                    {v.technieken.map(t => {
                      const key = `${v.id}|${t.nameJa}`
                      return (
                        <label key={key} className={`flex cursor-pointer items-center gap-2 rounded-sm px-1.5 py-0.5 text-[13px] transition-colors ${checked[key] ? 'bg-green-50' : 'hover:bg-gray-50'}`}>
                          <input type="checkbox" checked={!!checked[key]} onChange={() => toggle(key)} className="h-3.5 w-3.5 accent-[#a90000]" />
                          <span className={checked[key] ? 'text-gray-400 line-through' : 'text-[#2a2a2a]'}>{t.nameJa}</span>
                          <span className="ml-auto text-[10px] text-gray-400">{t.nameNl}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
          {planned && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-2 text-xs">
              <span className="rounded-sm bg-green-100 px-2 py-1 font-semibold text-green-800">📅 Ingepland examen {doelLabel} op {planned.datum.split('-').reverse().join('-')}</span>
              {planned.sittingId && <Link href={`/admin/exams/bijeenkomst/${planned.sittingId}`} className="rounded-sm border border-gray-300 px-2 py-1 hover:bg-gray-50">Naar registratie →</Link>}
              <button onClick={planningWeg} disabled={busy} className="ml-auto text-red-600 hover:underline disabled:opacity-50">Planning verwijderen</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function VoorbereidingsOverzicht({ groepen }: { groepen: PrepGroep[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {groepen.map(g => (
        <div key={g.groep} className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between bg-[#a90000] px-4 py-2.5 text-white">
            <div>
              <span className="text-sm font-semibold">{g.label}</span>
              <p className="text-[11px] text-red-100">{g.subtext}</p>
            </div>
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs">{g.rijen.length} leden</span>
          </div>
          <div className="max-h-[32rem] overflow-y-auto p-2">
            {g.rijen.length === 0 && <p className="p-2 text-xs text-gray-400">Geen leden in deze groep.</p>}
            {g.rijen.map(r => <VoorbereidingsRij key={r.memberId} rij={r} />)}
          </div>
          <div className="border-t border-gray-100 px-4 py-2">
            <Link href={`/print/examen?groep=${g.groep}`} className="text-xs text-[#a90000] hover:underline">Print doelenlijst →</Link>
          </div>
        </div>
      ))}
    </div>
  )
}
