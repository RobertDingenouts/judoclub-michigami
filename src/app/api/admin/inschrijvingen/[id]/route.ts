import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, hashPassword } from '@/lib/auth'
import { sendEmail, buildAccountWelcomeEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

// PATCH — Approve or reject application
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminSession = await requireAdmin()
    if (!adminSession) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const { id } = await params;
    const body = await request.json()
    const { action, adminNotes, rejectionReason } = body as Record<string, any>

    if (!action || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({ error: 'Ongeldige actie' }, { status: 400 })
    }

    const application = await db.membershipApplication.findUnique({
      where: { id },
    })

    if (!application) {
      return NextResponse.json({ error: 'Inschrijving niet gevonden' }, { status: 404 })
    }

    if (application.status !== 'PENDING') {
      return NextResponse.json({ error: 'Deze inschrijving is al verwerkt' }, { status: 409 })
    }

    if (action === 'APPROVE') {
      // Generate temp password
      const tempPassword = `${application.firstName.substring(0, 3).toLowerCase()}${application.lastName.substring(0, 3).toLowerCase()}${new Date().getFullYear()}`
      const passwordHash = await hashPassword(tempPassword)
      const memberEmail = application.email.toLowerCase().trim()

      // Create User + Member
      const user = await db.user.create({
        data: {
          email: memberEmail,
          name: `${application.firstName} ${application.lastName}`.trim(),
          passwordHash,
          role: 'MEMBER',
        },
      })

      await db.member.create({
        data: {
          userId: user.id,
          firstName: application.firstName,
          lastName: application.lastName,
          email: application.email,
          phone: application.phone || null,
          dateOfBirth: application.dateOfBirth || null,
          gender: application.gender || null,
          address: application.address || null,
          postalCode: application.postalCode || null,
          city: application.city || null,
          location: application.location,
          joinDate: new Date(),
          currentBelt: 'WIT' as any,
          isActive: true,
          whatsappGroup: null,
          portraitRights: application.portraitRights ?? true,
          nameMention: application.nameMention ?? true,
          privacyAgreed: application.privacyAgreed,
          privacyAgreedAt: application.privacyAgreedAt ?? new Date(),
          termsAgreed: application.termsAgreed,
          termsAgreedAt: application.termsAgreedAt ?? new Date(),
          codeOfConduct: application.codeOfConduct,
          remarks: adminNotes ? `Goedgekeurd: ${adminNotes}` : null,
          emergencyContactName: application.emergencyContact || null,
          emergencyContactPhone: null,
          medicalNotes: application.medicalNotes || null,
        },
      })

      // Update application
      await db.membershipApplication.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedBy: adminSession.userId,
          approvedAt: new Date(),
          adminNotes: adminNotes || null,
          memberId: user.id,
        },
      })

      console.log(`[INSCHRIJVING] Goedgekeurd: ${application.firstName} ${application.lastName} (${application.email}) — temp pw: ${tempPassword}`)

      // Welkomstmail met tijdelijk wachtwoord.
      // Best-effort: goedkeuring slaagt ook als de mail niet doorkomt.
      let mailSent = false
      try {
        const tpl = buildAccountWelcomeEmail(`${application.firstName} ${application.lastName}`.trim(), memberEmail, tempPassword)
        await sendEmail({ to: memberEmail, subject: tpl.subject, html: tpl.html })
        mailSent = true
      } catch (mailErr) {
        console.error('[INSCHRIJVING] Welkomstmail mislukt:', mailErr)
      }

      return NextResponse.json({
        success: true,
        message: mailSent
          ? 'Inschrijving goedgekeurd — account aangemaakt en inloggegevens verzonden'
          : 'Inschrijving goedgekeurd — account aangemaakt, maar het versturen van de e-mail is mislukt (handmatig doorgeven)',
        tempPassword,
        email: application.email,
        mailSent,
      })
    } else {
      // REJECT
      await db.membershipApplication.update({
        where: { id },
        data: {
          status: 'REJECTED',
          rejectedAt: new Date(),
          rejectionReason: rejectionReason || null,
          adminNotes: adminNotes || null,
        },
      })

      console.log(`[INSCHRIJVING] Afgewezen: ${application.firstName} ${application.lastName} (${application.email})`)

      return NextResponse.json({
        success: true,
        message: 'Inschrijving afgewezen',
      })
    }
  } catch (error: any) {
    console.error('[ADMIN/INSCHRIJVINGEN] PATCH error:', error)
    return NextResponse.json({ error: 'Er is een fout opgetreden: ' + error.message }, { status: 500 })
  }
}
