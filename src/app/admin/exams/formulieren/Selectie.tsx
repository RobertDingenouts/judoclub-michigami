'use client'
import { useState } from 'react'

export interface FormKeuze { id: string; naam: string; huidige: string; doelLabel: string; isSlip: boolean }

export function FormulierenSelectie({ groepen, start }: { groepen: Record<string, string>; start: string }) {
  const [groep, setGroep] = useState(start && groepen[start] ? start : Object.keys(groepen)[0])
  const [genoteerd, setGenoteerd] = useState<Record<string, FormKeuze[]>>({})
  const [selectie, setSelectie] = useState<Record<string, boolean>>({})
  const [laden, setLaden] = useState(false)

  const leden = genoteerd[groep] ?? []
  const gekozen = leden.filter(l => selectie[l.id] !== false).map(l => l.id)

  const laadGroep = async (g: string) => {
    setGroep(g)
    if (genoteerd[g]) return
    setLaden(true)
    try {
      const res = await fetch(`/api/admin/examens/formulieren?groep=${g}`)
      const data = await res.json()
      setGenoteerd(prev => ({ ...prev, [g]: data.leden }))
      setSelectie(prev => {
        const s = { ...prev }
        for (const l of data.leden as FormKeuze[]) if (s[l.id] === undefined) s[l.id] = true
        return s
      })
    } finally { setLaden(false) }
  }

  const printSelectie = () => {
    if (gekozen.length === 0) return
    window.open(`/print/formulieren?groep=${groep}&leden=${gekozen.join(',')}`, '_blank')
  }
  const printAlles = () => window.open(`/print/formulieren?groep=${groep}`, '_blank')

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-sm border border-gray-300 bg-white p-0.5">
          {Object.entries(groepen).map(([k, label]) => (
            <button key={k} onClick={() => laadGroep(k)} className={`rounded-sm px-3 py-1.5 text-sm font-medium ${groep === k ? 'bg-[#a90000] text-white' : 'text-gray-700 hover:bg-gray-100'}`}>{label}</button>
          ))}
        </div>
        <span className="text-xs text-gray-500">Vink aan wie een formulier krijgt · 2 per A4-vel</span>
      </div>

      {laden && <div className="text-sm text-gray-500">Leden laden…</div>}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {leden.map(l => {
          const aan = selectie[l.id] !== false
          return (
            <label key={l.id} className={`flex cursor-pointer items-center gap-3 rounded-sm border p-2.5 ${aan ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50 opacity-50'}`}>
              <input type="checkbox" checked={aan} onChange={() => setSelectie(s => ({ ...s, [l.id]: !aan }))} className="h-4 w-4 accent-[#a90000]" />
              <div className="flex-1">
                <div className="text-sm font-medium">{l.naam}</div>
                <div className="text-xs text-gray-500">{l.huidige} → <span className={l.isSlip ? 'text-amber-700' : 'text-green-700'}>{l.doelLabel}{l.isSlip ? ' (€2,50)' : ' (€15,00)'}</span></div>
              </div>
            </label>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-3 pt-1">
        <button onClick={printAlles} className="rounded-sm bg-[#a90000] px-4 py-2 text-sm font-medium text-white hover:bg-[#8c0000]" disabled={leden.length === 0}>🖨 Print alles ({leden.length})</button>
        <button onClick={printSelectie} className="rounded-sm border border-[#a90000] px-4 py-2 text-sm font-medium text-[#a90000] hover:bg-red-50" disabled={gekozen.length === 0}>Print selectie ({gekozen.length})</button>
      </div>
    </div>
  )
}
