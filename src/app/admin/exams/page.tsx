import { db } from '@/lib/db'
import Link from 'next/link'
import { GROEP_LABELS, GROEP_SUBTEXT, kandidatenVoorGroep, beltLabel } from '@/lib/examens'
import { BeltBadge } from '@/components/admin/BeltBadge'
import { getBeltColor } from '@/lib/belt-utils'
import { BeltLevel } from '@prisma/client'
import NieuweBijeenkomstForm from './NieuweBijeenkomstForm'
import ZittingenLijst, { type ZittingRij } from './ZittingenLijst'
import VoorbereidingsOverzicht, { type PrepGroep, type PrepRij } from './VoorbereidingsOverzicht'

export const dynamic = 'force-dynamic'

export default async function ExamensHub({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>
}) {
  const params = await searchParams
  const tab = params?.tab || 'actueel'

  const nu = new Date()
  nu.setHours(0, 0, 0, 0)

  const groepen = Object.keys(GROEP_LABELS)
  const [doelenPerGroep, sittings, historje] = await Promise.all([
    Promise.all(groepen.map(async g => ({ groep: g, kandidaten: await kandidatenVoorGroep(g) }))),
    db.examSitting.findMany({
      orderBy: { date: 'desc' }, take: 12,
      include: { attempts: { select: { id: true, status: true, klaar: true } } },
    }),
    db.examAttempt.findMany({
      orderBy: { examDate: 'desc' }, take: 40,
      where: { status: { in: ['COMPLETED_PASSED', 'COMPLETED_FAILED'] } },
      include: { member: { select: { firstName: true, lastName: true } } },
    }),
  ])

  // Data voor het voorbereidingsoverzicht: afvinklijst, band-sinds, planning
  const ids = [...new Set(doelenPerGroep.flatMap(g => g.kandidaten.map(k => k.memberId)))]
  const [prepRows, leden, geplandRows] = await Promise.all([
    db.examPrep.findMany({ where: { memberId: { in: ids } } }),
    db.member.findMany({ where: { id: { in: ids } }, select: { id: true, beltSince: true, joinDate: true } }),
    db.examAttempt.findMany({
      where: { memberId: { in: ids }, status: 'SCHEDULED', diploma: null, OR: [{ sitting: { date: { gte: nu } } }, { examDate: { gte: nu } }] },
      orderBy: { createdAt: 'desc' },
      include: { sitting: { select: { id: true, date: true } } },
    }),
  ])
  const prepMap = new Map(prepRows.map(p => [`${p.memberId}|${p.targetBelt}`, p.checked as Record<string, true>]))
  const lidMap = new Map(leden.map(m => [m.id, m]))
  const plannedMap = new Map<string, { attemptId: string; sittingId: string | null; datum: string }>()
  for (const a of geplandRows) {
    if (plannedMap.has(a.memberId)) continue
    const d = a.sitting?.date ?? a.examDate
    if (!d) continue
    plannedMap.set(a.memberId, { attemptId: a.id, sittingId: a.sittingId, datum: d.toISOString().slice(0, 10) })
  }

  const bereidGroepen: PrepGroep[] = doelenPerGroep.map(({ groep, kandidaten }) => ({
    groep,
    label: GROEP_LABELS[groep],
    subtext: GROEP_SUBTEXT[groep] || '',
    rijen: kandidaten.map<PrepRij>(k => {
      const lid = lidMap.get(k.memberId)
      const sinds = lid?.beltSince ?? lid?.joinDate ?? new Date()
      return {
        memberId: k.memberId,
        groep,
        firstName: k.firstName,
        lastName: k.lastName,
        currentBelt: k.currentBelt,
        doel: k.doel as string,
        sinds: sinds.toISOString(),
        sindsBron: lid?.beltSince ? 'handmatig/automatisch ingesteld' : 'lidwording — pas aan als de band eerder behaald is',
        checked: prepMap.get(`${k.memberId}|${k.doel}`) ?? {},
        planned: plannedMap.get(k.memberId) ?? null,
      }
    }),
  }))

  const zittingen: ZittingRij[] = sittings.map(s => ({
    id: s.id,
    datum: s.date.toISOString().slice(0, 10),
    isProef: s.type === 'PROEF',
    groepLabel: GROEP_LABELS[s.group] || s.group,
    title: s.title,
    totaal: s.attempts.length,
    af: s.attempts.filter(a => a.status !== 'SCHEDULED').length,
    klaarVoorExamen: s.attempts.filter(a => a.klaar).length,
    subtext: GROEP_SUBTEXT[s.group] || '',
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2a2a2a]">Examens</h1>
          <p className="mt-1 text-sm text-gray-500">
            Klik op ▸ bij een lid en vink de technieken af — het blijft bewaard. Is iemand zover: <span className="font-medium text-green-700">✓ Klaar?</span> + examendatum, dan wordt het examenmoment automatisch aangemaakt.
            <span className="ml-1 inline-flex items-center gap-1 align-middle text-[11px] text-gray-400">Klokje = tijd in huidige band/slip: <span className="font-bold text-green-700">groen</span> &lt;½ jr · <span className="font-bold text-orange-600">oranje</span> tot 1 jr · <span className="font-bold text-red-600">rood</span> &gt;1 jr</span>
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <Link href="/admin/exams" className={`rounded-sm px-3 py-1.5 ${tab === 'actueel' ? 'bg-[#a90000] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>Actueel</Link>
          <Link href="/admin/exams?tab=historie" className={`rounded-sm px-3 py-1.5 ${tab === 'historie' ? 'bg-[#a90000] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>Historie</Link>
          <Link href="/admin/exams/formulieren" className="rounded-sm border border-[#a90000] bg-white px-3 py-1.5 font-medium text-[#a90000] hover:bg-red-50">📄 Formulieren</Link>
        </div>
      </div>

      {tab === 'actueel' ? (
        <>
          <div>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500">Voorbereiding — per lid technieken afvinken</h2>
            <VoorbereidingsOverzicht groepen={bereidGroepen} />
          </div>

          <div>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500">Geplande examenbijeenkomsten</h2>
            <ZittingenLijst zittingen={zittingen} />
          </div>

          <details className="rounded-sm border border-gray-200 bg-white shadow-sm">
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-gray-600 select-none">+ Zelf een (proef)bijeenkomst aanmaken</summary>
            <div className="border-t border-gray-100 p-4 pt-0">
              <p className="pb-2 text-xs text-gray-400">Leden komen bij een examen vanzelf binnen via “Klaar voor examen” hierboven — een examenbijeenkomst is dan niet meer nodig. Alleen voor een proefexamen of een aparte examenbijeenkomst met eigen titel is dit handig.</p>
              <NieuweBijeenkomstForm />
            </div>
          </details>
        </>
      ) : (
        <div className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr><th className="px-4 py-2">Lid</th><th className="px-4 py-2">Band</th><th className="px-4 py-2">Datum</th><th className="px-4 py-2">Uitslag</th></tr>
            </thead>
            <tbody>
              {historje.map(e => (
                <tr key={e.id} className="border-t border-gray-100 odd:bg-gray-50">
                  <td className="px-4 py-2">{e.member?.firstName} {e.member?.lastName}</td>
                  <td className="px-4 py-2">{beltLabel(e.beltLevel)}</td>
                  <td className="px-4 py-2">{e.examDate ? new Date(e.examDate).toLocaleDateString('nl-NL') : '-'}</td>
                  <td className="px-4 py-2">{e.status === 'COMPLETED_PASSED' ? <span className="text-green-700">✓ Geslaagd</span> : <span className="text-red-700">✗ Niet geslaagd</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
