'use client'

import { useT } from '@/i18n/LangContext'

export function PrintPriceListButton() {
  const { t } = useT()
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-lg bg-[#a90000] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#8c0000] print:hidden"
    >
      🖨️ <span>{t('Print / PDF')}</span>
    </button>
  )
}
