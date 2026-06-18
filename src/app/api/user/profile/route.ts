import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// PATCH - Update user profile
export async function PATCH(request: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  try {
    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      phone2,
      dateOfBirth,
      gender,
      address,
      postalCode,
      city,
      whatsappGroup,
      portraitRights,
      nameMention,
      privacyAgreed,
      termsAgreed,
      remarks,
      emergencyContactName,
      emergencyContactPhone,
      medicalNotes,
      imageUrl,
    } = body

    // Defensive: if no Member record, create one on-the-fly
    let member = user.member
    if (!member) {
      member = await db.member.create({
        data: {
          userId: user.id,
          firstName: firstName || (user.name || '').split(' ')[0] || 'Admin',
          lastName: lastName || (user.name || '').split(' ').slice(1).join(' ') || '',
          email: email || user.email,
          joinDate: new Date(),
          currentBelt: 'WIT' as any,
        },
      })
    }

    // Track important changes for admin notification
    const importantChanges: string[] = []

    // If email is being changed, update user record too
    if (email && email !== user.email) {
      const existing = await db.user.findUnique({ where: { email } })
      if (existing) {
        return NextResponse.json({ error: 'Dit e-mailadres is al in gebruik' }, { status: 400 })
      }
      importantChanges.push(`E-mail: ${user.email} → ${email}`)
      await db.user.update({
        where: { id: user.id },
        data: { email },
      })
    }

    // Check for other important changes
    if (medicalNotes && medicalNotes !== member.medicalNotes) {
      importantChanges.push('Medische notities gewijzigd')
    }
    if (emergencyContactName && emergencyContactName !== member.emergencyContactName) {
      importantChanges.push(`Noodcontact naam: ${member.emergencyContactName || '(leeg)'} → ${emergencyContactName}`)
    }
    if (emergencyContactPhone && emergencyContactPhone !== member.emergencyContactPhone) {
      importantChanges.push(`Noodcontact tel: ${member.emergencyContactPhone || '(leeg)'} → ${emergencyContactPhone}`)
    }

    // Build member update data
    const memberData: any = {}
    if (firstName !== undefined) memberData.firstName = firstName
    if (lastName !== undefined) memberData.lastName = lastName
    if (email !== undefined) memberData.email = email
    if (phone !== undefined) memberData.phone = phone
    if (phone2 !== undefined) memberData.phone2 = phone2
    if (dateOfBirth !== undefined) memberData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null
    if (gender !== undefined) memberData.gender = gender
    if (address !== undefined) memberData.address = address
    if (postalCode !== undefined) memberData.postalCode = postalCode
    if (city !== undefined) memberData.city = city
    if (whatsappGroup !== undefined) memberData.whatsappGroup = whatsappGroup
    if (portraitRights !== undefined) memberData.portraitRights = portraitRights
    if (nameMention !== undefined) memberData.nameMention = nameMention
    if (remarks !== undefined) memberData.remarks = remarks
    if (emergencyContactName !== undefined) memberData.emergencyContactName = emergencyContactName
    if (emergencyContactPhone !== undefined) memberData.emergencyContactPhone = emergencyContactPhone
    if (medicalNotes !== undefined) memberData.medicalNotes = medicalNotes

    // Handle privacy agreement
    if (privacyAgreed !== undefined) {
      memberData.privacyAgreed = privacyAgreed
      memberData.privacyAgreedAt = privacyAgreed ? new Date() : null
    }

    // Handle terms agreement
    if (termsAgreed !== undefined) {
      memberData.termsAgreed = termsAgreed
      memberData.termsAgreedAt = termsAgreed ? new Date() : null
    }

    const updatedMember = await db.member.update({
      where: { id: member.id },
      data: memberData,
      include: { user: true },
    })

    // Sync name to user if changed
    if (firstName || lastName) {
      await db.user.update({
        where: { id: user.id },
        data: { name: `${updatedMember.firstName} ${updatedMember.lastName}` },
      })
    }

    // Update imageUrl if provided
    if (imageUrl) {
      await db.user.update({
        where: { id: user.id },
        data: { imageUrl },
      })
    }

    // Log important changes for admin notification
    if (importantChanges.length > 0) {
      console.log(`[PROFILE CHANGE - ${user.email}] ${importantChanges.join(' | ')}`)
    }

    return NextResponse.json({
      success: true,
      member: updatedMember,
      importantChanges,
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Fout bij bijwerken profiel' }, { status: 500 })
  }
}

// GET - Get current user profile (for consistency)
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  return NextResponse.json({
    success: true,
    member: {
      firstName: user.member?.firstName || '',
      lastName: user.member?.lastName || '',
      email: user.member?.email || user.email,
      phone: user.member?.phone || '',
      phone2: user.member?.phone2 || '',
      dateOfBirth: user.member?.dateOfBirth?.toISOString().split('T')[0] || '',
      gender: user.member?.gender || '',
      address: user.member?.address || '',
      postalCode: user.member?.postalCode || '',
      city: user.member?.city || '',
      location: user.member?.location || '',
      whatsappGroup: user.member?.whatsappGroup || '',
      portraitRights: user.member?.portraitRights ?? null,
      nameMention: user.member?.nameMention ?? null,
      privacyAgreed: user.member?.privacyAgreed ?? null,
      privacyAgreedAt: user.member?.privacyAgreedAt?.toISOString() || null,
      termsAgreed: user.member?.termsAgreed ?? null,
      termsAgreedAt: user.member?.termsAgreedAt?.toISOString() || null,
      remarks: user.member?.remarks || '',
      emergencyContactName: user.member?.emergencyContactName || '',
      emergencyContactPhone: user.member?.emergencyContactPhone || '',
      medicalNotes: user.member?.medicalNotes || '',
    },
  })
}
