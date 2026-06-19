import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET — List all applications with optional filter
export async function GET(request: NextRequest) {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // PENDING, APPROVED, REJECTED, or ALL

    const where: any = {}
    if (status && status !== 'ALL') {
      where.status = status
    }

    const applications = await db.membershipApplication.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    const stats = {
      total: await db.membershipApplication.count(),
      pending: await db.membershipApplication.count({ where: { status: 'PENDING' } }),
      approved: await db.membershipApplication.count({ where: { status: 'APPROVED' } }),
      rejected: await db.membershipApplication.count({ where: { status: 'REJECTED' } }),
    }

    return NextResponse.json({ success: true, applications, stats })
  } catch (error: any) {
    console.error('[ADMIN/INSCHRIJVINGEN] GET error:', error)
    return NextResponse.json({ error: 'Er is een fout opgetreden' }, { status: 500 })
  }
}
