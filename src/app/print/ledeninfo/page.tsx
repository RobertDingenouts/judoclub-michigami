import { isAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'
import QRCode from 'qrcode'
import PrintKnop from '../formulieren/PrintKnop'

export const dynamic = 'force-dynamic'

const LOGO = '/logo/logo-michigami.png'
const IBAN = 'NL13 RABO 0136 9125 08'
const MAIL = 'judoclub_michigami@hotmail.com'
const SITE = 'judoclubmichigami.nl'
const INSCHRIJF_URL = `https://${SITE}/inschrijven`

function Kop({ children }: { children: string }) {
  return <h3 className="mb-0.5 mt-3 text-[11px] font-bold">{children}</h3>
}

export default async function PrintLedeninfo() {
  if (!(await isAdmin())) redirect('/admin-login')

  const qr = await QRCode.toDataURL(INSCHRIJF_URL, { margin: 1, width: 340, color: { dark: '#2a2a2a', light: '#ffffff' } })

  return (
    <div className="min-h-screen bg-gray-200 print:bg-white">
      <style>{`@page { size: A4; margin: 0; } @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }`}</style>

      <div className="sticky top-0 z-10 flex items-center justify-between bg-[#1a1a1a] px-4 py-2.5 print:hidden">
        <a href="/admin" className="text-sm text-white hover:underline">← Terug naar dashboard</a>
        <span className="text-sm font-semibold text-white">Ledeninfo / inschrijfinfo — Judoclub Michigami</span>
        <PrintKnop label="🖨 Printen (1 vel per A4)" />
      </div>

      {/* A4-vel — zelfde opbouw als de oude flyer, maar actueel */}
      <div className="mx-auto my-6 w-[210mm] min-h-[296mm] bg-white p-[16mm] text-[#2a2a2a] shadow-lg print:my-0 print:shadow-none text-[11.5px] leading-snug">

        {/* Kop: titel links, logo rechts — zoals oud */}
        <div className="flex items-center">
          <div className="flex-1">
            <h1 className="text-[24px] font-extrabold leading-tight">Inschrijven bij<br />Judoclub Michigami</h1>
            <p className="mt-1 text-[13px] font-semibold text-[#a90000]">Judo in Steenbergen &amp; Oud-Vossemeer · 3 gratis proeflessen</p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="Judoclub Michigami" className="h-[34mm] w-[34mm]" />
        </div>
        <div className="mt-3 border-t-[3px] border-[#a90000]" />

        {/* Twee kolommen, als oud */}
        <div className="mt-1 grid grid-cols-2 gap-x-8">
          <div>
            <Kop>Lidmaatschapsbijdrage</Kop>
            <p>€42 per kwartaal, voor elk lid (of €168 voor het hele jaar). Vooraf te betalen aan het begin van elke periode.</p>

            <Kop>Eenmalige inschrijfkosten</Kop>
            <p>€15 eenmalig bij inschrijving.<br /><span className="font-semibold text-[#a90000]">Tijdelijke actie: het inschrijfgeld vervalt bij inschrijving vóór 31 december 2026!</span></p>

            <Kop>Jaarlijkse bijdrage verzekering</Kop>
            <p>€15 per jaar, voor de verzekering van de club. Te betalen bij de eerste periode van het jaar.</p>

            <Kop>Betaalgegevens en facturatie</Kop>
            <p>De betaling dient voorafgaand aan de start van elke periode voldaan te worden. Per e-mail ontvangt u een factuur met een overzicht van de kosten.</p>

            <Kop>Afmelden</Kop>
            <p>Schriftelijk, per e-mail, WhatsApp of mondeling tijdens de les; uiterlijk 1 maand voor het einde van een kwartaal. Volledige voorwaarden: {SITE}/algemene-voorwaarden</p>
          </div>

          <div>
            <Kop>Contact</Kop>
            <p>Mail: <b>{MAIL}</b><br />Web: <b>{SITE}</b><br />Of spreek na de les een bestuurslid aan:<br />
              Pascal Hack — voorzitter<br />
              Robin Hack — penningmeester · 06 34 72 29 15<br />
              Robert Dingenouts — secretaris · 06 48 64 99 12</p>

            <Kop>Bankrekening</Kop>
            <p>t.v.v. Judoclub Michigami Steenbergen<br />IBAN: <b>{IBAN}</b><br />Omschrijving: contributie + naam.</p>

            <Kop>Trainingslocaties</Kop>
            <p>Sportcentrum De Knotwilg<br />Wipstraat 2, 4651 XW Steenbergen<br /><br />
              Sporthal De Vossenkuil<br />Bou Kooijmanstraat 48, 4698 AM Oud-Vossemeer</p>

            <Kop>Trainingstijden</Kop>
            <table className="w-full border-collapse text-[11px]">
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-1 pr-2 align-top font-bold whitespace-nowrap">Vrijdag<br /><span className="font-semibold text-[#a90000]">18:45 – 19:45</span></td>
                  <td className="py-1 align-top">1e groep · 6 t/m 9 jaar<br /><span className="text-gray-600">De Knotwilg, Steenbergen</span></td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-1 pr-2 align-top font-bold whitespace-nowrap">Vrijdag<br /><span className="font-semibold text-[#a90000]">19:45 – 20:45</span></td>
                  <td className="py-1 align-top">2e groep · 9 jaar en ouder<br /><span className="text-gray-600">De Knotwilg, Steenbergen</span></td>
                </tr>
                <tr>
                  <td className="py-1 pr-2 align-top font-bold whitespace-nowrap">Woensdag<br /><span className="font-semibold text-[#a90000]">19:00 – 20:00</span></td>
                  <td className="py-1 align-top">Algemene training · alle leeftijden<br /><span className="text-gray-600">De Vossenkuil, Oud-Vossemeer</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Rood kader zoals oud: online inschrijven */}
        <div className="mt-6 flex items-center gap-5 border-[3px] border-[#a90000] p-4">
          <div className="flex-1">
            <p className="text-[16px] font-extrabold text-[#a90000]">Lid worden?</p>
            <p className="mt-1.5 text-[12.5px]">Eerst drie gratis proeflessen gevolgd? Daarna schrijven jullie je <b>uitsluitend online</b> in: scan de QR-code of ga naar<br />
              <b className="text-[14px]">{SITE}/inschrijven</b><br />
              <span className="text-[10.5px] text-gray-600">Je inschrijving komt rechtstreeks bij het bestuur binnen en je ontvangt direct een bevestiging per e-mail.</span></p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="QR-code: online inschrijven" className="h-[42mm] w-[42mm]" />
        </div>

        <p className="mt-4 text-center text-[9.5px] text-gray-400">Judoclub Michigami · Steenbergen &amp; Oud-Vossemeer · {SITE} · {MAIL}</p>
      </div>
    </div>
  )
}
