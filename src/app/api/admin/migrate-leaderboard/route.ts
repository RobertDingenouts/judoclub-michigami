/**
 * POST /api/admin/migrate-leaderboard
 * One-time migration to add unique constraint to LeaderboardEntry
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    try {
      await db.$executeRawUnsafe(`
        ALTER TABLE "LeaderboardEntry"
          ADD CONSTRAINT "LeaderboardEntry_userId_weekStart_unique"
          UNIQUE ("userId", "weekStart");
      `)
      console.log('Added unique constraint to LeaderboardEntry')
    } catch (e: any) {
      if (e.message?.includes('already exists')) {
        console.log('Unique constraint already exists')
      } else {
        throw e
      }
    }

    return NextResponse.json({
      success: true,
      message: 'LeaderboardEntry unique constraint migration completed'
    })
  } catch (error: any) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Migration failed' },
      { status: 500 }
    )
  }
}