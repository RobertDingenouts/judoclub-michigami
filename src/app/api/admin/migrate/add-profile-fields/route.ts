import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// One-time migration: add new profile fields to Member table
// NO auth check - getCurrentUser() fails because Prisma expects columns that don't exist yet
// Run once via browser console or curl, then DELETE this endpoint
// Token check as basic protection
const MIGRATE_TOKEN = 'michigami-migrate-2026'

export async function POST(request: Request) {
  const token = request.headers.get('x-migrate-token') || ''
  if (token !== MIGRATE_TOKEN) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
  }

  const columns = [
    { name: 'phone2', type: 'TEXT' },
    { name: 'gender', type: 'TEXT' },
    { name: 'address', type: 'TEXT' },
    { name: 'postalCode', type: 'TEXT' },
    { name: 'city', type: 'TEXT' },
    { name: 'whatsappGroup', type: 'TEXT' },
    { name: 'portraitRights', type: 'BOOLEAN' },
    { name: 'nameMention', type: 'BOOLEAN' },
    { name: 'privacyAgreed', type: 'BOOLEAN' },
    { name: 'privacyAgreedAt', type: 'TIMESTAMPTZ' },
    { name: 'termsAgreed', type: 'BOOLEAN' },
    { name: 'termsAgreedAt', type: 'TIMESTAMPTZ' },
    { name: 'remarks', type: 'TEXT' },
  ]

  const results: Array<{ column: string; status: string; message?: string }> = []
  for (const col of columns) {
    try {
      await db.$executeRawUnsafe(
        `ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type}`
      )
      results.push({ column: col.name, status: 'ok' })
    } catch (err: any) {
      results.push({ column: col.name, status: 'error', message: err.message })
    }
  }

  return NextResponse.json({
    message: 'Migration completed',
    results,
    ok: results.every(r => r.status === 'ok'),
  })
}
