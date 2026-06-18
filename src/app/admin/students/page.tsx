import { db } from '@/lib/db'
import Link from 'next/link'
import { BELT_LABELS_NL, BELT_COLORS } from '@/lib/student-progress-types'
import type { BeltLevel } from '@prisma/client'

export const dynamic = 'force-dynamic'

export default async function StudentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; belt?: string; trashed?: string; location?: string }>
}) {
  const params = await searchParams
  const query = params?.q || ''
  const beltFilter = params?.belt || ''
  const locationFilter = params?.location || ''
  const showTrashed = params?.trashed === 'true'

  // Build where clause
  const where: any = { isActive: !showTrashed }
  if (query) {
    where.OR = [
      { firstName: { contains: query, mode: 'insensitive' as const } },
      { lastName: { contains: query, mode: 'insensitive' as const } },
      { email: { contains: query, mode: 'insensitive' as const } },
    ]
  }
  if (beltFilter) where.currentBelt = beltFilter as BeltLevel
  if (locationFilter) where.location = locationFilter

  let error: string | null = null
  let students: any[] = []
  let totalStudents = 0
  let belts: any[] = []

  try {
    const [s, c, b] = await Promise.all([
      db.member.findMany({
        where,
        orderBy: { lastName: 'asc' },
        include: {
          user: { select: { role: true, currentBelt: true } },
          examAttempts: {
            where: { status: 'COMPLETED_PASSED' },
            orderBy: { examDate: 'desc' },
            take: 1,
          },
          courseProgress: {
            where: { isUnlocked: true },
            select: { courseName: true, lessonsCompleted: true, lessonsTotal: true, overallScore: true },
          },
        },
      }),
      db.member.count({ where }),
      db.user.findMany({
        select: { currentBelt: true },
        distinct: ['currentBelt'],
        where: { currentBelt: { not: null } },
      }),
    ])
    students = s as any[]
    totalStudents = c
    belts = b as any[]
  } catch (e: any) {
    error = `Database fout: ${e.message}`
  }

  const locationLabel = (loc: string) => {
    if (loc === 'STeenbergen') return 'Steenbergen'
    if (loc === 'OUD_VOSSEMEER') return 'Oud-Vossemeer'
    return loc
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-700 font-medium">{error}</p>
          <p className="text-red-500 text-sm mt-2">Probeer later opnieuw of contacteer de admin.</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2a2a2a]">{showTrashed ? '🗑️ Prullenbak' : 'Studenten'}</h1>
          <p className="text-sm text-gray-500 mt-1">{totalStudents} {showTrashed ? 'in prullenbak' : 'studenten gevonden'}</p>
        </div>
        <div className="flex gap-2">
          {!showTrashed && (
            <Link href="/admin/students?trashed=true" className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
              🗑️ Prullenbak
            </Link>
          )}
          {showTrashed && (
            <Link href="/admin/students" className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
              ← Terug naar studenten
            </Link>
          )}
          {!showTrashed && (
            <Link href="/admin/students/new" className="inline-flex items-center gap-2 rounded-md bg-[#a90000] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#8c0000]">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Student Toevoegen
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <form className="flex flex-1 gap-3">
          <div className="relative flex-1">
            <svg viewBox="0 0 20 20" fill="currentColor" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a1 1 0 01-1.414 1.414l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Zoek op naam of e-mail..."
              className="w-full rounded-md border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
            />
          </div>
          <select
            name="belt"
            defaultValue={beltFilter}
            className="rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
          >
            <option value="">Alle banden</option>
            {belts.map((b: any) => b.currentBelt && (
              <option key={b.currentBelt} value={b.currentBelt}>{BELT_LABELS_NL[b.currentBelt as BeltLevel] || b.currentBelt}</option>
            ))}
          </select>
          <select
            name="location"
            defaultValue={locationFilter}
            className="rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
          >
            <option value="">Alle locaties</option>
            <option value="STeenbergen">Steenbergen</option>
            <option value="OUD_VOSSEMEER">Oud-Vossemeer</option>
          </select>
        </form>
      </div>

      {/* Student list */}
      <div className="space-y-3">
        {students.length > 0 ? students.map((student: any) => (
          <div key={student.id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-colors hover:border-[#a90000]/30">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#a90000]/10 text-lg font-bold text-[#a90000]">
                  {student.firstName?.[0]}{student.lastName?.[0]}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#2a2a2a]">
                    {student.firstName} {student.lastName}
                  </h3>
                  <p className="text-xs text-gray-500">{student.email || ''}</p>

                  {/* Belt badge */}
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className="inline-flex h-4 w-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: BELT_COLORS[student.currentBelt as BeltLevel] || '#ccc' }}
                    />
                    <span className="text-xs font-medium text-gray-600">
                      {BELT_LABELS_NL[student.currentBelt as BeltLevel] || 'Geen band'}
                    </span>
                    {student.user?.role === 'ADMIN' && (
                      <span className="rounded bg-[#a90000]/10 px-1.5 py-0.5 text-xs font-medium text-[#a90000]">Admin</span>
                    )}
                    {student.location && (
                      <span className="rounded bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                        📍 {locationLabel(student.location)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Stats */}
                <div className="hidden text-sm text-gray-500 md:block">
                  <span className="mr-4">🎯 {student.examAttempts?.length || 0} examens</span>
                  <span>🥋 {BELT_LABELS_NL[student.currentBelt as BeltLevel] || 'Geen band'}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/admin/students/${student.id}`}
                    className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    Bekijken
                  </Link>
                  {!showTrashed && (
                    <Link
                      href={`/admin/students/${student.id}/edit`}
                      className="rounded-md bg-[#a90000]/10 px-3 py-1.5 text-xs font-medium text-[#a90000] transition-colors hover:bg-[#a90000]/20"
                    >
                      Bewerken
                    </Link>
                  )}
                  {showTrashed ? (
                    <>
                      <button
                        onClick={async () => {
                          await fetch(`/api/admin/students/${student.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ isActive: true }),
                          })
                          window.location.reload()
                        }}
                        className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700"
                      >
                        Herstel
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm('Definitief verwijderen? Dit kan niet ongedaan worden.')) return
                          await fetch(`/api/admin/students/${student.id}?permanent=true`, { method: 'DELETE' })
                          window.location.reload()
                        }}
                        className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
                      >
                        Definitief
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={async () => {
                        if (!confirm(`${student.firstName} ${student.lastName} naar prullenbak?`)) return
                        await fetch(`/api/admin/students/${student.id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ isActive: false }),
                        })
                        window.location.reload()
                      }}
                      className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                    >
                      Verwijderen
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Course progress mini-bar */}
            {student.courseProgress?.length > 0 && (
              <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                <p className="text-xs font-medium text-gray-500">Cursus Japans voortgang:</p>
                {student.courseProgress.slice(0, 3).map((course: any) => (
                  <div key={course.courseName} className="flex items-center gap-3">
                    <span className="w-32 truncate text-xs text-gray-500">{course.courseName.replace('japanese_', '').replace('_', ' ')}</span>
                    <div className="flex-1 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-[#a90000]"
                        style={{ width: `${course.lessonsTotal > 0 ? (course.lessonsCompleted / course.lessonsTotal) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-xs text-gray-500">
                      {course.lessonsCompleted}/{course.lessonsTotal}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )) : (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
            <p className="text-lg font-medium text-gray-400">Geen studenten gevonden</p>
            {query && <p className="mt-1 text-sm text-gray-400">Probeer een andere zoekterm</p>}
          </div>
        )}
      </div>
    </div>
  )
}
