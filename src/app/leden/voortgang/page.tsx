import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

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
        <h1 className="text-2xl font-bold text-[#2a2a2a]">Mijn Voortgang</h1>
        <p className="text-sm text-gray-500 mt-1">Examens en bandprogressie</p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-[#2a2a2a]">Examen Geschiedenis</h2>
        {exams.length > 0 ? (
          <div className="space-y-3">
            {exams.map((exam) => (
              <div key={exam.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-4">
                <div>
                  <p className="text-sm font-medium text-[#2a2a2a]">
                    {beltLabel(exam.beltLevel)} Examen
                  </p>
                  <p className="text-xs text-gray-500">
                    {exam.examDate ? new Date(exam.examDate).toLocaleDateString('nl-NL') : 'Geen datum'}
                    {exam.examiner ? ` • Examiner: ${exam.examiner}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    exam.status === 'COMPLETED_PASSED' ? 'bg-green-100 text-green-800' :
                    exam.status === 'COMPLETED_FAILED' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
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
    </div>
  )
}

function beltLabel(belt: string): string {
  const labels: Record<string, string> = {
    WIT: 'Wit', GEEL: 'Geel', ORANJE: 'Oranje', GROEN: 'Groen',
    BLAUW: 'Blauw', BRUIN_1: 'Bruin 1', BRUIN_2: 'Bruin 2', BRUIN_3: 'Bruin 3',
    Zwart_1: 'Zwart 1', Zwart_2: 'Zwart 2', Zwart_3: 'Zwart 3',
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
