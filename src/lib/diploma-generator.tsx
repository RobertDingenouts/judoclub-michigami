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
// PDF generation (server-side)
// ============================================================================

export async function generateDiplomaPDF(data: {
  recipientName: string
  beltLevel: BeltLevel
  title: string
  description?: string
  awardedAt: Date
  verificationCode: string
  examiner?: string
}): Promise<ArrayBuffer> {
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

  // Use the pdf function which returns a PDFKit document instance
  // This is the most reliable way on Node.js (Vercel) - pipe to buffer
  const doc = pdf(document) as any
  
  console.log('[diploma-generator] Got PDFKit document, type:', doc?.constructor?.name)
  
  // Collect chunks from PDFKit document
  const chunks: Uint8Array[] = []
  
  await new Promise<void>((resolve, reject) => {
    doc.on('data', (chunk: Buffer | Uint8Array) => {
      console.log('[diploma-generator] data chunk, length:', chunk.length, 'type:', chunk.constructor?.name)
      // Convert Buffer to Uint8Array if needed
      const uint8 = chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk)
      chunks.push(uint8)
    })
    doc.on('end', () => {
      console.log('[diploma-generator] PDFKit stream ended')
      resolve()
    })
    doc.on('error', (err: Error) => {
      console.error('[diploma-generator] PDFKit error:', err)
      reject(err)
    })
    
    // End the document to start generating
    doc.end()
  })
  
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  console.log('[diploma-generator] Total chunks:', chunks.length, 'total length:', totalLength)
  
  if (totalLength === 0) {
    console.warn('[diploma-generator] Empty PDF generated')
    return new Uint8Array(0).buffer
  }
  
  // Combine all chunks into a single Uint8Array
  const combined = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    combined.set(chunk, offset)
    offset += chunk.length
  }
  
  // Create a clean ArrayBuffer from the combined Uint8Array
  const result = new ArrayBuffer(combined.byteLength)
  new Uint8Array(result).set(combined)
  
  console.log('[diploma-generator] Final ArrayBuffer byteLength:', result.byteLength)
  
  return result
}

// ============================================================================
// Belt label helpers
// ============================================================================

const BELT_LABELS_NL: Record<string, string> = {
  WIT:       'Witte band',
  GEEL:      'Gele band',
  ORANJE:    'Oranje band',
  GROEN:     'Groene band',
  BLAUW:     'Blauwe band',
  BRUIN_1:   'Bruine band 1e ke',
  BRUIN_2:   'Bruine band 2e ke',
  BRUIN_3:   'Bruine band 3e ke',
  Zwart_1:   'Zwarte band 1e dan',
  Zwart_2:   'Zwarte band 2e dan',
  Zwart_3:   'Zwarte band 3e dan',
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
  const description = `Hierbij wordt bevestigd dat ${recipientName} met succes het judo examen voor de ${beltLabel} heeft afgelegd bij Judoclub Michigami Steenbergen.`

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

  const pdfBuffer = await generateDiplomaPDF({
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
