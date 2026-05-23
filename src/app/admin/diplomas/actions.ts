'use server'

import { db } from '@/lib/db'

export async function verifyDiploma(code: string) {
  const trimmed = code.trim().toUpperCase()
  if (!trimmed) return { error: 'Voer een verificatiecode in' }

  const diploma = await db.diploma.findUnique({
    where: { verificationCode: trimmed },
    include: {
      member: { select: { firstName: true, lastName: true } },
    },
  })

  if (!diploma) return { error: 'Diploma niet gevonden met deze code' }

  return {
    valid: true,
    diploma: {
      id: diploma.id,
      type: diploma.type,
      title: diploma.title,
      description: diploma.description,
      recipientName: `${diploma.member?.firstName} ${diploma.member?.lastName}`.trim(),
      beltLevel: diploma.beltLevel,
      courseName: diploma.courseName,
      awardedAt: diploma.awardedAt.toISOString(),
      verificationCode: diploma.verificationCode,
      imageUrl: diploma.imageUrl,
    },
  }
}
