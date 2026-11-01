import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'
import InschrijvingenClient from './InschrijvingenClient'

export const dynamic = 'force-dynamic'

export default async function AdminInschrijvingenPage() {
  const admin = await isAdmin()
  if (!admin) {
    return <div className="p-8 text-center text-red-600">Geen toegang</div>
  }

  const applications = await db.membershipApplication.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#2a2a2a]">Inschrijvingen</h1>
          <p className="mt-1 text-sm text-gray-500">Beheer nieuwe lidmaatschapsaanvragen</p>
        </div>
        <a href="/api/admin2/export?lijst=inschrijvingen"
          className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-[#a90000] hover:text-[#a90000]">⬇ Excel</a>
      </div>

      {/* Client component: filter-blokjes + lijst + acties. Start met ALLE inschrijvingen. */}
      <InschrijvingenClient applications={applications} />
    </div>
  )
}
