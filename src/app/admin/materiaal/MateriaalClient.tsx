'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

type Item = { id: string; artikelNr: string; ean: string | null; product: string; maat: string | null; inkoopIncl: number; webPrijs: number; clubPrijs: number; voorraad: number }
type Move = { id: string; artikelNr: string; product: string; maat: string | null; soort: string; aantal: number; prijs: number; memberNaam: string | null; periode: string | null; reden: string | null; createdAt: string }
type Member = { id: string; firstName: string | null; lastName: string | null }
type FactItem = { omschrijving: string; bedrag: number; artikelNr?: string; aantal?: number }

const eur = (n: number) => n.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' })

export default function MateriaalClient() {
  const [items, setItems] = useState<Item[]>([])
  const [moves, setMoves] = useState<Move[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'voorraad' | 'factuur' | 'logboek'>('voorraad')
  const [toast, setToast] = useState<{ msg: string; err?: boolean } | null>(null)
  const [showNieuw, setShowNieuw] = useState(false)
  const [bewerken, setBewerken] = useState<Item | null>(null)

  const say = (msg: string, err = false) => { setToast({ msg, err }); setTimeout(() => setToast(null), 3500) }

  const laad = useCallback(async () => {
    const r = await fetch('/api/admin2/inventory')
    if (!r.ok) { say('Laden mislukt', true); return }
    const d = await r.json()
    setItems(d.items); setMoves(d.moves); setMembers(d.members)
    setLoading(false)
  }, [])
  useEffect(() => { laad() }, [laad])

  const zoek = (algemeen: string, set: (v: string) => void, lijst: Item[]) => {
    const q = algemeen.toLowerCase()
    return q ? lijst.filter(i => `${i.product} ${i.maat ?? ''} ${i.artikelNr} ${i.ean ?? ''}`.toLowerCase().includes(q)) : lijst
  }

  // ── VOORRAAD ────────────────────────────────────────────────
  const [q, setQ] = useState('')
  const visible = useMemo(() => zoek(q, setQ, items), [q, items])
  const voorraadWaarde = items.reduce((s, i) => s + i.inkoopIncl * i.voorraad, 0)
  const stuks = items.reduce((s, i) => s + i.voorraad, 0)

  async function zetVoorraad(it: Item, delta: number) {
    const r = await fetch('/api/admin2/inventory', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'voorraad', id: it.id, delta }),
    })
    if (!r.ok) { say((await r.json()).error || 'Mislukt', true); return }
    const d = await r.json()
    setItems(prev => prev.map(x => x.id === it.id ? { ...x, voorraad: d.voorraad } : x))
    laad()
  }
  async function handmatig(it: Item, nieuw: number) {
    if (Number.isNaN(nieuw) || nieuw === it.voorraad) return
    const r = await fetch('/api/admin2/inventory', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'voorraad', id: it.id, voorraad: nieuw, reden: 'handmatig ingevoerd' }),
    })
    if (!r.ok) { say((await r.json()).error || 'Mislukt', true); return }
    setItems(prev => prev.map(x => x.id === it.id ? { ...x, voorraad: nieuw } : x))
    say(`${it.product}${it.maat ? ` ${it.maat}` : ''}: voorraad op ${nieuw}`)
    laad()
  }

  // ── FACTUUR ─────────────────────────────────────────────────
  const [memberId, setMemberId] = useState('')
  const [fact, setFact] = useState<{ periodeLabel: string; paymentId: string | null; status: string | null; items: FactItem[]; totaal: number } | null>(null)
  const [zoekLid, setZoekLid] = useState('')
  const [modus, setModus] = useState<'kwartaal' | 'materiaal'>('kwartaal')
  const [artikelId, setArtikelId] = useState('')
  const [aantal, setAantal] = useState(1)
  const [pq, setPq] = useState('')
  const koopbaar = useMemo(() => zoek(pq, setPq, items), [pq, items])

  useEffect(() => {
    if (!memberId) { setFact(null); return }
    fetch(`/api/admin2/inventory/verkoop?memberId=${memberId}&mode=${modus}`).then(r => r.json()).then(d => setFact(d.error ? null : d))
  }, [memberId, modus])

  async function voegToe() {
    if (!artikelId || !memberId) { say('Kies eerst een lid en een artikel', true); return }
    const r = await fetch('/api/admin2/inventory/verkoop', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: artikelId, memberId, aantal, mode: modus }),
    })
    const d = await r.json()
    if (!r.ok) { say(d.error || 'Mislukt', true); return }
    setFact(f => f && { ...f, paymentId: f.paymentId ?? d.paymentId, items: d.items, totaal: d.totaal })
    const it = items.find(i => i.id === artikelId)
    say(`${it?.product}${it?.maat ? ` ${it.maat}` : ''} toegevoegd — ${eur(d.totaal)} op factuur`)
    setAantal(1)
    laad()
  }
  async function verwijder(artikelNr: string) {
    if (!fact?.paymentId) { say('Nog geen factuur — voeg eerst een artikel toe', true); return }
    const r = await fetch('/api/admin2/inventory/verkoop', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId: fact.paymentId, artikelNr }),
    })
    const d = await r.json()
    if (!r.ok) { say(d.error || 'Mislukt', true); return }
    setFact(f => f && { ...f, items: d.items, paymentId: d.paymentRemoved ? null : f.paymentId })
    say('Regel verwijderd — artikel retour in voorraad')
    laad()
  }

  const lidNaam = (id: string) => { const m = members.find(x => x.id === id); return m ? `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim() : '' }

  const tabBtn = (t: typeof tab, label: string) => (
    <button onClick={() => setTab(t)}
      className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === t ? 'bg-[#a90000] text-white' : 'bg-white text-gray-700 border border-gray-200 hover:border-[#a90000]/40'}`}>
      {label}
    </button>
  )

  if (loading) return <p className="p-6 text-gray-500">Materiaal laden…</p>

  return (
    <div className="max-w-6xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#2a2a2a]">📦 Materiaal &amp; inventaris</h1>
          <p className="text-sm text-gray-500">{items.length} artikelen · {stuks} stuks op voorraad · inkoopwaarde {eur(voorraadWaarde)}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowNieuw(true)} className="rounded-lg bg-[#a90000] px-4 py-2 text-sm font-semibold text-white hover:bg-[#8c0000]">+ Nieuw artikel</button>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        {tabBtn('voorraad', 'Voorraad')}
        {tabBtn('factuur', 'Op factuur zetten')}
        {tabBtn('logboek', 'Logboek')}
      </div>

      {toast && (
        <div className={`fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-lg lg:bottom-6 ${toast.err ? 'bg-red-600' : 'bg-green-700'}`}>{toast.msg}</div>
      )}

      {tab === 'voorraad' && (
        <div>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Zoek op product, maat, artikelnummer of EAN…"
            className="mb-3 w-full max-w-md rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#a90000] focus:outline-none" />
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-[#f5f5f0] text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-3 py-2">Artikelnr</th><th className="px-3 py-2">Product</th>
                  <th className="px-3 py-2 text-right">Inkoop</th><th className="px-3 py-2 text-right">Web</th><th className="px-3 py-2 text-right">Club</th>
                  <th className="px-3 py-2 text-center">Voorraad</th><th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {visible.map(i => (
                  <tr key={i.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-3 py-1.5 font-mono text-xs text-gray-500">{i.artikelNr}</td>
                    <td className="px-3 py-1.5">
                      <span className="font-medium text-[#2a2a2a]">{i.product.replace('Budo Band - Vechtsportband - ', 'Band — ')}</span>
                      {i.maat && <span className="ml-1.5 rounded bg-gray-100 px-1.5 py-0.5 text-xs">{i.maat}</span>}
                    </td>
                    <td className="px-3 py-1.5 text-right text-gray-500">{eur(i.inkoopIncl)}</td>
                    <td className="px-3 py-1.5 text-right text-gray-500">{eur(i.webPrijs)}</td>
                    <td className="px-3 py-1.5 text-right font-semibold text-[#a90000]">{eur(i.clubPrijs)}</td>
                    <td className="px-3 py-1.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => zetVoorraad(i, -1)} className="h-7 w-7 rounded border border-gray-300 text-gray-600 hover:border-red-400 hover:text-red-600">−</button>
                        <input type="number" defaultValue={i.voorraad} onBlur={e => handmatig(i, Number(e.target.value))}
                          className={`h-7 w-12 rounded border text-center text-sm ${i.voorraad === 0 ? 'border-red-300 bg-red-50 text-red-700' : 'border-gray-300'}`} />
                        <button onClick={() => zetVoorraad(i, +1)} className="h-7 w-7 rounded border border-gray-300 text-gray-600 hover:border-green-500 hover:text-green-700">+</button>
                      </div>
                    </td>
                    <td className="px-3 py-1.5 text-right"><button onClick={() => setBewerken(i)} className="text-xs text-gray-400 hover:text-[#a90000]">✏️</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'factuur' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-sm font-bold text-[#2a2a2a]">1 · Kies het lid</h2>
            <input list="ledenlijst" value={zoekLid} onChange={e => { setZoekLid(e.target.value); setMemberId('') }}
              placeholder="Typ een naam…" className="mb-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#a90000] focus:outline-none" />
            <datalist id="ledenlijst">{members.map(m => <option key={m.id} value={`${m.firstName ?? ''} ${m.lastName ?? ''}`.trim()} />)}</datalist>
            {zoekLid && !memberId && (
              <div className="max-h-44 overflow-y-auto rounded-lg border border-gray-200">
                {members.filter(m => `${m.firstName} ${m.lastName}`.toLowerCase().includes(zoekLid.toLowerCase())).slice(0, 30).map(m => (
                  <button key={m.id} onClick={() => { setMemberId(m.id); setZoekLid(`${m.firstName ?? ''} ${m.lastName ?? ''}`.trim()) }}
                    className="block w-full px-3 py-1.5 text-left text-sm hover:bg-[#fdf6f6]">{m.firstName} {m.lastName}</button>
                ))}
              </div>
            )}
            {memberId && <p className="mt-2 text-xs text-green-700">Lid geselecteerd: <b>{lidNaam(memberId)}</b></p>}

            <h2 className="mb-2 mt-5 text-sm font-bold text-[#2a2a2a]">2 · Kies het artikel</h2>
            <input value={pq} onChange={e => setPq(e.target.value)} placeholder="Zoek artikel of maat…" className="mb-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#a90000] focus:outline-none" />
            <div className="flex flex-wrap gap-2">
              <select value={artikelId} onChange={e => setArtikelId(e.target.value)} className="w-full min-w-0 rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm sm:flex-1">
                <option value="">— kies —</option>
                {koopbaar.map(i => <option key={i.id} value={i.id}>{i.product.replace('Budo Band - Vechtsportband - ', 'Band — ')}{i.maat ? ` · ${i.maat}` : ''} — {eur(i.clubPrijs)} {i.voorraad === 0 ? '(0 op voorraad)' : `(${i.voorraad})`}</option>)}
              </select>
              <input type="number" min={1} value={aantal} onChange={e => setAantal(Math.max(1, Number(e.target.value)))} className="w-16 rounded-lg border border-gray-300 px-2 py-2 text-center text-sm" />
              <button onClick={voegToe} className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 sm:flex-none">Toevoegen</button>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex gap-1.5 rounded-lg bg-gray-100 p-1 text-xs font-semibold">
              <button onClick={() => setModus('kwartaal')} className={`flex-1 rounded-md px-2 py-1.5 ${modus === 'kwartaal' ? 'bg-white text-[#a90000] shadow-sm' : 'text-gray-500'}`}>Bij contributiefactuur</button>
              <button onClick={() => setModus('materiaal')} className={`flex-1 rounded-md px-2 py-1.5 ${modus === 'materiaal' ? 'bg-white text-[#a90000] shadow-sm' : 'text-gray-500'}`}>Losse materiaalfactuur</button>
            </div>
            <h2 className="mb-2 text-sm font-bold text-[#2a2a2a]">Factuur {fact ? <span className="font-normal text-gray-500">({fact.periodeLabel}{fact.status ? ` · ${fact.status}` : ' · nog geen factuur'})</span> : ''}</h2>
            {!fact && <p className="text-sm text-gray-400">Nog niets gekozen. Na selectie van een lid verschijnt hier zijn actuele factuur.</p>}
            {fact && (
              <table className="w-full text-sm">
                <tbody>
                  {fact.items.map((x, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="py-1.5">{x.omschrijving}{x.aantal ? <span className="text-gray-400"> ×{x.aantal}</span> : null}</td>
                      <td className="py-1.5 text-right whitespace-nowrap">{eur(x.bedrag)}</td>
                      <td className="w-10 py-1.5 text-right">
                        {x.artikelNr ? <button onClick={() => verwijder(x.artikelNr!)} title="Van factuur af (retour voorraad)" className="text-red-400 hover:text-red-600">✕</button> : null}
                      </td>
                    </tr>
                  ))}
                  <tr><td className="py-2 font-bold">Totaal</td><td className="py-2 text-right font-bold text-[#a90000]">{eur(fact.totaal)}</td><td /></tr>
                </tbody>
              </table>
            )}
            <p className="mt-3 text-xs text-gray-400">Bij <b>bijdragefactuur</b> gaan de artikelen bij de contributieregels van het kwartaal. Bij <b>losse materiaalfactuur</b> komt alles op een eigen factuur (periode <i>Materiaal {new Date().getFullYear()}</i>) — handig als het kwartaal al betaald is. Te genereren via Contributie-admin → gekozen periode → factuur-PDF. Een regel afmelden brengt het artikel terug in de voorraad.</p>
          </div>
        </div>
      )}

      {tab === 'logboek' && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-[#f5f5f0] text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="px-3 py-2">Datum</th><th className="px-3 py-2">Soort</th><th className="px-3 py-2">Product</th>
                <th className="px-3 py-2 text-center">Aantal</th><th className="px-3 py-2">Lid / reden</th>
              </tr>
            </thead>
            <tbody>
              {moves.map(m => (
                <tr key={m.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-3 py-1.5 text-xs text-gray-500">{new Date(m.createdAt).toLocaleDateString('nl-NL')} {new Date(m.createdAt).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-3 py-1.5"><span className={`rounded px-1.5 py-0.5 text-xs font-medium ${m.soort === 'VERKOOP' ? 'bg-red-100 text-red-700' : m.soort === 'INKOOP' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{m.soort}</span></td>
                  <td className="px-3 py-1.5">{m.product.replace('Budo Band - Vechtsportband - ', 'Band — ')}{m.maat ? ` · ${m.maat}` : ''}</td>
                  <td className={`px-3 py-1.5 text-center font-semibold ${m.aantal < 0 ? 'text-red-600' : 'text-green-700'}`}>{m.aantal > 0 ? '+' : ''}{m.aantal}</td>
                  <td className="px-3 py-1.5 text-xs text-gray-500">{m.memberNaam ? `${m.memberNaam} (${m.periode ?? ''})` : ''} {m.reden ?? ''}</td>
                </tr>
              ))}
              {moves.length === 0 && <tr><td colSpan={5} className="px-3 py-6 text-center text-gray-400">Nog geen mutaties</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {(showNieuw || bewerken) && (
        <NieuwArtikelModal
          item={bewerken}
          sluit={() => { setShowNieuw(false); setBewerken(null) }}
          opGeslaag={d => {
            if (bewerken) setItems(prev => prev.map(x => x.id === d.item.id ? d.item : x))
            else setItems(prev => [...prev, d.item].sort((a, b) => a.product.localeCompare(b.product)))
            setShowNieuw(false); setBewerken(null)
            say(bewerken ? 'Artikel bijgewerkt' : 'Artikel toegevoegd')
          }}
        />
      )}
    </div>
  )
}

function NieuwArtikelModal({ item, sluit, opGeslaag }: { item: Item | null; sluit: () => void; opGeslaag: (d: { item: Item }) => void }) {
  const [v, setV] = useState({ product: item?.product ?? '', maat: item?.maat ?? '', ean: item?.ean ?? '', inkoopIncl: item?.inkoopIncl ?? '', webPrijs: item?.webPrijs ?? '', clubPrijs: item?.clubPrijs ?? '', voorraad: item?.voorraad ?? 0 })
  const [fout, setFout] = useState('')
  const veld = (k: keyof typeof v, label: string, type = 'text') => (
    <label className="block text-xs">
      <span className="text-gray-500">{label}</span>
      <input type={type} value={String(v[k] ?? '')} onChange={e => setV({ ...v, [k]: type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value })}
        className="mt-0.5 w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:border-[#a90000] focus:outline-none" />
    </label>
  )
  async function opslaan() {
    setFout('')
    if (!v.product || v.inkoopIncl === '' || v.clubPrijs === '') { setFout('Product, inkoopprijs en clubprijs zijn verplicht'); return }
    const body: Record<string, unknown> = item
      ? { action: 'update', id: item.id, product: v.product, maat: v.maat || null, ean: v.ean || null, inkoopIncl: Number(v.inkoopIncl), webPrijs: v.webPrijs === '' ? Number(v.clubPrijs) : Number(v.webPrijs), clubPrijs: Number(v.clubPrijs) }
      : { action: 'create', product: v.product, maat: v.maat || null, ean: v.ean || null, inkoopIncl: Number(v.inkoopIncl), webPrijs: v.webPrijs === '' ? Number(v.clubPrijs) : Number(v.webPrijs), clubPrijs: Number(v.clubPrijs), voorraad: Number(v.voorraad) || 0 }
    const r = await fetch('/api/admin2/inventory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const d = await r.json()
    if (!r.ok) { setFout(d.error || 'Mislukt'); return }
    opGeslaag(d)
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
        <h3 className="mb-3 font-bold text-[#2a2a2a]">{item ? `Artikel bijwerken (${item.artikelNr})` : 'Nieuw artikel'}</h3>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="col-span-2">{veld('product', 'Product*', 'text')}</div>
          {veld('maat', 'Maat / variant')}
          {veld('ean', 'EAN')}
          {veld('inkoopIncl', 'Inkoop incl. btw (€)*', 'number')}
          {veld('webPrijs', 'Webprijs (€)')}
          {veld('clubPrijs', 'Clubprijs (€)*', 'number')}
          {!item && veld('voorraad', 'Startvoorraad', 'number')}
        </div>
        {fout && <p className="mt-2 text-sm text-red-600">{fout}</p>}
        <div className="mt-4 flex gap-2">
          <button onClick={sluit} className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Annuleren</button>
          <button onClick={opslaan} className="flex-1 rounded-lg bg-[#a90000] px-4 py-2 text-sm font-semibold text-white hover:bg-[#8c0000]">{item ? 'Bijwerken' : 'Toevoegen'}</button>
        </div>
      </div>
    </div>
  )
}
