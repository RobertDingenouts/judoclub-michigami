import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/admin/tournament/[slug] — laad poelsetup
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const admin = await isAdmin()
  if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 })
  const { slug } = await params
  try {
    const row = await db.tournamentSetup.findUnique({ where: { toernooi: slug } })
    if (!row) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json({ data: row.data, updatedAt: row.updatedAt })
  } catch (error) {
    console.error('tournament GET:', error)
    return NextResponse.json({ error: 'Ophalen mislukt (details in serverlogboek)' }, { status: 500 })
  }
}

// PUT /api/admin/tournament/[slug] — bewaar poelsetup (volledige state)
export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const admin = await isAdmin()
  if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 })
  const { slug } = await params
  const body = await request.json()
  if (!body || !Array.isArray(body.poeelen) || !Array.isArray(body.deelnemers)) {
    return NextResponse.json({ error: 'Ongelde payload: { deelnemers, poeelen } vereist' }, { status: 400 })
  }
  const row = await db.tournamentSetup.upsert({
    where: { toernooi: slug },
    create: { toernooi: slug, data: body as any },
    update: { data: body as any },
  })
  return NextResponse.json({ ok: true, updatedAt: row.updatedAt })
}
