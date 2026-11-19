'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogoutButton } from '@/components/LogoutButton'
import { NAV_GROUPS, QUICK_ACTIONS, MOBILE_TABS, isNavActive, type AdminNavItem } from '@/lib/admin-nav'

function SheetLink({ item, pathname, onNav }: { item: AdminNavItem; pathname: string; onNav: () => void }) {
  const active = isNavActive(item, pathname)
  const cls = `flex items-center gap-3 rounded-lg border px-3.5 py-3 text-[13px] font-medium transition-colors ${
    active ? 'border-[#a90000]/30 bg-[#fdf6f6] text-[#a90000]' : 'border-gray-200/80 bg-white text-gray-700 active:bg-gray-50'
  }`
  const inner = (
    <>
      <span className="text-lg leading-none">{item.icon}</span>
      <span className="truncate">{item.label}</span>
      {item.newTab && <span className="ml-auto text-[10px] text-gray-300">↗</span>}
    </>
  )
  return item.newTab
    ? <a href={item.href} target="_blank" rel="noopener" className={cls} onClick={onNav}>{inner}</a>
    : <Link href={item.href} className={cls} onClick={onNav}>{inner}</Link>
}

export function AdminMobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Vaste bottom-tabbar: vier hoofdtabbladen + Meer. Geen zwevende knop
          meer die over de content heen valt. */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/60 bg-white/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-5">
          {MOBILE_TABS.map(tab => {
            const active = isNavActive(tab, pathname)
            return (
              <Link key={tab.href} href={tab.href}
                className={`flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold transition-colors ${
                  active ? 'text-[#a90000]' : 'text-gray-500 active:text-gray-700'
                }`}>
                <span className={`text-lg leading-none ${active ? '' : 'opacity-75'}`}>{tab.icon}</span>
                <span className="truncate px-0.5">{tab.label}</span>
                <span className={`h-0.5 w-6 rounded-full ${active ? 'bg-[#a90000]' : 'bg-transparent'}`} />
              </Link>
            )
          })}
          <button onClick={() => setOpen(true)} aria-label="Meer menu"
            className={`flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold transition-colors ${
              open ? 'text-[#a90000]' : 'text-gray-500 active:text-gray-700'
            }`}>
            <span className="text-lg leading-none opacity-75">☰</span>
            <span>Meer</span>
            <span className="h-0.5 w-6 rounded-full bg-transparent" />
          </button>
        </div>
      </nav>

      {/* Meer-sheet: dezelfde canonieke groepen als de desktop-sidebar */}
      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 mx-auto max-h-[82vh] w-[min(94%,520px)] overflow-y-auto rounded-t-2xl bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-xl backdrop-blur-md">
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-200/80 bg-white/95 p-4 backdrop-blur-md">
              <span className="text-sm font-bold">Menu</span>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100" aria-label="Sluiten">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 p-4">
              <div>
                <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-400">Acties</p>
                <div className="grid grid-cols-3 gap-2">
                  {QUICK_ACTIONS.map(a => (
                    <Link key={a.href} href={a.href} onClick={() => setOpen(false)}
                      className="flex flex-col items-center gap-1 rounded-lg border border-[#a90000]/20 bg-[#fdf6f6] px-2 py-3 text-center text-[11px] font-semibold text-[#a90000] active:scale-[0.98]">
                      <span className="text-lg leading-none">{a.icon}</span>
                      <span className="leading-tight">{a.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {NAV_GROUPS.map((g, gi) => (
                <div key={gi}>
                  {g.title && <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-400">{g.title}</p>}
                  <div className={`grid gap-2 ${g.title ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {g.items.map(item => <SheetLink key={item.href} item={item} pathname={pathname} onNav={() => setOpen(false)} />)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200/80 p-4">
              <LogoutButton />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
