import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { isAdmin } from '@/lib/auth'
import { GROEP_LABELS, GROEP_SUBTEXT, kandidatenVoorGroep, beltIndex } from '@/lib/examens'
import { eisenVoorBelt, VAKVOLGORDE, KORT } from '@/lib/examen-eisen'
import { BeltBadge } from '@/components/admin/BeltBadge'
import PrintKnop from './PrintKnop'

export const dynamic = 'force-dynamic'

interface Rij { id: string; naam: string; huidige: string; doel: string; status: string; klaar?: boolean; gevinkte?: Set<string> }

export default async function PrintExamenlijst({ searchParams }: { searchParams: Promise<{ sitting?: string; groep?: string }> }) {
  if (!(await isAdmin())) redirect('/admin-login')
  const q = await searchParams
  let titel = ''
  let subtitel = ''
  let datumLabel = ''
  let isProef = false
  let groepen: { label: string; rijen: Rij[] }[] = []

  if (q.sitting) {
    const s = await db.examSitting.findUnique({ where: { id: q.sitting }, include: { attempts: { orderBy: [{ member: { lastName: 'asc' } }], include: { member: { select: { firstName: true, lastName: true, currentBelt: true } } } } } })
    if (!s) notFound()
    isProef = s.type === 'PROEF'
    titel = `${GROEP_LABELS[s.group] || s.group}${s.title ? ` — ${s.title}` : ''}`
    subtitel = GROEP_SUBTEXT[s.group] || ''
    datumLabel = new Date(s.date).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    const rijen = s.attempts.map(a => ({
      id: a.id,
      naam: `${a.member.firstName} ${a.member.lastName}`,
      huidige: (a.member.currentBelt === 'BRUIN_1' ? 'BRUIN' : a.member.currentBelt) ?? '',
      doel: a.beltLevel,
      status: a.status,
      klaar: a.klaar,
      gevinkte: new Set(Object.entries((a.categoryResults as Record<string, boolean> | null) ?? {}).filter(([, v]) => v).map(([k]) => k)),
    })).sort((x, y) => beltIndex(x.huidige || null) - beltIndex(y.huidige || null) || x.naam.localeCompare(y.naam, 'nl'))
    groepen = [{ label: GROEP_LABELS[s.group] || s.group, rijen }]
  } else if (q.groep) {
    const groepenLijst = q.groep === 'ALLES' ? Object.keys(GROEP_LABELS) : [q.groep]
    for (const g of groepenLijst) {
      const k = await kandidatenVoorGroep(g)
      groepen.push({ label: GROEP_LABELS[g] || g, rijen: k.map(x => ({ id: x.memberId, naam: `${x.firstName} ${x.lastName}`, huidige: x.currentBelt ?? '', doel: x.doel as string, status: 'SCHEDULED' })) })
    }
    titel = 'Examen-doelenlijst (huidige stand)'
    datumLabel = new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  } else {
    notFound()
  }

  return (
    <>
      <style>{`
        @page { size: A4 portrait; margin: 10mm 9mm; }
        @media print { body { background: #fff !important; } .print-shell { margin: 0 !important; padding: 0 !important; } }
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      `}</style>
      <div className="print-shell mx-auto max-w-4xl bg-white p-6 text-[#222]" style={{ fontFamily: "'DejaVu Sans', sans-serif" }}>
        <div className="mb-3 flex items-center justify-between print:hidden">
          <Link href="/admin/exams" className="text-sm text-[#a90000] hover:underline">← Terug</Link>
          <PrintKnop />
        </div>

        {groepen.map((grp, gi) => (
          <div key={gi} style={{ breakAfter: gi === groepen.length - 1 ? 'auto' : 'page' }}>
            <div className="flex items-baseline justify-between border-b-[3px] border-[#a90000] pb-1.5" style={{ marginBottom: '2.5mm' }}>
              <h1 style={{ fontSize: '14pt', color: '#a90000', fontWeight: 700 }}>{isProef ? 'Proefexamelijst' : 'Examenlijst'} — {grp.label}</h1>
              <span style={{ fontSize: '8pt', color: '#666' }}>{datumLabel}</span>
            </div>
            {subtitel && <p style={{ fontSize: '7.5pt', color: '#666', marginTop: '-1.5mm', marginBottom: '2mm' }}>{subtitel}</p>}
            <p style={{ fontSize: '8pt', marginBottom: '2mm' }}>Examenleiding: <span style={{ display: 'inline-block', width: '55mm', borderBottom: '1px solid #888' }} />&nbsp;&nbsp;&nbsp;Datum: <span style={{ display: 'inline-block', width: '28mm', borderBottom: '1px solid #888' }} /></p>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8pt' }}>
              <thead>
                <tr style={{ background: '#a90000', color: '#fff' }}>
                  <th style={{ textAlign: 'left', padding: '1.2mm 1.5mm', width: '27%' }}>Lid · huidig → doel</th>
                  {VAKVOLGORDE.map(v => <th key={v} style={{ padding: '1.2mm .5mm', textAlign: 'center' }}>{KORT[v]}</th>)}
                  {isProef && <th style={{ padding: '1.2mm .5mm', textAlign: 'center', width: '10mm' }}>KLAAR?</th>}
                </tr>
              </thead>
              <tbody>
                {grp.rijen.map((r, i) => {
                  const vakken = eisenVoorBelt(r.doel) ?? []
                  const byId = new Map(vakken.map(v => [v.id, v]))
                  return (
                    <tr key={r.id} style={{ background: i % 2 ? '#f7f4f2' : '#fff', borderBottom: '1px solid #ddd', height: '8mm' }}>
                      <td style={{ padding: '1mm 1.5mm' }}>
                        <div style={{ fontWeight: 700 }}>{r.naam}</div>
                        <div style={{ fontSize: '6.8pt', color: '#666', display: 'flex', alignItems: 'center', gap: '1mm', marginTop: '0.4mm' }}>
                          <BeltBadge belt={r.huidige || null} height="h-[3mm]" width="w-[5.5mm]" />
                          <span>→</span>
                          <BeltBadge belt={r.doel} height="h-[3mm]" width="w-[5.5mm]" />
                          <span>{naamVoorBelt(r.doel)}</span>
                        </div>
                      </td>
                      {VAKVOLGORDE.map(v => {
                        const eis = byId.get(v)
                        if (!eis) return <td key={v} style={{ textAlign: 'center', color: '#ccc' }}>–</td>
                        const aangevinkt = r.gevinkte?.has(v)
                        return (
                          <td key={v} style={{ textAlign: 'center', padding: '1mm .5mm' }}>
                            <div style={{ fontWeight: 700 }}>{eis.aantal}×</div>
                            <div style={{ margin: '0.6mm auto 0', width: '3.4mm', height: '3.4mm', border: '1px solid #777', borderRadius: '.5mm', background: aangevinkt ? '#e5f3e5' : '#fff', color: '#1a7a1a', fontWeight: 700, fontSize: '7pt', lineHeight: '3.2mm' }}>{aangevinkt ? '✓' : ''}</div>
                          </td>
                        )
                      })}
                      {isProef && (
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ margin: '0 auto', width: '4mm', height: '4mm', border: '1.5px solid ' + (r.klaar ? '#1a7a1a' : '#777'), borderRadius: '.5mm', background: r.klaar ? '#e5f3e5' : '#fff', color: '#1a7a1a', fontWeight: 700, fontSize: '8pt', lineHeight: '3.8mm' }}>{r.klaar ? '✓' : ''}</div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <p style={{ fontSize: '6.8pt', color: '#888', marginTop: '2mm' }}>Vakken: aantallen = aantal technieken dat gekend moet worden · □ = afvinken indien in orde · (–) = niet vereist voor dit niveau. Gemaakt {new Date().toLocaleDateString('nl-NL')} via de ledensite.</p>
          </div>
        ))}
      </div>
    </>
  )
}

function naamVoorBelt(belt: string) {
  const map: Record<string, string> = {
    WIT: 'witte band', WIT_GEEL: 'wit/gele slip', GEEL: 'gele band', GEEL_ORANJE: 'geel/oranje slip', ORANJE: 'oranje band',
    ORANJE_GROEN: 'oranje/groene slip', GROEN: 'groene band', GROEN_BLAUW: 'groen/blauwe slip', BLAUW: 'blauwe band', BLAUW_BRUIN: 'blauw/bruine slip', BRUIN: 'bruine band',
  }
  return map[belt] || belt
}
