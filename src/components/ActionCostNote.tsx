'use client';

// Gedeelde actie-notitie voor het inschrijfgeld.
// Ziet zichzelf automatisch af zodra de actie is verlopen (1 oktober 2026),
// zodat alle plekken op de site vanzelf correct blijven.
const ACTIE_EINDE = new Date('2026-10-01T23:59:59');

export function ActionCostNote({ compact = false }: { compact?: boolean }) {
  if (new Date() > ACTIE_EINDE) return null;

  return (
    <p
      className={
        compact
          ? 'mt-2 text-xs text-[#27ae60]'
          : 'mt-3 rounded-lg bg-[#eafaf1] border border-[#27ae60]/30 px-3 py-2 text-sm text-[#1e8449]'
      }
    >
      🎁 <strong>Actie:</strong> schrijf je vóór <strong>1 oktober 2026</strong> in en betaal{' '}
      <strong>géén inschrijfgeld van €15</strong>.
    </p>
  );
}
