import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { db } from '@/lib/db'
import { DiplomaType } from '@prisma/client'

export const dynamic = 'force-dynamic'

/**
 * One-time migration: update existing Cursus Japans diploma titles
 * from "Cursus Japans — ..." to "Online Cursus Japans — ..."
 * DELETE this endpoint after use.
 */
export async function POST() {
  try {
    if (!isAdmin()) {
      return NextResponse.json({ error: 'Alleen admin' }, { status: 403 })
    }

    // Find all COURSE_JAPANESE diplomas with old title pattern
    const oldDiplomas = await db.diploma.findMany({
      where: {
        type: DiplomaType.COURSE_JAPANESE,
        title: {
          startsWith: 'Cursus Japans',
        },
      },
    })

    const updated: Array<{ id: string; oldTitle: string; newTitle: string }> = []

    for (const diploma of oldDiplomas) {
      const newTitle = diploma.title.replace('Cursus Japans', 'Online Cursus Japans')

      await db.diploma.update({
        where: { id: diploma.id },
        data: { title: newTitle },
      })

      updated.push({
        id: diploma.id,
        oldTitle: diploma.title,
        newTitle,
      })
    }

    return NextResponse.json({
      success: true,
      message: `${updated.length} diploma titel(s) bijgewerkt`,
      updated,
    })
  } catch (error: any) {
    console.error('Online cursus japans titles migration error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Fout bij migratie',
    }, { status: 500 })
  }
}
