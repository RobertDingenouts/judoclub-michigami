import { db } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { isAdmin } from '@/lib/auth'
import DiplomaReplica from '@/components/diploma/DiplomaReplica'
import DiplomaNaamFitter from '@/components/diploma/DiplomaNaamFitter'
import { BAND_DESIGN } from '@/lib/diploma-replica-data'

export const dynamic = 'force-dynamic'

export function diplomaPlaats(groep: string): string {
  return groep.startsWith('VRIJDAG') ? 'Steenbergen' : 'Oud-Vossemeer'
}

export default async function PrintDiploma({
  params,
  searchParams,
}: {
  params: Promise<{ attempt: string }>
  searchParams: Promise<{ plaats?: string }>
}) {
  if (!(await isAdmin())) redirect('/admin-login')
  const { attempt } = await params
  const q = await searchParams

  const a = await db.examAttempt.findUnique({
    where: { id: attempt },
    include: { member: { select: { firstName: true, lastName: true } }, sitting: { select: { group: true, date: true, type: true } } },
  })
  if (!a || !a.sitting) notFound()

  const design = BAND_DESIGN[a.beltLevel]
  const datum = new Date(a.sitting.date.getTime() + 12 * 3600e3).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
  const plaatsOptie = q.plaats === 'Steenbergen' || q.plaats === 'Oud-Vossemeer' ? q.plaats : diplomaPlaats(a.sitting.group)
  const naam = `${a.member.firstName} ${a.member.lastName}`

  if (!design) {
    return (
      <div className="mx-auto max-w-lg p-8 text-sm">
        <h1 className="text-lg font-bold mb-2">Geen diploma voor dit examen</h1>
        <p className="mb-4">Examen <span className="font-medium">{a.beltLevel.replace(/_/g, '-')}</span> is een slip-examen — daar hoort (net als in Canva) geen diploma bij.</p>
        <Link href="/admin/exams" className="text-[#a90000] hover:underline">← Terug naar examens</Link>
      </div>
    )
  }

  return (
    <div className="diploma-root bg-gray-200 print:bg-white">
      <div className="print:hidden sticky top-0 z-10 flex flex-wrap items-center gap-2 bg-[#2a2a2a] px-4 py-2 text-sm text-white">
        <Link href="/admin/exams" className="text-white/80 hover:text-white">← Terug</Link>
        <span className="font-medium">{naam} — {a.beltLevel.replace(/_/g, ' ').toLowerCase()}</span>
        <span className="ml-2 flex gap-1 text-xs">
          {['Steenbergen', 'Oud-Vossemeer'].map(p => (
            <Link key={p} href={`/print/diploma/${a.id}?plaats=${p}`} className={`rounded-sm px-2 py-1 ${plaatsOptie === p ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'}`}>{p}</Link>
          ))}
        </span>
        <button onClick={() => window.print()} className="ml-auto rounded-sm bg-white px-3 py-1 font-medium text-black hover:bg-gray-100">🖨 Printen</button>
      </div>
      <div className="mx-auto w-fit py-6 print:py-0">
        <DiplomaReplica design={design} naam={naam} datum={datum} plaats={plaatsOptie} />
      </div>
      <DiplomaNaamFitter />
    </div>
  )
}
