import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as bcrypt from 'bcryptjs'
export const dynamic = 'force-dynamic'
export async function GET() {
  const out: Record<string, unknown> = {}
  try {
    const user = await db.user.findUnique({ where: { email: 'robertdingenouts@gmail.com' } })
    out.gevonden = !!user
    out.rol = user?.role
    out.hash_prefix = user?.passwordHash?.slice(0, 7)
    out.is_active = user?.is_active
    out.bcrypt_ok = user?.passwordHash ? await bcrypt.compare('admin123', user.passwordHash) : null
  } catch (e) {
    out.fout = String((e as Error).message).slice(0, 200)
  }
  return NextResponse.json(out)
}
