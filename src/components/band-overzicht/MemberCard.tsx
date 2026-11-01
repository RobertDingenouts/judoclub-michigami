'use client'

import Link from 'next/link'
import type { BeltLevel } from '@prisma/client'
import { BeltBadge } from './BeltBadge'
import { BELT_COLORS, LOCATION_LABELS_NL, GROUP_SHORT_LABELS } from '@/lib/student-progress-types'
import { getDanColorClass, isSlipBelt } from '@/lib/belt-utils'
import type { TrainingGroupValue } from '@/lib/student-progress-types'

interface MemberCardProps {
  memberId: string
  firstName: string
  lastName: string
  isYouth: boolean
  location: string | null
  trainingGroups: TrainingGroupValue[]
  primaryGroup: TrainingGroupValue | null
  currentBelt: BeltLevel | null
  currentBeltLabel: string
  currentBeltIsSlip: boolean
  currentBeltIsDan: boolean
  danNumber: number | null
  danColorClass: string
  timeInBelt: { text: string }
  nextBelt: BeltLevel | null
  nextBeltLabel: string | null
  nextBeltIsSlip: boolean
  examCount: number
}

export function MemberCard({
  memberId, firstName, lastName, isYouth, location, trainingGroups, primaryGroup,
  currentBelt, currentBeltLabel, currentBeltIsSlip, currentBeltIsDan,
  danColorClass, timeInBelt, nextBelt, nextBeltLabel, nextBeltIsSlip, examCount,
}: MemberCardProps) {
  const locLabel = location ? (LOCATION_LABELS_NL as any)[location] || location : '—'
  const nextColor = nextBelt ? (BELT_COLORS[nextBelt] || '#CCCCCC') : null
  const nextDanClass = nextBelt ? getDanColorClass(nextBelt) : ''

  const groupBadges = (trainingGroups || []).map(g => (
    <span
      key={g}
      className={`text-[10px] font-medium px-1.5 py-0 rounded ${
        g === primaryGroup
          ? 'bg-[#a90000] text-white'
          : 'bg-gray-100 text-gray-600'
      }`}
      title={g === primaryGroup ? 'Hoofdgroep (examens)' : ''}
    >
      {GROUP_SHORT_LABELS[g] || g}
    </span>
  ))

  return (
    <div className="rounded-sm border border-gray-200 bg-white hover:shadow-md transition-shadow">
      {/* Desktop: compact table row */}
      <div className="hidden sm:grid sm:grid-cols-12 gap-3 items-center px-4 py-2.5">
        {/* Naam + locatie */}
        <div className="col-span-3">
          <p className="font-semibold text-sm text-[#2a2a2a]">{firstName} {lastName}</p>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className="text-xs text-gray-500">{locLabel}</span>
            <span className={`text-[10px] font-medium px-1.5 py-0 rounded ${isYouth ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
              {isYouth ? 'J' : 'V'}
            </span>
            {groupBadges.length > 0 && (
              <div className="flex gap-1 ml-1">
                {groupBadges}
              </div>
            )}
          </div>
        </div>

        {/* Huidige graad */}
        <div className="col-span-3">
          <BeltBadge belt={currentBelt} size="sm" />
          <p className="text-xs text-gray-400 mt-0.5">In bezit: {timeInBelt.text}</p>
        </div>

        {/* Volgende graad */}
        <div className="col-span-3">
          {nextBeltLabel ? (
            <div className="flex items-center gap-2">
              <BeltBadge belt={nextBelt} size="sm" showLabel={false} />
              <div>
                <p className={`text-sm font-medium ${nextBeltIsSlip ? 'text-purple-600' : 'text-[#a90000]'}`}>
                  {nextBeltLabel}
                </p>
                {nextBeltIsSlip && <span className="text-[10px] text-purple-400">slip</span>}
              </div>
            </div>
          ) : (
            <span className="text-xs font-medium text-gray-400">Max graad ✓</span>
          )}
        </div>

        {/* Acties */}
        <div className="col-span-3 flex items-center justify-end gap-3">
          {examCount > 0 && (
            <span className="text-xs text-gray-400">{examCount} examen{examCount > 1 ? 's' : ''}</span>
          )}
          <Link
            href={`/admin/students/${memberId}`}
            className="text-xs font-medium text-[#a90000] hover:underline whitespace-nowrap"
          >
            Bekijken →
          </Link>
        </div>
      </div>

      {/* Mobile: stacked card */}
      <div className="sm:hidden p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-[#2a2a2a]">{firstName} {lastName}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-500">{locLabel}</span>
              <span className={`text-[10px] font-medium px-1.5 py-0 rounded ${isYouth ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                {isYouth ? 'Jeugd' : 'Volw.'}
              </span>
            </div>
          </div>
          <Link href={`/admin/students/${memberId}`} className="text-xs font-medium text-[#a90000]">
            Bekijken →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-400 mb-1">Huidige graad</p>
            <BeltBadge belt={currentBelt} size="sm" />
            <p className="text-xs text-gray-400 mt-1">{timeInBelt.text}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Volgende graad</p>
            {nextBeltLabel ? (
              <div className="flex items-center gap-2">
                <BeltBadge belt={nextBelt} size="sm" showLabel={false} />
                <p className={`text-sm font-medium ${nextBeltIsSlip ? 'text-purple-600' : 'text-[#a90000]'}`}>
                  {nextBeltLabel}
                </p>
              </div>
            ) : (
              <span className="text-xs text-gray-400">Max graad ✓</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
