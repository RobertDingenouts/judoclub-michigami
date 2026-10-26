'use client'

// ═══════════════════════════════════════════════════════════════════════════
// Startscherm — één dashboard, alles inline bewerkbaar.
// Elke clubfunctie is een widget: sleepbaar, schaalbaar, sluitbaar en per
// schermformaat onthouden in localStorage. Alle data komt in één server-fetch
// (DashData), dus je hoeft niet tussen bladen te navigeren om iets te doen.
// ═══════════════════════════════════════════════════════════════════════════
import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout'
import type { LayoutItem, ResponsiveLayouts } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { GROEP_LABEL, STATUS_INFO, PAYMENT_INFO, groepNaam } from '@/lib/admin2'
import { BELT_ORDER as BAND_VOLGORDE } from '@/lib/student-progress-types'
import { BeltVak } from '@/components/admin/BeltVak'
import { KwartaalGrid } from '../aanwezigheid/KwartaalGrid'
import { LesModus } from '../aanwezigheid/les/LesModus'
import { ContributieBoard } from '../contributie/ContributieBoard'
import type { DagCel, LidRef } from '@/lib/lessendata'
import type { ContribRij } from '@/lib/contributiedata'
import type { LesModusProps } from '@/lib/lesdata'
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
    contributieNog: number; contributieNogSom: number
    inschrijvingen: number
    aanwPct: number; aanwVan: number; aanwNoem: number
    examensGepland: number; diplomaRecent: number
  }
  komendeLessen: { id: string; datum: string; groep: string; activity: string | null; aanw: number; afg: number; ingevuld: boolean }[]
  trend: { label: string; pct: number; aanw: number; van: number }[]
  examList: { id: string; naam: string; belt: string; next: string; maanden: number | null }[]
  // Lessen/lesmodus/contributie: exact de datasets van de losse pagina-libs,
  // dus de widget toont identical hetzelfde als de eigen pagina.
  lessen: { dagen: DagCel[]; leden: LidRef[]; trainers: LidRef[]; cellen: Record<string, string> }
  lesmodus: LesModusProps | null
  contributie: { rows: ContribRij[]; periode: string; periodId: string; totaalOpen: number }
  leden: LedenRow[]
  zoekAlle: { id: string; naam: string; groep: string; belt: string | null; inactief: boolean }[]
  openRekeningen: { paymentId: string; lidId: string; naam: string; groep: string; bedrag: number; status: string }[]
  recentBetald: { naam: string; bedrag: number; datum: string }[]
  inschrijvingen: { id: string; naam: string; email: string; groep: string; datum: string }[]
  geplandeExamens: { id: string; naam: string; datum: string }[]
  vlaggen: { id: string; naam: string; status: string; groep: string }[]
  recentGestopt: { id: string; naam: string; leaveDate: string | null }[]
  groei: { kwartalen: { key: string; label: string; nieuw: number; gestopt: number; proef: number }[]; proefNu: number }
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
// De grote widgets zijn de pagina-zelf (KwartaalGrid / LesModus / ContributieBoard),
// naast en onder elkaar op de pc. De layout-key is ge-bumpt: de oude widgetset
// (met de eigen, afwijkende aanwezigheidslijst) bestaat niet meer.
const WIDGETS: WDef[] = [
  { i: 'lessen', titel: '📊 Lessen & aanwezigheid', def: { x: 0, y: 0, w: 12, h: 15, minW: 6, minH: 6 } },
  { i: 'lesmodus', titel: '✏️ Les invullen', def: { x: 12, y: 0, w: 7, h: 15, minW: 4, minH: 6 } },
  { i: 'leden', titel: '👥 Leden', def: { x: 19, y: 0, w: 5, h: 15, minW: 4, minH: 4 } },
  { i: 'contributie', titel: '💶 Contributie', def: { x: 0, y: 15, w: 8, h: 9, minW: 3, minH: 3 } },
  { i: 'komende', titel: '📅 Komende lessen', def: { x: 8, y: 15, w: 4, h: 9, minW: 3, minH: 3 } },
  { i: 'vlaggen', titel: '⚠️ Reserve & stoppend', def: { x: 12, y: 15, w: 4, h: 9, minW: 2, minH: 2 } },
  { i: 'examens', titel: '🥋 Examens', def: { x: 16, y: 15, w: 4, h: 9, minW: 2, minH: 2 } },
  { i: 'inschrijvingen', titel: '📝 Inschrijvingen', def: { x: 20, y: 15, w: 4, h: 5, minW: 2, minH: 2 } },
  { i: 'trend', titel: '📈 Trend 7 dagen', def: { x: 20, y: 20, w: 4, h: 4, minW: 2, minH: 2 } },
  { i: 'gestopt', titel: '🚪 Recent gestopt', def: { x: 0, y: 24, w: 5, h: 4, minW: 2, minH: 2 } },
  { i: 'betald', titel: '✅ Recent betaald', def: { x: 5, y: 24, w: 5, h: 4, minW: 2, minH: 2 } },
  { i: 'snel', titel: '⚡ Snel naar', def: { x: 10, y: 24, w: 7, h: 4, minW: 2, minH: 2 } },
  { i: 'groei', titel: '📈 Leden per kwartaal', def: { x: 17, y: 24, w: 7, h: 5, minW: 3, minH: 3 } },
]

const LS_LAYOUT = 'mj-dash-layout-v7'
const LS_HIDDEN = 'mj-dash-hidden-v7'
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
  const items = WIDGETS.map(w => ({
    i: w.i, x: w.def.x, y: w.def.y, w: Math.max(2, Math.round(w.def.w * f)),
    h: w.def.h, minW: w.def.minW, minH: w.def.minH, origX: w.def.x,
  }))
  // Per rij: schaaf breedtes af en her-verdeel x cumulatief, zodat rijen exact
  // COLS vullen zonder overlap (anders duwt RGL widgets naar beneden = gaten).
  const perRij = new Map<number, typeof items>()
  for (const it of items) {
    const arr = perRij.get(it.y) ?? []
    arr.push(it)
    perRij.set(it.y, arr)
  }
  for (const arr of perRij.values()) {
    arr.sort((a, b) => a.origX - b.origX)
    let totaal = arr.reduce((s, it) => s + it.w, 0)
    // Krimp de breedste widgets totdat de rij past
    while (totaal > COLS[bp]) {
      const breedste = arr.reduce((m, it) => (it.w > 2 && it.w > m.w ? it : m), arr[0])
      if (breedste.w <= 2) break
      breedste.w--; totaal--
    }
    let x = 0
    for (const it of arr) { it.x = x; x += it.w }
    const laatste = arr[arr.length - 1]
    if (laatste && x < COLS[bp]) laatste.w += COLS[bp] - x
  }
  for (const it of items) delete (it as any).origX
  return items
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
  const [exportMenu, setExportMenu] = React.useState(false)
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
    ? d.zoekAlle.filter(l => l.naam.toLowerCase().includes(zoek.toLowerCase())).slice(0, 8)
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
          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setExportMenu(v => !v)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-600">⬇ Export ▾</button>
              {exportMenu && (
                <div className="absolute right-0 z-40 mt-1 w-56 rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl">
                  {([['leden', '📋 Volledige ledenlijst'], ['inschrijvingen', '📝 Nieuwe inschrijvingen'], ['contributie', '💶 Contributie (Q4)'], ['aanwezigheid', '📊 Aanwezigheid (90d)']] as [string, string][]).map(([k, lbl]) => (
                    <a key={k} href={`/api/admin2/export?lijst=${k}`} onClick={() => setExportMenu(false)}
                      className="block rounded-lg px-2.5 py-2 text-xs font-medium text-[#2a2a2a] hover:bg-[#fdf6f6]">{lbl}</a>
                  ))}
                </div>
              )}
            </div>
            <Link href="/admin/aanwezigheid/les" className="rounded-xl bg-[#a90000] px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#8c0000]">✏️ Les invullen</Link>
                <Link href="/admin/materiaal" className="rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:border-[#a90000]/40">📦 Materiaal</Link>
          </div>
        </div>
      </div>

      {/* KPI-rijen: altijd zichtbaar, compact, klikbaar */}
      <div className="mb-3 grid grid-cols-4 gap-1.5 md:grid-cols-6 xl:grid-cols-8">
        <Kpi href="/admin/leden" label="Leden" value={t.actieveLeden} />
        <Kpi href="/admin/contributie" label="Nog te betalen" value={t.contributieNog} sub={`€${t.contributieNogSom.toFixed(0)}`} accent={t.contributieNog > 0 ? 'text-amber-600' : 'text-green-700'} />
        <Kpi href="/admin/contributie" label="Schuldig" value={t.contributieOpen} sub={`€${t.contributieSom.toFixed(0)}`} accent={t.contributieOpen > 0 ? 'text-red-700' : 'text-green-700'} />
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
          className="w-full rounded-xl border border-white/70 bg-white/60 px-3 py-2 text-sm shadow-sm backdrop-blur-md focus:border-[#a90000] focus:outline-none" />
        {zoekLeden.length > 0 && (
          <div className="absolute left-0 right-0 z-40 mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
            {zoekLeden.map(l => (
              <Link key={l.id} href={`/admin/students/${l.id}`}
                className="flex items-center justify-between border-b border-gray-50 px-3 py-2 text-sm last:border-0 hover:bg-[#fdf6f6]">
                <span className="flex items-center gap-2">
                  <BeltVak belt={l.belt as any} />
                  <span className="font-medium text-[#2a2a2a]">{l.naam}</span>
                  <span className="text-xs text-gray-400">{groepNaam(l.groep)}{l.inactief ? ' · 🗑 archief' : ''}</span>
                </span>
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
          <TegelStart d={d} />
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

// ── Mobiel: tegel-startscherm ──────────────────────────────────────────────
// Op de telefoon géén stapeling van alle widgets: één startscherm met grote
// tegels (emoji + kleine metrics). Pas bij klik ga je naar de echte pagina.
function TegelStart({ d }: { d: DashData }) {
  const t = d.tiles
  const vandaag = d.komendeLessen.filter(l => l.datum === d.nowIso.slice(0, 10))
  const tegels: { emoji: string; titel: string; href: string; metric: string; sub: string; accent?: string }[] = [
    { emoji: '✏️', titel: 'Les invullen', href: '/admin/aanwezigheid/les', metric: vandaag.length ? `${vandaag.length} vandaag` : 'geen vandaag', sub: d.lesmodus ? `${d.lesmodus.leden.length} leden · ${d.lesmodus.dag.groep}` : 'kies een les', accent: vandaag.length ? 'text-[#a90000]' : '' },
    { emoji: '📊', titel: 'Lessen & aanwezigheid', href: '/admin/aanwezigheid', metric: `${t.aanwPct}%`, sub: `aanwezig ${t.aanwVan}/${t.aanwNoem} (90d)` },
    { emoji: '💶', titel: 'Contributie', href: '/admin/contributie', metric: t.contributieNog ? `${t.contributieNog} te betalen` : 'alles betaald', sub: t.contributieNog ? `€${t.contributieNogSom.toFixed(0)} · ${t.contributieOpen} schuldig` : `Q${d.contributie.periode} · ${d.contributie.rows.length} leden`, accent: t.contributieOpen ? 'text-red-700' : t.contributieNog ? 'text-amber-600' : 'text-green-700' },
    { emoji: '👥', titel: 'Leden', href: '/admin/leden', metric: `${t.actieveLeden}`, sub: 'actieve leden' },
    { emoji: '📝', titel: 'Inschrijvingen', href: '/admin/inschrijvingen', metric: t.inschrijvingen ? `${t.inschrijvingen} nieuw` : 'geen nieuw', sub: 'openstaande aanvragen', accent: t.inschrijvingen ? 'text-[#a90000]' : '' },
    { emoji: '⚠️', titel: 'Reserve & stoppend', href: '/admin/leden', metric: `${d.vlaggen.length}`, sub: d.vlaggen.length ? d.vlaggen.slice(0, 2).map(v => v.naam.split(' ')[0]).join(', ') : 'niemands', accent: d.vlaggen.length ? 'text-amber-600' : '' },
    { emoji: '🥋', titel: 'Examens', href: '/admin/exams', metric: `${t.examensGepland}`, sub: 'gepland' },
    { emoji: '🎓', titel: "Diploma's", href: '/admin/diplomas', metric: `${t.diplomaRecent}`, sub: 'laatste 6 maanden' },
  ]
  return (
    <div className="grid grid-cols-2 gap-2.5 pb-24">
      {tegels.map(tg => (
        <Link key={tg.href + tg.titel} href={tg.href}
          className="flex flex-col gap-1 rounded-2xl border border-white/70 bg-white/60 p-3.5 shadow-sm backdrop-blur-md active:scale-[0.98] hover:border-[#a90000]/40">
          <span className="text-2xl leading-none">{tg.emoji}</span>
          <span className="mt-1 text-[13px] font-bold leading-tight text-[#2a2a2a]">{tg.titel}</span>
          <span className={`text-lg font-extrabold leading-tight ${tg.accent || 'text-[#2a2a2a]'}`}>{tg.metric}</span>
          <span className="line-clamp-1 text-[11px] text-gray-500">{tg.sub}</span>
        </Link>
      ))}
    </div>
  )
}

function Kpi({ href, label, value, sub, accent = '' }: { href: string; label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <Link href={href} className="rounded-xl border border-white/70 bg-white/55 px-2 py-1 backdrop-blur-md hover:border-[#a90000]/40">
      <p className="truncate text-[10px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p className={`text-base font-bold leading-tight ${accent || 'text-[#2a2a2a]'}`}>{value}{sub && <span className="ml-1 text-[10px] font-medium text-gray-400">{sub}</span>}</p>
    </Link>
  )
}

function Widget({ id, d }: { id: string; d: DashData }) {
  switch (id) {
    case 'lessen': return <WLessenGrid d={d} />
    case 'lesmodus': return <WLesModus d={d} />
    case 'contributie': return <WContributieGrid d={d} />
    case 'komende': return <WLessen d={d} />
    case 'leden': return <WLeden d={d} />
    case 'vlaggen': return <WVlaggen d={d} />
    case 'examens': return <WExamens d={d} />
    case 'inschrijvingen': return <WInschrijvingen d={d} />
    case 'trend': return <WTrend d={d} />
    case 'gestopt': return <WGestopt d={d} />
    case 'groei': return <WGroei d={d} />
    case 'betald': return <WRecentBetald d={d} />
    case 'snel': return <WSnel />
    default: return null
  }
}

function Leeg({ tekst }: { tekst: string }) {
  return <p className="grid h-full place-items-center py-4 text-center text-xs text-gray-400">{tekst}</p>
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

// ── Page-widgets: exact dezelfde component + data als de losse pagina's ───
// De widget IS de pagina (KwartaalGrid / LesModus / ContributieBoard), dus er
// bestaat maar één soort aanwezigheidslijst en je hoeft op de pc nergens heen.
function WLessenGrid({ d }: { d: DashData }) {
  return <KwartaalGrid dagen={d.lessen.dagen} leden={d.lessen.leden} trainers={d.lessen.trainers} cellen={d.lessen.cellen} />
}
function WLesModus({ d }: { d: DashData }) {
  if (!d.lesmodus) return <Leeg tekst="Nog geen les gepland." />
  return <LesModus key={d.lesmodus.dag.id} {...d.lesmodus} />
}
function WContributieGrid({ d }: { d: DashData }) {
  return <ContributieBoard rows={d.contributie.rows} periode={d.contributie.periode} periodId={d.contributie.periodId} totaalOpen={d.contributie.totaalOpen} toonGestopt={false} />
}

// ── Leden: zoeken, sorteren, status inline ─────────────────────────────────
function WLeden({ d }: { d: DashData }) {
  const router = useRouter()
  const [q, setQ] = React.useState('')
  const [sorteer, setSorteer] = React.useState('band')
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
  // zelfde standaard als de Leden-pagina: band (kleur), dan leeftijd, groep, lid sinds
  if (sorteer === 'band') leden = [...leden].sort((a, b) => BAND_VOLGORDE.indexOf((a.belt ?? '') as any) - BAND_VOLGORDE.indexOf((b.belt ?? '') as any))
  if (sorteer === 'naam') leden = [...leden].sort((a, b) => a.naam.localeCompare(b.naam))
  if (sorteer === 'groep') leden = [...leden].sort((a, b) => a.groep.localeCompare(b.groep) || a.naam.localeCompare(b.naam))
  if (sorteer === 'leeftijd') leden = [...leden].sort((a, b) => (b.dob ?? '').localeCompare(a.dob ?? ''))
  if (sorteer === 'lidSinds') leden = [...leden].sort((a, b) => (b.lidSinds ?? '').localeCompare(a.lidSinds ?? ''))
  if (sorteer === 'open') leden = [...leden].sort((a, b) => (a.betaling === 'BETAALD' ? 1 : 0) - (b.betaling === 'BETAALD' ? 1 : 0))

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="filter…"
          className="w-28 rounded border border-gray-200 px-2 py-1 text-[11px] focus:border-[#a90000] focus:outline-none" />
        <select value={sorteer} onChange={e => setSorteer(e.target.value)}
          className="rounded border border-gray-200 bg-white px-1.5 py-1 text-[10px] text-gray-600 focus:border-[#a90000] focus:outline-none">
          <option value="band">band</option>
          <option value="leeftijd">leeftijd</option>
          <option value="groep">groep</option>
          <option value="lidSinds">lid sinds</option>
          <option value="naam">naam</option>
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
                    <BeltVak belt={l.belt} size={8} />
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
            <BeltVak belt={e.belt} />
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
  // Lijst volgt de server: na `router.refresh()` verschijnen nieuwe aanvragen
    // automatisch (een lokale `useState(d.inschrijvingen)` zou die negeren).
    const [weggehaald, setWeggehaald] = React.useState<string[]>([])
    const lijst = d.inschrijvingen.filter(a => !weggehaald.includes(a.id))
    const [busy, setBusy] = React.useState<string | null>(null)

    async function verwerk(id: string, action: 'APPROVE' | 'REJECT') {
      setBusy(id)
      try {
        const res = await fetch(`/api/admin/inschrijvingen/${id}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        })
        if (!res.ok) throw new Error((await res.json()).error)
        // Optimaist weghalen; de effect hieronder ruimt dit op zodra de server doorhaadt.
        setWeggehaald(p => [...p, id])
        router.refresh()
      } catch (e) {
        setBusy(null)
        window.alert(`Fout: ${(e as Error).message}`)
        return
      }
      setBusy(null)
    }

    // Zodra een aanvraag niet meer in de serverdata staat, is de override overbodig.
    React.useEffect(() => {
      setWeggehaald(p => {
        if (!p.length) return p
        const volgende = p.filter(id => d.inschrijvingen.some(a => a.id === id))
        return volgende.length === p.length ? p : volgende
      })
    }, [d.inschrijvingen])

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
      {d.trend.length === 0 ? <Leeg tekst="Nog geen data" /> : d.trend.map((x) => (
        // key op het label (datum): stabiel als de lijst verschuift, key={i} niet
        <div key={x.label} className="flex items-center gap-2">
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
    <div className="max-h-full space-y-1 overflow-y-auto">
      {d.recentGestopt.length === 0 ? <Leeg tekst="Niemand gestopt" /> : d.recentGestopt.map(m => (
        <Link key={m.id} href="/admin/leden" className="flex items-center justify-between rounded px-1 py-0.5 text-[11px] hover:bg-gray-50">
          <span className="truncate text-[#2a2a2a]">{m.naam}</span>
          <span className="shrink-0 text-[9px] text-gray-400">{m.leaveDate ? new Date(m.leaveDate).toLocaleDateString('nl-NL') : '—'}</span>
        </Link>
      ))}
    </div>
  )
}

// ── Leden per kwartaal (CRM-groei) ─────────────────────────────────────────
function WGroei({ d }: { d: DashData }) {
  const k = d.groei.kwartalen
  const max = Math.max(4, ...k.map(x => Math.max(x.nieuw, x.gestopt, x.proef)))
  const W = 340, H = 118, baseY = H - 15
  const groupW = W / k.length, barW = Math.min(11, (groupW - 8) / 3)
  const C = { nieuw: '#16a34a', gestopt: '#a90000', proef: '#d97706' }
  const dit = k[k.length - 1]
  const netto = dit.nieuw - dit.gestopt
  return (
    <div className="flex h-full flex-col">
      <div className="mb-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-gray-600">
        <span>Actief <b>{d.tiles.actieveLeden}</b></span>
        <span style={{ color: C.proef }}>Proef nu <b>{d.groei.proefNu}</b></span>
        <span style={{ color: C.nieuw }}>Nieuw {dit.label} <b>{dit.nieuw}</b></span>
        <span style={{ color: C.gestopt }}>Gestopt <b>{dit.gestopt}</b></span>
        <span>Netto <b style={{ color: netto >= 0 ? C.nieuw : C.gestopt }}>{netto >= 0 ? '+' : ''}{netto}</b></span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full flex-1" preserveAspectRatio="none">
        <line x1={0} y1={baseY} x2={W} y2={baseY} stroke="#e5e5e5" />
        {k.map((x, i) => (
          <g key={x.key}>
            {([['nieuw', x.nieuw, C.nieuw], ['gestopt', x.gestopt, C.gestopt], ['proef', x.proef, C.proef]] as const).map(([f, v, c], j) => {
              const h = v === 0 ? 0 : Math.max(3, (v / max) * (baseY - 22))
              const bx = i * groupW + (groupW - (barW * 3 + 2)) / 2 + j * (barW + 1)
              return (
                <g key={f}>
                  <rect x={bx} y={baseY - h} width={barW} height={h} rx={1.5} fill={c} opacity={0.9} />
                  {v > 0 && <text x={bx + barW / 2} y={baseY - h - 2.5} textAnchor="middle" fontSize="7" fill="#666">{v}</text>}
                </g>
              )
            })}
            <text x={i * groupW + groupW / 2} y={H - 4} textAnchor="middle" fontSize="7.5" fill="#888">{x.label}</text>
          </g>
        ))}
      </svg>
      <div className="mt-0.5 flex gap-3 text-[9px] text-gray-500">
        <span><i className="mr-1 inline-block h-2 w-2 rounded-sm align-middle" style={{ background: C.nieuw }} />nieuw</span>
        <span><i className="mr-1 inline-block h-2 w-2 rounded-sm align-middle" style={{ background: C.gestopt }} />gestopt</span>
        <span><i className="mr-1 inline-block h-2 w-2 rounded-sm align-middle" style={{ background: C.proef }} />proef</span>
      </div>
    </div>
  )
}

// ── Recent betaald ─────────────────────────────────────────────────────────
function WRecentBetald({ d }: { d: DashData }) {
  return (
    <div className="space-y-1">
      {d.recentBetald.length === 0 ? <Leeg tekst="Nog geen betalingen dit kwartaal" /> : d.recentBetald.map((p) => (
        <div key={`${p.naam}-${p.datum}-${p.bedrag}`} className="flex items-center justify-between rounded px-1 py-0.5 text-[11px]">
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