import { PrismaClient } from '@prisma/client'
import fs from 'fs'
const prod = fs.readFileSync('/home/suffie/.hermes/profiles/michigami/cache/scratch/prod_url.txt', 'utf8').trim()
const p = new PrismaClient({ datasourceUrl: prod })
const u = await p.$queryRawUnsafe(`SELECT id, email, role::text r, substring("passwordHash" for 12) h FROM "User" WHERE email='robertdingenouts@gmail.com'`)
console.log('ADMIN in nieuwe PROD:', JSON.stringify(u))
const m = await p.$queryRawUnsafe(`SELECT COUNT(*)::int n FROM "Member"`)
const t = await p.$queryRawUnsafe(`SELECT COUNT(*)::int n FROM "TrainingDay"`)
console.log('Member:', m[0].n, '| TrainingDay:', t[0].n)
await p.$disconnect()
