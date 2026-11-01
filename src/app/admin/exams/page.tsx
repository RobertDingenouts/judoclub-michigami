import { db } from '@/lib/db'
import Link from 'next/link'
import { BELT_LABELS_NL, BELT_COLORS } from '@/lib/student-progress-types'
import type { BeltLevel, ExamStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

export default async function ExamsPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; belt?: string }>
}) {
  const params = await searchParams
  const statusFilter = params?.status || ''
  const beltFilter = params?.belt || ''

  const where: any = {}
  if (statusFilter) where.status = statusFilter as ExamStatus
  if (beltFilter) where.beltLevel = beltFilter as BeltLevel

  const [exams, totalExams, totalPassed, scheduledCount] = await Promise.all([
    db.examAttempt.findMany({
      where,
      orderBy: { examDate: 'desc' },
      include: {
        member: { select: { firstName: true, lastName: true, currentBelt: true } },
        results: true,
      },
      take: 50,
    }),
    db.examAttempt.count({ where }),
    db.examAttempt.count({ where: { status: 'COMPLETED_PASSED', ...where } }),
    db.examAttempt.count({ where: { status: 'SCHEDULED' } }),
  ])

  const passRate = totalExams > 0 ? ((totalPassed / totalExams) * 100).toFixed(0) : '0'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2a2a2a]">Examens</h1>
          <p className="text-sm text-gray-500 mt-1">{totalExams} examens • {passRate}% slagingspercentage</p>
        </div>
        <Link href="/admin/exams/new" className="inline-flex items-center gap-2 rounded-sm bg-[#a90000] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#8c0000]">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nieuw Examen
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard title="Totaal" value={totalExams} />
        <StatCard title="Geslaagd" value={totalPassed} accent="green" />
        <StatCard title="Niet geslaagd" value={totalExams - totalPassed - scheduledCount} accent="red" />
        <StatCard title="Gepland" value={scheduledCount} accent="yellow" />
      </div>

      {/* Filters */}
      <form className="flex flex-col gap-3 sm:flex-row">
        <select name="status" defaultValue={statusFilter} className="rounded-sm border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none">
          <option value="">Alle statussen</option>
          <option value="SCHEDULED">Gepland</option>
          <option value="COMPLETED_PASSED">Geslaagd</option>
          <option value="COMPLETED_FAILED">Niet geslaagd</option>
          <option value="CANCELLED">Geannuleerd</option>
        </select>
        <select name="belt" defaultValue={beltFilter} className="rounded-sm border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none">
          <option value="">Alle banden</option>
          {['WIT', 'GEEL', 'ORANJE', 'GROEN', 'BLAUW', 'BRUIN', 'ZWART_1'].map(b => (
            <option key={b} value={b}>{BELT_LABELS_NL[b as BeltLevel]}</option>
          ))}
        </select>
      </form>

      {/* Exam list */}
      <div className="space-y-3">
        {exams.length > 0 ? exams.map((exam) => (
          <ExamCard key={exam.id} exam={exam} />
        )) : (
          <div className="rounded-sm border border-gray-200 bg-white p-12 text-center shadow-sm">
            <p className="text-lg font-medium text-gray-400">Geen examens gevonden</p>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ title, value, accent }: { title: string; value: number; accent?: string }) {
  const colorMap = { green: 'text-green-700', red: 'text-red-700', yellow: 'text-yellow-700' }
  return (
    <div className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-gray-500">{title}</p>
      <p className={`mt-1 text-2xl font-bold ${colorMap[accent!] || 'text-[#2a2a2a]'}`}>{value}</p>
    </div>
  )
}

function ExamCard({ exam }: { exam: any }) {
  const statusConfig = {
    COMPLETED_PASSED: { bg: 'bg-green-100', text: 'text-green-800', icon: '✓', label: 'Geslaagd' },
    COMPLETED_FAILED: { bg: 'bg-red-100', text: 'text-red-800', icon: '✗', label: 'Niet geslaagd' },
    SCHEDULED: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳', label: 'Gepland' },
    CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-800', icon: '✕', label: 'Geannuleerd' },
  }
  const config = statusConfig[exam.status]

  return (
    <div className="rounded-sm border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-4">
          <div className={`flex h-10 w-10 items-center justify-center rounded-sm ${config.bg} ${config.text}`}>
            {config.icon}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#2a2a2a]">
              {exam.member?.firstName} {exam.member?.lastName}
            </h3>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex h-3 w-3 rounded-full border border-gray-300" style={{ backgroundColor: BELT_COLORS[exam.beltLevel as BeltLevel] || '#ccc' }} />
              <span className="text-xs text-gray-600">{BELT_LABELS_NL[exam.beltLevel as BeltLevel]}</span>
              {exam.examDate && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-500">{new Date(exam.examDate).toLocaleDateString('nl-NL')}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {exam.overallScore != null && (
            <div className="text-right">
              <p className="text-sm font-bold text-[#2a2a2a]">{exam.overallScore}/100</p>
            </div>
          )}
          <span className={`inline-flex rounded-sm px-2.5 py-1 text-xs font-medium ${config.bg} ${config.text}`}>
            {config.label}
          </span>
          <Link href={`/admin/exams/${exam.id}`} className="text-xs text-[#a90000] hover:underline">
            Details →
          </Link>
        </div>
      </div>

      {/* Technique results */}
      {exam.results.length > 0 && (
        <div className="border-t border-gray-100 bg-gray-50 px-5 py-3">
          <p className="mb-2 text-xs font-medium text-gray-500">Technieken ({exam.results.filter((r: any) => r.passed).length}/{exam.results.length} geslaagd):</p>
          <div className="flex flex-wrap gap-1.5">
            {exam.results.map((result: any) => (
              <span
                key={result.id}
                className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs ${
                  result.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {result.techniqueName} ({result.score ?? '-'})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Examiner notes */}
      {exam.notes && (
        <div className="border-t border-gray-100 px-5 py-3">
          <p className="text-xs text-gray-500"><span className="font-medium">Notities:</span> {exam.notes}</p>
        </div>
      )}
    </div>
  )
}
