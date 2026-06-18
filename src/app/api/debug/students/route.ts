import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const admin = await isAdmin()
  if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 })

  const errors: string[] = []
  const results: Record<string, any> = {}

  // Test 1: Simple count
  try {
    results.count = await db.member.count()
  } catch (e: any) {
    errors.push(`count: ${e.message}`)
  }

  // Test 2: FindMany with location
  try {
    results.findMany = await db.member.findMany({
      where: { isActive: true },
      take: 2,
      select: { id: true, firstName: true, location: true },
    })
  } catch (e: any) {
    errors.push(`findMany: ${e.message}`)
  }

  // Test 3: GroupBy location
  try {
    results.groupBy = await db.member.groupBy({
      where: { isActive: true, location: { not: null } },
      by: ['location'],
      _count: { location: true },
    })
  } catch (e: any) {
    errors.push(`groupBy: ${e.message}`)
  }

  // Test 4: Full query like students page
  try {
    results.fullQuery = await db.member.findMany({
      where: { isActive: true },
      orderBy: { lastName: 'asc' },
      include: {
        user: { select: { role: true, currentBelt: true } },
        examAttempts: {
          where: { status: 'COMPLETED_PASSED' },
          orderBy: { examDate: 'desc' },
          take: 1,
        },
        courseProgress: {
          where: { isUnlocked: true },
          select: { courseName: true, lessonsCompleted: true, lessonsTotal: true, overallScore: true },
        },
      },
      take: 2,
    })
  } catch (e: any) {
    errors.push(`fullQuery: ${e.message}`)
  }

  return NextResponse.json({ errors, results })
}
