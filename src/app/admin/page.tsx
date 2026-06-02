import { db } from '@/lib/db'
import Link from 'next/link'
import type { BeltLevel, ExamStatus, DiplomaType } from '@prisma/client'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  // Fetch stats
  const [totalStudents, totalExams, totalDiplomas, recentExams, beltDistribution] = await Promise.all([
    db.member.count(),
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
    db.user.groupBy({
      by: ['currentBelt'],
      _count: { currentBelt: true },
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
          subtitle="Aangemeld"
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
    WIT: 'Wit', GEEL: 'Geel', ORANJE: 'Oranje', GROEN: 'Groen',
    BLAUW: 'Blauw', BRUIN_1: 'Bruin 1', BRUIN_2: 'Bruin 2', BRUIN_3: 'Bruin 3',
    Zwart_1: 'Zwart 1', Zwart_2: 'Zwart 2', Zwart_3: 'Zwart 3',
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
