'use client'

import { useEffect, useState } from 'react'
import { BANDEN, niveauOptiesVoor, type ToernooiConfig } from '@/lib/toernooien'

function bandNaam(currentBelt: string | null | undefined): string {
  if (!currentBelt) return ''
  const b = currentBelt.toUpperCase()
  if (b.startsWith('BRUIN')) return 'Bruin'
  if (b.startsWith('ZWAR')) return 'Zwart'
  const hit = (BANDEN as readonly string[]).find(x => x.toUpperCase() === b)
  return hit || ''
}

function geslachtNorm(g: string | null | undefined): string {
  if (!g) return ''
  const s = g.toLowerCase()
  if (s.startsWith('m')) return 'Man'
  if (s.startsWith('v')) return 'Vrouw'
  return ''
}

function leeftijdOp(dob: string, op: Date): number | null {
  const d = new Date(dob)
  if (isNaN(d.getTime())) return null
  let age = op.getFullYear() - d.getFullYear()
  const m = op.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && op.getDate() < d.getDate())) age--
  return age >= 0 ? age : null
}

export default function ToernooiInschrijfForm({ cfg, slug, headerEmoji = '🥋' }: {
  cfg: Omit<ToernooiConfig, 'deadlineShintai'> // interne inleverdatum blijft op de server
  slug: string
  headerEmoji?: string
}) {
  const [naam, setNaam] = useState('')
  const [geslacht, setGeslacht] = useState('')
  const [geboortedatum, setGeboortedatum] = useState('')
  const [leeftijd, setLeeftijd] = useState('')
  const [gewicht, setGewicht] = useState('')
  const [band, setBand] = useState('')
  const [niveau, setNiveau] = useState('')
  const [betaald, setBetaald] = useState(false)
  const [opmerking, setOpmerking] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [fout, setFout] = useState('')
  const [ingelogdNaam, setIngelogdNaam] = useState('')

  const niveauOpts = niveauOptiesVoor(slug)
  const toernooiDate = new Date(cfg.toernooidatumISO)

  // Logen we? Dan naam/geslacht/gebdatum/leeftijd/band alvast invullen.
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (!d?.authenticated) return
        const m = d.user?.member
        const eerste = m?.firstName || d.user?.name || ''
        const laatste = m?.lastName || ''
        if (eerste) {
          setNaam(`${eerste} ${laatste}`.trim())
          setIngelogdNaam(`${eerste} ${laatste}`.trim())
        }
        if (m?.gender) setGeslacht(geslachtNorm(m.gender))
        if (m?.dateOfBirth) {
          const iso = new Date(m.dateOfBirth).toISOString().slice(0, 10)
          setGeboortedatum(iso)
          const a = leeftijdOp(m.dateOfBirth, toernooiDate)
          if (a !== null) setLeeftijd(String(a))
        }
        const b = bandNaam(d.user?.currentBelt || m?.currentBelt)
        if (b) setBand(b)
      })
      .catch(() => { /* niet ingelogd — gewoon leeg formulier */ })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  function onGeboortedatum(v: string) {
    setGeboortedatum(v)
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      const a = leeftijdOp(v, toernooiDate)
      if (a !== null) setLeeftijd(String(a))
    }
  }

  async function verstuur(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setFout('')
    try {
      const res = await fetch('/api/toernooi-inschrijvingen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toernooi: slug, naam, geslacht, leeftijd, geboortedatum, gewicht, band, niveau, betaald, opmerking,
        }),
      })
      const d = await res.json()
      if (d.success) {
        setStatus('sent')
      } else {
        setStatus('error')
        setFout(d.error || 'Er ging iets mis')
      }
    } catch {
      setStatus('error')
      setFout('Verbinding mislukt — probeer het opnieuw')
    }
  }

  if (status === 'sent') {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <div className="rounded-2xl border border-[#a90000]/20 bg-white p-8 shadow-sm text-center">
          <div className="text-5xl mb-4">🥋✅</div>
          <h1 className="text-2xl font-bold text-[#2a2a2a]">Ingeschreven!</h1>
          <p className="mt-3 text-gray-600">
            We nemen <strong>{naam}</strong> op in de clublijst voor {cfg.titel} op {cfg.datum}.
            We geven alle inschrijvingen in één keer namens de club door aan {cfg.organisator}.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Iets fout ingevuld of toch niet mee? Mail <a className="text-[#a90000] font-semibold" href="mailto:judoclub_michigami@hotmail.com">judoclub_michigami@hotmail.com</a>, dan passen we het aan.
          </p>
          <a href="/" className="inline-block mt-6 rounded-xl bg-[#a90000] px-5 py-2.5 text-white font-semibold hover:bg-[#8c0000]">Terug naar de site</a>
        </div>
      </div>
    )
  }

  const veld = 'w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-[#a90000] focus:outline-none'

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Info */}
      <div className="rounded-2xl bg-[#f5f5f0] border border-gray-200 p-6 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#2a2a2a]">{headerEmoji} {cfg.titel}</h1>
        <p className="mt-2 text-gray-700"><strong>{cfg.datum}</strong> · {cfg.locatie}</p>
        <ul className="mt-3 space-y-1 text-sm text-gray-600">
          {cfg.infoRegels.map((regel, i) => (
            <li key={i}>{regel.replace('{bedrag}', cfg.inschrijfgeld.toFixed(2))}</li>
          ))}
          {cfg.iban && <li>💳 Storten op IBAN <strong className="select-all">{cfg.iban}</strong> t.n.v. Judoclub Michigami.</li>}
          <li>✍️ Bij de overschrijving vermelden: <strong>{cfg.betalingskenmerk}</strong>. De club maakt het totaal in één keer over naar {cfg.organisator}.</li>
          <li>📅 Inschrijven via ons t/m <strong>{cfg.deadlineLeden}</strong> — daarna gaan we de clublijst naar {cfg.organisator} sturen, dus wees er op tijd bij</li>
        </ul>
        <p className="mt-3 text-sm text-[#a90000] font-semibold">Alleen voor leden van Judoclub Michigami.</p>
      </div>

      {cfg.waarschuwing && (
        <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>⚠️ Goed om te weten:</strong> {cfg.waarschuwing}
        </div>
      )}

      {ingelogdNaam && (
        <p className="mb-4 text-sm text-gray-500">
          Ingelogd als <strong>{ingelogdNaam}</strong> — gegevens zijn alvast ingevuld. Gaat het om een ander gezinslid? Pas de velden aan.
        </p>
      )}

      {/* Formulier */}
      <form onSubmit={verstuur} className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <label className="block text-sm font-semibold text-[#2a2a2a] mb-1">Naam judoka (voor- en achternaam) *</label>
          <input className={veld} required value={naam} onChange={e => setNaam(e.target.value)} placeholder="bijv. Vive Dingenouts" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-[#2a2a2a] mb-1">Geslacht *</label>
            <div className="flex gap-2">
              {['Man', 'Vrouw'].map(g => (
                <button key={g} type="button" onClick={() => setGeslacht(g)}
                  className={`flex-1 rounded-xl border px-4 py-2.5 font-medium ${geslacht === g ? 'border-[#a90000] bg-[#a90000] text-white' : 'border-gray-300 text-gray-700 hover:border-[#a90000]'}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          {cfg.vraagGeboortedatum ? (
            <div>
              <label className="block text-sm font-semibold text-[#2a2a2a] mb-1">Geboortedatum *</label>
              <input className={veld} required type="date" min="2005-01-01" max={cfg.toernooidatumISO} value={geboortedatum} onChange={e => onGeboortedatum(e.target.value)} />
              <p className="mt-1 text-xs text-gray-500">De leeftijdscategorie wordt automatisch bepaald op deze datum{leeftijd ? ` — je wordt ${leeftijd} jaar op de toernooidag` : ''}.</p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-[#2a2a2a] mb-1">Leeftijd op {cfg.leeftijdDatumLabel} *</label>
              <input className={veld} required type="number" min={4} max={70} value={leeftijd} onChange={e => setLeeftijd(e.target.value)} placeholder="jaar" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-[#2a2a2a] mb-1">Gewicht (kg) *</label>
            <input className={veld} required type="number" step="0.5" min={10} max={200} value={gewicht} onChange={e => setGewicht(e.target.value)} placeholder="bijv. 32" />
            <p className="mt-1 text-xs text-gray-500">Zo exact mogelijk — dat helpt bij het maken van de poules.</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#2a2a2a] mb-1">Bandkleur *</label>
            <select className={veld} required value={band} onChange={e => setBand(e.target.value)}>
              <option value="">Kies band</option>
              {BANDEN.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#2a2a2a] mb-2">{cfg.vraagGeboortedatum ? 'In welke categorie wil de judoka meedoen? *' : 'Niveau — hoe ervaring heeft de judoka? *'}</label>
          <div className="space-y-2">
            {Object.entries(niveauOpts).map(([k, desc]) => (
              <label key={k} className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer ${niveau === k ? 'border-[#a90000] bg-[#a90000]/5' : 'border-gray-300'}`}>
                <input type="radio" name="niveau" className="mt-1 accent-[#a90000]" checked={niveau === k} onChange={() => setNiveau(k)} />
                <span className="text-sm text-gray-700"><strong>{k}</strong> — {desc}</span>
              </label>
            ))}
          </div>
        </div>

        <label className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer ${betaald ? 'border-[#a90000] bg-[#a90000]/5' : 'border-gray-300'}`}>
          <input type="checkbox" className="mt-1 accent-[#a90000]" checked={betaald} onChange={e => setBetaald(e.target.checked)} />
          <span className="text-sm text-gray-700">Ik heb de € {cfg.inschrijfgeld.toFixed(2)} inschrijfgeld overgemaakt naar Judoclub Michigami{cfg.iban ? ` (${cfg.iban})` : ''} en daarbij <strong>{cfg.betalingskenmerk}</strong> vermeld.<br /><span className="text-gray-500">Nog niet overgemaakt? Vink het niet af — dan houden we het bij, maar het geld moet er wel zijn vóór de deadline.</span></span>
        </label>

        <div>
          <label className="block text-sm font-semibold text-[#2a2a2a] mb-1">Opmerking (optioneel)</label>
          <textarea className={veld} rows={2} value={opmerking} onChange={e => setOpmerking(e.target.value)} placeholder="bijv. extra info voor de trainer" />
        </div>

        {/* Honeypot voor bots — mensen zien dit veld niet */}
        <input type="text" name="firmenaam" className="hidden" tabIndex={-1} autoComplete="off" />

        {fout && <p className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{fout}</p>}

        <button type="submit" disabled={status === 'sending' || !geslacht || !niveau || !band || (cfg.vraagGeboortedatum && !geboortedatum)}
          className="w-full rounded-xl bg-[#a90000] py-3 text-white font-bold text-lg hover:bg-[#8c0000] disabled:opacity-50">
          {status === 'sending' ? 'Versturen…' : 'Inschrijven 🥋'}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-gray-400">Vragen? judoclub_michigami@hotmail.com</p>
    </div>
  )
}
