/**
 * POST /api/diplomas/generate
 * Trigger diploma creation when an exam is approved (passed).
 *
 * Request body: { examAttemptId: string }
 * Response: { diplomaId, verificationCode, downloadUrl }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createDiplomaOnExamPass } from '@/lib/diploma-generator'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { examAttemptId } = body as { examAttemptId: string }

    if (!examAttemptId) {
      return NextResponse.json(
        { error: 'Missing examAttemptId' },
        { status: 400 }
      )
    }

    const result = await createDiplomaOnExamPass(examAttemptId)

    return NextResponse.json({
      diplomaId: result.diplomaId,
      verificationCode: result.verificationCode,
      downloadUrl: `/api/diplomas/download?id=${result.diplomaId}`,
      message: 'Diploma generated successfully',
    })
  } catch (error: any) {
    console.error('Diploma generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate diploma' },
      { status: 500 }
    )
  }
}
