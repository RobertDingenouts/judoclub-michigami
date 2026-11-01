'use client'

import { useState } from 'react'
import { BANDEN, niveauOptiesVoor } from '@/lib/toernooien'

interface Entry {
  id: string
  naam: string
  geslacht: string
  leeftijd: number
  geboortedatum: string | null
  gewicht: number
  band: string
  niveau: string
  betaald: boolean
  opmerking: string | null
  ingediendDoor: string | null
  aangemaakt: string
}

const BAND_OPTS = BANDEN as readonly string[]
const inp = 'w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-[#a90000] focus:outline-none'

export default function ToernooienClient({ entries: initial, slug, cfg }: {
  entries: Entry[]
  slug: string
  cfg: { inschrijfgeld: number; deadlineShintai: string; deadlineLeden: string; vraagGeboortedatum?: boolean; organisator: string }
}) {
  const [entries, setEntries] = useState<Entry[]>(initial)
  const [dirty, setDirty] = useState<Record<string, boolean>>({})
  const [busy, setBusy] = useState<string>('')
  const [melding, setMelding] = useState('')
  const niveauOpts = Object.keys(niveauOptiesVoor(slug))

  function set(id: string, field: string, value: any) {
    setEntries(es => es.map(e => e.id === id ? { ...e, [field]: value } : e))
    setDirty(d => ({ ...d, [id]: true }))
  }

  async function bewaar(id: string) {
    setBusy(id)
    setMelding('')
    const e = entries.find(x => x.id === id)!
    const res = await fetch(`/api/toernooi-inschrijvingen/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        naam: e.naam, geslacht: e.geslacht, leeftijd: e.leeftijd, geboortedatum: e.geboortedatum,
        gewicht: e.gewicht, band: e.band, niveau: e.niveau, betaald: e.betaald, opmerking: e.opmerking,
      }),
    })
    const d = await res.json()
    setBusy('')
    if (d.success) {
      setDirty(dd => ({ ...dd, [id]: false }))
      setMelding(`Opgeslagen: ${e.naam}`)
    } else {
      setMelding(`Fout: ${d.error}`)
    }
  }

  async function verwijder(id: string) {
    const e = entries.find(x => x.id === id)
    if (!confirm(`${e?.naam} verwijderen uit de inschrijflijst?`)) return
    setBusy(id)
    const res = await fetch(`/api/toernooi-inschrijvingen/${id}`, { method: 'DELETE' })
    const d = await res.json()
    setBusy('')
    if (d.success) setEntries(es => es.filter(x => x.id !== id))
    else setMelding(`Fout: ${d.error}`)
  }

  async function handmatig() {
    const naam = prompt('Naam judoka (voor- en achternaam):')
    if (!naam) return
    let leeftijd = '', geboortedatum = ''
    if (cfg.vraagGeboortedatum) {
      geboortedatum = prompt('Geboortedatum (jjjj-mm-dd):') || ''
      const j = new Date(geboortedatum), t = new Date(slug.includes('yoshikwai') ? '2027-02-21' : '2026-12-13')
      let a = t.getFullYear() - j.getFullYear()
      const mm = t.getMonth() - j.getMonth()
      if (mm < 0 || (mm === 0 && t.getDate() < j.getDate())) a--
      leeftijd = String(a)
    } else {
      leeftijd = prompt('Leeftijd op toernooidag:') || ''
    }
    const gewicht = prompt('Gewicht (kg):')
    const geslacht = prompt('Geslacht (Man/Vrouw):')
    const band = prompt('Bandkleur (Wit/Geel/Oranje/Groen/Blauw/Bruin/Zwart):')
    const niveau = prompt(`Niveau (${Object.keys(niveauOptiesVoor(slug)).join('/')}):`)
    const betaaldStr = prompt('Inschrijfgeld al voldaan? (ja/nee):')
    setBusy('nieuw')
    const res = await fetch('/api/toernooi-inschrijvingen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toernooi: slug, naam, geslacht, leeftijd, geboortedatum, gewicht, band, niveau, betaald: betaaldStr === 'ja' }),
    })
    const d = await res.json()
    setBusy('')
    if (d.success && d.entry) {
      setEntries(es => [...es, { ...d.entry, aangemaakt: d.entry.aangemaakt }].sort((a, b) => a.leeftijd - b.leeftijd || a.naam.localeCompare(b.naam)))
      setMelding(`Toegevoegd: ${d.entry.naam}`)
    } else {
      setMelding(`Fout: ${d.error}`)
    }
  }

  const betaaldAantal = entries.filter(e => e.betaald).length
  const totaal = entries.length * cfg.inschrijfgeld

  return (
    <div className="space-y-4">
      {/* Statistieken */}
      <div className="flex flex-wrap gap-3">
        <Stat label="Deelnemers" value={String(entries.length)} />
        <Stat label={`Betaald (€ ${cfg.inschrijfgeld})`} value={`${betaaldAantal} / ${entries.length}`} />
        <Stat label="Totaal in te zamelen" value={`€ ${totaal.toFixed(2)}`} />
        <button onClick={handmatig} disabled={busy === 'nieuw'}
          className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-[#a90000] hover:text-[#a90000]">
          ＋ Handmatig toevoegen
        </button>
      </div>

      <p className="text-xs text-gray-500">
        Leden schrijven in via <a className="text-[#a90000]" href={`/toernooi/${slug === 'kersttoernooi-shintai-2026' ? 'kersttoernooi-2026' : 'pre-tornooi-2027'}`}>/toernooi/…</a>.
        Foute invullingen hier rechtzetten en Bewaar drukken. Inleverformulier = knop rechtsboven (exact formaat van de organisator).
        Interne deadline leden: {cfg.deadlineLeden} · Inleveren bij {cfg.organisator} uiterlijk: {cfg.deadlineShintai}.
      </p>

      {melding && <p className="rounded-xl bg-[#f5f5f0] border border-gray-200 px-4 py-2 text-sm text-[#2a2a2a]">{melding}</p>}

      {/* Tabel */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="bg-[#a90000] text-white">
              <th className="px-3 py-2 text-left">Ingeschreven</th>
              <th className="px-3 py-2 text-left">Naam judoka</th>
              <th className="px-2 py-2 text-left">M/V</th>
              <th className="px-2 py-2 text-left">Leeft.</th>
              <th className="px-2 py-2 text-left">Gewicht</th>
              <th className="px-2 py-2 text-left">Band</th>
              <th className="px-2 py-2 text-left">Niveau</th>
              {cfg.vraagGeboortedatum && <th className="px-2 py-2 text-left">Geb.datum</th>}
              <th className="px-2 py-2 text-left">€</th>
              <th className="px-3 py-2 text-left">Opmerking</th>
              <th className="px-3 py-2 text-right">Acties</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={e.id} className={`border-t border-gray-100 ${dirty[e.id] ? 'bg-yellow-50' : i % 2 ? 'bg-gray-50/50' : ''}`}>
                <td className="px-3 py-2 whitespace-nowrap text-gray-500 text-xs">
                  {new Date(e.aangemaakt).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  {e.ingediendDoor && <div className="text-[10px]">{e.ingediendDoor}</div>}
                </td>
                <td className="px-3 py-1"><input className={inp} value={e.naam} onChange={ev => set(e.id, 'naam', ev.target.value)} /></td>
                <td className="px-2 py-1">
                  <select className={inp} value={e.geslacht} onChange={ev => set(e.id, 'geslacht', ev.target.value)}>
                    <option>Man</option><option>Vrouw</option>
                  </select>
                </td>
                <td className="px-2 py-1"><input className={inp + ' w-16'} type="number" value={e.leeftijd} onChange={ev => set(e.id, 'leeftijd', Number(ev.target.value))} /></td>
                <td className="px-2 py-1"><input className={inp + ' w-20'} type="number" step="0.5" value={e.gewicht} onChange={ev => set(e.id, 'gewicht', Number(ev.target.value))} /></td>
                <td className="px-2 py-1">
                  <select className={inp} value={e.band} onChange={ev => set(e.id, 'band', ev.target.value)}>
                    {BAND_OPTS.map(b => <option key={b}>{b}</option>)}
                  </select>
                </td>
                <td className="px-2 py-1">
                  <select className={inp} value={e.niveau} onChange={ev => set(e.id, 'niveau', ev.target.value)}>
                    {niveauOpts.map(n => <option key={n}>{n}</option>)}
                  </select>
                </td>
                {cfg.vraagGeboortedatum && (
                  <td className="px-2 py-1"><input className={inp + ' w-32'} type="date" value={e.geboortedatum || ''} onChange={ev => set(e.id, 'geboortedatum', ev.target.value || null)} /></td>
                )}
                <td className="px-2 py-1 text-center">
                  <input type="checkbox" className="accent-[#a90000] w-4 h-4" checked={e.betaald} onChange={ev => set(e.id, 'betaald', ev.target.checked)} />
                </td>
                <td className="px-3 py-1"><input className={inp} value={e.opmerking || ''} onChange={ev => set(e.id, 'opmerking', ev.target.value)} /></td>
                <td className="px-3 py-1 text-right whitespace-nowrap">
                  <button onClick={() => bewaar(e.id)} disabled={!dirty[e.id] || busy === e.id}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold ${dirty[e.id] ? 'bg-[#a90000] text-white hover:bg-[#8c0000]' : 'bg-gray-100 text-gray-400'}`}>
                    Bewaar
                  </button>
                  <button onClick={() => verwijder(e.id)} disabled={busy === e.id}
                    className="ml-2 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-bold text-gray-600 hover:border-red-500 hover:text-red-600">
                    ✕
                  </button>
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr><td colSpan={cfg.vraagGeboortedatum ? 11 : 10} className="px-4 py-8 text-center text-gray-400">Nog geen inschrijvingen — deel de link met leden.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-bold text-[#2a2a2a]">{value}</div>
    </div>
  )
}
