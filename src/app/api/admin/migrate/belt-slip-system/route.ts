/**
 * POST /api/admin/migrate/belt-slip-system
 * 
 * Migrates old belt enum values to new slip system:
 * - BRUIN_1/2/3 → BRUIN
 * - Zwart_1/2/3 → ZWART_1/2/3
 * - Adds new slip levels (WIT_GEEL, GEEL_ORANJE, etc.)
 * - Extends ZWART to 10 dan levels
 * 
 * WARNING: Run once after Prisma migration is deployed!
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { migrateGuard } from '@/lib/migrate-guard'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const guard = await migrateGuard(request)
  if (guard) return guard
  try {
    // No auth required - one-time migration endpoint
    // Delete this file after running!

    const results = {
      usersUpdated: 0,
      membersUpdated: 0,
      examsUpdated: 0,
      diplomasUpdated: 0,
      courseProgressUpdated: 0,
      errors: [] as string[],
    }

    // Belt mapping from old to new
    const beltMap: Record<string, string> = {
      BRUIN_1: 'BRUIN',
      BRUIN_2: 'BRUIN',
      BRUIN_3: 'BRUIN',
      Zwart_1: 'ZWART_1',
      Zwart_2: 'ZWART_2',
      Zwart_3: 'ZWART_3',
    }

    // Migrate User table
    try {
      const users = await db.user.findMany({
        where: {
          currentBelt: {
            in: Object.keys(beltMap) as any,
          },
        },
      })

      for (const user of users) {
        if (user.currentBelt && beltMap[user.currentBelt as string]) {
          await db.user.update({
            where: { id: user.id },
            data: { currentBelt: beltMap[user.currentBelt as string] as any },
          })
          results.usersUpdated++
        }
      }
    } catch (e: any) {
      results.errors.push(`User migration: ${e.message}`)
    }

    // Migrate Member table
    try {
      const members = await db.member.findMany({
        where: {
          currentBelt: {
            in: Object.keys(beltMap) as any,
          },
        },
      })

      for (const member of members) {
        if (member.currentBelt && beltMap[member.currentBelt as string]) {
          await db.member.update({
            where: { id: member.id },
            data: { currentBelt: beltMap[member.currentBelt as string] as any },
          })
          results.membersUpdated++
        }
      }
    } catch (e: any) {
      results.errors.push(`Member migration: ${e.message}`)
    }

    // Migrate ExamAttempt table
    try {
      const exams = await db.examAttempt.findMany({
        where: {
          beltLevel: {
            in: Object.keys(beltMap) as any,
          },
        },
      })

      for (const exam of exams) {
        if (beltMap[exam.beltLevel as string]) {
          await db.examAttempt.update({
            where: { id: exam.id },
            data: { beltLevel: beltMap[exam.beltLevel as string] as any },
          })
          results.examsUpdated++
        }
      }
    } catch (e: any) {
      results.errors.push(`Exam migration: ${e.message}`)
    }

    // Migrate Diploma table
    try {
      const diplomas = await db.diploma.findMany({
        where: {
          beltLevel: {
            in: Object.keys(beltMap) as any,
          },
        },
      })

      for (const diploma of diplomas) {
        if (diploma.beltLevel && beltMap[diploma.beltLevel as string]) {
          await db.diploma.update({
            where: { id: diploma.id },
            data: { beltLevel: beltMap[diploma.beltLevel as string] as any },
          })
          results.diplomasUpdated++
        }
      }
    } catch (e: any) {
      results.errors.push(`Diploma migration: ${e.message}`)
    }

    // Migrate CourseProgress table
    try {
      const progress = await db.courseProgress.findMany({
        where: {
          beltLevel: {
            in: Object.keys(beltMap) as any,
          },
        },
      })

      for (const item of progress) {
        if (beltMap[item.beltLevel as string]) {
          await db.courseProgress.update({
            where: { id: item.id },
            data: { beltLevel: beltMap[item.beltLevel as string] as any },
          })
          results.courseProgressUpdated++
        }
      }
    } catch (e: any) {
      results.errors.push(`CourseProgress migration: ${e.message}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Belt slip system migratie voltooid',
      ...results,
    })
  } catch (error: any) {
    console.error('Belt slip migration error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Er ging iets mis' },
      { status: 500 }
    )
  }
}
