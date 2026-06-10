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
    
    // Try creating a Blob with Uint8Array view
    const uint8Array = new Uint8Array(pdfBuffer)
    console.log('[download] Uint8Array length:', uint8Array.length, 'byteOffset:', uint8Array.byteOffset, 'buffer byteLength:', uint8Array.buffer.byteLength)
    
    // Create a fresh Uint8Array to ensure correct bounds
    const freshView = new Uint8Array(uint8Array.length)
    freshView.set(uint8Array)
    console.log('[download] Fresh view length:', freshView.length)
    
    const blob = new Blob([freshView], { type: 'application/pdf' })
    console.log('[download] Blob size:', blob.size)
    
    const response = new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="diploma-${recipientName.replace(/\s+/g, '-')}-${beltLabel.toLowerCase().replace(/\s+/g, '-')}.pdf"`,
        'Content-Length': String(freshView.byteLength),
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
