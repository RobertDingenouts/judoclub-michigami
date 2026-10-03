import { db } from '@/lib/db'
import Link from 'next/link'
import { GROEP_LABEL, PAYMENT_INFO, kwartaalVan } from '@/lib/admin2'
import { getBeltLabel, getNextBelt, isYouth } from '@/lib/belt-utils'
import { BELT_COLORS } from '@/lib/student-progress-types'
import type { BeltLevel } from '@prisma/client'

export const dynamic = 'force-dynamic'

export default async function AdminStart() {
  const now = new Date()
  const todayIso = now.toISOString().slice(0, 10)
  const kw = kwartaalVan(now)

  const [
    actieveLeden, pendingApps, openPayments,
    dagenVandaag, dagenWeek,
    recenteAanwezigheid, geplandeExamens, ledenVoorExamen,
  ] = await Promise.all([
    db.member.count({ where: { isActive: true } }),
    db.membershipApplication.count({ where: { status: 'PENDING' } }),
    db.payment.aggregate({
      where: { status: { in: ['OPEN', 'HERINNERING1', 'HERINNERING2'] }, period: { label: kw } },
      _count: true, _sum: { amount: true },
    }),
    db.trainingDay.findMany({
      where: { date: { gte: new Date(todayIso) }, cancelled: false },
      orderBy: { date: 'asc' }, take: 4,
      include: { attendance: true },
    }),
    db.trainingDay.findMany({
      where: { date: { gte: new Date(now.getTime() - 7 * 864e5), lte: now }, cancelled: false },
      include: { attendance: true },
      orderBy: { date: 'asc' },
    }),
    db.attendance.groupBy({ by: ['status'], _count: true }),
    db.examAttempt.count({ where: { status: 'SCHEDULED' } }),
    db.member.findMany({
      where: { isActive: true, currentBelt: { not: null }, primaryGroup: { notIn: ['SENIOREN'] } },
      include: { bondHistory: { orderBy: { awardedAt: 'desc' }, take: 1 } },
      orderBy: [{ lastName: 'asc' }],
    }),
  ])

  const vandaag = dagenVandaag.filter(d => d.date.toISOString().slice(0, 10) === todayIso)
  const statusCounts: Record<string, number> = {}
  for (const d of vandaag) for (const a of d.attendance) statusCounts[a.status] = (statusCounts[a.status] || 0) + 1

  const trend = dagenWeek.map(d => {
    const relevant = d.attendance.filter(a => a.status !== 'VAKANTIE')
    const aanw = d.attendance.filter(a => a.status === 'AANWEZIG').length
    return {
      label: d.date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }),
      pct: relevant.length ? Math.round((aanw / relevant.length) * 100) : 0,
    }
  }).filter(t => t.pct > 0)

  const examList = ledenVoorExamen.map(m => {
    const youth = isYouth(m.dateOfBirth)
    const last = m.bondHistory[0]
    const next = getNextBelt(m.currentBelt as BeltLevel, youth)
    const maanden = last ? Math.round((now.getTime() - last.awardedAt.getTime()) / (30.44 * 864e5)) : null
    return {
      id: m.id, naam: `${m.firstName} ${m.lastName}`,
      belt: m.currentBelt as BeltLevel,
      next: next ? getBeltLabel(next) : '—',
      maanden,
    }
  }).filter(e => e.maanden === null || e.maanden >= 3).slice(0, 12)

  const attTotal = recenteAanwezigheid.reduce((s, g) => s + g._count, 0)
  const attAanw = recenteAanwezigheid.find(g => g.status === 'AANWEZIG')?._count ?? 0

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#2a2a2a]">Start</h1>
          <p className="mt-1 text-sm text-gray-500">
            {now.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {actieveLeden} actieve leden
          </p>
        </div>
        <Link href="/admin/aanwezigheid/les" className="rounded-xl bg-[#a90000] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#8c0000]">
          ✏️ Les invullen (op de mat)
        </Link>
      </div>

      {/* Tegels */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tegel title="Contributie" value={`${openPayments._count ?? 0} open`} sub={`€${(openPayments._sum.amount ?? 0).toFixed(0)} in ${kw}`} href="/admin/contributie"
          accent={(openPayments._count ?? 0) > 0 ? 'text-red-700' : 'text-green-700'} />
        <Tegel title="Inschrijvingen" value={pendingApps} sub={pendingApps ? 'wachten op goedkeuring' : 'niets te doen'} href="/admin/inschrijvingen"
          accent={pendingApps ? 'text-[#a90000]' : ''} />
        <Tegel title="Aanwezig (alles)" value={`${attTotal ? Math.round((attAanw / attTotal) * 100) : 0}%`} sub={`${attAanw}/${attTotal} registraties`} href="/admin/aanwezigheid" />
        <Tegel title="Examens" value={geplandeExamens} sub={geplandeExamens ? 'gepland' : 'geen gepland'} href="/admin/exams" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Komende lessen */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-[#2a2a2a]">Komende lessen</h2>
            <Link href="/admin/aanwezigheid" className="text-xs text-[#a90000] hover:underline">Rooster →</Link>
          </div>
          {dagenVandaag.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">Geen lessen gepland. Maak ze aan bij Lessen → Rooster.</p>
          ) : (
            <div className="space-y-2">
              {dagenVandaag.map(d => {
                const isVandaag = d.date.toISOString().slice(0, 10) === todayIso
                const aanw = d.attendance.filter(a => a.status === 'AANWEZIG').length
                const afg = d.attendance.filter(a => a.status === 'AFGEMELD').length
                return (
                  <Link key={d.id} href={`/admin/aanwezigheid/les?dag=${d.id}`}
                    className={`flex items-center justify-between rounded-lg border p-3.5 transition-colors hover:border-[#a90000]/40 ${isVandaag ? 'border-[#a90000]/50 bg-[#fdf6f6]' : 'border-gray-100'}`}>
                    <div>
                      <p className="text-sm font-semibold text-[#2a2a2a]">
                        {d.date.toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })}
                        <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-600">{GROEP_LABEL[d.group as keyof typeof GROEP_LABEL] ?? d.group}</span>
                      </p>
                      {d.activity && <p className="mt-0.5 text-xs text-gray-500">🎯 {d.activity}</p>}
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      {d.attendance.length > 0 ? (
                        <>{aanw} ✅ · {afg} 🅰</>
                      ) : (
                        <span className="text-[#a90000]">Invullen →</span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
          {vandaag.length > 0 && Object.keys(statusCounts).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3 text-xs">
              {Object.entries(statusCounts).map(([s, n]) => (
                <span key={s} className={`rounded-full border border-gray-200 px-2.5 py-1 ${PAYMENT_INFO[s]?.klas ?? 'bg-gray-100'}`}>{s}: {n}</span>
              ))}
            </div>
          )}
        </div>

        {/* Trend */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 font-semibold text-[#2a2a2a]">Aanwezigheid laatste 7 dagen</h2>
          {trend.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">Nog geen data</p>
          ) : (
            <div className="space-y-2">
              {trend.slice(-8).map((t, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="w-16 shrink-0 text-gray-500">{t.label}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded bg-gray-100">
                    <div className="h-full rounded bg-[#a90000]" style={{ width: `${t.pct}%` }} />
                  </div>
                  <span className="w-9 shrink-0 text-right font-medium">{t.pct}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Examens in zicht */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-[#2a2a2a]">🥋 Examens in zicht <span className="text-xs font-normal text-gray-400">(≥3 maanden in huidige band)</span></h2>
          <Link href="/admin/exams/new" className="text-xs text-[#a90000] hover:underline">Examen plannen →</Link>
        </div>
        {examList.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400">Niemand komt in aanmerking (of bandgegevens nog niet compleet)</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {examList.map(e => (
              <Link key={e.id} href={`/admin/students/${e.id}`} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 hover:border-[#a90000]/40">
                <span className="h-4 w-4 shrink-0 rounded-full border border-gray-300" style={{ backgroundColor: BELT_COLORS[e.belt] ?? '#ccc' }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#2a2a2a]">{e.naam}</p>
                  <p className="text-xs text-gray-500">nu {getBeltLabel(e.belt)} → <b className="text-[#a90000]">{e.next}</b></p>
                </div>
                <span className="shrink-0 text-xs text-gray-400">{e.maanden ?? '?'} mnd</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Tegel({ title, value, sub, href, accent = '' }: { title: string; value: string | number; sub: string; href: string; accent?: string }) {
  return (
    <Link href={href} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-[#a90000]">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{title}</p>
      <p className={`mt-1 text-2xl font-bold ${accent || 'text-[#2a2a2a]'}`}>{value}</p>
      <p className="mt-0.5 text-xs text-gray-500">{sub}</p>
    </Link>
  )
}
