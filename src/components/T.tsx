'use client';

import { useT } from '@/i18n/LangContext';

// Vertaalcomponent voor server-components (ledenpagina's):
// <T k="Welkom" /> -> haalt de actieve taal op uit de LangProviderShell.
export function T({ k }: { k: string }) {
  const { t } = useT();
  return <>{t(k)}</>;
}
