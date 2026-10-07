import { NextResponse } from 'next/server'
import { login } from '@/lib/auth'
export const dynamic = 'force-dynamic'
export async function GET() {
  let out: Record<string, unknown>
  try {
    const r = await login('robertdingenouts@gmail.com', 'admin123')
    out = { succes: r.success, fout: r.error ?? null }
  } catch (e) {
    out = { exception: String((e as Error).message).slice(0, 300) }
  }
  return NextResponse.json(out)
}
