'use server'

/**
 * Server Actions for Diploma Management
 * Called from the UI to approve exams and generate diplomas.
 */

import { db } from '@/lib/db'
import { createDiplomaOnExamPass, getUserDiplomas } from '@/lib/diploma-generator'
import { ExamStatus } from '@prisma/client'
import { requireAdmin, getCurrentUser } from '@/lib/auth'

// ============================================================================
// Approve exam → auto-generate diploma
// ============================================================================

export async function approveExam(examAttemptId: string): Promise<{
  success: boolean
  message: string
  diplomaId?: string
  verificationCode?: string
}> {
  const admin = await requireAdmin()
  if (!admin) return { success: false, message: 'Geen toegang' }
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
  const admin = await requireAdmin()
  if (!admin) return { success: false, message: 'Geen toegang' }
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
    const current = await getCurrentUser()
    if (!current) return []
    if (current.id !== userId && !['ADMIN', 'INSTRUCTOR'].includes(current.role)) return []
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
  // NEXT_PUBLIC_BASE_URL is available in both server and client context
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_BASE_URL) {
    return `${process.env.NEXT_PUBLIC_BASE_URL}/api/diplomas/download?id=${encodeURIComponent(diplomaId)}`
  }
  // Client-side fallback
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/diplomas/download?id=${encodeURIComponent(diplomaId)}`
  }
  // Ultimate fallback
  return `/api/diplomas/download?id=${diplomaId}`
}
