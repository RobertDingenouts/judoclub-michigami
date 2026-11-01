'use client'

// Compacte periode-dropdown voor de contributiepagina: alle periodes plus het
// volgende kwartaal, ingeklapt in één select i.p.v. een rij tabs.
export function PeriodeSelect({ periodes, huidige, gestopt }: { periodes: string[]; huidige: string; gestopt: boolean }) {
  return (
    <select
      value={huidige}
      onChange={e => { window.location.href = `/admin/contributie?periode=${e.target.value}${gestopt ? '&gestopt=1' : ''}` }}
      className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-[#2a2a2a] focus:border-[#a90000] focus:outline-none"
      aria-label="Kies periode">
      {periodes.map(p => <option key={p} value={p}>{p}</option>)}
    </select>
  )
}
