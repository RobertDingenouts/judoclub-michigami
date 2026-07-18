import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * One-time migration: create Member record for ADMIN users who don't have one.
 * This allows admins to also be students - access /leden pages, do courses, etc.
 * DELETE this endpoint after use.
 */
export async function POST() {
  try {
    if (!isAdmin()) {
      return NextResponse.json({ error: 'Alleen admin' }, { status: 403 })
    }

    // Find admin users without Member records
    const adminUsers = await db.user.findMany({
      where: { role: 'ADMIN' },
      include: { member: true },
    })

    const withoutMember = adminUsers.filter(u => !u.member)

    if (withoutMember.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Alle admin accounts hebben al een Member record',
        created: [],
      })
    }

    const created: any[] = []
    for (const user of withoutMember) {
      const nameParts = (user.name || user.email?.split('@')[0] || 'Admin').split(' ')
      const firstName = nameParts[0] || 'Admin'
      const lastName = nameParts.slice(1).join(' ') || ''

      const member = await db.member.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          email: user.email || null,
          joinDate: new Date(),
          currentBelt: 'WIT' as any,
        },
      })

      created.push({
        userId: user.id,
        email: user.email,
        memberId: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
      })
    }

    return NextResponse.json({
      success: true,
      message: `${created.length} Member record(s) aangemaakt voor admin(s)`,
      created,
    })
  } catch (error: any) {
    console.error('Member-for-admin migration error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Fout bij migratie',
    }, { status: 500 })
  }
}
