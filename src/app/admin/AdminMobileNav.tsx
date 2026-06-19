'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogoutButton } from '@/components/LogoutButton'

const NAV_LINKS = [
  { href: '/admin', icon: '📊', label: 'Overzicht' },
  { href: '/admin/inschrijvingen', icon: '📝', label: 'Inschrijvingen' },
  { href: '/admin/students', icon: '👥', label: 'Studenten' },
  { href: '/admin/exams', icon: '🎯', label: 'Examens' },
  { href: '/admin/bandoverzicht', icon: '🥋', label: 'Bandoverzicht' },
  { href: '/admin/progress', icon: '📈', label: 'Voortgang' },
  { href: '/admin/diplomas', icon: '🏆', label: 'Diploma\'s' },
  { href: '/diploma/verifieren', icon: '🔍', label: 'Diploma Verifiëren' },
]

export function AdminMobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="rounded-md p-2 text-gray-600 hover:bg-gray-100"
        aria-label="Menu openen"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <div className="flex items-center gap-2">
                <img src="/logo-hd.png" alt="" className="h-7 w-7" />
                <span className="text-sm font-bold">Admin Menu</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Links */}
            <nav className="space-y-1 p-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-[#fdf6f6] text-[#a90000]'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-base">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 p-4">
              <LogoutButton />
              <div className="mt-3 text-center">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="text-xs text-gray-400 hover:text-[#a90000]"
                >
                  ← Terug naar website
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
