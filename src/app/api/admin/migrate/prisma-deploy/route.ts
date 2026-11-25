/**
 * POST /api/admin/migrate/prisma-deploy
 * 
 * Runs Prisma migrations in production.
 * Only accessible with auth token.
 */

import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { migrateGuard } from '@/lib/migrate-guard'

const execAsync = promisify(exec)

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Allow up to 60 seconds for migrations

export async function POST(request: NextRequest) {
  try {
  const guard = await migrateGuard(request)
  if (guard) return guard

    // Run Prisma migration
    const { stdout, stderr } = await execAsync('npx prisma migrate deploy', {
      cwd: process.cwd(),
    })

    return NextResponse.json({
      success: true,
      output: stdout,
      errors: stderr,
    })
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        stdout: error.stdout,
        stderr: error.stderr,
      },
      { status: 500 }
    )
  }
}
