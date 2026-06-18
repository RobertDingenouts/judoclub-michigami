/**
 * POST /api/cursus-japans/sync
 * Sync Japanese course quiz results to database.
 * Creates/updates CourseProgress, generates diploma on pass, unlocks next level.
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { DiplomaType } from '@prisma/client'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

// Map Japanese course level numbers (0-5) to belt level strings
const LEVEL_TO_BELT: Record<number, string> = {
  0: 'WIT',
  1: 'GEEL',
  2: 'ORANJE',
  3: 'GROEN',
  4: 'BLAUW',
  5: 'BRUIN',
}

// Belt order for unlocking
const BELT_ORDER = ['WIT', 'GEEL', 'ORANJE', 'GROEN', 'BLAUW', 'BRUIN'] as const
type JapaneseBelt = (typeof BELT_ORDER)[number]

function generateVerificationCode(): string {
  const part1 = crypto.randomBytes(2).toString('hex').toUpperCase()
  const part2 = crypto.randomBytes(2).toString('hex').toUpperCase()
  return `JP-${part1}-${part2}`
}

const BELT_LABELS: Record<string, string> = {
  WIT: 'Witte Band',
  GEEL: 'Gele Band',
  ORANJE: 'Oranje Band',
  GROEN: 'Groene Band',
  BLAUW: 'Blauwe Band',
  BRUIN: 'Bruine Band',
}

async function upsertCourseProgress(
  userId: string,
  memberId: string,
  beltLevel: JapaneseBelt,
  data: Partial<{
    lessonsCompleted: number
    lessonsTotal: number
    overallScore: number
    isPassed: boolean
    isUnlocked: boolean
    wordsLearned: number
    wordsTotal: number
    wordsQuizScore: number
    lastActivityAt: Date
  }>
) {
  const existing = await db.courseProgress.findFirst({
    where: {
      userId,
      courseName: 'japanese',
      beltLevel: beltLevel as any,
    },
  })

  if (existing) {
    return db.courseProgress.update({
      where: { id: existing.id },
      data,
    })
  } else {
    return db.courseProgress.create({
      data: {
        userId,
        memberId,
        courseName: 'japanese',
        beltLevel: beltLevel as any,
        lessonsCompleted: 0,
        lessonsTotal: 1,
        overallScore: 0,
        isPassed: false,
        isUnlocked: true,
        wordsLearned: 0,
        wordsTotal: 0,
        wordsQuizScore: 0,
        ...data,
      },
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Niet ingelogd' },
        { status: 401 }
      )
    }

    // Defensive: auto-create Member for admin users without one
    const member = user.member || await db.member.create({
      data: {
        userId: user.id,
        firstName: (user.name || '').split(' ')[0] || 'Admin',
        lastName: (user.name || '').split(' ').slice(1).join(' ') || '',
        email: user.email,
        joinDate: new Date(),
        currentBelt: 'WIT' as any,
      },
    })

    const body = await request.json()
    const { beltLevel: levelNum, score, totalQuestions, wordsLearned, wordsTotal } = body

    if (typeof levelNum !== 'number' || levelNum < 0 || levelNum > 5) {
      return NextResponse.json(
        { success: false, error: 'Ongeldig bandniveau' },
        { status: 400 }
      )
    }

    const beltLevel = LEVEL_TO_BELT[levelNum] as JapaneseBelt
    if (!beltLevel) {
      return NextResponse.json(
        { success: false, error: 'Bandniveau niet ondersteund' },
        { status: 400 }
      )
    }

    const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0
    const passed = percentage >= 80

    // Upsert CourseProgress record
    await upsertCourseProgress(user.id, member.id, beltLevel, {
      lessonsCompleted: passed ? 1 : Math.min(1, score / totalQuestions),
      overallScore: percentage,
      isPassed: passed,
      wordsLearned: wordsLearned || score,
      wordsTotal: wordsTotal || totalQuestions,
      wordsQuizScore: percentage,
      lastActivityAt: new Date(),
    })

    let diplomaInfo: { id: string; verificationCode: string; title: string } | null = null

    // If passed and no diploma exists yet, create one
    if (passed) {
      const existingDiploma = await db.diploma.findFirst({
        where: {
          userId: user.id,
          type: DiplomaType.COURSE_JAPANESE,
          beltLevel: beltLevel as any,
        },
      })

      if (!existingDiploma) {
        const beltLabel = BELT_LABELS[beltLevel] || beltLevel
        const recipientName = `${member.firstName} ${member.lastName}`
        const title = `Online Cursus Japans — ${beltLabel}`
        const description = `Hierbij wordt bevestigd dat ${recipientName} met succes het examen voor de Japanse judo-terminologie (${beltLabel}) heeft afgelegd bij Judoclub Michigami Steenbergen.`

        let verificationCode = generateVerificationCode()
        let attempts = 0
        while (attempts < 10) {
          const exists = await db.diploma.findUnique({
            where: { verificationCode },
          })
          if (!exists) break
          verificationCode = generateVerificationCode()
          attempts++
        }

        const diploma = await db.diploma.create({
          data: {
            type: DiplomaType.COURSE_JAPANESE,
            title,
            description,
            recipientId: member.id,
            userId: user.id,
            beltLevel: beltLevel as any,
            courseName: 'japanese',
            verificationCode,
            awardedAt: new Date(),
          },
        })

        diplomaInfo = {
          id: diploma.id,
          verificationCode: diploma.verificationCode,
          title: diploma.title,
        }
      }
    }

    // Unlock all subsequent belt levels if this one was passed
    if (passed) {
      const currentIndex = BELT_ORDER.indexOf(beltLevel)
      for (let i = currentIndex + 1; i < BELT_ORDER.length; i++) {
        const nextBelt = BELT_ORDER[i]
        await upsertCourseProgress(user.id, member.id, nextBelt, {
          isUnlocked: true,
        })
      }
    }

    return NextResponse.json({
      success: true,
      passed,
      percentage: Math.round(percentage),
      beltLevel,
      diploma: diplomaInfo,
      message: passed
        ? `Gefeliciteerd! Je hebt ${BELT_LABELS[beltLevel]} gehaald!`
        : 'Blijf oefenen — je hebt minstens 80% nodig.',
    })
  } catch (error: any) {
    console.error('Cursus Japans sync error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Er ging iets mis' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/cursus-japans/progress
 * Get user's Japanese course progress for all belt levels.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Niet ingelogd' },
        { status: 401 }
      )
    }

    // Defensive: auto-create Member for admin users without one
    const member = user.member || await db.member.create({
      data: {
        userId: user.id,
        firstName: (user.name || '').split(' ')[0] || 'Admin',
        lastName: (user.name || '').split(' ').slice(1).join(' ') || '',
        email: user.email,
        joinDate: new Date(),
        currentBelt: 'WIT' as any,
      },
    })

    // Initialize missing belt levels
    const existing = await db.courseProgress.findMany({
      where: {
        userId: user.id,
        courseName: 'japanese',
      },
    })

    const existingBelts = new Set(existing.map((cp) => cp.beltLevel))

    // First belt is always unlocked; all belts after a passed one are unlocked
    for (const belt of BELT_ORDER) {
      if (!existingBelts.has(belt as any)) {
        const beltIndex = BELT_ORDER.indexOf(belt)
        // Unlock if any previous belt is passed
        const prevPassed = existing.some(
          (cp) => {
            const cpIndex = BELT_ORDER.indexOf(cp.beltLevel as any)
            return cpIndex < beltIndex && cp.isPassed
          }
        )

        await db.courseProgress.create({
          data: {
            userId: user.id,
            memberId: member.id,
            courseName: 'japanese',
            beltLevel: belt as any,
            lessonsCompleted: 0,
            lessonsTotal: 1,
            overallScore: 0,
            isPassed: false,
            isUnlocked: beltIndex === 0 || prevPassed,
            wordsLearned: 0,
            wordsTotal: 0,
            wordsQuizScore: 0,
          },
        })
      }
    }

    // Fetch all progress + diplomas
    const progress = await db.courseProgress.findMany({
      where: {
        userId: user.id,
        courseName: 'japanese',
      },
      orderBy: { beltLevel: 'asc' },
    })

    const diplomas = await db.diploma.findMany({
      where: {
        userId: user.id,
        type: DiplomaType.COURSE_JAPANESE,
      },
      orderBy: { awardedAt: 'desc' },
      select: {
        id: true,
        title: true,
        beltLevel: true,
        verificationCode: true,
        awardedAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      progress,
      diplomas,
    })
  } catch (error: any) {
    console.error('Cursus Japans progress error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Er ging iets mis' },
      { status: 500 }
    )
  }
}
