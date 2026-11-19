import { DIPLOMA_BAND, DIPLOMA_OFF, LOGO_BIG, LOGO_SMALL, LOGO_SMALL_SIZE } from '@/lib/diploma-replica-data'

// Exacte diploma-replica: de Canva-render zelf als achtergrond (bg.webp, alle
// statische onderdelen pixel-exact). Alleen variabele velden (naam/datum/plaats),
// de nieuwe logo's en — bij bruin — bandnaam/kyu worden als HTML/CSS overheen gezet.

const K = 25.4 / 72
const mm = (v: number) => `${(v * K).toFixed(3)}mm`

export default function DiplomaReplica({ design, naam, datum, plaats }: {
  design: string; naam: string; datum: string; plaats: string
}) {
  const b = (DIPLOMA_BAND as Record<string, { naam: string; kyu: string; fill: string; stroke: string }>)[design]
  const O = DIPLOMA_OFF
  const [lsx, lsy] = LOGO_SMALL[design]

  return (
    <div className="diploma-page">
      <style dangerouslySetInnerHTML={{ __html: `
        @page { size: A4; margin: 0; }
        .diploma-root { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        /* 192×271.6 mm, gecentreerd: past binnen de onafdrukbare marge van de clubprinter
           (links ~5, rechts ~9 mm) → afdrukken valt exact in 't midden, geen Canva-shift nodig */
        .diploma-page { position: relative; width: 192mm; height: 271.6mm; margin: 13mm auto 0; background: #fff; overflow: hidden; }
        @media print { .diploma-page { left: 2mm; } }  /* Robert 19 nov: printer zette ontwerp 2,5 mm te links */
        /* interieur blijft op Canva-maten (209.9×296.9 mm) en schaalt als geheel naar 192 mm */
        .diploma-inner { position: absolute; left: 0; top: 0; width: 209.9mm; height: 296.9mm; transform: scale(0.914721); transform-origin: top left; }
        .diploma-page .abs { position: absolute; }
        .diploma-page .txt { white-space: pre; }
        @font-face { font-family: 'Diploma Anton'; src: url('/diploma/fonts/Anton-Regular.ttf'); }
        @font-face { font-family: 'Diploma Great Vibes'; src: url('/diploma/fonts/GreatVibes-Regular.ttf'); }
      ` }} />

      <div className="diploma-inner">
      <img className="abs" src={`/diploma/${design}/bg.webp`} loading="eager" style={{ left: 0, top: 0, width: '100%', height: '100%' }} alt="" />

      <img className="abs" src="/logo/logo-michigami.png" loading="eager" style={{ left: mm(LOGO_BIG[0]), top: mm(LOGO_BIG[1]), width: mm(LOGO_BIG[2] - LOGO_BIG[0]), height: mm(LOGO_BIG[3] - LOGO_BIG[1]) }} alt="Judoclub Michigami" />
      <img className="abs" src="/diploma/logo_small.png" loading="eager" style={{ left: mm(lsx - LOGO_SMALL_SIZE / 2), top: mm(lsy - LOGO_SMALL_SIZE / 2 - 0.09), width: mm(LOGO_SMALL_SIZE), height: mm(LOGO_SMALL_SIZE) }} alt="" />

      {design === 'bruin' && (<>
        <div className="txt abs" style={{ fontFamily: "'Diploma Anton'", left: mm(240), width: mm(120), top: mm(247 + O.kyu), height: mm(25.01), fontSize: mm(25.01), lineHeight: mm(25.01), color: '#000', textAlign: 'center' }}>{b.kyu}</div>
        <div className="txt abs" style={{ fontFamily: "'Diploma Anton'", left: 0, width: mm(210.079), top: mm(274.3 + O.bandnaam), textIndent: '4.9pt', letterSpacing: '-1.25pt', height: mm(79.8), fontSize: mm(60.02), lineHeight: mm(79.8), color: b.fill, textAlign: 'center', WebkitTextStroke: `${b.stroke} #000`, paintOrder: 'stroke fill' }}>{b.naam}</div>
      </>)}

      <div className="txt abs" style={{ fontFamily: "'Diploma Great Vibes'", left: mm(190.05), width: mm(220), top: mm(372.2 + O.naam), height: mm(34.01), fontSize: mm(34.01), lineHeight: mm(34.01), color: '#000', textAlign: 'center' }}><span className="naam-waarde" style={{ display: 'inline-block', transformOrigin: 'center' }}>{naam}</span></div>
      <div className="txt abs" style={{ fontFamily: "'Diploma Great Vibes'", left: mm(190.05), width: mm(220), top: mm(411.1 + O.datum), height: mm(20), fontSize: mm(20), lineHeight: mm(20), color: '#000', textAlign: 'center', letterSpacing: '0.85pt' }}>{datum}</div>
      <div className="txt abs" style={{ fontFamily: "'Diploma Great Vibes'", left: mm(190.05), width: mm(220), top: mm(444.5 + O.plaats), height: mm(20), fontSize: mm(20), lineHeight: mm(20), color: '#000', textAlign: 'center' }}>{plaats}</div>
      </div>
    </div>
  )
}
