import { getBeltColor } from '@/lib/belt-utils'
import { BeltLevel } from '@prisma/client'

const HALF: Record<string, [string, string]> = {
  WIT_GEEL: ['WIT', 'GEEL'],
  GEEL_ORANJE: ['GEEL', 'ORANJE'],
  ORANJE_GROEN: ['ORANJE', 'GROEN'],
  GROEN_BLAUW: ['GROEN', 'BLAUW'],
  BLAUW_BRUIN: ['BLAUW', 'BRUIN'],
}

// Bandje-badge: volle band = effen rechthoek, slip = diagonaal half huidig / half nieuwe kleur (echte halfslip)
export function BeltBadge({ belt, height = 'h-4', width = 'w-7', className = '' }: { belt: string | null; height?: string; width?: string; className?: string }) {
  const halves = belt ? HALF[belt] : undefined
  const background = halves
    ? `linear-gradient(135deg, ${getBeltColor(halves[0] as BeltLevel)} 0%, ${getBeltColor(halves[0] as BeltLevel)} 49.5%, ${getBeltColor(halves[1] as BeltLevel)} 50.5%, ${getBeltColor(halves[1] as BeltLevel)} 100%)`
    : getBeltColor((belt ?? null) as BeltLevel | null)
  return <span style={{ background }} className={`inline-block shrink-0 rounded-[2px] border border-black/25 ${height} ${width} ${className}`} />
}
