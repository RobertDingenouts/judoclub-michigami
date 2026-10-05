import Link from 'next/link'
import { findLesDag, lesModusProps } from '@/lib/lesdata'
import { LesModus } from './LesModus'
import { GROEPEN } from '@/lib/admin2'
import { ensureUpcomingDays } from '@/lib/lessen'

export const dynamic = 'force-dynamic'

// De data-haal-logica leeft in src/lib/lesdata.ts — exact dezelfde als de
// lesmodus-widget op het startscherm, dus beide tonen dezelfde ledenlijst.
export default async function LesModusPage({
  searchParams,
}: { searchParams: Promise<{ dag?: string; datum?: string; groep?: string }> }) {
  const params = await searchParams
  await ensureUpcomingDays(10)
  const day = await findLesDag(params.dag, params.datum, params.groep)

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
        <Link href="/admin/aanwezigheid" className="text-sm text-gray-500 hover:text-[#a90000]">← Terug naar lessen</Link>
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

  const props = await lesModusProps(day)
  return (
    <div className="space-y-3">
      <Link href="/admin/aanwezigheid" className="inline-block text-sm text-gray-500 hover:text-[#a90000]">← Terug naar lessen</Link>
      {/* key: bij dagwissel (alleen query-param verandert) remount de component; */}
      {/* zonder blijft de lokale state de leden van de vorige dag tonen. */}
      <LesModus key={props.dag.id} {...props} />
    </div>
  )
}
