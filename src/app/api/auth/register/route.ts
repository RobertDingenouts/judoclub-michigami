import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, email, name } = body

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'userId en email zijn verplicht' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existing = await db.user.findFirst({
      where: { email },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Gebruiker bestaat al' },
        { status: 409 }
      )
    }

    // Create user record in our database
    const user = await db.user.create({
      data: {
        id: userId, // Use Supabase Auth user ID
        email,
        name: name || null,
        role: 'MEMBER',
        currentBelt: null,
        totalPoints: 0,
        weeklyPoints: 0,
      },
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registratie mislukt' },
      { status: 500 }
    )
  }
}
