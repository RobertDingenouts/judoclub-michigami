'use client';

import Link from 'next/link';
import { useT } from '@/i18n/LangContext';

export function LedenHeader() {
  const { t } = useT();
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white p-3 lg:hidden print:hidden">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fdf6f6]">
          <img src="/logo-hd.png" alt="Michigami" className="h-7 w-7 object-contain" />
        </div>
        <span className="text-sm font-bold">{t('Leden')}</span>
      </div>
      <Link href="/" className="text-xs text-gray-500 hover:text-[#a90000]">
        ← {t('Website')}
      </Link>
    </div>
  );
}
