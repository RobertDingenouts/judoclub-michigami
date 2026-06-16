import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import type { BeltLevel } from '@prisma/client'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function LedenDashboard() {
  const user = await getCurrentUser()

  if (!user) return null

  // Fetch stats
  const [examCount, diplomaCount, courseProgress] = await Promise.all([
    db.examAttempt.count({ where: { userId: user.id } }),
    db.diploma.count({ where: { userId: user.id } }),
    db.courseProgress.findMany({
      where: { userId: user.id },
      orderBy: { beltLevel: 'asc' },
    }),
  ])

  const passedCourses = courseProgress.filter(cp => cp.isPassed).length
  const totalCourses = courseProgress.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#2a2a2a]">
          Welkom, {user.member?.firstName || user.name || 'Lid'}!
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Jouw ledendashboard bij Judoclub Michigami
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Huidige Band"
          value={beltLabel(user.currentBelt)}
          icon="🥋"
          href="/leden/voortgang"
          subtitle={user.currentBelt ? 'Jouw niveau' : 'Nog niet ingesteld'}
        />
        <StatCard
          title="Examens"
          value={examCount}
          icon="🎯"
          href="/leden/voortgang"
          subtitle="Afgelegd"
        />
        <StatCard
          title="Diploma's"
          value={diplomaCount}
          icon="🏆"
          href="/leden/diploma's"
          subtitle="Verkregen"
        />
        <StatCard
          title="Cursus Japans"
          value={`${passedCourses}/${totalCourses}`}
          icon="🇯🇵"
          href="/leden/cursus-japans"
          subtitle="Niveaus gedaan"
        />
      </div>

      {/* Quick actions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-[#2a2a2a]">Snelle Acties</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction href="/leden/voortgang" icon="📈" title="Mijn Voortgang" desc="Examens en banden" />
          <QuickAction href="/leden/diploma's" icon="🏆" title="Mijn Diploma's" desc="Bekijk en download" />
          <QuickAction href="/leden/cursus-japans" icon="🇯🇵" title="Cursus Japans" desc="Leer + quiz" />
          <a href="/#agenda" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:border-[#a90000] hover:bg-[#fdf6f6]">
            <span className="text-xl">📅</span>
            <div>
              <p className="text-sm font-medium text-[#2a2a2a]">Trainingstijden</p>
              <p className="text-xs text-gray-500">Bekijk agenda op website</p>
            </div>
          </a>
        </div>
      </div>

      {/* Course progress */}
      {courseProgress.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#2a2a2a]">Cursus Japans Voortgang</h2>
            <Link href="/leden/cursus-japans" className="text-sm text-[#a90000] hover:underline">
              Bekijk alle →
            </Link>
          </div>
          <div className="space-y-3">
            {courseProgress.slice(0, 3).map((cp) => (
              <div key={cp.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${
                    cp.isPassed ? 'bg-green-100 text-green-700' :
                    cp.isUnlocked ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {cp.isPassed ? '✓' : cp.isUnlocked ? '▶' : '🔒'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#2a2a2a]">
                      {beltLabel(cp.beltLevel)} Band — Japans
                    </p>
                    <p className="text-xs text-gray-500">
                      {cp.lessonsCompleted}/{cp.lessonsTotal} lessen • {cp.wordsLearned}/{cp.wordsTotal} woorden
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    cp.isPassed ? 'bg-green-100 text-green-800' :
                    cp.isUnlocked ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {cp.isPassed ? 'Geslaagd' : cp.isUnlocked ? 'Bezig' : 'Vergrendeld'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ title, value, icon, href, subtitle }: {
  title: string; value: string | number; icon: string; href: string; subtitle: string
}) {
  return (
    <Link href={href} className="group rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-colors hover:border-[#a90000]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-3xl font-bold text-[#2a2a2a]">{value}</p>
          <p className="mt-1 text-xs text-gray-400">{subtitle}</p>
        </div>
        <span className="text-3xl opacity-60">{icon}</span>
      </div>
    </Link>
  )
}

function QuickAction({ href, icon, title, desc }: { href: string; icon: string; title: string; desc: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:border-[#a90000] hover:bg-[#fdf6f6]">
      <span className="text-xl">{icon}</span>
      <div>
        <p className="text-sm font-medium text-[#2a2a2a]">{title}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
    </Link>
  )
}

function beltLabel(belt: BeltLevel | null | undefined): string {
  const labels: Record<string, string> = {
    WIT: 'Wit', GEEL: 'Geel', ORANJE: 'Oranje', GROEN: 'Groen',
    BLAUW: 'Blauw', BRUIN_1: 'Bruin 1', BRUIN_2: 'Bruin 2', BRUIN_3: 'Bruin 3',
    Zwart_1: 'Zwart 1', Zwart_2: 'Zwart 2', Zwart_3: 'Zwart 3',
  }
  return labels[belt || ''] || belt || 'Niet ingesteld'
}
