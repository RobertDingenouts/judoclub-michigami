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
      uint8Array = new Uint8Array(pdfBuffer, 0, pdfBuffer.byteLength)
      console.log('[download] Uint8Array created, length:', uint8Array.length, 'buffer byteLength:', uint8Array.buffer.byteLength)
    } catch (e) {
      console.error('[download] Failed to create Uint8Array:', e)
      // Fallback: create a new ArrayBuffer and copy
      const fallback = new Uint8Array(pdfBuffer.byteLength)
      const view = new Uint8Array(pdfBuffer)
      fallback.set(view)
      uint8Array = fallback
      console.log('[download] Fallback Uint8Array created, length:', uint8Array.length)
    }
    
    const blob = new Blob([uint8Array], { type: 'application/pdf' })
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
