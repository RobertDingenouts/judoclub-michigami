import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getBeltLabel } from '@/lib/diploma-generator'
import { rateLimit, clientIp } from '@/lib/ratelimit'

export const dynamic = 'force-dynamic'

// GET /api/diplomas/verify?code=JP-XXXX-XXXX
// Public diploma verification - no auth required
export async function GET(request: Request) {
  try {
    if (!rateLimit(`diploma-verify:${clientIp(request)}`, 30, 60_000)) {
      return NextResponse.json({ valid: false, error: 'Te veel verificatiepogingen' }, { status: 429 })
    }
    const searchParams = new URL(request.url).searchParams
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json(
        { valid: false, error: 'Verificatiecode is verplicht' },
        { status: 400 }
      )
    }

    const diploma = await db.diploma.findUnique({
      where: { verificationCode: code.toUpperCase() },
      include: {
        member: true,
        examAttempt: true,
      },
    })

    if (!diploma) {
      return NextResponse.json(
        { valid: false, error: 'Diploma niet gevonden' },
        { status: 404 }
      )
    }

    const beltLabel = diploma.beltLevel ? getBeltLabel(diploma.beltLevel as string) : null

    return NextResponse.json({
      valid: true,
      diploma: {
        id: diploma.id,
        title: diploma.title,
        type: diploma.type,
        recipientName: `${diploma.member.firstName} ${diploma.member.lastName}`,
        beltLevel: beltLabel,
        awardedAt: diploma.awardedAt,
        verificationCode: diploma.verificationCode,
        description: diploma.description,
        examAttempt: diploma.examAttempt ? {
          beltLevel: diploma.examAttempt.beltLevel,
          overallScore: diploma.examAttempt.overallScore,
          examDate: diploma.examAttempt.examDate,
          examiner: diploma.examAttempt.examiner,
        } : null,
      },
    })
  } catch (error) {
    console.error('Diploma verify error:', error)
    return NextResponse.json(
      { valid: false, error: 'Fout bij verifiëren diploma' },
      { status: 500 }
    )
  }
}