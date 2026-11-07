import { isAdmin } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { GROEP_LABELS, kandidatenVoorGroep } from '@/lib/examens'
import { eisenVoorBelt, BELT_NL } from '@/lib/examen-eisen'
import { BeltBadge } from '@/components/admin/BeltBadge'
import { techniqueCategories } from '@/data/techniques'
import PrintKnop from './PrintKnop'

export const dynamic = 'force-dynamic'

const IBAN = 'NL13 RABO 0136 9125 08'
const LOGO = '/logo/logo-michigami.png'

// examens-vak-id (onderdeel van eisenVoorBelt) → categorie in techniekenlijst
const VAK_TECHNIEKEN: Record<string, string> = {
  'te-waza': 'armworpen', 'kata-waza': 'schouderworpen', 'koshi-waza': 'heupworpen', 'ashi-waza': 'beenworpen',
  'sutemi-waza': 'offerworpen', 'osaekomi-waza': 'houdgrepen', 'shime-waza': 'wurgingen', 'kansetsu-waza': 'armklemmen',
  'ukemi-waza': 'valbreken',
}

interface Vak {
  naam: string
  aantal: number
  technieken: { name: string; dutch: string }[]
}

interface Formulier {
  id: string
  naam: string
  doel: string
  isSlip: boolean
  doelLabel: string
  kosten: string
  omschrijving: string
  vakken: Vak[]
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
    return {
      id: k.memberId,
      naam: `${k.firstName} ${k.lastName}`,
      doel,
      isSlip,
      doelLabel: BELT_NL[doel] ?? doel,
      kosten: isSlip ? '€2,50' : '€15,00',
      omschrijving: isSlip ? `Slipexamen + ${k.firstName} ${k.lastName}` : `Banden examen + ${k.firstName} ${k.lastName}`,
      vakken: (eisenVoorBelt(doel) ?? []).map(v => ({
        naam: v.naam,
        aantal: v.aantal,
        technieken: (!isSlip ? techniqueCategories.find(c => c.key === VAK_TECHNIEKEN[v.id])?.techniques ?? [] : []).map(t => ({ name: t.name, dutch: t.dutch })),
      })),
    }
  })

  // Slippen: 2 per A4-vel. Banden: 1 vel per persoon (uitgebreid met technieknamen).
  const slips = formulieren.filter(f => f.isSlip)
  const banden = formulieren.filter(f => !f.isSlip)
  const vellen: Formulier[][] = [...banden.map(b => [b])]
  for (let i = 0; i < slips.length; i += 2) vellen.push(slips.slice(i, i + 2))

  const css = `
    @page { size: A4 portrait; margin: 8mm 10mm; }
    @media print { body { background: #fff !important; } .scherm { display: none !important; } .vel { box-shadow: none !important; margin: 0 !important; border: none !important; } }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .vel { width: 190mm; height: 281mm; display: flex; flex-direction: column; justify-content: space-between; background: #fff; margin: 0 auto 6mm; box-shadow: 0 1px 6px rgba(0,0,0,.18); page-break-after: always; }
    .vel:last-child { page-break-after: auto; }
    .form { flex: 1; display: flex; flex-direction: column; padding: 5mm 6mm; }
    .kop { display: flex; align-items: center; gap: 4mm; border-bottom: 2.5px solid #a90000; padding-bottom: 1.2mm; }
    .kop img { height: 14mm; width: auto; }
    .kop .titelblok { flex: 1; }
    .clubnaam { font-size: 10pt; font-weight: 800; color: #a90000; letter-spacing: .3px; }
    .titel { font-size: 17pt; font-weight: 800; color: #222; }
    .regel { margin-top: 2.2mm; font-size: 10.5pt; }
    .vak { display: inline-block; border-bottom: 1px solid #444; min-width: 34mm; }
    .eisbox { margin-top: 2.4mm; border: 1.2px solid #a90000; border-radius: 2mm; padding: 2.2mm 3mm; }
    .eiskop { font-size: 9pt; font-weight: 700; color: #a90000; text-transform: uppercase; letter-spacing: .4px; margin-bottom: 1.2mm; }
    .eisen { display: grid; grid-template-columns: 1fr 1fr; gap: .6mm 6mm; font-size: 9.6pt; }
    .betalen { margin-top: 2.4mm; background: #f5f0ec; border-radius: 2mm; padding: 2.2mm 3mm; font-size: 9.6pt; }
    .betalen b.bedrag { color: #a90000; }
    .voet { margin-top: 2.2mm; font-size: 9.3pt; color: #444; }
    .bandgroot .betalen { font-size: 9pt; margin-top: 2mm; }
    .bandgroot .regel { font-size: 10pt; margin-top: 2mm; }
    .eisenGroot { margin-top: 2.6mm; flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 2mm; align-content: start; align-items: start; }
    .vakkat { border: 1px solid #c9b8b0; border-radius: 1.6mm; padding: 1.6mm 2.2mm; break-inside: avoid; }
    .vakkat h3 { margin: 0 0 .8mm 0; font-size: 8.8pt; color: #a90000; border-bottom: 1px solid #eee; padding-bottom: .4mm; }
    .vakkat h3 .aantalkop { float: right; color: #222; }
    .vakkat ol { margin: 0; padding-left: 4.2mm; font-size: 7.9pt; line-height: 1.42; columns: 1; }
    .vakkat .nd { color: #666; font-size: 7.1pt; }
    .vakkat .geen { font-size: 7.6pt; color: #555; font-style: italic; }
    .compact .vakkat { padding: .8mm 1.6mm; }
    .compact .vakkat h3 { font-size: 8.2pt; margin-bottom: .3mm; padding-bottom: .2mm; }
    .compact .vakkat ol { font-size: 6.9pt; line-height: 1.18; padding-left: 3.4mm; margin: 0; }
    .compact .vakkat .lijst2 { columns: 2; column-gap: 2.5mm; padding-left: 3.2mm; }
    .compact .vakkat .nd { font-size: 6.3pt; }
    .compact .eisenGroot { gap: 1mm; margin-top: 1.8mm; }
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
    </div>
  )

  const Kaart = ({ f }: { f: Formulier }) => (
    <div className="form">
      <div className="kop">
        <img src={LOGO} alt="Judoclub Michigami" />
        <div className="titelblok">
          <div className="clubnaam">JUDOCLUB MICHIGAMI · STEENBERGEN / OUD-VOSSEMEER</div>
          <div className="titel">{f.isSlip ? 'Slip-examen' : 'Banden examen'}</div>
        </div>
        <BeltBadge belt={f.doel} height="h-[7mm]" width="w-[11mm]" />
      </div>
      <div className="regel">
        Naam: <b style={{ fontSize: '12pt' }}>{f.naam}</b>
        <span style={{ float: 'right' }}>Datum examen: <span className="vak" />&nbsp;&nbsp;&nbsp;&nbsp;</span>
      </div>
      <div className="regel">
        Gefeliciteerd! Je mag examen doen voor de <b>{f.doelLabel}</b>. Het examen wordt afgenomen tijdens de judoles op bovenstaande datum.
      </div>
      {f.isSlip && (
        <>
          {f.vakken.length > 0 && (
            <div className="eisbox">
              <div className="eiskop">Wat je moet kunnen</div>
              <div className="eisen">
                {f.vakken.map(v => <div key={v.naam}>{v.aantal} × {v.naam}</div>)}
              </div>
              <div style={{ fontSize: '8.6pt', color: '#666', marginTop: '1.4mm' }}>
                Oefenen thuis? Kijk op judoclubmichigami.nl onder 🥋 <b>Judo School → Exameneisen</b> (elke techniek per band/slip) en <b>Technieken</b> (filmpje bij elke techniek).
              </div>
            </div>
          )}
          <Betaling f={f} />
          <div className="voet">Veel succes!</div>
        </>
      )}
    </div>
  )

  const BandVEL = ({ f }: { f: Formulier }) => {
    const technisch = f.vakken.reduce((n, v) => n + v.technieken.length, 0)
    return (
    <div className={"form bandgroot" + (technisch > 44 ? " compact" : "")}>
      <div className="kop">
        <img src={LOGO} alt="Judoclub Michigami" style={{ height: '17mm' }} />
        <div className="titelblok">
          <div className="clubnaam">JUDOCLUB MICHIGAMI · STEENBERGEN / OUD-VOSSEMEER</div>
          <div className="titel">Banden examen — {f.doelLabel}</div>
        </div>
        <BeltBadge belt={f.doel} height="h-[9mm]" width="w-[14mm]" />
      </div>
      <div className="regel">
        Naam: <b style={{ fontSize: '12.5pt' }}>{f.naam}</b>
        <span style={{ float: 'right' }}>Datum examen: <span className="vak" />&nbsp;&nbsp;&nbsp;&nbsp;</span>
      </div>
      <div className="regel">
        Gefeliciteerd! Je mag examen doen voor de <b>{f.doelLabel}</b>. Het examen wordt afgenomen tijdens de judoles op bovenstaande datum. Onderstaand vind je per vak wat je moet kunnen — de examenleiding bevraagt je over het aangegeven aantal technieken uit elk vak.
      </div>
      <Betaling f={f} />
      <div className="eisenGroot">
        {f.vakken.map(v => (
          <div className="vakkat" key={v.naam}>
            <h3>{v.naam}<span className="aantalkop">{v.aantal} ×</span></h3>
            {v.technieken.length > 0 ? (
              <ol className={v.technieken.length > 10 ? 'lijst2' : undefined}>
                {v.technieken.map(t => <li key={t.name}>{t.name} <span className="nd">{t.dutch}</span></li>)}
              </ol>
            ) : (
              <div className="geen">Deze technieken worden regelmatig in de les geoefend — je laat ze op verzoek correct zien.</div>
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
            {vel.length === 1 && !vel[0].isSlip
              ? <BandVEL f={vel[0]} />
              : (<>
                  {vel.map(f => <Kaart key={f.id} f={f} />)}
                  {vel.length === 1 && <div style={{ flex: 1 }} />}
                </>)}
          </div>
        ))}
      </div>
    </>
  )
}
