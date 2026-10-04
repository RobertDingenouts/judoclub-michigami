// Belt als twee vierkante vakjes tegen elkaar:
//  - volle band  → twee zelfde kleurvakken = één blok (bv. heel geel)
//  - slipband    → basiskleur + slipkleur (bv. geel | oranje bij GEEL_ORANJE)
import { BELT_COLORS } from '@/lib/student-progress-types'

const SLIP_KLEUR: Record<string, string> = {
  WIT_GEEL: 'GEEL',
  GEEL_ORANJE: 'ORANJE',
  ORANJE_GROEN: 'GROEN',
  GROEN_BLAUW: 'BLAUW',
  BLAUW_BRUIN: 'BRUIN',
}

export function BeltVak({ belt, size = 10 }: { belt: string | null; size?: number }) {
  const c = (k: string) => (BELT_COLORS as Record<string, string>)[k] ?? '#ccc'
  let links = '#7C3AED' // paars = nog geen band
  let rechts = '#7C3AED'
  if (belt) {
    const slipBasis = SLIP_KLEUR[belt]
    if (slipBasis) {
      links = c(belt)      // BELT_COLORS geeft bij slipband de basiskleur
      rechts = c(slipBasis)
    } else {
      links = rechts = c(belt)
    }
  }
  return (
    <span
      className="inline-flex shrink-0 overflow-hidden rounded-[3px] border border-gray-300/80 align-middle"
      style={{ width: size * 2, height: size }}
    >
      <span className="flex-1" style={{ background: links }} />
      <span className="flex-1" style={{ background: rechts }} />
    </span>
  )
}
