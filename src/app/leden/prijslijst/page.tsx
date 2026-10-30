import { T } from '@/components/T'
import { SeasonalLogo } from '@/components/SeasonalLogo'
import { PrintPriceListButton } from './PrintPriceListButton'
import { PrijslijstClient } from './PrijslijstClient'

export const dynamic = 'force-dynamic'

export default function PrijslijstPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-24">
      {/* Print-only kop: staat alleen op het papier/PDF */}
      <div className="mb-3 hidden items-center gap-4 border-b-[2.5px] border-[#a90000] pb-2.5 print:flex">
        <SeasonalLogo alt="Judoclub Michigami" className="h-[20mm] w-[20mm] object-contain" />
        <div>
          <h1 className="text-[16pt] font-bold text-[#a90000]"><T k="Judoclub Michigami — Prijslijst materiaal" /></h1>
          <p className="mt-0.5 text-[9pt] text-gray-500"><T k="Judopakken & banden · rechtstreeks inkoop bij Matsuru · Steenbergen / Oud-Vossemeer" /></p>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-[#2a2a2a]"><T k="Materiaal & Prijzen" /></h1>
          <p className="mt-1 text-sm text-gray-500">
            <T k="De club koopt judopakken en banden rechtstreeks in bij Matsuru en verkoopt ze door aan leden. Je betaalt minder dan de webprijs en je bespaart de verzendkosten." />
          </p>
        </div>
        <PrintPriceListButton />
      </div>

      {/* Uitleg kaarten */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 print:hidden">
        <InfoCard icon="🥋" title="Eerste keer?" body="Je hebt een judopak en een paarse band nodig. Wij beginnen met de paarse band — de witte band behaal je bij je eerste examen." />
        <InfoCard icon="🎓" title="Volgende banden" body="De band voor je nieuwe graad betaal je bij het examen; na het examen krijg je die meteen uitgereikt." />
        <InfoCard icon="📏" title="Welke maat?" body="We meten de lengte van de judoka en ronden naar boven af. Ben je 153 cm lang? Dan is maat 160 de juiste keuze." />
        <InfoCard icon="🧵" title="Kwaliteit" body="Het Juvo-pak is van gewafeld katoen — stevig en goed vast te grijpen. De goedkope, gladde pakken die online verkrijgbaar zijn, raden we af." />
      </div>

      <p className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700 shadow-sm break-inside-avoid print:hidden">
        <T k="Welk pak? Voor beginnende leden adviseren we de Juvo. Iets fanatiekere judoka's kunnen gaan voor een semi wedstrijdpak." />
      </p>

      {/* Producten + selectie + WhatsApp-bestelling */}
      <PrijslijstClient />

      {/* Bestelhint + voetnoot */}
      <p className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700 shadow-sm break-inside-avoid print:hidden">
        <T k="Bestellen? Klik de gewenste maten aan (meerdere kan), en druk op Bestel via WhatsApp — je bestelling gaat rechtstreeks naar Pascal." />
      </p>
      <p className="text-xs text-gray-400 print:hidden">
        <T k="Alle prijzen zijn inclusief btw. Prijzen geldig vanaf oktober 2026." />
      </p>
    </div>
  )
}

function InfoCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm break-inside-avoid">
      <div className="flex items-start gap-3">
        <span className="text-xl">{icon}</span>
        <div>
          <p className="text-sm font-semibold text-[#2a2a2a]"><T k={title} /></p>
          <p className="mt-1 text-sm text-gray-500"><T k={body} /></p>
        </div>
      </div>
    </div>
  )
}
