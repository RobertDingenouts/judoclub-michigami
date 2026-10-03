'use client'

// Admin startdashboard — vrij indeelbaar: widgets zijn versleepbaar (bij de kop),
// schaalbaar (hoeken), aan/uit te zetten en per schermformaat opgeslagen in localStorage.
import * as React from 'react'
import Link from 'next/link'
import { ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout'
import type { LayoutItem, ResponsiveLayouts } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { GROEP_LABEL } from '@/lib/admin2'
import { getBeltLabel } from '@/lib/belt-utils'
import { BELT_COLORS } from '@/lib/student-progress-types'
import type { BeltLevel } from '@prisma/client'

export type DashData = {
  nowIso: string
  actieveLeden: number
  kwLabel: string
  tiles: { contributieOpen: number; contributieSom: number; inschrijvingen: number; aanwPct: number; aanwVan: number; aanwNoem: number; examensGepland: number }
  upcoming: { id: string; datum: string; groep: string; activity: string | null; aanw: number; afg: number; ingevuld: boolean }[]
  trend: { label: string; pct: number }[]
  examList: { id: string; naam: string; belt: string; next: string; maanden: number | null }[]
  vlaggen: { id: string; naam: string; status: string }[]
  recentGestopt: { id: string; naam: string; leaveDate: string | null }[]
}

type WDef = { i: string; titel: string; def: Omit<LayoutItem, 'i'> }

const WIDGETS: WDef[] = [
  { i: 'tile-contributie', titel: 'Contributie', def: { x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 } },
  { i: 'tile-inschrijvingen', titel: 'Inschrijvingen', def: { x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2 } },
  { i: 'tile-aanwezig', titel: 'Aanwezig', def: { x: 6, y: 0, w: 3, h: 2, minW: 2, minH: 2 } },
  { i: 'tile-examens', titel: 'Examens', def: { x: 9, y: 0, w: 3, h: 2, minW: 2, minH: 2 } },
  { i: 'lessen', titel: 'Komende lessen', def: { x: 0, y: 2, w: 6, h: 5, minW: 3, minH: 3 } },
  { i: 'trend', titel: 'Aanwezigheid laatste 7 dagen', def: { x: 6, y: 2, w: 3, h: 5, minW: 2, minH: 3 } },
  { i: 'examens', titel: '🥋 Examens in zicht', def: { x: 9, y: 2, w: 3, h: 5, minW: 2, minH: 3 } },
  { i: 'vlaggen', titel: '⚠️ Reserveringen & stoppend', def: { x: 0, y: 7, w: 6, h: 4, minW: 2, minH: 2 } },
  { i: 'snel', titel: '⚡ Snel naar', def: { x: 6, y: 7, w: 3, h: 4, minW: 2, minH: 2 } },
  { i: 'gestopt', titel: 'Recent gestopt', def: { x: 9, y: 7, w: 3, h: 4, minW: 2, minH: 2 } },
]

const LS_KEY = 'admin-dash-l…y-v1'
const LS_HIDDEN = 'admin-dash-hidden-v1'
const BPS = ['lg', 'md', 'sm'] as const

function baseLayout(bp: string): LayoutItem[] {
  const cols = bp === 'lg' ? 12 : bp === 'md' ? 6 : 4
  // klein scherm: alles onder elkaar, volle breedte
  let y = 0
  return WIDGETS.map(w => {
    const h = bp === 'sm' ? Math.min(w.def.h, 4) : w.def.h
    const item: LayoutItem = bp === 'lg'
      ? { i: w.i, ...w.def }
      : { i: w.i, x: 0, y, w: cols, h }
    y += h
    return item
  })
}

export default function AdminDashboard({ d }: { d: DashData }) {
  const [layouts, setLayouts] = React.useState<ResponsiveLayouts | null>(null)
  const [hidden, setHidden] = React.useState<string[]>([])
  const [edit, setEdit] = React.useState(true)
  const [menu, setMenu] = React.useState(false)
  const { width, mounted, containerRef } = useContainerWidth({ measureBeforeMount: true })

  React.useEffect(() => {
    let saved: ResponsiveLayouts | null = null
    try { saved = JSON.parse(localStorage.getItem(LS_KEY) ?? 'null') } catch { /* noop */ }
    const merged: ResponsiveLayouts = {}
    for (const bp of BPS) {
      const cur = saved?.[bp] ?? []
      const known = new Set(WIDGETS.map(w => w.i))
      merged[bp] = [
        ...cur.filter(l => known.has(l.i)),
        ...baseLayout(bp).filter(n => !cur.some(l => l.i === n.i)),
      ]
    }
    setLayouts(merged)
    try { setHidden(JSON.parse(localStorage.getItem(LS_HIDDEN) ?? '[]')) } catch { /* noop */ }
  }, [])

  const onLayoutChange = (_cur: readonly LayoutItem[], all: ResponsiveLayouts) => {
    setLayouts(all)
    localStorage.setItem(LS_KEY, JSON.stringify(all))
  }
  const toggle = (i: string) => {
    const next = hidden.includes(i) ? hidden.filter(x => x !== i) : [...hidden, i]
    setHidden(next)
    localStorage.setItem(LS_HIDDEN, JSON.stringify(next))
    setMenu(false)
  }
  const reset = () => {
    localStorage.removeItem(LS_KEY)
    localStorage.removeItem(LS_HIDDEN)
    setHidden([])
    setLayouts(null)
    setTimeout(() => setLayouts(Object.fromEntries(BPS.map(bp => [bp, baseLayout(bp)]))), 0)
    setMenu(false)
  }

  if (!layouts) {
    return <div className="space-y-4"><div className="h-8 w-40 animate-pulse rounded bg-gray-100" /><div className="h-64 animate-pulse rounded-xl bg-gray-100" /></div>
  }

  const zichtbaar = WIDGETS.filter(w => !hidden.includes(w.i))

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#2a2a2a]">Start</h1>
          <p className="mt-1 text-sm text-gray-500">
            {new Date(d.nowIso).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {d.actieveLeden} actieve leden
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setEdit(e => !e)}
            className={`rounded-lg border px-3 py-2 text-xs font-semibold ${edit ? 'border-[#a90000] bg-[#fdf6f6] text-[#a90000]' : 'border-gray-300 bg-white text-gray-600'}`}>
            {edit ? '✓ Bewerken klaar' : '✋ Indeling aanpassen'}
          </button>
          <div className="relative">
            <button onClick={() => setMenu(m => !m)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-600">Widgets ▾</button>
            {menu && (
              <div className="absolute right-0 z-30 mt-1 w-64 rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
                {WIDGETS.map(w => (
                  <label key={w.i} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-gray-50">
                    <input type="checkbox" checked={!hidden.includes(w.i)} onChange={() => toggle(w.i)} />
                    <span className={hidden.includes(w.i) ? 'text-gray-400' : 'text-[#2a2a2a]'}>{w.titel}</span>
                  </label>
                ))}
                <button onClick={reset} className="mt-1 w-full rounded-lg bg-gray-100 px-2 py-1.5 text-left text-xs font-semibold text-gray-600 hover:bg-gray-200">↺ Standaardindeling herstellen</button>
              </div>
            )}
          </div>
          <Link href="/admin/aanwezigheid/les" className="rounded-xl bg-[#a90000] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#8c0000]">✏️ Les invullen</Link>
        </div>
      </div>

      {edit && <p className="mb-3 text-xs text-gray-400">Sleep widgets bij hun kop, sleep een hoek om te vergroten of verkleinen, zet widgets uit via “Widgets”. De indeling wordt per schermformaat onthouden.</p>}

      <div ref={containerRef} className="w-full">
      {!mounted ? (
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
      ) : (
      <ResponsiveGridLayout
        className="dash-grid"
        width={width}
        layouts={layouts}
        breakpoints={{ lg: 1024, md: 640, sm: 0 }}
        cols={{ lg: 12, md: 6, sm: 4 }}
        rowHeight={56}
        margin={[12, 12]}
        dragConfig={{ enabled: edit, handle: '.w-drag', threshold: 4 }}
        resizeConfig={{ enabled: edit, handles: ['se', 's', 'e', 'sw', 'nw', 'ne', 'n', 'w'] }}
        onLayoutChange={onLayoutChange}
      >
        {zichtbaar.map(w => (
          <div key={w.i} className={`w-card${edit ? ' w-edit' : ''}`}>
            <div className="w-drag">
              <span className="w-titel">{w.titel}</span>
              {edit && <span className="w-grip" aria-hidden>⠿</span>}
            </div>
            <div className="w-body">{widgetInhoud(w.i, d)}</div>
          </div>
        ))}
      </ResponsiveGridLayout>
      )}
      </div>
    </div>
  )
}

function widgetInhoud(i: string, d: DashData): React.ReactNode {
  const t = d.tiles
  switch (i) {
    case 'tile-contributie':
      return <Klik href="/admin/contributie" titel="Contributie" value={`${t.contributieOpen} open`} sub={`€${t.contributieSom.toFixed(0)} in ${d.kwLabel}`} accent={t.contributieOpen > 0 ? 'text-red-700' : 'text-green-700'} />
    case 'tile-inschrijvingen':
      return <Klik href="/admin/inschrijvingen" titel="Inschrijvingen" value={t.inschrijvingen} sub={t.inschrijvingen ? 'wachten op goedkeuring' : 'niets te doen'} accent={t.inschrijvingen ? 'text-[#a90000]' : ''} />
    case 'tile-aanwezig':
      return <Klik href="/admin/aanwezigheid" titel="Aanwezig (alles)" value={`${t.aanwPct}%`} sub={`${t.aanwVan}/${t.aanwNoem} registraties`} />
    case 'tile-examens':
      return <Klik href="/admin/exams" titel="Examens" value={t.examensGepland} sub={t.examensGepland ? 'gepland' : 'geen gepland'} />
    case 'lessen':
      return d.upcoming.length === 0
        ? <Leeg tekst="Geen lessen gepland." />
        : <div className="space-y-1.5">{d.upcoming.map(l => (
            <Link key={l.id} href={`/admin/aanwezigheid/les?dag=${l.id}`} className="flex items-center justify-between rounded-lg border border-gray-100 p-2.5 hover:border-[#a90000]/40">
              <div>
                <p className="text-sm font-semibold text-[#2a2a2a]">
                  {new Date(l.datum).toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })}
                  <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-600">{(GROEP_LABEL as Record<string, string>)[l.groep] ?? l.groep}</span>
                </p>
                {l.activity && <p className="mt-0.5 text-xs text-gray-500">🎯 {l.activity}</p>}
              </div>
              <div className="text-right text-xs text-gray-500">{l.ingevuld ? <>{l.aanw} ✅ · {l.afg} 🅰</> : <span className="text-[#a90000]">Invullen →</span>}</div>
            </Link>
          ))}</div>
    case 'trend':
      return d.trend.length === 0
        ? <Leeg tekst="Nog geen data" />
        : <div className="space-y-1.5">{d.trend.map((x, k) => (
            <div key={k} className="flex items-center gap-2 text-xs">
              <span className="w-14 shrink-0 text-gray-500">{x.label}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded bg-gray-100"><div className="h-full rounded bg-[#a90000]" style={{ width: `${x.pct}%` }} /></div>
              <span className="w-9 shrink-0 text-right font-medium">{x.pct}%</span>
            </div>
          ))}</div>
    case 'examens':
      return d.examList.length === 0
        ? <Leeg tekst="Niemand komt in aanmerking" />
        : <div className="space-y-1.5">{d.examList.map(e => (
            <Link key={e.id} href={`/admin/students/${e.id}`} className="flex items-center gap-2.5 rounded-lg border border-gray-100 p-2 hover:border-[#a90000]/40">
              <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-gray-300" style={{ backgroundColor: (BELT_COLORS as Record<string, string>)[e.belt] ?? '#ccc' }} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#2a2a2a]">{e.naam}</p>
                <p className="text-xs text-gray-500">nu {getBeltLabel(e.belt as BeltLevel)} → <b className="text-[#a90000]">{e.next}</b></p>
              </div>
              <span className="shrink-0 text-xs text-gray-400">{e.maanden ?? '?'} mnd</span>
            </Link>
          ))}</div>
    case 'vlaggen':
      return d.vlaggen.length === 0
        ? <Leeg tekst="Niemand gevlagd" />
        : <div className="space-y-1.5">{d.vlaggen.map(m => (
            <Link key={m.id} href="/admin/leden" className="flex items-center justify-between rounded-lg border border-gray-100 p-2 text-sm hover:border-[#a90000]/40">
              <span className="font-medium text-[#2a2a2a]">{m.naam}</span>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${m.status === 'RESERVE' ? 'bg-amber-100 text-amber-800' : 'bg-orange-100 text-orange-800'}`}>{m.status === 'RESERVE' ? 'reserve' : 'stopt?'}</span>
            </Link>
          ))}</div>
    case 'snel':
      return <div className="grid grid-cols-2 gap-2">{[
        ['/admin/aanwezigheid/les', '🥋 Lesmodus'], ['/admin/leden', '👥 Leden'],
        ['/admin/contributie', '💶 Contributie'], ['/admin/aanwezigheid', '📊 Aanwezigheid'],
        ['/admin/exams/new', '🥇 Examen plannen'], ['/admin/inschrijvingen', '📝 Inschrijvingen'],
      ].map(([h, lbl]) => (
        <Link key={h} href={h} className="rounded-lg border border-gray-100 p-2.5 text-center text-xs font-semibold text-[#2a2a2a] hover:border-[#a90000]/40 hover:text-[#a90000]">{lbl}</Link>
      ))}</div>
    case 'gestopt':
      return d.recentGestopt.length === 0
        ? <Leeg tekst="Niemand recent gestopt" />
        : <div className="space-y-1.5">{d.recentGestopt.map(m => (
            <Link key={m.id} href="/admin/leden" className="flex items-center justify-between rounded-lg border border-gray-100 p-2 text-sm hover:border-[#a90000]/40">
              <span className="text-[#2a2a2a]">{m.naam}</span>
              <span className="text-xs text-gray-400">{m.leaveDate ? new Date(m.leaveDate).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }) : 'archief'}</span>
            </Link>
          ))}</div>
    default: return null
  }
}

function Klik({ href, titel, value, sub, accent = '' }: { href: string; titel: string; value: string | number; sub: string; accent?: string }) {
  return (
    <Link href={href} className="flex h-full flex-col justify-center hover:opacity-80">
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">{titel}</p>
      <p className={`mt-0.5 text-2xl font-bold ${accent || 'text-[#2a2a2a]'}`}>{value}</p>
      <p className="mt-0.5 text-xs text-gray-500">{sub}</p>
    </Link>
  )
}
function Leeg({ tekst }: { tekst: string }) {
  return <p className="grid h-full place-items-center text-center text-sm text-gray-400">{tekst}</p>
}
