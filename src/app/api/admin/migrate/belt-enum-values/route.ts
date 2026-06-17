import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// One-time migration: add new belt enum values to the Neon DB
// Call via browser console: fetch('/api/admin/migrate/belt-enum-values', {method:'POST'}).then(r=>r.json()).then(console.log)
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
      // Try to add the enum value directly - will fail if it already exists
      await db.$executeRawUnsafe(
        `ALTER TYPE "BeltLevel" ADD VALUE '${value}'`
      )
      results.push({ value, status: 'added' })
    } catch (e: any) {
      // If error says "already exists", that's fine
      if (e.message?.includes('already exists')) {
        results.push({ value, status: 'exists' })
      } else {
        results.push({ value, status: 'error', message: e.message?.substring(0, 100) })
      }
    }
  }

  return NextResponse.json({
    migration: 'belt-enum-values',
    results,
    added: results.filter(r => r.status === 'added').length,
    exists: results.filter(r => r.status === 'exists').length,
    errors: results.filter(r => r.status === 'error').length,
  })
}
