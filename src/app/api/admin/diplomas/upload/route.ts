import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import path from 'path'
import fs from 'fs/promises'

export const dynamic = 'force-dynamic'

// POST - Admin uploads a physical diploma PDF/image for a member
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
    const beltLevel = formData.get('beltLevel') as string | null
    const awardedAt = formData.get('awardedAt') as string | null
    const file = formData.get('file')

    if (!memberId || !title || !file) {
      return NextResponse.json({ error: 'Ontbrekende velden: memberId, title, file' }, { status: 400 })
    }

    const member = await db.member.findUnique({ where: { id: memberId } })
    if (!member) {
      return NextResponse.json({ error: 'Lid niet gevonden' }, { status: 404 })
    }

    // Save file
    let pdfUrl: string | null = null
    if (file instanceof File) {
      const ext = file.name.split('.').pop() || 'pdf'
      const filename = `diploma-${memberId}-${Date.now()}.${ext}`
      const publicDir = path.join(process.cwd(), 'public', 'diplomas')
      const filePath = path.join(publicDir, filename)

      try {
        await fs.mkdir(publicDir, { recursive: true })
      } catch {
        // Directory might already exist
      }

      const buffer = Buffer.from(await file.arrayBuffer())
      await fs.writeFile(filePath, buffer)
      pdfUrl = `/diplomas/${filename}`
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
        beltLevel: beltLevel as any,
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
        pdfUrl: diploma.pdfUrl,
      },
    })
  } catch (error) {
    console.error('Diploma upload error:', error)
    return NextResponse.json({ error: 'Fout bij uploaden diploma' }, { status: 500 })
  }
}
