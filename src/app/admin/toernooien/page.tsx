import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'
import { TOERNOOIEN } from '@/lib/toernooien'
import ToernooienClient from './ToernooienClient'

export const dynamic = 'force-dynamic'

const EXPORT_LABELS: Record<string, string> = {
  'kersttoernooi-shintai-2026': '⬇ Inleverformulier Shintai (xlsx)',
  'pre-tornooi-yoshikwai-2027': '⬇ Inleverformulier Yoshi-Kwai (xlsx)',
}

export default async function AdminToernooienPage() {
  const admin = await isAdmin()
  if (!admin) {
    return <div className="p-8 text-center text-red-600">Geen toegang</div>
  }

  const slugs = Object.keys(TOERNOOIEN)
  const perToernooi = await Promise.all(slugs.map(async slug => {
    const entries = await db.tournamentEntry.findMany({
      where: { toernooi: slug },
      orderBy: [{ leeftijd: 'asc' }, { naam: 'asc' }],
    })
    return { slug, entries }
  }))

  return (
    <div className="space-y-10">
      {perToernooi.map(({ slug, entries }) => {
        const cfg = TOERNOOIEN[slug]
        return (
          <section key={slug} className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-[#2a2a2a]">{cfg.titel}</h1>
                <p className="mt-1 text-sm text-gray-500">{cfg.datum} · {entries.length} inschrijvingen</p>
              </div>
              <a href={`/api/toernooi-inschrijvingen/export?toernooi=${slug}`}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-[#a90000] hover:text-[#a90000]">
                {EXPORT_LABELS[slug] ?? '⬇ Inleverformulier (xlsx)'}
              </a>
            </div>
            <ToernooienClient entries={JSON.parse(JSON.stringify(entries))} slug={slug} cfg={cfg} />
          </section>
        )
      })}
    </div>
  )
}
