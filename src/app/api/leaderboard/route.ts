/**
 * GET /api/leaderboard
 * Get weekly leaderboard with optional filters
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const weekOffset = parseInt(searchParams.get('weekOffset') || '0', 10)
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    // Calculate week start based on offset
    const now = new Date()
    const currentWeekStart = new Date(now)
    currentWeekStart.setDate(now.getDate() - now.getDay())
    currentWeekStart.setHours(0, 0, 0, 0)

    const weekStart = new Date(currentWeekStart)
    weekStart.setDate(weekStart.getDate() + weekOffset * 7)

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)

    // Get leaderboard entries for the week
    const entries = await db.leaderboardEntry.findMany({
      where: {
        weekStart,
        user: {
          leaderboardOptIn: true, // Only show users who opted in
          is_active: true,
          role: { in: ['MEMBER', 'PARENT', 'INSTRUCTOR'] }, // Exclude admins
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            currentBelt: true,
            member: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { points: 'desc' },
      take: limit,
    })

    // Get current user's rank if authenticated
    // Get current user's rank if authenticated
    let userRank: number | null = null
    let userEntry: Awaited<ReturnType<typeof db.leaderboardEntry.findUnique>> = null
    const user = await getCurrentUser()
    if (user) {
      const allEntries = await db.leaderboardEntry.findMany({
        where: {
          weekStart,
          user: {
            leaderboardOptIn: true,
            is_active: true,
            role: { in: ['MEMBER', 'PARENT', 'INSTRUCTOR'] },
          },
        },
        orderBy: { points: 'desc' },
        select: { userId: true },
      })

      const userIndex = allEntries.findIndex(e => e.userId === user.id)
      if (userIndex !== -1) {
        userRank = userIndex + 1
      }

      // Get user's own entry even if not opted in
      userEntry = await db.leaderboardEntry.findUnique({
        where: {
          userId_weekStart: {
            userId: user.id,
            weekStart,
          },
        },
      })
    }

    // Format leaderboard
    const leaderboard = entries.map((entry, index) => ({
      rank: index + 1,
      name: entry.user.member
        ? `${entry.user.member.firstName} ${entry.user.member.lastName.charAt(0)}.`
        : entry.user.name || 'Onbekend',
      belt: entry.user.currentBelt || 'WIT',
      points: entry.points,
      isCurrentUser: user?.id === entry.userId,
    }))

    return NextResponse.json({
      success: true,
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      leaderboard,
      userRank,
      userPoints: userEntry?.points || 0,
      totalParticipants: await db.leaderboardEntry.count({
        where: {
          weekStart,
          user: { leaderboardOptIn: true, is_active: true },
        },
      }),
    })
  } catch (error) {
    console.error('Leaderboard error:', error)
    return NextResponse.json(
      { error: 'Fout bij ophalen leaderboard' },
      { status: 500 }
    )
  }
}