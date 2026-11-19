'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_GROUPS, QUICK_ACTIONS, isNavActive, type AdminNavItem } from '@/lib/admin-nav'
import { SeasonalLogo } from '@/components/SeasonalLogo'
import { LogoutButton } from '@/components/LogoutButton'

function SideLink({ item, pathname }: { item: AdminNavItem; pathname: string }) {
  const active = isNavActive(item, pathname)
  const cls = `group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
    active
      ? 'bg-[#a90000]/[0.08] text-[#a90000] shadow-[inset_2px_0_0_#a90000]'
      : 'text-gray-600 hover:bg-gray-900/[0.04] hover:text-[#a90000]'
  }`
  const inner = (
    <>
      <span className={`text-base leading-none ${active ? '' : 'opacity-80 group-hover:opacity-100'}`}>{item.icon}</span>
      <span className="truncate">{item.label}</span>
      {item.newTab && <span className="ml-auto text-[10px] text-gray-300 group-hover:text-gray-400">↗</span>}
    </>
  )
  return item.newTab
    ? <a href={item.href} target="_blank" rel="noopener" className={cls}>{inner}</a>
    : <Link href={item.href} className={cls}>{inner}</Link>
}

export function AdminSidebar() {
  const pathname = usePathname()
  return (
    <aside className="hidden w-[240px] shrink-0 flex-col border-r border-white/60 bg-white/70 backdrop-blur-xl lg:flex lg:sticky lg:top-0 lg:h-screen">
      <div className="border-b border-gray-900/[0.06] p-5">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fdf6f6]">
            <SeasonalLogo className="h-8 w-8 object-contain" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#2a2a2a]">Michigami</h1>
            <p className="text-xs text-gray-500">Clubdashboard</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {NAV_GROUPS.map((g, gi) => (
          <div key={gi} className={gi > 0 ? 'pt-3' : ''}>
            {g.title && (
              <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-400">{g.title}</div>
            )}
            {g.items.map(item => <SideLink key={item.href} item={item} pathname={pathname} />)}
          </div>
        ))}

        <div className="pt-3">
          <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-400">Acties</div>
          {QUICK_ACTIONS.map(a => (
            <Link key={a.href} href={a.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-gray-600 transition-colors hover:bg-gray-900/[0.04] hover:text-[#a90000]">
              <span className="text-base leading-none opacity-80">{a.icon}</span>
              <span className="truncate">{a.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="border-t border-gray-900/[0.06] p-4">
        <LogoutButton />
        <div className="mt-3 text-center">
          <Link href="/" className="text-xs text-gray-400 hover:text-[#a90000]">← Terug naar website</Link>
        </div>
      </div>
    </aside>
  )
}
