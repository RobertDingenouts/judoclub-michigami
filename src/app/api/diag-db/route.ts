import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as bcrypt from 'bcryptjs'
export const dynamic = 'force-dynamic'
export async function GET() {
  const url = process.env.DATABASE_URL || ''
  const host = (url.match(/@([^/?]+)/) || [])[1] || 'GEEN'
  return NextResponse.json({ host })
}
export async function POST(request: Request) {
  const url = process.env.DATABASE_URL || ''
  const host = (url.match(/@([^/?]+)/) || [])[1] || 'GEEN'
  const body = await request.json()
  const out: Record<string, unknown> = { host, email: body.email }
  try {
    const user = await db.user.findUnique({ where: { email: String(body.email).trim().toLowerCase() } })
    out.gevonden = !!user
    out.hashPrefix = user?.passwordHash?.slice(0, 7)
    out.is_active = user?.is_active
    out.bcrypt = user?.passwordHash ? await bcrypt.compare(String(body.password), user.passwordHash) : null
  } catch (e) { out.fout = String((e as Error).message).slice(0, 150) }
  return NextResponse.json(out)
}
