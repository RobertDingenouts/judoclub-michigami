import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      postalCode,
      city,
      location,
      membershipType,
      isChild,
      parentName,
      parentEmail,
      parentPhone,
      medicalNotes,
      emergencyContact,
      costAgreed,
      privacyAgreed,
      termsAgreed,
      portraitRights,
    } = body as Record<string, any>

    // Validation
    if (!firstName || !lastName || !email || !location || !membershipType) {
      return NextResponse.json({ success: false, error: 'Vul alle verplichte velden in' }, { status: 400 })
    }

    if (!costAgreed || !privacyAgreed || !termsAgreed) {
      return NextResponse.json({ success: false, error: 'Accepteer alle akkoorden' }, { status: 400 })
    }

    // Check if email already has a pending application
    const existing = await db.membershipApplication.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        status: 'PENDING',
      },
    })

    if (existing) {
      return NextResponse.json({ success: false, error: 'Er is al een openstaande inschrijving voor dit e-mailadres' }, { status: 409 })
    }

    // Check if email already exists as a member
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (existingUser) {
      return NextResponse.json({ success: false, error: 'Dit e-mailadres is al geregistreerd als lid' }, { status: 409 })
    }

    // Create application
    const application = await db.membershipApplication.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender: gender || null,
        address: address?.trim() || null,
        postalCode: postalCode?.trim() || null,
        city: city?.trim() || null,
        location: location.trim(),
        membershipType: membershipType.trim(),
        isChild: isChild || false,
        parentName: parentName?.trim() || null,
        parentEmail: parentEmail?.trim() || null,
        parentPhone: parentPhone?.trim() || null,
        medicalNotes: medicalNotes?.trim() || null,
        emergencyContact: emergencyContact?.trim() || null,
        costAgreed: true,
        privacyAgreed: true,
        termsAgreed: true,
        portraitRights: portraitRights ?? true,
        status: 'PENDING',
      },
    })

    console.log(`[INSCHRIJVING] Nieuw inschrijfformulier: ${firstName} ${lastName} (${email}) — ID: ${application.id}`)

    return NextResponse.json({
      success: true,
      message: 'Inschrijving succesvol verzonden',
      applicationId: application.id,
    })
  } catch (error: any) {
    console.error('[INSCHRIJVING] Error:', error)
    return NextResponse.json({ success: false, error: 'Er is een fout opgetreden' }, { status: 500 })
  }
}
