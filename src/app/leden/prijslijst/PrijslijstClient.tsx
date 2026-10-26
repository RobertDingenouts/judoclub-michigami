'use client'

import { useEffect, useMemo, useState } from 'react'
import { useT } from '@/i18n/LangContext'
import { PRICE_PRODUCTS, CLUB_PRICE_META, fmtEuro, fmtClubEuro } from '@/data/price-list'

// Bestellingen gaan via WhatsApp naar Pascal (materiaalbeheer).
const PASCAL_WA_NUMMER = '31615662630'

// Print-matrix: alleen het getal (€ staat in de rijkop) — houdt de kolommen smal
const BAND_KEY = 'band'

interface Selectie {
  label: string   // NL-productnaam + maat — bestelling is Nederlandstalig (Pascal leest mee)
  prijs: number
}

export function PrijslijstClient() {
  const { t } = useT()
  const [sel, setSel] = useState<Set<string>>(new Set())
  const [naam, setNaam] = useState<string>('')

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const u = d?.user
        if (!u) return
        const volledige = u.member?.firstName ? `${u.member.firstName} ${u.member.lastName || ''}`.trim() : u.name
        if (volledige) setNaam(volledige)
      })
      .catch(() => {})
  }, [])

  const toggle = (key: string) => {
    setSel((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const bestelling: Selectie[] = useMemo(() => {
    const items: Selectie[] = []
    for (const p of PRICE_PRODUCTS) {
      for (const r of p.rows) {
        const key = `${p.id}:${r.maat}`
        if (sel.has(key)) items.push({ label: `${p.name} — maat ${r.maat} cm`, prijs: r.club })
      }
    }
    if (sel.has(BAND_KEY)) items.push({ label: 'Budo band — kleur in overleg met leraar', prijs: CLUB_PRICE_META.bandClubPrijs })
    return items
  }, [sel])

  const totaal = bestelling.reduce((s, i) => s + i.prijs, 0)

  function openWhatsApp() {
    const regels = bestelling.map((i) => `• ${i.label} (${fmtEuro(i.prijs)})`).join('\n')
    const bericht =
      `Hoi Pascal, hier ${naam || 'een lid'} van Judoclub Michigami. Ik wil graag het volgende bestellen:\n` +
      `${regels}\nTotaal: ${fmtEuro(totaal)}\nAlvast bedankt!`
    window.open(`https://wa.me/${PASCAL_WA_NUMMER}?text=${encodeURIComponent(bericht)}`, '_blank', 'noopener')
  }

  const selBtn = (key: string) => (
    <button
      onClick={() => toggle(key)}
      aria-pressed={sel.has(key)}
      className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-sm font-bold transition-colors print:hidden ${
        sel.has(key)
          ? 'border-[#a90000] bg-[#a90000] text-white'
          : 'border-gray-300 text-gray-400 hover:border-[#a90000] hover:text-[#a90000]'
      }`}
    >
      {sel.has(key) ? '✓' : '+'}
    </button>
  )

  const splitHead = (key: string) => {
    const w = t(key).split(' ')
    return (<>{w[0]}<br />{w.slice(1).join(' ')}</>)
  }

  const printProductBlock = (p: (typeof PRICE_PRODUCTS)[number], fotoKlasse = "printfoto h-[54mm] w-auto max-w-[52mm] object-contain") => (
    <div className="mb-3 flex break-inside-avoid items-center gap-4">
      <div className="flex w-[52mm] shrink-0 flex-col items-center text-center">
        <img src={p.photo} alt={p.name} className={fotoKlasse} />
        <div className="mt-1.5 text-[9.5pt] font-bold leading-tight text-[#2a2a2a]">{t(p.name)}</div>
        <div className="mt-0.5 text-[8pt] italic leading-tight text-gray-500">{t(p.desc)}</div>
      </div>
      <table className="print-vertical min-w-0 flex-1 border-collapse">
        <thead>
          <tr>
            <th>{t('Maat')}</th>
            <th>{splitHead('Prijs internet')}</th>
            <th>{splitHead('Prijs bij vereniging')}</th>
          </tr>
        </thead>
        <tbody>
          {p.rows.map((r) => (
            <tr key={r.maat}>
              <td>{r.maat} cm</td>
              <td>{fmtEuro(r.web)}</td>
              <td className="font-bold text-[#a90000]">{fmtClubEuro(r.club)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <>
      {/* Compacte print/PDF-versie: 2 A4-tjes, design gespiegeld aan huisstijl */}
      <div className="prijslijst-print hidden print:block">
        <div className="mb-3 grid grid-cols-2 gap-3">
          {[
            ['Eerste keer?', 'Je hebt een judopak en een paarse band nodig. Wij beginnen met de paarse band — de witte band behaal je bij je eerste examen.'],
            ['Volgende banden', 'De band voor je nieuwe graad betaal je bij het examen; na het examen krijg je die meteen uitgereikt.'],
            ['Welke maat?', 'We meten de lengte van de judoka en ronden naar boven af. Ben je 153 cm lang? Dan is maat 160 de juiste keuze.'],
            ['Kwaliteit', 'Het Juvo-pak is van gewafeld katoen — stevig en goed vast te grijpen. De goedkope, gladde pakken die online verkrijgbaar zijn, raden we af.'],
          ].map(([kopt, tekst]) => (
            <div key={kopt} className="print-card">
              <div className="mb-0.5 text-[9.5pt] font-bold text-[#a90000]">{t(kopt)}</div>
              <div className="text-[8.8pt] leading-snug text-gray-700">{t(tekst)}</div>
            </div>
          ))}
        </div>

        <div className="print-h2 mb-2">{t('Wit · gewafeld katoen')}</div>
        {printProductBlock(PRICE_PRODUCTS[0], "printfoto h-[62mm] w-auto max-w-[52mm] object-contain")}

        <div className="mb-1.5 mt-1 print-h2">{t('Budo band — elke kleur')}</div>
        <div className="mb-3 break-inside-avoid print-card flex items-center gap-3">
          <img src={CLUB_PRICE_META.bandFoto} alt="Budo band" className="printfoto h-[24mm] w-auto max-w-[52mm] object-contain" />
          <p className="min-w-0 flex-1 text-[8.8pt] leading-snug text-gray-700">{t('Voor elke bandgraad, in alle lengtes (150–330 cm). De juiste lengte bepaal je samen met je leraar. Nieuwe leden starten met een paarse band.')}</p>
          <table className="print-vertical band-tabel border-collapse">
            <thead><tr><th>{splitHead('Prijs internet')}</th><th>{splitHead('Prijs bij vereniging')}</th></tr></thead>
            <tbody><tr><td>{fmtEuro(CLUB_PRICE_META.bandWebPrijs)}</td><td className="font-bold text-[#a90000]">{fmtClubEuro(CLUB_PRICE_META.bandClubPrijs)}</td></tr></tbody>
          </table>
        </div>

        <div className="mb-3 break-inside-avoid print-card">
          <div className="mb-0.5 text-[9.5pt] font-bold text-[#a90000]">{t('Bestellen')}</div>
          <div className="text-[8.8pt] leading-snug text-gray-700">{t('Bestel via de knop op de ledenpagina (WhatsApp) of geef maat en kleur door aan je leraar. Wij nemen je pakket vervolgens mee naar de club.')} {t('Alle prijzen zijn inclusief btw. Prijzen geldig vanaf oktober 2026.')}</div>
        </div>

        {/* Pagina 2: wedstrijdpakken */}
        <div className="print-pagina-2">
          <div className="print-h2 mb-1">{t('Wedstrijdpakken (semi)')}</div>
          <p className="mb-3 text-[9pt] leading-snug text-gray-700">{t('Voor de wat fanatiekere judoka: een semi wedstrijdpak is van zwaardere, degelijkere kwaliteit dan het Juvo-pak en geschikt voor wedstrijden.')} {t('Verkrijgbaar in wit én blauw — net als op officiële wedstrijden.')}</p>
          {printProductBlock(PRICE_PRODUCTS[1])}
          {printProductBlock(PRICE_PRODUCTS[2])}
          <p className="mt-2 text-[8.5pt] leading-snug text-gray-500">{t('De club koopt judopakken en banden rechtstreeks in bij Matsuru en verkoopt ze door aan leden. Je betaalt minder dan de webprijs en je bespaart de verzendkosten.')}</p>
        </div>
      </div>

      {/* Producttabellen (scherm) */}
      <div className="space-y-6 print:hidden">
      {PRICE_PRODUCTS.map((p) => (
        <div key={p.id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm break-inside-avoid">
          <div className="mb-3 flex items-start gap-4">
            <img src={p.photo} alt={t(p.name)} className="h-28 w-auto max-w-[38%] rounded-md border border-gray-100 bg-white object-contain" />
            <div>
              <h2 className="text-lg font-semibold text-[#2a2a2a]">{t(p.name)}</h2>
              <p className="mt-1 text-sm text-gray-500">{t(p.desc)}</p>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="py-2 pr-2">{t('Maat')}</th>
                <th className="py-2 pr-2 text-right">{t('Webprijs')}</th>
                <th className="py-2 pr-2 text-right">{t('Clubprijs')}</th>
                <th className="w-10 py-2 pl-2 text-right print:hidden"><span className="sr-only">{t('Selecteer')}</span></th>
              </tr>
            </thead>
            <tbody>
              {p.rows.map((r) => (
                <tr key={r.maat} className="border-b border-gray-100 last:border-0">
                  <td className="py-2 pr-2 text-gray-700">{r.maat} cm</td>
                  <td className="py-2 pr-2 text-right text-gray-400 line-through decoration-gray-300">{fmtEuro(r.web)}</td>
                  <td className="py-2 pr-2 text-right font-semibold text-[#a90000]">{fmtClubEuro(r.club)}</td>
                  <td className="py-2 pl-2 text-right">{selBtn(`${p.id}:${r.maat}`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* Band */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm break-inside-avoid">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <img src={CLUB_PRICE_META.bandFoto} alt="Budo band" className="h-16 w-auto rounded-md border border-gray-100 object-contain" />
            <div>
            <h2 className="text-lg font-semibold text-[#2a2a2a]">{t('Budo band — elke kleur')}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {t('Voor elke bandgraad, in alle lengtes (150–330 cm). De juiste lengte bepaal je samen met je leraar. Nieuwe leden starten met een paarse band.')}
            </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-400 line-through">{fmtEuro(CLUB_PRICE_META.bandWebPrijs)}</p>
              <p className="text-2xl font-bold text-[#a90000]">{fmtClubEuro(CLUB_PRICE_META.bandClubPrijs)}</p>
            </div>
            {selBtn(BAND_KEY)}
          </div>
        </div>
      </div>

      </div>

      {/* Bestelbalk: verschijnt zodra er iets geselecteerd is */}
      {bestelling.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4 print:hidden">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3 rounded-2xl bg-[#1a1a1a] px-4 py-3 text-white shadow-2xl">
            <span className="text-sm">
              {bestelling.length} × {t('geselecteerd')} · {t('Totaal')}: <strong>{fmtEuro(totaal)}</strong>
            </span>
            <button
              onClick={openWhatsApp}
              className="rounded-xl bg-[#25D366] px-4 py-2 text-sm font-bold text-[#07351b] transition-colors hover:bg-[#1ebe5b]"
            >
              <span aria-hidden>💬</span> {t('Bestel via WhatsApp')}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
