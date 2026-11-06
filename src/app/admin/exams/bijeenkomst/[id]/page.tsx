import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { kandidatenVoorGroep, GROEP_LABELS, beltIndex } from '@/lib/examens'
import Registratie from '../Registratie'

export const dynamic = 'force-dynamic'

export default async function BijeenkomstPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sitting = await db.examSitting.findUnique({
    where: { id },
    include: {
      attempts: {
        orderBy: [{ member: { lastName: 'asc' } }],
        include: { member: { select: { id: true, firstName: true, lastName: true, currentBelt: true } }, diploma: { select: { id: true } } },
      },
    },
  })
  if (!sitting) notFound()

  const inZitting = new Set(sitting.attempts.map(a => a.memberId))
  const kandidaten = (await kandidatenVoorGroep(sitting.group)).filter(k => !inZitting.has(k.memberId))

  const rijen = sitting.attempts
    .map(a => ({
      id: a.id,
      memberId: a.memberId,
      naam: `${a.member.firstName} ${a.member.lastName}`,
      huidigeBelt: (a.member.currentBelt === 'BRUIN_1' ? 'BRUIN' : a.member.currentBelt) as string | null,
      beltLevel: a.beltLevel as string,
      status: a.status as string,
      examDate: a.examDate ? a.examDate.toISOString().slice(0, 10) : null,
      categoryResults: (a.categoryResults as Record<string, boolean> | null) ?? {},
      heeftDiploma: !!a.diploma,
    }))
    .sort((x, y) => beltIndex(x.huidigeBelt) - beltIndex(y.huidigeBelt) || x.naam.localeCompare(y.naam, 'nl'))

  return (
    <Registratie
      sitting={{
        id: sitting.id,
        date: sitting.date.toISOString().slice(0, 10),
        groep: sitting.group,
        groepLabel: GROEP_LABELS[sitting.group] || sitting.group,
        title: sitting.title,
        examiners: sitting.examiners,
      }}
      attempts={rijen}
      kandidaten={kandidaten.map(k => ({ memberId: k.memberId, naam: `${k.firstName} ${k.lastName}`, doel: k.doel as string }))}
    />
  )
}
