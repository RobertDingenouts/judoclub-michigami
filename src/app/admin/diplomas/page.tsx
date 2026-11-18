import { db } from '@/lib/db'
import { BELT_LABELS_NL, BELT_COLORS } from '@/lib/student-progress-types'
import type { BeltLevel, DiplomaType } from '@prisma/client'
import UploadDiplomaForm from '@/components/admin/UploadDiplomaForm'
import CopyButton from './CopyCodeButton'
import { DiplomaFilters, type DiplomaFilterState } from './DiplomaFilters'

export const dynamic = 'force-dynamic'

export default async function DiplomasPage({
  searchParams,
}: {
  searchParams?: Promise<{ type?: string; verify?: string; band?: string; jaar?: string; q?: string; sort?: string }>
}) {
  const params = await searchParams
  const state: DiplomaFilterState = {
    type: params?.type || '',
    band: params?.band || '',
    jaar: params?.jaar || '',
    q: params?.q || '',
    sort: params?.sort || '',
  }
  const verifyCode = params?.verify || ''

  const where: any = {}
  if (state.type) where.type = state.type as DiplomaType
  if (state.band) where.beltLevel = state.band as BeltLevel
  if (state.jaar) where.awardedAt = { gte: new Date(`${state.jaar}-01-01`), lt: new Date(`${Number(state.jaar) + 1}-01-01`) }
  if (state.q) {
    where.OR = [
      { title: { contains: state.q, mode: 'insensitive' } },
      { member: { firstName: { contains: state.q, mode: 'insensitive' } } },
      { member: { lastName: { contains: state.q, mode: 'insensitive' } } },
    ]
  }

  const order =
    state.sort === 'oud' ? { awardedAt: 'asc' as const } :
    state.sort === 'naam' ? { title: 'asc' as const } :
    state.sort === 'lid' ? { member: { lastName: 'asc' as const } } :
    { awardedAt: 'desc' as const }

  let verifiedDiploma: any = null
  let diplomas: any[] = []
  let totalDiplomas = 0
  let typeCounts: Record<string, number> = {}
  let jaren: string[] = []
  let error: string | null = null

  try {
    if (verifyCode) {
      verifiedDiploma = await db.diploma.findUnique({
        where: { verificationCode: verifyCode.toUpperCase() },
        include: { member: { select: { firstName: true, lastName: true, currentBelt: true } } },
      })
    }

    const [results, count, byType, alle] = await Promise.all([
      db.diploma.findMany({
        where,
        orderBy: order,
        include: {
          member: { select: { firstName: true, lastName: true, currentBelt: true } },
        },
        take: 200,
      }),
      db.diploma.count({ where }),
      db.diploma.groupBy({ by: ['type'], _count: { type: true } }),
      db.diploma.findMany({ select: { awardedAt: true }, take: 500 }),
    ])

    diplomas = results
    totalDiplomas = count
    typeCounts = byType.reduce<Record<string, number>>((acc, item) => {
      acc[item.type] = item._count.type
      return acc
    }, {})
    jaren = [...new Set(alle.map(d => String(d.awardedAt.getFullYear())))].sort((a, b) => b.localeCompare(a))
  } catch (e: any) {
    error = `Database fout: ${e.message || 'Onbekende fout bij ophalen diploma\'s'}`
    console.error('Diplomas page error:', e)
  }

  const typeLabels: Record<DiplomaType, string> = {
    BELT_EXAM: 'Bandexamen',
    COURSE_JAPANESE: 'Cursus Japans',
    ACHIEVEMENT: 'Bijzonderheid',
  }
  const banden = [...new Set(diplomas.map(d => d.beltLevel).filter(Boolean))] as string[]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2a2a2a]">Diploma&apos;s</h1>
          <p className="text-sm text-gray-500 mt-1">{totalDiplomas} diploma&apos;s uitgereikt</p>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-sm border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          <p className="font-semibold">Fout bij laden diploma&apos;s</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {/* Stats */}
      {!error && (
        <div className="grid grid-cols-3 gap-4">
          {(Object.keys(typeLabels) as DiplomaType[]).map((type) => (
            <div key={type} className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-gray-500">{typeLabels[type]}</p>
              <p className="mt-1 text-2xl font-bold text-[#a90000]">{typeCounts[type] || 0}</p>
            </div>
          ))}
        </div>
      )}

      {/* Upload physical diploma */}
      <UploadDiplomaForm />

      {/* Verification section */}
      <div className="rounded-sm border border-[#a90000]/20 bg-[#fdf6f6] p-5">
        <h3 className="mb-3 text-sm font-semibold text-[#2a2a2a]">Diploma Verifiëren</h3>
        <form className="flex gap-3">
          <input
            type="text"
            name="verify"
            placeholder="Verificatiecode invoeren (bijv. JCM-XXXXXXX)"
            className="flex-1 rounded-sm border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
          />
          <button type="submit" className="rounded-sm bg-[#a90000] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#8c0000]">
            Verifiëren
          </button>
        </form>

        {verifiedDiploma && (
          <div className="mt-4 rounded-sm border border-green-200 bg-green-50 p-4">
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
          <div className="mt-4 rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            Diploma niet gevonden met deze verificatiecode.
          </div>
        )}
      </div>

      {/* Filter + sorteren, ingeklapt in één balk */}
      {!error && (
        <DiplomaFilters state={state} types={typeLabels} banden={banden} jaren={jaren}
          totaal={Object.values(typeCounts).reduce((s, n) => s + n, 0)} />
      )}

      {/* Diploma list — compacte rijen */}
      {!error && (
        <div className="space-y-1.5">
          {diplomas.length > 0 ? diplomas.map((diploma) => (
            <DiplomaRij key={diploma.id} diploma={diploma} />
          )) : (
            <div className="rounded-sm border border-gray-200 bg-white p-12 text-center shadow-sm">
              <p className="text-lg font-medium text-gray-400">Geen diploma&apos;s gevonden</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Compacte rij: naam + titel op één regel, band/datum/code rechts. De lange
// "Hierbij wordt bevestigd dat…"-beschrijving valt weg — die staat op het
// diploma zelf, niet in het overzicht.
function DiplomaRij({ diploma }: { diploma: any }) {
  const icoon = diploma.type === 'BELT_EXAM' ? '🎯' : diploma.type === 'COURSE_JAPANESE' ? '🇯🇵' : '🏆'
  return (
    <div className="flex items-center gap-3 rounded-sm border border-gray-200 bg-white px-3 py-2">
      <span className="shrink-0 text-base">{icoon}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-[#2a2a2a]">
          <span className="font-semibold">{diploma.member?.firstName} {diploma.member?.lastName}</span>
          <span className="ml-2 text-gray-500">{diploma.title}</span>
        </p>
      </div>
      {diploma.beltLevel && (
        <span className="hidden items-center gap-1 text-xs text-gray-500 sm:flex" title={BELT_LABELS_NL[diploma.beltLevel as BeltLevel]}>
          <span className="inline-flex h-2.5 w-2.5 rounded border border-gray-300" style={{ backgroundColor: BELT_COLORS[diploma.beltLevel as BeltLevel] || '#ccc' }} />
          {BELT_LABELS_NL[diploma.beltLevel as BeltLevel]}
        </span>
      )}
      <span className="shrink-0 text-xs text-gray-500">{new Date(diploma.awardedAt).toLocaleDateString('nl-NL')}</span>
      <span className="hidden shrink-0 font-mono text-[11px] text-gray-400 md:inline">{diploma.verificationCode}</span>
      {diploma.type === 'BELT_EXAM' && (
        <a href={`/diploma/${diploma.id}`} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-sm border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50">🖼 Diploma</a>
      )}
      <CopyButton code={diploma.verificationCode} />
    </div>
  )
}
