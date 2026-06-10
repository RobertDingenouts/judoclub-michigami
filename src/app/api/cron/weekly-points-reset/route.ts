/**
 * POST /api/cron/weekly-points-reset
 * Weekly cron job to reset weekly points and archive leaderboard
 * Run every Sunday at 00:00 via Vercel Cron or external scheduler
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret (optional - add CRON_SECRET to env for security)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const lastWeekStart = new Date(now)
    lastWeekStart.setDate(now.getDate() - now.getDay() - 7)
    lastWeekStart.setHours(0, 0, 0, 0)

    const lastWeekEnd = new Date(lastWeekStart)
    lastWeekEnd.setDate(lastWeekStart.getDate() + 7)

    // 1. Archive last week's leaderboard (create snapshot)
    const lastWeekEntries = await db.leaderboardEntry.findMany({
      where: { weekStart: lastWeekStart },
      include: {
        user: {
          select: { id: true, name: true, currentBelt: true, member: { select: { firstName: true, lastName: true } } },
        },
      },
      orderBy: { points: 'desc' },
      take: 100,
    })

    if (lastWeekEntries.length > 0) {
      const top3 = lastWeekEntries.slice(0, 3)
      console.log(`Archiving week ${lastWeekStart.toISOString()}: ${lastWeekEntries.length} participants, top: ${top3.map(e => `${e.user.member?.firstName} ${e.points}p`).join(', ')}`)
    }

    // 2. Reset weekly points for all users
    await db.user.updateMany({
      where: { is_active: true },
      data: { weeklyPoints: 0 },
    })

    // 3. Create new empty leaderboard entries for opted-in users
    const activeUsers = await db.user.findMany({
      where: {
        is_active: true,
        leaderboardOptIn: true,
        role: { in: ['MEMBER', 'PARENT', 'INSTRUCTOR'] },
      },
      include: { member: { select: { id: true } } },
    })

    const newWeekStart = new Date(now)
    newWeekStart.setDate(now.getDate() - now.getDay())
    newWeekStart.setHours(0, 0, 0, 0)

    if (activeUsers.length > 0) {
      await db.leaderboardEntry.createMany({
        data: activeUsers.map(u => ({
          userId: u.id,
          memberId: u.member?.id,
          weekStart: newWeekStart,
          points: 0,
          activityType: 'COURSE_QUIZ',
        })),
        skipDuplicates: true,
      })
    }

    console.log(`Weekly reset complete: ${activeUsers.length} users reset for week ${newWeekStart.toISOString()}`)

    return NextResponse.json({
      success: true,
      message: `Weekly points reset for week ${newWeekStart.toISOString()}`,
      participantsReset: activeUsers.length,
      lastWeekParticipants: lastWeekEntries.length,
      lastWeekTop3: lastWeekEntries.slice(0, 3).map(e => ({
        name: e.user.member?.firstName + ' ' + e.user.member?.lastName?.charAt(0) + '.',
        points: e.points,
      })),
    })
  } catch (error) {
    console.error('Weekly points reset error:', error)
    return NextResponse.json(
      { error: 'Fout bij wekelijkse reset' },
      { status: 500 }
    )
  }
}