'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PAYMENT_INFO, GROEP_LABEL } from '@/lib/admin2'
import { LidInfoKnop } from '@/components/admin2/LidInfoKnop'

type Item = { omschrijving: string; bedrag: number }
type Rij = {
  memberId: string; paymentId: string | null; naam: string; groep: string | null
  status: string; amount: number; note: string | null
  items: Item[] | null; clubStatus: string; leaveDate: string
  paidAt: string; dueDate: string; invoiceNumber: string | null
  vervald: boolean; nietBetaald: boolean
}

export function ContributieBoard({ rows, periode, periodId, totaalOpen, toonGestopt }: { rows: Rij[]; periode: string; periodId: string; totaalOpen: number; toonGestopt: boolean }) {
  const router = useRouter()
  // `useState(rows)` zou de props negeren: na `router.refresh()` (bv. na de
  // bulkknop) blijft de lijst dan op de oude snapshot staan. Alleen de lokale
  // statuswijzigingen worden bewaard, de serverdata is verder leidend.
  const [lokaal, setLokaal] = useState<Record<string, string>>({})
  const data = rows.map(r => (lokaal[r.paymentId ?? r.memberId] ? { ...r, status: lokaal[r.paymentId ?? r.memberId] } : r))
  const setData = (updater: ((prev: Rij[]) => Rij[]) | Rij[]) => {
    const prev = data
    const next = typeof updater === 'function' ? updater(prev) : updater
    const diff: Record<string, string> = { ...lokaal }
    for (const r of next) {
      const key = r.paymentId ?? r.memberId
      const oud = prev.find(x => (x.paymentId ?? x.memberId) === key)
      if (oud && oud.status !== r.status) diff[key] = r.status
    }
    setLokaal(diff)
  }
  const [filter, setFilter] = useState<'alles' | 'open' | 'schuldig' | 'betaald' | 'vrij'>('open')
  const [zoek, setZoek] = useState('')
  const [sorteer, setSorteer] = useState<'naam' | 'bedrag' | 'verval' | 'status'>('naam')
  const [busy, setBusy] = useState<string | null>(null)
  const [genereren, setGenereren] = useState(false)
  const [bewerken, setBewerken] = useState<string | null>(null)
  const [materiaalLid, setMateriaalLid] = useState<Rij | null>(null)
  const [bevestigBulk, setBevestigBulk] = useState(false)
  const [bulkDue, setBulkDue] = useState<string | null>(null)

  // Twee niveaus, bewust gescheiden:
  //  - openRows  = facturen die nog BETAALD MOETEN WORDEN (niet betaald, welke
  //    datum dan ook) → daar genereer je facturen voor en zet je op betaald.
  //  - schuldigRows = waarvan de officiële betaaldatum verstreken is → pas dán is
  //    er sprake van schuld en mogen herinneringen af. Vrijgestelden/reserves
  //    zijn nooit schuldig.
  const openRows = data.filter(r => r.nietBetaald)
  const schuldigRows = data.filter(r => r.vervald)
  const betaaldRows = data.filter(r => r.status === 'BETAALD')
  const vrijRows = data.filter(r => r.status === 'VIJGESTELD')
  const getToon = () => {
    // Zoeken zoekt altijd in ALLE rijen — anders vind je een lid niet omdat ie
    // net buiten het actieve filter valt.
    let r: Rij[]
    if (zoek.trim()) {
      const q = zoek.trim().toLowerCase()
      r = data.filter(x => x.naam.toLowerCase().includes(q) || (x.invoiceNumber ?? '').toLowerCase().includes(q))
    } else {
      r = filter === 'open' ? openRows
        : filter === 'schuldig' ? schuldigRows
        : filter === 'betaald' ? betaaldRows
        : filter === 'vrij' ? vrijRows
        : data
    }
    switch (sorteer) {
      case 'bedrag': return [...r].sort((a, b) => b.amount - a.amount)
      case 'verval': return [...r].sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'))
      case 'status': return [...r].sort((a, b) => a.status.localeCompare(b.status) || a.naam.localeCompare(b.naam))
      default: return r
    }
  }

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

  // Betaaldatum individueel: invullen = betaald, leeghalen = weer open.
  async function zetBetaaldatum(paymentId: string, paidAt: string) {
    setBusy(paymentId)
    try {
      const res = await fetch('/api/admin2/payment-edit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, paidAt: paidAt || null }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      router.refresh()
    } catch (e) {
      window.alert((e as Error).message || 'Opslaan mislukt')
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

  // Alle openstaande facturen van deze periode in één keer op een status
  // (betaald / 1e herinnering / 2e herinnering), of de vervaldatum voor
  // allemaal zetten. Bevestiging met aantal + bedrag, anders is één klik op de
  // verkeerde periode meteen een onomkeerbare bulkwijziging.
  async function bulkActie(body: Record<string, unknown>) {
    setGenereren(true)
    try {
      const res = await fetch('/api/admin2/payment-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periodId, ...body }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error ?? 'Onbekende fout')
      setBevestigBulk(false)
      setBulkDue(null)
      router.refresh()
    } catch {
      window.alert('Kon de betalingen niet opslaan. Er is niets gewijzigd.')
    } finally {
      setGenereren(false)
    }
  }
  const bulkBetaald = () => bulkActie({ status: 'BETAALD' })
  // Herinneringen hebben alleen zin voor wie écht schuldig is (vervaldatum
  // verstreken) — de API filtert met onlyPastDue extra op de datum.
  const bulkHerinnering = (s: 'HERINNERING1' | 'HERINNERING2') => bulkActie({ status: s, onlyPastDue: true })

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
        {([
          ['open', `Nog te betalen (${openRows.length})`],
          ['schuldig', `Schuldig (${schuldigRows.length})`],
          ['betaald', `Betaald (${betaaldRows.length})`],
          ['vrij', `Vrijgesteld (${vrijRows.length})`],
          ['alles', `Allemaal (${data.length})`],
        ] as const).map(([k, lbl]) => (
          <button key={k} onClick={() => setFilter(k)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${filter === k ? 'border-[#a90000] bg-[#a90000] text-white' : 'border-gray-300 bg-white text-gray-600 hover:border-[#a90000]'}`}>
            {lbl}
          </button>
        ))}
        <input value={zoek} onChange={e => setZoek(e.target.value)} placeholder="🔍 naam of factuurnr…"
          className="rounded-full border border-gray-300 px-3 py-1.5 text-xs focus:border-[#a90000] focus:outline-none" />
        <select value={sorteer} onChange={e => setSorteer(e.target.value as any)}
          className="rounded-full border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-600 focus:border-[#a90000] focus:outline-none" title="Sorteren">
          <option value="naam">Sorteer: naam</option>
          <option value="bedrag">Sorteer: bedrag</option>
          <option value="verval">Sorteer: vervaldatum</option>
          <option value="status">Sorteer: status</option>
        </select>
        <button onClick={facturenBulk} disabled={genereren || openRows.length === 0}
          className="rounded-md bg-[#a90000] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#8c0000] disabled:opacity-40"
          title="Genereer PDF-facturen voor iedereen die nog niet betaald heeft — ook vóór de betaaldatum">
          🧾 Genereer facturen alle nog-niet-betaalden ({openRows.length})
        </button>
        {openRows.length > 0 && (
          <button onClick={() => setBevestigBulk(true)} disabled={genereren}
            className="rounded-md border border-green-600 px-4 py-2.5 text-sm font-semibold text-green-700 hover:bg-green-50 disabled:opacity-40">
            ✓ Alles betaald zetten ({openRows.length})
          </button>
        )}
        {schuldigRows.length > 0 && (
          <>
            <button onClick={() => bulkHerinnering('HERINNERING1')} disabled={genereren}
              className="rounded-md border border-amber-500 px-4 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-40"
              title={`Alle ${schuldigRows.length} schuldige facturen (vervaldatum verstreken) op 1e herinnering`}>
              🔔 1e herinnering → schuldigen ({schuldigRows.length})
            </button>
            <button onClick={() => bulkHerinnering('HERINNERING2')} disabled={genereren}
              className="rounded-md border border-orange-600 px-4 py-2.5 text-sm font-semibold text-orange-700 hover:bg-orange-50 disabled:opacity-40"
              title={`Alle ${schuldigRows.length} schuldige facturen (vervaldatum verstreken) op 2e herinnering`}>
              🔔 2e herinnering → schuldigen ({schuldigRows.length})
            </button>
          </>
        )}
        <label className="flex items-center gap-1.5 text-xs text-gray-600">
          <span className="font-medium">Vervaldatum allemaal:</span>
          <input type="date" value={bulkDue ?? ''} onChange={e => setBulkDue(e.target.value || null)}
            className="rounded-sm border border-gray-300 px-2 py-1.5 text-xs focus:border-[#a90000] focus:outline-none" />
          <button onClick={() => bulkDue && bulkActie({ dueDate: bulkDue })} disabled={!bulkDue || genereren}
            className="rounded-sm bg-gray-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-700 disabled:opacity-40">
            ✓ Setten
          </button>
        </label>
        <a href={`/admin/contributie?periode=${periode}${toonGestopt ? '' : '&gestopt=1'}`}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-medium ${toonGestopt ? 'border-gray-800 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-600'}`}>
          {toonGestopt ? 'Gestopten: tonen ✓' : 'Gestopten: verbergen'}
        </a>
      </div>

      {bevestigBulk && (
        <div className="rounded-md border-2 border-green-600 bg-green-50 p-4">
          <p className="text-sm font-semibold text-[#2a2a2a]">
            {openRows.length} facturen in {periode} op betaald zetten?
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Totaal €{totaalOpen.toFixed(2).replace('.', ',')} — {periode} is dan volledig afgehandeld.
          </p>
          {openRows.some(r => r.clubStatus === 'GESTOPT') && (
            <p className="mt-2 rounded-sm bg-amber-50 px-2 py-1 text-xs text-amber-800">
              Let op: {openRows.filter(r => r.clubStatus === 'GESTOPT').length} van deze facturen horen bij
              {' '}gestopte leden. Wil je die overslaan, laat het weten — dan zet ik ze op vrijgesteld.
            </p>
          )}
          <div className="mt-3 flex gap-2">
            <button onClick={bulkBetaald} disabled={genereren}
              className="rounded-sm bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50">
              {genereren ? 'Bezig…' : `Ja, ${openRows.length} facturen op betaald`}
            </button>
            <button onClick={() => setBevestigBulk(false)} disabled={genereren}
              className="rounded-sm border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
              Annuleren
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {getToon().map(r => (
          <div key={r.memberId} className="rounded-md border border-gray-200 bg-white p-3">
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
                  {r.invoiceNumber && <span className="ml-1 text-[10px] text-gray-400">#{r.invoiceNumber}</span>}
                  {r.paidAt && <span className="ml-1 text-[10px] text-green-700">betaald {new Date(r.paidAt).toLocaleDateString('nl-NL')}</span>}
                  {!r.paidAt && r.dueDate && new Date(r.dueDate) < new Date() && <span className="ml-1 text-[10px] font-semibold text-red-600">verval {new Date(r.dueDate).toLocaleDateString('nl-NL')} — te laat</span>}
                  {!r.paidAt && r.dueDate && new Date(r.dueDate) >= new Date() && <span className="ml-1 text-[10px] text-gray-400">vervalt {new Date(r.dueDate).toLocaleDateString('nl-NL')} — nog geen schuld</span>}
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
                  <label className="flex items-center gap-1 rounded-sm border border-gray-300 px-2 py-1 text-[11px] text-gray-600" title="Betaaldatum individueel instellen; invullen = automatisch op betaald, leeghalen = weer open">
                    💳 <input type="date" defaultValue={r.paidAt}
                      onChange={e => r.paymentId && zetBetaaldatum(r.paymentId, e.target.value)}
                      className="w-[110px] bg-transparent text-[11px] focus:outline-none" />
                  </label>
                )}
                {r.paymentId && (
                  <button onClick={() => setBewerken(bewerken === r.paymentId ? null : r.paymentId)}
                    className="rounded-sm border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-600 hover:border-[#a90000] hover:text-[#a90000]">
                    ✏️ Bedrag
                  </button>
                )}
                {r.paymentId && (
                  <button onClick={() => factuur(r.paymentId!)} disabled={busy === r.paymentId}
                    className="rounded-sm border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-600 hover:border-[#a90000] hover:text-[#a90000]">
                    🧾 Factuur
                  </button>
                )}
                <button onClick={() => setMateriaalLid(r)}
                  className="rounded-sm border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-600 hover:border-[#a90000] hover:text-[#a90000]"
                  title="Artikel uit voorraad op deze factuur zetten (pak, band, …)">📦 + Artikel</button>
                <LidInfoKnop memberId={r.memberId} />
                <a href={`/admin/students/${r.memberId}`}
                  className="rounded-sm border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-600 hover:border-[#a90000] hover:text-[#a90000]"
                  title="Volledig dossier van dit lid">👤 Lid</a>
              </div>
            </div>

            {/* Vlaggen: stopt? / definitief gestopt */}
            <div className="mt-2 flex flex-wrap gap-1.5 border-t border-gray-100 pt-2">
              <button onClick={() => vlag(r.memberId, r.clubStatus === 'RESERVE' ? 'LID' : 'RESERVE')}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${r.clubStatus === 'RESERVE' ? 'bg-sky-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-sky-100'}`}
                title="Reserve: geen contributie in lopende en toekomstige periodes">
                🅾️ Reserve{r.clubStatus === 'RESERVE' ? ' ✓' : ''}
              </button>
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
          <div className="rounded-md border border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
            {filter === 'open' ? (data.length > 0 ? `Niets open in ${periode} — vervaldatum nog niet geweest of alles betaald 🎉` : 'Geen leden gevonden') : 'Geen leden gevonden'}
          </div>
        )}
      </div>

      {materiaalLid && (
        <MateriaalPicker
          memberId={materiaalLid.memberId}
          lidNaam={materiaalLid.naam}
          periode={periode}
          periodId={periodId}
          sluit={() => setMateriaalLid(null)}
          sluitEnVervers={() => { setMateriaalLid(null); router.refresh() }}
        />
      )}
    </>
  )
}

// Artikelen uit de clubvoorraad op de factuur van dit lid zetten — inclusief
// voorraadcorrectie en logboek, dezelfde route als Materiaal → Op factuur.
function MateriaalPicker({ memberId, lidNaam, periode, periodId, sluit, sluitEnVervers }: {
  memberId: string; lidNaam: string; periode: string; periodId: string; sluit: () => void; sluitEnVervers: () => void
}) {
  type Art = { id: string; product: string; maat: string | null; clubPrijs: number; voorraad: number }
  const [arts, setArts] = useState<Art[] | null>(null)
  const [q, setQ] = useState('')
  const [artikelId, setArtikelId] = useState('')
  const [aantal, setAantal] = useState(1)
  const [toast, setToast] = useState('')
  const [totaalToegevoegd, setTotaalToegevoegd] = useState(0)

  useEffect(() => {
    fetch('/api/admin2/inventory').then(r => r.json()).then(d => setArts(d.items ?? [])).catch(() => setArts([]))
  }, [])

  const zichtbaar = (arts ?? []).filter(a => `${a.product} ${a.maat ?? ''}`.toLowerCase().includes(q.toLowerCase()))

  async function voegToe() {
    if (!artikelId) return
    const gekozen = artikelId
    const r = await fetch('/api/admin2/inventory/verkoop', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: gekozen, memberId, aantal, mode: 'kwartaal', periodId }),
    })
    const d = await r.json()
    if (!r.ok) { setToast(d.error || 'Mislukt'); return }
    setToast(`Toegevoegd — factuurtotaal ${Number(d.totaal).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' })}`)
    setTotaalToegevoegd(t => t + 1)
    setAantal(1)
    setArtikelId('')
    setArts(prev => prev ? prev.map(a => a.id === gekozen ? { ...a, voorraad: d.voorraad } : a) : prev)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4" onClick={sluitEnVervers}>
      <div className="my-8 w-full max-w-md rounded-md bg-white p-5 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-bold text-[#2a2a2a]">📦 Artikel op factuur — {lidNaam} <span className="text-sm font-normal text-gray-500">({periode})</span></h3>
          <button onClick={sluitEnVervers} className="text-gray-400 hover:text-gray-700">✕</button>
        </div>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Zoek artikel of maat…"
          className="mb-2 w-full rounded-sm border border-gray-300 px-3 py-2 text-sm focus:border-[#a90000] focus:outline-none" />
        {!arts && <p className="text-sm text-gray-400">Artikelen laden…</p>}
        {arts && (
          <div className="flex flex-wrap gap-2">
            <select value={artikelId} onChange={e => setArtikelId(e.target.value)} className="min-w-0 flex-1 rounded-sm border border-gray-300 bg-white px-2 py-2 text-sm">
              <option value="">— kies —</option>
              {zichtbaar.map(a => <option key={a.id} value={a.id}>{a.product.replace('Budo Band - Vechtsportband - ', 'Band — ')}{a.maat ? ` · ${a.maat}` : ''} — {Number(a.clubPrijs).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' })}{a.voorraad === 0 ? ' (0 op voorraad)' : ` (${a.voorraad})`}</option>)}
            </select>
            <input type="number" min={1} value={aantal} onChange={e => setAantal(Math.max(1, Number(e.target.value)))} className="w-16 rounded-sm border border-gray-300 px-2 py-2 text-center text-sm" />
            <button onClick={voegToe} disabled={!artikelId} className="rounded-sm bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-40">Toevoegen</button>
          </div>
        )}
        {toast && <p className="mt-2 text-sm text-green-700">{toast}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={sluitEnVervers} className="rounded-sm bg-[#a90000] px-4 py-2 text-sm font-semibold text-white hover:bg-[#8c0000]">
            {totaalToegevoegd > 0 ? `Klaar (${totaalToegevoegd} ${totaalToegevoegd === 1 ? 'regel' : 'regels'} toegevoegd)` : 'Sluiten'}
          </button>
        </div>
        <p className="mt-2 text-[11px] text-gray-400">Meerdere artikelen achter elkaar kan; de lijst ververst na sluiten. Voorraad en logboek lopen automatisch mee.</p>
      </div>
    </div>
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
    <div className="mt-3 rounded-sm border border-[#a90000]/30 bg-[#fdf6f6] p-3">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Factuurlijnen {periode} — pas bedrag aan of voeg toe (materiaal, pak, mondelinge afspraak)</p>
      <div className="space-y-1.5">
        {items.map((it, i) => (
          <div key={i} className="flex gap-2">
            <input value={it.omschrijving} onChange={e => set(i, 'omschrijving', e.target.value)}
              placeholder="Omschrijving" className="min-w-0 flex-1 rounded-sm border border-gray-300 px-2.5 py-1.5 text-sm" />
            <input value={String(it.bedrag)} onChange={e => set(i, 'bedrag', e.target.value)} inputMode="decimal"
              className="w-24 rounded-sm border border-gray-300 px-2.5 py-1.5 text-right text-sm" />
            <button onClick={() => setItems(prev => prev.filter((_, j) => j !== i))}
              className="rounded-sm px-2 text-gray-400 hover:text-red-600">✕</button>
          </div>
        ))}
      </div>
      <button onClick={() => setItems(prev => [...prev, { omschrijving: '', bedrag: 0 }])}
        className="mt-2 text-xs font-medium text-[#a90000]">+ Regel toevoegen</button>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button onClick={opslaan} disabled={busy}
          className="rounded-sm bg-[#a90000] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
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
