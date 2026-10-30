'use client';

import Link from 'next/link';
import { SeasonalLogo } from '@/components/SeasonalLogo';
import { LogoutButton } from '@/components/LogoutButton';
import { LangToggle } from '@/components/LangToggle';
import { useT } from '@/i18n/LangContext';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/leden', icon: '📊', label: 'Overzicht' },
  { href: '/leden/voortgang', icon: '📈', label: 'Voortgang' },
  { href: "/leden/diploma's", icon: '🏆', label: "Diploma's" },
  { href: '/leden/cursus-japans', icon: '🇯🇵', label: 'Cursus Japans' },
  { href: '/leden/prijslijst', icon: '🛒', label: 'Materiaal & Prijzen' },
  { href: '/leden/profiel/bewerken', icon: '👤', label: 'Profiel' },
];

export function LedenSidebarNav() {
  const { t } = useT();
  const pathname = usePathname();
  const onDashboard = pathname === '/leden' || pathname === '/leden/';
  return (
    <>
      <div className="border-b border-gray-200 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fdf6f6]">
            <SeasonalLogo className="h-8 w-8 object-contain" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#2a2a2a]">{t('Michigami Leden')}</h1>
            <p className="text-xs text-gray-500">{t('Ledendashboard')}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-[#a90000]"
          >
            <span className="text-base">{item.icon}</span>
            {t(item.label)}
          </Link>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <LogoutButton />
        <div className="mt-3 flex justify-center">
          <LangToggle />
        </div>
        <div className="mt-3 text-center">
          {!onDashboard && (
            <Link href="/leden" className="text-xs text-gray-500 hover:text-[#a90000]">
              ← {t('Leden Dashboard')}
            </Link>
          )}
          <Link href="/" className="text-xs text-gray-400 hover:text-[#a90000]">
            {t('Naar website')}
          </Link>
        </div>
      </div>
    </>
  );
}
