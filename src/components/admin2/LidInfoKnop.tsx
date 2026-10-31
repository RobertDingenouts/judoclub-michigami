'use client'

import { useState } from 'react'
import { BELT_LABELS_NL, BELT_COLORS } from '@/lib/student-progress-types'
import type { BeltLevel } from '@prisma/client'

type Info = {
  lid: {
    id: string; firstName: string; lastName: string; email: string | null; phone: string | null; phone2: string | null
    dateOfBirth: string | null; address: string | null; postalCode: string | null; city: string | null
    currentBelt: string | null; joinDate: string; clubStatus: string; leaveDate: string | null
    primaryGroup: string | null; groups: string[]; whatsappGroup: string | null; remarks: string | null; isTrainer: boolean
  }
  examens: { beltLevel: string; examDate: string | null; status: string; overallScore: number | null }[]
  betalingen: { amount: string | number; status: string; invoiceNumber: string | null; paidAt: string | null; period: { label: string } }[]
  materiaal: { product: string; maat: string | null; aantal: number; prijs: string | number; createdAt: string; periode: string | null }[]
}

const dt = (s: string | null) => s ? new Date(s).toLocaleDateString('nl-NL') : '—'
const eur = (n: string | number) => Number(n).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' })
const STATUS_NL: Record<string, string> = { BETAALD: 'betaald ✓', OPEN: 'open', HERINNERING1: '1e herinnering', HERINNERING2: '2e herinnering', VIJGESTELD: 'vrijgesteld', GESLAAGD: 'geslaagd', HERKANST: 'herkansing', SCHEDULED: 'gepland', IN_UITVOERING: 'bezig' }

// ℹ️ + modal: alle kerngegevens van een lid op één plek, zonder het dossier-te openen.
export function LidInfoKnop({ memberId, klas }: { memberId: string; klas?: string }) {
  const [info, setInfo] = useState<Info | null>(null)
  const [laden, setLaden] = useState(false)
  const [fout, setFout] = useState('')

  async function open() {
    setLaden(true); setFout('')
    try {
      const r = await fetch(`/api/admin2/lidinfo/${memberId}`)
      if (!r.ok) throw new Error((await r.json()).error || 'laden mislukt')
      setInfo(await r.json())
    } catch (e) { setFout((e as Error).message) } finally { setLaden(false) }
  }

  const band = info?.lid.currentBelt as BeltLevel | null
  return (
    <>
      <button onClick={open} disabled={laden} title="Alle kerngegevens in één oogopslag"
        className={klas ?? 'rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-600 hover:border-[#a90000] hover:text-[#a90000]'}>
        {laden ? '…' : 'ℹ️ Info'}
      </button>
      {fout && <span className="text-xs text-red-600">{fout}</span>}
      {info && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4" onClick={() => setInfo(null)}>
          <div className="my-8 w-full max-w-lg rounded-xl bg-white p-5 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-[#2a2a2a]">{info.lid.firstName} {info.lid.lastName}
                  {info.lid.isTrainer && <span className="ml-2 rounded bg-[#a90000]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#a90000]">trainer</span>}
                  {info.lid.clubStatus !== 'LID' && <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">{info.lid.clubStatus.toLowerCase()}{info.lid.leaveDate ? ` sinds ${dt(info.lid.leaveDate)}` : ''}</span>}
                </h3>
                <p className="text-xs text-gray-500">
                  Lid sinds {dt(info.lid.joinDate)}{info.lid.dateOfBirth ? ` · geb. ${dt(info.lid.dateOfBirth)}` : ''}
                </p>
              </div>
              <button onClick={() => setInfo(null)} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-2">
              {band && (
                <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold"
                  style={{ borderColor: BELT_COLORS[band] ?? '#999', color: '#2a2a2a' }}>
                  <span className="h-3 w-6 rounded-sm border border-gray-300" style={{ background: BELT_COLORS[band] ?? '#fff' }} />
                  {BELT_LABELS_NL[band] ?? band}
                </span>
              )}
              {!band && <span className="text-xs text-gray-400">geen band geregistreerd</span>}
              {(info.lid.primaryGroup || info.lid.groups.length > 0) && (
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                  {[info.lid.primaryGroup, ...info.lid.groups.filter(g => g !== info.lid.primaryGroup)].filter(Boolean).join(' · ')}
                </span>
              )}
              {info.lid.whatsappGroup && <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs text-green-700">groepsapp: {info.lid.whatsappGroup}</span>}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <section>
                <h4 className="mb-1 text-[10px] font-bold uppercase tracking-wide text-gray-400">Contact</h4>
                <p className="text-sm text-gray-700">
                  {info.lid.address ? `${info.lid.address}${info.lid.postalCode ? `, ${info.lid.postalCode}` : ''} ${info.lid.city ?? ''}` : (info.lid.city ?? '— geen adres')}
                  <br />{[info.lid.phone, info.lid.phone2].filter(Boolean).join(' / ') || '— geen telefoon'}
                  <br />{info.lid.email ?? '— geen mail'}
                </p>
                {info.lid.remarks && <p className="mt-1 rounded bg-amber-50 px-2 py-1 text-xs text-amber-800">💬 {info.lid.remarks}</p>}
              </section>

              <section>
                <h4 className="mb-1 text-[10px] font-bold uppercase tracking-wide text-gray-400">Examens</h4>
                {info.examens.length === 0 && <p className="text-xs text-gray-400">nog geen examens</p>}
                <ul className="space-y-0.5 text-sm text-gray-700">
                  {info.examens.map((x, i) => (
                    <li key={i}>
                      {dt(x.examDate)} · {BELT_LABELS_NL[x.beltLevel as BeltLevel] ?? x.beltLevel}
                      <span className={`text-xs ${x.status === 'GESLAAGD' ? 'text-green-700' : 'text-gray-500'}`}> — {STATUS_NL[x.status] ?? x.status.toLowerCase()}{x.overallScore != null ? ` (${x.overallScore})` : ''}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h4 className="mb-1 text-[10px] font-bold uppercase tracking-wide text-gray-400">Contributie</h4>
                <ul className="space-y-0.5 text-sm text-gray-700">
                  {info.betalingen.map((b, i) => (
                    <li key={i}>
                      {b.period.label} · {eur(b.amount)}
                      <span className={`text-xs ${b.status === 'BETAALD' ? 'text-green-700' : b.status === 'VIJGESTELD' ? 'text-blue-600' : 'text-gray-500'}`}> — {STATUS_NL[b.status] ?? b.status.toLowerCase()}{b.paidAt ? ` (${dt(b.paidAt)})` : ''}</span>
                    </li>
                  ))}
                  {info.betalingen.length === 0 && <li className="text-xs text-gray-400">nog geen facturen</li>}
                </ul>
              </section>

              <section>
                <h4 className="mb-1 text-[10px] font-bold uppercase tracking-wide text-gray-400">Materiaal (recent)</h4>
                {info.materiaal.length === 0 && <p className="text-xs text-gray-400">niets gekocht</p>}
                <ul className="space-y-0.5 text-sm text-gray-700">
                  {info.materiaal.map((m, i) => (
                    <li key={i}>{dt(m.createdAt)} · {m.product.replace('Budo Band - Vechtsportband - ', 'Band — ')}{m.maat ? ` ${m.maat}` : ''} ×{Math.abs(m.aantal)} — {eur(m.prijs)}</li>
                  ))}
                </ul>
              </section>
            </div>

            <a href={`/admin/students/${info.lid.id}`} className="mt-4 inline-block text-xs font-medium text-[#a90000] underline">→ volledig dossier openen</a>
          </div>
        </div>
      )}
    </>
  )
}
