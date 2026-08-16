import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { beltColors } from '@/data/japanese-course'

export const dynamic = 'force-dynamic'

// Map Prisma BeltLevel enum to Japanese course level numbers (0-5)
const BELT_TO_LEVEL: Record<string, number> = {
  WIT: 0,
  GEEL: 1,
  ORANJE: 2,
  GROEN: 3,
  BLAUW: 4,
  BRUIN: 5,
}
const BELT_ORDER = ['WIT', 'GEEL', 'ORANJE', 'GROEN', 'BLAUW', 'BRUIN'] as const

export default async function CursusJapansPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const member = user.member
  if (!member) return null

  // Fetch or initialize course progress for all belt levels
  const existing = await db.courseProgress.findMany({
    where: {
      userId: user.id,
      courseName: 'japanese',
    },
  })

  const existingBelts = new Set(existing.map((cp) => cp.beltLevel))

  // Create missing belt levels
  for (const belt of BELT_ORDER) {
    if (!existingBelts.has(belt)) {
      const beltIndex = BELT_ORDER.indexOf(belt)
      const prevPassed =
        beltIndex === 0
          ? true
          : existing.some(
              (cp) => cp.beltLevel === BELT_ORDER[beltIndex - 1] && cp.isPassed
            )

      await db.courseProgress.create({
        data: {
          userId: user.id,
          memberId: member.id,
          courseName: 'japanese',
          beltLevel: belt as any,
          lessonsCompleted: 0,
          lessonsTotal: 1,
          overallScore: 0,
          isPassed: false,
          isUnlocked: prevPassed,
          wordsLearned: 0,
          wordsTotal: 0,
          wordsQuizScore: 0,
        },
      })
    }
  }

  // Fetch all progress + diplomas
  const progress = await db.courseProgress.findMany({
    where: {
      userId: user.id,
      courseName: 'japanese',
    },
    orderBy: { beltLevel: 'asc' },
  })

  const diplomas = await db.diploma.findMany({
    where: {
      userId: user.id,
      type: 'COURSE_JAPANESE',
    },
    orderBy: { awardedAt: 'desc' },
    select: {
      id: true,
      title: true,
      beltLevel: true,
      verificationCode: true,
      awardedAt: true,
    },
  })

  const diplomaBelts = new Set(diplomas.map((d) => d.beltLevel))

  const passedCount = progress.filter((p) => p.isPassed).length
  const totalBelts = BELT_ORDER.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] rounded-none p-4 sm:p-5 md:p-6 text-white shadow-lg relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Cursus Japans</h1>
            <p className="text-white/80 mt-1 text-sm">
              Jouw voortgang per bandniveau
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{passedCount}</div>
            <div className="text-xs text-white/70">van {totalBelts} banden</div>
          </div>
        </div>
        {/* Overall progress bar */}
        <div className="mt-4 w-full h-3 bg-white/20 rounded-none overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-none transition-all duration-1000"
            style={{ width: `${(passedCount / totalBelts) * 100}%` }}
          />
        </div>
      </div>

      {/* Belt levels */}
      <div className="space-y-3">
        {BELT_ORDER.map((belt, index) => {
          const course = progress.find((p) => p.beltLevel === belt)
          const levelNum = BELT_TO_LEVEL[belt]
          const colors = beltColors[levelNum]
          const hasDiploma = diplomaBelts.has(belt)

          return (
            <div
              key={belt}
              className={`rounded-none border-2 overflow-hidden transition-all ${
                course?.isPassed
                  ? 'border-green-200 bg-green-50/50'
                  : course?.isUnlocked
                  ? 'border-gray-200 bg-white hover:shadow-md'
                  : 'border-gray-100 bg-gray-50 opacity-60'
              }`}
            >
              <div className="p-4 sm:p-5">
                <div className="flex items-center gap-4">
                  {/* Belt color circle */}
                  <div
                    className="w-14 h-14 rounded-none flex items-center justify-center text-lg font-bold shadow-inner flex-shrink-0 border-2"
                    style={{
                      backgroundColor: colors.bg,
                      color: colors.text,
                      borderColor: colors.border,
                    }}
                  >
                    {course?.isPassed ? (
                      <span className="text-green-600 text-xl">✓</span>
                    ) : course?.isUnlocked ? (
                      <span>{levelNum + 1}</span>
                    ) : (
                      <span className="text-gray-400">🔒</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-[#2a2a2a] text-base sm:text-lg">
                        {colors.label} band
                      </h3>
                      {course?.isPassed && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-xs font-bold bg-green-100 text-green-700">
                          ✓ Geslaagd
                        </span>
                      )}
                      {hasDiploma && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-xs font-bold bg-yellow-100 text-yellow-700">
                          🎓 Diploma
                        </span>
                      )}
                      {!course?.isUnlocked && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-xs font-medium bg-gray-100 text-gray-500">
                          🔒 Vergrendeld
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {course?.wordsLearned ?? 0}/{course?.wordsTotal ?? 0} woorden geleerd
                      {((course?.overallScore ?? 0) > 0) && (
                        <span className="ml-2 font-semibold text-[#a90000]">
                          · {(course?.overallScore ?? 0).toFixed(0)}% score
                        </span>
                      )}
                    </p>
                    {/* Progress bar */}
                    {course && (
                      <div className="mt-2 w-full h-2 rounded-none bg-gray-100 overflow-hidden">
                        <div
                          className={`h-full rounded-none transition-all ${
                            course.isPassed ? 'bg-green-500' : 'bg-[#a90000]'
                          }`}
                          style={{
                            width: `${
                              course.wordsTotal > 0
                                ? (course.wordsLearned / course.wordsTotal) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  {course?.isUnlocked && !course.isPassed && (
                    <a
                      href="/#cursus-japans"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-[#a90000] hover:bg-[#8c0000] text-white text-sm font-semibold rounded-none transition-colors shadow-sm whitespace-nowrap inline-block"
                    >
                      Start examen →
                    </a>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Diplomas section */}
      {diplomas.length > 0 && (
        <div className="rounded-none border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-[#2a2a2a] text-lg mb-3 flex items-center gap-2">
            🎓 Jouw diploma&apos;s
          </h2>
          <div className="space-y-2">
            {diplomas.map((diploma) => {
              const level = BELT_TO_LEVEL[diploma.beltLevel || '']
              const colors = beltColors[level]
              return (
                <div
                  key={diploma.id}
                  className="flex items-center gap-3 p-3 rounded-none bg-gray-50 border border-gray-100"
                >
                  <div
                    className="w-8 h-8 rounded-none flex items-center justify-center text-xs font-bold border"
                    style={{
                      backgroundColor: colors?.bg || '#f0f0f0',
                      color: colors?.text || '#666',
                      borderColor: colors?.border || '#e0e0e0',
                    }}
                  >
                    🎓
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-[#2a2a2a] truncate">
                      {diploma.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(diploma.awardedAt).toLocaleDateString('nl-NL', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                      {' · '}
                      <code className="bg-gray-100 px-1 rounded text-[10px]">
                        {diploma.verificationCode}
                      </code>
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="bg-[#fdf6f6] rounded-none p-4 border border-[#e8eaed]">
        <p className="text-sm text-gray-600 leading-relaxed">
          <strong>Hoe werkt het?</strong> — Ga naar de Cursus Japans sectie op de homepage,
          leer de termen met flashcards en doe het examen (min. 80% nodig).
          Haal je een band? Dan krijg je automatisch een digitaal diploma 🎓
          en ontgrendel je de volgende band!
        </p>
      </div>
    </div>
  )
}
