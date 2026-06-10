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
  // Format: MJ-XXXX-XXXX (human-readable, unique)
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

   const pdfResult = await pdf(document).toBuffer()

  // DEBUG: log what toBuffer() actually returns
  console.log('[diploma-generator] toBuffer() type:', typeof pdfResult)
  console.log('[diploma-generator] toBuffer() constructor:', pdfResult?.constructor?.name)
  console.log('[diploma-generator] toBuffer() is Buffer:', Buffer.isBuffer(pdfResult))
  console.log('[diploma-generator] toBuffer() is Stream:', typeof (pdfResult as any)?.on === 'function' && typeof (pdfResult as any)?.pipe === 'function')
  console.log('[diploma-generator] toBuffer() is Uint8Array:', pdfResult instanceof Uint8Array)
  console.log('[diploma-generator] toBuffer() is ReadableStream:', pdfResult instanceof ReadableStream)
  console.log('[diploma-generator] toBuffer() is ArrayBuffer:', pdfResult instanceof ArrayBuffer)
  console.log('[diploma-generator] toBuffer() keys:', Object.keys(pdfResult || {}).slice(0, 10))

  // @react-pdf/renderer v4.5.1 toBuffer() returns a Node.js Stream (pdfkit), not a Buffer!
  // Handle Node.js Stream — consume all chunks and return as ArrayBuffer
  const isNodeStream = pdfResult && typeof (pdfResult as any).on === 'function' && typeof (pdfResult as any).pipe === 'function'
  const isBuffer = typeof Buffer !== 'undefined' && Buffer.isBuffer(pdfResult)
  
  // On Vercel Node.js runtime, toBuffer() returns a pdfkit stream which passes isBuffer check as false
  // But sometimes it can also return a Buffer directly. Check Buffer first for safety.
  if (isBuffer) {
    console.log('[diploma-generator] Detected Buffer')
    const arrayBuffer = new ArrayBuffer(pdfResult.byteLength)
    const view = new Uint8Array(arrayBuffer)
    view.set(pdfResult)
    return arrayBuffer
  }

  if (isNodeStream) {
    try {
      console.log('[diploma-generator] Detected stream, consuming...')
      const stream = pdfResult as NodeJS.ReadableStream
      const chunks: Buffer[] = []
      
      await Promise.race([
        new Promise<void>((resolve, reject) => {
          stream.on('data', (chunk: Buffer) => {
            console.log('[diploma-generator] Stream data event, chunk length:', chunk.length)
            chunks.push(chunk)
          })
          stream.on('end', () => {
            console.log('[diploma-generator] Stream end, total chunks:', chunks.length)
            resolve()
          })
          stream.on('error', (err: any) => {
            console.log('[diploma-generator] Stream error:', err?.message || err)
            reject(err)
          })
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Stream consumption timeout')), 10000)
        )
      ])
      
      // Concatenate all chunks into a single Buffer
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
      console.log('[diploma-generator] Total chunk length:', totalLength)
      if (totalLength === 0) {
        throw new Error('Stream produced no data')
      }
      const combined = Buffer.concat(chunks, totalLength)
      const arrayBuffer = new ArrayBuffer(combined.byteLength)
      const view = new Uint8Array(arrayBuffer)
      view.set(combined)
      console.log('[diploma-generator] Returning ArrayBuffer, byteLength:', arrayBuffer.byteLength)
      return arrayBuffer
    } catch (err) {
      console.error('[diploma-generator] Stream consumption error:', err)
      // Fall through to other handlers
    }
  }

  // Handle Uint8Array (@react-pdf/renderer in edge/other runtimes)
  if (pdfResult instanceof Uint8Array) {
    const backing = pdfResult.buffer as ArrayBuffer
    return backing.slice(
      pdfResult.byteOffset,
      pdfResult.byteOffset + pdfResult.byteLength
    )
  }

  // Handle ReadableStream (edge runtime)
  if (pdfResult instanceof ReadableStream) {
    const reader = pdfResult.getReader()
    const chunks: Uint8Array[] = []
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
    const result = new Uint8Array(totalLength)
    let offset = 0
    for (const chunk of chunks) {
      result.set(chunk, offset)
      offset += chunk.length
    }
    return result.buffer
  }

  // If already an ArrayBuffer, return as-is
  if (pdfResult instanceof ArrayBuffer) {
    return pdfResult
  }

  // Final fallback
  return new Uint8Array(0).buffer
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
  // Get the exam attempt with member/user info
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

  // Check if diploma already exists
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

  // Generate unique verification code
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

  // Generate PDF
  const pdfBuffer = await generateDiplomaPDF({
    recipientName,
    beltLevel: examAttempt.beltLevel,
    title,
    description,
    awardedAt: new Date(),
    verificationCode,
    examiner: examAttempt.examiner || undefined,
  })

  // Create diploma record in DB
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

  // Update user's current belt level
  await db.user.update({
    where: { id: examAttempt.userId },
    data: { currentBelt: examAttempt.beltLevel },
  })

  // Also update member's belt level
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
