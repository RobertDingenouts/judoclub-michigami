import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // Simple token auth — not for production
  const token = request.headers.get('x-migrate-token')
  if (token !== 'michigami-migrate-2026') {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

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
