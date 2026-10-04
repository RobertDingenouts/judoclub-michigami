import { db } from '@/lib/db'
import Link from 'next/link'
import { KwartaalGrid } from './KwartaalGrid'
import { GROEPEN, STATUS_INFO } from '@/lib/admin2'
import { PlanBar } from './PlanBar'
import { vakantieOp } from '@/data/vakanties'

export const dynamic = 'force-dynamic'

function periodeRange(periode: string): [Date, Date] {
  const y = Number(periode.slice(0, 4))
  const q = Number(periode.slice(-1))
  const start = new Date(`${y}-${String((q - 1) * 3 + 1).padStart(2, '0')}-01`)
  const end = q === 4 ? new Date(`${y + 1}-01-01`) : new Date(`${y}-${String(q * 3 + 1).padStart(2, '0')}-01`)
  return [start, end]
}

export default async function AanwezigheidPage({
  searchParams,
}: { searchParams: Promise<{ periode?: string; groepen?: string; van?: string; tot?: string }> }) {
  const params = await searchParams
  const nu = new Date()
  const defaultPeriode = `${nu.getFullYear()}-Q${Math.floor(nu.getMonth() / 3) + 1}`
  const periode = params.periode || defaultPeriode

  // Bereik: expliciete datums (van/tot) winnen, anders kwartaal
  let rangeStart: Date, rangeEnd: Date, rangeLabel: string
  if (params.van && params.tot) {
    rangeStart = new Date(params.van)
    rangeEnd = new Date(params.tot)
    rangeLabel = `${params.van} → ${params.tot}`
  } else {
    ;[rangeStart, rangeEnd] = periodeRange(periode)
    rangeLabel = periode
  }

  // Groepen: comma-gescheiden selectie; standaard alle lessen-groepen
  const alleLesGroepen = GROEPEN.filter(g => g.value !== 'SENIOREN').map(g => g.value)
  const groepen = (params.groepen ? params.groepen.split(',').filter(Boolean) : alleLesGroepen)
    .filter(g => alleLesGroepen.includes(g as never))

  const [periodes, dagen, leden] = await Promise.all([
    db.contributionPeriod.findMany({ orderBy: { start: 'asc' } }),
    db.trainingDay.findMany({
      where: { date: { gte: rangeStart, lt: rangeEnd }, group: { in: groepen } },
      include: { attendance: true },
      orderBy: [{ date: 'asc' }, { group: 'asc' }],
    }),
    db.member.findMany({
      where: { isActive: true, clubStatus: { notIn: ['PROEF'] }, primaryGroup: { in: groepen } },
      orderBy: [{ lastName: 'asc' }],
      select: { id: true, firstName: true, lastName: true, primaryGroup: true, clubStatus: true, dateOfBirth: true, currentBelt: true },
    }),
  ])

  const grid = dagen.map(d => ({
    id: d.id,
    datum: d.date.toISOString(),
    groep: d.group,
    locatie: d.location,
    statussen: Object.fromEntries(d.attendance.map(a => [a.memberId, a.status])),
    activity: d.activity,
    cancelled: d.cancelled,
    // Vakantie bepaald op groep (rooster is autoritair) — niet op de locatie in
    // de database, want historische rijen kunnen een onjuiste locatie hebben.
    vakantie: vakantieOp(d.date.toISOString().slice(0, 10), d.group) !== null,
  }))

  const qs = (extra: Record<string, string>) => {
    const p = new URLSearchParams({ periode, groepen: groepen.join(','), ...extra })
    if (params.van && params.tot && !extra.van) { p.set('van', params.van); p.set('tot', params.tot) }
    return `/admin/aanwezigheid?${p.toString()}`
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#2a2a2a]">Lessen & aanwezigheid</h1>
          <p className="mt-1 text-sm text-gray-500">klik een cel om te wisselen · klik een kolomkop voor de lesmodus van die les</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/api/admin2/export?lijst=aanwezigheid"
            className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-[#a90000] hover:text-[#a90000]">⬇ Excel</a>
          <Link href="/admin/aanwezigheid/les" className="rounded-xl bg-[#a90000] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#8c0000]">✏️ Lesmodus</Link>
        </div>
      </div>

      {/* Periode tabs */}
      <div className="flex flex-wrap items-center gap-1.5">
        {periodes.map(p => (
          <Link key={p.label} href={qs({ periode: p.label })}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium ${p.label === periode && !params.van ? 'border-[#a90000] bg-[#a90000] text-white' : 'border-gray-300 bg-white text-gray-600'}`}>{p.label}</Link>
        ))}
        <Link href={`/admin/aanwezigheid?periode=&van=${nu.getFullYear()}-01-01&tot=${nu.getFullYear() + 1}-12-31&groepen=${groepen.join(',')}`}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-medium ${params.van ? 'border-[#a90000] bg-[#a90000] text-white' : 'border-gray-300 bg-white text-gray-600'}`}>
          📅 heel {nu.getFullYear() + 1}
        </Link>
      </div>

      {/* Groepen: aan/uit + alles selecteren */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button form="groepenForm" type="submit" className="hidden" />
        {GROEPEN.filter(g => g.value !== 'SENIOREN').map(g => {
          const aan = groepen.includes(g.value)
          const next = aan ? groepen.filter(x => x !== g.value) : [...groepen, g.value]
          return (
            <a key={g.value} href={qs({ groepen: next.join(',') || 'GEEN' })}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium ${aan ? 'border-[#2a2a2a] bg-[#2a2a2a] text-white' : 'border-gray-300 bg-white text-gray-400'}`}>
              {aan ? '✓ ' : ''}{g.label}
            </a>
          )
        })}
        <a href={qs({ groepen: alleLesGroepen.join(',') })} className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-[#a90000]">Alles</a>
        <span className="ml-1 text-[11px] text-gray-400">meerdere groepen = blokken onder elkaar</span>
      </div>

      {/* Plannen vooruit */}
      <PlanBar rangeLabel={rangeLabel} />

      {/* Legenda */}
      <div className="flex flex-wrap gap-2 text-xs">
        {Object.entries(STATUS_INFO).map(([k, v]) => (
          <span key={k} className={`rounded-full border px-2.5 py-1 ${v.klas}`}>{v.emoji} {v.label}</span>
        ))}
        <span className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-gray-400">· leeg = niet ingevuld</span>
        <span className="rounded-full border border-[#a90000]/30 bg-[#fdf6f6] px-2.5 py-1 text-[#a90000]">🎯 = activiteit/onderwerp</span>
      </div>

      {groepen.length === 0 || grid.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
          {groepen.length === 0 ? 'Geen groep geselecteerd — klik hierboven een groep.' : `Geen lessen in ${rangeLabel}. Gebruik "📅 Plannen" om het vooruit te plannen.`}
        </div>
      ) : (
        <KwartaalGrid
          dagen={grid}
          leden={leden.map(m => ({ id: m.id, naam: `${m.firstName} ${m.lastName}`, clubStatus: m.clubStatus, groep: m.primaryGroup ?? '', dateOfBirth: m.dateOfBirth?.toISOString().slice(0, 10) ?? null, currentBelt: m.currentBelt }))}
          cellen={Object.fromEntries(grid.flatMap(d => Object.entries(d.statussen).map(([mid, st]) => [`${mid}|${d.id}`, st as string])))}
        />
      )}
    </div>
  )
}
