import { NextRequest, NextResponse } from 'next/server'
import { login } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body as { email: string; password: string }

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
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Login error:', msg)
    return NextResponse.json(
      { success: false, error: 'Er is een fout opgetreden: ' + msg.substring(0, 200) },
      { status: 500 }
    )
  }
}
