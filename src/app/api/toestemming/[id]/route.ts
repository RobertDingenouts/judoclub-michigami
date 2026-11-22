import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { checkToestemmingToken } from '@/lib/toestemming-token'

export const dynamic = 'force-dynamic'

// GET /api/toestemming/<memberId>?t=<token> — haal naam + huidige toestemming op
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const token = req.nextUrl.searchParams.get('t')
  if (!token || !checkToestemmingToken(id, token)) {
    return NextResponse.json({ error: 'Ongeldige link' }, { status: 403 })
  }
  const m = await db.member.findUnique({
    where: { id },
    select: { firstName: true, lastName: true, portraitRights: true, nameMention: true },
  })
  if (!m) return NextResponse.json({ error: 'Lid niet gevonden' }, { status: 404 })
  return NextResponse.json({
    voornaam: m.firstName,
    achternaam: m.lastName,
    portraitRights: m.portraitRights,
    nameMention: m.nameMention,
  })
}

// POST /api/toestemming/<memberId>?t=<token>  body: { portraitRights: boolean, nameMention: boolean }
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const token = req.nextUrl.searchParams.get('t')
  if (!token || !checkToestemmingToken(id, token)) {
    return NextResponse.json({ error: 'Ongeldige link' }, { status: 403 })
  }
  let body: { portraitRights?: boolean; nameMention?: boolean }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Ongeldig verzoek' }, { status: 400 })
  }
  const data: Record<string, boolean> = {}
  if (typeof body.portraitRights === 'boolean') data.portraitRights = body.portraitRights
  if (typeof body.nameMention === 'boolean') data.nameMention = body.nameMention
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Niets om op te slaan' }, { status: 400 })
  }
  const m = await db.member.update({
    where: { id },
    data,
    select: { firstName: true, lastName: true, portraitRights: true, nameMention: true },
  })
  return NextResponse.json({
    ok: true,
    voornaam: m.firstName,
    portraitRights: m.portraitRights,
    nameMention: m.nameMention,
  })
}
