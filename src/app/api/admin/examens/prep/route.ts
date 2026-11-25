import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// POST /api/admin/examens/prep
// 1) Techniek af/afvinken: { memberId, targetBelt, key: `${catId}|${nameJa}`, checked: boolean }
// 2) Band-sinds handmatig zetten: { memberId, beltSince: 'YYYY-MM-DD' | null }
export async function POST(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  const body = await request.json()

  if (body.beltSince !== undefined) {
    await db.member.update({
      where: { id: body.memberId },
      data: { beltSince: body.beltSince ? new Date(body.beltSince + 'T12:00:00') : null },
    })
    return NextResponse.json({ ok: true })
  }

  const { memberId, targetBelt, key, checked } = body as { memberId?: string; targetBelt?: string; key?: string; checked?: boolean }
  if (!memberId || !targetBelt || !key) return NextResponse.json({ error: 'memberId, targetBelt en key verplicht' }, { status: 400 })

  const result = await db.$transaction(async (tx) => {
    // advisory lock op deze lid+band: twee trainers die tegelijk toggelen overschrijven elkaar niet
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${memberId + ':' + targetBelt}))`
    const row = await tx.examPrep.findUnique({ where: { memberId_targetBelt: { memberId, targetBelt } } })
    const map = { ...((row?.checked as Record<string, boolean>) ?? {}) }
    if (checked) map[key] = true
    else delete map[key]
    await tx.examPrep.upsert({
      where: { memberId_targetBelt: { memberId, targetBelt } },
      create: { memberId, targetBelt, checked: map },
      update: { checked: map },
    })
    return map
  })
  return NextResponse.json({ ok: true, checked: result })
}
