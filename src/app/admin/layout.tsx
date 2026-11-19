import Link from 'next/link'
import { SeasonalLogo } from '@/components/SeasonalLogo'
import { isAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminMobileNav } from './AdminMobileNav'
import { AdminSidebar } from './AdminSidebar'

export const dynamic = 'force-dynamic'

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
        {/* Sidebar (desktop) — canonieke nav uit @/lib/admin-nav */}
        <AdminSidebar />

        {/* Mobile header */}
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-white/60 bg-white/70 p-3 backdrop-blur-xl lg:hidden">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fdf6f6]">
              <SeasonalLogo className="h-7 w-7 object-contain" />
            </div>
            <span className="text-sm font-bold">Clubdashboard</span>
          </Link>
          <Link href="/" className="text-xs text-gray-500 hover:text-[#a90000]">Website</Link>
        </div>

        {/* Main content — volledige schermbreedte op grote schermen */}
        <main className="min-h-screen flex-1 pt-14 pb-24 lg:pt-0 lg:pb-0">
          <div className="w-full p-3 lg:p-5 2xl:p-6">
            {children}
          </div>
        </main>

        {/* Mobile bottom tabbar + Meer-sheet */}
        <AdminMobileNav />
      </div>
    </>
  )
}
