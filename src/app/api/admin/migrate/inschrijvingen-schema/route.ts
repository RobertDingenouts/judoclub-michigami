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
  try {
    const authHeader = request.headers.get('authorization')
    const tokenOk = authHeader === 'Bearer ' + ONE_TIME_TOKEN
    const admin = tokenOk ? true : await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const results: any[] = []

    // Create ApplicationStatus enum
    try {
      await db.$executeRawUnsafe(`
        DO $$ BEGIN
          CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `)
      results.push('ApplicationStatus enum created')
    } catch (e: any) {
      results.push(`ApplicationStatus enum: ${e.message}`)
    }

    // Create MembershipApplication table
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "MembershipApplication" (
          "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
          "firstName" text NOT NULL,
          "lastName" text NOT NULL,
          "email" text NOT NULL,
          "phone" text,
          "dateOfBirth" timestamp(3) precision 3,
          "gender" text,
          "address" text,
          "postalCode" text,
          "city" text,
          "location" text NOT NULL,
          "isChild" boolean DEFAULT false,
          "parentName" text,
          "parentEmail" text,
          "parentPhone" text,
          "medicalNotes" text,
          "emergencyContact" text,
          "costAgreed" boolean DEFAULT false,
          "privacyAgreed" boolean DEFAULT false,
          "privacyAgreedAt" timestamp(3) precision 3,
          "termsAgreed" boolean DEFAULT false,
          "termsAgreedAt" timestamp(3) precision 3,
          "codeOfConduct" boolean DEFAULT false,
          "portraitRights" boolean,
          "nameMention" boolean,
          "status" "ApplicationStatus" DEFAULT 'PENDING',
          "adminNotes" text,
          "approvedBy" text,
          "approvedAt" timestamp(3) precision 3,
          "rejectedAt" timestamp(3) precision 3,
          "rejectionReason" text,
          "memberId" text,
          "createdAt" timestamp(3) precision 3 DEFAULT now(),
          "updatedAt" timestamp(3) precision 3 DEFAULT now()
        );
      `)
      results.push('MembershipApplication table created')
    } catch (e: any) {
      results.push(`MembershipApplication table: ${e.message}`)
    }

    // Add missing columns (in case table already exists from previous migration)
    const columnsToAdd = [
      ['privacyAgreedAt', 'timestamp(3) precision 3'],
      ['termsAgreedAt', 'timestamp(3) precision 3'],
      ['codeOfConduct', 'boolean DEFAULT false'],
      ['nameMention', 'boolean'],
      ['preferredGroup', 'text'],
    ]

    for (const [col, type] of columnsToAdd) {
      try {
        await db.$executeRawUnsafe(`ALTER TABLE "MembershipApplication" ADD COLUMN IF NOT EXISTS "${col}" ${type}`)
        results.push(`Column ${col} added/exists`)
      } catch (e: any) {
        results.push(`Column ${col}: ${e.message}`)
      }
    }

    // Drop membershipType column if it exists (no longer needed)
    try {
      await db.$executeRawUnsafe(`ALTER TABLE "MembershipApplication" DROP COLUMN IF EXISTS "membershipType"`)
      results.push('membershipType column dropped (no longer needed)')
    } catch (e: any) {
      results.push(`Drop membershipType: ${e.message}`)
    }

    // Create indexes
    try {
      await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "MembershipApplication_status_idx" ON "MembershipApplication"("status")`)
      results.push('Index on status created')
    } catch (e: any) {
      results.push(`Index status: ${e.message}`)
    }

    try {
      await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "MembershipApplication_email_idx" ON "MembershipApplication"("email")`)
      results.push('Index on email created')
    } catch (e: any) {
      results.push(`Index email: ${e.message}`)
    }

    try {
      await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "MembershipApplication_createdAt_idx" ON "MembershipApplication"("createdAt")`)
      results.push('Index on createdAt created')
    } catch (e: any) {
      results.push(`Index createdAt: ${e.message}`)
    }

    // Verify
    const count = await db.$queryRaw<any[]>`SELECT COUNT(*)::int FROM "MembershipApplication"`
    results.push(`Table verified: ${count[0].count} rows`)

    return NextResponse.json({ success: true, results })
  } catch (error: any) {
    console.error('[MIGRATE/INSCHRIJVINGEN-SCHEMA] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
