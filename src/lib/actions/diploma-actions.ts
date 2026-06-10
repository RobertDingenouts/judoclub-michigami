'use server'

/**
 * Server Actions for Diploma Management
 * Called from the UI to approve exams and generate diplomas.
 */

import { db } from '@/lib/db'
import { createDiplomaOnExamPass, getUserDiplomas } from '@/lib/diploma-generator'
import { ExamStatus } from '@prisma/client'

// ============================================================================
// Approve exam → auto-generate diploma
// ============================================================================

export async function approveExam(examAttemptId: string): Promise<{
  success: boolean
  message: string
  diplomaId?: string
  verificationCode?: string
}> {
  try {
    // Update exam status to PASSED
    await db.examAttempt.update({
      where: { id: examAttemptId },
      data: {
        status: ExamStatus.COMPLETED_PASSED,
        examDate: new Date(),
      },
    })

    // Trigger diploma generation
    const result = await createDiplomaOnExamPass(examAttemptId)

    return {
      success: true,
      message: `Examen goedgekeurd! Diploma gegenereerd met verificatiecode ${result.verificationCode}`,
      diplomaId: result.diplomaId,
      verificationCode: result.verificationCode,
    }
  } catch (error: any) {
    console.error('Approve exam error:', error)

    // If diploma already exists, that's OK — exam was already approved
    if (error.message?.includes('already exists')) {
      const existing = await db.diploma.findFirst({
        where: { examAttemptId },
      })
      return {
        success: true,
        message: `Examen was al goedgekeurd. Verificatiecode: ${existing?.verificationCode}`,
        diplomaId: existing?.id,
        verificationCode: existing?.verificationCode,
      }
    }

    return {
      success: false,
      message: error.message || 'Er ging iets mis bij het goedkeuren van het examen',
    }
  }
}

// ============================================================================
// Fail exam (no diploma)
// ============================================================================

export async function failExam(examAttemptId: string): Promise<{
  success: boolean
  message: string
}> {
  try {
    await db.examAttempt.update({
      where: { id: examAttemptId },
      data: {
        status: ExamStatus.COMPLETED_FAILED,
        examDate: new Date(),
      },
    })

    return {
      success: true,
      message: 'Examen afgewezen. Geen diploma gegenereerd.',
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Er ging iets mis',
    }
  }
}

// ============================================================================
// Get user's diplomas (server action for client components)
// ============================================================================

export async function fetchUserDiplomas(userId: string) {
  try {
    return await getUserDiplomas(userId)
  } catch (error: any) {
    console.error('Fetch diplomas error:', error)
    return []
  }
}

// ============================================================================
// Download diploma PDF (server action returns URL)
// ============================================================================

export async function getDiplomaDownloadUrl(diplomaId: string): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
  return `${baseUrl}/api/diplomas/download?id=${diplomaId}`
}
