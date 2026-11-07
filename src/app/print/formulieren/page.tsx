import { isAdmin } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { GROEP_LABELS, kandidatenVoorGroep } from '@/lib/examens'
import { eisenVoorBelt, BELT_NL } from '@/lib/examen-eisen'
import { BeltBadge } from '@/components/admin/BeltBadge'
import PrintKnop from './PrintKnop'

export const dynamic = 'force-dynamic'

const IBAN = 'NL13 RABO 0136 9125 08'

interface Formulier {
  id: string
  naam: string
  doel: string
  isSlip: boolean
  doelLabel: string
  kosten: string
  omschrijving: string
  vakken: { naam: string; aantal: number }[]
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
    const doelLabel = BELT_NL[doel] ?? doel
    return {
      id: k.memberId,
      naam: `${k.firstName} ${k.lastName}`,
      doel,
      isSlip,
      doelLabel,
      kosten: isSlip ? '€2,50' : '€15,00',
      omschrijving: isSlip ? `Slipexamen + ${k.firstName} ${k.lastName}` : `Banden examen + ${k.firstName} ${k.lastName}`,
      vakken: (eisenVoorBelt(doel) ?? []).map(v => ({ naam: v.naam, aantal: v.aantal })),
    }
  })

  // Tweetjes per A4-vel (net als het papieren slipformulier)
  const vellen: Formulier[][] = []
  for (let i = 0; i < formulieren.length; i += 2) vellen.push(formulieren.slice(i, i + 2))

  const css = `
    @page { size: A4 portrait; margin: 8mm 10mm; }
    @media print { body { background: #fff !important; } .scherm { display: none !important; } .vel { box-shadow: none !important; margin: 0 !important; border: none !important; } }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .vel { width: 190mm; height: 281mm; display: flex; flex-direction: column; justify-content: space-between; background: #fff; margin: 0 auto 6mm; box-shadow: 0 1px 6px rgba(0,0,0,.18); page-break-after: always; }
    .form { flex: 1; display: flex; flex-direction: column; padding: 5mm 6mm; }
    .kop { display: flex; align-items: baseline; justify-content: space-between; border-bottom: 2.5px solid #a90000; padding-bottom: 1.2mm; }
    .clubnaam { font-size: 10pt; font-weight: 800; color: #a90000; letter-spacing: .3px; }
    .titel { font-size: 17pt; font-weight: 800; color: #222; }
    .regel { margin-top: 2.2mm; font-size: 10.5pt; }
    .vak { display: inline-block; border-bottom: 1px solid #444; min-width: 34mm; }
    .eisbox { margin-top: 2.4mm; border: 1.2px solid #a90000; border-radius: 2mm; padding: 2.2mm 3mm; }
    .eiskop { font-size: 9pt; font-weight: 700; color: #a90000; text-transform: uppercase; letter-spacing: .4px; margin-bottom: 1.2mm; }
    .eisen { display: grid; grid-template-columns: 1fr 1fr; gap: .6mm 6mm; font-size: 9.6pt; }
    .eisen span.aantal { font-weight: 700; }
    .betalen { margin-top: 2.4mm; background: #f5f0ec; border-radius: 2mm; padding: 2.2mm 3mm; font-size: 9.6pt; }
    .betalen b.bedrag { color: #a90000; }
    .voet { margin-top: 2.2mm; font-size: 9.3pt; color: #444; }
  `

  const FormulierKaart = ({ f }: { f: Formulier }) => (
    <div className="form">
      <div className="kop">
        <span className="clubnaam">JUDOCLUB MICHIGAMI STEENBERGEN</span>
        <span className="titel">{f.isSlip ? 'Slip-examen' : 'Banden examen'}</span>
        <BeltBadge belt={f.doel} height="h-[7mm]" width="w-[11mm]" />
      </div>
      <div className="regel">
        Naam: <b style={{ fontSize: '12pt' }}>{f.naam}</b>
        <span style={{ float: 'right' }}>Datum examen: <span className="vak" />&nbsp;&nbsp;&nbsp;&nbsp;</span>
      </div>
      <div className="regel">
        Gefeliciteerd! Je mag examen doen voor de <b>{f.doelLabel}</b>. Het examen wordt afgenomen tijdens de judoles op bovenstaande datum.
      </div>
      {f.vakken.length > 0 && (
        <div className="eisbox">
          <div className="eiskop">Wat je moet kunnen</div>
          <div className="eisen">
            {f.vakken.map(v => (
              <div key={v.naam}>{v.aantal} × {v.naam}</div>
            ))}
          </div>
          <div style={{ fontSize: '8.6pt', color: '#666', marginTop: '1.4mm' }}>
            De techniekenkaarten en bijbehorende filmpjes vind je op www.judoclubmichigami.nl onder “Technieken”.
          </div>
        </div>
      )}
      <div className="betalen">
        Kosten examen: <b className="bedrag">{f.kosten}</b>{!f.isSlip ? ' (inclusief band)' : ''}.
        Belangrijk: <b>betaling uiterlijk 1 dag vóór het examen</b>, zodat we kunnen controleren of alles binnen is.
        Overmaken op <b>{IBAN}</b> t.n.v. Judoclub Michigami Steenbergen, omt. “{f.omschrijving}”.
      </div>
      <div className="voet">Veel succes!</div>
    </div>
  )

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
            {vel.map(f => <FormulierKaart key={f.id} f={f} />)}
            {vel.length === 1 && <div style={{ flex: 1 }} />}
          </div>
        ))}
      </div>
    </>
  )
}
