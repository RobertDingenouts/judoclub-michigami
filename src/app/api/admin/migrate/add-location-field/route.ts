import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { db } from '@/lib/db'
import { migrateGuard } from '@/lib/migrate-guard'

export const dynamic = 'force-dynamic'

export async function POST() {
  const admin = await isAdmin()
  if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 })

  try {
    // Check if location column already exists
    const checkResult = await db.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Member' AND column_name = 'location'
    `
    
    if (Array.isArray(checkResult) && checkResult.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Location field already exists in Member table',
      })
    }

    // Add the location column
    await db.$executeRaw`
      ALTER TABLE "Member" ADD COLUMN "location" TEXT
    `

    // Add index on location
    await db.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Member_location_idx" ON "Member" ("location")
    `

    return NextResponse.json({
      success: true,
      message: 'Location field added to Member table successfully',
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({
      error: 'Migration failed (details in serverlogboek)',
    }, { status: 500 })
  }
}
