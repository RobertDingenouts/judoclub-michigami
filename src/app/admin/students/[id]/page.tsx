import { db } from '@/lib/db'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BELT_LABELS_NL, BELT_COLORS, LOCATION_LABELS_NL } from '@/lib/student-progress-types'
import { GROEP_LABEL, STATUS_INFO } from '@/lib/admin2'
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
      payments: { include: { period: true }, orderBy: { period: { start: 'desc' } } },
      attendance: { include: { trainingDay: { select: { date: true, group: true } } }, orderBy: { trainingDay: { date: 'desc' } } },
      bondHistory: { orderBy: { awardedAt: 'asc' } },
      competitions: { orderBy: { date: 'desc' } },
    },
  })

  if (!member) {
    redirect('/admin/leden')
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
            className="inline-flex items-center gap-2 rounded-sm bg-[#a90000] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#8c0000]"
          >
            ✏️ Bewerken
          </Link>
        </div>
      </div>

      {/* Profile card */}
      <div className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-sm text-2xl font-bold text-white"
              style={{ backgroundColor: BELT_COLORS[member.currentBelt as BeltLevel] || '#666' }}
            >
              {member.firstName[0]}{member.lastName[0]}
            </div>
            <span
              className="inline-flex items-center gap-2 rounded-sm bg-gray-100 px-3 py-1 text-sm font-medium"
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
            <DetailRow label="Telefoon 2" value={member.phone2 || '-'} />
            <DetailRow
              label="Groepsapp"
              value={
                ({ ja1: 'Ja — telefoonnummer 1', ja2: 'Ja — telefoonnummer 2', ja12: 'Ja — beide telefoonnummers' } as Record<string, string>)[member.whatsappGroup || ''] || 'Niet toegevoegd'
              }
            />
            <DetailRow label="Adres" value={[member.address, member.postalCode, member.city].filter(Boolean).join(' · ') || '-'} />
            <DetailRow label="Geslacht" value={member.gender || '-'} />
            <DetailRow label="Groep" value={member.primaryGroup ? (GROEP_LABEL[member.primaryGroup as keyof typeof GROEP_LABEL] ?? member.primaryGroup) : '-'} />
            <DetailRow label="Clubstatus" value={member.clubStatus} />
            {member.leaveDate && <DetailRow label="Gestopt per" value={new Date(member.leaveDate).toLocaleDateString('nl-NL')} />}
            {member.remarks && <DetailRow label="Opmerkingen" value={member.remarks} />}
          </div>
        </div>

        {member.medicalNotes && (
          <div className="mt-4 rounded-sm border border-yellow-200 bg-yellow-50 p-4">
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
        <div className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[#2a2a2a]">Examen Geschiedenis</h2>
          <div className="space-y-3">
            {member.examAttempts.map((exam) => (
              <div key={exam.id} className="flex items-center justify-between rounded-sm border border-gray-100 p-4">
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
                  <span className={`inline-flex rounded-sm px-2.5 py-0.5 text-xs font-medium ${
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
        <div className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[#2a2a2a]">Cursus Japans Voortgang</h2>
          <div className="space-y-3">
            {member.courseProgress.map((course) => (
              <div key={course.id} className="flex items-center gap-3">
                <span className="w-28 shrink-0 truncate text-xs font-medium text-gray-600">
                  {course.courseName.replace('japanese_', '').replace('_', ' ')}
                </span>
                <div className="flex-1 h-2.5 rounded-sm bg-gray-200">
                  <div
                    className={`h-full rounded-sm ${
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
        <div className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[#2a2a2a]">Diploma&apos;s</h2>
          <div className="space-y-3">
            {member.diplomas.map((diploma) => (
              <div key={diploma.id} className="flex items-center justify-between rounded-sm border border-gray-100 p-4">
                <div>
                  <p className="text-sm font-medium">{diploma.title}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(diploma.awardedAt).toLocaleDateString('nl-NL')} • {diploma.verificationCode}
                  </p>
                </div>
                <span className={`inline-flex rounded-sm px-2.5 py-0.5 text-xs font-medium ${
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

      {/* Contributie */}
      {member.payments.length > 0 && (
        <div className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[#2a2a2a]">Contributie ({member.payments.length})</h2>
          <div className="space-y-2">
            {member.payments.map(p => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-gray-100 px-4 py-2 text-sm">
                <span className="font-medium">{p.period.label}</span>
                <span className="text-gray-500">€{Number(p.amount).toFixed(2)}</span>
                {p.invoiceNumber && <span className="text-xs text-gray-400">#{p.invoiceNumber}</span>}
                {p.paidAt && <span className="text-xs text-green-700">betaald {new Date(p.paidAt).toLocaleDateString('nl-NL')}</span>}
                <span className={`rounded px-2 py-0.5 text-xs font-medium ${p.status === 'BETAALD' ? 'bg-green-100 text-green-800' : p.status === 'VIJGESTELD' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>{p.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aanwezigheid (samenvatting per jaar) */}
      {member.attendance.length > 0 && (() => {
        const perJaar: Record<string, { aanw: number; totaal: number }> = {}
        for (const a of member.attendance) {
          const y = String(new Date(a.trainingDay.date).getFullYear())
          perJaar[y] = perJaar[y] ?? { aanw: 0, totaal: 0 }
          perJaar[y].totaal++
          if (a.status === 'AANWEZIG') perJaar[y].aanw++
        }
        return (
          <div className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[#2a2a2a]">Aanwezigheid ({member.attendance.length} registraties)</h2>
            <div className="flex flex-wrap gap-3">
              {Object.entries(perJaar).sort().map(([y, v]) => (
                <div key={y} className="rounded-sm bg-gray-50 px-4 py-2 text-sm">
                  <span className="font-semibold">{y}</span>
                  <span className="ml-2 text-gray-500">{v.aanw}/{v.totaal} aanwezig</span>
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {/* Bondshistorie + toernooien */}
      {(member.bondHistory.length > 0 || member.competitions.length > 0) && (
        <div className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm">
          {member.bondHistory.length > 0 && (
            <>
              <h2 className="mb-3 text-lg font-semibold text-[#2a2a2a]">Bondshistorie</h2>
              <div className="mb-4 flex flex-wrap gap-2">
                {member.bondHistory.map(b => (
                  <span key={b.id} className="inline-flex items-center gap-1.5 rounded-sm border border-gray-200 px-3 py-1 text-xs">
                    <span className="inline-block h-3 w-3 rounded-sm border border-gray-300" style={{ backgroundColor: BELT_COLORS[b.belt as BeltLevel] || '#ccc' }} />
                    {BELT_LABELS_NL[b.belt as BeltLevel] ?? b.belt} · {new Date(b.awardedAt).toLocaleDateString('nl-NL')}
                  </span>
                ))}
              </div>
            </>
          )}
          {member.competitions.length > 0 && (
            <>
              <h2 className="mb-3 text-lg font-semibold text-[#2a2a2a]">Toernooien</h2>
              <div className="space-y-2">
                {member.competitions.map(c => (
                  <div key={c.id} className="flex items-center justify-between rounded-sm border border-gray-100 px-4 py-2 text-sm">
                    <span>{c.name}</span>
                    <span className="text-xs text-gray-500">{new Date(c.date).toLocaleDateString('nl-NL')}{c.result ? ` · ${c.result}` : ''}</span>
                  </div>
                ))}
              </div>
            </>
          )}
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
    <div className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
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
