import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendEmail, buildEmailChangeNoticeEmail } from '@/lib/email'

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
      codeOfConduct,
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
          email: email || user.email || null,
          joinDate: new Date(),
          currentBelt: 'PAARS' as any,
        },
      })
    }

    // Track important changes for admin notification
    const importantChanges: string[] = []

    // Normaliseer e-mail (trim + lowercase) zodat casewijziging niet per
    // ongeluk een "wijziging" triggert.
    const normalizedEmail = email ? String(email).trim().toLowerCase() : email

    // E-mail wijzigen: direct van kracht (geen bevestigingsstap meer).
    // Beveiligingsmelding naar het oude adres, zodat misbruik opvalt.
    if (normalizedEmail && normalizedEmail !== (user.email?.toLowerCase() || '')) {
      const existing = await db.user.findFirst({
        where: { email: normalizedEmail, NOT: { id: user.id } },
      })
      if (existing) {
        return NextResponse.json({ error: 'Dit e-mailadres is al in gebruik' }, { status: 400 })
      }

      await db.user.update({
        where: { id: user.id },
        data: { email: normalizedEmail },
      })

      // Beveiligingsmelding naar OUD adres (best-effort)
      if (user.email) {
        try {
          const notice = buildEmailChangeNoticeEmail(user.name || 'lid', normalizedEmail)
          await sendEmail({ to: user.email, subject: notice.subject, html: notice.html })
        } catch (mailErr) {
          console.error('Beveiligingsmelding oud adres mislukt:', mailErr)
        }
      }

      importantChanges.push(`E-mail wijziging: ${user.email || '(geen)'} → ${normalizedEmail}`)
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
    if (normalizedEmail !== undefined) memberData.email = normalizedEmail
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

    // Handle code of conduct agreement
    if (codeOfConduct !== undefined) {
      memberData.codeOfConduct = codeOfConduct
      memberData.codeOfConductAt = codeOfConduct ? new Date() : null
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
      console.log(`[PROFILE CHANGE - ${user.email || user.id}] ${importantChanges.join(' | ')}`)
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
      email: user.member?.email || user.email || null,
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
      codeOfConduct: user.member?.codeOfConduct ?? null,
      codeOfConductAt: user.member?.codeOfConductAt?.toISOString() || null,
      remarks: user.member?.remarks || '',
      emergencyContactName: user.member?.emergencyContactName || '',
      emergencyContactPhone: user.member?.emergencyContactPhone || '',
      medicalNotes: user.member?.medicalNotes || '',
    },
  })
}
