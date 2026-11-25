// Auth utilities for admin dashboard
// Uses iron-session for cookie-based sessions + bcrypt for password hashing

import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { db } from './db'
import type { Role } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

// ============================================================================
// Session types & config
// ============================================================================

export interface SessionData {
  userId: string
  email?: string | null
  name?: string
  role: Role
  loginTime: number
}

const SESSION_SECRET = process.env.SESSION_SECRET || 'michigami-admin-session-secret-change-in-production'

export async function getSession() {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, {
    password: SESSION_SECRET,
    cookieName: 'michigami-admin',
    cookieOptions: {
      // Op de lokale testserver (next start via http://Tailscale-IP) MOET secure uit,
      // anders weigert de browser de sessie-cookie en kan niemand inloggen.
      secure: process.env.NODE_ENV === 'production' && process.env.SESSION_COOKIE_SECURE !== 'false',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    },
  })
  return session
}

export async function setSession(data: SessionData) {
  const session = await getSession()
  Object.assign(session, data)
  session.userId = data.userId
  session.email = data.email || undefined
  session.name = data.name
  session.role = data.role
  session.loginTime = Date.now()
  await session.save()
}

export async function destroySession() {
  const session = await getSession()
  session.destroy()
}

// ============================================================================
// Password helpers
// ============================================================================

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// ============================================================================
// Token helpers (email verification & password reset)
// ============================================================================

/** Genereert een cryptografisch veilige token voor verificatie/reset. */
export function generateToken(): string {
  return randomBytes(32).toString('hex')
}

// ============================================================================
// Auth actions
// ============================================================================

export async function login(email: string, password: string) {
  const user = await db.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  })

  if (!user || !user.passwordHash) {
    return { error: 'Ongeldig e-mailadres of wachtwoord', success: false }
  }

  if (user.is_active === false) {
    return { error: 'Dit account is gedeactiveerd. Neem contact op met de club.', success: false }
  }

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) {
    return { error: 'Ongeldig e-mailadres of wachtwoord', success: false }
  }

  await setSession({
    userId: user.id,
    email: user.email,
    name: user.name || undefined,
    role: user.role,
    loginTime: Date.now(),
  })

  return { success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } }
}

export async function requireAdmin() {
  const session = await getSession()
  if (!session.userId || session.role !== 'ADMIN') {
    return null
  }
  return session
}

export async function isAdmin(): Promise<boolean> {
  const session = await getSession()
  return !!session.userId && session.role === 'ADMIN'
}

// ============================================================================
// Member auth
// ============================================================================

export async function isMember(): Promise<boolean> {
  const session = await getSession()
  return !!session.userId && ['MEMBER', 'PARENT', 'INSTRUCTOR', 'ADMIN'].includes(session.role)
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session.userId) return null
  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: { member: true },
  })
  if (!user) return null
  // Geen geheimen naar de browser: hash & resettoken only-ever meesturen als expliciet nodig
  const { passwordHash, resetToken, resetTokenExpires, ...safeUser } = user
  return safeUser
}

// ============================================================================
// Registration
// ============================================================================

export async function register(name: string, email: string, password: string) {
  // Check if email already exists
  const existing = await db.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  })

  if (existing) {
    return { error: 'Dit e-mailadres is al geregistreerd', success: false }
  }

  const passwordHash = await hashPassword(password)

  const user = await db.user.create({
    data: {
      email: email.trim().toLowerCase(),
      name: name.trim(),
      passwordHash,
      role: 'MEMBER',
    },
  })

  // Auto-create member profile
  await db.member.create({
    data: {
      userId: user.id,
      firstName: name.trim().split(' ')[0] || name.trim(),
      lastName: name.trim().split(' ').slice(1).join(' ') || '',
      email: email.trim().toLowerCase(),
    },
  })

  // Auto-login after registration
  await setSession({
    userId: user.id,
    email: user.email,
    name: user.name || undefined,
    role: user.role,
    loginTime: Date.now(),
  })

  return { success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } }
}
