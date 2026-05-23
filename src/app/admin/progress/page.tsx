import { db } from '@/lib/db'
import { BELT_LABELS_NL, BELT_COLORS, BELT_ORDER } from '@/lib/student-progress-types'
import type { BeltLevel } from '@prisma/client'

export default async function ProgressPage() {
  // Fetch all students with course progress
  const students = await db.member.findMany({
    where: { isActive: true },
    orderBy: { lastName: 'asc' },
    include: {
      user: { select: { name: true, currentBelt: true, totalPoints: true, weeklyPoints: true } },
      courseProgress: {
        orderBy: { beltLevel: 'asc' },
      },
      leaderboardEntries: {
        orderBy: { points: 'desc' },
        take: 5,
        select: { points: true, activityType: true, description: true, createdAt: true },
      },
    },
  })

  // Weekly leaderboard
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1)
  weekStart.setHours(0, 0, 0, 0)

  const leaderboard = await db.member.findMany({
    where: { isActive: true },
    include: {
      user: { select: { name: true, currentBelt: true, weeklyPoints: true, totalPoints: true } },
      leaderboardEntries: {
        where: { weekStart: { gte: weekStart } },
        select: { points: true },
      },
    },
    orderBy: { user: { weeklyPoints: 'desc' } },
    take: 10,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#2a2a2a]">Voortgang</h1>
        <p className="text-sm text-gray-500 mt-1">Cursus Japans voortgang en leaderboard</p>
      </div>

      {/* Tabs: simple server-rendered sections */}
      {/* Course Progress Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-[#2a2a2a]">Cursus Japans Voortgang</h2>

        {students.length > 0 ? (
          <div className="space-y-4">
            {students.map((student) => (
              <div key={student.id} className="rounded-lg border border-gray-100 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#a90000]/10 text-xs font-bold text-[#a90000]">
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
                          <div className="h-2.5 overflow-hidden rounded-full bg-gray-200">
                            <div
                              className={`h-full rounded-full transition-all ${
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

      {/* Leaderboard Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-[#2a2a2a]">Weekse Leaderboard</h2>

        {leaderboard.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-left text-xs font-medium text-gray-500">#</th>
                  <th className="pb-3 text-left text-xs font-medium text-gray-500">Student</th>
                  <th className="pb-3 text-left text-xs font-medium text-gray-500">Band</th>
                  <th className="pb-3 text-right text-xs font-medium text-gray-500">Wekelijkse Punten</th>
                  <th className="pb-3 text-right text-xs font-medium text-gray-500">Totaal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leaderboard.map((student, idx) => {
                  const weeklyPts = student.leaderboardEntries.reduce((sum, e) => sum + e.points, 0)
                  return (
                    <tr key={student.id} className={`${idx < 3 ? 'bg-[#fdf6f6]' : ''}`}>
                      <td className="py-3">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`}
                      </td>
                      <td className="py-3 font-medium text-[#2a2a2a]">
                        {student.firstName} {student.lastName}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex h-3 w-3 rounded-full border border-gray-300" style={{ backgroundColor: BELT_COLORS[student.user.currentBelt as BeltLevel] || '#ccc' }} />
                          <span className="text-xs text-gray-600">{BELT_LABELS_NL[student.user.currentBelt as BeltLevel] || '-'}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right font-bold text-[#a90000]">{weeklyPts}</td>
                      <td className="py-3 text-right text-gray-600">{student.user.totalPoints}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-sm text-gray-400 py-8">Nog geen leaderboard data</p>
        )}
      </div>
    </div>
  )
}

import Link from 'next/link'
