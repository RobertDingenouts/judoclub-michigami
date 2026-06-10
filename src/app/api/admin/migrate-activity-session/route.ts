/**
 * POST /api/admin/migrate-activity-session
 * One-time migration to create ActivitySession table
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
        CREATE TABLE IF NOT EXISTS "ActivitySession" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "page" TEXT NOT NULL,
          "action" TEXT NOT NULL,
          "durationMs" INTEGER NOT NULL,
          "metadata" JSONB,
          "sessionId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "ActivitySession_pkey" PRIMARY KEY ("id")
        );
        
        CREATE INDEX IF NOT EXISTS "ActivitySession_userId_createdAt_idx" ON "ActivitySession"("userId", "createdAt");
        CREATE INDEX IF NOT EXISTS "ActivitySession_sessionId_idx" ON "ActivitySession"("sessionId");
      `)
      console.log('Created ActivitySession table and indexes')
    } catch (e: any) {
      if (e.message?.includes('already exists') || e.message?.includes('relation') && e.message?.includes('already exists')) {
        console.log('ActivitySession table already exists')
      } else {
        throw e
      }
    }

    return NextResponse.json({
      success: true,
      message: 'ActivitySession migration completed'
    })
  } catch (error: any) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Migration failed' },
      { status: 500 }
    )
  }
}