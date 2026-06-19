import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Filters } from '@/components/band-overzicht/Filters'
import { Summary } from '@/components/band-overzicht/Summary'
import { MemberCard } from '@/components/band-overzicht/MemberCard'
import type { BeltLevel } from '@prisma/client'
import type { TrainingGroupValue } from '@/lib/student-progress-types'
import {
  isYouth, getNextBelt, getTimeInBelt, isSlipBelt, isDanGrade,
  getDanNumber, getDanColorClass, getBeltLabel,
} from '@/lib/belt-utils'

export const dynamic = 'force-dynamic'

interface BeltOverviewMember {
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
  lastExamDate: Date | null
  timeInBelt: { years: number; months: number; weeks: number; text: string }
  nextBelt: BeltLevel | null
  nextBeltLabel: string | null
  nextBeltIsSlip: boolean
  examCount: number
}

async function fetchMembers(location: string, belt: string, group: string, q: string) {
  const where: any = { isActive: true }
  if (location && location !== 'ALL') where.location = location
  if (belt) where.currentBelt = belt
  if (group && group !== 'ALL') {
    where.trainingGroups = { array_contains: [group] }
  }
  if (q) {
    where.OR = [
      { firstName: { contains: q, mode: 'insensitive' } },
      { lastName: { contains: q, mode: 'insensitive' } },
    ]
  }

  const members = await db.member.findMany({
    where,
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    include: {
      examAttempts: {
        where: { status: 'COMPLETED_PASSED' },
        orderBy: { examDate: 'desc' },
        select: { examDate: true, beltLevel: true },
      },
    },
  })

  return members.map((m) => {
    const youth = isYouth(m.dateOfBirth)
    const beltVal = m.currentBelt as BeltLevel | null
    const passedExams = m.examAttempts
    const lastPassed = passedExams.length > 0 ? passedExams[0].examDate : null
    const next = getNextBelt(beltVal, youth)

    return {
      memberId: m.id,
      firstName: m.firstName,
      lastName: m.lastName,
      isYouth: youth,
      location: (m as any).location || null,
      trainingGroups: (m as any).trainingGroups || [],
      primaryGroup: (m as any).primaryGroup || null,
      currentBelt: beltVal,
      currentBeltLabel: getBeltLabel(beltVal),
      currentBeltIsSlip: beltVal ? isSlipBelt(beltVal) : false,
      currentBeltIsDan: beltVal ? isDanGrade(beltVal) : false,
      danNumber: beltVal ? getDanNumber(beltVal) : null,
      danColorClass: beltVal ? getDanColorClass(beltVal) : '',
      lastExamDate: lastPassed,
      timeInBelt: getTimeInBelt(lastPassed, m.joinDate),
      nextBelt: next,
      nextBeltLabel: next ? getBeltLabel(next) : null,
      nextBeltIsSlip: next ? isSlipBelt(next) : false,
      examCount: passedExams.length,
    } as BeltOverviewMember
  })
}

export default async function BandOverzichtPage({
  searchParams,
}: {
  searchParams: Promise<{ location?: string; belt?: string; group?: string; q?: string }>
}) {
  const admin = await requireAdmin()
  if (!admin) redirect('/admin-login')

  const params = await searchParams
  const location = params.location || 'ALL'
  const belt = params.belt || ''
  const group = params.group || 'ALL'
  const q = params.q || ''

  let members: BeltOverviewMember[] = []
  let error: string | null = null

  try {
    members = await fetchMembers(location, belt, group, q)
  } catch (e: any) {
    error = `Database fout: ${e.message}`
  }

  const summary = {
    total: members.length,
    youth: members.filter((m) => m.isYouth).length,
    adults: members.filter((m) => !m.isYouth).length,
    danGrades: members.filter((m) => m.currentBeltIsDan).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#2a2a2a]">🥋 Bandoverzicht</h1>
        <p className="text-sm text-gray-500">
          Overzicht van alle leden, hun graad en volgende stap
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filters */}
      <Filters />

      {/* Summary */}
      <Summary {...summary} />

      {/* Member list */}
      {members.length === 0 && !error ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
          Geen leden gevonden met de huidige filters.
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((m) => (
            <MemberCard key={m.memberId} {...m} />
          ))}
        </div>
      )}
    </div>
  )
}
