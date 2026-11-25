import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'
import type { BeltLevel, Role } from '@prisma/client'

export const dynamic = 'force-dynamic'

// POST - Bulk operations on students
export async function POST(request: Request) {
  const admin = await isAdmin()
  if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { action, studentIds, data } = body

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({ error: 'Geen studenten geselecteerd' }, { status: 400 })
    }
    if (studentIds.length > 1000 || !studentIds.every((s: unknown) => typeof s === 'string' && s.length > 0)) {
      return NextResponse.json({ error: 'Ongelerste studentIds (max 1000)' }, { status: 400 })
    }

    // Verify all students exist
    const students = await db.member.findMany({
      where: { id: { in: studentIds } },
      include: { user: true },
    })

    if (students.length !== studentIds.length) {
      return NextResponse.json({ error: 'Een of meer studenten niet gevonden' }, { status: 404 })
    }

    let result
    switch (action) {
      case 'activate':
        await db.member.updateMany({
          where: { id: { in: studentIds } },
          data: { isActive: true },
        })
        await db.user.updateMany({
          where: { id: { in: students.map(s => s.userId) } },
          data: { is_active: true },
        })
        result = { message: `${students.length} student geactiveerd` }
        break

      case 'deactivate':
        await db.member.updateMany({
          where: { id: { in: studentIds } },
          data: { isActive: false },
        })
        await db.user.updateMany({
          where: { id: { in: students.map(s => s.userId) } },
          data: { is_active: false },
        })
        result = { message: `${students.length} student gedeactiveerd` }
        break

      case 'setBelt':
        if (!data?.currentBelt) {
          return NextResponse.json({ error: 'Band is verplicht' }, { status: 400 })
        }
        await db.member.updateMany({
          where: { id: { in: studentIds } },
          data: { currentBelt: data.currentBelt as BeltLevel },
        })
        await db.user.updateMany({
          where: { id: { in: students.map(s => s.userId) } },
          data: { currentBelt: data.currentBelt as BeltLevel },
        })
        result = { message: `Band bijgewerkt voor ${students.length} student` }
        break

      case 'setRole':
        if (!data?.role || !['MEMBER', 'PARENT', 'INSTRUCTOR', 'ADMIN'].includes(data.role)) {
          return NextResponse.json({ error: 'Ongeldige rol' }, { status: 400 })
        }
        await db.user.updateMany({
          where: { id: { in: students.map(s => s.userId) } },
          data: { role: data.role as Role },
        })
        result = { message: `Rol bijgewerkt voor ${students.length} student` }
        break

      case 'delete':
        // Soft delete - just deactivate
        await db.member.updateMany({
          where: { id: { in: studentIds } },
          data: { isActive: false },
        })
        await db.user.updateMany({
          where: { id: { in: students.map(s => s.userId) } },
          data: { is_active: false },
        })
        result = { message: `${students.length} student verwijderd (gedeactiveerd)` }
        break

      default:
        return NextResponse.json({ error: 'Onbekende actie' }, { status: 400 })
    }

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error('Bulk operation error:', error)
    return NextResponse.json({ error: 'Fout bij bulk operatie' }, { status: 500 })
  }
}