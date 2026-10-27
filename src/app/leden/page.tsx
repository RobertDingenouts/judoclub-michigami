import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import type { BeltLevel } from '@prisma/client'
import { BELT_LABELS_NL } from '@/lib/student-progress-types'
import Link from 'next/link'
import { T } from '@/components/T'

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
          <T k="Welkom" />, {user.member?.firstName || user.name || 'Lid'}!
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          <T k="Jouw ledendashboard bij Judoclub Michigami" />
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Huidige Band"
          value={BELT_LABELS_NL[user.currentBelt as BeltLevel] || 'Niet ingesteld'}
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

      {/* Snel naartoe — alleen bestemmingen die niet al als kaart boven staan */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-[#2a2a2a]"><T k="Snel naartoe" /></h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <QuickAction href="/leden/prijslijst" icon="🛒" title="Materiaal & Prijzen" desc="Judopak en band" />
          <a href="/#agenda" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:border-[#a90000] hover:bg-[#fdf6f6]">
            <span className="text-xl">📅</span>
            <div>
              <p className="text-sm font-medium text-[#2a2a2a]"><T k="Trainingstijden" /></p>
              <p className="text-xs text-gray-500"><T k="Bekijk agenda op website" /></p>
            </div>
          </a>
          <QuickAction href="/leden/profiel/bewerken" icon="👤" title="Mijn Profiel" desc="Gegevens en gezin" />
        </div>
      </div>

      {/* Course progress */}
      {courseProgress.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#2a2a2a]"><T k="Cursus Japans Voortgang" /></h2>
            <Link href="/leden/cursus-japans" className="text-sm text-[#a90000] hover:underline">
              <T k="Bekijk alle →" />
            </Link>
          </div>
          <div className="space-y-3">
            {courseProgress.slice(0, 3).map((cp) => (
              <div key={cp.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg ${
                    cp.isPassed ? 'bg-green-100 text-green-700' :
                    cp.isUnlocked ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {cp.isPassed ? '✓' : cp.isUnlocked ? '▶' : '🔒'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#2a2a2a]">
                      {BELT_LABELS_NL[cp.beltLevel as BeltLevel] || cp.beltLevel} — Japans
                    </p>
                    <p className="text-xs text-gray-500">
                      {cp.lessonsCompleted}/{cp.lessonsTotal} <T k="lessen" /> • {cp.wordsLearned}/{cp.wordsTotal} <T k="woorden" />
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex rounded-lg px-2.5 py-0.5 text-xs font-medium ${
                    cp.isPassed ? 'bg-green-100 text-green-800' :
                    cp.isUnlocked ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {cp.isPassed ? <T k="Geslaagd" /> : cp.isUnlocked ? <T k="Bezig" /> : <T k="Vergrendeld" />}
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
          <p className="text-sm font-medium text-gray-500"><T k={title} /></p>
          <p className="mt-1 text-3xl font-bold text-[#2a2a2a]">{typeof value === "number" ? value : <T k={value} />}</p>
          <p className="mt-1 text-xs text-gray-400"><T k={subtitle} /></p>
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
        <p className="text-sm font-medium text-[#2a2a2a]"><T k={title} /></p>
        <p className="text-xs text-gray-500"><T k={desc} /></p>
      </div>
    </Link>
  )
}

// beltLabel removed — uses BELT_LABELS_NL from student-progress-types
