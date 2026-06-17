import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// One-time migration: add new belt enum values to the Neon DB
// Call via browser console: fetch('/api/admin/migrate/belt-enum-values', {method:'POST'}).then(r=>r.json()).then(console.log)
// DELETE this file after successful run!
export async function POST() {
  const newValues = [
    'WIT_GEEL', 'GEEL_ORANJE', 'ORANJE_GROEN', 'GROEN_BLAUW', 'BLAUW_BRUIN',
    'BRUIN',
    'ZWART_1', 'ZWART_2', 'ZWART_3', 'ZWART_4', 'ZWART_5',
    'ZWART_6', 'ZWART_7', 'ZWART_8', 'ZWART_9', 'ZWART_10',
  ]

  const results: Array<{ value: string; status: string; message?: string }> = []
  for (const value of newValues) {
    try {
      // Use raw SQL to add enum value if it doesn't exist
      await db.$executeRawUnsafe(
        `DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'BeltLevel'::regtype AND enumlabel = '${value}') THEN
            ALTER TYPE "BeltLevel" ADD VALUE '${value}';
          END IF;
        END $$`
      )
      results.push({ value, status: 'added' })
    } catch (e: any) {
      results.push({ value, status: 'error', message: e.message })
    }
  }

  return NextResponse.json({
    migration: 'belt-enum-values',
    results,
    added: results.filter(r => r.status === 'added').length,
    errors: results.filter(r => r.status === 'error').length,
  })
}
