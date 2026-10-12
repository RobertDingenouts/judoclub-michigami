'use client';

import { useT } from '@/i18n/LangContext';

// Gedeelde actie-notitie voor het inschrijfgeld.
// Ziet zichzelf automatisch af zodra de actie is verlopen (31 december 2026),
// zodat alle plekken op de site vanzelf correct blijven.
const ACTIE_EINDE = new Date('2026-12-31T23:59:59');

export function ActionCostNote({ compact = false }: { compact?: boolean }) {
  const { t } = useT();
  if (new Date() > ACTIE_EINDE) return null;

  return (
    <p
      className={
        compact
          ? 'mt-2 text-xs text-[#27ae60]'
          : 'mt-3 rounded-lg bg-[#eafaf1] border border-[#27ae60]/30 px-3 py-2 text-sm text-[#1e8449]'
      }
    >
      🎁 <strong>{t('Actie:')}</strong> {t('schrijf je vóór')} <strong>{t('31 december 2026')}</strong> {t('in en betaal')}{' '}
      <strong>{t('géén inschrijfgeld van €15')}</strong>.
    </p>
  );
}
