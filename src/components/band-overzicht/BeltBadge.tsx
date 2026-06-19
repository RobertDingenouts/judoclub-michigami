'use client'

import type { BeltLevel } from '@prisma/client'
import { BELT_LABELS_NL, BELT_COLORS } from '@/lib/student-progress-types'
import { isSlipBelt, getDanColorClass } from '@/lib/belt-utils'

interface BeltBadgeProps {
  belt: BeltLevel | null
  showLabel?: boolean
  className?: string
}

export function BeltBadge({ belt, showLabel = true, className = '' }: BeltBadgeProps) {
  if (!belt) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="h-4 w-8 rounded border border-gray-300 bg-gray-200" />
        {showLabel && <span className="text-sm text-gray-400">Niet ingesteld</span>}
      </div>
    )
  }

  const color = BELT_COLORS[belt] || '#CCCCCC'
  const label = BELT_LABELS_NL[belt] || belt
  const isSlip = isSlipBelt(belt)
  const danClass = getDanColorClass(belt)

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`h-4 w-8 rounded border border-gray-300 ${danClass || ''}`}
        style={!danClass ? { backgroundColor: color } : undefined}
        title={label}
      />
      {showLabel && <span className="text-sm font-medium">{label}</span>}
    </div>
  )
}
