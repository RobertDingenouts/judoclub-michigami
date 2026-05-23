// Auth utilities for admin dashboard
// Uses iron-session for cookie-based sessions + bcrypt for password hashing

import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { db } from './db'
import type { Role } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

// ============================================================================
// Session types & config
// ============================================================================

export interface SessionData {
  userId: string
  email: string
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
      secure: process.env.NODE_ENV === 'production',
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
  session.email = data.email
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
// Auth actions
// ============================================================================

export async function login(email: string, password: string) {
  const user = await db.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  })

  if (!user || !user.passwordHash) {
    return { error: 'Ongeldig e-mailadres of wachtwoord', success: false }
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
