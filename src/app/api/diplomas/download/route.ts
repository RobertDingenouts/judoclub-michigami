/**
 * GET /api/diplomas/download?id=<diplomaId>
 * Download a diploma as PDF.
 * Requires the user to be authenticated and own the diploma.
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateDiplomaPDF, getBeltLabel } from '@/lib/diploma-generator'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const diplomaId = searchParams.get('id')

    if (!diplomaId) {
      return NextResponse.json(
        { error: 'Missing diploma ID' },
        { status: 400 }
      )
    }

    // Fetch diploma with member info
    const diploma = await db.diploma.findUnique({
      where: { id: diplomaId },
      include: {
        member: true,
        examAttempt: true,
      },
    })

    if (!diploma) {
      return NextResponse.json(
        { error: 'Diploma not found' },
        { status: 404 }
      )
    }

    const member = diploma.member
    const recipientName = `${member.firstName} ${member.lastName}`
    const beltLevel = diploma.beltLevel || 'WIT'
    const beltLabel = getBeltLabel(beltLevel as string)

    // Regenerate PDF (on-the-fly)
    const pdfBuffer = await generateDiplomaPDF({
      recipientName,
      beltLevel: beltLevel as any,
      title: diploma.title,
      description: diploma.description || undefined,
      awardedAt: diploma.awardedAt,
      verificationCode: diploma.verificationCode,
      examiner: diploma.examAttempt?.examiner || undefined,
    })

    // Convert to Uint8Array safely
    let uint8Array: Uint8Array
    if (typeof Buffer !== 'undefined' && Buffer.isBuffer(pdfBuffer)) {
      uint8Array = new Uint8Array(pdfBuffer)
    } else {
      // ArrayBuffer or similar
      uint8Array = new Uint8Array(pdfBuffer as ArrayBuffer)
    }

    // Return PDF with download header
    const blob = new Blob([pdfBuffer as ArrayBuffer], { type: 'application/pdf' })
    const response = new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="diploma-${recipientName.replace(/\s+/g, '-')}-${beltLabel.toLowerCase().replace(/\s+/g, '-')}.pdf"`,
        'Content-Length': String(uint8Array.length),
      },
    })

    return response
  } catch (error: any) {
    console.error('Diploma download error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to download diploma' },
      { status: 500 }
    )
  }
}
