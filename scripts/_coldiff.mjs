import { PrismaClient } from '@prisma/client'
import fs from 'fs'
const dev = fs.readFileSync('/home/suffie/.hermes/profiles/michigami/cache/scratch/dev_url.txt', 'utf8').trim()
const prod = fs.readFileSync('/home/suffie/.hermes/profiles/michigami/cache/scratch/prod_url.txt', 'utf8').trim()
const d = new PrismaClient({ datasourceUrl: dev })
const p = new PrismaClient({ datasourceUrl: prod })
async function cols(db, t) {
  const r = await db.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=${t}`
  return new Set(r.map(x => x.column_name))
}
for (const t of ['User', 'Member', 'MembershipApplication', 'ExamAttempt', 'ExamResult', 'CourseProgress', 'Diploma', 'Event', 'Technique']) {
  const dc = await cols(d, t), pc = await cols(p, t)
  const onlyProd = [...pc].filter(c => !dc.has(c))
  const onlyDev = [...dc].filter(c => !pc.has(c))
  console.log(`${t}: VERDWIJNT UIT PROD (${onlyProd.length}):`, onlyProd.join(',') || 'geen', '| NIEUW (${onlyDev.length}):', onlyDev.join(',') || 'geen')
}
await d.$disconnect(); await p.$disconnect()
