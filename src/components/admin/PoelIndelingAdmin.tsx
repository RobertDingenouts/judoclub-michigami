"use client"

import { useEffect, useMemo, useRef, useState } from "react"

// ---- types ----
type Deelnemer = {
  id: string; v: string; a: string; c: string; g: "M" | "V";
  l: number | null; w: number | null; b: string; bl: string; slip?: string; uit?: boolean; uitVan?: number
}
type Poel = { naam: string; m: string[] }
type State = { deelnemers: Deelnemer[]; poeelen: Poel[] }

const BANDKLEUR: Record<string, string> = {
  WIT: "#ffffff", GEEL: "#f7c948", ORANJE: "#f2842b", GROEN: "#2f9e44",
  BLAUW: "#1c5fae", BRUIN: "#7b4a2d", ZWART: "#141414",
}
const BANDRANG = ["WIT", "GEEL", "ORANJE", "GROEN", "BLAUW", "BRUIN", "ZWART"]

// ---- seed (Jubileumtoernooi 50 jaar OVJV, 17-10-2026) ----
const SEED: State = {
  deelnemers: [
    { id: "myla", v: "Myla", a: "Geers", c: "Michigami", g: "V", l: 7, w: 28, b: "WIT", bl: "Wit" },
    { id: "luukm", v: "Luuk", a: "Mosch", c: "OVJV", g: "M", l: 8, w: 25, b: "WIT", bl: "Wit" },
    { id: "vive", v: "Vive", a: "Dingenouts", c: "Michigami", g: "V", l: 8, w: 30, b: "GEEL", bl: "Geel" },
    { id: "nathan", v: "Nathan", a: "van Dieren", c: "OVJV", g: "M", l: 9, w: 32, b: "WIT", bl: "Wit" },
    { id: "marina", v: "Marina", a: "van Hees", c: "Michigami", g: "V", l: 9, w: 37, b: "WIT", bl: "Wit" },
    { id: "jax", v: "Jax", a: "van Dijk", c: "Shintai", g: "M", l: 9, w: 37.5, b: "GEEL", bl: "Geel" },
    { id: "rayn", v: "Rayn", a: "Geers", c: "Michigami", g: "M", l: 10, w: 33, b: "WIT", bl: "Wit" },
    { id: "luuka", v: "Luuk", a: "van Adrichem", c: "Michigami", g: "M", l: 10, w: 36, b: "GEEL", bl: "Geel" },
    { id: "steff", v: "Steff", a: "de Wit", c: "OVJV", g: "M", l: 10, w: 42, b: "WIT", bl: "Wit" },
    { id: "manuel", v: "Manuel", a: "van Hees", c: "Michigami", g: "M", l: 11, w: 50, b: "ORANJE", bl: "Oranje" },
    { id: "thijs", v: "Thijs", a: "Mosch", c: "OVJV", g: "M", l: 11, w: 51, b: "GEEL", bl: "Geel + oranje slip", slip: "ORANJE" },
    { id: "flore", v: "Flore", a: "Bogers", c: "Yoshi", g: "V", l: 11, w: 39, b: "ORANJE", bl: "Oranje" },
    { id: "lotte", v: "Lotte", a: "van der Werf", c: "Michigami", g: "V", l: 12, w: 39, b: "ORANJE", bl: "Oranje + groene slip", slip: "GROEN" },
    { id: "jaidy", v: "Jaidy", a: "Ringelberg", c: "Michigami", g: "M", l: 12, w: 53, b: "GEEL", bl: "Geel" },
    { id: "ilvy", v: "Ilvy", a: "De Wolf", c: "OVJV", g: "V", l: 12, w: 50, b: "ORANJE", bl: "Oranje" },
    { id: "ivo", v: "Ivo", a: "Poot", c: "Michigami", g: "M", l: 12, w: 59, b: "ORANJE", bl: "Oranje + groene slip (13 in dec)", slip: "GROEN" },
    { id: "elin", v: "Elin", a: "Bogers", c: "Yoshi", g: "V", l: 14, w: 52, b: "ORANJE", bl: "Oranje" },
    { id: "jaz", v: "Jaz", a: "Aarts", c: "via Cor Schuurbiers", g: "V", l: 13, w: 45, b: "BLAUW", bl: "Blauw (08-06-2013)" },
    { id: "bikkel", v: "Bikkel", a: "Verweij", c: "Michigami", g: "M", l: 17, w: 117, b: "BLAUW", bl: "Blauw" },
    { id: "ashley", v: "Ashley", a: "Koens", c: "Michigami", g: "V", l: 19, w: 65, b: "BLAUW", bl: "Blauw", uit: true },
    { id: "pepijn", v: "Pepijn", a: "Vortman", c: "Michigami", g: "M", l: 20, w: 80, b: "BRUIN", bl: "Bruin" },
    { id: "milo", v: "Milo", a: "van der Werf", c: "Yoshi", g: "M", l: 7, w: 22, b: "WIT", bl: "Wit" },
    { id: "floris", v: "Floris", a: "van Dijk", c: "Yoshi", g: "M", l: 8, w: 23, b: "GEEL", bl: "Geel" },
    { id: "daniel", v: "Daniël", a: "Petrykiv", c: "Yoshi", g: "M", l: 7, w: 25, b: "WIT", bl: "Wit" },
    { id: "mika", v: "Mika", a: "Morice", c: "Michigami", g: "M", l: 8, w: 25, b: "WIT", bl: "Wit" },
    { id: "yorick", v: "Yorick", a: "Bouterse", c: "Yoshi", g: "M", l: 29, w: 79, b: "ZWART", bl: "Zwart 2e dan" },
    { id: "lindert", v: "Lindert", a: "Bogers", c: "Yoshi", g: "M", l: 42, w: 77, b: "BRUIN", bl: "Bruin" },
  ],
  poeelen: [
    { naam: "Poel 1", m: ["myla", "milo", "daniel"] },
    { naam: "Poel 2", m: ["luukm", "mika", "floris", "vive", "nathan"] },
    { naam: "Poel 3", m: ["marina", "jax", "steff", "luuka", "rayn"] },
    { naam: "Poel 4", m: ["flore", "lotte", "ilvy"] },
    { naam: "Poel 5", m: ["manuel", "thijs", "jaidy"] },
    { naam: "Poel 6", m: ["bikkel", "yorick", "lindert", "pepijn"] },
    { naam: "Poel 7", m: ["ivo", "jaz", "elin"] },
  ],
}

function paren(n: number): string[] {
  if (n === 2) return ["1/2", "1/2", "1/2"]
  if (n === 3) return ["1/2", "2/3", "1/3", "1/2", "2/3", "1/3"]
  if (n === 4) return ["1/2", "3/4", "1/3", "2/4", "1/4", "2/3"]
  if (n === 5) return ["1/2", "3/4", "1/5", "2/3", "4/5", "1/3", "2/5", "1/4", "3/5", "2/4"]
  const idx = [...Array(n).keys()].map(i => i + 1); const res: string[] = []
  for (let r = 0; r < n - 1; r++) {
    const rot = [idx[0], ...idx.slice(1).map((_, i) => idx[1 + (i + r) % (n - 1)])]
    for (let k = 0; k < n / 2; k++) res.push(rot[k] + "/" + rot[n - 1 - k])
  }
  return res
}

export default function PoelIndelingAdmin({ slug }: { slug: string }) {
  const [state, setState] = useState<State | null>(null)
  const [sorteer, setSorteer] = useState("leeftijd")
  const [status, setStatus] = useState("Laden…")
  const [geselecteerd, setGeselecteerd] = useState<string | null>(null)
  const [showNieuw, setShowNieuw] = useState(false)
  const [dragId, setDragId] = useState<string | null>(null)
  const [dropState, setDropState] = useState<Record<string, "ok" | "nee">>({})
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dragClone = useRef<HTMLDivElement | null>(null)
  const longPress = useRef<ReturnType<typeof setTimeout> | null>(null)
  const justDragged = useRef(false)
  const isTouch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches

  // ---- laden ----
  useEffect(() => {
    fetch(`/api/admin/tournament/${slug}`)
      .then(r => r.status === 404 ? { data: SEED } : r.json())
      .then(j => { setState(j.data); setStatus("Geladen uit database") })
      .catch(() => { setState(SEED); setStatus("Fout bij laden — seed gebruikt") })
  }, [slug])

  // ---- automatisch opslaan (debounce) ----
  function scheduleSave(next: State) {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      setStatus("Opslaan…")
      fetch(`/api/admin/tournament/${slug}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next),
      }).then(r => r.ok ? setStatus("Opgeslagen " + new Date().toLocaleTimeString()) : setStatus("Opslaan mislukt"))
        .catch(() => setStatus("Opslaan mislukt"))
    }, 600)
  }
  function update(fn: (s: State) => State) {
    setState(prev => { if (!prev) return prev; const next = fn(prev); scheduleSave(next); return next })
  }

  const pers = (id: string) => state?.deelnemers.find(x => x.id === id)
  const inPoel = (id: string) => state?.poeelen.find(p => p.m.includes(id))

  function sorteerList(ids: string[]): Deelnemer[] {
    const arr = ids.map(pers).filter(Boolean) as Deelnemer[]
    arr.sort((a, b) => {
      if (!!a.uit !== !!b.uit) return a.uit ? 1 : -1
      if (sorteer === "leeftijd") return (a.l ?? 999) - (b.l ?? 999) || (a.w ?? 999) - (b.w ?? 999)
      if (sorteer === "gewicht") return (a.w ?? 999) - (b.w ?? 999) || (a.l ?? 999) - (b.l ?? 999)
      if (sorteer === "band") return BANDRANG.indexOf(a.b) - BANDRANG.indexOf(b.b) || (a.l ?? 0) - (b.l ?? 0)
      return (a.v + a.a).localeCompare(b.v + b.a)
    })
    return arr
  }

  function verplaats(id: string, kolom: string | null) {
    if (pers(id)?.uit) return
    update(s => {
      const poeelen = s.poeelen.map(p => ({ ...p, m: p.m.filter(x => x !== id) }))
      if (kolom !== null && kolom !== "toew") poeelen[+kolom].m.push(id)
      return { ...s, poeelen }
    })
    setGeselecteerd(null)
  }
  function toggleUit(id: string) {
    update(s => {
      const p = s.deelnemers.find(x => x.id === id)
      const wasUit = !!p?.uit
      const bron = s.poeelen.findIndex(po => po.m.includes(id))
      const deelnemers = s.deelnemers.map(x => x.id === id
        ? { ...x, uit: !wasUit, uitVan: wasUit ? undefined : (bron >= 0 ? bron : undefined) }
        : x)
      let poeelen = s.poeelen.map(po => ({ ...po, m: po.m.filter(m => m !== id) }))
      if (wasUit && p?.uitVan != null && poeelen[p.uitVan]) {
        poeelen = poeelen.map((po, k) => k === p.uitVan ? { ...po, m: [...po.m, id] } : po)
      }
      return { deelnemers, poeelen }
    })
  }
  function nieuwePoel() {
    update(s => ({ ...s, poeelen: [...s.poeelen, { naam: "Poel " + (s.poeelen.length + 1), m: [] }] }))
  }
  function verwijderPoel(i: number) {
    if (!confirm("Deze poel leegmaken/verwijderen? Deelnemers gaan terug.")) return
    update(s => ({ ...s, poeelen: s.poeelen.filter((_, k) => k !== i) }))
  }
  function voegToe(d: Deelnemer) {
    update(s => ({ ...s, deelnemers: [...s.deelnemers, d] }))
    setShowNieuw(false)
  }
  function herstel() {
    if (!confirm("Startopstelling (Robins 6 poelen + 27 deelnemers) herstellen?")) return
    update(() => JSON.parse(JSON.stringify(SEED)))
  }

  // ---- printen ----
  function formulierHTML(po: Poel, i: number): string {
    const arr = sorteerList(po.m).filter(x => !x.uit)
    const ps = paren(arr.length)
    const posities = arr.map((_, n) => `<tr><td class="plaats">${n + 1}de plaats</td><td class="naam2"></td></tr>`).join("")
    const rijen = arr.map((x, j) => {
      const cells = ps.map(p => {
        const [a, b] = p.split("/").map(Number)
        const speelt = a === j + 1 || b === j + 1
        return speelt ? `<td class="speelt"></td>` : `<td class="x"><svg width="100%" height="100%" preserveAspectRatio="none"><rect width="100%" height="100%" fill="#111"/></svg></td>`
      }).join("")
      return `<tr><td class="nr">${j + 1}</td><td class="naam">${x.v} ${x.a}</td><td class="ver">${x.c}</td>${cells}<td class="tot"></td><td class="tot"></td><td class="tot"></td></tr>`
    }).join("")
    return `<div class="formulier">
      <div class="kop">
        <img src="${location.origin}/ovjv-logo.png" style="height:58px" />
        <div class="kopMidden"><h2>${po.naam}</h2><b>Jubileumtoernooi — 50 jaar OVJV</b><br>Plaats: Oud-Vossemeer (De Vossenkuil) &nbsp;·&nbsp; Datum: zaterdag 17 oktober 2026 &nbsp;·&nbsp; Organisator: Judoclub Michigami</div>
        <div class="kopRecht">Poel nr.: <b>${i + 1}</b><br>Mat nummer: ________</div>
      </div>
      <table class="grid"><tr><th class="nr">nr</th><th class="naam">Naam</th><th class="ver">vereniging</th>${ps.map(p => `<th class="pair">${p}</th>`).join("")}<th class="tot">gew.<br>partijen</th><th class="tot">aan.<br>punten</th><th class="tot">resultaat</th></tr>${rijen}</table>
      <div class="onderkant">
        <div class="resblok"><b>Resultaat:</b><table class="res"><tr><th></th><th>naam judoka</th></tr>${posities}</table></div>
        <div class="juryblok">Jurylid 1: ______________________ &nbsp;&nbsp; Jurylid 2: ______________________<br><br>
        Scheidsrechter 1: ______________ &nbsp; Scheidsrechter 2: ______________ &nbsp; Scheidsrechter 3: ______________</div>
      </div>
      <div class="regels">Puntentelling: Beslissing = 1 pt &nbsp;·&nbsp; Yuko = 5 pt &nbsp;·&nbsp; Waza-ari = 7 pt &nbsp;·&nbsp; Ippon = 10 pt &nbsp;&nbsp;|&nbsp;&nbsp; Shido's: 2 = yuko tegen &nbsp;·&nbsp; 3 = waza-ari tegen &nbsp;·&nbsp; 4 = hansoku-make &nbsp;&nbsp;|&nbsp;&nbsp; Osaekomi: 10s yuko / 15s waza-ari / 20s ippoon &nbsp;&nbsp;|&nbsp;&nbsp; Partijduren: juniors 2 min, seniors 3 min &nbsp;&nbsp;|&nbsp;&nbsp; Gelijk: beslissing scheidsrechter(s). &nbsp;&nbsp;Zwart vak = judoka speelt deze partij niet.</div>
    </div>`
  }
  function printPoelen(indices: number[]) {
    const w = window.open("", "_blank", "width=1000,height=700")
    if (!w) { alert("Pop-up geblokkeerd — sta pop-ups toe om te printen"); return }
    w.document.write(`<html><head><title>Poelformulieren</title><style>
      @page { size: A4 landscape; margin: 8mm; }
      html,body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
      body{font-family:'Times New Roman',serif;color:#000;margin:0;background:#fff}
      .formulier{page-break-after:always;padding:2mm 0}
      .formulier h2{margin:0 0 2px;font-size:20px}
      .kop{display:flex;align-items:center;gap:16px;border-bottom:3px solid #a90000;padding-bottom:6px;margin-bottom:8px}
      .kopMidden{flex:1}
      .kopRecht{text-align:right;font-size:13px;white-space:nowrap}
      table{border-collapse:collapse;width:100%;table-layout:fixed}
      th,td{border:1.5px solid #000;padding:5px 3px;font-size:12px;text-align:center;height:26px}
      th{background:#e8e8e8;font-size:11px;height:30px}
      .nr{width:8mm}.naam{width:38mm;text-align:left}.ver{width:26mm;text-align:left}
      .pair{font-weight:bold}.tot{width:15mm}
      td.naam,td.ver{text-align:left}
      td.speelt{background:#fff}
      td.x{padding:0}
      td.x svg{display:block}
      .onderkant{display:flex;gap:20px;margin-top:10px;align-items:flex-start}
      .resblok table{width:auto;table-layout:auto}
      .res th,.res td{border:1.5px solid #000;padding:4px 6px;font-size:12px;text-align:left;height:24px}
      .res th{background:#e8e8e8}
      .res td.plaats{width:24mm}
      .res td.naam2{width:90mm}
      .juryblok{flex:1;font-size:13px;line-height:1.7}
      .regels{margin-top:10px;font-size:10px;color:#333;border-top:1px solid #999;padding-top:4px}
      @media print{button{display:none}}
    </style></head><body>
      <button onclick="print()" style="margin:10px;padding:8px 16px">🖨 Print</button>
      ${indices.map(i => formulierHTML(state!.poeelen[i], i)).join("")}
    </body></html>`)
    w.document.close()
  }

  const stats = useMemo(() => {
    if (!state) return {}
    const out: Record<number, string> = {}
    state.poeelen.forEach((p, i) => {
      const arr = p.m.map(pers).filter(x => x && !x.uit) as Deelnemer[]
      if (!arr.length) { out[i] = "leeg"; return }
      const ls = arr.map(x => x.l!).filter(Boolean)
      const ws = arr.map(x => x.w!).filter(x => x != null)
      const avg = ls.length ? (ls.reduce((a, b) => a + b, 0) / ls.length).toFixed(1) : "?"
      out[i] = `${arr.length} judoka's · gem. ${avg} jr · ${ws.length ? Math.min(...ws) + "–" + Math.max(...ws) + " kg" : "gewicht onbekend"}`
    })
    return out
  }, [state])

  if (!state) return <div className="p-6 text-gray-500">Poelindeling laden…</div>

  const toe = state.poeelen.flatMap(p => p.m)
  const rest = state.deelnemers.filter(x => !toe.includes(x.id)).map(x => x.id)
  const actief = state.deelnemers.filter(x => !x.uit).length

  function nieuwePoelMet(id: string) {
    update(s => {
      const poeelen = s.poeelen.map(p => ({ ...p, m: p.m.filter(x => x !== id) }))
      poeelen.push({ naam: "Poel " + (poeelen.length + 1), m: [id] })
      return { ...s, poeelen }
    })
    setGeselecteerd(null)
  }
  function geldigVoor(id: string, key: string): boolean {
    const p = pers(id)
    if (!p || p.uit) return false
    const huidig = inPoel(id)
    const bron = huidig ? String(state!.poeelen.indexOf(huidig)) : "toew"
    if (key === "nieuw") return true
    if (key === bron) return false
    if (key !== "toew" && state!.poeelen[+key].m.length >= 6) return false
    return true
  }

  // ---- touch-drag (telefoon): long-press, zwevende kaart, drop op kolom ----
  function kolomOnder(x: number, y: number): string | null {
    const el = document.elementFromPoint(x, y)
    return el ? (el.closest("[data-kolomkey]") as HTMLElement | null)?.dataset.kolomkey ?? null : null
  }
  function startTouchDrag(card: HTMLElement, id: string, cx: number, cy: number) {
    document.querySelectorAll("[data-dragclone]").forEach(n => n.remove())
    const clone = card.cloneNode(true) as HTMLDivElement
    clone.setAttribute("data-dragclone", "1")
    clone.style.cssText = `position:fixed;z-index:9999;width:${card.offsetWidth}px;pointer-events:none;opacity:.9;transform:rotate(2deg) scale(1.03);box-shadow:0 10px 28px rgba(0,0,0,.3);margin:0`
    document.body.appendChild(clone)
    dragClone.current = clone
    document.body.style.touchAction = "none"
    setDragId(id)
    positionClone(cx, cy)
  }
  function positionClone(cx: number, cy: number) {
    if (dragClone.current) { dragClone.current.style.left = `${cx - 40}px`; dragClone.current.style.top = `${cy - 24}px` }
  }
  function endTouchDrag(cx: number, cy: number, id: string) {
    const key = kolomOnder(cx, cy)
    if (key && geldigVoor(id, key)) {
      if (key === "nieuw") nieuwePoelMet(id); else verplaats(id, key)
    }
    dragClone.current?.remove(); dragClone.current = null
    document.body.style.touchAction = ""
    setDragId(null); setDropState({})
    justDragged.current = true
    setTimeout(() => { justDragged.current = false }, 350)
  }
  function onCardPointerDown(e: React.PointerEvent, x: Deelnemer) {
    if (x.uit || e.pointerType === "mouse") return
    const card = e.currentTarget as HTMLElement
    const startX = e.clientX, startY = e.clientY
    let dragging = false
    longPress.current = setTimeout(() => { dragging = true; startTouchDrag(card, x.id, startX, startY) }, 350)
    const onMove = (ev: TouchEvent) => {
      const t = ev.touches[0]
      if (!dragging) {
        if (Math.abs(t.clientX - startX) > 12 || Math.abs(t.clientY - startY) > 12) {
          if (longPress.current) { clearTimeout(longPress.current); longPress.current = null }
          cleanup()
        }
        return
      }
      ev.preventDefault()
      positionClone(t.clientX, t.clientY)
      const key = kolomOnder(t.clientX, t.clientY)
      setDropState(key ? { [key]: geldigVoor(x.id, key) ? "ok" : "nee" } : {})
    }
    const onEnd = (ev: TouchEvent) => {
      if (longPress.current) { clearTimeout(longPress.current); longPress.current = null }
      if (dragging) {
        const t = (ev.changedTouches && ev.changedTouches[0]) || { clientX: startX, clientY: startY }
        endTouchDrag(t.clientX, t.clientY, x.id)
      }
      cleanup()
    }
    const cleanup = () => {
      document.removeEventListener("touchmove", onMove)
      document.removeEventListener("touchend", onEnd)
      document.removeEventListener("touchcancel", onEnd)
    }
    document.addEventListener("touchmove", onMove, { passive: false })
    document.addEventListener("touchend", onEnd)
    document.addEventListener("touchcancel", onEnd)
  }

  const Card = ({ x, pool }: { x: Deelnemer; pool: boolean }) => (
    <div
      draggable={!x.uit && !isTouch}
      onDragStart={e => { if (x.uit) { e.preventDefault(); return } e.dataTransfer.setData("text/plain", x.id); setDragId(x.id) }}
      onDragEnd={() => { setDragId(null); setDropState({}) }}
      onPointerDown={e => onCardPointerDown(e, x)}
      onClick={e => { e.stopPropagation(); if (x.uit || justDragged.current) return; setGeselecteerd(g => g === x.id ? null : x.id) }}
      style={{ touchAction: "manipulation" }}
      className={`relative rounded-lg border p-2.5 bg-white shadow-sm transition-all ${x.uit ? "opacity-40" : "cursor-grab"} ${dragId === x.id ? "opacity-30 scale-95 border-[#a90000] border-dashed" : geselecteerd === x.id ? "ring-2 ring-[#a90000]" : "border-gray-200"}`}
    >
      <button onClick={e => { e.stopPropagation(); if (confirm(`${x.v} ${x.a} AFMELDEN? Hij/zij valt uit alle poelen en printformulieren.`)) toggleUit(x.id) }} title={x.uit ? "Weer aanmelden" : "Afmelden"} className="absolute right-1.5 top-1.5 text-gray-400 text-sm">{x.uit ? "↩" : "⊘"}</button>
      {pool && <button onClick={e => { e.stopPropagation(); if (confirm(`${x.v} ${x.a} terugzetten naar Deelnemers?`)) verplaats(x.id, null) }} title="Terug" className="absolute right-7 top-1.5 text-red-600 text-sm">✕</button>}
      <div className={`font-semibold text-sm ${x.uit ? "line-through" : ""}`}>{x.v} {x.a}</div>
      <div className="text-[11px] text-gray-500">{x.c} · {x.g === "V" ? "meisje" : "jongen"}{x.uit ? " · AFGEMELD" : ""}</div>
      <div className="flex gap-3 mt-1 text-xs"><span>leeftijd <b>{x.l ?? "?"}</b></span><span>gewicht <b>{x.w ?? "?"} kg</b></span></div>
      <div className="h-2 rounded mt-1.5 border border-black/15 relative overflow-hidden" style={{ background: BANDKLEUR[x.b] || "#ccc" }}>
        {x.slip && <span className="absolute right-0 top-0 bottom-0 w-1/3" style={{ background: BANDKLEUR[x.slip] }} />}
      </div>
      <div className="text-[10px] text-gray-500 mt-0.5">{x.bl}</div>
    </div>
  )

  const Kolom = ({ kind, i }: { kind: "toew" | "poel"; i?: number }) => {
    const key = kind === "toew" ? "toew" : String(i)
    const po = kind === "poel" ? state!.poeelen[i!] : null
    const ids = kind === "toew" ? rest : po!.m
    const ds = dropState[key]
    return (
      <div
        data-kolomkey={key}
        onDragOver={e => { e.preventDefault(); if (dragId) setDropState(d => ({ ...d, [key]: geldigVoor(dragId, key) ? "ok" : "nee" })) }}
        onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropState(d => { const n = { ...d }; delete n[key]; return n }) }}
        onDrop={e => { e.preventDefault(); setDropState(d => { const n = { ...d }; delete n[key]; return n }); const id = e.dataTransfer.getData("text/plain"); if (geldigVoor(id, key)) verplaats(id, key); setDragId(null) }}
        onClick={() => { if (geselecteerd && geldigVoor(geselecteerd, key)) verplaats(geselecteerd, key) }}
        className={`bg-white border rounded-xl min-w-[260px] flex-1 basis-[260px] max-w-[340px] transition-all ${ds === "ok" ? "ring-2 ring-green-500 bg-green-50" : ds === "nee" ? "ring-2 ring-red-500 bg-red-50" : "border-gray-200"}`}
      >
        <div className="flex items-center justify-between gap-2 p-3 border-b border-gray-200">
          <div className="text-sm font-semibold">{po ? po.naam : "Deelnemers"}</div>
          <div className="text-[11px] text-gray-500">{po ? stats[i!] : `${rest.filter(id => !pers(id)?.uit).length} niet ingedeeld`}</div>
          {po && <div className="flex gap-1">
            <button onClick={e => { e.stopPropagation(); printPoelen([i!]) }} className="bg-[#a90000] text-white rounded px-2 py-1 text-xs">🖨</button>
            <button onClick={e => { e.stopPropagation(); verwijderPoel(i!) }} className="text-red-600 rounded px-1.5 py-1 text-xs border border-gray-200">✕</button>
          </div>}
        </div>
        {kind === "toew" && showNieuw && <NieuwForm onAdd={voegToe} />}
        <div className="p-2.5 flex flex-col gap-2 min-h-[60px]">
          {sorteerList(ids).map(x => <Card key={x.id} x={x} pool={kind === "poel"} />)}
        </div>
        {kind === "toew" && <div className="p-3 text-[11px] text-gray-500 border-t border-gray-100">Desktop: sleep een kaart (groen = mag, rood = kan niet). Telefoon: houd een kaart even ingedrukt en sleep, of tik de kaart en tik dan de poel. ⊘ = afmelden, ↩ = weer aanmelden. Max 6 per poel.</div>}
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <label className="text-sm">Sorteer:
          <select value={sorteer} onChange={e => setSorteer(e.target.value)} className="ml-1 border border-gray-300 rounded-lg px-2 py-1.5 text-sm">
            <option value="leeftijd">Leeftijd → gewicht</option>
            <option value="gewicht">Gewicht</option>
            <option value="band">Band</option>
            <option value="naam">Naam</option>
          </select>
        </label>
        <button onClick={() => setShowNieuw(s => !s)} className="bg-[#a90000] text-white rounded-lg px-3 py-1.5 text-sm">+ Deelnemer</button>
        <button onClick={nieuwePoel} className="bg-[#a90000] text-white rounded-lg px-3 py-1.5 text-sm">+ Nieuwe poel</button>
        <button onClick={() => printPoelen(state.poeelen.map((_, i) => i))} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">🖨 Print alle poelen</button>
        <button onClick={herstel} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">Herstel start</button>
        <span className="ml-auto text-xs text-gray-500">{actief} deelnemers · {state.poeelen.length} poelen · {status}</span>
      </div>
      <div className="flex flex-wrap gap-3 items-start">
        <Kolom kind="toew" />
        {state.poeelen.map((_, i) => <Kolom key={i} kind="poel" i={i} />)}
        <div
          data-kolomkey="nieuw"
          onDragOver={e => { e.preventDefault(); if (dragId) setDropState(d => ({ ...d, nieuw: geldigVoor(dragId, "nieuw") ? "ok" : "nee" })) }}
          onDragLeave={() => setDropState(d => { const n = { ...d }; delete n.nieuw; return n })}
          onDrop={e => { e.preventDefault(); setDropState(d => { const n = { ...d }; delete n.nieuw; return n }); const id = e.dataTransfer.getData("text/plain"); if (geldigVoor(id, "nieuw")) nieuwePoelMet(id); setDragId(null) }}
          className={`rounded-xl border-2 border-dashed min-w-[260px] flex-1 basis-[260px] max-w-[340px] min-h-[120px] flex items-center justify-center text-sm text-gray-400 transition-all ${dropState.nieuw === "ok" ? "ring-2 ring-green-500 bg-green-50 text-green-700 border-green-400" : dropState.nieuw === "nee" ? "ring-2 ring-red-500 bg-red-50 text-red-600 border-red-400" : "border-gray-300 bg-white/50"}`}
        >
          ⬇ Sleep hierheen voor<br />nieuwe poel
        </div>
      </div>
    </div>
  )
}

function NieuwForm({ onAdd }: { onAdd: (d: Deelnemer) => void }) {
  const [v, setV] = useState(""); const [a, setA] = useState(""); const [c, setC] = useState("")
  const [g, setG] = useState<"M" | "V">("M"); const [l, setL] = useState(""); const [w, setW] = useState(""); const [b, setB] = useState("WIT")
  function submit() {
    if (!v.trim()) { alert("Voornaam is verplicht"); return }
    onAdd({ id: "x" + Date.now(), v: v.trim(), a: a.trim(), c: c.trim() || "onbekend", g, l: +l || null, w: w ? +w : null, b, bl: b.charAt(0) + b.slice(1).toLowerCase() })
  }
  return (
    <div className="flex flex-wrap gap-1.5 p-2.5 border-b border-gray-200">
      <input value={v} onChange={e => setV(e.target.value)} placeholder="Voornaam" className="border border-gray-300 rounded px-2 py-1 text-xs w-24" />
      <input value={a} onChange={e => setA(e.target.value)} placeholder="Achternaam" className="border border-gray-300 rounded px-2 py-1 text-xs w-28" />
      <input value={c} onChange={e => setC(e.target.value)} placeholder="Vereniging" className="border border-gray-300 rounded px-2 py-1 text-xs w-28" />
      <select value={g} onChange={e => setG(e.target.value as "M" | "V")} className="border border-gray-300 rounded px-1 py-1 text-xs"><option value="M">jongen</option><option value="V">meisje</option></select>
      <input value={l} onChange={e => setL(e.target.value)} type="number" placeholder="Leeftijd" className="border border-gray-300 rounded px-2 py-1 text-xs w-16" />
      <input value={w} onChange={e => setW(e.target.value)} type="number" placeholder="kg" className="border border-gray-300 rounded px-2 py-1 text-xs w-14" />
      <select value={b} onChange={e => setB(e.target.value)} className="border border-gray-300 rounded px-1 py-1 text-xs">{BANDRANG.map(x => <option key={x}>{x}</option>)}</select>
      <button onClick={submit} className="bg-[#a90000] text-white rounded px-2.5 py-1 text-xs">Toevoegen</button>
    </div>
  )
}
