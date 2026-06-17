import { db } from '@/lib/db'
import Link from 'next/link'
import { LOCATION_LABELS_NL } from '@/lib/student-progress-types'
import type { BeltLevel, ExamStatus, DiplomaType } from '@prisma/client'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  // Fetch stats (only active members)
  const [totalStudents, totalExams, totalDiplomas, recentExams, beltDistribution, trashedCount, locationDistribution] = await Promise.all([
    db.member.count({ where: { isActive: true } }),
    db.examAttempt.count(),
    db.diploma.count(),
    db.examAttempt.findMany({
      take: 5,
      orderBy: { examDate: 'desc' },
      include: {
        member: true,
        results: true,
      },
      where: { examDate: { not: null } },
    }),
    db.member.groupBy({
      where: { isActive: true },
      by: ['currentBelt'],
      _count: { currentBelt: true },
    }),
    db.member.count({ where: { isActive: false } }),
    db.member.groupBy({
      where: { isActive: true, location: { not: null } },
      by: ['location'],
      _count: { location: true },
    }),
  ])

  const beltCounts = beltDistribution.reduce<Record<string, number>>((acc, item) => {
    const belt = item.currentBelt || 'Onbekend'
    acc[belt] = item._count.currentBelt
    return acc
  }, {})

  const pendingExams = await db.examAttempt.count({
    where: { status: 'SCHEDULED' },
  })

  const passRate = totalExams > 0
    ? ((await db.examAttempt.count({ where: { status: 'COMPLETED_PASSED' } }) / totalExams) * 100).toFixed(0)
    : '0'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#2a2a2a]">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overzicht van studenten, examens en diploma&apos;s</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Studenten"
          value={totalStudents}
          icon="👥"
          href="/admin/students"
          subtitle={`${trashedCount > 0 ? `${trashedCount} in prullenbak` : 'Aangemeld'}`}
        />
        <StatCard
          title="Examens"
          value={totalExams}
          icon="🎯"
          href="/admin/exams"
          subtitle={`${pendingExams} gepland`}
        />
        <StatCard
          title="Diploma&apos;s"
          value={totalDiplomas}
          icon="🏆"
          href="/admin/diplomas"
          subtitle="Uitgereikt"
        />
        <StatCard
          title="Slagingspercentage"
          value={`${passRate}%`}
          icon="📊"
          href="/admin/exams"
          subtitle="Van alle examens"
        />
      </div>

      {/* Belt distribution */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-[#2a2a2a]">Bandverdeling</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {Object.entries(beltCounts).map(([belt, count]) => (
            <div key={belt} className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-center">
              <div className="text-2xl font-bold text-[#a90000]">{count}</div>
              <div className="mt-1 truncate text-xs font-medium text-gray-600">{beltLabel(belt)}</div>
            </div>
          ))}
          {Object.keys(beltCounts).length === 0 && (
            <p className="col-span-6 text-center text-sm text-gray-400">Nog geen studenten geregistreerd</p>
          )}
        </div>
      </div>

      {/* Location distribution */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-[#2a2a2a]">Trainingslocaties</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {locationDistribution.map((item) => {
            const locationName = LOCATION_LABELS_NL[item.location as keyof typeof LOCATION_LABELS_NL] || item.location
            const percentage = totalStudents > 0 ? Math.round((item._count.location / totalStudents) * 100) : 0
            return (
              <div key={item.location} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">📍 {locationName}</p>
                    <p className="mt-1 text-3xl font-bold text-[#a90000]">{item._count.location}</p>
                    <p className="mt-1 text-xs text-gray-400">{percentage}% van alle studenten</p>
                  </div>
                  <Link
                    href={`/admin/students?location=${item.location}`}
                    className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    Bekijk →
                  </Link>
                </div>
              </div>
            )
          })}
          {locationDistribution.length === 0 && (
            <p className="col-span-2 text-center text-sm text-gray-400">Nog geen locaties toegekend aan studenten</p>
          )}
        </div>
      </div>

      {/* Recent exams */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#2a2a2a]">Recente Examens</h2>
          <Link href="/admin/exams" className="text-sm text-[#a90000] hover:underline">
            Bekijk alle →
          </Link>
        </div>

        {recentExams.length > 0 ? (
          <div className="space-y-3">
            {recentExams.map((exam) => (
              <div key={exam.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-4">
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${
                    exam.status === 'COMPLETED_PASSED' ? 'bg-green-100 text-green-700' :
                    exam.status === 'COMPLETED_FAILED' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {exam.status === 'COMPLETED_PASSED' ? '✓' :
                     exam.status === 'COMPLETED_FAILED' ? '✗' : '⏳'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#2a2a2a]">
                      {exam.member?.firstName} {exam.member?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {beltLabel(exam.beltLevel)} • {exam.examDate ? new Date(exam.examDate).toLocaleDateString('nl-NL') : 'Geen datum'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge(exam.status)}`}>
                    {statusLabel(exam.status)}
                  </span>
                  {exam.overallScore != null && (
                    <p className="mt-1 text-xs text-gray-500">{exam.overallScore}/100</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-gray-400 py-8">Nog geen examens geregistreerd</p>
        )}
      </div>

      {/* Quick actions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-[#2a2a2a]">Snelle Acties</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link href="/admin/students" className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:border-[#a90000] hover:bg-[#fdf6f6]">
            <span className="text-xl">➕</span>
            <div>
              <p className="text-sm font-medium text-[#2a2a2a]">Student Toevoegen</p>
              <p className="text-xs text-gray-500">Nieuwe student registreren</p>
            </div>
          </Link>
          <Link href="/admin/exams" className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:border-[#a90000] hover:bg-[#fdf6f6]">
            <span className="text-xl">📝</span>
            <div>
              <p className="text-sm font-medium text-[#2a2a2a]">Examen Plannen</p>
              <p className="text-xs text-gray-500">Nieuw examen registreren</p>
            </div>
          </Link>
          <Link href="/admin/diplomas" className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:border-[#a90000] hover:bg-[#fdf6f6]">
            <span className="text-xl">🎓</span>
            <div>
              <p className="text-sm font-medium text-[#2a2a2a]">Diploma&apos;s Beheren</p>
              <p className="text-xs text-gray-500">Uitreiken en verifiëren</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, href, subtitle }: { title: string; value: string | number; icon: string; href: string; subtitle: string }) {
  return (
    <Link href={href} className="group rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-colors hover:border-[#a90000]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-3xl font-bold text-[#2a2a2a]">{value}</p>
          <p className="mt-1 text-xs text-gray-400">{subtitle}</p>
        </div>
        <span className="text-3xl opacity-60">{icon}</span>
      </div>
    </Link>
  )
}

function beltLabel(belt: string | null): string {
  const labels: Record<string, string> = {
    WIT: 'Wit', WIT_GEEL: 'Wit+Geel', GEEL: 'Geel', GEEL_ORANJE: 'Geel+Oranje',
    ORANJE: 'Oranje', ORANJE_GROEN: 'Oranje+Groen', GROEN: 'Groen', GROEN_BLAUW: 'Groen+Blauw',
    BLAUW: 'Blauw', BLAUW_BRUIN: 'Blauw+Bruin', BRUIN: 'Bruin',
    ZWART_1: 'Zwart 1e Dan', ZWART_2: 'Zwart 2e Dan', ZWART_3: 'Zwart 3e Dan',
    ZWART_4: 'Zwart 4e Dan', ZWART_5: 'Zwart 5e Dan', ZWART_6: 'Zwart 6e Dan',
    ZWART_7: 'Zwart 7e Dan', ZWART_8: 'Zwart 8e Dan', ZWART_9: 'Zwart 9e Dan',
    ZWART_10: 'Zwart 10e Dan',
    // Legacy values
    BRUIN_1: 'Bruin 1e Ke', BRUIN_2: 'Bruin 2e Ke', BRUIN_3: 'Bruin 3e Ke',
    Zwart_1: 'Zwart 1e Dan', Zwart_2: 'Zwart 2e Dan', Zwart_3: 'Zwart 3e Dan',
  }
  return labels[belt || ''] || belt || 'Onbekend'
}

function statusBadge(status: ExamStatus): string {
  switch (status) {
    case 'COMPLETED_PASSED': return 'bg-green-100 text-green-800'
    case 'COMPLETED_FAILED': return 'bg-red-100 text-red-800'
    case 'SCHEDULED': return 'bg-yellow-100 text-yellow-800'
    case 'CANCELLED': return 'bg-gray-100 text-gray-800'
  }
}

function statusLabel(status: ExamStatus): string {
  switch (status) {
    case 'COMPLETED_PASSED': return 'Geslaagd'
    case 'COMPLETED_FAILED': return 'Niet geslaagd'
    case 'SCHEDULED': return 'Gepland'
    case 'CANCELLED': return 'Geannuleerd'
  }
}
