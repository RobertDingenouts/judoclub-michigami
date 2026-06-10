import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DiplomasPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const diplomas = await db.diploma.findMany({
    where: { userId: user.id },
    orderBy: { awardedAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2a2a2a]">Mijn Diploma&apos;s</h1>
        <p className="text-sm text-gray-500 mt-1">Jouw verkregen diploma&apos;s en certificaten</p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {diplomas.length > 0 ? (
          <div className="space-y-4">
            {diplomas.map((diploma) => (
              <div key={diploma.id} className="rounded-lg border border-gray-100 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-[#2a2a2a]">{diploma.title}</h3>
                    {diploma.description && (
                      <p className="mt-1 text-sm text-gray-500">{diploma.description}</p>
                    )}
                    <p className="mt-2 text-xs text-gray-400">
                      Uitgereikt: {new Date(diploma.awardedAt).toLocaleDateString('nl-NL')}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      diploma.type === 'BELT_EXAM' ? 'bg-red-100 text-red-800' :
                      diploma.type === 'COURSE_JAPANESE' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {diploma.type === 'BELT_EXAM' ? 'Band Examen' :
                       diploma.type === 'COURSE_JAPANESE' ? 'Cursus Japans' : 'Bijzonderheid'}
                    </span>
                    <Link
                      href={`/api/diplomas/download?id=${diploma.id}`}
                      className="text-xs text-[#a90000] hover:underline"
                    >
                      Download PDF ↓
                    </Link>
                  </div>
                </div>
                <div className="mt-3 rounded bg-gray-50 px-3 py-2">
                  <p className="text-xs text-gray-500">Verificatiecode:</p>
                  <p className="font-mono text-sm text-gray-700">{diploma.verificationCode}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-gray-400 py-8">Nog geen diploma&apos;s verkregen</p>
        )}
      </div>
    </div>
  )
}
