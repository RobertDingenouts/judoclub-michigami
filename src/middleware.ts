import { createClient } from '@/lib/supabase/middleware'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { data } = await createClient(request).auth.getUser()

  // Public routes that don't require auth
  const publicPaths = ['/', '/signin', '/signup', '/api/public']
  const isPublic = publicPaths.some(path => request.nextUrl.pathname.startsWith(path))

  if (!data?.user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/signin'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
