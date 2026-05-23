import Link from 'next/link'
import { isAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const adminSession = await isAdmin()

  if (!adminSession) {
    redirect('/admin/login')
  }

  return (
    <div className="flex min-h-screen bg-[#f5f5f0]">
      {/* Sidebar */}
      <aside className="hidden w-[260px] flex-col border-r border-gray-200 bg-white lg:flex">
        {/* Header */}
        <div className="border-b border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#a90000]">
              <svg viewBox="0 0 40 40" className="h-6 w-6" fill="none">
                <rect x="2" y="4" width="4" height="32" rx="1" fill="white" />
                <rect x="34" y="4" width="4" height="32" rx="1" fill="white" />
                <rect x="0" y="2" width="40" height="4" rx="2" fill="white" />
                <rect x="4" y="8" width="32" height="3" rx="1" fill="white" />
              </svg>
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
          <AdminLink href="/admin/students" icon="👥" label="Studenten" />
          <AdminLink href="/admin/exams" icon="🎯" label="Examens" />
          <AdminLink href="/admin/progress" icon="📈" label="Voortgang" />
          <AdminLink href="/admin/diplomas" icon="🏆" label="Diploma&apos;s" />
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <form action={async () => { 'use server'; await fetch('/api/auth/logout', { method: 'POST' }); }} className="w-full">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h3.771v7zM15 5H9v7h6V5z" clipRule="evenodd" />
              </svg>
              Uitloggen
            </button>
          </form>
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
          <div className="flex h-8 w-8 items-center justify-center rounded bg-[#a90000]">
            <svg viewBox="0 0 40 40" className="h-5 w-5" fill="none">
              <rect x="2" y="4" width="4" height="32" rx="1" fill="white" />
              <rect x="34" y="4" width="4" height="32" rx="1" fill="white" />
              <rect x="0" y="2" width="40" height="4" rx="2" fill="white" />
            </svg>
          </div>
          <span className="text-sm font-bold">Admin</span>
        </div>
        <Link href="/" className="text-xs text-gray-500 hover:text-[#a90000]">
          ← Website
        </Link>
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
      className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-[#a90000]"
    >
      <span className="text-base">{icon}</span>
      {label}
    </Link>
  )
}
