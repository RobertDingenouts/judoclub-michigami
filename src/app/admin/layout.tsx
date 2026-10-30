import Link from 'next/link'
import { SeasonalLogo } from '@/components/SeasonalLogo'
import { isAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/LogoutButton'
import { AdminMobileNav } from './AdminMobileNav'

export const dynamic = 'force-dynamic'

const NAV = [
  { href: '/admin', icon: '🏠', label: 'Start' },
  { href: '/admin/leden', icon: '👥', label: 'Leden' },
  { href: '/admin/aanwezigheid', icon: '📅', label: 'Lessen' },
  { href: '/admin/contributie', icon: '💰', label: 'Contributie' },
  { href: '/admin/materiaal', icon: '📦', label: 'Materiaal' },
]

const EXTRA = [
  { href: '/admin/inschrijvingen', icon: '📝', label: 'Inschrijvingen' },
  { href: '/admin/exams', icon: '🎯', label: 'Examens' },
  { href: '/admin/poelen', icon: '🥋', label: 'Poelen' },
  { href: '/admin/diplomas', icon: '🏆', label: "Diploma's" },
  { href: '/diploma/verifieren', icon: '🔍', label: 'Diploma verifiëren' },
  { href: '/leden/prijslijst', icon: '🏷️', label: 'Prijslijst (print)' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const adminSession = await isAdmin()

  if (!adminSession) {
    redirect('/admin-login')
  }

  return (
    <>
      {/* Diepe, zachte achtergrond: de glas-effecten leven hiervan. Eén vaste
          gradient op de layout — niet per element — voor de snelheid. */}
      <div className="fixed inset-0 -z-10 bg-[#f3ede3] [background-image:radial-gradient(46rem_30rem_at_82%_-6%,rgba(169,0,0,0.16),transparent),radial-gradient(40rem_28rem_at_-6%_104%,rgba(196,148,60,0.20),transparent),radial-gradient(30rem_22rem_at_40%_18%,rgba(255,214,120,0.28),transparent),radial-gradient(26rem_20rem_at_62%_68%,rgba(169,0,0,0.08),transparent),radial-gradient(34rem_26rem_at_18%_46%,rgba(255,255,255,0.9),transparent)]" />
      <div className="flex min-h-screen">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-[240px] shrink-0 flex-col border-r border-white/60 bg-white/70 backdrop-blur-xl lg:flex lg:sticky lg:top-0 lg:h-screen">
        <div className="border-b border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fdf6f6]">
              <SeasonalLogo className="h-8 w-8 object-contain" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-[#2a2a2a]">Michigami</h1>
              <p className="text-xs text-gray-500">Clubdashboard</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV.map(n => <AdminLink key={n.href} {...n} />)}
          <div className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Meer</div>
          {EXTRA.map(n => <AdminLink key={n.href} {...n} />)}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <LogoutButton />
          <div className="mt-3 text-center">
            <Link href="/" className="text-xs text-gray-400 hover:text-[#a90000]">← Terug naar website</Link>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-white/60 bg-white/70 p-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fdf6f6]">
            <SeasonalLogo className="h-7 w-7 object-contain" />
          </div>
          <span className="text-sm font-bold">Clubdashboard</span>
        </div>
        <Link href="/" className="text-xs text-gray-500 hover:text-[#a90000]">Website</Link>
      </div>

      {/* Main content — volledige schermbreedte op grote schermen */}
      <main className="min-h-screen flex-1 pt-14 pb-24 lg:pt-0 lg:pb-0">
        <div className="w-full p-3 lg:p-5 2xl:p-6">
          {children}
        </div>
      </main>

      {/* Mobile bottom tabbar */}
      <AdminMobileNav />
    </div>
    </>
  )
}

function AdminLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-[#a90000]"
    >
      <span className="text-base">{icon}</span>
      {label}
    </Link>
  )
}
