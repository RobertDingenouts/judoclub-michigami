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

      {/* A4-vel — opbouw en formuleringen zoals de originele flyer */}
      <div className="mx-auto my-6 w-[210mm] min-h-[296mm] bg-white p-[16mm] text-[#2a2a2a] shadow-lg print:my-0 print:shadow-none text-[11.5px] leading-snug">

        {/* Kop: titel links, logo rechts — zoals origineel */}
        <div className="flex items-center">
          <div className="flex-1">
            <h1 className="text-[23px] font-extrabold leading-tight">Inschrijven<br />Judoclub Michigami<br />Steenbergen &amp; Oud-Vossemeer</h1>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="Judoclub Michigami" className="h-[34mm] w-[34mm]" />
        </div>
        <div className="mt-3 border-t-[3px] border-[#a90000]" />

        {/* Twee kolommen, als origineel */}
        <div className="mt-1 grid grid-cols-2 gap-x-8">
          <div>
            <Kop>Lidmaatschapsbijdrage:</Kop>
            <p>
              Kwartaalbetaling: €42,- per kwartaal<br />
              Jaarbetaling: €168,- per jaar<br />
              Jaarlijkse bijdrage verzekering: €15,-
            </p>

            <Kop>Betalingsvoorwaarden:</Kop>
            <p>De betaling dient voorafgaand aan de start van elke periode voldaan te worden.</p>

            <Kop>Eenmalige inschrijfkosten:</Kop>
            <p>
              Bij inschrijving wordt een eenmalige bijdrage van €15,- in rekening gebracht.<br />
              <span className="font-semibold text-[#a90000]">Tijdelijke actie: bij inschrijving vóór 31 december 2026 komt deze bijdrage te vervallen!</span>
            </p>

            <Kop>Facturatie:</Kop>
            <p>Voor de eerste betaling ontvangt u een factuur met een overzicht van de kosten.</p>
          </div>

          <div>
            <Kop>Contactgegevens:</Kop>
            <p>
              <b>secretaris/instructeur:</b><br />
              Robert Dingenouts<br />
              Tel: 06 48 64 99 12
            </p>
            <p className="mt-1.5">
              <b>penningmeester/instructeur:</b><br />
              Robin Hack<br />
              Tel: 06 34 72 29 15
            </p>
            <p className="mt-1.5">
              <b>voorzitter/instructeur:</b><br />
              Pascal Hack<br />
              Tel: 06 15 66 26 30<br />
              <span className="text-[10.5px]">Voor vragen over materiaal (Matsuru-judopakken e.d.): bij Pascal</span><br />
              <span className="text-[10.5px]">Nieuwe leden starten met een paarse band; de witte band volgt bij het eerste examen.</span>
            </p>
            <p className="mt-1.5">Mail: {MAIL}</p>

            <Kop>Bankrekening:</Kop>
            <p>
              t.n.v. Judoclub Michigami Steenbergen<br />
              IBAN: {IBAN}
            </p>
          </div>
        </div>

        {/* Trainingslocaties + tijden: vrijdag en woensdag duidelijk gescheiden */}
        <div className="mt-3">
          <Kop>Trainingstijden:</Kop>
          <div className="mt-1 grid grid-cols-2 gap-4">
            <div className="border-l-[3px] border-[#a90000] pl-3">
              <p className="text-[12px] font-extrabold">Vrijdagavond<br /><span className="font-semibold text-[10.5px] text-gray-600">Sportcentrum De Knotwilg · Wipstraat 2, 4651 XW Steenbergen</span></p>
              <div className="mt-1 grid grid-cols-2 gap-3 text-[11px]">
                <p><b>1e groep:</b> 6 t/m 9 jaar<br /><span className="font-semibold text-[#a90000]">18:45 - 19:45</span></p>
                <p><b>2e groep:</b> 9 jaar en ouder<br /><span className="font-semibold text-[#a90000]">19:45 - 20:45</span></p>
              </div>
            </div>
            <div className="border-l-[3px] border-[#a90000] pl-3">
              <p className="text-[12px] font-extrabold">Woensdagavond<br /><span className="font-semibold text-[10.5px] text-gray-600">Dorpshuis &quot;De Vossenkuil&quot; · Bou Kooijmanstraat 48, 4698 AM Oud-Vossemeer</span></p>
              <div className="mt-1 grid grid-cols-2 gap-3 text-[11px]">
                <p><b>Algemene training:</b> alle leeftijden<br /><span className="font-semibold text-[#a90000]">19:00 - 20:00</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Rood kader zoals origineel */}
        <div className="mt-6 flex items-center gap-5 border-[3px] border-[#a90000] p-4">
          <div className="flex-1">
            <p className="text-[16px] font-extrabold text-[#a90000]">Lid worden?</p>
            <p className="mt-1.5 text-[12.5px]">
              Heeft u de 3 gratis proeflessen gevolgd?<br />
              Schrijf u dan <b>uitsluitend online</b> in:<br />
              scan de QR-code of ga naar<br />
              <b className="text-[14px]">www.{SITE}/inschrijven</b><br />
              om je in te schrijven!<br />
              <span className="text-[10.5px]">Na inschrijving krijgt elk lid een eigen account op de website, met al zijn of haar gegevens en prestaties (lessen, examens en diploma's). Gebruik daarom liefst één eigen e-mailadres per lid.</span>
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="QR-code: online inschrijven" className="h-[42mm] w-[42mm]" />
        </div>

        <p className="mt-4 text-center text-[9.5px] text-gray-400">Judoclub Michigami · Steenbergen &amp; Oud-Vossemeer · {SITE} · {MAIL}</p>
      </div>
    </div>
  )
}
