import { db } from '@/lib/db'
import { LesModus } from './LesModus'
import { GROEPEN, GROEP_LABEL } from '@/lib/admin2'
import type { TrainingDay } from '@prisma/client'

export const dynamic = 'force-dynamic'

export default async function LesModusPage({
  searchParams,
}: { searchParams: Promise<{ dag?: string; datum?: string; groep?: string }> }) {
  const params = await searchParams

  // Gegeven dag, of anders de eerstvolgende les, of today+groep aanmaken op demand
  let day: TrainingDay | null = null
  if (params.dag) {
    day = await db.trainingDay.findUnique({ where: { id: params.dag } })
  }
  if (!day && params.datum && params.groep) {
    day = await db.trainingDay.upsert({
      where: { date_group: { date: new Date(params.datum), group: params.groep } },
      create: { date: new Date(params.datum), group: params.groep, location: params.groep === 'WOENSDAG' ? 'OUD_VOSSEMEER' : 'STEENBERGEN' },
      update: {},
    })
  }
  if (!day) {
    day = await db.trainingDay.findFirst({
      where: { date: { gte: new Date(new Date().toISOString().slice(0, 10)) }, cancelled: false },
      orderBy: { date: 'asc' },
    })
  }

  // Beschikbare lessen voor snelle wissel (vandaag ± 3 dagen)
  const nu = new Date()
  const van = new Date(nu.getTime() - 2 * 864e5), tot = new Date(nu.getTime() + 4 * 864e5)
  const recenteDagen = await db.trainingDay.findMany({
    where: { date: { gte: van, lte: tot } },
    orderBy: [{ date: 'asc' }, { group: 'asc' }],
  })

  if (!day) {
    // Nog geen lessen aangemaakt: toon groepskeuze; link per groep naar de volgende lesdag van die groep
    const dagVanGroep: Record<string, number> = { VRIJDAG_1E: 5, VRIJDAG_2E: 5, VRIJDAG_3E: 5, WOENSDAG: 3 } // 0=zo,3=wo,5=vr
    const volgende = (weekday: number) => {
      const d = new Date()
      const diff = (weekday - d.getDay() + 7) % 7
      d.setDate(d.getDate() + (diff === 0 ? 0 : diff))
      return d.toISOString().slice(0, 10)
    }
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-[#2a2a2a]">Les invullen</h1>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="mb-3 text-sm text-gray-500">Nog geen lessen gepland rond vandaag. Kies een groep — de les wordt automatisch aangemaakt op de volgende lesdag van die groep:</p>
          <div className="grid grid-cols-2 gap-2">
            {GROEPEN.filter(g => g.value !== 'SENIOREN').map(g => (
              <a key={g.value} href={`/admin/aanwezigheid/les?datum=${volgende(dagVanGroep[g.value])}&groep=${g.value}`}
                className="rounded-xl border border-gray-200 p-4 text-center text-sm font-semibold hover:border-[#a90000] hover:text-[#a90000]">
                {g.label}
                <span className="mt-1 block text-[11px] font-normal text-gray-400">{g.dag}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const leden = await db.member.findMany({
    where: { isActive: true, primaryGroup: day.group },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    include: { attendance: { where: { trainingDayId: day.id } } },
  })

  return (
    <LesModus
      dag={{ id: day.id, datum: day.date.toISOString(), groep: day.group, groepLabel: GROEP_LABEL[day.group as keyof typeof GROEP_LABEL] ?? day.group, activity: day.activity, cancelled: day.cancelled }}
      leden={leden.map(m => ({
        id: m.id,
        naam: `${m.firstName} ${m.lastName}`,
        status: m.attendance[0]?.status ?? null,
        gast: m.clubStatus === 'PROEF',
      }))}
      recenteDagen={recenteDagen.map(d => ({
        id: d.id,
        label: `${d.date.toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })} · ${GROEP_LABEL[d.group as keyof typeof GROEP_LABEL] ?? d.group}`,
        actief: d.id === day!.id,
      }))}
    />
  )
}
