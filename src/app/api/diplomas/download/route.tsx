/**
 * GET /api/diplomas/download?id=<diplomaId>
 * Download a diploma as PDF.
 * Requires the user to be authenticated and own the diploma.
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
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

    // Autorisatie: eigenaar of admin/lesgever (IDOR-fix — docstring beloofde dit al)
    const session = await getSession()
    if (!session.userId) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }
    if (diploma.userId !== session.userId && !['ADMIN', 'INSTRUCTOR'].includes(session.role)) {
      return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
    }

    // If diploma has an uploaded file (base64 data URI), serve it directly
    if (diploma.pdfUrl && diploma.pdfUrl.startsWith('data:')) {
      const mimeType = diploma.pdfUrl.split(';')[0].split(':')[1]
      const base64Data = diploma.pdfUrl.split(',')[1]
      const buffer = Buffer.from(base64Data, 'base64')
      const member = diploma.member
      const filename = `praktijk-diploma-${member.firstName}-${member.lastName}.pdf`
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': mimeType,
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': String(buffer.length),
        },
      })
    }

    // Otherwise generate PDF from template
    const member = diploma.member
    const recipientName = `${member.firstName} ${member.lastName}`
    const beltLevel = diploma.beltLevel || 'WIT'
    const beltLabel = getBeltLabel(beltLevel as string)

    console.log('[download] Starting PDF generation for diploma:', diplomaId)
    const blob = await generateDiplomaPDF({
      recipientName,
      beltLevel: beltLevel as any,
      title: diploma.title,
      description: diploma.description || undefined,
      awardedAt: diploma.awardedAt,
      verificationCode: diploma.verificationCode,
      examiner: diploma.examAttempt?.examiner || undefined,
    })
    
    console.log('[download] PDF blob generated, size:', blob.size, 'type:', blob.type)
    
    if (blob.size === 0) {
      throw new Error('Generated PDF is empty (0 bytes)')
    }
    
    const response = new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="diploma-${recipientName.replace(/\s+/g, '-')}-${beltLabel.toLowerCase().replace(/\s+/g, '-')}.pdf"`,
        'Content-Length': String(blob.size),
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

// Test endpoint with minimal PDF
export async function POST(request: NextRequest) {
  try {
    const { pdf } = await import('@react-pdf/renderer')
    const { Document, Page, Text, View, StyleSheet } = await import('@react-pdf/renderer')
    
    const styles = StyleSheet.create({
      page: { width: 'a4', height: 'a4', padding: 40 },
      text: { fontSize: 24, textAlign: 'center', marginTop: 100 },
    })
    
    const doc = (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.text}>
            <Text>Test PDF - Diploma Download Works!</Text>
          </View>
        </Page>
      </Document>
    )
    
    console.log('[test] Generating minimal test PDF...')
    const blob = await pdf(doc).toBlob()
    console.log('[test] Test blob size:', blob.size)
    
    if (blob.size === 0) {
      throw new Error('Test PDF generation returned empty blob')
    }
    
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="test-diploma.pdf"',
        'Content-Length': String(blob.size),
      },
    })
  } catch (error: any) {
    console.error('Test PDF error:', error, error?.stack)
    return NextResponse.json(
      { error: error.message || 'Test PDF failed' },
      { status: 500 }
    )
  }
}
