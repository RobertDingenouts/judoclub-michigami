import { PrismaClient } from '@prisma/client'
import fs from 'fs'
const dev = fs.readFileSync('/home/suffie/.hermes/profiles/michigami/cache/scratch/dev_url.txt', 'utf8').trim()
const prod = fs.readFileSync('/home/suffie/.hermes/profiles/michigami/cache/scratch/prod_url.txt', 'utf8').trim()
for (const [naam, url] of [['DEV', dev], ['PROD', prod]]) {
  const db = new PrismaClient({ datasourceUrl: url })
  const app = await db.$queryRawUnsafe(`SELECT COUNT(*)::int n, MAX("createdAt")::date nieuwste FROM "MembershipApplication"`)
  const usr = await db.$queryRawUnsafe(`SELECT MAX("createdAt")::date nieuwste FROM "User"`)
  const mem = await db.$queryRawUnsafe(`SELECT MAX("createdAt")::date nieuwste FROM "Member"`)
  const dip = await db.$queryRawUnsafe(`SELECT COUNT(*)::int n FROM "Diploma"`)
  console.log(naam, '| Apps:', app[0].n, 'nieuwste:', app[0].nieuwst, '| User nieuwst:', usr[0].nieuwst, '| Member nieuwst:', mem[0].nieuwst, '| Diploma:', dip[0].n)
  if (naam === 'PROD') {
    const recent = await db.$queryRawUnsafe(`SELECT "firstName", "lastName", status, "createdAt"::date FROM "MembershipApplication" ORDER BY "createdAt" DESC LIMIT 5`)
    console.log('  PROD recentste apps:', JSON.stringify(recent))
  }
  await db.$disconnect()
}
