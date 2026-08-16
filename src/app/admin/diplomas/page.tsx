import { db } from '@/lib/db'
import Link from 'next/link'
import { BELT_LABELS_NL, BELT_COLORS } from '@/lib/student-progress-types'
import type { BeltLevel, DiplomaType } from '@prisma/client'
import UploadDiplomaForm from '@/components/admin/UploadDiplomaForm'
import CopyButton from './CopyCodeButton'

export const dynamic = 'force-dynamic'

export default async function DiplomasPage({
  searchParams,
}: {
  searchParams?: Promise<{ type?: string; verify?: string }>
}) {
  const params = await searchParams
  const typeFilter = params?.type || ''
  const verifyCode = params?.verify || ''

  const where: any = {}
  if (typeFilter) where.type = typeFilter as DiplomaType

  let verifiedDiploma: any = null
  let diplomas: any[] = []
  let totalDiplomas = 0
  let typeCounts: Record<string, number> = {}
  let error: string | null = null

  try {
    if (verifyCode) {
      verifiedDiploma = await db.diploma.findUnique({
        where: { verificationCode: verifyCode.toUpperCase() },
        include: { member: { select: { firstName: true, lastName: true, currentBelt: true } } },
      })
    }

    const [results, count, byType] = await Promise.all([
      db.diploma.findMany({
        where,
        orderBy: { awardedAt: 'desc' },
        include: {
          member: { select: { firstName: true, lastName: true, currentBelt: true } },
        },
        take: 100,
      }),
      db.diploma.count({ where }),
      db.diploma.groupBy({ by: ['type'], _count: { type: true } }),
    ])

    diplomas = results
    totalDiplomas = count
    typeCounts = byType.reduce<Record<string, number>>((acc, item) => {
      acc[item.type] = item._count.type
      return acc
    }, {})
  } catch (e: any) {
    error = `Database fout: ${e.message || 'Onbekende fout bij ophalen diploma\'s'}`
    console.error('Diplomas page error:', e)
  }

  const typeLabels: Record<DiplomaType, string> = {
    BELT_EXAM: 'Bandexamen',
    COURSE_JAPANESE: 'Cursus Japans',
    ACHIEVEMENT: 'Bijzonderheid',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2a2a2a]">Diploma&apos;s</h1>
          <p className="text-sm text-gray-500 mt-1">{totalDiplomas} diploma&apos;s uitgereikt</p>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-none border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          <p className="font-semibold">Fout bij laden diploma&apos;s</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {/* Stats */}
      {!error && (
        <div className="grid grid-cols-3 gap-4">
          {(Object.keys(typeLabels) as DiplomaType[]).map((type) => (
            <div key={type} className="rounded-none border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-gray-500">{typeLabels[type]}</p>
              <p className="mt-1 text-2xl font-bold text-[#a90000]">{typeCounts[type] || 0}</p>
            </div>
          ))}
        </div>
      )}

      {/* Upload physical diploma */}
      <UploadDiplomaForm />

      {/* Verification section */}
      <div className="rounded-none border border-[#a90000]/20 bg-[#fdf6f6] p-5">
        <h3 className="mb-3 text-sm font-semibold text-[#2a2a2a]">Diploma Verifiëren</h3>
        <form className="flex gap-3">
          <input
            type="text"
            name="verify"
            placeholder="Verificatiecode invoeren (bijv. JCM-XXXXXXX)"
            className="flex-1 rounded-none border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
          />
          <button type="submit" className="rounded-none bg-[#a90000] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#8c0000]">
            Verifiëren
          </button>
        </form>

        {verifiedDiploma && (
          <div className="mt-4 rounded-none border border-green-200 bg-green-50 p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl">✅</span>
              <div>
                <p className="text-sm font-semibold text-green-900">Geldig diploma gevonden</p>
                <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <dt className="text-green-700">Ontvanger:</dt>
                  <dd className="text-green-900">{verifiedDiploma.member?.firstName} {verifiedDiploma.member?.lastName}</dd>
                  <dt className="text-green-700">Titel:</dt>
                  <dd className="text-green-900">{verifiedDiploma.title}</dd>
                  <dt className="text-green-700">Type:</dt>
                  <dd className="text-green-900">{typeLabels[verifiedDiploma.type]}</dd>
                  {verifiedDiploma.beltLevel && (
                    <>
                      <dt className="text-green-700">Band:</dt>
                      <dd className="text-green-900">{BELT_LABELS_NL[verifiedDiploma.beltLevel as BeltLevel]}</dd>
                    </>
                  )}
                  <dt className="text-green-700">Datum:</dt>
                  <dd className="text-green-900">{new Date(verifiedDiploma.awardedAt).toLocaleDateString('nl-NL')}</dd>
                  <dt className="text-green-700">Code:</dt>
                  <dd className="font-mono text-green-900">{verifiedDiploma.verificationCode}</dd>
                </dl>
              </div>
            </div>
          </div>
        )}

        {verifyCode && !verifiedDiploma && (
          <div className="mt-4 rounded-none border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            Diploma niet gevonden met deze verificatiecode.
          </div>
        )}
      </div>

      {/* Filter */}
      {!error && (
        <form className="flex gap-3">
          <select name="type" defaultValue={typeFilter} className="rounded-none border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none">
            <option value="">Alle types</option>
            {Object.entries(typeLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </form>
      )}

      {/* Diploma list */}
      {!error && (
        <div className="space-y-3">
          {diplomas.length > 0 ? diplomas.map((diploma) => (
            <DiplomaCard key={diploma.id} diploma={diploma} typeLabels={typeLabels} />
          )) : (
            <div className="rounded-none border border-gray-200 bg-white p-12 text-center shadow-sm">
              <p className="text-lg font-medium text-gray-400">Geen diploma&apos;s gevonden</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function DiplomaCard({ diploma, typeLabels }: { diploma: any; typeLabels: Record<string, string> }) {
  return (
    <div className="rounded-none border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-none text-xl ${
            diploma.type === 'BELT_EXAM' ? 'bg-[#a90000]/10' :
            diploma.type === 'COURSE_JAPANESE' ? 'bg-blue-100' :
            'bg-yellow-100'
          }`}>
            {diploma.type === 'BELT_EXAM' ? '🎯' : diploma.type === 'COURSE_JAPANESE' ? '🇯🇵' : '🏆'}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#2a2a2a]">{diploma.title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {diploma.member?.firstName} {diploma.member?.lastName}
              {diploma.beltLevel && (
                <>
                  {' '}•{' '}
                  <span className="inline-flex items-center gap-1">
                    <span className="inline-flex h-2.5 w-2.5 rounded-none border border-gray-300" style={{ backgroundColor: BELT_COLORS[diploma.beltLevel as BeltLevel] || '#ccc' }} />
                    {BELT_LABELS_NL[diploma.beltLevel as BeltLevel]}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-500">{new Date(diploma.awardedAt).toLocaleDateString('nl-NL')}</p>
            <p className="font-mono text-xs text-gray-400">{diploma.verificationCode}</p>
          </div>

          <CopyButton code={diploma.verificationCode} />
        </div>
      </div>

      {diploma.description && (
        <p className="mt-3 border-t border-gray-100 pt-3 text-xs text-gray-500">{diploma.description}</p>
      )}
    </div>
  )
}
