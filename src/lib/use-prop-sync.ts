import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// Waarden uit props die na `router.refresh()` vanzelf moeten meebewegen, met
// ruimte voor lokale wijzigingen (optimistisch opslaan).
//
// Let op: `useState(Object.fromEntries(props))` krijgt zijn init-waarde één keer
// en negeert latere props. Daardoor toont een lijst na een refresh een
// verouderde waarde — precies het soort "renderen gaat mis"-probleem dat hier
// voorkwam. Deze hook houdt lokale wijzigingen vast, maar neemt zodra de
// serverdata verandert de server als waarheid over.
export function usePropSync<T extends { id: string }>(
  props: T[],
  veld: keyof T & string,
): [Record<string, string>, (id: string, waarde: string) => void] {
  const [over, setOver] = useState<Record<string, string>>({})
  const server = useMemo(
    () => Object.fromEntries(props.map(p => [String(p.id), String(p[veld] ?? '')])),
    [props, veld],
  )
  const voorheen = useRef(server)

  useEffect(() => {
    setOver(v => {
      const keys = Object.keys(v)
      if (!keys.length) return v
      // Alleen overrides vasthouden zolang de server nog dezelfde waarde stuurt
      // als toen we lokaal overschreven. Zodra de server bijwerkt, wint de server.
      const volgende: Record<string, string> = {}
      for (const id of keys) if (server[id] === voorheen.current[id]) volgende[id] = v[id]
      return JSON.stringify(volgende) === JSON.stringify(v) ? v : volgende
    })
    voorheen.current = server
  }, [server])

  const zet = useCallback((id: string, waarde: string) => setOver(p => ({ ...p, [id]: waarde })), [])
  return [{ ...server, ...over }, zet]
}
