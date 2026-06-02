/**
 * GET /api/diplomas/verify?code=<verificationCode>
 * Public endpoint to verify a diploma by its verification code.
 * Does NOT require authentication.
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyDiploma } from '@/lib/diploma-generator'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json(
        { error: 'Missing verification code' },
        { status: 400 }
      )
    }

    const result = await verifyDiploma(code)

    if (!result.valid) {
      return NextResponse.json(
        { valid: false, error: 'Invalid or expired diploma' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      valid: true,
      diploma: result.diploma,
    })
  } catch (error: any) {
    console.error('Diploma verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed', valid: false },
      { status: 500 }
    )
  }
}
