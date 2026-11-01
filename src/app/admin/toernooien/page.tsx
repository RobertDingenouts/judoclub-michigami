import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'
import { TOERNOOIEN } from '@/lib/toernooien'
import ToernooienClient from './ToernooienClient'

export const dynamic = 'force-dynamic'

export default async function AdminToernooienPage() {
  const admin = await isAdmin()
  if (!admin) {
    return <div className="p-8 text-center text-red-600">Geen toegang</div>
  }

  const slug = 'kersttoernooi-shintai-2026'
  const cfg = TOERNOOIEN[slug]
  const entries = await db.tournamentEntry.findMany({
    where: { toernooi: slug },
    orderBy: [{ leeftijd: 'asc' }, { naam: 'asc' }],
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#2a2a2a]">Toernooi-inschrijvingen</h1>
          <p className="mt-1 text-sm text-gray-500">{cfg?.titel} · {cfg?.datum}</p>
        </div>
        <a href={`/api/toernooi-inschrijvingen/export?toernooi=${slug}`}
          className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-[#a90000] hover:text-[#a90000]">
          ⬇ Inleverformulier Shintai (xlsx)
        </a>
      </div>

      <ToernooienClient entries={JSON.parse(JSON.stringify(entries))} slug={slug} cfg={cfg} />
    </div>
  )
}
