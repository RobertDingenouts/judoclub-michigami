import { Metadata } from 'next'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { Trophy, Crown, Medal, Flame, TrendingUp, Users, Shield } from 'lucide-react'
import { getBeltLabel } from '@/lib/diploma-generator'

export const metadata: Metadata = {
  title: 'Leaderboard - Judoclub Michigami',
  description: 'Wie heeft deze week het hardest theorie gestudeerd? Bekijk het leaderboard van Judoclub Michigami.',
}

export const dynamic = 'force-dynamic'

const BELT_COLORS: Record<string, string> = {
  WIT: '#FFFFFF', GEEL: '#FFD700', ORANJE: '#FF8C00', GROEN: '#228B22',
  BLAUW: '#0000FF', BRUIN_1: '#8B4513', BRUIN_2: '#8B4513', BRUIN_3: '#8B4513',
  Zwart_1: '#000000', Zwart_2: '#000000', Zwart_3: '#000000',
}

interface LeaderboardEntry {
  rank: number
  id: string
  name: string
  belt: string
  points: number
  isCurrentUser: boolean
}

async function getLeaderboardData(weekOffset: number, limit: number, userId?: string) {
  const now = new Date()
  const currentWeekStart = new Date(now)
  currentWeekStart.setDate(now.getDate() - now.getDay())
  currentWeekStart.setHours(0, 0, 0, 0)

  const weekStart = new Date(currentWeekStart)
  weekStart.setDate(weekStart.getDate() + weekOffset * 7)

  const entries = await db.leaderboardEntry.findMany({
    where: {
      weekStart,
      user: {
        leaderboardOptIn: true,
        is_active: true,
        role: { in: ['MEMBER', 'PARENT', 'INSTRUCTOR'] },
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          currentBelt: true,
          member: { select: { firstName: true, lastName: true } },
        },
      },
    },
    orderBy: { points: 'desc' },
    take: limit,
  })

  let userRank: number | null = null
  let userPoints = 0

  if (userId) {
    const allEntries = await db.leaderboardEntry.findMany({
      where: {
        weekStart,
        user: { leaderboardOptIn: true, is_active: true, role: { in: ['MEMBER', 'PARENT', 'INSTRUCTOR'] } },
      },
      orderBy: { points: 'desc' },
      select: { userId: true, points: true },
    })

    const userIndex = allEntries.findIndex(e => e.userId === userId)
    if (userIndex !== -1) userRank = userIndex + 1

    const userEntry = allEntries.find(e => e.userId === userId)
    userPoints = userEntry?.points || 0
  }

  const totalParticipants = await db.leaderboardEntry.count({
    where: { weekStart, user: { leaderboardOptIn: true, is_active: true } },
  })

  return { weekStart, entries, userRank, userPoints, totalParticipants }
}

function formatWeekLabel(weekStart: Date): string {
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  return `${weekStart.getDate()} ${weekStart.toLocaleString('nl-NL', { month: 'long' })} - ${weekEnd.getDate()} ${weekEnd.toLocaleString('nl-NL', { month: 'long', year: 'numeric' })}`
}

function rankBadge(rank: number) {
  if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />
  if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />
  if (rank === 3) return <Trophy className="w-6 h-6 text-amber-700" />
  if (rank <= 10) return <Flame className="w-5 h-5 text-orange-500" />
  return <span className="w-6 h-6 text-gray-400 text-center font-bold text-xs">{rank}</span>
}

async function getUserProfile() {
  const user = await getCurrentUser()
  if (!user) return null
  return { leaderboardOptIn: user.leaderboardOptIn, weeklyPoints: user.weeklyPoints, totalPoints: user.totalPoints }
}

export default async function LeaderboardPage({ searchParams }: { searchParams: Promise<{ offset?: string }> }) {
  const params = await searchParams
  const weekOffset = parseInt(params.offset || '0', 10)
  const user = await getCurrentUser()

  const { weekStart, entries, userRank, userPoints, totalParticipants } = await getLeaderboardData(weekOffset, 50, user?.id)
  const profile = await getUserProfile()

  const leaderboard: Array<{ rank: number; id: string; name: string; belt: string; points: number; isCurrentUser: boolean }> = entries.map((e, i) => ({
    rank: i + 1,
    id: e.userId,
    name: e.user.member
      ? `${e.user.member.firstName} ${e.user.member.lastName.charAt(0)}.`
      : e.user.name || 'Onbekend',
    belt: e.user.currentBelt || 'WIT',
    points: e.points,
    isCurrentUser: user?.id === e.userId,
  }))

  const weekLabel = formatWeekLabel(weekStart)
  const prevWeekOffset = weekOffset - 1
  const nextWeekOffset = weekOffset + 1
  const canGoNext = weekOffset < 0

  const rankIcons = [Crown, Medal, Trophy, Flame, TrendingUp]

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] text-white py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Leaderboard</h1>
              <p className="text-white/80 mt-1">Wie heeft deze week het hardest theorie gestudeerd?</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/leaderboard?offset=${prevWeekOffset}`} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
                ← Vorige week
              </Link>
              <span className="px-4 py-2 bg-white/10 rounded-lg text-sm font-semibold text-center min-w-[160px]">{formatWeekLabel(weekStart)}</span>
              {canGoNext && (
                <Link href={`/leaderboard?offset=${nextWeekOffset}`} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
                  Volgende week →
                </Link>
              )}
            </div>
          </div>

          {/* User Stats Card */}
          {user && (
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{userPoints}</div>
                  <div className="text-white/70 text-sm">Punten deze week</div>
                </div>
                <div className="text-center border-x border-white/20">
                  <div className="text-3xl font-bold">{userRank ? `#${userRank}` : '—'}</div>
                  <div className="text-white/70 text-sm">Jouw rang</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{profile?.totalPoints || 0}</div>
                  <div className="text-white/70 text-sm">Totaal punten</div>
                </div>
              </div>
              {profile && (
                <div className="mt-4 flex items-center justify-center gap-4">
                  <label className="flex items-center gap-2 text-white/90 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.leaderboardOptIn}
                      onChange={(e) => fetch('/api/user/leaderboard-prefs', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ leaderboardOptIn: e.target.checked }),
                      })}
                      className="w-4 h-4 accent-[#a90000]"
                    />
                    <span>Zichtbaar op leaderboard ({profile.leaderboardOptIn ? 'Aan' : 'Uit'})</span>
                  </label>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Stats bar */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {totalParticipants} deelnemers</span>
              <span className="flex items-center gap-1"><TrendingUp className="w-4 h-4" /> Week {new Date().getDate() - new Date(weekStart).getDate() + 1} van 7</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Punten per actie:</span>
              <span className="px-2 py-1 bg-[#a90000]/10 text-[#a90000] rounded text-xs">Quiz: 10-25p</span>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Video: 2-10p</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Lezen: 1-5p</span>
            </div>
          </div>

          {/* Leaderboard List */}
          <div className="divide-y divide-gray-100">
            {leaderboard.length === 0 ? (
              <div className="text-center py-16">
                <TrendingUp className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Nog geen deelnemers</h3>
                <p className="text-gray-500">Niemand heeft deze week nog punten verdiend.</p>
              </div>
            ) : (
              <>
                {leaderboard.slice(0, 3).map((entry, i) => (
                  <TopThreeEntry key={entry.id} entry={entry} index={i} icon={rankIcons[i]} />
                ))}
                {leaderboard.length > 3 && (
                  <>
                    <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Rest van de top {leaderboard.length}
                    </div>
                    {leaderboard.slice(3).map((entry) => (
                      <LeaderboardRow key={entry.id} entry={entry} />
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Points explanation */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-[#2a2a2a] mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#a90000]" /> Hoe verdien je punten?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <PointItem icon="📖" title="Artikelen lezen" desc="Examendashboard, technieken, cursus Japans" points="1-5 p/min" />
            <PointItem icon="🎥" title="Video's kijken" desc="Techniek video's op examendashboard" points="2-10 p/video" />
            <PointItem icon="🇯🇵" title="Cursus Japans" desc="Flashcards, quizzen, audio oefenen" points="5-50 p/sessie" />
            <PointItem icon="🧠" title="Quizzen maken" desc="Cursus Japans examens (≥80% = bonus)" points="10-25 p/quiz" />
          </div>
          <div className="mt-4 p-3 bg-[#fdf6f6] rounded-xl border border-[#a90000]/20">
            <p className="text-sm text-gray-700">
              <strong>Eerlijkheid:</strong> Punten zijn gecapped per sessie (max 10-50p per actie per sessie) zodat iedereen eerlijk kan meedoen.
              Tijd die je actief besteedt telt meer dan het open laten staan van een pagina.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function TopThreeEntry({ entry, index, icon: Icon }: { entry: any; index: number; icon: React.ComponentType<any> }) {
  const isCurrentUser = entry.isCurrentUser
  const beltColor = entry.belt ? BELT_COLORS[entry.belt] || '#666' : '#666'
  const isWhiteBelt = entry.belt === 'WIT'

  const medals = ['🥇', '🥈', '🥉']
  const bgColors = [
    'bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500',
    'bg-gradient-to-r from-gray-300 via-gray-200 to-gray-400',
    'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600',
  ]

  return (
    <div className={`relative p-4 sm:p-6 ${bgColors[index]} ${isCurrentUser ? 'ring-2 ring-white ring-offset-2 ring-offset-yellow-300' : ''}`}>
      <div className="absolute top-2 right-2 text-3xl">{medals[index]}</div>
      <div className="relative z-10 flex items-center gap-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 flex items-center justify-center text-2xl sm:text-3xl font-bold text-white"
             style={{ backgroundColor: beltColor, borderColor: isWhiteBelt ? 'rgba(0,0,0,0.2)' : 'transparent' }}>
          {entry.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{entry.name}</h3>
            {entry.isCurrentUser && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-semibold">Jij</span>}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{ backgroundColor: beltColor, color: isWhiteBelt ? '#333' : 'white' }}>
              {getBeltLabel(entry.belt)}
            </span>
          </div>
          <div className="text-gray-500 text-sm">Weekse punten: <span className="font-bold text-gray-900">{entry.points}</span></div>
        </div>
      </div>
    </div>
  )
}

function LeaderboardRow({ entry }: { entry: any }) {
  const beltColor = entry.belt ? BELT_COLORS[entry.belt] || '#666' : '#666'
  const isWhiteBelt = entry.belt === 'WIT'

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
      <div className="w-10 text-center font-bold text-gray-400 text-lg">#{entry.rank}</div>
      <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-bold text-white"
           style={{ backgroundColor: beltColor, borderColor: isWhiteBelt ? '#ddd' : 'transparent' }}>
        {entry.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-gray-900 truncate">{entry.name}</h4>
          {entry.isCurrentUser && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-semibold">Jij</span>}
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
          style={{ backgroundColor: beltColor, color: isWhiteBelt ? '#333' : 'white' }}>
        {getBeltLabel(entry.belt)}
      </span>
      </div>
      <div className="text-right">
        <div className="text-lg font-bold text-[#a90000]">{entry.points}</div>
        <div className="text-xs text-gray-500">punten</div>
      </div>
    </div>
  )
}

function PointItem({ icon, title, desc, points }: { icon: string; title: string; desc: string; points: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="text-2xl mb-2">{icon}</div>
      <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
      <p className="text-xs text-gray-500 mb-2">{desc}</p>
      <div className="px-2 py-1 bg-[#a90000]/10 text-[#a90000] rounded text-xs font-semibold w-fit">{points}</div>
    </div>
  )
}