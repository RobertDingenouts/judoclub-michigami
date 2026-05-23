// Student Progress Tracking - TypeScript Type Definitions
// Generated from prisma/schema.prisma models
// Use these types in Server Actions, API routes, and components

import type { BeltLevel, DiplomaType, ExamStatus, ActivityType } from '@prisma/client'

// ============================================================================
// BELT PROGRESSION ORDER (for UI sorting and gating logic)
// ============================================================================

export const BELT_ORDER: BeltLevel[] = [
  'WIT',
  'GEEL',
  'ORANJE',
  'GROEN',
  'BLAUW',
  'BRUIN_1',
  'BRUIN_2',
  'BRUIN_3',
  'Zwart_1',
  'Zwart_2',
  'Zwart_3',
]

export const BELT_COLORS: Record<BeltLevel, string> = {
  WIT:       '#FFFFFF',
  GEEL:      '#FFD700',
  ORANJE:    '#FF8C00',
  GROEN:     '#228B22',
  BLAUW:     '#0000FF',
  BRUIN_1:   '#8B4513',
  BRUIN_2:   '#8B4513',
  BRUIN_3:   '#8B4513',
  Zwart_1:   '#000000',
  Zwart_2:   '#000000',
  Zwart_3:   '#000000',
}

export const BELT_LABELS_NL: Record<BeltLevel, string> = {
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

export function beltIndex(belt: BeltLevel): number {
  return BELT_ORDER.indexOf(belt)
}

export function nextBelt(current: BeltLevel): BeltLevel | null {
  const idx = beltIndex(current)
  return idx < BELT_ORDER.length - 1 ? BELT_ORDER[idx + 1] : null
}

export function prevBelt(current: BeltLevel): BeltLevel | null {
  const idx = beltIndex(current)
  return idx > 0 ? BELT_ORDER[idx - 1] : null
}

// ============================================================================
// COURSE PROGRESS TYPES (Cursus Japans)
// ============================================================================

export interface JapaneseCourseSection {
  courseName: string        // e.g., "japanese_white"
  beltLevel: BeltLevel
  title: string             // e.g., "Witte band - Basis woorden"
  lessonsTotal: number
  unlockRequiresBelt?: BeltLevel // Belt needed to unlock this section
}

export interface CourseQuizScore {
  lessonId: string
  score: number             // 0-100
  timestamp: string         // ISO date
}

// ============================================================================
// EXAM TYPES
// ============================================================================

export interface ExamAttemptInput {
  memberId: string
  userId: string
  beltLevel: BeltLevel
  examDate?: Date
  examiner?: string
  notes?: string
}

export interface ExamResultInput {
  techniqueId?: string
  techniqueName: string
  category?: string
  passed: boolean
  score?: number            // 0-10 per technique
  feedback?: string
}

export interface CreateExamAttemptInput extends ExamAttemptInput {
  results: ExamResultInput[]
}

// ============================================================================
// DIPLOMA TYPES
// ============================================================================

export interface DiplomaInput {
  type: DiplomaType
  title: string
  description?: string
  recipientId: string       // memberId
  userId: string
  beltLevel?: BeltLevel
  courseName?: string
  examAttemptId?: string
}

// ============================================================================
// LEADERBOARD TYPES
// ============================================================================

export interface LeaderboardEntryInput {
  userId: string
  memberId?: string
  weekStart: Date
  points: number
  activityType: ActivityType
  referenceId?: string
  description?: string
}

export interface LeaderboardRow {
  rank: number
  userId: string
  userName: string
  memberFirstName: string
  memberLastName: string
  currentBelt: BeltLevel | null
  totalPoints: number
  weeklyPoints: number
}

// ============================================================================
// QUERY HELPERS
// ============================================================================

export interface StudentProgressSummary {
  memberId: string
  userName: string
  currentBelt: BeltLevel | null
  examsPassed: number
  examsFailed: number
  totalAttendance: number
  attendanceThisMonth: number
  diplomas: Array<{
    id: string
    title: string
    type: DiplomaType
    awardedAt: Date
    verificationCode: string
  }>
  courseProgress: Array<{
    courseName: string
    beltLevel: BeltLevel
    lessonsCompleted: number
    lessonsTotal: number
    overallScore: number
    isPassed: boolean
    isUnlocked: boolean
  }>
  leaderboardPoints: {
    total: number
    weekly: number
  }
}
