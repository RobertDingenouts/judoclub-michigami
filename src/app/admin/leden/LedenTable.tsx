'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { GROEPEN, GROEP_LABEL, PAYMENT_INFO, nlDatum, leeftijd } from '@/lib/admin2'
import { getBeltLabel, getNextBelt, isYouth } from '@/lib/belt-utils'
import { BELT_COLORS, BELT_ORDER } from '@/lib/student-progress-types'
import type { BeltLevel } from '@prisma/client'

type Row = {
  id: string; firstName: string; lastName: string; isActive: boolean
  groep: string | null; band: string | null; bondsnummer: string | null
  dateOfBirth: string | null; email: string | null; phone: string | null; phone2: string | null
  address: string | null; postalCode: string | null; city: string | null; location: string | null
  joinDate: string | null; remarks: string | null; medicalNotes: string | null
  emergencyContactName: string | null; emergencyContactPhone: string | null
  portretrecht: boolean | null
  bandHistory: { belt: string; at: string }[]
  payments: { label: string; status: string; amount: number; note: string | null }[]
  exams: { belt: string; status: string; date: string | null; score: number | null }[]
  competitions: { id: string; date: string; name: string; result: string | null }[]
  jpDiolmas: string[]
}

const BAND_VOLGORDE = [...BELT_ORDER]

export function LedenTable({ rows, periodLabels }: { rows: Row[]; periodLabels: string[] }) {
  const [q, setQ] = useState('')
  const [groep, setGroep] = useState('')
  const [status, setStatus] = useState('actief')
  const [open, setOpen] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const ql = q.toLowerCase()
    return rows.filter(r => {
      if (status === 'actief' && !r.isActive) return false
      if (status === 'gestopt' && r.isActive) return false
      if (groep && r.groep !== groep) return false
      if (ql && !(`${r.firstName} ${r.lastName} ${r.bondsnummer ?? ''}`.toLowerCase().includes(ql))) return false
      return true
    })
  }, [rows, q, groep, status])

  const groepCount = (g: string) => filtered.filter(r => r.groep === g).length

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={q} onChange={e => setQ(e.target.value)}
          placeholder="Zoek naam of bondsnummer…"
          className="min-w-[180px] flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#a90000] focus:outline-none"
        />
        <div className="flex flex-wrap gap-1.5">
          <Chip active={status === 'actief'} onClick={() => setStatus('actief')}>Actief</Chip>
          <Chip active={status === 'gestopt'} onClick={() => setStatus('gestopt')}>Gestopt</Chip>
          <Chip active={status === ''} onClick={() => setStatus('')}>Alle</Chip>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Chip active={groep === ''} onClick={() => setGroep('')}>Alle groepen ({filtered.length})</Chip>
        {GROEPEN.map(g => (
          <Chip key={g.value} active={groep === g.value} onClick={() => setGroep(g.value)}>
            {g.label} ({groepCount(g.value)})
          </Chip>
        ))}
      </div>

      {/* Lijst */}
      <div className="space-y-2">
        {filtered.map(r => (
          <LidRij key={r.id} r={r} open={open === r.id} onToggle={() => setOpen(open === r.id ? null : r.id)} periodLabels={periodLabels} />
        ))}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-400">Niets gevonden</div>
        )}
      </div>
    </>
  )
}

function LidRij({ r, open, onToggle, periodLabels }: { r: Row; open: boolean; onToggle: () => void; periodLabels: string[] }) {
  const age = leeftijd(r.dateOfBirth)
  const youth = isYouth(r.dateOfBirth ? new Date(r.dateOfBirth) : null)
  const next = r.band ? getNextBelt(r.band as BeltLevel, youth) : (youth ? 'WIT' : null)
  const laatsteBand = r.bandHistory.length ? r.bandHistory[r.bandHistory.length - 1] : null
  const openBet = r.payments.filter(p => ['OPEN', 'HERINNERING1', 'HERINNERING2'].includes(p.status))
  const laatstePer = periodLabels[periodLabels.length - 1]
  const perStatus = r.payments.find(p => p.label === laatstePer)

  return (
    <div className={`rounded-xl border bg-white transition-colors ${open ? 'border-[#a90000]/40' : 'border-gray-200'}`}>
      <button onClick={onToggle} className="flex w-full items-center gap-3 p-3 text-left sm:gap-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-300 text-xs font-bold"
          style={{ backgroundColor: BELT_COLORS[r.band as BeltLevel] ?? '#eee', color: r.band === 'WIT' || !r.band ? '#555' : '#fff' }}>
          {r.firstName[0]}{r.lastName[0]}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#2a2a2a]">
            {r.firstName} {r.lastName}
            {!r.isActive && <span className="ml-2 rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">gestopt</span>}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500">
            {r.groep && <span className="rounded bg-[#fdf6f6] px-1.5 py-0.5 font-medium text-[#a90000]">{GROEP_LABEL[r.groep as keyof typeof GROEP_LABEL] ?? r.groep}</span>}
            {age !== null && <span>{age} jr</span>}
            {r.band && <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full border border-gray-300" style={{ backgroundColor: BELT_COLORS[r.band as BeltLevel] }} />{getBeltLabel(r.band as BeltLevel)}</span>}
            {r.bondsnummer && <span>#nr {r.bondsnummer}</span>}
          </p>
        </div>
        <div className="hidden shrink-0 text-right text-xs sm:block">
          {next && <p className="text-gray-500">examen: <b className="text-[#a90000]">{getBeltLabel(next)}</b></p>}
          {laatsteBand && <p className="text-gray-400">band {laatsteBand.belt && getBeltLabel(laatsteBand.belt as BeltLevel)} {nlDatum(laatsteBand.at)}</p>}
        </div>
        <div className="shrink-0 text-right">
          {perStatus ? (
            <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${PAYMENT_INFO[perStatus.status]?.klas ?? ''}`}>
              {PAYMENT_INFO[perStatus.status]?.label ?? perStatus.status}
            </span>
          ) : <span className="text-[11px] text-gray-300">—</span>}
          {openBet.length > 0 && <p className="mt-0.5 text-[11px] font-medium text-red-600">€{openBet.reduce((s, p) => s + p.amount, 0)} open</p>}
        </div>
        <span className={`shrink-0 text-gray-300 transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {open && (
        <div className="grid gap-4 border-t border-gray-100 p-4 text-sm md:grid-cols-2 lg:grid-cols-3">
          {/* Contact */}
          <Section titel="📇 Contact & adres">
            <KV k="Adres" v={r.address ? `${r.address}, ${r.postalCode ?? ''} ${r.city ?? ''}` : null} />
            <KV k="Telefoon" v={[r.phone, r.phone2].filter(Boolean).join(' / ') || null} />
            <KV k="E-mail" v={r.email} />
            <KV k="Noodcontact" v={r.emergencyContactName ? `${r.emergencyContactName}${r.emergencyContactPhone ? ' · ' + r.emergencyContactPhone : ''}` : null} />
            <KV k="Lid sinds" v={r.joinDate ? nlDatum(r.joinDate) : null} />
            <KV k="Geboortedatum" v={r.dateOfBirth ? `${nlDatum(r.dateOfBirth)} (${age} jr)` : null} />
            <KV k="Portretrecht" v={r.portretrecht === null ? null : r.portretrecht ? 'ja' : 'nee'} />
            {r.medicalNotes && <KV k="Medisch" v={r.medicalNotes} />}
            {r.remarks && <KV k="Notities" v={r.remarks} />}
          </Section>

          {/* Budopaspoort */}
          <Section titel="🥋 Budopaspoort">
            {r.bandHistory.length === 0 ? <p className="text-xs text-gray-400">Geen bandgeschiedenis</p> : (
              <div className="space-y-1">
                {r.bandHistory.map(b => (
                  <div key={b.belt} className="flex items-center gap-2 text-xs">
                    <span className="h-3 w-3 rounded-full border border-gray-300" style={{ backgroundColor: BELT_COLORS[b.belt as BeltLevel] ?? '#ccc' }} />
                    <span className="w-24">{getBeltLabel(b.belt as BeltLevel)}</span>
                    <span className="text-gray-500">{nlDatum(b.at)}</span>
                  </div>
                ))}
              </div>
            )}
            {next && <p className="mt-2 text-xs">Volgende examen: <b className="text-[#a90000]">{getBeltLabel(next)}</b></p>}
            {r.exams.length > 0 && (
              <div className="mt-2 space-y-1 border-t border-gray-100 pt-2">
                {r.exams.map((e, i) => (
                  <p key={i} className="text-xs text-gray-600">
                    {e.date ? nlDatum(e.date) : '—'} · {getBeltLabel(e.belt as BeltLevel)} · {e.status === 'COMPLETED_PASSED' ? 'geslaagd' : e.status === 'SCHEDULED' ? 'gepland' : e.status === 'COMPLETED_FAILED' ? 'niet geslaagd' : e.status}
                    {e.score != null && ` · ${e.score}/100`}
                  </p>
                ))}
              </div>
            )}
            {r.jpDiolmas.length > 0 && <p className="mt-2 text-xs text-gray-500">Cursus Japans diploma t/m {getBeltLabel(r.jpDiolmas.sort((a, b) => BAND_VOLGORDE.indexOf(a as BeltLevel) - BAND_VOLGORDE.indexOf(b as BeltLevel)).at(-1)! as BeltLevel)}</p>}
          </Section>

          {/* Contributie + wedstrijden */}
          <Section titel="💰 Contributie & 🏅 wedstrijden">
            <div className="space-y-1">
              {r.payments.length === 0 && <p className="text-xs text-gray-400">Geen contributierecords</p>}
              {[...r.payments].sort((a, b) => a.label.localeCompare(b.label)).map(p => (
                <div key={p.label} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">{p.label}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-gray-500">€{p.amount.toFixed(2)}</span>
                    <span className={`rounded-full px-2 py-0.5 font-medium ${PAYMENT_INFO[p.status]?.klas ?? ''}`}>{PAYMENT_INFO[p.status]?.label ?? p.status}</span>
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 border-t border-gray-100 pt-2">
              {r.competitions.length === 0 ? <p className="text-xs text-gray-400">Geen wedstrijden geregistreerd</p> : r.competitions.map(c => (
                <p key={c.id} className="text-xs text-gray-600">{nlDatum(c.date)} · {c.name}{c.result ? ` · ${c.result}` : ''}</p>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Link href={`/admin/students/${r.id}`} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium hover:border-[#a90000] hover:text-[#a90000]">Bewerken</Link>
              <Link href={`/admin/contributie?lid=${r.id}`} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium hover:border-[#a90000] hover:text-[#a90000]">Factuur</Link>
            </div>
          </Section>
        </div>
      )}
    </div>
  )
}

function Section({ titel, children }: { titel: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">{titel}</h3>
      {children}
    </div>
  )
}

function KV({ k, v }: { k: string; v: string | null }) {
  if (!v) return null
  return <p className="text-xs text-gray-600"><span className="text-gray-400">{k}: </span>{v}</p>
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active ? 'border-[#a90000] bg-[#a90000] text-white' : 'border-gray-300 bg-white text-gray-600 hover:border-[#a90000]/50'
      }`}>
      {children}
    </button>
  )
}
