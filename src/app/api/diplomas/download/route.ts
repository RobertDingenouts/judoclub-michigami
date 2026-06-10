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

    console.log('[download] Starting PDF generation for diploma:', diplomaId)
    const pdfBuffer = await generateDiplomaPDF({
      recipientName,
      beltLevel: beltLevel as any,
      title: diploma.title,
      description: diploma.description || undefined,
      awardedAt: diploma.awardedAt,
      verificationCode: diploma.verificationCode,
      examiner: diploma.examAttempt?.examiner || undefined,
    })
    
    console.log('[download] PDF generated, type:', typeof pdfBuffer, 'constructor:', pdfBuffer?.constructor?.name, 'byteLength:', pdfBuffer?.byteLength, 'isArrayBuffer:', pdfBuffer instanceof ArrayBuffer)
    
    // Ensure pdfBuffer is a valid ArrayBuffer
    if (!(pdfBuffer instanceof ArrayBuffer)) {
      throw new Error('pdfBuffer is not an ArrayBuffer: ' + typeof pdfBuffer)
    }
    if (pdfBuffer.byteLength === 0) {
      throw new Error('pdfBuffer is empty (0 bytes)')
    }
    
    // Try creating a fresh Uint8Array view with explicit bounds checking
    let uint8Array: Uint8Array
    try {
      // Create a fresh ArrayBuffer to ensure we have ArrayBuffer, not SharedArrayBuffer
      const freshBuffer = new ArrayBuffer(pdfBuffer.byteLength)
      new Uint8Array(freshBuffer).set(new Uint8Array(pdfBuffer))
      uint8Array = new Uint8Array(freshBuffer)
      console.log('[download] Fresh Uint8Array created, length:', uint8Array.length, 'buffer:', uint8Array.buffer.constructor.name)
    } catch (e) {
      console.error('[download] Failed to create Uint8Array:', e)
      return NextResponse.json(
        { error: 'Failed to process PDF buffer' },
        { status: 500 }
      )
    }
    
    const blob = new Blob([uint8Array as any], { type: 'application/pdf' })
    console.log('[download] Blob size:', blob.size)
    
    const response = new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="diploma-${recipientName.replace(/\s+/g, '-')}-${beltLabel.toLowerCase().replace(/\s+/g, '-')}.pdf"`,
        'Content-Length': String(uint8Array.byteLength),
      },
    })

    return response
  } catch (error: any) {
    console.error('Diploma download error:', error, error?.stack)
    return NextResponse.json(
      { error: error.message || 'Failed to download diploma' },
      { status: 500 }
    )
  }
}
