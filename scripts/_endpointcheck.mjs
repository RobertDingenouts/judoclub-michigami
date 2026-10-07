import { PrismaClient } from '@prisma/client'
import fs from 'fs'
const prod = fs.readFileSync('/home/suffie/.hermes/profiles/michigami/cache/scratch/prod_url.txt', 'utf8').trim()
const direct = prod.replace('-pooler', '')
for (const [n, u] of [['POOLER', prod], ['DIRECT', direct]]) {
  try {
    const db = new PrismaClient({ datasourceUrl: u })
    const m = await db.$queryRawUnsafe(`SELECT COUNT(*)::int n FROM "Member"`)
    const h = await db.$queryRawUnsafe(`SELECT substring("passwordHash" for 12) h FROM "User" WHERE email='robertdingenouts@gmail.com'`)
    console.log(n, '| Member:', m[0].n, '| hash:', h[0]?.h)
    await db.$disconnect()
  } catch (e) { console.log(n, 'FOUT:', String(e.message).slice(0, 100)) }
}
