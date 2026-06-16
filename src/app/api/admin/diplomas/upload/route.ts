import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// POST - Admin uploads a physical diploma PDF/image for a member
// Stores file as base64 in DB (Vercel serverless has no persistent filesystem)
export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Alleen admins' }, { status: 403 })
  }

  try {
    const formData = await request.formData()
    const memberId = formData.get('memberId') as string
    const diplomaType = (formData.get('diplomaType') as string) || 'ACHIEVEMENT'
    const title = formData.get('title') as string
    const beltLevelRaw = formData.get('beltLevel') as string | null
    const awardedAt = formData.get('awardedAt') as string | null
    const file = formData.get('file')

    if (!memberId || !title || !file) {
      return NextResponse.json({ error: 'Ontbrekende velden: memberId, title, file' }, { status: 400 })
    }

    const member = await db.member.findUnique({ where: { id: memberId } })
    if (!member) {
      return NextResponse.json({ error: 'Lid niet gevonden' }, { status: 404 })
    }

    // Convert file to base64 data URI (Vercel can't write to filesystem)
    let pdfUrl: string | null = null
    if (file instanceof File) {
      // Max 10MB check
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'Bestand te groot (max 10MB)' }, { status: 400 })
      }
      const buffer = Buffer.from(await file.arrayBuffer())
      const mimeType = file.type || 'application/pdf'
      const base64 = buffer.toString('base64')
      pdfUrl = `data:${mimeType};base64,${base64}`
    }

    // Generate verification code
    const crypto = await import('crypto')
    const verificationCode = `MJ-${crypto.randomBytes(2).toString('hex').toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`

    // Create diploma record
    const diploma = await db.diploma.create({
      data: {
        type: diplomaType as any,
        title,
        recipientId: memberId,
        userId: member.userId,
        beltLevel: beltLevelRaw ? (beltLevelRaw as any) : undefined,
        awardedAt: awardedAt ? new Date(awardedAt) : new Date(),
        verificationCode,
        pdfUrl,
      },
    })

    return NextResponse.json({
      success: true,
      diploma: {
        id: diploma.id,
        title: diploma.title,
        verificationCode: diploma.verificationCode,
        hasFile: !!pdfUrl,
      },
    })
  } catch (error) {
    console.error('Diploma upload error:', error)
    const msg = error instanceof Error ? error.message : 'Onbekende fout'
    return NextResponse.json({ error: `Fout bij uploaden diploma: ${msg}` }, { status: 500 })
  }
}
