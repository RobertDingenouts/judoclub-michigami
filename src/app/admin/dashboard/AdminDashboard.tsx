'use client'

// ═══════════════════════════════════════════════════════════════════════════
// Startscherm — één dashboard, alles inline bewerkbaar.
// Elke clubfunctie is een widget: sleepbaar, schaalbaar, sluitbaar en per
// schermformaat onthouden in localStorage. Alle data komt in één server-fetch
// (DashData), dus je hoeft niet tussen bladen te navigeren om iets te doen.
// ═══════════════════════════════════════════════════════════════════════════
import * as React from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout'
import type { LayoutItem, ResponsiveLayouts } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { GROEP_LABEL, STATUS_INFO, PAYMENT_INFO, groepNaam } from '@/lib/admin2'
import { usePropSync } from '@/lib/use-prop-sync'
import { getBeltLabel } from '@/lib/belt-utils'
import { BELT_COLORS } from '@/lib/student-progress-types'
import type { BeltLevel } from '@prisma/client'

export type LedenRow = {
  id: string; naam: string; groep: string; clubStatus: string; belt: string | null
  dob: string | null; betaling: string; paymentId: string | null
  bedrag: number | null
  lidSinds: string | null
  bondsnummer: string | null
  laatsteBand: string | null      // datum laatste band
  laatsteExamen: string | null    // datum laatste examen
  laatsteExamenStatus: string | null
  volgendeBand: string | null
  volgendeBandSlip: boolean
  cursusJapans: boolean
}

export type AanwLid = LedenRow

export type DashData = {
  nowIso: string
  kwLabel: string
  periodes: string[]
  tiles: {
    actieveLeden: number
    contributieOpen: number; contributieSom: number
    inschrijvingen: number
    aanwPct: number; aanwVan: number; aanwNoem: number
    examensGepland: number; diplomaRecent: number
  }
  komendeLessen: { id: string; datum: string; groep: string; activity: string | null; aanw: number; afg: number; ingevuld: boolean }[]
  trend: { label: string; pct: number; aanw: number; van: number }[]
  examList: { id: string; naam: string; belt: string; next: string; maanden: number | null }[]
  aanwezigheidGroepen: { groep: string; locatie: string; dagen: { id: string; datum: string; activity: string | null; vakantie?: boolean }[] }[]
  aanwezigheidLeden: AanwLid[]
  cellen: Record<string, string>
  leden: LedenRow[]
  openRekeningen: { paymentId: string; lidId: string; naam: string; groep: string; bedrag: number; status: string }[]
  recentBetald: { naam: string; bedrag: number; datum: string }[]
  inschrijvingen: { id: string; naam: string; email: string; groep: string; datum: string }[]
  geplandeExamens: { id: string; naam: string; datum: string }[]
  vlaggen: { id: string; naam: string; status: string; groep: string }[]
  recentGestopt: { id: string; naam: string; leaveDate: string | null }[]
}

const LOC_KORT: Record<string, string> = { STEENBERGEN: 'Knotwilg', OUD_VOSSEMEER: 'Vossenkuil' }
const CYCLE: (string | null)[] = ['AANWEZIG', 'AFGEMELD', 'ZIEK', 'NIET_AANWEZIG', null]

function beltKleur(belt: string | null): string {
  if (!belt) return '#7C3AED' // paars = nog geen band
  return (BELT_COLORS as Record<string, string>)[belt] ?? '#ccc'
}
function leeftijd(dob: string | null): string {
  if (!dob) return ''
  const d = new Date(dob), n = new Date()
  let a = n.getFullYear() - d.getFullYear()
  if (n.getMonth() < d.getMonth() || (n.getMonth() === d.getMonth() && n.getDate() < d.getDate())) a--
  return `${a}j`
}

// ── Widget-register ────────────────────────────────────────────────────────
type WDef = { i: string; titel: string; def: Omit<LayoutItem, 'i'> }

// Hoofdwidget: aanwezigheid vult standaard het hele scherm op grote schermen.
// De rest staan er compact naast/onder, zodat niets weggedrukt wordt.
const WIDGETS: WDef[] = [
  { i: 'aanwezigheid', titel: '📊 Aanwezigheid (12 lessen)', def: { x: 0, y: 0, w: 17, h: 15, minW: 6, minH: 6 } },
  { i: 'lessen', titel: '📅 Lessen', def: { x: 17, y: 0, w: 7, h: 8, minW: 3, minH: 3 } },
  { i: 'leden', titel: '👥 Leden', def: { x: 17, y: 8, w: 7, h: 15, minW: 4, minH: 4 } },
  { i: 'contributie', titel: '💶 Contributie', def: { x: 0, y: 15, w: 5, h: 8, minW: 3, minH: 3 } },
  { i: 'vlaggen', titel: '⚠️ Reserve & stoppend', def: { x: 5, y: 15, w: 5, h: 8, minW: 2, minH: 2 } },
  { i: 'examens', titel: '🥋 Examens', def: { x: 10, y: 15, w: 4, h: 8, minW: 2, minH: 2 } },
  { i: 'inschrijvingen', titel: '📝 Inschrijvingen', def: { x: 14, y: 15, w: 3, h: 5, minW: 2, minH: 2 } },
  { i: 'trend', titel: '📈 Trend 7 dagen', def: { x: 14, y: 20, w: 3, h: 3, minW: 2, minH: 2 } },
  { i: 'gestopt', titel: '🚪 Recent gestopt', def: { x: 0, y: 23, w: 5, h: 4, minW: 2, minH: 2 } },
  { i: 'betald', titel: '✅ Recent betaald', def: { x: 5, y: 23, w: 5, h: 4, minW: 2, minH: 2 } },
  { i: 'snel', titel: '⚡ Snel naar', def: { x: 10, y: 23, w: 7, h: 4, minW: 2, minH: 2 } },
]

const LS_LAYOUT = 'mj-dash-layout-v5'
const LS_HIDDEN = 'mj-dash-hidden-v5'
const BPS = ['xxl', 'xl', 'lg', 'md', 'sm'] as const
const COLS: Record<(typeof BPS)[number], number> = { xxl: 24, xl: 18, lg: 12, md: 8, sm: 4 }

// Grote schermen: schaal de widget-breedtes mee zodat alles in beeld past.
// Layout is ontworpen voor 24 kolommen; kleinere schermen schalen terug.
const SCALE: Record<(typeof BPS)[number], number> = { xxl: 1, xl: 0.78, lg: 0.55, md: 1, sm: 1 }

function baseLayout(bp: (typeof BPS)[number]): LayoutItem[] {
  if (bp === 'sm' || bp === 'md') {
    let y = 0
    return WIDGETS.map(w => {
      const h = Math.min(w.def.h, 9)
      const item: LayoutItem = { i: w.i, x: 0, y, w: COLS[bp], h }
      y += h
      return item
    })
  }
  const f = SCALE[bp]
  return WIDGETS.map(w => ({ i: w.i, ...w.def, w: Math.max(2, Math.min(COLS[bp], Math.round(w.def.w * f))) }))
}

// ── Hoofdcomponent ─────────────────────────────────────────────────────────
export default function AdminDashboard({ d }: { d: DashData }) {
  const router = useRouter()
  const [layouts, setLayouts] = React.useState<ResponsiveLayouts>(() =>
    Object.fromEntries(BPS.map(bp => [bp, baseLayout(bp)])))
  const [hidden, setHidden] = React.useState<string[]>([])
  const [edit, setEdit] = React.useState(false)
  const [menu, setMenu] = React.useState(false)
  const [zoek, setZoek] = React.useState('')
  const { width, mounted, containerRef } = useContainerWidth({ measureBeforeMount: true })

  React.useEffect(() => {
    let saved: ResponsiveLayouts | null = null
    try { saved = JSON.parse(localStorage.getItem(LS_LAYOUT) ?? 'null') } catch { /* noop */ }
    const known = new Set(WIDGETS.map(w => w.i))
    const merged: ResponsiveLayouts = {}
    for (const bp of BPS) {
      const cur = (saved?.[bp] ?? []).filter(l => known.has(l.i))
      merged[bp] = [...cur, ...baseLayout(bp).filter(n => !cur.some(l => l.i === n.i))]
    }
    setLayouts(merged)
    try { setHidden(JSON.parse(localStorage.getItem(LS_HIDDEN) ?? '[]')) } catch { /* noop */ }
  }, [])

  const onLayoutChange = (_cur: readonly LayoutItem[], all: ResponsiveLayouts) => {
    setLayouts(all)
    localStorage.setItem(LS_LAYOUT, JSON.stringify(all))
  }
  const toggle = (i: string) => {
    const next = hidden.includes(i) ? hidden.filter(x => x !== i) : [...hidden, i]
    setHidden(next)
    localStorage.setItem(LS_HIDDEN, JSON.stringify(next))
  }
  const reset = () => {
    localStorage.removeItem(LS_LAYOUT)
    localStorage.removeItem(LS_HIDDEN)
    setHidden([])
    setLayouts(Object.fromEntries(BPS.map(bp => [bp, baseLayout(bp)])))
    setMenu(false)
  }

  const zichtbaar = WIDGETS.filter(w => !hidden.includes(w.i))
  const mobiel = mounted && width > 0 && width < 640
  const t = d.tiles
  const zoekLeden = zoek.trim().length >= 2
    ? d.leden.filter(l => l.naam.toLowerCase().includes(zoek.toLowerCase())).slice(0, 8)
    : []

  return (
    <div>
      {/* Kopbalk */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#2a2a2a]">Start</h1>
          <p className="mt-0.5 text-xs text-gray-500">
            {new Date(d.nowIso).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })} · {t.actieveLeden} actieve leden · {d.kwLabel}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!mobiel && (
            <>
              <button onClick={() => setEdit(e => !e)}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold ${edit ? 'border-[#a90000] bg-[#fdf6f6] text-[#a90000]' : 'border-gray-300 bg-white text-gray-600'}`}>
                {edit ? '✓ Klaar' : '✋ Layout'}
              </button>
              <div className="relative">
                <button onClick={() => setMenu(m => !m)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-600">
                  Widgets {zichtbaar.length}/{WIDGETS.length} ▾
                </button>
                {menu && (
                  <div className="absolute right-0 z-40 mt-1 w-72 rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
                    {WIDGETS.map(w => (
                      <label key={w.i} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-gray-50">
                        <input type="checkbox" checked={!hidden.includes(w.i)} onChange={() => toggle(w.i)} />
                        <span className={`min-w-0 flex-1 truncate ${hidden.includes(w.i) ? 'text-gray-400' : 'text-[#2a2a2a]'}`}>{w.titel}</span>
                      </label>
                    ))}
                    <button onClick={reset} className="mt-1 w-full rounded-lg bg-gray-100 px-2 py-1.5 text-left text-xs font-semibold text-gray-600 hover:bg-gray-200">↺ Standaard herstellen</button>
                  </div>
                )}
              </div>
            </>
          )}
          <Link href="/admin/aanwezigheid/les" className="rounded-xl bg-[#a90000] px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#8c0000]">✏️ Les invullen</Link>
        </div>
      </div>

      {/* KPI-rijen: altijd zichtbaar, compact, klikbaar */}
      <div className="mb-3 grid grid-cols-4 gap-1.5 md:grid-cols-6 xl:grid-cols-8">
        <Kpi href="/admin/leden" label="Leden" value={t.actieveLeden} />
        <Kpi href="/admin/contributie" label="Openstaand" value={t.contributieOpen} sub={`€${t.contributieSom.toFixed(0)}`} accent={t.contributieOpen > 0 ? 'text-red-700' : 'text-green-700'} />
        <Kpi href="/admin/contributie" label="Recent betaald" value={d.recentBetald.length} />
        <Kpi href="/admin/aanwezigheid" label="Aanwezig" value={`${t.aanwPct}%`} sub={`${t.aanwVan}/${t.aanwNoem}`} />
        <Kpi href="/admin/inschrijvingen" label="Nieuw" value={t.inschrijvingen} accent={t.inschrijvingen > 0 ? 'text-[#a90000]' : ''} />
        <Kpi href="/admin/exams" label="Examens" value={t.examensGepland} />
        <Kpi href="/admin/diplomas" label="Diploma's 6m" value={t.diplomaRecent} />
        <Kpi href="/admin/leden" label="Reserve/stopt" value={d.vlaggen.length} accent={d.vlaggen.length > 0 ? 'text-amber-600' : ''} />
      </div>

      {/* Zoombalk */}
      <div className="relative mb-3">
        <input value={zoek} onChange={e => setZoek(e.target.value)} placeholder="Zoek lid… (2+ letters)"
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#a90000] focus:outline-none" />
        {zoekLeden.length > 0 && (
          <div className="absolute left-0 right-0 z-40 mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
            {zoekLeden.map(l => (
              <Link key={l.id} href={`/admin/students/${l.id}`}
                className="flex items-center justify-between border-b border-gray-50 px-3 py-2 text-sm last:border-0 hover:bg-[#fdf6f6]">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full border border-gray-300" style={{ background: beltKleur(l.belt) }} />
                  <span className="font-medium text-[#2a2a2a]">{l.naam}</span>
                  <span className="text-xs text-gray-400">{groepNaam(l.groep)}</span>
                </span>
                <span className="text-xs text-gray-400">{l.betaling === 'BETAALD' ? '✅ betaald' : l.betaling === 'VIJGESTELD' ? '🔵 vrijgesteld' : '💶 open'}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {edit && !mobiel && (
        <p className="mb-3 text-xs text-gray-400">
          Sleep bij de kop · sleep een hoek om te schalen · ✕ sluit · of zet uit via “Widgets”. Layout wordt per schermformaat onthouden.
        </p>
      )}

      {/* Widgetraster */}
      <div ref={containerRef} className="w-full">
        {!mounted ? (
          <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
        ) : mobiel ? (
          <div className="space-y-3">
            {zichtbaar.map(w => (
              <div key={w.i} className="w-card">
                <div className="w-drag">
                  <span className="w-titel">{w.titel}</span>
                  <button onClick={() => toggle(w.i)} className="w-x" aria-label={`${w.titel} sluiten`}>✕</button>
                </div>
                <div className="w-body"><Widget id={w.i} d={d} /></div>
              </div>
            ))}
            {hidden.length > 0 && (
              <button onClick={reset} className="w-full rounded-lg bg-gray-100 px-2 py-2 text-xs font-semibold text-gray-600">↺ Verborgen widgets terugzetten</button>
            )}
          </div>
        ) : (
          <ResponsiveGridLayout
            className="dash-grid"
            width={width}
            layouts={layouts}
            {...({ breakpoints: { xxl: 1900, xl: 1500, lg: 1100, md: 640, sm: 0 }, cols: COLS } as any)}
            rowHeight={34}
            margin={[10, 10]}
            compactType="vertical"
            dragConfig={{ enabled: edit, handle: '.w-drag', threshold: 4 }}
            resizeConfig={{ enabled: edit, handles: ['se', 's', 'e', 'sw', 'nw', 'ne', 'n', 'w'] }}
            onLayoutChange={onLayoutChange}
          >
            {zichtbaar.map(w => (
              <div key={w.i} className={`w-card${edit ? ' w-edit' : ''}`}>
                <div className="w-drag">
                  <span className="w-titel">{w.titel}</span>
                  <button onClick={() => toggle(w.i)} title="Widget sluiten" className="w-x" aria-label={`${w.titel} sluiten`}>✕</button>
                  {edit && <span className="w-grip" aria-hidden>⠿</span>}
                </div>
                <div className="w-body"><Widget id={w.i} d={d} /></div>
              </div>
            ))}
          </ResponsiveGridLayout>
        )}
      </div>
    </div>
  )
}

function Kpi({ href, label, value, sub, accent = '' }: { href: string; label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <Link href={href} className="rounded-lg border border-gray-200 bg-white px-2 py-1 hover:border-[#a90000]/40">
      <p className="truncate text-[10px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p className={`text-base font-bold leading-tight ${accent || 'text-[#2a2a2a]'}`}>{value}{sub && <span className="ml-1 text-[10px] font-medium text-gray-400">{sub}</span>}</p>
    </Link>
  )
}

function Widget({ id, d }: { id: string; d: DashData }) {
  switch (id) {
    case 'lessen': return <WLessen d={d} />
    case 'aanwezigheid': return <WAanwezigheid d={d} />
    case 'contributie': return <WContributie d={d} />
    case 'leden': return <WLeden d={d} />
    case 'vlaggen': return <WVlaggen d={d} />
    case 'examens': return <WExamens d={d} />
    case 'inschrijvingen': return <WInschrijvingen d={d} />
    case 'trend': return <WTrend d={d} />
    case 'gestopt': return <WGestopt d={d} />
    case 'betald': return <WRecentBetald d={d} />
    case 'snel': return <WSnel />
    default: return null
  }
}

function Leeg({ tekst }: { tekst: string }) {
  return <p className="grid h-full place-items-center py-4 text-center text-xs text-gray-400">{tekst}</p>
}

// ── LidCel: naam + band → volgende band + status-pill, hover = volledig wolkje ──
const STATUS_PILL: Record<string, { icon: string; klas: string; label: string }> = {
  LID: { icon: '●', klas: 'bg-gray-100 text-gray-400', label: 'lid' },
  RESERVE: { icon: '◐', klas: 'bg-sky-100 text-sky-700', label: 'reserve' },
  STOPPEND: { icon: '⚑', klas: 'bg-amber-100 text-amber-700', label: 'stopt?' },
  GESTOPT: { icon: '⛔', klas: 'bg-gray-200 text-gray-500', label: 'gestopt' },
  VRIJGESTELD: { icon: '🔵', klas: 'bg-blue-100 text-blue-700', label: 'vrijgesteld' },
}
const BETALING_PILL: Record<string, { klas: string; label: string }> = {
  BETAALD: { klas: 'bg-green-100 text-green-700', label: '✅ betaald' },
  OPEN: { klas: 'bg-red-100 text-red-700', label: '💶 open' },
  HERINNERING1: { klas: 'bg-amber-100 text-amber-800', label: '🟡 1e herinnering' },
  HERINNERING2: { klas: 'bg-orange-100 text-orange-800', label: '🟠 2e herinnering' },
  VIJGESTELD: { klas: 'bg-blue-100 text-blue-700', label: '🔵 vrijgesteld' },
  GEEN: { klas: 'bg-gray-100 text-gray-400', label: 'geen regeling' },
}

function LidCel({ l, a, m, gestopt, status, zet }: {
  l: AanwLid; a: number; m: number; gestopt: boolean
  status: Record<string, string>
  zet: (lidId: string, s: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [pos, setPos] = React.useState<{ x: number; y: number } | null>(null)
  const st = status[l.id] ?? l.clubStatus
  const pill = STATUS_PILL[st] ?? STATUS_PILL.LID
  const bet = BETALING_PILL[l.betaling] ?? BETALING_PILL.GEEN
  const ref = React.useRef<HTMLDivElement>(null)

  // Wolkje volgt de muis en kiest automatisch boven/onder zodat het zichtbaar blijft
  function toon(e: React.MouseEvent) {
    const x = e.clientX + 14
    const onder = window.innerHeight - e.clientY > 220
    setPos({ x: Math.min(x, window.innerWidth - 272), y: e.clientY + (onder ? 16 : -18) })
    setOpen(true)
  }

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={toon}
      onMouseLeave={() => setOpen(false)}
    >
      <div className={`flex items-center gap-1 whitespace-nowrap ${gestopt ? 'opacity-55' : ''}`}>
        {/* Band huidig → volgende (slip = ring) */}
        <span className="flex shrink-0 items-center gap-px" title={l.volgendeBand ? `${l.belt ? getBeltLabel(l.belt as BeltLevel) : 'geen band'} → ${getBeltLabel(l.volgendeBand as BeltLevel)}` : 'geen band'}>
          <span className="h-2.5 w-2.5 rounded-full border border-gray-300" style={{ background: beltKleur(l.belt) }} />
          <span className={`h-2.5 w-2.5 rounded-full border border-gray-300 ${l.volgendeBandSlip ? 'ring-1 ring-[#a90000]/50' : ''}`}
            style={{ background: l.volgendeBand ? beltKleur(l.volgendeBand) : '#eee' }} />
        </span>
        <Link href={`/admin/students/${l.id}`}
          className={`text-[11px] hover:text-[#a90000] ${gestopt ? 'text-gray-400 line-through' : 'text-[#2a2a2a]'}`}>
          {l.naam}
        </Link>
        {/* Status: klik = doorcyclen LID → reserve → stopt? → gestopt */}
        <button onClick={() => zet(l.id, st === 'LID' ? 'RESERVE' : st === 'RESERVE' ? 'STOPPEND' : st === 'STOPPEND' ? 'GESTOPT' : 'LID')}
          className={`shrink-0 rounded-full px-1 text-[9px] font-bold leading-4 ${pill.klas}`}
          title={`Status: ${pill.label} — klik om te wijzigen`}>
          {pill.icon}
        </button>
        {/* Betaald/open indicator */}
        <span className={`shrink-0 rounded-full px-1 text-[9px] font-semibold leading-4 ${bet.klas}`} title={`${d_betaalLabel(l)}`}>
          {l.betaling === 'BETAALD' ? '€✓' : l.betaling === 'VIJGESTELD' ? '€0' : l.betaling === 'GEEN' ? '€–' : '€!'}
        </span>
      </div>

      {/* ── Hover-wolkje: alles over dit lid (portal zodat scroll/scherm niet knippen) ── */}
      {open && pos && typeof document !== 'undefined' && createPortal(
        <div style={{ left: pos.x, top: pos.y }}
          className="pointer-events-none fixed z-[9999] w-64 rounded-xl border border-gray-200 bg-white p-3 text-left shadow-2xl">
          <div className="mb-2 flex items-start justify-between gap-2 border-b border-gray-100 pb-2">
            <div>
              <p className="text-xs font-bold text-[#2a2a2a]">{l.naam}</p>
              <p className="text-[10px] text-gray-400">
                {leeftijd(l.dob) ? `${leeftijd(l.dob)} · ` : ''}{groepNaam(l.groep)}
                {l.lidSinds ? ` · lid sinds ${fmtMaand(l.lidSinds)}` : ''}
              </p>
            </div>
            <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${pill.klas}`}>{pill.label}</span>
          </div>

          <div className="space-y-1 text-[10px] text-gray-600">
            <WolkeRegel label="Band" value={l.belt ? getBeltLabel(l.belt as BeltLevel) : 'nog geen band'}
              stip={beltKleur(l.belt)} />
            {l.volgendeBand && (
              <WolkeRegel label="Volgende" value={getBeltLabel(l.volgendeBand as BeltLevel)}
                stip={beltKleur(l.volgendeBand)} />
            )}
            <WolkeRegel label="Contributie" value={d_betaalLabel(l)}
              accent={l.betaling === 'BETAALD' ? 'text-green-700' : l.betaling === 'GEEN' ? 'text-gray-400' : 'text-red-700'} />
            {l.laatsteBand && <WolkeRegel label="Laatste band" value={fmtMaand(l.laatsteBand)} />}
            {l.laatsteExamen && (
              <WolkeRegel label="Laatste examen"
                value={`${fmtMaand(l.laatsteExamen)} (${geleden(l.laatsteExamen)})`} />
            )}
            {l.cursusJapans && <WolkeRegel label="Cursus Japans" value="diploma behaald" />}
            {l.bondsnummer && <WolkeRegel label="Bondsnummer" value={l.bondsnummer} />}
            <WolkeRegel label="Opkomst" value={m ? `${a} van ${m} lessen (${Math.round(a / m * 100)}%)` : 'geen data'} />
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}

function d_betaalLabel(l: AanwLid): string {
  const bet = BETALING_PILL[l.betaling] ?? BETALING_PILL.GEEN
  return l.bedrag ? `${bet.label} · €${l.bedrag.toFixed(0)}` : bet.label
}
function WolkeRegel({ label, value, stip, accent = '' }: { label: string; value: string; stip?: string; accent?: string }) {
  return (
    <p className="flex items-center justify-between gap-2">
      <span className="shrink-0 text-gray-400">{label}</span>
      <span className={`flex items-center gap-1 text-right font-medium ${accent || 'text-[#2a2a2a]'}`}>
        {stip && <span className="h-2 w-2 shrink-0 rounded-full border border-gray-300" style={{ background: stip }} />}
        {value}
      </span>
    </p>
  )
}
function fmtMaand(iso: string): string {
  return new Date(iso).toLocaleDateString('nl-NL', { month: 'short', year: 'numeric' })
}
function geleden(iso: string): string {
  const dagen = Math.floor((Date.now() - new Date(iso).getTime()) / 864e5)
  if (dagen < 31) return `${dagen}d geleden`
  if (dagen < 365) return `${Math.round(dagen / 30.44)}m geleden`
  return `${(dagen / 365).toFixed(1)}j geleden`
}

// ── Lessen: inline doorlinken naar invullen ────────────────────────────────
function WLessen({ d }: { d: DashData }) {
  return (
    <div className="space-y-1">
      {d.komendeLessen.length === 0 ? <Leeg tekst="Geen lessen gepland." /> : d.komendeLessen.map(l => {
        const vandaag = l.datum === d.nowIso.slice(0, 10)
        const dt = new Date(l.datum)
        return (
          <Link key={l.id} href={`/admin/aanwezigheid/les?dag=${l.id}`}
            className={`flex items-center justify-between gap-2 rounded-lg border px-2 py-1.5 hover:border-[#a90000]/50 ${vandaag ? 'border-[#a90000]/40 bg-[#fdf6f6]' : 'border-gray-100'}`}>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-[#2a2a2a]">
                {vandaag && <span className="mr-1 text-[#a90000]">●</span>}
                {dt.toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })}
                <span className="ml-1.5 rounded bg-gray-100 px-1 py-0.5 text-[10px] font-medium text-gray-600">{groepNaam(l.groep)}</span>
              </p>
              {l.activity && <p className="truncate text-[10px] text-gray-400">🎯 {l.activity}</p>}
            </div>
            <span className="shrink-0 text-[10px] font-medium">
              {l.ingevuld ? <span className="text-green-700">{l.aanw}✅ {l.afg}🅰</span> : <span className="text-[#a90000]">invullen →</span>}
            </span>
          </Link>
        )
      })}
    </div>
  )
}

// ── Aanwezigheid: mini-grid, klikbaar ─────────────────────────────────────
function WAanwezigheid({ d }: { d: DashData }) {
  const router = useRouter()
  const [local, setLocal] = React.useState<Record<string, string | null>>({})
  const [compact, setCompact] = React.useState(false)
  const [sorteer, setSorteer] = React.useState('naam')
  const [status, zetStatus] = usePropSync(d.aanwezigheidLeden, 'clubStatus')

  async function zet(lidId: string, clubStatus: string) {
    zetStatus(lidId, clubStatus)
    try {
      await fetch('/api/admin2/member-status', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: lidId, clubStatus, leaveDate: new Date().toISOString().slice(0, 10) }),
      })
      router.refresh()
    } catch {
      /* rollback bij fout: server blijft leidend, effect ruimt de override op */
    }
  }

  const get = (mid: string, dagId: string) => {
    const k = `${mid}|${dagId}`
    return k in local ? local[k] : (d.cellen[k] ?? null)
  }
  async function cycle(mid: string, dagId: string) {
    const k = `${mid}|${dagId}`
    const cur = get(mid, dagId)
    const next = CYCLE[(CYCLE.indexOf(cur ?? null) + 1) % CYCLE.length]
    setLocal(p => ({ ...p, [k]: next }))
    try {
      const res = await fetch('/api/admin2/attendance', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: mid, trainingDayId: dagId, status: next }),
      })
      if (!res.ok) setLocal(p => ({ ...p, [k]: cur }))
    } catch {
      setLocal(p => ({ ...p, [k]: cur }))
    }
  }

  const cel = compact ? 'h-5 w-5 text-[10px]' : 'h-6 w-6 text-[11px]'

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex flex-shrink-0 items-center gap-2">
        <select value={sorteer} onChange={e => setSorteer(e.target.value)}
          className="rounded border border-gray-200 bg-white px-1.5 py-1 text-[10px] text-gray-600 focus:border-[#a90000] focus:outline-none">
          <option value="naam">naam A→Z</option>
          <option value="jong">leeftijd jong→oud</option>
          <option value="oud">leeftijd oud→jong</option>
          <option value="band">band laag→hoog</option>
          <option value="opkomstLaag">opkomst laag→hoog</option>
          <option value="opkomstHoog">opkomst hoog→laag</option>
        </select>
        <button onClick={() => setCompact(c => !c)} className="rounded border border-gray-200 px-2 py-1 text-[10px] font-medium text-gray-600 hover:border-[#a90000]">
          {compact ? '⬜ Groot' : '▦ Compact'}
        </button>
        <span className="ml-auto text-[10px] text-gray-400">tik cel = wisselen · laatste 12 lessen per groep</span>
      </div>
      {/* Legenda: één keer uitleggen wat alle symbolen betekenen */}
      <div className="flex flex-shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-gray-500">
        <span className="font-semibold uppercase tracking-wide text-gray-400">Legenda</span>
        <span title="Aanwezig">✅ aanwezig</span>
        <span title="Afgemeld">🅰 afgemeld</span>
        <span title="Ziek">🤒 ziek</span>
        <span title="Niet aanwezig">❌ niet aanwezig</span>
        <span className="flex items-center gap-1 rounded bg-gray-100 px-1 py-0.5 text-gray-500" title="Geen les wegens vakantie — telt niet mee in het percentage">🏖 geen les (vakantie)</span>
      </div>
      {/* Groepen vullen de widget: naast elkaar zodra de widget breed is */}
      <div className="grid min-h-0 flex-1 gap-2 [grid-template-columns:repeat(auto-fit,minmax(340px,1fr))]">
      {d.aanwezigheidGroepen.map(g => {
        const aant = (lid: string) => {
          let a = 0, m = 0
          // Vakantiedagen tellen niet mee: anders daalt het percentage door lesvrije weken.
          for (const dg of g.dagen) {
            if (dg.vakantie) continue
            const s = get(lid, dg.id)
            if (s && s !== 'VAKANTIE') { m++; if (s === 'AANWEZIG') a++ }
          }
          return { a, m, p: m ? a / m : -1 }
        }
        let leden = d.aanwezigheidLeden.filter(l => l.groep === g.groep)
        if (sorteer === 'naam') leden = [...leden].sort((x, y) => x.naam.localeCompare(y.naam))
        if (sorteer === 'jong') leden = [...leden].sort((x, y) => (y.dob ?? '').localeCompare(x.dob ?? ''))
        if (sorteer === 'oud') leden = [...leden].sort((x, y) => (x.dob ?? '').localeCompare(y.dob ?? ''))
        if (sorteer === 'band') leden = [...leden].sort((x, y) => (x.belt ?? '').localeCompare(y.belt ?? ''))
        if (sorteer === 'opkomstLaag') leden = [...leden].sort((x, y) => aant(x.id).p - aant(y.id).p)
        if (sorteer === 'opkomstHoog') leden = [...leden].sort((x, y) => aant(y.id).p - aant(x.id).p)

        // Groep zonder afgeronde lessen: compacte melding (geen volle tabel)
        if (g.dagen.length === 0) {
          return (
            <div key={g.groep} className="self-start overflow-hidden rounded-lg border border-dashed border-gray-200">
              <div className="flex items-center justify-between border-b border-dashed border-gray-200 bg-gray-50 px-2 py-1">
                <span className="text-[11px] font-bold text-gray-400">{groepNaam(g.groep)}</span>
                <span className="text-[10px] text-gray-300">{leden.length} leden</span>
              </div>
              <p className="px-2 py-2 text-center text-[10px] text-gray-400">Nog geen afgeronde lessen</p>
            </div>
          )
        }

        return (
          <div key={g.groep} className="min-h-0 overflow-hidden rounded-lg border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-2 py-1">
              <span className="text-[11px] font-bold text-[#2a2a2a]">{groepNaam(g.groep)}</span>
              <span className="text-[10px] text-gray-400">{LOC_KORT[g.locatie] ?? g.locatie} · {leden.length} leden</span>
            </div>
            <div className="h-[calc(100%-1.75rem)] overflow-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-gray-50 px-2 py-1 text-left text-[9px] font-semibold uppercase tracking-wide text-gray-400">Lid</th>
                  {g.dagen.map(dg => {
                    const dt = new Date(dg.datum)
                    return <th key={dg.id}
                    className={`border-b-2 px-0.5 py-1 text-center text-[9px] font-normal ${dg.vakantie ? 'border-[#c3c8cf] bg-[#e7eaee] text-[#8a9099]' : 'border-transparent text-gray-400'}`}
                    title={`${dt.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}${dg.vakantie ? ' · Geen les (vakantie) — telt niet mee in het percentage' : dg.activity ? ` · ${dg.activity}` : ''}`}>
                      {dg.vakantie ? '🏖' : `${dt.getDate()}/${dt.getMonth() + 1}`}
                    </th>
                  })}
                  <th className="px-1.5 py-1 text-[9px] font-semibold text-gray-400">Aanw.</th>
                </tr>
              </thead>
              <tbody>
                {leden.map(l => {
                  const { a, m } = aant(l.id)
                  const gestopt = (status[l.id] ?? l.clubStatus) === 'GESTOPT'
                  return (
                    <tr key={l.id} className={`group border-t border-gray-50 hover:bg-[#fdf6f6] ${gestopt ? 'bg-gray-100/60' : ''}`}>
                      <td className="sticky left-0 z-10 bg-white px-2 py-0.5 group-hover:bg-[#fdf6f6]">
                        <LidCel l={l} a={a} m={m} gestopt={gestopt} status={status} zet={zet} />
                      </td>
                      {g.dagen.map(dg => {
                        // Vakantiedag: doorlopende grijze balk, niet klikbaar — er is geen les gegeven
                        if (dg.vakantie) {
                          return (
                            <td key={dg.id}
                              className="border-l border-r border-[#e7eaee] bg-[#eef0f3] p-0.5 text-center text-[10px] text-[#b8bdc4]"
                              title={`Geen les — vakantie · telt niet mee in het percentage`}>·</td>
                          )
                        }
                        const s = get(l.id, dg.id)
                        const info = s ? STATUS_INFO[s] : null
                        return (
                          <td key={dg.id} className="p-0.5 text-center">
                            <button onClick={() => cycle(l.id, dg.id)} disabled={gestopt}
                              className={`mx-auto flex ${cel} items-center justify-center rounded border ${gestopt ? 'cursor-not-allowed opacity-40' : ''} ${info ? info.klas : 'border-gray-100 bg-gray-50 text-gray-300'}`}
                              title={info ? info.label : 'leeg'}>
                              {info ? info.emoji : '·'}
                            </button>
                          </td>
                        )
                      })}
                      <td className="px-1.5 text-center text-[10px] font-semibold text-green-700">{m ? `${a}/${m}` : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            </div>
          </div>
        )
      })}
      </div>
      {d.aanwezigheidGroepen.length === 0 && <Leeg tekst="Geen lessen gevonden." />}
    </div>
  )
}

// ── Contributie: inline als betaald markeren ───────────────────────────────
function WContributie({ d }: { d: DashData }) {
  const router = useRouter()
  const [status, setStatus] = React.useState<Record<string, string>>(Object.fromEntries(d.openRekeningen.map(r => [r.paymentId, r.status])))
  const [verbergen, setVerbergen] = React.useState<string[]>([])
  const [busy, setBusy] = React.useState<string | null>(null)

  async function markeerBetaald(paymentId: string) {
    const was = status[paymentId] ?? 'OPEN'
    setBusy(paymentId)
    setStatus(p => ({ ...p, [paymentId]: 'BETAALD' }))
    setVerbergen(v => [...v, paymentId])
    try {
      const res = await fetch('/api/admin2/payment', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, status: 'BETAALD' }),
      })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      setStatus(p => ({ ...p, [paymentId]: was }))
      setVerbergen(v => v.filter(x => x !== paymentId))
    } finally {
      setBusy(null)
    }
  }

  const zichtbaar = d.openRekeningen.filter(r => !verbergen.includes(r.paymentId))
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px] text-gray-400">
        <span>{d.tiles.contributieOpen} open · €{d.tiles.contributieSom.toFixed(0)} ({d.kwLabel})</span>
        <Link href="/admin/contributie" className="text-[#a90000] hover:underline">alles →</Link>
      </div>
      {zichtbaar.length === 0 ? <Leeg tekst="Alles betaald of vrijgesteld ✅" /> : zichtbaar.map(r => (
        <div key={r.paymentId} className="flex items-center gap-2 rounded-lg border border-gray-100 px-2 py-1.5">
          <Link href={`/admin/students/${r.lidId}`} className="min-w-0 flex-1 truncate text-xs font-medium text-[#2a2a2a] hover:text-[#a90000]">{r.naam}</Link>
          <span className="shrink-0 text-[10px] text-gray-400">{groepNaam(r.groep)}</span>
          <span className="shrink-0 text-xs font-semibold">€{r.bedrag.toFixed(0)}</span>
          <button onClick={() => markeerBetaald(r.paymentId)} disabled={busy === r.paymentId} title="Markeer als betaald"
            className="shrink-0 rounded border border-green-300 bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold text-green-700 hover:bg-green-100 disabled:opacity-40">✓</button>
        </div>
      ))}
      {d.openRekeningen.length > 0 && <p className="pt-1 text-[10px] text-gray-400">tik ✓ = als betaald markeren</p>}
    </div>
  )
}

// ── Leden: zoeken, sorteren, status inline ─────────────────────────────────
function WLeden({ d }: { d: DashData }) {
  const router = useRouter()
  const [q, setQ] = React.useState('')
  const [sorteer, setSorteer] = React.useState('naam')
  const [status, setClubStatusOpt] = usePropSync(d.leden, 'clubStatus')

  async function setClubStatus(lidId: string, clubStatus: string) {
    setClubStatusOpt(lidId, clubStatus)
    await fetch('/api/admin2/member-status', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId: lidId, clubStatus, leaveDate: new Date().toISOString().slice(0, 10) }),
    })
    router.refresh()
  }

  let leden = d.leden
  if (q.trim().length >= 2) leden = leden.filter(l => l.naam.toLowerCase().includes(q.toLowerCase()))
  if (sorteer === 'naam') leden = [...leden].sort((a, b) => a.naam.localeCompare(b.naam))
  if (sorteer === 'groep') leden = [...leden].sort((a, b) => a.groep.localeCompare(b.groep) || a.naam.localeCompare(b.naam))
  if (sorteer === 'belt') leden = [...leden].sort((a, b) => (a.belt ?? '').localeCompare(b.belt ?? ''))
  if (sorteer === 'leeftijd') leden = [...leden].sort((a, b) => (b.dob ?? '').localeCompare(a.dob ?? ''))
  if (sorteer === 'open') leden = [...leden].sort((a, b) => (a.betaling === 'BETAALD' ? 1 : 0) - (b.betaling === 'BETAALD' ? 1 : 0))

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="filter…"
          className="w-28 rounded border border-gray-200 px-2 py-1 text-[11px] focus:border-[#a90000] focus:outline-none" />
        <select value={sorteer} onChange={e => setSorteer(e.target.value)}
          className="rounded border border-gray-200 bg-white px-1.5 py-1 text-[10px] text-gray-600 focus:border-[#a90000] focus:outline-none">
          <option value="naam">naam</option>
          <option value="groep">groep</option>
          <option value="belt">band</option>
          <option value="leeftijd">leeftijd</option>
          <option value="open">openstaand eerst</option>
        </select>
        <span className="ml-auto text-[10px] text-gray-400">{leden.length} van {d.leden.length}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr className="border-b border-gray-100 text-[9px] uppercase tracking-wide text-gray-400">
              <th className="py-1 text-left font-semibold">Lid</th>
              <th className="py-1 text-left font-semibold">Groep</th>
              <th className="py-1 text-left font-semibold">Band</th>
              <th className="py-1 text-center font-semibold">Betaling</th>
              <th className="py-1 text-right font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {leden.slice(0, 150).map(l => (
              <tr key={l.id} className="border-b border-gray-50 hover:bg-[#fdf6f6]">
                <td className="py-0.5">
                  <Link href={`/admin/students/${l.id}`} className="flex items-center gap-1.5 whitespace-nowrap text-[#2a2a2a] hover:text-[#a90000]">
                    <span className="h-2 w-2 shrink-0 rounded-full border border-gray-300" style={{ background: beltKleur(l.belt) }} />
                    <span className="font-medium">{l.naam}</span>
                    <span className="text-[9px] text-gray-400">{leeftijd(l.dob)}</span>
                  </Link>
                </td>
                <td className="py-0.5 text-[10px]">
                  {l.groep ? <span className="text-gray-500">{groepNaam(l.groep)}</span>
                    : <span className="rounded bg-amber-50 px-1 py-0.5 text-[9px] font-medium text-amber-700" title="Dit lid heeft nog geen groep toegewezen">groep ontbreekt</span>}
                </td>
                <td className="py-0.5 text-[10px] text-gray-500">{l.belt ? getBeltLabel(l.belt as BeltLevel) : <span className="text-[#7C3AED]">geen band</span>}</td>
                <td className="py-0.5 text-center">
                  <span className={`rounded px-1 py-0.5 text-[9px] font-medium ${PAYMENT_INFO[l.betaling]?.klas ?? 'bg-gray-100 text-gray-500'}`}>
                    {PAYMENT_INFO[l.betaling]?.label ?? l.betaling}
                  </span>
                </td>
                <td className="py-0.5">
                  <select value={status[l.id] ?? l.clubStatus} onChange={e => setClubStatus(l.id, e.target.value)}
                    className="float-right rounded border border-gray-200 bg-white px-1 py-0.5 text-[9px] text-gray-600 focus:border-[#a90000] focus:outline-none">
                    <option value="LID">LID</option>
                    <option value="RESERVE">reserve</option>
                    <option value="STOPPEND">stopt?</option>
                    <option value="GESTOPT">gestopt</option>
                    <option value="VRIJGESTELD">vrijgesteld</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {leden.length === 0 && <Leeg tekst="Geen leden gevonden." />}
    </div>
  )
}

// ── Reserve & stoppend: status inline ──────────────────────────────────────
function WVlaggen({ d }: { d: DashData }) {
  const router = useRouter()
  const [vlagStatus, zetVlag] = usePropSync(d.vlaggen, 'status')
  async function zet(lidId: string, s: string) {
    zetVlag(lidId, s)
    await fetch('/api/admin2/member-status', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId: lidId, clubStatus: s, leaveDate: new Date().toISOString().slice(0, 10) }),
    })
    router.refresh()
  }
  return (
    <div className="space-y-1">
      {d.vlaggen.length === 0 ? <Leeg tekst="Niemand gevlagd ✅" /> : d.vlaggen.map(v => (
        <div key={v.id} className="flex items-center gap-1.5 rounded-lg border border-gray-100 px-2 py-1.5">
          <Link href={`/admin/students/${v.id}`} className="min-w-0 flex-1 truncate text-xs font-medium text-[#2a2a2a] hover:text-[#a90000]">{v.naam}</Link>
          <span className="shrink-0 text-[9px] text-gray-400">{groepNaam(v.groep)}</span>
          <select value={vlagStatus[v.id] ?? v.status} onChange={e => zet(v.id, e.target.value)}
            className="shrink-0 rounded border border-gray-200 bg-white px-1 py-0.5 text-[10px] focus:border-[#a90000] focus:outline-none">
            <option value="RESERVE">reserve</option>
            <option value="STOPPEND">stopt?</option>
            <option value="GESTOPT">gestopt</option>
            <option value="LID">LID</option>
          </select>
        </div>
      ))}
    </div>
  )
}

// ── Examens ────────────────────────────────────────────────────────────────
function WExamens({ d }: { d: DashData }) {
  return (
    <div className="space-y-2">
      <div>
        <p className="mb-1 text-[9px] font-semibold uppercase tracking-wide text-gray-400">Kandidaten</p>
        {d.examList.length === 0 ? <p className="text-xs text-gray-400">Niemand komt in aanmerking</p> : d.examList.map(e => (
          <Link key={e.id} href={`/admin/students/${e.id}`} className="flex items-center gap-1.5 rounded px-1 py-0.5 hover:bg-[#fdf6f6]">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full border border-gray-300" style={{ background: beltKleur(e.belt) }} />
            <span className="min-w-0 flex-1 truncate text-[11px] text-[#2a2a2a]">{e.naam}</span>
            <span className="shrink-0 text-[9px] text-gray-500">{e.next}</span>
            <span className="shrink-0 text-[9px] text-gray-400">{e.maanden ?? '?'}m</span>
          </Link>
        ))}
      </div>
      {d.geplandeExamens.length > 0 && (
        <div>
          <p className="mb-1 text-[9px] font-semibold uppercase tracking-wide text-gray-400">Gepland</p>
          {d.geplandeExamens.map(e => (
            <div key={e.id} className="flex items-center justify-between rounded px-1 py-0.5 text-[11px]">
              <span className="text-[#2a2a2a]">{e.naam}</span>
              <span className="text-[9px] text-gray-400">{e.datum ? new Date(e.datum).toLocaleDateString('nl-NL') : '—'}</span>
            </div>
          ))}
        </div>
      )}
      <Link href="/admin/exams/new" className="block rounded-lg bg-[#a90000] px-2 py-1.5 text-center text-[11px] font-semibold text-white hover:bg-[#8c0000]">+ Examen plannen</Link>
    </div>
  )
}

// ── Inschrijvingen: inline goedkeuren/afkeuren ──────────────────────────────
function WInschrijvingen({ d }: { d: DashData }) {
  const router = useRouter()
  const [lijst, setLijst] = React.useState(d.inschrijvingen)
  const [busy, setBusy] = React.useState<string | null>(null)

  async function verwerk(id: string, action: 'APPROVE' | 'REJECT') {
    setBusy(id)
    try {
      const res = await fetch(`/api/admin/inschrijvingen/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setLijst(p => p.filter(x => x.id !== id))
      router.refresh()
    } catch (e) {
      setBusy(null)
      window.alert(`Fout: ${(e as Error).message}`)
      return
    }
    setBusy(null)
  }

  return (
    <div className="space-y-1">
      {lijst.length === 0 ? <Leeg tekst="Geen openstaande aanvragen ✅" /> : lijst.map(a => (
        <div key={a.id} className="rounded-lg border border-gray-100 px-2 py-1.5">
          <p className="truncate text-xs font-semibold text-[#2a2a2a]">{a.naam}</p>
          <p className="truncate text-[9px] text-gray-400">{a.groep} · {a.datum}</p>
          <div className="mt-1 flex gap-1">
            <button onClick={() => verwerk(a.id, 'APPROVE')} disabled={busy === a.id}
              className="flex-1 rounded bg-green-600 px-1.5 py-1 text-[10px] font-semibold text-white hover:bg-green-700 disabled:opacity-40">✓ goedkeuren</button>
            <button onClick={() => verwerk(a.id, 'REJECT')} disabled={busy === a.id}
              className="rounded border border-gray-300 px-1.5 py-1 text-[10px] text-gray-500 hover:border-red-400 hover:text-red-600 disabled:opacity-40">✕ afwijzen</button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Trend ──────────────────────────────────────────────────────────────────
function WTrend({ d }: { d: DashData }) {
  return (
    <div className="space-y-1.5">
      {d.trend.length === 0 ? <Leeg tekst="Nog geen data" /> : d.trend.map((x, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-16 shrink-0 text-[9px] text-gray-500">{x.label}</span>
          <div className="h-2 flex-1 overflow-hidden rounded bg-gray-100">
            <div className="h-full rounded bg-[#a90000]" style={{ width: `${x.pct}%` }} />
          </div>
          <span className="w-12 shrink-0 text-right text-[10px] font-medium text-gray-600">{x.aanw}/{x.van}</span>
        </div>
      ))}
    </div>
  )
}

// ── Recent gestopt ─────────────────────────────────────────────────────────
function WGestopt({ d }: { d: DashData }) {
  return (
    <div className="space-y-1">
      {d.recentGestopt.length === 0 ? <Leeg tekst="Niemand gestopt" /> : d.recentGestopt.map(m => (
        <Link key={m.id} href="/admin/leden" className="flex items-center justify-between rounded px-1 py-0.5 text-[11px] hover:bg-gray-50">
          <span className="truncate text-[#2a2a2a]">{m.naam}</span>
          <span className="shrink-0 text-[9px] text-gray-400">{m.leaveDate ? new Date(m.leaveDate).toLocaleDateString('nl-NL') : '—'}</span>
        </Link>
      ))}
    </div>
  )
}

// ── Recent betaald ─────────────────────────────────────────────────────────
function WRecentBetald({ d }: { d: DashData }) {
  return (
    <div className="space-y-1">
      {d.recentBetald.length === 0 ? <Leeg tekst="Nog geen betalingen dit kwartaal" /> : d.recentBetald.map((p, i) => (
        <div key={i} className="flex items-center justify-between rounded px-1 py-0.5 text-[11px]">
          <span className="truncate text-[#2a2a2a]">{p.naam}</span>
          <span className="shrink-0 text-green-700">€{p.bedrag.toFixed(0)}</span>
        </div>
      ))}
    </div>
  )
}

// ── Snel naar ──────────────────────────────────────────────────────────────
function WSnel() {
  const links: [string, string, string][] = [
    ['/admin/aanwezigheid/les', '🥋', 'Les invullen'],
    ['/admin/aanwezigheid', '📊', 'Alle lessen'],
    ['/admin/leden', '👥', 'Leden'],
    ['/admin/contributie', '💶', 'Contributie'],
    ['/admin/inschrijvingen', '📝', 'Inschrijvingen'],
    ['/admin/exams', '🥇', 'Examens'],
    ['/admin/exams/new', '➕', 'Examen plannen'],
    ['/admin/diplomas', '🏆', "Diploma's"],
    ['/admin/students/new', '🆕', 'Nieuw lid'],
    ['/diploma/verifieren', '🔍', 'Verifiëren'],
  ]
  return (
    <div className="grid grid-cols-3 gap-1 lg:grid-cols-5">
      {links.map(([h, ic, lbl]) => (
        <Link key={h} href={h} className="flex items-center gap-1 rounded-lg border border-gray-100 px-1.5 py-1.5 text-[10px] font-semibold text-[#2a2a2a] hover:border-[#a90000]/40 hover:text-[#a90000]">
          <span>{ic}</span><span className="truncate">{lbl}</span>
        </Link>
      ))}
    </div>
  )
}