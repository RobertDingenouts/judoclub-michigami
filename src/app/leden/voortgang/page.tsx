import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { T } from '@/components/T'

export const dynamic = 'force-dynamic'

export default async function VoortgangPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const exams = await db.examAttempt.findMany({
    where: { userId: user.id },
    orderBy: { examDate: 'desc' },
    include: { results: true },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2a2a2a]"><T k="Mijn Voortgang" /></h1>
        <p className="text-sm text-gray-500 mt-1"><T k="Examens en bandprogressie" /></p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-[#2a2a2a]"><T k="Examen Geschiedenis" /></h2>
        {exams.length > 0 ? (
          <div className="space-y-3">
            {exams.map((exam) => (
              <div key={exam.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-4">
                <div>
                  <p className="text-sm font-medium text-[#2a2a2a]">
                    <T k={beltLabel(exam.beltLevel)} /> <T k="Examen" />
                  </p>
                  <p className="text-xs text-gray-500">
                    {exam.examDate ? new Date(exam.examDate).toLocaleDateString('nl-NL') : ''}{!exam.examDate && <T k="Geen datum" />}
                    {exam.examiner ? ` • Examiner: ${exam.examiner}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex rounded-lg px-2.5 py-0.5 text-xs font-medium ${
                    exam.status === 'COMPLETED_PASSED' ? 'bg-green-100 text-green-800' :
                    exam.status === 'COMPLETED_FAILED' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    <T k={statusLabel(exam.status)} />
                  </span>
                  {exam.overallScore != null && (
                    <p className="mt-1 text-xs text-gray-500">{exam.overallScore}/100</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-gray-400 py-8"><T k="Nog geen examens geregistreerd" /></p>
        )}
      </div>
    </div>
  )
}

function beltLabel(belt: string): string {
  const labels: Record<string, string> = {
    WIT: 'Witte band', GEEL: 'Gele band', ORANJE: 'Oranje band', GROEN: 'Groene band',
    BLAUW: 'Blauwe band', BRUIN: 'Bruine band',
    ZWART_1: 'Zwarte band 1e Dan', ZWART_2: 'Zwarte band 2e Dan', ZWART_3: 'Zwarte band 3e Dan',
  }
  return labels[belt] || belt
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    SCHEDULED: 'Gepland',
    COMPLETED_PASSED: 'Geslaagd',
    COMPLETED_FAILED: 'Niet geslaagd',
    CANCELLED: 'Geannuleerd',
  }
  return labels[status] || status
}
