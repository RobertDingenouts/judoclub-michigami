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
              <div key={diploma.id} className="rounded-lg border border-gray-100 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-[#2a2a2a]">
                        {diploma.type === 'COURSE_JAPANESE' && '🇯🇵 '}
                        {diploma.title}
                      </h3>
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        diploma.type === 'BELT_EXAM' ? 'bg-red-100 text-red-800' :
                        diploma.type === 'COURSE_JAPANESE' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {diploma.type === 'BELT_EXAM' ? '🥋 Band Examen' :
                         diploma.type === 'COURSE_JAPANESE' ? '🎓 Cursus Japans' : '⭐ Bijzonderheid'}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-gray-400 flex items-center gap-3">
                      <span>📅 {new Date(diploma.awardedAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{diploma.verificationCode}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <a
                      href={`/api/diplomas/download?id=${diploma.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#a90000] transition-colors"
                    >
                      👁 Bekijken
                    </a>
                    <a
                      href={`/api/diplomas/download?id=${diploma.id}`}
                      download
                      className="inline-flex items-center gap-1 text-xs text-[#a90000] hover:underline font-medium"
                    >
                      ⬇ Download PDF
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-4xl mb-3">🏆</p>
            <p className="text-sm text-gray-400">Nog geen diploma&apos;s verkregen</p>
            <p className="text-xs text-gray-300 mt-1">Haal je eerste examen of voltooi de Cursus Japans!</p>
          </div>
        )}
      </div>
    </div>
  )
}
