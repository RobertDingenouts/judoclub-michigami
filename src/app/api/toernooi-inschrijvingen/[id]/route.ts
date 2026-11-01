import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'
import { NIVEAUS, BANDEN } from '@/lib/toernooien'

export const dynamic = 'force-dynamic'

// PATCH /api/toernooi-inschrijvingen/:id — admin bewaart een rij
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Geen admin' }, { status: 403 })
  const { id } = await params
  const body = await req.json() as Record<string, any>

  const data: Record<string, unknown> = {}
  if (typeof body.naam === 'string' && body.naam.trim()) data.naam = body.naam.trim().replace(/\s+/g, ' ')
  if (['Man', 'Vrouw'].includes(body.geslacht)) data.geslacht = body.geslacht
  if (body.leeftijd !== undefined) {
    const n = Math.round(Number(body.leeftijd))
    if (Number.isFinite(n) && n >= 4 && n <= 70) data.leeftijd = n
  }
  if (body.gewicht !== undefined) {
    const n = Number(body.gewicht)
    if (Number.isFinite(n) && n >= 10 && n <= 200) data.gewicht = n
  }
  if ((BANDEN as readonly string[]).includes(body.band)) data.band = body.band
  if (NIVEAUS[body.niveau]) data.niveau = body.niveau
  if (typeof body.betaald === 'boolean') data.betaald = body.betaald
  if (typeof body.opmerking === 'string') data.opmerking = body.opmerking.trim().slice(0, 500) || null

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ success: false, error: 'Niets te bewaren' }, { status: 400 })
  }

  const entry = await db.tournamentEntry.update({ where: { id }, data }).catch(() => null)
  if (!entry) return NextResponse.json({ success: false, error: 'Inschrijving niet gevonden' }, { status: 404 })
  return NextResponse.json({ success: true, entry })
}

// DELETE /api/toernooi-inschrijvingen/:id — admin verwijdert een inschrijving
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Geen admin' }, { status: 403 })
  const { id } = await params
  const ok = await db.tournamentEntry.delete({ where: { id } }).catch(() => null)
  if (!ok) return NextResponse.json({ success: false, error: 'Inschrijving niet gevonden' }, { status: 404 })
  return NextResponse.json({ success: true })
}
