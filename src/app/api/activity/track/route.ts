/**
 * POST /api/activity/track
 * Track user activity sessions for leaderboard points calculation
 */
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface ActivityData {
  page: string
  action: string
  durationMs: number
  metadata?: Record<string, any>
  sessionId: string
}

// Points configuration for different activities
const POINTS_CONFIG: Record<string, Record<string, { base: number; maxPerSession: number }>> = {
  'exam-dashboard': {
    'view': { base: 1, maxPerSession: 10 },
    'video_play': { base: 2, maxPerSession: 20 },
    'technique_detail': { base: 1, maxPerSession: 15 },
    'scroll': { base: 1, maxPerSession: 5 },
  },
  'techniques': {
    'view': { base: 1, maxPerSession: 10 },
    'video_play': { base: 2, maxPerSession: 20 },
    'search': { base: 1, maxPerSession: 5 },
    'filter': { base: 1, maxPerSession: 5 },
    'scroll': { base: 1, maxPerSession: 5 },
  },
  'cursus-japans': {
    'view': { base: 1, maxPerSession: 10 },
    'flashcard_flip': { base: 1, maxPerSession: 20 },
    'quiz_start': { base: 5, maxPerSession: 10 },
    'quiz_answer': { base: 2, maxPerSession: 30 },
    'quiz_complete': { base: 10, maxPerSession: 10 }, // bonus for completing
    'audio_play': { base: 1, maxPerSession: 15 },
    'level_complete': { base: 50, maxPerSession: 50 }, // big bonus for completing a level
  },
  'profile': {
    'view': { base: 1, maxPerSession: 2 },
    'edit': { base: 2, maxPerSession: 5 },
  },
}

function calculatePoints(page: string, action: string, durationMs: number, metadata?: Record<string, any>, sessionPointsSoFar: number = 0): number {
  const config = POINTS_CONFIG[page]?.[action]
  if (!config) return 0

  const { base, maxPerSession } = config

  // Cap at max per session
  if (sessionPointsSoFar >= maxPerSession) return 0

  // Bonus for longer engagement (time-based bonus)
  let timeBonus = 0
  if (durationMs > 60000) timeBonus = 2 // 1+ min
  if (durationMs > 300000) timeBonus = 5 // 5+ min
  if (durationMs > 600000) timeBonus = 10 // 10+ min

  // Special bonuses from metadata
  let metadataBonus = 0
  if (metadata?.quizScore !== undefined && metadata.quizScore >= 80) {
    metadataBonus = 10 // passed quiz
  }
  if (metadata?.quizScore === 100) {
    metadataBonus = 15 // perfect score
  }
  if (metadata?.levelComplete) {
    metadataBonus = 50 // completed a level
  }

  const total = base + timeBonus + metadataBonus
  return Math.min(total, maxPerSession - sessionPointsSoFar)
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const body = await request.json()
    const activities: ActivityData[] = Array.isArray(body) ? body : [body]

    // Validate activities
    const validActivities = activities.filter(a =>
      a.page && a.action && a.sessionId && typeof a.durationMs === 'number'
    )

    if (validActivities.length === 0) {
      return NextResponse.json({ error: 'Geen geldige activiteiten' }, { status: 400 })
    }

    // Get existing session points to enforce caps
    const sessionIds = [...new Set(validActivities.map(a => a.sessionId))]
    const existingSessions = await db.activitySession.findMany({
      where: {
        userId: user.id,
        sessionId: { in: sessionIds },
      },
      select: {
        sessionId: true,
        page: true,
        action: true,
        durationMs: true,
      },
    })

    // Calculate points per session per page/action combo
    const sessionPointsMap = new Map<string, number>()
    for (const s of existingSessions) {
      const key = `${s.sessionId}:${s.page}:${s.action}`
      const config = POINTS_CONFIG[s.page]?.[s.action]
      if (config) {
        sessionPointsMap.set(key, (sessionPointsMap.get(key) || 0) + config.base)
      }
    }

    let totalPointsEarned = 0
    const sessionsToCreate: Array<{
      userId: string
      page: string
      action: string
      durationMs: number
      metadata: Record<string, any>
      sessionId: string
    }> = []

    for (const activity of validActivities) {
      const sessionKey = `${activity.sessionId}:${activity.page}:${activity.action}`
      const pointsSoFar = sessionPointsMap.get(sessionKey) || 0

      const points = calculatePoints(
        activity.page,
        activity.action,
        activity.durationMs,
        activity.metadata,
        pointsSoFar
      )

      if (points > 0) {
        totalPointsEarned += points
        sessionPointsMap.set(sessionKey, pointsSoFar + points)

        sessionsToCreate.push({
          userId: user.id,
          page: activity.page,
          action: activity.action,
          durationMs: activity.durationMs,
          metadata: activity.metadata || {},
          sessionId: activity.sessionId,
        })
      }
    }

    // Batch create activity sessions
    if (sessionsToCreate.length > 0) {
      await db.activitySession.createMany({
        data: sessionsToCreate,
      })
    }

    // Update user's total and weekly points
    if (totalPointsEarned > 0) {
      const now = new Date()
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - now.getDay()) // Start of week (Sunday)
      weekStart.setHours(0, 0, 0, 0)

      await db.user.update({
        where: { id: user.id },
        data: {
          totalPoints: { increment: totalPointsEarned },
          weeklyPoints: { increment: totalPointsEarned },
        },
      })

      // Update or create leaderboard entry
      await db.leaderboardEntry.upsert({
        where: {
          userId_weekStart: {
            userId: user.id,
            weekStart,
          },
        },
        update: {
          points: { increment: totalPointsEarned },
        },
        create: {
          userId: user.id,
          memberId: user.member?.id,
          weekStart,
          points: totalPointsEarned,
          activityType: 'COURSE_QUIZ', // generic type
        },
      })
    }

    return NextResponse.json({
      success: true,
      pointsEarned: totalPointsEarned,
      newTotalPoints: user.totalPoints + totalPointsEarned,
      newWeeklyPoints: user.weeklyPoints + totalPointsEarned,
    })
  } catch (error) {
    console.error('Activity tracking error:', error)
    return NextResponse.json(
      { error: 'Fout bij tracken activiteit' },
      { status: 500 }
    )
  }
}