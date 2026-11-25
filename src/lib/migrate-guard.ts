import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'

// Ontgrendeling voor /api/admin/migrate/*:
//   1) een ingelogde ADMIN (sessie), OF
//   2) een geldig token via header 'x-migrate-token' (of 'Authorization: Bearer …')
//      dat gelijk is aan de omgevingsvariabele MIGRATE_TOKEN.
// De vroegere hardcoded tokens ('michigami-migrate-2026', 'MIGRATE-PRISMA-2026')
// stonden publiek in de broncode en zijn hiermee komen te vervallen:
// zet MIGRATE_TOKEN in .env als je migraties nog via curl of scripts aanroept.
export async function migrateGuard(request: Request): Promise<NextResponse | null> {
  if (await requireAdmin()) return null
  const expected = process.env.MIGRATE_TOKEN
  const token =
    request.headers.get('x-migrate-token') ||
    (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (expected && token && token === expected) return null
  return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
}
