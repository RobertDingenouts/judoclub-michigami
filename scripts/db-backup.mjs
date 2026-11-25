// Nachtelijke database-backup: alle relevante tabellen als JSON naar
// ~/michigami-backups/ (behoud: 21 nachten). Git bewaart de CODE, dit bewaart
// de GEGEVENS (leden, contributie, aanwezigheid). Run via cron.
import { PrismaClient } from '@prisma/client'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

const DIR = path.join(os.homedir(), 'michigami-backups')
fs.mkdirSync(DIR, { recursive: true })
const dag = new Date().toISOString().slice(0, 10)
const bestand = path.join(DIR, `db-${dag}.json.gz`)

const db = new PrismaClient()
const tables = {
  members: db.member.findMany(),
  users: db.user.findMany(),
  payments: db.payment.findMany(),
  periods: db.contributionPeriod.findMany(),
  attendance: db.attendance.findMany(),
  trainingDays: db.trainingDay.findMany(),
  examAttempts: db.examAttempt.findMany(),
  examResults: db.examResult.findMany(),
  diplomas: db.diploma.findMany(),
  registrations: db.membershipApplication.findMany(),
  bondHistory: db.bondHistory.findMany(),
  competitions: db.competition.findMany(),
  courses: db.courseProgress.findMany(),
  events: db.event.findMany(),
}
const dump = {}
for (const [naam, q] of Object.entries(tables)) {
  try { dump[naam] = await q } catch (e) { dump[naam] = { error: String(e) } }
}
await db.$disconnect()

const gzip = (await import('node:zlib')).gzipSync
fs.writeFileSync(bestand, gzip(Buffer.from(JSON.stringify(dump))))
fs.chmodSync(bestand, 0o600) // dump bevat hashes/PII — alleen eigenaar leesbaar

// behoud: 21 nieuwste backups
const alle = fs.readdirSync(DIR).filter(f => f.startsWith('db-') && f.endsWith('.json.gz')).sort()
for (const oud of alle.slice(0, -21)) fs.unlinkSync(path.join(DIR, oud))

const kb = (fs.statSync(bestand).size / 1024).toFixed(0)
console.log(`BACKUP OK ${bestand} (${kb} KB, ${Object.keys(dump).length} tabellen)`)
