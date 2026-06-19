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
          phone2: (user.member as any).phone2,
          dateOfBirth: user.member.dateOfBirth,
          gender: (user.member as any).gender,
          address: (user.member as any).address,
          postalCode: (user.member as any).postalCode,
          city: (user.member as any).city,
          joinDate: user.member.joinDate,
          currentBelt: user.member.currentBelt,
          location: (user.member as any).location,
          whatsappGroup: (user.member as any).whatsappGroup,
          portraitRights: (user.member as any).portraitRights,
          nameMention: (user.member as any).nameMention,
          privacyAgreed: (user.member as any).privacyAgreed,
          privacyAgreedAt: (user.member as any).privacyAgreedAt,
          termsAgreed: (user.member as any).termsAgreed,
          termsAgreedAt: (user.member as any).termsAgreedAt,
          codeOfConduct: (user.member as any).codeOfConduct,
          codeOfConductAt: (user.member as any).codeOfConductAt,
          remarks: (user.member as any).remarks,
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
