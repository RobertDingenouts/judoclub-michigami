import { db } from '@/lib/db'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BELT_LABELS_NL, BELT_COLORS } from '@/lib/student-progress-types'
import type { BeltLevel, ExamStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

export default async function ExamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const exam = await db.examAttempt.findUnique({
    where: { id },
    include: {
      member: { include: { user: true } },
      results: true,
    },
  })

  if (!exam) {
    redirect('/admin/exams')
  }

  const statusConfig: Record<ExamStatus, { bg: string; text: string; icon: string; label: string }> = {
    COMPLETED_PASSED: { bg: 'bg-green-100', text: 'text-green-800', icon: '✓', label: 'Geslaagd' },
    COMPLETED_FAILED: { bg: 'bg-red-100', text: 'text-red-800', icon: '✗', label: 'Niet geslaagd' },
    SCHEDULED: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳', label: 'Gepland' },
    CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-800', icon: '✕', label: 'Geannuleerd' },
  }

  const config = statusConfig[exam.status]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/exams" className="text-gray-400 hover:text-[#a90000]">
          ← Terug
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#2a2a2a]">Examen Details</h1>
          <p className="text-sm text-gray-500 mt-1">
            {exam.member?.firstName} {exam.member?.lastName} • {BELT_LABELS_NL[exam.beltLevel as BeltLevel]}
          </p>
        </div>
      </div>

      {/* Exam info */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`flex h-14 w-14 items-center justify-center rounded-lg text-xl ${config.bg} ${config.text}`}>
              {config.icon}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#2a2a2a]">
                {BELT_LABELS_NL[exam.beltLevel as BeltLevel]} Examen
              </h2>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className="inline-flex h-3 w-3 rounded-full border border-gray-300"
                  style={{ backgroundColor: BELT_COLORS[exam.beltLevel as BeltLevel] || '#ccc' }}
                />
                <span className="text-sm text-gray-600">
                  {exam.member?.firstName} {exam.member?.lastName}
                </span>
              </div>
            </div>
          </div>
          <span className={`inline-flex rounded-lg px-3 py-1 text-sm font-medium ${config.bg} ${config.text}`}>
            {config.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <DetailRow label="Datum" value={exam.examDate ? new Date(exam.examDate).toLocaleDateString('nl-NL') : '-'} />
          <DetailRow label="Score" value={exam.overallScore != null ? `${exam.overallScore}/100` : '-'} />
          <DetailRow label="Examiner" value={exam.examiner || '-'} />
          <DetailRow label="Technieken" value={`${exam.results.filter(r => r.passed).length}/${exam.results.length} geslaagd`} />
        </div>

        {exam.notes && (
          <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs font-medium text-gray-500">Notities</p>
            <p className="mt-1 text-sm text-gray-700">{exam.notes}</p>
          </div>
        )}
      </div>

      {/* Technique results */}
      {exam.results.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[#2a2a2a]">
            Technieken ({exam.results.filter(r => r.passed).length}/{exam.results.length} geslaagd)
          </h2>
          <div className="space-y-2">
            {exam.results.map((result) => (
              <div key={result.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                <div>
                  <p className="text-sm font-medium text-[#2a2a2a]">{result.techniqueName}</p>
                  {result.category && (
                    <p className="text-xs text-gray-500">{result.category}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {result.score != null && (
                    <span className="text-sm font-bold">{result.score}/100</span>
                  )}
                  <span className={`inline-flex rounded-lg px-2.5 py-0.5 text-xs font-medium ${
                    result.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {result.passed ? 'Geslaagd' : 'Niet geslaagd'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {exam.results.some(r => r.feedback) && (
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">Feedback</h3>
              {exam.results.filter(r => r.feedback).map((result) => (
                <div key={result.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-600">{result.techniqueName}</p>
                  <p className="mt-1 text-sm text-gray-700">{result.feedback}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Student link */}
      <div className="flex justify-end">
        <Link
          href={`/admin/students/${exam.member?.id}`}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          → Naar student profiel
        </Link>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-sm font-medium text-[#2a2a2a]">{value}</p>
    </div>
  )
}
