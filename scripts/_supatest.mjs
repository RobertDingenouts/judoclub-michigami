import { PrismaClient } from '@prisma/client'
const url = 'postgresql://postgres:Din***@db.ddtcrdztqfnxnrxlzayw.supabase.co:5432/postgres?sslmode=require'
const db = new PrismaClient({ datasourceUrl: url })
const m = await db.$queryRawUnsafe(`SELECT COUNT(*)::int n FROM "Member"`)
const h = await db.$queryRawUnsafe(`SELECT substring("passwordHash" for 12) h FROM "User" WHERE email='robertdingenouts@gmail.com'`)
console.log('SUPABASE | Member:', m[0].n, '| admin hash:', h[0]?.h)
await db.$disconnect()
