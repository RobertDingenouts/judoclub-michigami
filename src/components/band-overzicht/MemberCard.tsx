'use client'

import Link from 'next/link'
import type { BeltLevel } from '@prisma/client'
import { BeltBadge } from './BeltBadge'
import { LOCATION_LABELS_NL } from '@/lib/student-progress-types'

interface MemberCardProps {
  memberId: string
  firstName: string
  lastName: string
  isYouth: boolean
  location: string | null
  currentBelt: BeltLevel | null
  currentBeltLabel: string
  timeInBelt: { text: string }
  nextBeltLabel: string | null
  nextBeltIsSlip: boolean
  examCount: number
}

export function MemberCard({
  memberId, firstName, lastName, isYouth, location,
  currentBelt, currentBeltLabel, timeInBelt,
  nextBeltLabel, nextBeltIsSlip, examCount,
}: MemberCardProps) {
  const locLabel = location ? (LOCATION_LABELS_NL as any)[location] || location : '—'

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Name + info */}
        <div className="space-y-1">
          <h3 className="font-semibold text-[#2a2a2a]">{firstName} {lastName}</h3>
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span className="rounded bg-gray-100 px-2 py-0.5">{locLabel}</span>
            <span className={`rounded px-2 py-0.5 ${isYouth ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
              {isYouth ? 'Jeugd' : 'Volw.'}
            </span>
            {examCount > 0 && (
              <span className="rounded bg-amber-50 px-2 py-0.5 text-amber-700">
                {examCount} examen{examCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Middle: Current belt + time */}
        <div className="space-y-1">
          <BeltBadge belt={currentBelt} />
          <p className="text-xs text-gray-500">In bezit: {timeInBelt.text}</p>
        </div>

        {/* Right: Next belt + action */}
        <div className="flex flex-col items-end gap-2">
          {nextBeltLabel ? (
            <div>
              <p className="text-xs text-gray-400">Volgende:</p>
              <p className={`text-sm font-medium ${nextBeltIsSlip ? 'text-purple-600' : 'text-[#a90000]'}`}>
                {nextBeltLabel}
                {nextBeltIsSlip && <span className="ml-1 text-xs text-purple-400">(slip)</span>}
              </p>
            </div>
          ) : (
            <span className="text-xs font-medium text-gray-400">Max graad ✓</span>
          )}
          <Link
            href={`/admin/students/${memberId}`}
            className="text-xs font-medium text-[#a90000] hover:underline"
          >
            Bekijken →
          </Link>
        </div>
      </div>
    </div>
  )
}
