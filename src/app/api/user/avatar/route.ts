import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import path from 'path'
import fs from 'fs/promises'

export const dynamic = 'force-dynamic'

// POST - Upload avatar image
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

    // Validate file size (max 2MB)
    if (avatarFile.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'Bestand is te groot (max 2MB)' }, { status: 400 })
    }

    // Generate filename
    const ext = avatarFile.name.split('.').pop() || 'jpg'
    const filename = `avatar-${user.id}-${Date.now()}.${ext}`
    const publicDir = path.join(process.cwd(), 'public', 'avatars')
    const filePath = path.join(publicDir, filename)

    // Ensure directory exists
    try {
      await fs.mkdir(publicDir, { recursive: true })
    } catch {
      // Directory might already exist
    }

    // Save file
    const buffer = Buffer.from(await avatarFile.arrayBuffer())
    await fs.writeFile(filePath, buffer)

    // Update user imageUrl
    const imageUrl = `/avatars/${filename}`
    await db.user.update({
      where: { id: user.id },
      data: { imageUrl },
    })

    return NextResponse.json({ success: true, imageUrl })
  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json({ error: 'Fout bij uploaden avatar' }, { status: 500 })
  }
}
