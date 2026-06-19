import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import type { BeltLevel } from '@prisma/client'
import {
  isYouth, getNextBelt, getTimeInBelt, isSlipBelt, isDanGrade,
  getDanNumber, getDanColorClass, getBeltLabel, getBeltColor,
} from '@/lib/belt-utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const location = searchParams.get('location') || 'ALL'
  const belt = searchParams.get('belt') || ''
  const q = searchParams.get('q') || ''

  try {
    const where: any = { isActive: true }
    if (location !== 'ALL') where.location = location
    if (belt) where.currentBelt = belt
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

    const result = members.map((m) => {
      const youth = isYouth(m.dateOfBirth)
      const beltVal = m.currentBelt as BeltLevel | null
      const passedExams = m.examAttempts
      const lastPassed = passedExams.length > 0 ? passedExams[0].examDate : null

      return {
        memberId: m.id,
        firstName: m.firstName,
        lastName: m.lastName,
        email: m.email,
        dateOfBirth: m.dateOfBirth,
        age: youth ? null : null,
        isYouth: youth,
        location: m.location,
        currentBelt: beltVal,
        currentBeltLabel: getBeltLabel(beltVal),
        currentBeltColor: getBeltColor(beltVal),
        currentBeltIsSlip: beltVal ? isSlipBelt(beltVal) : false,
        currentBeltIsDan: beltVal ? isDanGrade(beltVal) : false,
        danNumber: beltVal ? getDanNumber(beltVal) : null,
        danColorClass: beltVal ? getDanColorClass(beltVal) : '',
        joinDate: m.joinDate,
        lastExamDate: lastPassed,
        timeInBelt: getTimeInBelt(lastPassed, m.joinDate),
        nextBelt: getNextBelt(beltVal, youth),
        nextBeltLabel: getNextBelt(beltVal, youth) ? getBeltLabel(getNextBelt(beltVal, youth)) : null,
        nextBeltIsSlip: getNextBelt(beltVal, youth) ? isSlipBelt(getNextBelt(beltVal, youth)!) : false,
        examCount: passedExams.length,
      }
    })

    // Summary
    const byLocation: Record<string, number> = {}
    const byBelt: Record<string, number> = {}
    let youthCount = 0
    let adultCount = 0
    let slipCount = 0
    let danCount = 0

    result.forEach((m) => {
      const loc = m.location || 'Onbekend'
      byLocation[loc] = (byLocation[loc] || 0) + 1
      const bLabel = m.currentBeltLabel
      byBelt[bLabel] = (byBelt[bLabel] || 0) + 1
      if (m.isYouth) youthCount++; else adultCount++
      if (m.currentBeltIsSlip) slipCount++
      if (m.currentBeltIsDan) danCount++
    })

    return NextResponse.json({
      members: result,
      summary: {
        total: result.length,
        byLocation,
        byBelt,
        youth: youthCount,
        adults: adultCount,
        hasSlip: slipCount,
        danGrades: danCount,
      },
    })
  } catch (e: any) {
    console.error('Band overzicht error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
