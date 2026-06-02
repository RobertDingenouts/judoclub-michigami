import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ authenticated: false })
    }
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        currentBelt: user.currentBelt,
        member: user.member ? {
          firstName: user.member.firstName,
          lastName: user.member.lastName,
          currentBelt: user.member.currentBelt,
        } : null,
      },
    })
  } catch (error) {
    console.error('Auth me error:', error)
    return NextResponse.json({ authenticated: false })
  }
}
