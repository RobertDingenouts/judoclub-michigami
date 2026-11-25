export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Niet beschikbaar' }, { status: 404 })
  }
  const admin = await isAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Admin required' }, { status: 401 })
  }

  const results: any = {}

  try {
    results.diplomaCount = await db.diploma.count()
  } catch (e: any) {
    results.diplomaCount = `ERROR: ${e.message}`
  }

  try {
    results.diplomaFindMany = (await db.diploma.findMany({
      orderBy: { awardedAt: 'desc' },
      include: {
        member: { select: { firstName: true, lastName: true, currentBelt: true } },
      },
      take: 5,
    })).length
  } catch (e: any) {
    results.diplomaFindMany = `ERROR: ${e.message}`
  }

  try {
    results.diplomaGroupBy = await db.diploma.groupBy({
      by: ['type'],
      _count: { type: true },
    })
  } catch (e: any) {
    results.diplomaGroupBy = `ERROR: ${e.message}`
  }

  try {
    results.diplomaFindUnique = await db.diploma.findFirst()
    if (results.diplomaFindUnique) {
      results.diplomaFindUnique = { id: results.diplomaFindUnique.id, type: results.diplomaFindUnique.type, hasPdfUrl: results.diplomaFindUnique.pdfUrl !== null }
    }
  } catch (e: any) {
    results.diplomaFindUnique = `ERROR: ${e.message}`
  }

  return NextResponse.json(results)
}
