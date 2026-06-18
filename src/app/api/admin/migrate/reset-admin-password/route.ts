import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

// One-time: reset admin password
// Run once then DELETE this endpoint
const TOKEN='migrat...gami'

export async function POST(request: Request) {
  const token = request.headers.get('x-migrate-token') || ''
  if (token !== TOKEN) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
  }

  const email = 'robertdingenouts@gmail.com'
  const newPassword = 'admin123'

  const user = await db.user.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const hash = await bcrypt.hash(newPassword, 12)
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: hash },
  })

  return NextResponse.json({
    success: true,
    message: `Password reset for ${email}`,
    userId: user.id,
    role: user.role,
  })
}
