import PrintFitter from '@/components/diploma/PrintFitter'
import PrintKnop from '@/components/diploma/PrintKnop'
import { isAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'

// Kalibratievel: lijntjes op exact 10 mm van elke papier_rand + kruisjes + schaalstok.
// Eén keer printen op de clubprinter (instellingen zoals altijd), Foto -> meten -> juiste marge-berekening.
export const dynamic = 'force-dynamic'

export default async function PrintKalib() {
  if (!(await isAdmin())) redirect('/admin-login')
  const ticks = Array.from({ length: 19 }, (_, i) => (i + 1) * 10)
  const ticksY = Array.from({ length: 26 }, (_, i) => (i + 1) * 10)
  return (
    <div className="bg-gray-200 print:bg-white">
      <div className="print:hidden sticky top-0 z-10 flex items-center gap-2 bg-[#2a2a2a] px-4 py-2 text-sm text-white">
        <a href="/admin/exams" className="text-white/80 hover:text-white">← Terug</a>
        <span className="font-medium">Kalibratievel printer</span>
        <PrintKnop label="🖨 Print" />
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @page { size: A4; margin: 0; }
        .kalib-page { position: relative; width: 209.9mm; height: 296.9mm; margin: 0 auto; background: #fff; overflow: hidden; }
        @media print { body { margin: 0 !important; } .kalib-page { margin: 0 !important; } }
      ` }} />
      <div className="mx-auto w-fit py-4 print:py-0 print-fit">
        <div className="kalib-page">
          <svg width="209.9mm" height="296.9mm" viewBox="0 0 209.9 296.9" style={{ position: 'absolute', left: 0, top: 0 }}>
            {/* kader op exact 10 mm van de randen */}
            <rect x="10" y="10" width="189.9" height="276.9" fill="none" stroke="#000" strokeWidth="0.3" />
            {/* kruisjes op de hoekpunten van dat kader */}
            {[[10, 10], [199.9, 10], [10, 286.9], [199.9, 286.9]].map(([x, y], i) => (
              <g key={i} stroke="#c00" strokeWidth="0.5">
                <line x1={x - 3} y1={y} x2={x + 3} y2={y} />
                <line x1={x} y1={y - 3} x2={x} y2={y + 3} />
                <circle cx={x} cy={y} r="1.2" fill="none" stroke="#c00" strokeWidth="0.3" />
              </g>
            ))}
            {/* centrumkruis op het papier (105 x 148.45) */}
            <g stroke="#00c" strokeWidth="0.5">
              <line x1="100" y1="148.45" x2="110" y2="148.45" />
              <line x1="105" y1="143.45" x2="105" y2="153.45" />
            </g>
            {/* liniaal boven: 0-190 mm */}
            {ticks.map(x => (
              <g key={x}>
                <line x1={x} y1="5" x2={x} y2="9" stroke="#000" strokeWidth="0.3" />
                <text x={x + 0.8} y="4" fontSize="3" fill="#000">{x}</text>
              </g>
            ))}
            {/* liniaal links */}
            {ticksY.map(y => (
              <g key={y}>
                <line x1="5" y1={y} x2="9" y2={y} stroke="#000" strokeWidth="0.3" />
                <text x="5.2" y={y - 0.8} fontSize="2.4" fill="#000">{y}</text>
              </g>
            ))}
            {/* schaalstok 150 mm */}
            <rect x="25" y="160" width="150" height="3" fill="none" stroke="#000" strokeWidth="0.3" />
            <text x="25" y="168" fontSize="3.5" fill="#000">schaalstok = 150 mm (naadloos: exact 150 mm breed)</text>
            <text x="10" y="292" fontSize="3.5" fill="#000">Kader + rode kruisjes = exact 10 mm van de papier-rand. Print op 100% schaal, marges zoals gebruikelijk.</text>
          </svg>
        </div>
      </div>
      <PrintFitter />
    </div>
  )
}
