import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Eenmalige migratie: voeg e-mailverificatie + reset kolommen toe aan User.
// Wordt aangeroepen via browser-console als admin na deploy.
// VERWIJDER deze route na succesvolle uitvoering.
export async function POST() {
  const statements = [
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMP(3);`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerifyToken" TEXT;`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerifyExpires" TIMESTAMP(3);`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "pendingEmail" TEXT;`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetToken" TEXT;`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetTokenExpires" TIMESTAMP(3);`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "User_emailVerifyToken_key" ON "User"("emailVerifyToken");`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "User_resetToken_key" ON "User"("resetToken");`,
  ]

  const results: string[] = []
  for (const sql of statements) {
    try {
      await db.$executeRawUnsafe(sql)
      results.push(`OK: ${sql.slice(0, 50)}`)
    } catch (err: any) {
      results.push(`FAIL: ${sql.slice(0, 50)} -> ${err.message}`)
    }
  }

  return NextResponse.json({ success: true, results })
}
