/**
 * Diploma Generation Service
 * Generates verifiable digital diplomas (PDF) when a student passes a belt exam.
 */

import { pdf } from '@react-pdf/renderer'
import { db } from '@/lib/db'
import { DiplomaPDFDocument } from '@/components/diploma/DiplomaPDFDocument'
import { BeltLevel, DiplomaType } from '@prisma/client'
import crypto from 'crypto'

// ============================================================================
// Verification code generation
// ============================================================================

export function generateVerificationCode(): string {
  const part1 = crypto.randomBytes(2).toString('hex').toUpperCase()
  const part2 = crypto.randomBytes(2).toString('hex').toUpperCase()
  return `MJ-${part1}-${part2}`
}

// ============================================================================
// PDF generation (server-side) - returns Blob directly
// ============================================================================

export async function generateDiplomaPDF(data: {
  recipientName: string
  beltLevel: BeltLevel
  title: string
  description?: string
  awardedAt: Date
  verificationCode: string
  examiner?: string
}): Promise<Blob> {
  const document = (
    <DiplomaPDFDocument
      recipientName={data.recipientName}
      beltLevel={data.beltLevel}
      title={data.title}
      description={data.description}
      awardedAt={data.awardedAt.toISOString()}
      verificationCode={data.verificationCode}
      examiner={data.examiner}
    />
  )

  try {
    console.log('[diploma-generator] Calling pdf(document).toBlob()...')
    const blob = await pdf(document).toBlob()
    
    console.log('[diploma-generator] Got blob, size:', blob.size, 'type:', blob.type)
    
    if (blob.size === 0) {
      console.warn('[diploma-generator] Empty blob generated')
    }
    
    return blob
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('[diploma-generator] PDF generation error:', error.message, error.stack)
    // Re-throw with more context
    throw new Error(`PDF generation failed: ${error.message}`)
  }
}

// ============================================================================
// PDF generation (server-side) - returns ArrayBuffer for backward compatibility
// ============================================================================

export async function generateDiplomaPDFBuffer(data: {
  recipientName: string
  beltLevel: BeltLevel
  title: string
  description?: string
  awardedAt: Date
  verificationCode: string
  examiner?: string
}): Promise<ArrayBuffer> {
  const blob = await generateDiplomaPDF(data)
  
  // Convert blob to ArrayBuffer
  const arrayBuffer = await blob.arrayBuffer()
  
  console.log('[diploma-generator] Blob converted to ArrayBuffer, byteLength:', arrayBuffer.byteLength)
  
  // Ensure it's a clean ArrayBuffer (not SharedArrayBuffer)
  const view = new Uint8Array(arrayBuffer)
  const result = new ArrayBuffer(view.byteLength)
  new Uint8Array(result).set(view)
  return result
}

// ============================================================================
// Test PDF generation (minimal, uses Helvetica built-in)
// ============================================================================

export async function generateTestPDF(): Promise<Blob> {
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
  
  console.log('[diploma-generator] Generating minimal test PDF...')
  const blob = await pdf(doc).toBlob()
  console.log('[diploma-generator] Test blob size:', blob.size)
  return blob
}

// ============================================================================
// Belt label helpers
// ============================================================================

const BELT_LABELS_NL: Record<string, string> = {
  WIT:           'Witte band',
  WIT_GEEL:      'Witte band met gele slip',
  GEEL:          'Gele band',
  GEEL_ORANJE:   'Gele band met oranje slip',
  ORANJE:        'Oranje band',
  ORANJE_GROEN:  'Oranje band met groene slip',
  GROEN:         'Groene band',
  GROEN_BLAUW:   'Groene band met blauwe slip',
  BLAUW:         'Blauwe band',
  BLAUW_BRUIN:   'Blauwe band met bruine slip',
  BRUIN:         'Bruine band',
  ZWART_1:       'Zwarte band 1e dan',
  ZWART_2:       'Zwarte band 2e dan',
  ZWART_3:       'Zwarte band 3e dan',
  ZWART_4:       'Zwarte band 4e dan',
  ZWART_5:       'Zwarte band 5e dan',
  ZWART_6:       'Zwarte band 6e dan',
  ZWART_7:       'Zwarte band 7e dan',
  ZWART_8:       'Zwarte band 8e dan',
  ZWART_9:       'Zwarte band 9e dan',
  ZWART_10:      'Zwarte band 10e dan',
  // Legacy values
  BRUIN_1:       'Bruine band 1e ke',
  BRUIN_2:       'Bruine band 2e ke',
  BRUIN_3:       'Bruine band 3e ke',
  Zwart_1:       'Zwarte band 1e dan',
  Zwart_2:       'Zwarte band 2e dan',
  Zwart_3:       'Zwarte band 3e dan',
}

export function getBeltLabel(beltLevel: string): string {
  return BELT_LABELS_NL[beltLevel] || beltLevel
}

// ============================================================================
// Create diploma record + PDF on exam pass
// ============================================================================

export async function createDiplomaOnExamPass(examAttemptId: string): Promise<{
  diplomaId: string
  verificationCode: string
  pdfBuffer: ArrayBuffer
}> {
  const examAttempt = await db.examAttempt.findUnique({
    where: { id: examAttemptId },
    include: {
      member: true,
      user: true,
    },
  })

  if (!examAttempt) {
    throw new Error(`Exam attempt ${examAttemptId} not found`)
  }

  if (examAttempt.status !== 'COMPLETED_PASSED') {
    throw new Error('Diploma can only be created for passed exams')
  }

  const existing = await db.diploma.findFirst({
    where: { examAttemptId: examAttemptId },
  })

  if (existing) {
    throw new Error('Diploma already exists for this exam attempt')
  }

  const member = examAttempt.member
  const recipientName = `${member.firstName} ${member.lastName}`
  const beltLevel = examAttempt.beltLevel as string

  const beltLabel = getBeltLabel(beltLevel)
  const title = `Examen ${beltLabel} Geslaagd`
  const description = `Hierbij wordt bevestigd dat ${recipientName} met succes het judo examen voor de ${beltLevel} heeft afgelegd bij Judoclub Michigami Steenbergen.`

  let verificationCode = generateVerificationCode()
  let attempts = 0
  while (attempts < 10) {
    const exists = await db.diploma.findUnique({
      where: { verificationCode },
    })
    if (!exists) break
    verificationCode = generateVerificationCode()
    attempts++
  }

  const pdfBuffer = await generateDiplomaPDFBuffer({
    recipientName,
    beltLevel: examAttempt.beltLevel,
    title,
    description,
    awardedAt: new Date(),
    verificationCode,
    examiner: examAttempt.examiner || undefined,
  })

  const diploma = await db.diploma.create({
    data: {
      type: DiplomaType.BELT_EXAM,
      title,
      description,
      recipientId: member.id,
      userId: examAttempt.userId,
      beltLevel: examAttempt.beltLevel,
      examAttemptId: examAttemptId,
      verificationCode,
      awardedAt: new Date(),
    },
  })

  await db.user.update({
    where: { id: examAttempt.userId },
    data: { currentBelt: examAttempt.beltLevel },
  })

  await db.member.update({
    where: { id: member.id },
    data: { currentBelt: examAttempt.beltLevel },
  })

  return {
    diplomaId: diploma.id,
    verificationCode: diploma.verificationCode,
    pdfBuffer,
  }
}

// ============================================================================
// Verify a diploma by code
// ============================================================================

export async function verifyDiploma(code: string): Promise<{
  valid: boolean
  diploma?: {
    id: string
    title: string
    recipientName: string
    beltLevel: string | null
    awardedAt: Date
    verificationCode: string
  }
}> {
  const diploma = await db.diploma.findUnique({
    where: { verificationCode: code },
    include: { member: true },
  })

  if (!diploma) {
    return { valid: false }
  }

  const beltLabel = diploma.beltLevel ? getBeltLabel(diploma.beltLevel as string) : null

  return {
    valid: true,
    diploma: {
      id: diploma.id,
      title: diploma.title,
      recipientName: `${diploma.member.firstName} ${diploma.member.lastName}`,
      beltLevel: beltLabel,
      awardedAt: diploma.awardedAt,
      verificationCode: diploma.verificationCode,
    },
  }
}

// ============================================================================
// Get user's diplomas
// ============================================================================

export async function getUserDiplomas(userId: string): Promise<Array<{
  id: string
  type: string
  title: string
  description: string | null
  beltLevel: string | null
  awardedAt: Date
  verificationCode: string
}>> {
  const diplomas = await db.diploma.findMany({
    where: { userId },
    orderBy: { awardedAt: 'desc' },
    select: {
      id: true,
      type: true,
      title: true,
      description: true,
      beltLevel: true,
      awardedAt: true,
      verificationCode: true,
    },
  })

  return diplomas
}
