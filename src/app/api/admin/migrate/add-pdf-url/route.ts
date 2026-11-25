import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { migrateGuard } from '@/lib/migrate-guard'

export const dynamic = 'force-dynamic'

// One-time migration: Add pdfUrl column to Diploma table
export async function POST() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Alleen admins' }, { status: 403 })
  }

  try {
    // Use raw SQL to add the column if it doesn't exist
    await db.$executeRawUnsafe(
      `DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'Diploma' AND column_name = 'pdfUrl'
        ) THEN
          ALTER TABLE "Diploma" ADD COLUMN "pdfUrl" TEXT;
        END IF;
      END $$;`
    )

    return NextResponse.json({
      success: true,
      message: 'pdfUrl kolom toegevoegd aan Diploma tabel',
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({
      error: 'Migration failed (details in serverlogboek)',
    }, { status: 500 })
  }
}
