/**
 * POST /api/admin/migrate-course-progress
 * One-time migration to fix CourseProgress unique constraint
 * Run once after deployment, then remove this endpoint.
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    // First, find the actual constraint name
    const constraints = await db.$queryRawUnsafe(`
      SELECT conname 
      FROM pg_constraint 
      WHERE conrelid = '"CourseProgress"'::regclass 
      AND contype = 'u'
    `)
    console.log('Existing constraints:', constraints)

    // Drop all unique constraints except the new one
    for (const c of constraints as any[]) {
      const name = c.conname
      if (!name.includes('beltLevel')) {
        try {
          await db.$executeRawUnsafe(`ALTER TABLE "CourseProgress" DROP CONSTRAINT IF EXISTS "${name}";`)
          console.log('Dropped constraint:', name)
        } catch (e: any) {
          console.log('Failed to drop constraint:', name, e.message)
        }
      }
    }

    // Also drop any matching indexes
    const indexes = await db.$queryRawUnsafe(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'CourseProgress' 
      AND indexdef LIKE '%UNIQUE%'
    `)
    console.log('Existing unique indexes:', indexes)

    for (const idx of indexes as any[]) {
      const name = idx.indexname
      if (!name.includes('beltLevel')) {
        try {
          await db.$executeRawUnsafe(`DROP INDEX IF EXISTS "${name}";`)
          console.log('Dropped index:', name)
        } catch (e: any) {
          console.log('Failed to drop index:', name, e.message)
        }
      }
    }

    // Check if new constraint exists, add if not
    try {
      await db.$executeRawUnsafe(`
        ALTER TABLE "CourseProgress"
          ADD CONSTRAINT "CourseProgress.userId_courseName_beltLevel_unique"
          UNIQUE ("userId", "courseName", "beltLevel");
      `)
      console.log('Added new constraint')
    } catch (e: any) {
      // Constraint already exists, that's OK
      console.log('New constraint already exists:', e.message)
    }

    return NextResponse.json({
      success: true,
      message: 'CourseProgress unique constraint migration completed successfully'
    })
  } catch (error: any) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { success: false, error: 'Migratie mislukt (details in serverlogboek)' },
      { status: 500 }
    )
  }
}
