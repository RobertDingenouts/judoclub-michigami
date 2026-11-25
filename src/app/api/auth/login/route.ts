import { NextRequest, NextResponse } from 'next/server'
import { login } from '@/lib/auth'
import { rateLimit, clientIp } from '@/lib/ratelimit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body as { email: string; password: string }

    if (!rateLimit('login:' + clientIp(request), 10, 5 * 60 * 1000)) {
      return NextResponse.json(
        { success: false, error: 'Te veel pogingen — wacht even en probeer opnieuw.' },
        { status: 429 }
      )
    }

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Vul alle velden in' },
        { status: 400 }
      )
    }

    const result = await login(email, password)
    if (!result.success) {
      return NextResponse.json(result, { status: 401 })
    }

    return NextResponse.json({ success: true, user: result.user })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}
