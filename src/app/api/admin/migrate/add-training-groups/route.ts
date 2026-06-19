import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const token = request.headers.get('x-migrate-token')
  if (token !== 'michigami-migrate-2026') {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

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
