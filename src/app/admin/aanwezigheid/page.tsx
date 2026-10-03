import { db } from '@/lib/db'
import Link from 'next/link'
import { KwartaalGrid } from './KwartaalGrid'
import { GROEPEN, GROEP_LABEL, STATUS_INFO } from '@/lib/admin2'

export const dynamic = 'force-dynamic'

export default async function AanwezigheidPage({
  searchParams,
}: { searchParams: Promise<{ periode?: string; groep?: string }> }) {
  const params = await searchParams
  const nu = new Date()
  const defaultPeriode = `${nu.getFullYear()}-Q${Math.floor(nu.getMonth() / 3) + 1}`
  const periode = params.periode || defaultPeriode
  const groepFilter = params.groep || ''

  const [periodes, dagen, leden] = await Promise.all([
    db.contributionPeriod.findMany({ orderBy: { start: 'asc' } }),
    db.trainingDay.findMany({
      where: {
        date: {
          gte: new Date(`${periode.slice(0, 4)}-${String((Number(periode.slice(-1)) - 1) * 3 + 1).padStart(2, '0')}-01`),
          lt: Number(periode.slice(-1)) === 4
            ? new Date(`${Number(periode.slice(0, 4)) + 1}-01-01`)
            : new Date(`${periode.slice(0, 4)}-${String(Number(periode.slice(-1)) * 3 + 1).padStart(2, '0')}-01`),
        },
      },
      include: { attendance: true },
      orderBy: { date: 'asc' },
    }),
    db.member.findMany({
      where: { isActive: true, clubStatus: { notIn: ['PROEF'] } },
      orderBy: [{ lastName: 'asc' }],
      select: { id: true, firstName: true, lastName: true, primaryGroup: true, clubStatus: true },
    }),
  ])

  const groep = groepFilter || 'VRIJDAG_1E'
  const groepLeden = leden.filter(m => m.primaryGroup === groep)

  // Per dag: map van memberId -> status
  const grid = dagen.map(d => ({
    id: d.id,
    datum: d.date.toISOString(),
    statussen: Object.fromEntries(d.attendance.map(a => [a.memberId, a.status])),
    activity: d.activity,
    cancelled: d.cancelled,
  }))

  const vorigePeriodes = periodes.map(p => p.label)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#2a2a2a]">Lessen & aanwezigheid</h1>
          <p className="mt-1 text-sm text-gray-500">klik op een cel om de status te zien/wijzen via de lesmodus</p>
        </div>
        <Link href="/admin/aanwezigheid/les" className="rounded-xl bg-[#a90000] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#8c0000]">✏️ Lesmodus</Link>
      </div>

      {/* Periode + groep tabs */}
      <div className="flex flex-wrap gap-1.5">
        {vorigePeriodes.map(p => (
          <Link key={p} href={`/admin/aanwezigheid?periode=${p}&groep=${groep}`}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium ${p === periode ? 'border-[#a90000] bg-[#a90000] text-white' : 'border-gray-300 bg-white text-gray-600'}`}>{p}</Link>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {GROEPEN.map(g => (
          <Link key={g.value} href={`/admin/aanwezigheid?periode=${periode}&groep=${g.value}`}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium ${g.value === groep ? 'border-[#2a2a2a] bg-[#2a2a2a] text-white' : 'border-gray-300 bg-white text-gray-600'}`}>{g.label}</Link>
        ))}
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-2 text-xs">
        {Object.entries(STATUS_INFO).map(([k, v]) => (
          <span key={k} className={`rounded-full border px-2.5 py-1 ${v.klas}`}>{v.emoji} {v.label}</span>
        ))}
        <span className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-gray-400">· leeg = niet ingevuld</span>
      </div>

      {grid.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
          Geen lessen in {periode}. Deze worden per kwartaal aangemaakt (of ontstaan automatisch in de lesmodus).
        </div>
      ) : (
        <KwartaalGrid
          dagen={grid.map(d => ({ id: d.id, datum: d.datum, cancelled: d.cancelled, activity: d.activity }))}
          leden={groepLeden.map(m => ({ id: m.id, naam: `${m.firstName} ${m.lastName}`, clubStatus: m.clubStatus }))}
          cellen={Object.fromEntries(grid.flatMap(d => Object.entries(d.statussen).map(([mid, st]) => [`${mid}|${d.id}`, st as string])))}
        />
      )}
    </div>
  )
}
