'use client';

import { LangProvider } from '@/i18n/LangContext';

// Wrapt het leden-dashboard (server layout) met de taalcontext,
// zodat client-componenten daaronder useT() kunnen gebruiken.
export function LangProviderShell({ children }: { children: React.ReactNode }) {
  return <LangProvider>{children}</LangProvider>;
}
