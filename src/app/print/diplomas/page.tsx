import { db } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { isAdmin } from '@/lib/auth'
import DiplomaReplica from '@/components/diploma/DiplomaReplica'
import DiplomaNaamFitter from '@/components/diploma/DiplomaNaamFitter'
import PrintKnop from '@/components/diploma/PrintKnop'
import PrintFitter from '@/components/diploma/PrintFitter'
import { BAND_DESIGN } from '@/lib/diploma-replica-data'
import { diplomaPlaats } from '@/app/print/diploma/[attempt]/page'

export const dynamic = 'force-dynamic'

export default async function PrintAlleDiploma({
  searchParams,
}: {
  searchParams: Promise<{ sitting?: string; plaats?: string }>
}) {
  if (!(await isAdmin())) redirect('/admin-login')
  const q = await searchParams
  if (!q.sitting) notFound()

  const sitting = await db.examSitting.findUnique({
    where: { id: q.sitting },
    include: { attempts: { include: { member: { select: { firstName: true, lastName: true } } }, orderBy: { member: { firstName: 'asc' } } } },
  })
  if (!sitting) notFound()

  const metDiploma = sitting.attempts.filter(a => BAND_DESIGN[a.beltLevel])
  const plaatsOptie = q.plaats === 'Steenbergen' || q.plaats === 'Oud-Vossemeer' ? q.plaats : diplomaPlaats(sitting.group)
  const datum = new Date(sitting.date.getTime() + 12 * 3600e3).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="diploma-root bg-gray-200 print:bg-white">
      <div className="print:hidden sticky top-0 z-10 flex flex-wrap items-center gap-2 bg-[#2a2a2a] px-4 py-2 text-sm text-white">
        <Link href="/admin/exams" className="text-white/80 hover:text-white">← Terug</Link>
        <span className="font-medium">Alle diploma's ({metDiploma.length})</span>
        <span className="flex gap-1 text-xs">
          {['Steenbergen', 'Oud-Vossemeer'].map(p => (
            <Link key={p} href={`/print/diplomas?sitting=${sitting.id}&plaats=${p}`} className={`rounded-sm px-2 py-1 ${plaatsOptie === p ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'}`}>{p}</Link>
          ))}
        </span>
        <PrintKnop label={`🖨 Alles printen (${metDiploma.length})`} />
      </div>
      {metDiploma.length === 0 && (
        <p className="p-8 text-sm text-gray-600">Deze examenmomenten bevatten alleen slip-examens — die krijgen geen diploma.</p>
      )}
      <div className="mx-auto w-fit py-6 print:py-0 print-fit">
        {metDiploma.map((a, i) => (
          <div key={a.id} style={{ breakAfter: i < metDiploma.length - 1 ? 'page' : 'auto' }}>
            <DiplomaReplica design={BAND_DESIGN[a.beltLevel]} naam={`${a.member.firstName} ${a.member.lastName}`} datum={datum} plaats={plaatsOptie} />
          </div>
        ))}
      </div>
      <DiplomaNaamFitter />
      <PrintFitter />
    </div>
  )
}
