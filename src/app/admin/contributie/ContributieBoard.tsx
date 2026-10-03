'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PAYMENT_INFO, GROEP_LABEL } from '@/lib/admin2'

type Item = { omschrijving: string; bedrag: number }
type Rij = {
  memberId: string; paymentId: string | null; naam: string; groep: string | null
  status: string; amount: number; note: string | null
  items: Item[] | null; clubStatus: string; leaveDate: string
}

export function ContributieBoard({ rows, periode, periodId }: { rows: Rij[]; periode: string; periodId: string }) {
  const router = useRouter()
  const [data, setData] = useState(rows)
  const [filter, setFilter] = useState<'alles' | 'open'>('alles')
  const [busy, setBusy] = useState<string | null>(null)
  const [genereren, setGenereren] = useState(false)
  const [bewerken, setBewerken] = useState<string | null>(null)

  const openRows = data.filter(r => ['OPEN', 'HERINNERING1', 'HERINNERING2'].includes(r.status))
  const getToon = () => filter === 'open' ? openRows : data

  async function zetStatus(paymentId: string, status: string) {
    setBusy(paymentId)
    const prev = data
    setData(d => d.map(r => r.paymentId === paymentId ? { ...r, status } : r))
    try {
      const res = await fetch('/api/admin2/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, status }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
    } catch {
      setData(prev)
    } finally {
      setBusy(null)
    }
  }

  async function vlag(memberId: string, clubStatus: string) {
    const leaveDate = clubStatus === 'GESTOPT' ? new Date().toISOString().slice(0, 10) : ''
    await fetch('/api/admin2/member-status', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, clubStatus, leaveDate }),
    })
    router.refresh()
  }

  function factuur(paymentId: string) {
    window.open(`/api/admin2/factuur?paymentId=${paymentId}`, '_blank')
  }

  function facturenBulk() {
    setGenereren(true)
    window.open(`/api/admin2/factuur?periode=${periode}&open=1`, '_blank')
    setTimeout(() => setGenereren(false), 3000)
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setFilter(filter === 'alles' ? 'open' : 'alles')}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-medium ${filter === 'open' ? 'border-red-600 bg-red-600 text-white' : 'border-gray-300 bg-white text-gray-600'}`}>
          {filter === 'open' ? `Alleen open (${openRows.length})` : `Alle leden (${data.length})`}
        </button>
        <button onClick={facturenBulk} disabled={genereren || openRows.length === 0}
          className="rounded-xl bg-[#a90000] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#8c0000] disabled:opacity-40">
          🧾 Genereer facturen alle niet-betaalden ({openRows.length})
        </button>
      </div>

      <div className="space-y-2">
        {getToon().map(r => (
          <div key={r.memberId} className="rounded-xl border border-gray-200 bg-white p-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#2a2a2a]">
                  {r.naam}
                  {r.clubStatus === 'STOPPEND' && <span className="ml-2 rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">stopt?</span>}
                  {r.clubStatus === 'GESTOPT' && <span className="ml-2 rounded border border-gray-300 bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">gestopt{r.leaveDate ? ` ${new Date(r.leaveDate).toLocaleDateString('nl-NL')}` : ''}</span>}
                </p>
                <p className="text-xs text-gray-500">
                  {r.groep ? (GROEP_LABEL[r.groep as keyof typeof GROEP_LABEL] ?? r.groep) : ''} · €{r.amount.toFixed(2)}
                  {r.items && r.items.length > 1 && <span className="ml-1 text-[10px] text-gray-400">({r.items.length} regels)</span>}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <StatusKnop label="Betaald" klas="bg-green-600" actief={r.status === 'BETAALD'} onClick={() => r.paymentId && zetStatus(r.paymentId, 'BETAALD')} />
                <StatusKnop label="1e her." klas="bg-amber-500" actief={r.status === 'HERINNERING1'} onClick={() => r.paymentId && zetStatus(r.paymentId, 'HERINNERING1')} />
                <StatusKnop label="2e her." klas="bg-orange-600" actief={r.status === 'HERINNERING2'} onClick={() => r.paymentId && zetStatus(r.paymentId, 'HERINNERING2')} />
                <StatusKnop label="Vrijgest." klas="bg-blue-500" actief={r.status === 'VIJGESTELD'} onClick={() => r.paymentId && zetStatus(r.paymentId, 'VIJGESTELD')} />
                <StatusKnop label="Open" klas="bg-red-600" actief={r.status === 'OPEN'} onClick={() => r.paymentId && zetStatus(r.paymentId, 'OPEN')} />
              </div>
              <div className="flex shrink-0 gap-1.5">
                {r.paymentId && (
                  <button onClick={() => setBewerken(bewerken === r.paymentId ? null : r.paymentId)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-600 hover:border-[#a90000] hover:text-[#a90000]">
                    ✏️ Bedrag
                  </button>
                )}
                {r.paymentId && (
                  <button onClick={() => factuur(r.paymentId!)} disabled={busy === r.paymentId}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-600 hover:border-[#a90000] hover:text-[#a90000]">
                    🧾 Factuur
                  </button>
                )}
              </div>
            </div>

            {/* Vlaggen: stopt? / definitief gestopt */}
            <div className="mt-2 flex flex-wrap gap-1.5 border-t border-gray-100 pt-2">
              <button onClick={() => vlag(r.memberId, r.clubStatus === 'STOPPEND' ? 'LID' : 'STOPPEND')}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${r.clubStatus === 'STOPPEND' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-amber-100'}`}>
                ⚠️ Stopt?
              </button>
              {r.clubStatus !== 'GESTOPT' ? (
                <button onClick={() => vlag(r.memberId, 'GESTOPT')}
                  className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-500 hover:bg-gray-300">
                  ⛔ Definitief gestopt
                </button>
              ) : (
                <button onClick={() => vlag(r.memberId, 'LID')}
                  className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-500 hover:bg-green-100">
                  ↩️ Terugzetten als lid
                </button>
              )}
            </div>

            {/* Factuurlijnen bewerken */}
            {bewerken === r.paymentId && r.paymentId && (
              <FactuurEditor key={r.paymentId} r={r} periode={periode}
                onSaved={() => { setBewerken(null); router.refresh() }} />
            )}
          </div>
        ))}
        {getToon().length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
            {filter === 'open' ? 'Niets open — alles betaald! 🎉' : 'Geen leden gevonden'}
          </div>
        )}
      </div>
    </>
  )
}

function FactuurEditor({ r, periode, onSaved }: { r: Rij; periode: string; onSaved: () => void }) {
  const standaard: Item[] = [{ omschrijving: `Contributie ${periode}`, bedrag: r.amount }]
  const [items, setItems] = useState<Item[]>(r.items ?? standaard)
  const [busy, setBusy] = useState(false)
  const [fout, setFout] = useState('')

  const totaal = items.reduce((s, it) => s + (Number(it.bedrag) || 0), 0)

  function set(i: number, field: keyof Item, val: string) {
    setItems(prev => prev.map((it, j) => j === i ? { ...it, [field]: field === 'bedrag' ? parseFloat(val.replace(',', '.')) || 0 : val } : it))
  }

  async function opslaan() {
    setBusy(true); setFout('')
    try {
      const res = await fetch('/api/admin2/payment-edit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: r.paymentId, items }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      onSaved()
    } catch (e) {
      setFout((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function herstel() {
    setBusy(true)
    await fetch('/api/admin2/payment-edit', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId: r.paymentId, items: [] }),
    })
    setBusy(false)
    onSaved()
  }

  return (
    <div className="mt-3 rounded-lg border border-[#a90000]/30 bg-[#fdf6f6] p-3">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Factuurlijnen {periode} — pas bedrag aan of voeg toe (materiaal, pak, mondelinge afspraak)</p>
      <div className="space-y-1.5">
        {items.map((it, i) => (
          <div key={i} className="flex gap-2">
            <input value={it.omschrijving} onChange={e => set(i, 'omschrijving', e.target.value)}
              placeholder="Omschrijving" className="min-w-0 flex-1 rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm" />
            <input value={String(it.bedrag)} onChange={e => set(i, 'bedrag', e.target.value)} inputMode="decimal"
              className="w-24 rounded-lg border border-gray-300 px-2.5 py-1.5 text-right text-sm" />
            <button onClick={() => setItems(prev => prev.filter((_, j) => j !== i))}
              className="rounded-lg px-2 text-gray-400 hover:text-red-600">✕</button>
          </div>
        ))}
      </div>
      <button onClick={() => setItems(prev => [...prev, { omschrijving: '', bedrag: 0 }])}
        className="mt-2 text-xs font-medium text-[#a90000]">+ Regel toevoegen</button>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button onClick={opslaan} disabled={busy}
          className="rounded-lg bg-[#a90000] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          Opslaan — totaal €{totaal.toFixed(2).replace('.', ',')}
        </button>
        {r.items && <button onClick={herstel} className="text-xs text-gray-500 underline">herstel standaard contributie</button>}
        {fout && <span className="text-xs text-red-600">{fout}</span>}
      </div>
    </div>
  )
}

function StatusKnop({ label, klas, actief, onClick }: { label: string; klas: string; actief: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all ${actief ? `${klas} text-white` : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
      {label}
    </button>
  )
}
