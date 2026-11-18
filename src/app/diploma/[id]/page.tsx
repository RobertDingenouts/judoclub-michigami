import { db } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import DiplomaReplica from '@/components/diploma/DiplomaReplica'
import DiplomaNaamFitter from '@/components/diploma/DiplomaNaamFitter'
import { BAND_DESIGN } from '@/lib/diploma-replica-data'
import { diplomaPlaats } from '@/app/print/diploma/[attempt]/page'

export const dynamic = 'force-dynamic'

export default async function DiplomaView({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) redirect('/signin')
  const { id } = await params

  const d = await db.diploma.findUnique({
    where: { id },
    include: { member: { select: { firstName: true, lastName: true } }, examAttempt: { include: { sitting: { select: { group: true, date: true } } } } },
  })
  if (!d) notFound()

  const admin = await isAdmin()
  if (!admin && d.userId !== user.id && d.recipientId !== user.id && user.role !== 'PARENT') notFound()
  // ouders mogen het diploma van hun kind zien (recipient via linked user) — owners check hierboven dekt dat via userId van het kind.

  const design = (d.beltLevel && BAND_DESIGN[d.beltLevel]) || 'wit'
  const Sitting = d.examAttempt?.sitting
  const basis = d.examAttempt?.sitting?.date ?? d.awardedAt
  const datum = new Date(new Date(basis).getTime() + 12 * 3600e3).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
  const plaats = Sitting ? diplomaPlaats(Sitting.group) : 'Steenbergen'
  const naam = `${d.member.firstName ?? ''} ${d.member.lastName ?? ''}`.trim()

  return (
    <div className="diploma-root bg-gray-200 print:bg-white">
      <div className="print:hidden sticky top-0 z-10 flex flex-wrap items-center gap-3 bg-[#2a2a2a] px-4 py-2 text-sm text-white">
        <Link href="/leden/diploma's" className="text-white/80 hover:text-white">← Mijn diploma's</Link>
        <span className="font-medium">{naam} — {d.title}</span>
        <button onClick={() => window.print()} className="ml-auto rounded-sm bg-white px-3 py-1 font-medium text-black hover:bg-gray-100">🖨 Printen / als PDF bewaren</button>
      </div>
      <div className="mx-auto w-fit py-6 print:py-0">
        <DiplomaReplica design={design} naam={naam} datum={datum} plaats={plaats} />
      </div>
      <p className="print:hidden mx-auto mb-8 max-w-[820px] px-4 text-center text-xs text-gray-500">
        Digitaal geverifieerd diploma · code <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{d.verificationCode}</span> · te controleren op <Link href="/diploma/verifieren" className="text-[#a90000] hover:underline">judoclubmichigami.nl/diploma/verifieren</Link>
      </p>
      <DiplomaNaamFitter />
    </div>
  )
}
