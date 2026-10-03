import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

function norm(s: string) { return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z ]/g, '').replace(/\s+/g, ' ').trim() }

// POST { naam, groep } — gast/proefles aanmaken (clubStatus PROEF, verschijnt direct in de lesmodus)
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Geen admin' }, { status: 403 })
  const { naam, groep } = await req.json()
  if (!naam || !groep) return NextResponse.json({ error: 'naam + groep nodig' }, { status: 400 })

  const parts = naam.trim().split(/\s+/)
  if (parts.length < 2) return NextResponse.json({ error: 'Gebruik voor- én achternaam' }, { status: 400 })
  const firstName = parts.slice(0, -1).join(' ')
  const lastName = parts.at(-1)!

  // bestaat deze gast al? dan gewoon die gebruiken (idempotent)
  const bestaand = await db.member.findFirst({ where: { firstName, lastName } })
  if (bestaand) {
    if (bestaand.primaryGroup !== groep) {
      await db.member.update({ where: { id: bestaand.id }, data: { primaryGroup: groep } })
    }
    return NextResponse.json({ ok: true, id: bestaand.id, nieuw: false, naam: `${bestaand.firstName} ${bestaand.lastName}` })
  }

  const user = await db.user.create({ data: { role: 'MEMBER', is_active: true } })
  const m = await db.member.create({
    data: {
      userId: user.id, firstName, lastName,
      primaryGroup: groep, clubStatus: 'PROEF', isActive: true,
      remarks: 'Proefles / gast',
    },
  })
  return NextResponse.json({ ok: true, id: m.id, nieuw: true, naam: `${m.firstName} ${m.lastName}` })
}
