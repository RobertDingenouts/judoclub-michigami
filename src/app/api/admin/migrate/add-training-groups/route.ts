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
      ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "trainingGroups" JSON
    `)
    results.push('trainingGroups kolom toegevoegd')
  } catch (e: any) {
    results.push(`trainingGroups: ${e.message}`)
  }

  try {
    await db.$executeRawUnsafe(`
      ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "primaryGroup" TEXT
    `)
    results.push('primaryGroup kolom toegevoegd')
  } catch (e: any) {
    results.push(`primaryGroup: ${e.message}`)
  }

  return NextResponse.json({ results })
}
