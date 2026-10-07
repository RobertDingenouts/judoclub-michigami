import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
export const dynamic = 'force-dynamic'
export async function GET() {
  const url = process.env.DATABASE_URL || ''
  const host = (url.match(/@([^/?]+)/) || [])[1] || 'GEEN DATABASE_URL'
  let leden = -1
  let hash = ''
  try {
    const r = (await db.$queryRawUnsafe(`SELECT COUNT(*)::int n FROM "Member"`)) as { n: number }[]
    leden = r[0].n
    const h = (await db.$queryRawUnsafe(`SELECT substring("passwordHash" for 7) h FROM "User" WHERE email='robertdingenouts@gmail.com'`)) as { h: string }[]
    hash = h[0]?.h || 'GEEN ADMIN'
  } catch (e) { hash = 'FOUT: ' + String((e as Error).message).slice(0, 60) }
  return NextResponse.json({ host, leden, hash })
}
