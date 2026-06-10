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

    // Run the migration SQL
    await db.$executeRawUnsafe(`
      ALTER TABLE "CourseProgress"
        DROP CONSTRAINT IF EXISTS "CourseProgress.userId_courseName_unique";
    `)

    // Check if new constraint exists, add if not
    try {
      await db.$executeRawUnsafe(`
        ALTER TABLE "CourseProgress"
          ADD CONSTRAINT "CourseProgress.userId_courseName_beltLevel_unique"
          UNIQUE ("userId", "courseName", "beltLevel");
      `)
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
      { success: false, error: error.message || 'Migration failed' },
      { status: 500 }
    )
  }
}
