import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// POST - Upload avatar image (base64 in DB, no filesystem)
export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  try {
    const formData = await request.formData()
    const avatarFile = formData.get('avatar')

    if (!avatarFile || !(avatarFile instanceof File)) {
      return NextResponse.json({ error: 'Geen bestand ontvangen' }, { status: 400 })
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(avatarFile.type)) {
      return NextResponse.json({ error: 'Alleen JPG, PNG en WebP toegestaan' }, { status: 400 })
    }

    // Validate file size (max 1MB for base64 storage)
    if (avatarFile.size > 1 * 1024 * 1024) {
      return NextResponse.json({ error: 'Bestand is te groot (max 1MB)' }, { status: 400 })
    }

    // Convert to base64 data URL
    const buffer = Buffer.from(await avatarFile.arrayBuffer())
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${avatarFile.type};base64,${base64}`

    // Update user imageUrl with base64 data URL
    await db.user.update({
      where: { id: user.id },
      data: { imageUrl: dataUrl },
    })

    return NextResponse.json({ success: true, imageUrl: dataUrl })
  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json({ error: 'Fout bij uploaden avatar' }, { status: 500 })
  }
}
