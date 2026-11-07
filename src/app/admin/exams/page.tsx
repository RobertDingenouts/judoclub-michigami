import { db } from '@/lib/db'
import Link from 'next/link'
import { GROEP_LABELS, GROEP_SUBTEXT, kandidatenVoorGroep, beltLabel } from '@/lib/examens'
import { BeltBadge } from '@/components/admin/BeltBadge'
import { getBeltColor } from '@/lib/belt-utils'
import { BeltLevel } from '@prisma/client'
import NieuweBijeenkomstForm from './NieuweBijeenkomstForm'

export const dynamic = 'force-dynamic'

export default async function ExamensHub({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>
}) {
  const params = await searchParams
  const tab = params?.tab || 'actueel'

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2a2a2a]">Examens</h1>
          <p className="mt-1 text-sm text-gray-500">Bijeenkomst aanmaken → kandidaten worden automatisch voorgesteld op hun volgende band of slip</p>
        </div>
        <div className="flex gap-2 text-sm">
          <Link href="/admin/exams" className={`rounded-sm px-3 py-1.5 ${tab === 'actueel' ? 'bg-[#a90000] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>Actueel</Link>
          <Link href="/admin/exams?tab=historie" className={`rounded-sm px-3 py-1.5 ${tab === 'historie' ? 'bg-[#a90000] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>Historie</Link>
          <Link href="/admin/exams/formulieren" className="rounded-sm border border-[#a90000] bg-white px-3 py-1.5 font-medium text-[#a90000] hover:bg-red-50">📄 Formulieren</Link>
        </div>
      </div>

      {tab === 'actueel' ? (
        <>
          <NieuweBijeenkomstForm />

          <div>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500">Geplande examenbijeenkomsten</h2>
            <div className="space-y-2">
              {sittings.length === 0 && <p className="text-sm text-gray-400">Nog geen bijeenkomsten.</p>}
              {sittings.map(s => {
                const totaal = s.attempts.length
                const af = s.attempts.filter(a => a.status !== 'SCHEDULED').length
                const klaarVoorExamen = s.attempts.filter(a => a.klaar).length
                const isProef = s.type === 'PROEF'
                return (
                  <div key={s.id} className={`flex flex-wrap items-center justify-between gap-2 rounded-sm border bg-white p-4 shadow-sm ${isProef ? 'border-amber-200' : 'border-gray-200'}`}>
                    <div>
                      <p className="text-sm font-semibold text-[#2a2a2a]">
                        {new Date(s.date).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        <span className={`ml-2 rounded-sm px-1.5 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wide ${isProef ? 'bg-amber-100 text-amber-800' : 'bg-red-50 text-[#a90000]'}`}>{isProef ? 'proef' : 'examen'}</span>
                        <span className="ml-2 text-xs font-normal text-gray-500">{GROEP_LABELS[s.group]}{s.title ? ` · ${s.title}` : ''}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {isProef ? <span className="font-medium text-green-700">{klaarVoorExamen}/{totaal} klaar voor examen</span> : `${af}/${totaal} registratie af`} · {GROEP_SUBTEXT[s.group] || ''}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/admin/exams/bijeenkomst/${s.id}`} className="rounded-sm bg-[#a90000] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#8c0000]">Registreren</Link>
                      <Link href={`/print/examen?sitting=${s.id}`} className="rounded-sm border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">Print</Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-baseline gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Waar is iedereen nu voor op?</h2>
              <span className="text-xs text-gray-400">gesorteerd op huidige band · wit → bruin</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {doelenPerGroep.map(({ groep, kandidaten }) => (
                <div key={groep} className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between bg-[#a90000] px-4 py-2.5 text-white">
                    <div>
                      <span className="text-sm font-semibold">{GROEP_LABELS[groep]}</span>
                      <p className="text-[11px] text-red-100">{GROEP_SUBTEXT[groep]}</p>
                    </div>
                    <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs">{kandidaten.length} leden</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto p-2">
                    {kandidaten.length === 0 && <p className="p-2 text-xs text-gray-400">Geen kandidaten in deze groep.</p>}
                    {kandidaten.map(k => (
                      <div key={k.memberId} className="mb-0.5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 rounded-sm border-l-4 bg-gray-50/60 px-3 py-1.5 text-sm transition-colors hover:bg-gray-100" style={{ borderLeftColor: getBeltColor(k.doel as BeltLevel) }}>
                        <span className="truncate font-medium text-[#2a2a2a]">{k.firstName} {k.lastName}</span>
                        <span className="grid grid-cols-[1.8rem_0.8rem_1.8rem_minmax(0,7.5rem)] items-center gap-x-1 text-[11px]">
                          <BeltBadge belt={k.currentBelt} height="h-3.5" width="w-[1.6rem]" />
                          <span className="text-center text-gray-400">→</span>
                          <BeltBadge belt={k.doel} height="h-3.5" width="w-[1.6rem]" />
                          <span className="truncate font-semibold text-[#2a2a2a]">{beltLabel(k.doel)}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 px-4 py-2">
                    <Link href={`/print/examen?groep=${groep}`} className="text-xs text-[#a90000] hover:underline">Print doelenlijst →</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
