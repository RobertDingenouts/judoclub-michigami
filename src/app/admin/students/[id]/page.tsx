import { db } from '@/lib/db'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BELT_LABELS_NL, BELT_COLORS, LOCATION_LABELS_NL } from '@/lib/student-progress-types'
import type { BeltLevel, ExamStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const member = await db.member.findUnique({
    where: { id },
    include: {
      user: true,
      examAttempts: { include: { results: true }, orderBy: { examDate: 'desc' } },
      courseProgress: { orderBy: { beltLevel: 'asc' } },
      diplomas: { orderBy: { awardedAt: 'desc' } },
    },
  })

  if (!member) {
    redirect('/admin/students')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/leden" className="text-gray-400 hover:text-[#a90000]">
            ← Terug naar Leden
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#2a2a2a]">{member.firstName} {member.lastName}</h1>
            <p className="text-sm text-gray-500 mt-1">{member.email || member.user.email || 'Geen e-mail'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/students/${member.id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg bg-[#a90000] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#8c0000]"
          >
            ✏️ Bewerken
          </Link>
        </div>
      </div>

      {/* Profile card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-lg text-2xl font-bold text-white"
              style={{ backgroundColor: BELT_COLORS[member.currentBelt as BeltLevel] || '#666' }}
            >
              {member.firstName[0]}{member.lastName[0]}
            </div>
            <span
              className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1 text-sm font-medium"
            >
              <span
                className="inline-flex h-3 w-3 rounded-full border border-gray-300"
                style={{ backgroundColor: BELT_COLORS[member.currentBelt as BeltLevel] || '#ccc' }}
              />
              {BELT_LABELS_NL[member.currentBelt as BeltLevel] || 'Geen band'}
            </span>
            {member.user.role === 'ADMIN' && (
              <span className="rounded bg-[#a90000]/10 px-2 py-0.5 text-xs font-medium text-[#a90000]">Admin</span>
            )}
            {!member.isActive && (
              <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">Inactief</span>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailRow label="Volledige naam" value={`${member.firstName} ${member.lastName}`} />
            <DetailRow label="E-mail" value={member.email || member.user.email || '-'} />
            <DetailRow label="Telefoon" value={member.phone || '-'} />
            <DetailRow
              label="Geboortedatum"
              value={member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString('nl-NL') : '-'}
            />
            <DetailRow label="Lid sinds" value={new Date(member.joinDate).toLocaleDateString('nl-NL')} />
            <DetailRow
              label="Trainingslocatie"
              value={member.location ? (LOCATION_LABELS_NL[member.location as keyof typeof LOCATION_LABELS_NL] || member.location) : '-'}
            />
            <DetailRow label="Noodcontact" value={member.emergencyContactName || '-'} />
            <DetailRow label="Noodtel" value={member.emergencyContactPhone || '-'} />
            <DetailRow label="Gebruikersnaam" value={member.user.name || '-'} />
          </div>
        </div>

        {member.medicalNotes && (
          <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-xs font-medium text-yellow-800">Medische Notities</p>
            <p className="mt-1 text-sm text-yellow-900">{member.medicalNotes}</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard title="Examens" value={member.examAttempts.length} icon="🎯" />
        <StatCard title="Diploma's" value={member.diplomas.length} icon="🏆" />
        <StatCard title="Cursussen" value={member.courseProgress.length} icon="🇯🇵" />
        <StatCard title="Band" value={BELT_LABELS_NL[member.currentBelt as BeltLevel] || '-'} icon="🥋" isText />
      </div>

      {/* Exam history */}
      {member.examAttempts.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[#2a2a2a]">Examen Geschiedenis</h2>
          <div className="space-y-3">
            {member.examAttempts.map((exam) => (
              <div key={exam.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <span
                    className="inline-flex h-3 w-3 rounded-full border border-gray-300"
                    style={{ backgroundColor: BELT_COLORS[exam.beltLevel as BeltLevel] || '#ccc' }}
                  />
                  <span className="text-sm font-medium">{BELT_LABELS_NL[exam.beltLevel as BeltLevel]} Examen</span>
                  {exam.examDate && (
                    <span className="text-xs text-gray-500">
                      {new Date(exam.examDate).toLocaleDateString('nl-NL')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {exam.overallScore != null && (
                    <span className="text-sm font-bold">{exam.overallScore}/100</span>
                  )}
                  <span className={`inline-flex rounded-lg px-2.5 py-0.5 text-xs font-medium ${
                    exam.status === 'COMPLETED_PASSED' ? 'bg-green-100 text-green-800' :
                    exam.status === 'COMPLETED_FAILED' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {exam.status === 'COMPLETED_PASSED' ? 'Geslaagd' :
                     exam.status === 'COMPLETED_FAILED' ? 'Niet geslaagd' :
                     exam.status === 'SCHEDULED' ? 'Gepland' : 'Geannuleerd'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Course progress */}
      {member.courseProgress.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[#2a2a2a]">Cursus Japans Voortgang</h2>
          <div className="space-y-3">
            {member.courseProgress.map((course) => (
              <div key={course.id} className="flex items-center gap-3">
                <span className="w-28 shrink-0 truncate text-xs font-medium text-gray-600">
                  {course.courseName.replace('japanese_', '').replace('_', ' ')}
                </span>
                <div className="flex-1 h-2.5 rounded-lg bg-gray-200">
                  <div
                    className={`h-full rounded-lg ${
                      course.isPassed ? 'bg-green-500' : course.isUnlocked ? 'bg-[#a90000]' : 'bg-gray-400'
                    }`}
                    style={{ width: `${course.lessonsTotal > 0 ? (course.lessonsCompleted / course.lessonsTotal) * 100 : 0}%` }}
                  />
                </div>
                <span className="w-12 text-right text-xs text-gray-500">
                  {course.lessonsCompleted}/{course.lessonsTotal}
                </span>
                {course.isPassed && <span className="text-green-600">✓</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diplomas */}
      {member.diplomas.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[#2a2a2a]">Diploma&apos;s</h2>
          <div className="space-y-3">
            {member.diplomas.map((diploma) => (
              <div key={diploma.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-4">
                <div>
                  <p className="text-sm font-medium">{diploma.title}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(diploma.awardedAt).toLocaleDateString('nl-NL')} • {diploma.verificationCode}
                  </p>
                </div>
                <span className={`inline-flex rounded-lg px-2.5 py-0.5 text-xs font-medium ${
                  diploma.type === 'BELT_EXAM' ? 'bg-red-100 text-red-800' :
                  diploma.type === 'COURSE_JAPANESE' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {diploma.type === 'BELT_EXAM' ? 'Band Examen' :
                   diploma.type === 'COURSE_JAPANESE' ? 'Cursus Japans' : 'Bijzonderheid'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
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

function StatCard({ title, value, icon, isText }: { title: string; value: number | string; icon: string; isText?: boolean }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500">{title}</p>
          <p className={`mt-1 font-bold text-[#2a2a2a] ${isText ? 'text-sm truncate' : 'text-2xl'}`}>{value}</p>
        </div>
        <span className="text-2xl opacity-60">{icon}</span>
      </div>
    </div>
  )
}
