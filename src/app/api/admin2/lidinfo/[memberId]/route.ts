import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Snelle "ℹ️"-samenvatting van een lid voor op de contributie-/materiaalschermen:
// wie is dit, sinds wanneer, welke band, laatste examens, contributiestatus,
// laatste materiaalverkopen. Eén call, compacte payload.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ memberId: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Geen admin' }, { status: 403 })
  const { memberId } = await params
  if (!memberId || !/^[a-z0-9_]+$/i.test(memberId) || memberId.length > 40) {
    return NextResponse.json({ error: 'Ongeldig lid-id' }, { status: 400 })
  }

  const [member, examens, betalingen, materiaal] = await Promise.all([
    db.member.findUnique({
      where: { id: memberId },
      select: {
        id: true, firstName: true, lastName: true, email: true, phone: true, phone2: true,
        dateOfBirth: true, address: true, postalCode: true, city: true, currentBelt: true,
        joinDate: true, clubStatus: true, leaveDate: true, primaryGroup: true, trainingGroups: true,
        whatsappGroup: true, remarks: true, isTrainer: true,
      },
    }),
    db.examAttempt.findMany({ where: { memberId }, orderBy: { examDate: 'desc' }, take: 4, select: { beltLevel: true, examDate: true, status: true, overallScore: true } }),
    db.payment.findMany({ where: { memberId }, orderBy: { period: { start: 'desc' } }, take: 5, select: { amount: true, status: true, invoiceNumber: true, paidAt: true, items: true, period: { select: { label: true } } } }),
    db.inventoryMove.findMany({ where: { memberId, soort: 'VERKOOP' }, orderBy: { createdAt: 'desc' }, take: 4, select: { product: true, maat: true, aantal: true, prijs: true, createdAt: true, periode: true } }),
  ])
  if (!member) return NextResponse.json({ error: 'Lid niet gevonden' }, { status: 404 })

  return NextResponse.json({
    lid: {
      ...member,
      groups: Array.isArray(member.trainingGroups) ? (member.trainingGroups as string[]) : [],
    },
    examens,
    betalingen,
    materiaal,
  })
}
