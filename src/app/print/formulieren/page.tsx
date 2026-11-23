import { isAdmin } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { GROEP_LABELS, kandidatenVoorGroep } from '@/lib/examens'
import { BELT_NL } from '@/lib/examen-eisen'
import { BeltBadge } from '@/components/admin/BeltBadge'
import { techniques, techniqueCategories, beltRequirements } from '@/data/exam-requirements'
import PrintKnop from './PrintKnop'

export const dynamic = 'force-dynamic'

const IBAN = 'NL13 RABO 0136 9125 08'
const LOGO = '/logo/logo-michigami.png'

// Officiële examenvolgorde zoals op de site (Exameneisen-dashboard)
const SITE_VOLGORDE = ['ukemi-waza', 'ashi-waza', 'koshi-waza', 'kata-waza', 'te-waza', 'sutemi-waza', 'osaekomi-waza', 'shime-waza', 'kansetsu-waza'] as const

const NAAM_REQ_ID: Record<string, string> = {
  WIT: 'wit', WIT_GEEL: 'wit-gele-slip', GEEL: 'geel', GEEL_ORANJE: 'geel-oranje-slip',
  ORANJE: 'oranje', ORANJE_GROEN: 'oranje-groene-slip', GROEN: 'groen', GROEN_BLAUW: 'groen-blauwe-slip',
  BLAUW: 'blauw', BLAUW_BRUIN: 'blauw-bruine-slip', BRUIN: 'bruin',
}

const CAT_NL: Record<string, { nl: string; ja: string }> = Object.fromEntries(
  techniqueCategories.map(c => [c.id, { nl: c.nameNl, ja: c.nameJa }]),
)

interface VakKaart {
  id: string
  titel: string
  ja: string
  aantal: number
  technieken: { ja: string; nl: string; verboden?: boolean }[]
  uitleg?: string
}

interface Formulier {
  id: string
  naam: string
  doel: string
  isSlip: boolean
  doelLabel: string
  kosten: string
  omschrijving: string
  vakken: VakKaart[]
  nageKomi: number
  kantelen: number
}

// Zelfde officiële bron en snijde-logica als het site-dashboard: eerste N technieken per vak in examenvolgorde + altijd de 4 valbrekers
function vakkenVoorDoel(doel: string): { vakken: VakKaart[]; nageKomi: number; kantelen: number } {
  const reqId = NAAM_REQ_ID[doel]
  const req = beltRequirements.find(r => r.beltId === reqId)
  if (!req) return { vakken: [], nageKomi: 0, kantelen: 0 }
  const vakken: VakKaart[] = []
  for (const catId of SITE_VOLGORDE) {
    const alle = techniques[catId] ?? []
    const count = catId === 'ukemi-waza' ? alle.length : (req.requirements[catId] ?? 0)
    if (count <= 0) continue
    vakken.push({
      id: catId,
      titel: CAT_NL[catId]?.nl ?? catId,
      ja: CAT_NL[catId]?.ja ?? '',
      aantal: count,
      technieken: alle.slice(0, count).map(t => ({ ja: t.nameJa, nl: t.nameNl, verboden: t.forbidden })),
    })
  }
  return { vakken, nageKomi: req.nageKomi, kantelen: req.kantelTechnieken }
}

export default async function PrintFormulieren({ searchParams }: { searchParams: Promise<{ groep?: string; leden?: string }> }) {
  if (!(await isAdmin())) redirect('/admin-login')
  const q = await searchParams
  if (!q.groep) notFound()

  let kandidaten = await kandidatenVoorGroep(q.groep)
  if (q.leden) {
    const ids = new Set(q.leden.split(',').filter(Boolean))
    kandidaten = kandidaten.filter(k => ids.has(k.memberId))
  }

  const formulieren: Formulier[] = kandidaten.map(k => {
    const doel = k.doel as string
    const isSlip = doel.includes('_')
    const { vakken, nageKomi, kantelen } = vakkenVoorDoel(doel)
    return {
      id: k.memberId,
      naam: `${k.firstName} ${k.lastName}`,
      doel,
      isSlip,
      doelLabel: BELT_NL[doel] ?? doel,
      kosten: isSlip ? '€2,50' : '€15,00',
      omschrijving: isSlip ? `Slipexamen + ${k.firstName} ${k.lastName}` : `Banden examen + ${k.firstName} ${k.lastName}`,
      vakken, nageKomi, kantelen,
    }
  })

  // Ieder examenformulier = 1 volledig A4-vel (band én slip), uitgebreid met alle technieknamen.
  const vellen: Formulier[][] = formulieren.map(f => [f])

  const css = `
    @page { size: A4 portrait; margin: 8mm 10mm; }
    @media print { body { background: #fff !important; } .scherm { display: none !important; } .vel { box-shadow: none !important; margin: 0 !important; border: none !important; } }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .vel { width: 190mm; height: 281mm; display: flex; flex-direction: column; justify-content: space-between; background: #fff; margin: 0 auto 6mm; box-shadow: 0 1px 6px rgba(0,0,0,.18); page-break-after: always; overflow: hidden; }
    .vel:last-child { page-break-after: auto; }
    .form { flex: 1; display: flex; flex-direction: column; padding: 5mm 6mm; }
    .kop { display: flex; align-items: center; gap: 4mm; border-bottom: 2.5px solid #a90000; padding-bottom: 1.2mm; }
    .kop img { height: 14mm; width: auto; }
    .kop .titelblok { flex: 1; }
    .clubnaam { font-size: 10pt; font-weight: 800; color: #a90000; letter-spacing: .3px; }
    .titel { font-size: 17pt; font-weight: 800; color: #222; }
    .regel { margin-top: 2.2mm; font-size: 10.5pt; }
    .vak { display: inline-block; border-bottom: 1px solid #444; min-width: 34mm; }
    .betalen { margin-top: 2.4mm; background: #f5f0ec; border-radius: 2mm; padding: 2.2mm 3mm; font-size: 9.6pt; }
    .betalen b.bedrag { color: #a90000; }
    .voet { margin-top: 2.2mm; font-size: 9.3pt; color: #444; }
    .bandgroot .betalen { font-size: 9pt; margin-top: 2mm; }
    .bandgroot .regel { font-size: 10pt; margin-top: 2mm; }
    .eisenGroot { margin-top: 2.6mm; display: grid; grid-template-columns: 1fr 1fr; gap: 2mm; align-content: start; }
    .vakkat { border: 1px solid #c9b8b0; border-radius: 1.6mm; padding: 1.6mm 2.4mm; }
    .vakkat h3 { margin: 0 0 1mm 0; font-size: 9.2pt; color: #a90000; border-bottom: 1px solid #eee; padding-bottom: .5mm; display: flex; justify-content: space-between; align-items: baseline; gap: 2mm; }
    .vakkat h3 .sub { color: #999; font-weight: 400; font-size: 7.4pt; margin-left: 1.2mm; }
    .vakkat h3 .aantalkop { color: #222; white-space: nowrap; font-weight: 700; }
    .vakkat ol { margin: 0; padding: 0; list-style: none; counter-reset: tech; font-size: 8.1pt; line-height: 1.55; }
    .vakkat ol li { counter-increment: tech; display: flex; gap: 1.4mm; }
    .vakkat ol li::before { content: counter(tech) "."; color: #a90000; font-weight: 700; min-width: 5mm; text-align: right; }
    .vakkat .nd { color: #666; font-size: 7.2pt; margin-left: 1.2mm; }
    .vakkat .uitleg { font-size: 8pt; color: #444; line-height: 1.5; }
    .midden .eisenGroot { gap: 1.4mm; margin-top: 2mm; display: block; columns: 2; column-gap: 2mm; }
    .midden .vakkat { break-inside: avoid; margin-bottom: 1.2mm; padding: 1.2mm 2mm; }
    .midden .vakkat h3 { font-size: 8.6pt; margin-bottom: .6mm; }
    .midden .vakkat ol { font-size: 7.4pt; line-height: 1.32; }
    .midden .vakkat .nd { font-size: 6.6pt; }
    .compact .vakkat { padding: .8mm 1.8mm; }
    .super .eisenGroot { gap: .8mm; margin-top: 1.6mm; display: block; columns: 2; column-gap: 1.6mm; }
    .super .vakkat { break-inside: avoid; margin-bottom: .8mm; padding: .6mm 1.4mm; }
    .super .vakkat h3 { font-size: 7.8pt; margin-bottom: .3mm; }
    .super .vakkat ol { font-size: 6.2pt; line-height: 1.16; }
    .super .vakkat .nd { font-size: 5.6pt; margin-left: .8mm; }
    .super .vakkat .uitleg { font-size: 6.8pt; line-height: 1.3; }
    .super .regel { font-size: 9pt; }
    .super .betalen { font-size: 7.6pt; }
    .super .voet { font-size: 7.8pt; }
    .compact .vakkat h3 { font-size: 8.2pt; margin-bottom: .4mm; }
    .compact .vakkat ol { font-size: 6.9pt; line-height: 1.22; }
    .compact .vakkat .nd { font-size: 6.2pt; }
    .compact .eisenGroot { gap: 1mm; margin-top: 1.8mm; display: block; columns: 2; column-gap: 2mm; }
    .compact .vakkat { break-inside: avoid; margin-bottom: 1mm; }
    .compact .regel { font-size: 9.3pt; }
    .compact .betalen { font-size: 8.5pt; }
    .compact .voet { font-size: 8.4pt; }
    .compact .kop img { height: 13mm !important; }
    .compact .titel { font-size: 15pt; }
  `

  const Betaling = ({ f }: { f: Formulier }) => (
    <div className="betalen">
      Kosten examen: <b className="bedrag">{f.kosten}</b>{!f.isSlip ? ' (inclusief band)' : ''}.
      Belangrijk: <b>betaling uiterlijk 1 dag vóór het examen</b>, zodat we kunnen controleren of alles binnen is.
      Overmaken op <b>{IBAN}</b> t.n.v. Judoclub Michigami Steenbergen, omt. “{f.omschrijving}”.
      <br />Op de dag zelf niet helemaal fit? Laat het ons van tevoren weten. Meedoen is <b>nooit verplicht</b> en een examen schuiven we gewoon op naar een andere les.
    </div>
  )

  // Volledige A4: alle technieknamen in examenvolgorde (voor band én slip identiek)
  const FormulierVEL = ({ f }: { f: Formulier }) => {
    const alleKaarten: VakKaart[] = [
      ...f.vakken,
      ...(f.nageKomi > 0 ? [{ id: 'nage-komi', titel: 'Nage-komi', ja: '投込', aantal: f.nageKomi, technieken: [], uitleg: `Herhaaldelijk werpen: jij en je partner werpen om de beurt zo snel mogelijk en correct een worp naar keuze. Jij laat binnen 1 minuut ${f.nageKomi} worpen zien.` }] : []),
      ...(f.kantelen > 0 ? [{ id: 'kantelen', titel: 'Kanteltechnieken', ja: '返', aantal: f.kantelen, technieken: [], uitleg: 'Wordt regelmatig in de les geoefend — je laat ze op verzoek correct zien.' }] : []),
    ]
    const technisch = alleKaarten.reduce((n, v) => n + v.technieken.length, 0)
    const dichtheid = technisch > 90 ? ' super' : technisch > 46 ? ' compact' : technisch > 34 ? ' midden' : ''
    return (
      <div className={'form bandgroot' + dichtheid}>
        <div className="kop">
          <img src={LOGO} alt="Judoclub Michigami" style={{ height: '17mm' }} />
          <div className="titelblok">
            <div className="clubnaam">JUDOCLUB MICHIGAMI · STEENBERGEN / OUD-VOSSEMEER</div>
            <div className="titel">{f.isSlip ? 'Slip-examen' : 'Banden examen'} — {f.doelLabel}</div>
          </div>
          <BeltBadge belt={f.doel} height="h-[9mm]" width="w-[14mm]" />
        </div>
        <div className="regel">
          Naam: <b style={{ fontSize: '12.5pt' }}>{f.naam}</b>
          <span style={{ float: 'right' }}>Datum examen: <span className="vak" />&nbsp;&nbsp;&nbsp;&nbsp;</span>
        </div>
        <div className="regel">
          Gefeliciteerd! Je mag examen doen voor de <b>{f.doelLabel}</b>. Het examen wordt afgenomen tijdens de judoles op bovenstaande datum. Onder elk vak staat precies welke technieken je daarvoor moet kennen.
        </div>
        <Betaling f={f} />
        <div className="eisenGroot">
          {alleKaarten.map(v => (
            <div className="vakkat" key={v.id}>
              <h3>
                <span>{v.titel}<span className="sub">{v.ja}</span></span>
                <span className="aantalkop">{v.aantal} ×</span>
              </h3>
              {v.technieken.length > 0 ? (
                <ol>
                  {v.technieken.map(t => <li key={t.ja}><span>{t.ja}<span className="nd">{t.nl}{t.verboden ? ' — verboden in wedstrijden' : ''}</span></span></li>)}
                </ol>
              ) : (
                <div className="uitleg">{v.uitleg}</div>
              )}
            </div>
          ))}
        </div>
        <div className="voet">Tip: op judoclubmichigami.nl onder 🥋 <b>Judo School → Exameneisen</b> zie je per band/slip exact welke technieken je moet kennen, bij <b>Technieken</b> hoort bij elke worp een filmpje en onder <b>Cursus Japans</b> leer je de Japanse benamingen. Veel succes!</div>
      </div>
    )
  }

  return (
    <>
      <style>{css}</style>
      <div style={{ fontFamily: "'DejaVu Sans', sans-serif", color: '#222' }}>
        <div className="scherm" style={{ maxWidth: '210mm', margin: '10mm auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a href={`/admin/exams/formulieren?groep=${q.groep}`} style={{ color: '#a90000', textDecoration: 'none', fontWeight: 600 }}>← Terug naar selectie</a>
          <h1 style={{ fontSize: '18px', margin: 0 }}>Examenformulieren — {GROEP_LABELS[q.groep] ?? q.groep} ({formulieren.length})</h1>
          <PrintKnop />
        </div>
        {vellen.map((vel, i) => (
          <div className="vel" key={i}>
            <FormulierVEL f={vel[0]} />
          </div>
        ))}
      </div>
    </>
  )
}
