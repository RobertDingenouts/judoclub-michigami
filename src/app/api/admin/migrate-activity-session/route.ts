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

    const results: string[] = []
    const errors: string[] = []

    // Create table
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
      `)
      results.push('ActivitySession table created')
    } catch (e: any) {
      if (e.message?.includes('already exists') || e.message?.includes('relation') && e.message?.includes('already exists')) {
        console.log('ActivitySession table already exists')
      } else {
        errors.push(`Table creation: ${e.message}`)
      }
    }

    // Create userId_createdAt index
    try {
      await db.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "ActivitySession_userId_createdAt_idx" ON "ActivitySession"("userId", "createdAt");
      `)
      results.push('Created userId_createdAt index')
    } catch (e: any) {
      if (e.message?.includes('already exists')) {
        console.log('userId_createdAt index already exists')
      } else {
        errors.push(`userId_createdAt index: ${e.message}`)
      }
    }

    // Create sessionId index
    try {
      await db.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "ActivitySession_sessionId_idx" ON "ActivitySession"("sessionId");
      `)
      results.push('Created sessionId index')
    } catch (e: any) {
      if (e.message?.includes('already exists')) {
        console.log('sessionId index already exists')
      } else {
        errors.push(`sessionId index: ${e.message}`)
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      message: 'ActivitySession migration completed',
      results,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Migration failed' },
      { status: 500 }
    )
  }
}