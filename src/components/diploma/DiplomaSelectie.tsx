'use client'

// Selectiebalk voor batch-diplomaprint: vink aan welke diploma's er geprint worden.
// Afgevinkte kaarten krijgen .niet-geselecteerd; de print-CSS verbergt die (display:none),
// scherm blijft alles tonen. Print-zelf blijft 1 A4 per geselecteerd diploma.

import { useState } from 'react'

export default function DiplomaSelectie({ items }: { items: { id: string; naam: string }[] }) {
  const [sel, setSel] = useState<Record<string, boolean>>(() => Object.fromEntries(items.map(i => [i.id, true])))
  const n = items.filter(i => sel[i.id]).length

  const mark = (id: string, aan: boolean) =>
    document.querySelectorAll<HTMLElement>(`.diploma-item[data-id="${id}"]`)
      .forEach(el => el.classList.toggle('niet-geselecteerd', !aan))

  const toggle = (id: string) => {
    const aan = !sel[id]
    mark(id, aan)
    setSel({ ...sel, [id]: aan })
  }

  const alles = () => {
    const aan = n !== items.length
    items.forEach(i => mark(i.id, aan))
    setSel(Object.fromEntries(items.map(i => [i.id, aan])))
  }

  return (
    <div className="print:hidden flex flex-wrap items-center gap-x-3 gap-y-1">
      {items.map(i => (
        <label key={i.id} className="flex cursor-pointer items-center gap-1 text-sm text-white/90 select-none">
          <input type="checkbox" checked={sel[i.id]} onChange={() => toggle(i.id)} className="accent-[#a90000]" />
          {i.naam}
        </label>
      ))}
      <button onClick={alles} className="rounded-sm bg-white/10 px-2 py-1 text-xs hover:bg-white/20">
        {n === items.length ? 'Geen selectie' : 'Alles selecteren'}
      </button>
      <button onClick={() => window.print()} className="ml-auto rounded-sm bg-white px-3 py-1.5 text-sm font-medium text-black hover:bg-white/90">
        🖨 Print ({n})
      </button>
    </div>
  )
}
