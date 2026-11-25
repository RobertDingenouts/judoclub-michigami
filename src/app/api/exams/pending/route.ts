/**
 * GET /api/exams/pending
 * Get all pending exam attempts for instructor review.
 *
 * POST /api/exams/pending
 * Create a new scheduled exam attempt.
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'
import type { BeltLevel } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Not authorized' }, { status: 401 })
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

export async function POST(request: NextRequest) {
  const admin = await isAdmin()
  if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { memberId, beltLevel, examDate, examiner, notes } = body as {
      memberId: string
      beltLevel: string
      examDate?: string
      examiner?: string
      notes?: string
    }

    if (!memberId || !beltLevel) {
      return NextResponse.json(
        { error: 'Student en bandniveau zijn verplicht' },
        { status: 400 }
      )
    }

    // Get member to find userId
    const member = await db.member.findUnique({
      where: { id: memberId },
      include: { user: true },
    })

    if (!member) {
      return NextResponse.json({ error: 'Student niet gevonden' }, { status: 404 })
    }

    const exam = await db.examAttempt.create({
      data: {
        memberId,
        userId: member.userId,
        beltLevel: beltLevel as BeltLevel,
        status: 'SCHEDULED',
        examDate: examDate ? new Date(examDate) : undefined,
        examiner,
        notes,
      },
    })

    return NextResponse.json({ success: true, exam })
  } catch (error: any) {
    console.error('Create exam error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create exam' },
      { status: 500 }
    )
  }
}
