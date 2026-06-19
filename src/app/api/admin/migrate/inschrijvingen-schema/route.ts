import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// One-time migration: create MembershipApplication table
// Run via: fetch('/api/admin/migrate/inschrijvingen-schema', {method:'POST'}).then(r=>r.json()).then(console.log)
export async function POST(request: NextRequest) {
  try {
    const admin = await isAdmin()
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
          "membershipType" text NOT NULL,
          "isChild" boolean DEFAULT false,
          "parentName" text,
          "parentEmail" text,
          "parentPhone" text,
          "medicalNotes" text,
          "emergencyContact" text,
          "costAgreed" boolean DEFAULT false,
          "privacyAgreed" boolean DEFAULT false,
          "termsAgreed" boolean DEFAULT false,
          "portraitRights" boolean,
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
