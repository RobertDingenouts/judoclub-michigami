'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const GROEPopties: Record<string, string> = {
  VRIJDAG_1E: 'Vrijdag 1e groep (18:45)',
  VRIJDAG_2E: 'Vrijdag 2e groep (19:45)',
  WOENSDAG: 'Woensdag algemeen (19:00)',
  SENIOREN: 'Senioren',
}

export default function NieuweBijeenkomstForm() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [fout, setFout] = useState('')

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true); setFout('')
    const fd = new FormData(e.currentTarget)
    const res = await fetch('/api/admin/examens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: fd.get('date'), group: fd.get('group'), title: fd.get('title') }),
    })
    setBusy(false)
    if (!res.ok) { setFout((await res.json()).error || 'Mislukt'); return }
    router.push(`/admin/exams/bijeenkomst/${(await res.json()).id}`)
  }

  const today = new Date().toISOString().slice(0, 10)
  return (
    <form onSubmit={onCreate} className="flex flex-wrap items-end gap-3 rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
      <label className="text-xs font-medium text-gray-600">Datum<br />
        <input type="date" name="date" required defaultValue={today} className="mt-1 block rounded-sm border border-gray-300 px-2 py-1.5 text-sm focus:border-[#a90000] focus:outline-none" />
      </label>
      <label className="text-xs font-medium text-gray-600">Groep<br />
        <select name="group" required className="mt-1 block rounded-sm border border-gray-300 px-2 py-1.5 text-sm focus:border-[#a90000] focus:outline-none">
          {Object.entries(GROEPopties).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </label>
      <label className="text-xs font-medium text-gray-600">Titel (optioneel)<br />
        <input name="title" placeholder="bv Juni-examens" className="mt-1 block rounded-sm border border-gray-300 px-2 py-1.5 text-sm focus:border-[#a90000] focus:outline-none" />
      </label>
      <button type="submit" disabled={busy} className="rounded-sm bg-[#a90000] px-4 py-2 text-sm font-medium text-white hover:bg-[#8c0000] disabled:opacity-50">
        {busy ? 'Anmaken…' : 'Bijeenkomst aanmaken'}
      </button>
      {fout && <span className="text-xs text-red-600">{fout}</span>}
    </form>
  )
}
