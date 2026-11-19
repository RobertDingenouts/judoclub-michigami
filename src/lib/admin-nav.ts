// ═══════════════════════════════════════════════════════════════════════════
// Eén canonieke navigatie voor het hele admin-dashboard.
// Sidebar (desktop), bottom-tabbar + Meer-sheet (mobiel) en de "Snel naar"-
// widget op Start lezen ALLEMAAL deze config — dezelfde namen, dezelfde
// iconen, dezelfde groepen. Wijzig je hier iets, dan overal.
// ═══════════════════════════════════════════════════════════════════════════

export type AdminNavItem = {
  href: string
  icon: string
  label: string
  /**_extra pad-prefixen die deze nav-item actief maken (bijv. lid-detail onder Leden) */
  match?: string[]
  /** opent in een nieuw tabblad (print-routes) */
  newTab?: boolean
}

export type AdminNavGroup = { title: string | null; items: AdminNavItem[] }

export const NAV_GROUPS: AdminNavGroup[] = [
  {
    title: null,
    items: [{ href: '/admin', icon: '🏠', label: 'Start', match: ['/admin'] }],
  },
  {
    title: 'Leden',
    items: [
      { href: '/admin/leden', icon: '👥', label: 'Leden', match: ['/admin/leden', '/admin/students'] },
      { href: '/admin/inschrijvingen', icon: '📝', label: 'Inschrijvingen' },
    ],
  },
  {
    title: 'Training',
    items: [
      { href: '/admin/aanwezigheid', icon: '📅', label: 'Lessen' },
      { href: '/admin/exams', icon: '🎯', label: 'Examens' },
      { href: '/admin/poelen', icon: '🥋', label: 'Poelen' },
      { href: '/admin/toernooien', icon: '🏆', label: 'Toernooien' },
      { href: '/admin/diplomas', icon: '🎓', label: "Diploma's" },
    ],
  },
  {
    title: 'Clubzaken',
    items: [
      { href: '/admin/contributie', icon: '💶', label: 'Contributie' },
      { href: '/admin/materiaal', icon: '📦', label: 'Materiaal' },
      { href: '/leden/prijslijst', icon: '🏷️', label: 'Prijslijst', newTab: true },
    ],
  },
  {
    title: 'Tools',
    items: [
      { href: '/diploma/verifieren', icon: '🔍', label: 'Verifiëren' },
      { href: '/print/ledeninfo', icon: '📄', label: 'Ledeninfo', newTab: true },
    ],
  },
]

/** Snelle acties — géén pagina's maar directe taken. Overal dezelfde set. */
export const QUICK_ACTIONS: AdminNavItem[] = [
  { href: '/admin/aanwezigheid/les', icon: '✏️', label: 'Les invullen' },
  { href: '/admin/students/new', icon: '➕', label: 'Nieuw lid' },
  { href: '/admin/exams/new', icon: '🗓️', label: 'Examen plannen' },
]

/** Vaste tabs onderaan het mobiele scherm (de rest zit in de Meer-sheet). */
export const MOBILE_TABS: AdminNavItem[] = [
  NAV_GROUPS[0].items[0], // Start
  NAV_GROUPS[1].items[0], // Leden
  NAV_GROUPS[2].items[0], // Lessen
  NAV_GROUPS[3].items[0], // Contributie
]

export function isNavActive(item: AdminNavItem, pathname: string): boolean {
  const prefixes = item.match ?? [item.href]
  return prefixes.some(p =>
    p === '/admin' ? pathname === '/admin' : pathname === p || pathname.startsWith(p + '/'))
}
