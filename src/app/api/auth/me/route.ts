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
        imageUrl: user.imageUrl,
        member: user.member ? {
          firstName: user.member.firstName,
          lastName: user.member.lastName,
          email: user.member.email,
          phone: user.member.phone,
          dateOfBirth: user.member.dateOfBirth,
          joinDate: user.member.joinDate,
          currentBelt: user.member.currentBelt,
          emergencyContactName: user.member.emergencyContactName,
          emergencyContactPhone: user.member.emergencyContactPhone,
          medicalNotes: user.member.medicalNotes,
        } : null,
      },
    })
  } catch (error) {
    console.error('Auth me error:', error)
    return NextResponse.json({ authenticated: false })
  }
}
