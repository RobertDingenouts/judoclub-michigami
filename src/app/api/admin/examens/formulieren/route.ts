import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { kandidatenVoorGroep, GROEP_LABELS } from '@/lib/examens'
import { BELT_NL, beltLabel } from '@/lib/examens'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  const g = new URL(req.url).searchParams.get('groep') ?? ''
  if (!GROEP_LABELS[g]) return NextResponse.json({ error: 'Onbekende groep' }, { status: 400 })
  const kandidaten = await kandidatenVoorGroep(g)
  const leden = kandidaten.map(k => {
    const doel = k.doel as string
    return {
      id: k.memberId,
      naam: `${k.firstName} ${k.lastName}`,
      huidige: beltLabel(k.currentBelt),
      doelLabel: BELT_NL[doel] ?? doel,
      isSlip: doel.includes('_'),
    }
  })
  return NextResponse.json({ leden })
}
