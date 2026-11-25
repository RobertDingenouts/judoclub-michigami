// Kopieer rijen die in PROD bestaan maar niet in DEV (id-based), kolomdoorsnede, FK-volgorde.
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
const dev = fs.readFileSync('/home/suffie/.hermes/profiles/michigami/cache/scratch/dev_url.txt', 'utf8').trim()
const prod = fs.readFileSync('/home/suffie/.hermes/profiles/michigami/cache/scratch/prod_url.txt', 'utf8').trim()
const d = new PrismaClient({ datasourceUrl: dev })
const p = new PrismaClient({ datasourceUrl: prod })

async function cols(db, t) {
  const r = await db.$queryRaw`SELECT column_name, udt_name FROM information_schema.columns WHERE table_schema='public' AND table_name=${t}`
  return Object.fromEntries(r.map(x => [x.column_name, x.udt_name]))
}
const BASIS = ['text', 'varchar', 'int4', 'int8', 'float8', 'numeric', 'bool', 'timestamp', 'timestamptz', 'date', 'uuid', 'bytea']
const TABELLEN = ['User', 'Member', 'MembershipApplication', 'ExamAttempt', 'ExamResult', 'CourseProgress', 'Diploma', 'Event', 'Technique']
let totaal = 0
for (const t of TABELLEN) {
  const pc = await cols(p, t), dc = await cols(d, t)
  const common = Object.keys(pc).filter(c => dc[c])
  if (!common.includes('id')) { console.log(t, 'geen id-kolom, overslaan'); continue }
  const rows = await p.$queryRawUnsafe(`SELECT * FROM "${t}"`)
  const devIds = new Set((await d.$queryRawUnsafe(`SELECT id FROM "${t}"`)).map(r => r.id))
  const missend = rows.filter(r => !devIds.has(r.id))
  if (!missend.length) { console.log(t, '— alles overgenomen'); continue }
  const ph = common.map((c, i) => BASIS.includes(dc[c]) ? `$${i + 1}` : dc[c] === 'jsonb' ? `$${i + 1}::jsonb` : `$${i + 1}::"${dc[c]}"`).join(',')
  for (const row of missend) {
    const vals = common.map(c => {
      const v = row[c]
      if (dc[c] === 'jsonb' && v != null && typeof v !== 'string') return JSON.stringify(v)
      return v
    })
    await d.$executeRawUnsafe(`INSERT INTO "${t}" (${common.map(c => `"${c}"`).join(',')}) VALUES (${ph})`, ...vals)
  }
  console.log(t, '→', missend.length, 'rijen overgezet') // geen PII in het logboek (minderjarigen!)
  totaal += missend.length
}
console.log('TOTAAL overgezet:', totaal)
for (const t of TABELLEN) {
  const dn = (await d.$queryRawUnsafe(`SELECT COUNT(*)::int n FROM "${t}"`))[0].n
  const pn = (await p.$queryRawUnsafe(`SELECT COUNT(*)::int n FROM "${t}"`))[0].n
  console.log(`${t}: DEV ${dn} / PROD ${pn}`, dn >= pn ? 'OK' : '❌')
}
await d.$disconnect(); await p.$disconnect()
