import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getIronSession } from 'iron-session'
import type { SessionData } from './lib/auth'

const SESSION_SECRET = process.env.SESSION_SECRET || 'michigami-admin-session-secret-change-in-production'

// Admin routes that require authentication
const ADMIN_PREFIXES = ['/admin']
// Public admin routes (no auth required)
const PUBLIC_ADMIN_ROUTES: string[] = []

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only run middleware on /admin paths
  const isAdminPath = ADMIN_PREFIXES.some(prefix => pathname.startsWith(prefix))
  if (!isAdminPath) {
    return NextResponse.next()
  }

  // Allow public routes
  const isPublicRoute = PUBLIC_ADMIN_ROUTES.some(route => pathname === route)
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Check session using iron-session with NextRequest
  const response = NextResponse.next()
  const session = await getIronSession<SessionData>(request as any, response, {
    password: SESSION_SECRET,
    cookieName: 'michigami-admin',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24,
      path: '/',
    },
  })

  // Not logged in → redirect to login
  if (!session.userId) {
    const loginUrl = new URL('/admin-login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Logged in but not admin → redirect to home
  if (session.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
