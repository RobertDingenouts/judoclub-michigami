import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// POST { date: 'YYYY-MM-DD', group, activity?, notes? }  → TrainingDay aanmaken
// PATCH { id, activity?, cancelled?, notes? }            → bijwerken
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Geen admin' }, { status: 403 })
  const { date, group, activity, notes } = await req.json()
  if (!date || !group) return NextResponse.json({ error: 'date + group nodig' }, { status: 400 })
  const day = await db.trainingDay.upsert({
    where: { date_group: { date: new Date(date), group } },
    create: { date: new Date(date), group, location: group === 'WOENSDAG' ? 'OUD_VOSSEMEER' : 'STEENBERGEN', activity: activity || null, notes: notes || null },
    update: { activity: activity || null },
  })
  return NextResponse.json({ ok: true, id: day.id })
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Geen admin' }, { status: 403 })
  const { id, activity, cancelled, notes } = await req.json()
  if (!id) return NextResponse.json({ error: 'id nodig' }, { status: 400 })
  const day = await db.trainingDay.update({
    where: { id },
    data: { ...(activity !== undefined && { activity: activity || null }), ...(cancelled !== undefined && { cancelled }), ...(notes !== undefined && { notes: notes || null }) },
  })
  return NextResponse.json({ ok: true, id: day.id })
}
