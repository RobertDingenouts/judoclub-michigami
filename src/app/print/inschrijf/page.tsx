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

// Autoritatief: src/data/schedule.ts + src/data/legal.ts (bedragen)
const LESTIJDEN = [
  { dag: 'Woensdag', tijd: '19:00 – 20:00', groep: 'Algemene training · alle leeftijden', locatie: 'Dorpshuis De Vossenkuil, Oud-Vossemeer' },
  { dag: 'Vrijdag', tijd: '18:45 – 19:45', groep: '1e groep · 6 t/m 9 jaar', locatie: 'Sporthal De Knotwilg, Steenbergen' },
  { dag: 'Vrijdag', tijd: '19:45 – 20:45', groep: '2e groep · 9 jaar en ouder', locatie: 'Sporthal De Knotwilg, Steenbergen' },
]

function Veld({ label, breed = '' }: { label: string; breed?: string }) {
  return (
    <div className={`${breed} flex flex-col`}>
      <span className="text-[9px] font-semibold uppercase tracking-wide text-gray-500">{label}</span>
      <span className="mt-[14px] border-b border-gray-400" />
    </div>
  )
}

function Z({ children }: { children: string }) {
  return <h2 className="mb-1.5 mt-3 text-[12px] font-bold uppercase tracking-wide text-[#a90000] border-b-2 border-[#a90000] pb-0.5">{children}</h2>
}

export default async function PrintInschrijf() {
  if (!(await isAdmin())) redirect('/admin-login')

  const qr = await QRCode.toDataURL(INSCHRIJF_URL, { margin: 1, width: 300, color: { dark: '#2a2a2a', light: '#ffffff' } })

  return (
    <div className="min-h-screen bg-gray-200 print:bg-white">
      <style>{`@page { size: A4; margin: 0; } @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }`}</style>

      {/* Toolbar — niet op de print */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-[#1a1a1a] px-4 py-2.5 print:hidden">
        <a href="/admin" className="text-sm text-white hover:underline">← Terug naar dashboard</a>
        <span className="text-sm font-semibold text-white">Inschrijfformulier — Judoclub Michigami</span>
        <PrintKnop label="🖨 Printen (1 vel per A4)" />
      </div>

      {/* Het A4-vel */}
      <div className="mx-auto my-6 w-[210mm] min-h-[296mm] bg-white p-[11mm] text-[#2a2a2a] shadow-lg print:my-0 print:shadow-none text-[11px] leading-snug">

        {/* Kop */}
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="Judoclub Michigami" className="h-[24mm] w-[24mm]" />
          <div className="flex-1">
            <h1 className="text-[26px] font-extrabold tracking-tight leading-none">INSCHRIJFFORMULIER</h1>
            <p className="mt-1 text-[13px] font-semibold text-[#a90000]">Judoclub Michigami — Steenbergen &amp; Oud-Vossemeer</p>
            <p className="mt-0.5 text-[10px] text-gray-500">Judo voor jong en oud · 3 gratis proeflessen, uiteraard vooraf mogelijk</p>
          </div>
          <div className="w-[46mm]">
            <Veld label="Datum (uitgedeeld)" />
          </div>
        </div>
        <div className="mt-3 border-t-[3px] border-[#a90000]" />

        {/* Lestijden + kosten naast elkaar */}
        <div className="mt-2 grid grid-cols-[1.15fr_1fr] gap-5">
          <div>
            <Z>Lestijden &amp; locaties</Z>
            <table className="w-full border-collapse text-[10.5px]">
              <tbody>
                {LESTIJDEN.map((l, i) => (
                  <tr key={i} className={i < LESTIJDEN.length - 1 ? 'border-b border-gray-200' : ''}>
                    <td className="py-1 pr-2 align-top whitespace-nowrap font-bold">{l.dag}<br /><span className="font-semibold text-[#a90000]">{l.tijd}</span></td>
                    <td className="py-1 pr-2 align-top">{l.groep}</td>
                    <td className="py-1 align-top text-gray-600">{l.locatie}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Z>Welke groep kies ik?</Z>
            <p className="text-[9.5px] text-gray-500 mb-1">Kruis aan wat je in eerste instantie wilt volgen — op de site is dit later altijd aan te passen.</p>
            <div className="space-y-1 text-[11px]">
              <p><span className="mr-1.5 inline-block h-[11px] w-[11px] border border-gray-500 align-middle" /> Vrijdag 18:45 — 1e groep (6 t/m 9 jaar), De Knotwilg</p>
              <p><span className="mr-1.5 inline-block h-[11px] w-[11px] border border-gray-500 align-middle" /> Vrijdag 19:45 — 2e groep (9 jaar en ouder), De Knotwilg</p>
              <p><span className="mr-1.5 inline-block h-[11px] w-[11px] border border-gray-500 align-middle" /> Woensdag 19:00 — algemene training (alle leeftijden), De Vossenkuil</p>
            </div>
          </div>

          <div>
            <Z>Kosten</Z>
            <div className="border border-gray-300 p-2 text-[10.5px] space-y-1">
              <p><b>Contributie:</b> €42 per kwartaal (€168 per jaar), vooraf te betalen aan het begin van elke periode.</p>
              <p><b>Eenmalig inschrijfgeld:</b> €15 · <span className="font-semibold text-[#a90000]">Actie: gratis bij inschrijving vóór 31-12-2026!</span></p>
              <p><b>Jaarlijkse clubbijdrage (verzekering):</b> €15, te betalen bij de eerste periode van het jaar.</p>
              <p className="text-gray-600">Overmaken op <b>{IBAN}</b> t.n.v. Judoclub Michigami Steenbergen, omt. “contributie + naam”. Factuur volgt per e-mail.</p>
            </div>
            <p className="mt-1.5 text-[9.5px] text-gray-600">Afmelden kan per e-mail, WhatsApp of mondeling tijdens de les, uiterlijk 1 maand voor het einde van een kwartaal. Volledige voorwaarden: {SITE}/algemene-voorwaarden</p>
          </div>
        </div>

        {/* Gegevens */}
        <Z>Gegevens nieuw lid</Z>
        <div className="grid grid-cols-2 gap-x-5 gap-y-1">
          <Veld label="Naam (voorletters + achternaam)" />
          <Veld label="Geboortedatum" />
          <Veld label="Adres + huisnummer" />
          <Veld label="Postcode + woonplaats" />
          <Veld label="Telefoon (lid / ouder)" />
          <Veld label="E-mail (voor facturen en berichtgeving)" />
        </div>

        <div className="mt-2 grid grid-cols-2 gap-5">
          <div>
            <Z>Noodcontact &amp; medisch</Z>
            <div className="space-y-1">
              <Veld label="Naam noodcontact" />
              <Veld label="Telefoon noodcontact" />
              <Veld label="Medische bijzonderheden (eventueel)" />
            </div>
          </div>
          <div>
            <Z>Toestemmingen</Z>
            <div className="space-y-1.5 text-[10.5px]">
              <p><span className="mr-1.5 inline-block h-[11px] w-[11px] border border-gray-500 align-middle" /> Ik ga akkoord met de algemene voorwaarden van Judoclub Michigami.</p>
              <p><span className="mr-1.5 inline-block h-[11px] w-[11px] border border-gray-500 align-middle" /> Foto’s en video van mij (of mijn kind) mogen gebruikt worden voor clubpromotie. <span className="text-gray-500">(niet akkoord? laat dit hokje leeg)</span></p>
              <p><span className="mr-1.5 inline-block h-[11px] w-[11px] border border-gray-500 align-middle" /> Ik wil per e-mail op de hoogte gehouden worden van clubnieuws en activiteiten.</p>
              <p className="text-[9.5px] text-gray-500">Je gegevens worden uitsluitend intern gebruikt voor clubbeheer en contributiefacturen, en nooit aan derden verstrekt.</p>
            </div>
          </div>
        </div>

        {/* Handtekening */}
        <div className="mt-2 grid grid-cols-2 gap-5">
          <div>
            <Veld label="Handtekening lid / ouder of voogd (minderjarigen)" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Veld label="Plaats" />
            <Veld label="Datum" />
          </div>
        </div>

        {/* Voet: QR + contact */}
        <div className="mt-3 border-t-[3px] border-[#a90000] pt-2 flex gap-4 items-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="QR-code: online inschrijven" className="h-[30mm] w-[30mm]" />
          <div className="flex-1 text-[10.5px]">
            <p className="font-bold text-[#a90000] text-[12px]">Lid worden? Kan ook meteen online!</p>
            <p className="mt-0.5">Scan de QR-code of ga naar <b>{SITE}/inschrijven</b> — je inschrijving komt rechtstreeks bij het bestuur binnen en je ontvangt direct een bevestiging per e-mail.</p>
            <p className="mt-1.5"><b>Vragen?</b> Mail {MAIL} of spreek na de les een bestuurslid aan:<br />
              Pascal Hack (voorzitter) · Robin Hack (penningmeester, 06 34 72 29 15) · Robert Dingenouts (secretaris, 06 48 64 99 12)</p>
          </div>
          <div className="text-right text-[9px] text-gray-400">
            <p>{SITE}</p>
            <p>Judoclub Michigami · Steenbergen &amp; Oud-Vossemeer</p>
          </div>
        </div>

        {/* Club-intern vak */}
        <div className="mt-2 border border-dashed border-gray-300 p-1.5 text-[9px] text-gray-500 flex justify-between">
          <span>Club-intern: ingevoerd op {SITE} op: ____________ · door: ____________ · groep: ____________</span>
          <span>Exemplaar: club</span>
        </div>
      </div>
    </div>
  )
}
