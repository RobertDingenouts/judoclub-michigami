import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET ?naam=Jan Jansen → kandidaat-lidrecords om in te samenvoegen (match op achternaam/voornaam)
export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Geen admin' }, { status: 403 })
  const naam = new URL(req.url).searchParams.get('naam') ?? ''
  const parts = naam.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return NextResponse.json({ kandidaten: [] })
  const last = parts.at(-1)!, first = parts.slice(0, -1).join(' ')

  const found = await db.member.findMany({
    where: {
      NOT: { clubStatus: 'PROEF' },
      OR: [
        { lastName: { contains: last, mode: 'insensitive' } },
        ...(first ? [{ firstName: { contains: first, mode: 'insensitive' as const } }] : []),
      ],
    },
    orderBy: { joinDate: 'asc' },
    take: 10,
    select: { id: true, firstName: true, lastName: true, clubStatus: true, joinDate: true, bondsnummer: true },
  })
  return NextResponse.json({ kandidaten: found })
}
