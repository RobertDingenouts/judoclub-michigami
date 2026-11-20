// Belt utility functions for Judoclub Michigami
// Handles youth/adult belt progression, dan grades, time calculations

import type { BeltLevel } from '@prisma/client'
import { BELT_LABELS_NL, BELT_COLORS } from './student-progress-types'

// ============================================================================
// Belt progression orders
// ============================================================================

export const ADULT_ORDER: BeltLevel[] = [
  'WIT', 'GEEL', 'ORANJE', 'GROEN', 'BLAUW', 'BRUIN',
  'ZWART_1', 'ZWART_2', 'ZWART_3', 'ZWART_4', 'ZWART_5',
  'ZWART_6', 'ZWART_7', 'ZWART_8', 'ZWART_9', 'ZWART_10',
]

export const YOUTH_ORDER: BeltLevel[] = [
  'WIT', 'WIT_GEEL', 'GEEL', 'GEEL_ORANJE', 'ORANJE', 'ORANJE_GROEN',
  'GROEN', 'GROEN_BLAUW', 'BLAUW', 'BLAUW_BRUIN', 'BRUIN',
  'ZWART_1', 'ZWART_2', 'ZWART_3', 'ZWART_4', 'ZWART_5',
  'ZWART_6', 'ZWART_7', 'ZWART_8', 'ZWART_9', 'ZWART_10',
]

const SLIP_BELTS: BeltLevel[] = [
  'WIT_GEEL', 'GEEL_ORANJE', 'ORANJE_GROEN', 'GROEN_BLAUW', 'BLAUW_BRUIN',
]

// ============================================================================
// Age determination
// ============================================================================

export function isYouth(dateOfBirth: Date | null | undefined): boolean {
  if (!dateOfBirth) return false
  const today = new Date()
  const age = today.getFullYear() - dateOfBirth.getFullYear()
  const monthDiff = today.getMonth() - dateOfBirth.getMonth()
  const actualAge = monthDiff < 0 ? age - 1 : age
  return actualAge < 13
}

export function getAge(dateOfBirth: Date | null | undefined): number | null {
  if (!dateOfBirth) return null
  const today = new Date()
  const age = today.getFullYear() - dateOfBirth.getFullYear()
  const monthDiff = today.getMonth() - dateOfBirth.getMonth()
  return monthDiff < 0 ? age - 1 : age
}

// ============================================================================
// Belt helpers
// ============================================================================

export function isSlipBelt(belt: BeltLevel): boolean {
  return SLIP_BELTS.includes(belt)
}

export function isDanGrade(belt: BeltLevel): boolean {
  return belt.startsWith('ZWART_') || ['Zwart_1', 'Zwart_2', 'Zwart_3'].includes(belt)
}

export function getDanNumber(belt: BeltLevel): number | null {
  const match = belt.match(/ZWART_(\d+)/) || belt.match(/Zwart_(\d+)/)
  return match ? parseInt(match[1], 10) : null
}

export function getDanColorClass(belt: BeltLevel): string {
  const danNum = getDanNumber(belt)
  if (!danNum) return ''
  if (danNum >= 6 && danNum <= 8) return 'belt-dan-red-white'
  if (danNum >= 9) return 'belt-dan-red'
  return 'belt-dan-black'
}

// ============================================================================
// Belt progression
// ============================================================================

export function getNextBelt(currentBelt: BeltLevel | null, isYouthMember: boolean): BeltLevel | null {
  if (!currentBelt) return isYouthMember ? YOUTH_ORDER[0] : ADULT_ORDER[0]
  const order = isYouthMember ? YOUTH_ORDER : ADULT_ORDER
  // Paarse startband is geen examengraad: het eerste examen is altijd voor de witte band
  if (currentBelt === 'PAARS') return order[0]
  const currentIndex = order.indexOf(currentBelt)
  if (currentIndex === -1 || currentIndex >= order.length - 1) {
    return null // Max grade bereikt
  }
  return order[currentIndex + 1]
}

// ============================================================================
// Time in belt
// ============================================================================

export function getTimeInBelt(
  lastExamDate: Date | null,
  joinDate: Date
): { years: number; months: number; weeks: number; text: string } {
  const fromDate = lastExamDate || joinDate
  const now = new Date()
  const diffMs = now.getTime() - fromDate.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  const years = Math.floor(diffDays / 365)
  const months = Math.floor((diffDays % 365) / 30)
  const weeks = Math.floor((diffDays % 30) / 7)

  let parts: string[] = []
  if (years > 0) parts.push(`${years} jaar`)
  if (months > 0) parts.push(`${months} maand${months > 1 ? 'en' : ''}`)
  if (weeks > 0 || parts.length === 0) parts.push(`${weeks} week${weeks !== 1 ? 'en' : ''}`)

  return { years, months, weeks, text: parts.join(', ') }
}

// ============================================================================
// Label + color lookup (delegates to student-progress-types)
// ============================================================================

export function getBeltLabel(belt: BeltLevel | null): string {
  if (!belt) return 'Niet ingesteld'
  return BELT_LABELS_NL[belt] || belt
}

export function getBeltColor(belt: BeltLevel | null): string {
  if (!belt) return '#CCCCCC'
  return BELT_COLORS[belt] || '#CCCCCC'
}
