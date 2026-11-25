import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { migrateGuard } from '@/lib/migrate-guard'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const guard = await migrateGuard(request)
  if (guard) return guard

  const results: string[] = []

  try {
    await db.$executeRawUnsafe(`
      ALTER TABLE "MembershipApplication" ADD COLUMN IF NOT EXISTS "preferredGroup" TEXT
    `)
    results.push('preferredGroup kolom toegevoegd')
  } catch (e: any) {
    results.push(`preferredGroup: ${e.message}`)
  }

  return NextResponse.json({ results })
}
