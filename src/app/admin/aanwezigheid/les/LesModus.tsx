'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { GROEP_LABEL, STATUS_INFO } from '@/lib/admin2'
import { BeltVak } from '@/components/admin/BeltVak'

type Lid = { id: string; naam: string; status: string | null; gast?: boolean; trainer?: boolean; tijdelijk?: boolean; groep?: string; hist: Record<string, string>; band?: { huidig: string | null; huidigKleur: string; volgende: string | null; volgendeKleur: string; slip: boolean }; geenPortret?: boolean; geenNaam?: boolean }
type DagInfo = { id: string; datum: string; groep: string; groepLabel: string; activity: string | null; vakantie?: boolean; cancelled: boolean }
type DagTab = { id: string; label: string; actief: boolean }
type HistDag = { id: string; label: string }

const KNoppen: { status: string; kort: string }[] = [
  { status: 'AANWEZIG', kort: '✅' },
  { status: 'AFGEMELD', kort: '🅰' },
  { status: 'ZIEK', kort: '🤒' },
  { status: 'NIET_AANWEZIG', kort: '❌' },
  { status: 'VAKANTIE', kort: '🏖' },
  { status: 'PROEFLES', kort: '🆕' },
]

export function LesModus({ dag, leden: initLeden, recenteDagen, historie }: { dag: DagInfo; leden: Lid[]; recenteDagen: DagTab[]; historie: HistDag[] }) {
  const router = useRouter()
  const [leden, setLeden] = useState(initLeden)
  const [activity, setActivity] = useState(dag.activity ?? '')
  const [opgeslagen, setOpgeslagen] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [gastNaam, setGastNaam] = useState<string | null>(null)
  const [gastBusy, setGastBusy] = useState(false)
  // Leden zoeken om tijdelijk aan DEZE les toe te voegen (lid uit andere groep,
  // oud-lid, andere locatie). Alleen een attendance-rij voor deze dag — de
  // hoofdgroep van het lid blijft onaangeroerd.
  const [zoekQ, setZoekQ] = useState('')
  const [zoekResult, setZoekResult] = useState<{ id: string; naam: string; clubStatus: string; actief: boolean; groep: string | null; alOpDag: boolean; trainer: boolean; band: NonNullable<Lid['band']> }[]>([])
  const [zoekBusy, setZoekBusy] = useState(false)
  const [isVakantie, setIsVakantie] = useState(!!dag.vakantie)
  const [vakBusy, setVakBusy] = useState(false)

  // Vakantie afzetten: de dag wordt 'Geen les' en iedereen in de groep krijgt
  // status VAKANTIE (ook gasten die er al staan). Uitzetten haalt alleen de
  // VAKANTIE-regels weer weg.
  async function zetVakantie(next: boolean) {
    // Vraag om een reden (bv. Zomervakantie) — die komt in de website-agenda.
    // Annuleren (null) breekt af; leeg = vakantie zonder agendabericht.
    let reden: string | undefined
    if (next) {
      const ingetypt = window.prompt('Reden van de vakantie? (bv. Zomervakantie, dichte zaal) — dit verschijnt in de agenda', '')
      if (ingetypt === null) return
      reden = ingetypt.trim() || undefined
    }
    setVakBusy(true)
    setIsVakantie(next)
    setLeden(prev => next
      ? prev.map(l => ({ ...l, status: 'VAKANTIE' }))
      : prev.map(l => (l.status === 'VAKANTIE' ? { ...l, status: null } : l)))
    try {
      const res = await fetch('/api/admin2/les-vakantie', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainingDayId: dag.id, vakantie: next, ...(reden ? { reden } : {}) }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setOpgeslagen(next ? 'Vakantie gezet — iedereen op 🏖' : 'Vakantie uitgezet')
      router.refresh()
    } catch (e) {
      setIsVakantie(!next)
      setOpgeslagen(`Fout: ${(e as Error).message}`)
    } finally {
      setVakBusy(false)
    }
  }

  // Zoeken op naam (debounce) voor tijdelijk toevoegen aan deze les
  useEffect(() => {
    if (zoekQ.trim().length < 2) { setZoekResult([]); return }
    const t = setTimeout(async () => {
      setZoekBusy(true)
      try {
        const res = await fetch(`/api/admin2/les-zoeken?q=${encodeURIComponent(zoekQ.trim())}&dag=${dag.id}`)
        const j = await res.json()
        setZoekResult(j.resultaten ?? [])
      } catch { setZoekResult([]) } finally { setZoekBusy(false) }
    }, 300)
    return () => clearTimeout(t)
  }, [zoekQ, dag.id])

  async function voegLidToe(s: { id: string; naam: string; groep: string | null; band: NonNullable<Lid['band']>; geenPortret?: boolean; geenNaam?: boolean }) {
    setZoekBusy(true)
    try {
      // Alleen een attendance-rij voor deze dag: het lid blijft in zijn eigen groep.
      setLeden(prev => prev.some(l => l.id === s.id) ? prev : [...prev, { id: s.id, naam: s.naam, status: null, tijdelijk: true, groep: s.groep ?? undefined, hist: {}, band: s.band, geenPortret: s.geenPortret, geenNaam: s.geenNaam }])
      setZoekQ('')
      setZoekResult([])
      setOpgeslagen(`${s.naam} toegevoegd aan deze les (tijdelijk)`)
    } finally { setZoekBusy(false) }
  }

  async function voegGastToe() {
    if (!gastNaam?.trim() || gastBusy) return
    setGastBusy(true)
    try {
      const res = await fetch('/api/admin2/gast', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ naam: gastNaam.trim(), groep: dag.groep }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error)
      setLeden(prev => prev.some(l => l.id === j.id) ? prev : [...prev, { id: j.id, naam: j.naam, status: null, gast: true, hist: {} }])
      setGastNaam(null)
      setOpgeslagen(`${j.naam} toegevoegd als gast`)
    } catch (e) {
      setOpgeslagen(`Fout: ${(e as Error).message}`)
    } finally {
      setGastBusy(false)
    }
  }

  async function zetStatus(lidId: string, status: string | null) {
    setBusy(lidId)
    setLeden(prev => prev.map(l => l.id === lidId ? { ...l, status } : l))
    try {
      const res = await fetch('/api/admin2/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: lidId, trainingDayId: dag.id, status }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setOpgeslagen(`${new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })} opgeslagen`)
    } catch (e) {
      setOpgeslagen(`Fout: ${(e as Error).message}`)
    } finally {
      setBusy(null)
    }
  }

  async function slaActivityOp(next: string) {
    setActivity(next)
    try {
      await fetch('/api/admin2/trainingday', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: dag.id, activity: next }),
      })
    } catch { /* stil */ }
  }

  const tellen = (s: string) => leden.filter(l => l.status === s && !l.trainer).length
  const aantalAanwezig = (l: Lid) => Object.values(l.hist).filter(s => s === 'AANWEZIG').length
  const aantalMetData = (l: Lid) => Object.values(l.hist).filter(s => s && s !== 'VAKANTIE').length

  // Groepsmetrics: vandaag + gemiddelde over de verlopen lessen in beeld.
  // Trainers meeten we niet mee in de opkomst — dat blijft een ledengetal.
  const ledenZonderTrainers = leden.filter(l => !l.trainer)
  const verlopen = historie.length
  const dagAanwezig = tellen('AANWEZIG')
  const dagGemeld = ledenZonderTrainers.filter(l => l.status && l.status !== 'VAKANTIE').length
  const histTotaalAanwezig = ledenZonderTrainers.reduce((s, l) => s + aantalAanwezig(l), 0)
  const histTotaalGemeld = ledenZonderTrainers.reduce((s, l) => s + aantalMetData(l), 0)
  const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : null)
  const gemPerLes = verlopen > 0 ? (histTotaalAanwezig / verlopen).toFixed(1).replace('.', ',') : null

  return (
    <div className="space-y-4">
      {/* Dagwissel */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {recenteDagen.map(d => (
          <Link key={d.id} href={`/admin/aanwezigheid/les?dag=${d.id}`}
            className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-medium ${d.actief ? 'border-[#a90000] bg-[#a90000] text-white' : 'border-gray-300 bg-white text-gray-600'}`}>
            {d.label}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-[#2a2a2a]">
            {new Date(dag.datum).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}
            {dag.vakantie && <span className="ml-2 align-middle rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-600">🏖 Geen les — vakantie</span>}
          </h1>
          <p className="text-sm text-gray-500">{dag.groepLabel} · {leden.filter(l => !l.trainer).length} leden{leden.some(l => l.trainer) ? ` + ${leden.filter(l => l.trainer).length} trainer(s)` : ''}</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button onClick={() => zetVakantie(!isVakantie)} disabled={vakBusy}
            title="Zet deze les op vakantie: iedereen in de groep wordt als vakantie geregistreerd"
            className={`rounded-full border px-3 py-1.5 font-semibold transition-colors ${isVakantie ? 'border-sky-500 bg-sky-500 text-white' : 'border-gray-300 bg-white text-gray-600 hover:border-sky-400 hover:text-sky-600'}`}>
            🏖 {isVakantie ? 'Vakantie — uit zetten?' : 'Vakantie deze les'}
          </button>
          <span className="rounded-full bg-green-100 px-2.5 py-1 text-green-800">{tellen('AANWEZIG')} ✅</span>
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-800">{tellen('AFGEMELD')} 🅰</span>
          <span className="rounded-full bg-red-100 px-2.5 py-1 text-red-800">{tellen('NIET_AANWEZIG')} ❌</span>
          {opgeslagen && <span className="text-gray-400">{opgeslagen}</span>}
        </div>
      </div>

      {/* Metrics: vandaag vs. gemiddelde van de verlopen lessen */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600">
        <span className="font-semibold uppercase tracking-wide text-gray-400">📊</span>
        <span>Vandaag: <b>{dagAanwezig}/{dagGemeld || ledenZonderTrainers.length}</b> aanwezig{pct(dagAanwezig, dagGemeld) !== null && <> · <b>{pct(dagAanwezig, dagGemeld)}%</b></>}</span>
        {verlopen > 0 && <>
          <span>Gemiddelde laatste {verlopen} lessen: <b>{gemPerLes}</b> aanwezig per les</span>
          <span>{pct(histTotaalAanwezig, histTotaalGemeld) !== null && <>opkomst <b>{pct(histTotaalAanwezig, histTotaalGemeld)}%</b></>}</span>
        </>}
      </div>

      {/* Lesonderwerp */}
      <div className="rounded-md border border-gray-200 bg-white p-3">
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">🎯 Onderwerp / activiteit van deze les</label>
        <input value={activity} onChange={e => setActivity(e.target.value)}
          onBlur={() => slaActivityOp(activity)}
          placeholder="bv. valvastheid + grondwerk"
          className="w-full rounded-sm border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none" />
      </div>

      {/* Lid zoeken en tijdelijk aan deze les toevoegen */}
      <div className="rounded-md border border-dashed border-gray-300 bg-white p-3">
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">➕ Lid zoeken en tijdelijk aan deze les toevoegen</label>
        <p className="mb-2 text-xs text-gray-400">Voor een lid dat normaal in een andere groep les heeft, een oud-lid dat meedoet, of iemand van de andere locatie. Hij blijft in zijn eigen groep — alleen deze les krijgt een registratie.</p>
        <input value={zoekQ} onChange={e => setZoekQ(e.target.value)}
          placeholder="Typ een naam (min. 2 letters)…"
          className="w-full rounded-sm border border-gray-300 px-3 py-2 text-sm focus:border-[#a90000] focus:outline-none" />
        {zoekResult.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {zoekResult.map(s => (
              <button key={s.id} onClick={() => voegLidToe(s)} disabled={zoekBusy}
                className="flex w-full items-center justify-between gap-2 rounded-sm border border-gray-200 bg-white px-3 py-2 text-left text-sm hover:border-[#a90000]/50 disabled:opacity-50">
                <span className="flex items-center gap-2 font-medium text-[#2a2a2a]">
                  <BeltVak belt={s.band.huidig} size={10} />
                  {s.naam}
                  {s.trainer && <span className="rounded bg-[#2a2a2a] px-1.5 py-0.5 text-[10px] font-semibold text-white">trainer</span>}
                </span>
                <span className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{GROEP_LABEL[s.groep ?? ''] ?? 'geen groep'}{s.actief ? '' : ' · gestopt'}{s.alOpDag ? ' · staat al op deze les' : ''}</span>
                  <span className="rounded-full bg-[#a90000] px-2 py-0.5 font-semibold text-white">+</span>
                </span>
              </button>
            ))}
          </div>
        )}
        {zoekQ.trim().length >= 2 && !zoekBusy && zoekResult.length === 0 && (
          <p className="mt-2 text-xs text-gray-400">Niets gevonden — voor een echte gast/proefles gebruik je het vak eronder.</p>
        )}
      </div>

      {/* Gast / proefles toevoegen */}
      <div className="rounded-md border border-dashed border-gray-300 bg-white p-3">
        {gastNaam === null ? (
          <button onClick={() => setGastNaam('')} className="text-sm font-medium text-[#a90000]">+ Gast / proefles toevoegen</button>
        ) : (
          <div className="flex gap-2">
            <input autoFocus value={gastNaam} onChange={e => setGastNaam(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && voegGastToe()}
              placeholder="Naam gast (voor + achternaam)"
              className="flex-1 rounded-sm border border-gray-300 px-3 py-2 text-sm focus:border-[#a90000] focus:outline-none" />
            <button onClick={voegGastToe} disabled={!gastNaam.trim() || gastBusy}
              className="rounded-sm bg-[#a90000] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {gastBusy ? '…' : 'Toevoegen'}
            </button>
            <button onClick={() => setGastNaam(null)} className="rounded-sm border border-gray-300 px-3 py-2 text-sm text-gray-500">✕</button>
          </div>
        )}
      </div>

      {/* Ledenlijst met grote knoppen */}
      <div className="space-y-2">
        {leden.map(l => (
          <div key={l.id} className={`rounded-md border bg-white p-3 ${busy === l.id ? 'opacity-60' : ''}`}>
            <div className="mb-2 flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-semibold text-[#2a2a2a]">
                <span>{l.naam}</span>
                {l.geenPortret && <span className="text-xs" title="Geen toestemming portretrecht — niet fotograferen/filmen">📷🚫</span>}
                {l.geenNaam && <span className="text-xs" title="Geen toestemming naamsvermelding (uitslagen, site, socials)">🏷️🚫</span>}
                {l.band && (
                  <span title={`Band: ${l.band.huidig ?? 'nog geen band'} → volgende: ${l.band.volgende ?? '—'}${l.band.slip ? ' (met slip)' : ''}`}>
                    <BeltVak belt={l.band.huidig} size={10} />
                  </span>
                )}
                {l.gast && <span className="rounded border border-sky-300 bg-sky-50 px-1.5 py-0.5 text-[10px] font-medium text-sky-700">gast</span>}
                {l.tijdelijk && <span className="rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700" title={`Tijdelijk toegevoegd aan deze les — standaardgroep: ${GROEP_LABEL[l.groep ?? ''] ?? 'geen groep'}`}>tijdelijk</span>}
                {l.trainer && <span className="rounded bg-[#2a2a2a] px-1.5 py-0.5 text-[10px] font-semibold text-white">trainer</span>}
              </p>
              <div className="flex items-center gap-2">
                {historie.length > 0 && (
                  <span className="flex items-center gap-1.5" title={`Laatste ${historie.length} lessen van deze groep`}>
                    <span className="hidden items-center gap-0.5 sm:flex">
                      {historie.map(h => {
                        const s = l.hist[h.id]
                        return <span key={h.id} className={`flex h-5 w-5 items-center justify-center rounded text-[10px] ${s ? STATUS_INFO[s]?.klas ?? 'bg-gray-100' : 'bg-gray-50 text-gray-300 border border-gray-100'}`}>{s ? STATUS_INFO[s]?.emoji : '·'}</span>
                      })}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">{aantalAanwezig(l)}/{aantalMetData(l)} eerdere</span>
                  </span>
                )}
                {l.status && (
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_INFO[l.status]?.klas ?? ''}`}>
                    {STATUS_INFO[l.status]?.emoji} {STATUS_INFO[l.status]?.label}
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {KNoppen.map(k => (
                <button key={k.status} onClick={() => zetStatus(l.id, l.status === k.status ? null : k.status)}
                  className={`min-h-[44px] rounded-sm border text-base font-semibold transition-all ${
                    l.status === k.status
                      ? 'border-[#a90000] bg-[#a90000] text-white shadow-inner'
                      : 'border-gray-200 bg-gray-50 text-gray-500 active:scale-95'
                  }`}
                  title={STATUS_INFO[k.status]?.label}>
                  {k.kort}
                </button>
              ))}
            </div>
          </div>
        ))}
        {leden.length === 0 && (
          <div className="rounded-md border border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
            Geen leden in deze groep. Wijs groepen toe via Leden → lid → Bewerken.
          </div>
        )}
      </div>

      <p className="text-center text-[11px] text-gray-400">Tik een knop nogmaals om te wissen · alles slaat automatisch op</p>
    </div>
  )
}
