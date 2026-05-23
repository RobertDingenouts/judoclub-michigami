// Supabase Auth utilities for server-side operations
import { createClient } from '@/lib/supabase/server'
import { db } from './db'
import type { Role } from '@prisma/client'

// ============================================================================
// Get current user from Supabase session (server-side)
// ============================================================================

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// ============================================================================
// Ensure user exists in our database after Supabase auth
// ============================================================================

export async function ensureUserInDb(userId: string, email: string, name?: string) {
  const existing = await db.user.findUnique({
    where: { id: userId },
  })

  if (existing) return existing

  return db.user.create({
    data: {
      id: userId,
      email,
      name: name || null,
      role: 'MEMBER',
      currentBelt: null,
      totalPoints: 0,
      weeklyPoints: 0,
    },
  })
}

// ============================================================================
// Admin checks
// ============================================================================

export async function requireAdmin(): Promise<{ userId: string; role: Role } | null> {
  const user = await getCurrentUser()
  if (!user) return null

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  })

  if (!dbUser || dbUser.role !== 'ADMIN') return null

  return { userId: user.id, role: dbUser.role }
}

export async function isAdmin(): Promise<boolean> {
  const result = await requireAdmin()
  return !!result
}

// ============================================================================
// Sign out (server-side)
// ============================================================================

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}
