import { NextResponse } from 'next/server'
import { destroySession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    await destroySession()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}
