import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { DiplomaType } from '@prisma/client'
import crypto from 'crypto'
import { migrateGuard } from '@/lib/migrate-guard'

export const dynamic = 'force-dynamic'

// One-time migration: Create missing diplomas for passed Japanese course levels
// Also fix unlock state based on actual progress
export async function POST() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Alleen admins' }, { status: 403 })
  }

  try {
    const BELT_ORDER = ['WIT', 'GEEL', 'ORANJE', 'GROEN', 'BLAUW', 'BRUIN'] as const

    const BELT_LABELS: Record<string, string> = {
      WIT: 'Witte Band',
      GEEL: 'Gele Band',
      ORANJE: 'Oranje Band',
      GROEN: 'Groene Band',
      BLAUW: 'Blauwe Band',
      BRUIN: 'Bruine Band',
    }

    function generateCode(): string {
      const p1 = crypto.randomBytes(2).toString('hex').toUpperCase()
      const p2 = crypto.randomBytes(2).toString('hex').toUpperCase()
      return `JP-${p1}-${p2}`
    }

    // Get all users with Japanese course progress
    const allProgress = await db.courseProgress.findMany({
      where: { courseName: 'japanese' },
      include: { member: true },
    })

    // Group by userId
    const byUser = new Map<string, typeof allProgress>()
    for (const p of allProgress) {
      if (!byUser.has(p.userId)) byUser.set(p.userId, [])
      byUser.get(p.userId)!.push(p)
    }

    let diplomasCreated = 0
    let unlocksFixed = 0

    for (const [userId, progressList] of byUser) {
      // Fix unlock state: if a belt is passed, all next belts should be unlocked
      for (let i = 0; i < progressList.length; i++) {
        const cp = progressList[i]
        const beltIndex = BELT_ORDER.indexOf(cp.beltLevel as any)

        if (cp.isPassed && beltIndex < BELT_ORDER.length - 1) {
          // Unlock all subsequent belts for this user
          for (let j = beltIndex + 1; j < BELT_ORDER.length; j++) {
            const nextBelt = BELT_ORDER[j]
            const nextCp = progressList.find(p => p.beltLevel === nextBelt)
            if (nextCp && !nextCp.isUnlocked) {
              await db.courseProgress.update({
                where: { id: nextCp.id },
                data: { isUnlocked: true },
              })
              unlocksFixed++
            }
          }
        }

        // Create missing diploma for passed levels
        if (cp.isPassed) {
          const existingDiploma = await db.diploma.findFirst({
            where: {
              userId,
              type: DiplomaType.COURSE_JAPANESE,
              beltLevel: cp.beltLevel,
            },
          })

          if (!existingDiploma && cp.member) {
            const beltLabel = BELT_LABELS[cp.beltLevel] || cp.beltLevel
            const title = `Cursus Japans — ${beltLabel}`
            let code = generateCode()
            let attempts = 0
            while (await db.diploma.findUnique({ where: { verificationCode: code } })) {
              code = generateCode()
              attempts++
              if (attempts > 10) break
            }

            await db.diploma.create({
              data: {
                type: DiplomaType.COURSE_JAPANESE,
                title,
                recipientId: cp.member.id,
                userId,
                beltLevel: cp.beltLevel,
                courseName: 'japanese',
                verificationCode: code,
                awardedAt: cp.lastActivityAt || new Date(),
              },
            })
            diplomasCreated++
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Diploma's aangemaakt: ${diplomasCreated}, Ontgrendelingen gefixt: ${unlocksFixed}`,
    })
  } catch (error: any) {
    console.error('Migration error:', error)
    return NextResponse.json({ error: error.message || 'Migration failed' }, { status: 500 })
  }
}
