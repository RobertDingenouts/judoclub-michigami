// Volledige dump van de OUDE productie-tak (veiligheidsnet vóór promote)
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import zlib from 'zlib'
const prod = fs.readFileSync('/home/suffie/.hermes/profiles/michigami/cache/scratch/prod_url.txt', 'utf8').trim()
const p = new PrismaClient({ datasourceUrl: prod })
const dump = {}
for (const t of ['User', 'Member', 'MembershipApplication', 'ExamAttempt', 'ExamResult', 'CourseProgress', 'Diploma', 'Event', 'Technique']) {
  dump[t] = await p.$queryRawUnsafe(`SELECT * FROM "${t}"`)
}
const out = '/home/suffie/michigami-backups/backup-productie-oud-schema-2026-10-07.json.gz'
fs.writeFileSync(out, zlib.gzipSync(JSON.stringify(dump, null, 1)))
console.log('backup:', out, fs.statSync(out).size, 'bytes')
for (const t of Object.keys(dump)) console.log(' ', t, dump[t].length)
await p.$disconnect()
