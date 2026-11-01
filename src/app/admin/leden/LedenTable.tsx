'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { GROEPEN, GROEP_LABEL, PAYMENT_INFO, nlDatum, leeftijd } from '@/lib/admin2'
import { getBeltLabel, getNextBelt, isYouth } from '@/lib/belt-utils'
import { BELT_COLORS, BELT_ORDER } from '@/lib/student-progress-types'
import { BeltVak } from '@/components/admin/BeltVak'
import type { BeltLevel } from '@prisma/client'

type Row = {
  id: string; firstName: string; lastName: string; isActive: boolean
  clubStatus: string
  role: string
  isTrainer: boolean
  leaveDate: string | null
  groep: string | null; band: string | null; bondsnummer: string | null
  dateOfBirth: string | null; email: string | null; phone: string | null; phone2: string | null
  address: string | null; postalCode: string | null; city: string | null; location: string | null
  joinDate: string | null; remarks: string | null; medicalNotes: string | null
  emergencyContactName: string | null; emergencyContactPhone: string | null
  portretrecht: boolean | null
  bandHistory: { belt: string; at: string }[]
  payments: { label: string; status: string; amount: number; note: string | null; start: string; due: string | null }[]
  exams: { belt: string; status: string; date: string | null; score: number | null }[]
  competitions: { id: string; date: string; name: string; result: string | null }[]
  jpDiolmas: string[]
}

const BAND_VOLGORDE = [...BELT_ORDER]

const CLUB_STATUS_INFO: Record<string, { label: string; klas: string }> = {
  LID: { label: 'Lid', klas: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  PROEF: { label: 'Proefles', klas: 'bg-sky-50 text-sky-700 border-sky-300' },
  RESERVE: { label: 'Reserve', klas: 'bg-amber-50 text-amber-700 border-amber-300' },
  STOPPEND: { label: 'Stoppend', klas: 'bg-orange-50 text-orange-700 border-orange-300' },
  VRIJGESTELD: { label: 'Vrijgesteld', klas: 'bg-violet-50 text-violet-700 border-violet-300' },
  GESTOPT: { label: 'Gestopt', klas: 'bg-gray-100 text-gray-500 border-gray-300' },
}

type SortKey = 'groep' | 'naam' | 'leeftijd' | 'grootste' | 'band' | 'lidSinds' | 'contributie'
// Standaard = band (kleur van licht naar donker); daarna leeftijd, groep, lid sinds.
const SORTOPTIES: { key: SortKey; label: string }[] = [
  { key: 'band', label: 'Band (kleur, licht→donker)' },
  { key: 'leeftijd', label: 'Leeftijd jong→oud' },
  { key: 'groep', label: 'Groep' },
  { key: 'lidSinds', label: 'Lid sinds (nieuwst eerst)' },
  { key: 'naam', label: 'Achternaam A→Z' },
  { key: 'grootste', label: 'Leeftijd oud→jong' },
  { key: 'contributie', label: 'Contributie (open eerst)' },
]

export function LedenTable({ rows, periodLabels }: { rows: Row[]; periodLabels: string[] }) {
  const [q, setQ] = useState('')
  const [groep, setGroep] = useState('')
  const [status, setStatus] = useState('actief')
  // Rol-filter: ouders/trainers los van clubstatus filterbaar (okt 2026)
  const [rol, setRol] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('band')
  const [open, setOpen] = useState<string | null>(null)
  // mobiel: alle filterknoppen opgeklapt in één menu, niet een muur van chips
  const [filtersOpen, setFiltersOpen] = useState(false)

  // "Actief" = iedereen die nog meedoet. RESERVE, VRIJGESTELD en PROEFLES
  // horen hier bij: gasten met proeflessen moeten direct zichtbaar zijn in
  // de ledenlijst (eigen badge), het Proefles-chip filtert naar alleen hen.
  const isActief = (s: string) => s !== 'GESTOPT'
      const filtered = useMemo(() => {
        const ql = q.toLowerCase()
        const out = rows.filter(r => {
          // Inactief (prullenbak) is een eigen status: die valt buiten alle andere filters.
          if (status === 'archief') { if (r.isActive) return false }
          else if (!r.isActive) return false
          if (status === 'actief' && !isActief(r.clubStatus)) return false
      if (status === 'gestopt' && r.clubStatus !== 'GESTOPT') return false
      if (status === 'reserve' && r.clubStatus !== 'RESERVE') return false
      if (status === 'proef' && r.clubStatus !== 'PROEF') return false
      if (status === 'vrijgesteld' && r.clubStatus !== 'VRIJGESTELD') return false
      if (groep && r.groep !== groep) return false
      if (rol === 'trainer' && !(r.isTrainer || r.role === 'INSTRUCTOR')) return false
      if (rol === 'ouder' && r.role !== 'PARENT') return false
      if (rol === 'admin' && r.role !== 'ADMIN') return false
      if (rol === 'lid' && !['MEMBER'].includes(r.role)) return false
      if (ql && !(`${r.firstName} ${r.lastName}`.toLowerCase().includes(ql))) return false
      return true
    })
    // "Open" = de periode is al (deels) ingegaan en er is nog niet betaald.
    // Toekomstige periodes (Q1 2027 start pas 1-1-2027) zijn nog geen schuld
    // en tellen niet mee — Q4 wél, want die loopt nu.
    const nu = new Date().toISOString()
    const openBedrag = (r: Row) => r.payments.filter(p => ['OPEN', 'HERINNERING1', 'HERINNERING2'].includes(p.status) && (p.due ?? p.start) <= nu).reduce((s, p) => s + p.amount, 0)
    out.sort((a, b) => {
      switch (sortKey) {
        case 'naam': return (`${a.lastName} ${a.firstName}`).localeCompare(`${b.lastName} ${b.firstName}`)
        case 'leeftijd': return (b.dateOfBirth ?? '0000').localeCompare(a.dateOfBirth ?? '0000')
        case 'grootste': return (a.dateOfBirth ?? '9999').localeCompare(b.dateOfBirth ?? '9999')
        case 'band': return BAND_VOLGORDE.indexOf(a.band as BeltLevel) - BAND_VOLGORDE.indexOf(b.band as BeltLevel)
        case 'lidSinds': return (b.joinDate ?? '').localeCompare(a.joinDate ?? '')
        case 'contributie': return openBedrag(b) - openBedrag(a)
        default: return (a.groep ?? 'zzz').localeCompare(b.groep ?? 'zzz') || a.lastName.localeCompare(b.lastName)
      }
    })
    return out
  }, [rows, q, groep, status, rol, sortKey])

  const statusCount = (s: string) => rows.filter(r =>
    s === 'archief' ? !r.isActive :
    !r.isActive ? false :
    s === 'actief' ? isActief(r.clubStatus) :
    s === 'gestopt' ? r.clubStatus === 'GESTOPT' :
    s === 'reserve' ? r.clubStatus === 'RESERVE' :
    s === 'vrijgesteld' ? r.clubStatus === 'VRIJGESTELD' :
    s === 'proef' ? r.clubStatus === 'PROEF' : true).length

  const groepCount = (g: string) => filtered.filter(r => r.groep === g).length

  return (
    <>
      {/* Filters: op mobiel achter één uitklapknop, op desktop altijd zichtbaar */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={q} onChange={e => setQ(e.target.value)}
          placeholder="Zoek naam…"
          className="min-w-[180px] flex-1 rounded-sm border border-gray-300 px-3 py-2 text-sm focus:border-[#a90000] focus:outline-none"
        />
        <button onClick={() => setFiltersOpen(o => !o)}
          className="rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 sm:hidden"
          aria-expanded={filtersOpen}>
          ⚙️ Filters {filtersOpen ? '▲' : '▼'}
        </button>
        <a href="/api/admin2/export?lijst=leden"
          className={`rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:border-[#a90000] hover:text-[#a90000] ${filtersOpen ? '' : 'hidden'} sm:inline-block`}
          title="Volledige ledenlijst als Excel-bestand">⬇ Excel</a>
        <select
          value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)}
          className={`rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 focus:border-[#a90000] focus:outline-none ${filtersOpen ? '' : 'hidden'} sm:block`}
          aria-label="Sorteren"
        >
          {SORTOPTIES.map(o => <option key={o.key} value={o.key}>↕ {o.label}</option>)}
        </select>
        <div className={`flex w-full flex-wrap gap-1.5 ${filtersOpen ? '' : 'hidden'} sm:flex`}>
          <Chip active={status === 'actief'} onClick={() => setStatus('actief')}>Actief ({statusCount('actief')})</Chip>
          <Chip active={status === 'proef'} onClick={() => setStatus('proef')}>Proefles ({statusCount('proef')})</Chip>
          <Chip active={status === 'reserve'} onClick={() => setStatus('reserve')}>Reserve ({statusCount('reserve')})</Chip>
          <Chip active={status === 'vrijgesteld'} onClick={() => setStatus('vrijgesteld')}>Vrijgesteld ({statusCount('vrijgesteld')})</Chip>
          <Chip active={status === 'gestopt'} onClick={() => setStatus('gestopt')}>Gestopt ({statusCount('gestopt')})</Chip>
          <Chip active={status === 'archief'} onClick={() => setStatus('archief')}>🗑 Archief ({statusCount('archief')})</Chip>
          <Chip active={status === ''} onClick={() => setStatus('')}>Alle</Chip>
        </div>
      </div>
      <div className={`flex flex-wrap gap-1.5 ${filtersOpen ? '' : 'hidden'} sm:flex`}>
        <Chip active={rol === ''} onClick={() => setRol('')}>Alle rollen</Chip>
        <Chip active={rol === 'lid'} onClick={() => setRol('lid')}>Leden ({rows.filter(r => r.role === 'MEMBER' && r.isActive).length})</Chip>
        <Chip active={rol === 'ouder'} onClick={() => setRol('ouder')}>Ouders ({rows.filter(r => r.role === 'PARENT').length})</Chip>
        <Chip active={rol === 'trainer'} onClick={() => setRol('trainer')}>Trainers ({rows.filter(r => r.isTrainer || r.role === 'INSTRUCTOR').length})</Chip>
        <Chip active={rol === 'admin'} onClick={() => setRol('admin')}>Bestuur ({rows.filter(r => r.role === 'ADMIN').length})</Chip>
      </div>
      <div className={`flex flex-wrap gap-1.5 ${filtersOpen ? '' : 'hidden'} sm:flex`}>
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
          <div className="rounded-md border border-gray-200 bg-white p-8 text-center text-sm text-gray-400">Niets gevonden</div>
        )}
      </div>
    </>
  )
}

function LidRij({ r, open, onToggle, periodLabels }: { r: Row; open: boolean; onToggle: () => void; periodLabels: string[] }) {
  const router = useRouter()
  const [leave, setLeave] = useState(r.leaveDate ?? '')
  const age = leeftijd(r.dateOfBirth)
  const youth = isYouth(r.dateOfBirth ? new Date(r.dateOfBirth) : null)
  const next = r.band ? getNextBelt(r.band as BeltLevel, youth) : (youth ? 'WIT' : null)
  const laatsteBand = r.bandHistory.length ? r.bandHistory[r.bandHistory.length - 1] : null
  // "Open" = periode is al (deels) ingegaan en er is nog niet betaald.
  // Een Q1-2027-factuur (start 1-1-2027) is nog geen schuld zolang Q4 loopt.
  const nuIso = new Date().toISOString()
  const openBet = r.payments.filter(p => ['OPEN', 'HERINNERING1', 'HERINNERING2'].includes(p.status) && (p.due ?? p.start) <= nuIso)
  const laatstePer = [...periodLabels].reverse().find(l => {
    // actuele periode = laatste die al is ingegaan (Q4 2026, niet Q1 2027)
    const [y, q] = l.split('-Q')
    return new Date(`${y}-${String((Number(q) - 1) * 3 + 1).padStart(2, '0')}-01`) <= new Date()
  })
  const perStatus = r.payments.find(p => p.label === laatstePer)
  const si = CLUB_STATUS_INFO[r.clubStatus] ?? CLUB_STATUS_INFO.LID

  const zetStatus = async (s: string, leaveDate?: string) => {
    await fetch('/api/admin2/member-status', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId: r.id, clubStatus: s, leaveDate }),
    })
    router.refresh()
  }

  return (
    <div className={`relative rounded-md border bg-white transition-colors ${open ? 'border-[#a90000]/40' : 'border-gray-200'}`}>
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 p-3 text-left sm:gap-4"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-300 text-xs font-bold"
          style={{ backgroundColor: r.band ? (BELT_COLORS[r.band as BeltLevel] ?? '#eee') : '#7C3AED', color: r.band === 'WIT' ? '#555' : '#fff' }}>
          {r.firstName[0]}{r.lastName[0]}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#2a2a2a]">
            {r.firstName} {r.lastName}
            {r.clubStatus !== 'LID' && <span className={`ml-2 rounded border px-1.5 py-0.5 text-[10px] font-medium ${si.klas}`}>{si.label}</span>}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500">
            {r.groep && <span className="rounded bg-[#fdf6f6] px-1.5 py-0.5 font-medium text-[#a90000]">{GROEP_LABEL[r.groep as keyof typeof GROEP_LABEL] ?? r.groep}</span>}
            {(r.isTrainer || r.role === 'INSTRUCTOR') && <span className="rounded bg-[#2a2a2a] px-1.5 py-0.5 font-medium text-white">trainer</span>}
            {r.role === 'PARENT' && <span className="rounded bg-gray-100 px-1.5 py-0.5 font-medium text-gray-600">ouder</span>}
            {r.role === 'ADMIN' && <span className="rounded bg-gray-100 px-1.5 py-0.5 font-medium text-gray-600">bestuur</span>}
            {age !== null && <span>{age} jr</span>}
            {r.band ? <span className="flex items-center gap-1.5"><BeltVak belt={r.band} size={10} />{getBeltLabel(r.band as BeltLevel)}</span> : <span className="flex items-center gap-1.5 text-gray-400"><BeltVak belt={null} size={10} />nog geen band</span>}
            {r.city && <span className="hidden sm:inline">{r.city}</span>}
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
            <KV k="Adres" v={r.address ? `${r.address}, ${r.postalCode ?? ''} ${r.city ?? ''}` : (r.city ?? null)} />
            <KV k="Telefoon" v={[r.phone, r.phone2].filter(Boolean).join(' / ') || null} />
            <KV k="E-mail" v={r.email} />
            <KV k="Noodcontact" v={r.emergencyContactName ? `${r.emergencyContactName}${r.emergencyContactPhone ? ' · ' + r.emergencyContactPhone : ''}` : null} />
            <KV k="Lid sinds" v={r.joinDate ? nlDatum(r.joinDate) : null} />
            <KV k="Geboortedatum" v={r.dateOfBirth ? `${nlDatum(r.dateOfBirth)} (${age} jr)` : null} />
            <KV k="Portretrecht" v={r.portretrecht === null ? null : r.portretrecht ? 'ja' : 'nee'} />
            {r.medicalNotes && <KV k="Medisch" v={r.medicalNotes} />}
            {r.remarks && <KV k="Notities" v={r.remarks} />}
            {/* Clubstatus */}
            <div className="mt-3 border-t border-gray-100 pt-2">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Clubstatus</p>
              <div className="flex flex-wrap gap-1.5">
                {(['LID', 'VRIJGESTELD', 'PROEF', 'RESERVE', 'STOPPEND', 'GESTOPT'] as const).map(s => (
                  <button key={s} onClick={() => zetStatus(s, s === 'GESTOPT' ? (leave || new Date().toISOString().slice(0, 10)) : undefined)}
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      r.clubStatus === s ? `${CLUB_STATUS_INFO[s].klas} ring-1 ring-[#a90000]/40` : 'border-gray-200 bg-white text-gray-500 hover:border-[#a90000]/40'
                    }`}>
                    {CLUB_STATUS_INFO[s].label}
                  </button>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <label className="text-[11px] text-gray-500">Uitschrijven per:</label>
                <input type="date" value={leave}
                  onChange={e => { setLeave(e.target.value) }}
                  className="rounded-sm border border-gray-300 px-2 py-1 text-xs" />
                {leave && <button onClick={() => zetStatus('GESTOPT', leave)} className="rounded-full bg-gray-800 px-2.5 py-1 text-[11px] font-medium text-white">Opslaan (gestopt per {new Date(leave).toLocaleDateString('nl-NL')})</button>}
              </div>
            </div>
            {/* Lidrecord samenvoegen met een ander (dubbel) record */}
            <MergeBox r={r} />
          </Section>

          {/* Budopaspoort */}
          <Section titel="🥋 Budopaspoort">
            {r.bandHistory.length === 0 ? <p className="text-xs text-gray-400">Geen bandgeschiedenis</p> : (
              <div className="space-y-1">
                {r.bandHistory.map(b => (
                  <div key={b.belt} className="flex items-center gap-2 text-xs">
                    <BeltVak belt={b.belt} size={10} />
                    <span className="w-24">{getBeltLabel(b.belt as BeltLevel)}</span>
                    <span className="text-gray-500">{nlDatum(b.at)}</span>
                  </div>
                ))}
              </div>
            )}
            {next && <p className="mt-2 text-xs">Volgende examen: <b className="text-[#a90000]">{getBeltLabel(next)}</b></p>}
            {r.exams.length > 0 && (
              <div className="mt-2 space-y-1 border-t border-gray-100 pt-2">
                {r.exams.map((e) => (
                  <p key={`${e.belt}-${e.date ?? e.status}`} className="text-xs text-gray-600">
                    {e.date ? nlDatum(e.date) : '—'} · {getBeltLabel(e.belt as BeltLevel)} · {e.status === 'COMPLETED_PASSED' ? 'geslaagd' : e.status === 'SCHEDULED' ? 'gepland' : e.status === 'COMPLETED_FAILED' ? 'niet geslaagd' : e.status}
                    {e.score != null && ` · ${e.score}/100`}
                  </p>
                ))}
              </div>
            )}
            {r.jpDiolmas.length > 0 && (() => {
              // Kopie voor de sort: Array.sort muteert, en dit is een gedeelde
              // props-array. Bepaal de hoogste band zonder de bron te raken.
              const hoogste = [...r.jpDiolmas]
                .sort((a, b) => BAND_VOLGORDE.indexOf(a as BeltLevel) - BAND_VOLGORDE.indexOf(b as BeltLevel))
                .at(-1)
              if (!hoogste || !BELT_ORDER.includes(hoogste as BeltLevel)) {
                return <p className="mt-2 text-xs text-gray-500">Cursus Japans: {r.jpDiolmas.length} diploma&apos;s</p>
              }
              return <p className="mt-2 text-xs text-gray-500">Cursus Japans diploma t/m {getBeltLabel(hoogste as BeltLevel)}</p>
            })()}
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
              <Link href={`/admin/students/${r.id}/edit`} className="rounded-sm border border-gray-200 px-3 py-1.5 text-xs font-medium hover:border-[#a90000] hover:text-[#a90000]">✏️ Bewerken</Link>
              <Link href={`/admin/students/${r.id}`} className="rounded-sm border border-gray-200 px-3 py-1.5 text-xs font-medium hover:border-[#a90000] hover:text-[#a90000]">Volledig dossier</Link>
              <Link href={`/admin/contributie?lid=${r.id}`} className="rounded-sm border border-gray-200 px-3 py-1.5 text-xs font-medium hover:border-[#a90000] hover:text-[#a90000]">Factuur</Link>
              {r.isActive ? (
                <button onClick={async () => {
                  if (!confirm(`${r.firstName} ${r.lastName} naar de prullenbak? Het record verdwijnt uit de actieve lijsten (terug te zetten via het Archief-filter).`)) return
                  await fetch(`/api/admin/students/${r.id}`, { method: 'DELETE' })
                  router.refresh()
                }} className="rounded-sm border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 hover:border-red-300 hover:text-red-600">🗑 Prullenbak</button>
              ) : (
                <>
                  <button onClick={async () => {
                    if (!confirm(`${r.firstName} ${r.lastName} herstellen als actief lid?`)) return
                    await fetch(`/api/admin/students/${r.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: true }) })
                    router.refresh()
                  }} className="rounded-sm border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100">♻️ Herstel</button>
                  <button onClick={async () => {
                    if (!confirm(`${r.firstName} ${r.lastName} DEFINITIEF verwijderen? Dit kan niet ongedaan worden.`)) return
                    const res = await fetch(`/api/admin/students/${r.id}?permanent=true`, { method: 'DELETE' })
                    if (!res.ok) { alert(`Verwijderen mislukt: ${(await res.json().catch(() => ({}))).error || 'Onbekende fout'}`); return }
                    router.refresh()
                  }} className="rounded-sm border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">🗑 Definitief</button>
                </>
              )}
            </div>
          </Section>
        </div>
      )}
    </div>
  )
}

function MergeBox({ r }: { r: Row }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [kandidaten, setKandidaten] = useState<{ id: string; firstName: string; lastName: string; clubStatus: string; joinDate: string; bondsnummer: string | null }[]>([])
  const [busy, setBusy] = useState(false)

  async function zoek() {
    setOpen(true)
    const res = await fetch(`/api/admin2/merge-kandidaten?naam=${encodeURIComponent(`${r.firstName} ${r.lastName}`)}`)
    const j = await res.json()
    setKandidaten(j.kandidaten ?? [])
  }

  async function merge(toId: string) {
    if (!confirm(`Alle gegevens van ${r.firstName} ${r.lastName} samenvoegen in dit record? Het bronrecord wordt daarna verwijderd.`)) return
    setBusy(true)
    try {
      const res = await fetch('/api/admin2/merge', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromId: r.id, toId }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      router.refresh()
    } catch (e) {
      alert(`Samenvoegen mislukt: ${(e as Error).message}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-3 border-t border-gray-100 pt-2">
      {!open ? (
        <button onClick={zoek} className="rounded-sm border border-sky-300 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-100">
          🔗 Samenvoegen met ingeschreven lid…
        </button>
      ) : (
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Kandidaten (klik om dit record erin samen te voegen)</p>
          {kandidaten.filter(k => k.id !== r.id).length === 0 && <p className="text-xs text-gray-400">Geen andere records gevonden met deze naam.</p>}
          {kandidaten.filter(k => k.id !== r.id).map(k => (
            <button key={k.id} onClick={() => merge(k.id)} disabled={busy}
              className="flex w-full items-center justify-between rounded-sm border border-gray-200 bg-white px-3 py-2 text-left text-xs hover:border-[#a90000]/50 disabled:opacity-50">
              <span className="font-medium text-[#2a2a2a]">{k.firstName} {k.lastName}</span>
              <span className="text-gray-400">{CLUB_STATUS_INFO[k.clubStatus]?.label ?? k.clubStatus} · {nlDatum(k.joinDate)}</span>
            </button>
          ))}
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
