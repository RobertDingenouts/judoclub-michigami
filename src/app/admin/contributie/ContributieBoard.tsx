'use client'

import { useState } from 'react'
import { PAYMENT_INFO, GROEP_LABEL } from '@/lib/admin2'

type Rij = { memberId: string; paymentId: string | null; naam: string; groep: string | null; status: string; amount: number; note: string | null }

export function ContributieBoard({ rows, periode, periodId }: { rows: Rij[]; periode: string; periodId: string }) {
  const [data, setData] = useState(rows)
  const [filter, setFilter] = useState<'alles' | 'open'>('alles')
  const [busy, setBusy] = useState<string | null>(null)
  const [genereren, setGenereren] = useState(false)

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
          <div key={r.memberId} className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#2a2a2a]">{r.naam}</p>
              <p className="text-xs text-gray-500">{r.groep ? (GROEP_LABEL[r.groep as keyof typeof GROEP_LABEL] ?? r.groep) : ''} · €{r.amount.toFixed(2)}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <StatusKnop label="Betaald" klas="bg-green-600" actief={r.status === 'BETAALD'} onClick={() => r.paymentId && zetStatus(r.paymentId, 'BETAALD')} />
              <StatusKnop label="1e her." klas="bg-amber-500" actief={r.status === 'HERINNERING1'} onClick={() => r.paymentId && zetStatus(r.paymentId, 'HERINNERING1')} />
              <StatusKnop label="2e her." klas="bg-orange-600" actief={r.status === 'HERINNERING2'} onClick={() => r.paymentId && zetStatus(r.paymentId, 'HERINNERING2')} />
              <StatusKnop label="Vrijgest." klas="bg-blue-500" actief={r.status === 'VIJGESTELD'} onClick={() => r.paymentId && zetStatus(r.paymentId, 'VIJGESTELD')} />
              <StatusKnop label="Open" klas="bg-red-600" actief={r.status === 'OPEN'} onClick={() => r.paymentId && zetStatus(r.paymentId, 'OPEN')} />
            </div>
            {r.paymentId && (
              <button onClick={() => factuur(r.paymentId!)} disabled={busy === r.paymentId}
                className="shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-600 hover:border-[#a90000] hover:text-[#a90000]">
                🧾 Factuur
              </button>
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

function StatusKnop({ label, klas, actief, onClick }: { label: string; klas: string; actief: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all ${actief ? `${klas} text-white` : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
      {label}
    </button>
  )
}
