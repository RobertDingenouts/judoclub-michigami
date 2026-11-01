import Link from 'next/link'
import { db } from '@/lib/db'
import { BELT_LABELS_NL, BELT_COLORS, BELT_ORDER } from '@/lib/student-progress-types'
import type { BeltLevel } from '@prisma/client'

export const dynamic = 'force-dynamic'

export default async function ProgressPage() {
  // Fetch all students with course progress
  const students = await db.member.findMany({
    where: { isActive: true },
    orderBy: { lastName: 'asc' },
    include: {
      user: { select: { name: true, currentBelt: true } },
      courseProgress: {
        orderBy: { beltLevel: 'asc' },
      },
    },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#2a2a2a]">Voortgang</h1>
        <p className="text-sm text-gray-500 mt-1">Cursus Japans voortgang per student</p>
      </div>

      {/* Course Progress Section */}
      <div className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-[#2a2a2a]">Cursus Japans Voortgang</h2>

        {students.length > 0 ? (
          <div className="space-y-4">
            {students.map((student) => (
              <div key={student.id} className="rounded-sm border border-gray-100 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#a90000]/10 text-xs font-bold text-[#a90000]">
                      {student.firstName[0]}{student.lastName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#2a2a2a]">{student.firstName} {student.lastName}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex h-3 w-3 rounded-full border border-gray-300" style={{ backgroundColor: BELT_COLORS[student.currentBelt as BeltLevel] || '#ccc' }} />
                        <span className="text-xs text-gray-500">{BELT_LABELS_NL[student.currentBelt as BeltLevel] || 'Geen band'}</span>
                      </div>
                    </div>
                  </div>
                  <Link href={`/admin/students/${student.id}`} className="text-xs text-[#a90000] hover:underline">
                    Bewerken →
                  </Link>
                </div>

                {student.courseProgress.length > 0 ? (
                  <div className="space-y-2.5">
                    {student.courseProgress.map((course) => (
                      <div key={course.courseName} className="flex items-center gap-3">
                        <span className="w-28 shrink-0 truncate text-xs font-medium text-gray-600" title={course.courseName}>
                          {course.courseName.replace('japanese_', '').replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </span>

                        {/* Progress bar */}
                        <div className="flex-1">
                          <div className="h-2.5 overflow-hidden rounded-sm bg-gray-200">
                            <div
                              className={`h-full rounded-sm transition-all ${
                                course.isPassed ? 'bg-green-500' : course.isUnlocked ? 'bg-[#a90000]' : 'bg-gray-400'
                              }`}
                              style={{ width: `${course.lessonsTotal > 0 ? (course.lessonsCompleted / course.lessonsTotal) * 100 : 0}%` }}
                            />
                          </div>
                        </div>

                        <span className="w-16 shrink-0 text-right text-xs text-gray-500">
                          {course.lessonsCompleted}/{course.lessonsTotal}
                        </span>

                        {/* Status badges */}
                        <div className="flex gap-1">
                          {!course.isUnlocked && (
                            <span className="rounded bg-gray-200 px-1.5 py-0.5 text-xs text-gray-600" title="Vergrendeld">🔒</span>
                          )}
                          {course.isPassed && (
                            <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700">✓</span>
                          )}
                        </div>

                        {/* Score */}
                        {course.overallScore > 0 && (
                          <span className="w-10 shrink-0 text-right text-xs font-medium text-gray-600">
                            {Math.round(course.overallScore)}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">Nog geen cursusvoortgang</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-gray-400 py-8">Nog geen studenten met cursusvoortgang</p>
        )}
      </div>
    </div>
  )
}
