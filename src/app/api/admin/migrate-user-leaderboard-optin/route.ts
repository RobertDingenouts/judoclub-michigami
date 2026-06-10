/**
 * POST /api/admin/migrate-user-leaderboard-optin
 * One-time migration to add leaderboardOptIn field to User
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
        ALTER TABLE "User"
          ADD COLUMN "leaderboardOptIn" BOOLEAN NOT NULL DEFAULT false;
      `)
      console.log('Added leaderboardOptIn column to User')
    } catch (e: any) {
      if (e.message?.includes('already exists') || e.message?.includes('duplicate column')) {
        console.log('leaderboardOptIn column already exists')
      } else {
        throw e
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User leaderboardOptIn migration completed'
    })
  } catch (error: any) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Migration failed' },
      { status: 500 }
    )
  }
}