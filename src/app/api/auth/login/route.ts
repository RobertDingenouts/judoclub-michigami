import { NextResponse } from 'next/server'
import { login } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body as { email?: string; password?: string }

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Vul e-mailadres en wachtwoord in', success: false },
        { status: 400 }
      )
    }

    const result = await login(email, password)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, success: false },
        { status: 401 }
      )
    }

    return NextResponse.json({ success: true, user: result.user })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden', success: false },
      { status: 500 }
    )
  }
}
