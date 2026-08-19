import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// One-time migration: create/update MembershipApplication table
// Run via: fetch('/api/admin/migrate/inschrijvingen-schema', {method:'POST'}).then(r=>r.json()).then(console.log)
// One-time token (removed after use on 2026-08-19) — allows running the
// migration via curl without an admin session.
const ONE_TIME_TOKEN = 'f16f063b376f30f2af82e5a774737e88c63c7f735f259278'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const tokenOk = authHeader === 'Bearer ' + ONE_TIME_TOKEN
  let admin = tokenOk
  if (!admin) {
    try {
      admin = await isAdmin()
    } catch {
      admin = false
    }
  }
  if (!admin) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const results: string[] = []
  const run = async (label: string, sql: string) => {
    try {
      await db.$executeRawUnsafe(sql)
      results.push(`OK: ${label}`)
      return true
    } catch (e: any) {
      results.push(`FAIL: ${label} — ${e.message}`)
      return false
    }
  }

  // 1. ApplicationStatus enum (idempotent)
  await run('ApplicationStatus enum', `
    DO $$ BEGIN
      CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  // 2. MembershipApplication table (idempotent, correct Postgres DDL)
  await run('MembershipApplication table', `
    CREATE TABLE IF NOT EXISTS "MembershipApplication" (
      "id" text PRIMARY KEY,
      "firstName" text NOT NULL,
      "lastName" text NOT NULL,
      "email" text NOT NULL,
      "phone" text,
      "dateOfBirth" timestamp(3),
      "gender" text,
      "address" text,
      "postalCode" text,
      "city" text,
      "location" text NOT NULL,
      "preferredGroup" text,
      "isChild" boolean DEFAULT false,
      "parentName" text,
      "parentEmail" text,
      "parentPhone" text,
      "medicalNotes" text,
      "emergencyContact" text,
      "costAgreed" boolean DEFAULT false,
      "privacyAgreed" boolean DEFAULT false,
      "privacyAgreedAt" timestamp(3),
      "termsAgreed" boolean DEFAULT false,
      "termsAgreedAt" timestamp(3),
      "codeOfConduct" boolean DEFAULT false,
      "portraitRights" boolean,
      "nameMention" boolean,
      "status" "ApplicationStatus" DEFAULT 'PENDING',
      "adminNotes" text,
      "approvedBy" text,
      "approvedAt" timestamp(3),
      "rejectedAt" timestamp(3),
      "rejectionReason" text,
      "memberId" text,
      "createdAt" timestamp(3) DEFAULT now(),
      "updatedAt" timestamp(3) DEFAULT now()
    );
  `)

  // 3. Missing columns in case the table pre-exists with an older shape
  const columns: [string, string][] = [
    ['privacyAgreedAt', 'timestamp(3)'],
    ['termsAgreedAt', 'timestamp(3)'],
    ['codeOfConduct', 'boolean DEFAULT false'],
    ['nameMention', 'boolean'],
    ['preferredGroup', 'text'],
  ]
  for (const [col, type] of columns) {
    await run(`column ${col}`, `ALTER TABLE "MembershipApplication" ADD COLUMN IF NOT EXISTS "${col}" ${type}`)
  }

  // 4. Drop obsolete column if it exists
  await run('drop membershipType (obsolete)', `ALTER TABLE "MembershipApplication" DROP COLUMN IF EXISTS "membershipType"`)

  // 5. Indexes (idempotent)
  await run('index status', `CREATE INDEX IF NOT EXISTS "MembershipApplication_status_idx" ON "MembershipApplication"("status")`)
  await run('index email', `CREATE INDEX IF NOT EXISTS "MembershipApplication_email_idx" ON "MembershipApplication"("email")`)
  await run('index createdAt', `CREATE INDEX IF NOT EXISTS "MembershipApplication_createdAt_idx" ON "MembershipApplication"("createdAt")`)

  // 6. Verify
  let rowCount = -1
  try {
    const count = await db.$queryRawUnsafe<any[]>(`SELECT COUNT(*)::int FROM "MembershipApplication"`)
    rowCount = count[0]?.count ?? -1
    results.push(`VERIFY: table exists, ${rowCount} rows`)
  } catch (e: any) {
    results.push(`VERIFY FAIL: ${e.message}`)
  }

  const failed = results.filter(r => r.startsWith('FAIL:'))
  return NextResponse.json({
    success: failed.length === 0 && rowCount >= 0,
    rowCount,
    results,
  })
}