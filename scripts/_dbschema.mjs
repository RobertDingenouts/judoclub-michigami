import { PrismaClient } from '@prisma/client'
import fs from 'fs'
const dev = fs.readFileSync('/home/suffie/.hermes/profiles/michigami/cache/scratch/dev_url.txt', 'utf8').trim()
const prod = fs.readFileSync('/home/suffie/.hermes/profiles/michigami/cache/scratch/prod_url.txt', 'utf8').trim()
for (const [naam, url] of [['DEV', dev], ['PROD', prod]]) {
  const db = new PrismaClient({ datasourceUrl: url })
  const r = await db.$queryRawUnsafe(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`)
  console.log('===', naam, '===')
  console.log(r.map(x => x.table_name).join(', '))
  const m = await db.$queryRawUnsafe(`SELECT COUNT(*)::int n FROM "Member"`)
  const u = await db.$queryRawUnsafe(`SELECT COUNT(*)::int n FROM "User"`)
  console.log('Member:', m[0].n, '| User:', u[0].n)
  await db.$disconnect()
}
