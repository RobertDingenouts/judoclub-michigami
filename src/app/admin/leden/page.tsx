import { db } from '@/lib/db'
import { LedenTable } from './LedenTable'
import { BELT_ORDER } from '@/lib/student-progress-types'
import type { BeltLevel } from '@prisma/client'

export const dynamic = 'force-dynamic'

export default async function LedenPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; groep?: string; band?: string; status?: string }>
}) {
  const params = await searchParams

  const [members, periods] = await Promise.all([
    db.member.findMany({
      orderBy: [{ primaryGroup: 'asc' }, { lastName: 'asc' }, { firstName: 'asc' }],
      include: {
        bondHistory: { orderBy: { awardedAt: 'asc' } },
        payments: { include: { period: true } },
        examAttempts: { orderBy: { examDate: 'desc' }, take: 5 },
        competitions: { orderBy: { date: 'desc' }, take: 10 },
        courseProgress: { where: { isPassed: true }, select: { beltLevel: true, courseName: true } },
      },
    }),
    db.contributionPeriod.findMany({ orderBy: { start: 'asc' } }),
  ])

  const rows = members.map(m => ({
    id: m.id,
    firstName: m.firstName,
    lastName: m.lastName,
    isActive: m.isActive,
    clubStatus: m.clubStatus,
    leaveDate: m.leaveDate?.toISOString().slice(0, 10) ?? null,
    groep: m.primaryGroup,
    band: m.currentBelt,
    bondsnummer: m.bondsnummer,
    dateOfBirth: m.dateOfBirth?.toISOString() ?? null,
    email: m.email, phone: m.phone, phone2: m.phone2,
    address: m.address, postalCode: m.postalCode, city: m.city,
    location: m.location,
    joinDate: m.joinDate?.toISOString() ?? null,
    remarks: m.remarks, medicalNotes: m.medicalNotes,
    emergencyContactName: m.emergencyContactName, emergencyContactPhone: m.emergencyContactPhone,
    portretrecht: m.portraitRights,
    bandHistory: m.bondHistory.map(b => ({ belt: b.belt, at: b.awardedAt.toISOString() })),
    payments: m.payments.map(p => ({
      label: p.period.label, status: p.status,
      amount: Number(p.amount), note: p.note,
    })),
    exams: m.examAttempts.map(e => ({
      belt: e.beltLevel, status: e.status,
      date: e.examDate?.toISOString() ?? null, score: e.overallScore,
    })),
    competitions: m.competitions.map(c => ({ id: c.id, date: c.date.toISOString(), name: c.name, result: c.result })),
    jpDiolmas: m.courseProgress.map(c => c.beltLevel),
  }))

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-[#2a2a2a]">Leden</h1>
        <p className="mt-1 text-sm text-gray-500">klik op een lid om alle gegevens uit te klappen</p>
      </div>
      <LedenTable rows={rows} periodLabels={periods.map(p => p.label)} />
    </div>
  )
}
