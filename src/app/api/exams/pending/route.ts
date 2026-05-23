/**
 * GET /api/exams/pending
 * Get all pending exam attempts for instructor review.
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get all scheduled (pending) exam attempts
    const exams = await db.examAttempt.findMany({
      where: {
        status: 'SCHEDULED',
      },
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        results: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ exams })
  } catch (error: any) {
    console.error('Fetch pending exams error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch exams' },
      { status: 500 }
    )
  }
}
