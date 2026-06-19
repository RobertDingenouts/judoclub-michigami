'use client'

import type { BeltLevel } from '@prisma/client'
import { BELT_LABELS_NL, BELT_COLORS } from '@/lib/student-progress-types'
import { isSlipBelt, getDanColorClass } from '@/lib/belt-utils'

// Slip belt → base color + slip color mapping
const SLIP_COLOR_MAP: Record<string, { base: string; slip: string }> = {
  WIT_GEEL:     { base: '#FFFFFF', slip: '#FFD700' },
  GEEL_ORANJE:  { base: '#FFD700', slip: '#FF8C00' },
  ORANJE_GROEN: { base: '#FF8C00', slip: '#228B22' },
  GROEN_BLAUW:  { base: '#228B22', slip: '#0000FF' },
  BLAUW_BRUIN:  { base: '#0000FF', slip: '#8B4513' },
}

interface BeltBadgeProps {
  belt: BeltLevel | null
  showLabel?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export function BeltBadge({ belt, showLabel = true, size = 'md', className = '' }: BeltBadgeProps) {
  if (!belt) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`rounded border border-gray-300 bg-gray-200 ${size === 'sm' ? 'h-3 w-6' : 'h-4 w-8'}`} />
        {showLabel && <span className={`text-gray-400 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>Niet ingesteld</span>}
      </div>
    )
  }

  const color = BELT_COLORS[belt] || '#CCCCCC'
  const label = BELT_LABELS_NL[belt] || belt
  const isSlip = isSlipBelt(belt)
  const danClass = getDanColorClass(belt)

  const slipColors = SLIP_COLOR_MAP[belt]

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`rounded border border-gray-300 ${size === 'sm' ? 'h-3 w-6' : 'h-4 w-8'} ${danClass || ''}`}
        style={
          !danClass && isSlip && slipColors
            ? {
                background: `linear-gradient(to right, ${slipColors.base} 70%, ${slipColors.slip} 70%)`,
              }
            : !danClass
              ? { backgroundColor: color }
              : undefined
        }
        title={label}
      />
      {showLabel && <span className={`font-medium ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>{label}</span>}
    </div>
  )
}
