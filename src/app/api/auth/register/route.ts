import { NextRequest, NextResponse } from 'next/server'
import { register } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body as { name: string; email: string; password: string }

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Vul alle velden in' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Wachtwoord moet minimaal 6 karakters zijn' },
        { status: 400 }
      )
    }

    const result = await register(name, email, password)
    if (!result.success) {
      return NextResponse.json(result, { status: 409 })
    }

    return NextResponse.json({ success: true, user: result.user })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { success: false, error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}
