'use client'

import { useEffect, useMemo, useState } from 'react'

// Publieke toestemmingspagina: /toestemming/<memberId>.<token> — geen login nodig.
export default function ToestemmingPage() {
  const [params, setParams] = useState<{ id: string; token: string } | null>(null)
  const [laadstatus, setLaadstatus] = useState<'laden' | 'ok' | 'fout'>('laden')
  const [voornaam, setVoornaam] = useState('')
  const [portret, setPortret] = useState<boolean | null>(null)
  const [naam, setNaam] = useState<boolean | null>(null)
  const [opgeslagen, setOpgeslagen] = useState(false)
  const [bezig, setBezig] = useState(false)

  useEffect(() => {
    const part = window.location.pathname.split('/').filter(Boolean).pop() ?? ''
    const i = part.lastIndexOf('.')
    if (i <= 0) { setLaadstatus('fout'); return }
    const id = part.slice(0, i), token = part.slice(i + 1)
    setParams({ id, token })
    fetch(`/api/toestemming/${id}?t=${token}`)
      .then(async r => {
        if (!r.ok) throw new Error()
        const d = await r.json()
        setVoornaam(d.voornaam)
        setPortret(d.portraitRights)
        setNaam(d.nameMention)
        setLaadstatus('ok')
      })
      .catch(() => setLaadstatus('fout'))
  }, [])

  async function opslaan() {
    if (!params) return
    setBezig(true)
    try {
      const r = await fetch(`/api/toestemming/${params.id}?t=${params.token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portraitRights: portret, nameMention: naam }),
      })
      if (r.ok) setOpgeslagen(true)
    } finally { setBezig(false) }
  }

  const radio = (
    label: string,
    waarde: boolean | null,
    set: (b: boolean) => void,
    vraag: string,
  ) => (
    <div className="mb-6">
      <p className="mb-2 text-sm font-medium text-[#2a2a2a]">{vraag}</p>
      <div className="flex gap-3">
        {[true, false].map(b => (
          <label key={String(b)}
            className={`flex-1 cursor-pointer rounded-xl border-2 px-4 py-3 text-center text-sm font-medium transition-colors ${
              waarde === b ? 'border-[#a90000] bg-[#fdf0f0] text-[#a90000]' : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}>
            <input type="radio" name={label} className="sr-only" checked={waarde === b} onChange={() => set(b)} />
            {b ? 'Ja' : 'Nee'}
          </label>
        ))}
      </div>
    </div>
  )

  const content = laadstatus === 'laden' ? (
    <p className="text-sm text-gray-500">Loading…</p>
  ) : laadstatus === 'fout' ? (
    <div>
      <p className="mb-1 text-lg">🔒 This link is not valid.</p>
      <p className="text-sm text-gray-500">Open the link you received from the club, or ask via the trainers.</p>
    </div>
  ) : opgeslagen ? (
    <div>
      <p className="mb-2 text-lg">✅ Bedankt, {voornaam}!</p>
      <p className="text-sm text-gray-500">Je keuze is opgeslagen.Wil je later iets veranderen? Open deze link opnieuw.</p>
    </div>
  ) : (
    <div>
      <p className="mb-5 text-sm text-gray-500">
        Wat mag Judoclub Michigami van <strong className="text-[#2a2a2a]">{voornaam}</strong>?
        Je kunt dit later altijd weer via deze link veranderen.
      </p>
      {radio('portret', portret, setPortret, 'Foto\u2019s en video\u2019s maken en gebruiken (website, social media)?')}
      {radio('naam', naam, setNaam, 'Naam vermelden bij nieuwsberichten, uitslagen en foto\u2019s?')}
      <button
        onClick={opslaan}
        disabled={bezig || portret === null || naam === null}
        className="w-full rounded-xl bg-[#a90000] py-3.5 text-sm font-semibold text-white transition-opacity disabled:opacity-40">
        {bezig ? 'Opslaan…' : 'Opslaan'}
      </button>
    </div>
  )

  const contentEn = content // (page is NL-first; shell teksten hieronder)

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f5f0] px-4">
      <div className="w-full max-w-md">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#a90000] text-xl">🥋</div>
          <div>
            <p className="font-bold text-[#2a2a2a]">Judoclub Michigami</p>
            <p className="text-xs text-gray-400">Toestemming foto&rsquo;s &amp; naam</p>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm">{contentEn}</div>
      </div>
    </main>
  )
}
