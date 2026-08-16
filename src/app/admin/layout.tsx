import Link from 'next/link'
import { isAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/LogoutButton'
import { AdminMobileNav } from './AdminMobileNav'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const adminSession = await isAdmin()

  if (!adminSession) {
    redirect('/admin-login')
  }

  return (
    <div className="flex min-h-screen bg-[#f5f5f0]">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-[260px] flex-col border-r border-gray-200 bg-white lg:flex">
        {/* Header */}
        <div className="border-b border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fdf6f6]">
              <img src="/logo-hd.png" alt="Michigami" className="h-8 w-8 object-contain" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-[#2a2a2a]">Michigami Admin</h1>
              <p className="text-xs text-gray-500">Beheerdashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          <AdminLink href="/admin" icon="📊" label="Overzicht" />
          <AdminLink href="/admin/inschrijvingen" icon="📝" label="Inschrijvingen" />
          <AdminLink href="/admin/students" icon="👥" label="Studenten" />
          <AdminLink href="/admin/exams" icon="🎯" label="Examens" />
          <AdminLink href="/admin/bandoverzicht" icon="🥋" label="Bandoverzicht" />
          <AdminLink href="/admin/progress" icon="📈" label="Voortgang" />
          <AdminLink href="/admin/diplomas" icon="🏆" label="Diploma's" />
          <AdminLink href="/diploma/verifieren" icon="🔍" label="Diploma Verifiëren" />
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <LogoutButton />
          <div className="mt-3 text-center">
            <Link href="/" className="text-xs text-gray-400 hover:text-[#a90000]">
              ← Terug naar website
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white p-3 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fdf6f6]">
            <img src="/logo-hd.png" alt="Michigami" className="h-7 w-7 object-contain" />
          </div>
          <span className="text-sm font-bold">Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="text-xs text-gray-500 hover:text-[#a90000]">
            ← Website
          </Link>
          <AdminMobileNav />
        </div>
      </div>

      {/* Main content */}
      <main className="min-h-screen flex-1 pt-14 lg:pt-0">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
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