import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { migrateGuard } from '@/lib/migrate-guard'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // Simple token auth — not for production
  const guard = await migrateGuard(request)
  if (guard) return guard

  const results: string[] = []

  try {
    await db.$executeRawUnsafe(`
      ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "codeOfConduct" BOOLEAN
    `)
    results.push('codeOfConduct kolom toegevoegd')
  } catch (e: any) {
    results.push(`codeOfConduct: ${e.message}`)
  }

  try {
    await db.$executeRawUnsafe(`
      ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "codeOfConductAt" TIMESTAMP(3)
    `)
    results.push('codeOfConductAt kolom toegevoegd')
  } catch (e: any) {
    results.push(`codeOfConductAt: ${e.message}`)
  }

  return NextResponse.json({ results })
}
