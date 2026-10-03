'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogoutButton } from '@/components/LogoutButton'

const TABS = [
  { href: '/admin', icon: '🏠', label: 'Start' },
  { href: '/admin/leden', icon: '👥', label: 'Leden' },
  { href: '/admin/aanwezigheid', icon: '📅', label: 'Lessen' },
  { href: '/admin/contributie', icon: '💰', label: 'Contributie' },
]

const MEER = [
  { href: '/admin/inschrijvingen', icon: '📝', label: 'Inschrijvingen' },
  { href: '/admin/exams', icon: '🎯', label: 'Examens' },
  { href: '/admin/diplomas', icon: '🏆', label: "Diploma's" },
  { href: '/diploma/verifieren', icon: '🔍', label: 'Diploma verifiëren' },
  { href: '/admin/students', icon: '🗄️', label: 'Oude pagina\'s (verwijderbaar)' },
]

export function AdminMobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  return (
    <>
      {/* Bottom tabbar — compact, half-doorzichtig */}
      <nav className="fixed inset-x-0 bottom-2 z-50 mx-auto grid w-[min(94%,520px)] grid-cols-5 rounded-2xl border border-white/40 bg-white/70 shadow-lg shadow-black/10 backdrop-blur-md pb-[env(safe-area-inset-bottom)] lg:hidden">
        {TABS.map(t => (
          <Link
            key={t.href}
            href={t.href}
            className={`flex flex-col items-center gap-0.5 py-1.5 text-[10px] font-medium transition-colors ${
              isActive(t.href) ? 'text-[#a90000]' : 'text-gray-500'
            }`}
          >
            <span className={`flex h-7 w-7 items-center justify-center rounded-xl text-base leading-none transition-colors ${isActive(t.href) ? 'bg-[#a90000]/10' : ''}`}>{t.icon}</span>
            {t.label}
          </Link>
        ))}
        <button
          onClick={() => setOpen(true)}
          className="flex flex-col items-center gap-0.5 py-1.5 text-[10px] font-medium text-gray-500"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-xl text-base leading-none">☰</span>
          Meer
        </button>
      </nav>

      {/* Meer-drawer */}
      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 mx-auto w-[min(94%,520px)] rounded-t-2xl bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <span className="text-sm font-bold">Meer</span>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100" aria-label="Sluiten">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="grid grid-cols-2 gap-2 p-4">
              {MEER.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 text-sm font-medium ${
                    isActive(link.href) ? 'border-[#a90000]/30 bg-[#fdf6f6] text-[#a90000]' : 'border-gray-200 text-gray-700'
                  }`}
                >
                  <span className="text-lg">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-gray-200 p-4">
              <LogoutButton />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
