import { PrismaClient } from '@prisma/client'
import fs from 'fs'
const dev = fs.readFileSync('/home/suffie/.hermes/profiles/michigami/cache/scratch/dev_url.txt', 'utf8').trim()
const prod = fs.readFileSync('/home/suffie/.hermes/profiles/michigami/cache/scratch/prod_url.txt', 'utf8').trim()
for (const [n, u] of [['DEV', dev], ['PROD', prod]]) {
  const db = new PrismaClient({ datasourceUrl: u })
  const r = await db.$queryRawUnsafe(`SELECT substring("passwordHash" for 29) h FROM "User" WHERE email='robertdingenouts@gmail.com'`)
  console.log(n, r[0]?.h)
  await db.$disconnect()
}
