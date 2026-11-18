import {
  DIPLOMA_POSITIE, DIPLOMA_BAND, DIPLOMA_OFF, LOGO_BIG, LOGO_SMALL, LOGO_SMALL_SIZE,
} from '@/lib/diploma-replica-data'

// Exacte HTML/CSS-replica van het Canva-diploma (A4 595,5 x 842,25 pt).
// Alle maten in pt omgezet naar mm (print-nauwkeurig).

const K = 25.4 / 72
const mm = (v: number) => `${(v * K).toFixed(3)}mm`

export default function DiplomaReplica({ design, naam, datum, plaats }: {
  design: string; naam: string; datum: string; plaats: string
}) {
  const p = DIPLOMA_POSITIE[design]
  const b = (DIPLOMA_BAND as Record<string, { naam: string; kyu: string; fill: string; stroke: string }>)[design]
  const O = DIPLOMA_OFF
  const img = (f: string) => `/diploma/${design}/${f}`

  return (
    <div className="diploma-page">
      <style dangerouslySetInnerHTML={{ __html: `
        @page { size: 210.079mm 297.134mm; margin: 0; }
        .diploma-root { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .diploma-page { position: relative; width: 210.079mm; height: 297.134mm; background: #fff; overflow: hidden; }
        .diploma-page .abs { position: absolute; }
        .diploma-page .txt { white-space: pre; }
        .diploma-page .border { left: ${mm(26.88)}; top: ${mm(18.9 + O.border)}; width: ${mm(568.32 - 26.88)}; height: ${mm(787.2)}; border: 0.6mm solid #000; }
        @font-face { font-family: 'Diploma Anton'; src: url('/diploma/fonts/Anton-Regular.ttf'); }
        @font-face { font-family: 'Diploma Great Vibes'; src: url('/diploma/fonts/GreatVibes-Regular.ttf'); }
        @font-face { font-family: 'Diploma Open Sans'; src: url('/diploma/fonts/OpenSans-Regular.ttf'); }
        @media print { html, body { width: 210.079mm; height: 297.134mm; } }
      ` }} />

      <div className="abs border" />

      <img className="abs" src={img('watermerk.webp')} style={{ opacity: .21, left: mm(p.watermerk[0]), top: mm(p.watermerk[1] + O.water), width: mm(p.watermerk[2] - p.watermerk[0]), height: mm(p.watermerk[3] - p.watermerk[1]) }} alt="" />

      <img className="abs" src="/logo/logo-michigami.png" style={{ left: mm(LOGO_BIG[0]), top: mm(LOGO_BIG[1]), width: mm(LOGO_BIG[2] - LOGO_BIG[0]), height: mm(LOGO_BIG[3] - LOGO_BIG[1]) }} alt="Judoclub Michigami" />

      <img className="abs" src={img('band.webp')} style={{ left: mm(p.band[0]), top: mm(p.band[1] + O.band), width: mm(p.band[2] - p.band[0]), height: mm(p.band[3] - p.band[1]) }} alt="" />

      {(['sigA2', 'sigA3', 'sigA4', 'sigA5'] as const).map(k => {
        const bx = p[k]
        return <img key={k} className="abs" src={img(`${k}.webp`)} style={{ left: mm(bx[0]), top: mm(bx[1] + O.band), width: mm(bx[2] - bx[0]), height: mm(bx[3] - bx[1]) }} alt="" />
      })}

      {(() => { const [cx, cy] = LOGO_SMALL[design]; return (
        <img className="abs" src="/logo/logo-michigami.png" style={{ left: mm(cx - LOGO_SMALL_SIZE / 2), top: mm(cy + O.band - LOGO_SMALL_SIZE / 2), width: mm(LOGO_SMALL_SIZE), height: mm(LOGO_SMALL_SIZE) }} alt="" />
      ) })()}

      {p.kanji.map((k, i) => (
        <img key={i} className="abs" src={img(`kanji${i}.webp`)} style={{ left: mm(k.x0 - 2), top: mm(k.top - 2), width: mm(k.x1 - k.x0 + 4), height: mm(k.bottom - k.top + 4) }} alt="" />
      ))}
      <img className="abs" src={img('belt_clip.webp')} style={{ left: mm(60), top: mm(712), width: mm(128), height: mm(110) }} alt="" />

      {/* teksten */}
      <div className="txt abs" style={{ fontFamily: "'Diploma Anton'", left: mm(155.3), width: mm(289.5), top: mm(192.5 + O.titel), height: mm(53.02), fontSize: mm(53.02), lineHeight: mm(53.02), color: '#000' }}>JUDO DIPLOMA</div>
      <div className="txt abs" style={{ fontFamily: "'Diploma Anton'", left: mm(240), width: mm(120), top: mm(247 + O.kyu), height: mm(25.01), fontSize: mm(25.01), lineHeight: mm(25.01), color: '#000', textAlign: 'center' }}>{b.kyu}</div>
      <div className="txt abs" style={{ fontFamily: "'Diploma Anton'", left: 0, width: mm(210.079), top: mm(274.3 + O.bandnaam), textIndent: '4.9pt', letterSpacing: '-1.25pt', height: mm(79.8), fontSize: mm(60.02), lineHeight: mm(79.8), color: b.fill, textAlign: 'center', WebkitTextStroke: `${b.stroke} #000`, paintOrder: 'stroke fill' }}>{b.naam}</div>

      <div className="txt abs" style={{ fontFamily: "'Diploma Open Sans'", left: mm(152.2), width: mm(40), top: mm(380.1 + O.label), height: mm(14), fontSize: mm(14), lineHeight: mm(14), color: '#000' }}>Naam:</div>
      <div className="txt abs" style={{ fontFamily: "'Diploma Open Sans'", left: mm(146.8), width: mm(48), top: mm(413.5 + O.label), height: mm(14), fontSize: mm(14), lineHeight: mm(14), color: '#000' }}>Datum:</div>
      <div className="txt abs" style={{ fontFamily: "'Diploma Open Sans'", left: mm(152.1), width: mm(48), top: mm(446.8 + O.label), height: mm(14), fontSize: mm(14), lineHeight: mm(14), color: '#000' }}>Plaats:</div>
      <div className="txt abs" style={{ fontFamily: "'Diploma Open Sans'", left: mm(250.2), width: mm(95), top: mm(490.6 + O.label), height: mm(14), fontSize: mm(14), lineHeight: mm(14), color: '#000' }}>Examinatoren:</div>

      <div className="txt abs" style={{ fontFamily: "'Diploma Great Vibes'", left: mm(190.05), width: mm(220), top: mm(372.2 + O.naam), height: mm(34.01), fontSize: mm(34.01), lineHeight: mm(34.01), color: '#000', textAlign: 'center' }}><span className="naam-waarde" style={{ display: 'inline-block', transformOrigin: 'center' }}>{naam}</span></div>
      <div className="txt abs" style={{ fontFamily: "'Diploma Great Vibes'", left: mm(190.05), width: mm(220), top: mm(411.1 + O.datum), height: mm(20), fontSize: mm(20), lineHeight: mm(20), color: '#000', textAlign: 'center', letterSpacing: '0.85pt' }}>{datum}</div>
      <div className="txt abs" style={{ fontFamily: "'Diploma Great Vibes'", left: mm(190.05), width: mm(220), top: mm(444.5 + O.plaats), height: mm(20), fontSize: mm(20), lineHeight: mm(20), color: '#000', textAlign: 'center' }}>{plaats}</div>
    </div>
  )
}
