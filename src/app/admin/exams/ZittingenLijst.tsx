'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export interface ZittingRij {
  id: string
  datum: string // YYYY-MM-DD
  isProef: boolean
  groepLabel: string
  title: string | null
  totaal: number
  af: number
  klaarVoorExamen: number
  subtext: string
}

export default function ZittingenLijst({ zittingen }: { zittingen: ZittingRij[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)

  async function verwijder(z: ZittingRij) {
    const datumNl = z.datum.split('-').reverse().join('-')
    if (!confirm(`Bijeenkomst ${datumNl} (${z.groepLabel}) echt verwijderen?\nAlle open aanmeldingen van deze bijeenkomst worden verwijderd. Afgeronde examens blijven in de historie.`)) return
    setBusy(z.id)
    const res = await fetch(`/api/admin/examens/sittings/${z.id}`, { method: 'DELETE' })
    setBusy(null)
    if (!res.ok) alert((await res.json()).error || 'Verwijderen mislukt')
    else router.refresh()
  }

  if (zittingen.length === 0) return <p className="text-sm text-gray-400">Nog geen bijeenkomsten. Iemand op "klaar" zetten met een datum maakt automatisch een examenbijeenkomst aan.</p>

  return (
    <div className="space-y-2">
      {zittingen.map(z => (
        <div key={z.id} className={`flex flex-wrap items-center justify-between gap-2 rounded-sm border bg-white p-4 shadow-sm ${z.isProef ? 'border-amber-200' : 'border-gray-200'}`}>
          <div>
            <p className="text-sm font-semibold text-[#2a2a2a]">
              {new Date(z.datum + 'T12:00').toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              <span className={`ml-2 rounded-sm px-1.5 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wide ${z.isProef ? 'bg-amber-100 text-amber-800' : 'bg-red-50 text-[#a90000]'}`}>{z.isProef ? 'proef' : 'examen'}</span>
              <span className="ml-2 text-xs font-normal text-gray-500">{z.groepLabel}{z.title ? ` · ${z.title}` : ''}</span>
            </p>
            <p className="text-xs text-gray-500">
              {z.isProef ? <span className="font-medium text-green-700">{z.klaarVoorExamen}/{z.totaal} klaar voor examen</span> : `${z.af}/${z.totaal} registratie af`} · {z.subtext}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/admin/exams/bijeenkomst/${z.id}`} className="rounded-sm bg-[#a90000] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#8c0000]">Registreren</Link>
            <Link href={`/print/examen?sitting=${z.id}`} className="rounded-sm border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">Print</Link>
            <button
              onClick={() => verwijder(z)}
              disabled={busy === z.id}
              title="Bijeenkomst verwijderen (kan niet als er al afgeronde examens bij horen)"
              className="rounded-sm border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {busy === z.id ? '…' : '🗑 Verwijderen'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
