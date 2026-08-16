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

  const stats = {
    total: await db.membershipApplication.count(),
    pending: await db.membershipApplication.count({ where: { status: 'PENDING' } }),
    approved: await db.membershipApplication.count({ where: { status: 'APPROVED' } }),
    rejected: await db.membershipApplication.count({ where: { status: 'REJECTED' } }),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#2a2a2a]">Inschrijvingen</h1>
        <p className="mt-1 text-sm text-gray-500">Beheer nieuwe lidmaatschapsaanvragen</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-none border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-2xl font-bold text-[#2a2a2a]">{stats.total}</div>
          <div className="text-xs text-gray-500">Totaal</div>
        </div>
        <div className="rounded-none border border-yellow-200 bg-yellow-50 p-4 shadow-sm">
          <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
          <div className="text-xs text-yellow-600">In afwachting</div>
        </div>
        <div className="rounded-none border border-green-200 bg-green-50 p-4 shadow-sm">
          <div className="text-2xl font-bold text-green-700">{stats.approved}</div>
          <div className="text-xs text-green-600">Goedgekeurd</div>
        </div>
        <div className="rounded-none border border-red-200 bg-red-50 p-4 shadow-sm">
          <div className="text-2xl font-bold text-red-700">{stats.rejected}</div>
          <div className="text-xs text-red-600">Afgewezen</div>
        </div>
      </div>

      {/* Client component for interactivity */}
      <InschrijvingenClient applications={applications} />
    </div>
  )
}
