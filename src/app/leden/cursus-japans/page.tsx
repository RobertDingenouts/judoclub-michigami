import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

export default async function CursusJapansPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const courses = await db.courseProgress.findMany({
    where: { userId: user.id },
    orderBy: { beltLevel: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2a2a2a]">Cursus Japans</h1>
        <p className="text-sm text-gray-500 mt-1">Leer Japanse judo-termen per bandniveau</p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {courses.length > 0 ? (
          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course.id} className="rounded-lg border border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${
                      course.isPassed ? 'bg-green-100 text-green-700' :
                      course.isUnlocked ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {course.isPassed ? '✓' : course.isUnlocked ? '▶' : '🔒'}
                    </div>
                    <div>
                      <h3 className="font-medium text-[#2a2a2a]">
                        {beltLabel(course.beltLevel)} Band — Japans
                      </h3>
                      <p className="text-xs text-gray-500">
                        {course.lessonsCompleted}/{course.lessonsTotal} lessen • {course.wordsLearned}/{course.wordsTotal} woorden
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      course.isPassed ? 'bg-green-100 text-green-800' :
                      course.isUnlocked ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {course.isPassed ? 'Geslaagd' : course.isUnlocked ? 'Beschikbaar' : 'Vergrendeld'}
                    </span>
                    {course.overallScore > 0 && (
                      <p className="mt-1 text-xs text-gray-500">{course.overallScore.toFixed(0)}% score</p>
                    )}
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-3 h-2 rounded-full bg-gray-100">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      course.isPassed ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${course.lessonsTotal > 0 ? (course.lessonsCompleted / course.lessonsTotal) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-gray-400 py-8">
            Nog geen cursusvoortgang geregistreerd. Vraag bij de instructeur om toegang.
          </p>
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
