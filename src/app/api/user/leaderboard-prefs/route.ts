/**
 * GET/PATCH /api/user/leaderboard-prefs
 * Manage user's leaderboard visibility preferences
 */
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      leaderboardOptIn: user.leaderboardOptIn,
    })
  } catch (error) {
    console.error('Get leaderboard prefs error:', error)
    return NextResponse.json(
      { error: 'Fout bij ophalen voorkeuren' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const body = await request.json()
    const { leaderboardOptIn } = body

    if (typeof leaderboardOptIn !== 'boolean') {
      return NextResponse.json({ error: 'Ongeldige waarde' }, { status: 400 })
    }

    await db.user.update({
      where: { id: user.id },
      data: { leaderboardOptIn },
    })

    return NextResponse.json({
      success: true,
      leaderboardOptIn,
      message: leaderboardOptIn
        ? 'Je bent nu zichtbaar op het leaderboard!'
        : 'Je bent niet meer zichtbaar op het leaderboard.',
    })
  } catch (error) {
    console.error('Update leaderboard prefs error:', error)
    return NextResponse.json(
      { error: 'Fout bij bijwerken voorkeuren' },
      { status: 500 }
    )
  }
}