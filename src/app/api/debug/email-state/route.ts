import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// EENMALIGE DEBUG ROUTE — verwijder na gebruik
export async function GET() {
  const me = await db.user.findFirst({
    where: { email: 'robertdingenouts@gmail.com' },
    select: { email: true, resetToken: true, resetTokenExpires: true },
  })

  const base = process.env.NEXT_PUBLIC_BASE_URL || '(leeg)'
  return NextResponse.json({
    NEXT_PUBLIC_BASE_URL_runtime: base,
    resetToken: me?.resetToken || '(geen)',
    resetTokenExpires: me?.resetTokenExpires || null,
    builtResetUrl: me?.resetToken ? `${base}/wachtwoord-reset?token=${me.resetToken}` : '(geen token)',
  })
}
