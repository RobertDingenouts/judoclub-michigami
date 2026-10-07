import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
const q = await db.$queryRawUnsafe(`
  SELECT m."firstName", m."lastName", m."isActive", m."clubStatus", m."createdAt"::date::text AS aangemaakt
  FROM "Member" m
  WHERE lower(m."lastName") IN ('martens','geers','steijns') ORDER BY m."lastName", m."firstName"`)
console.log(JSON.stringify(q, null, 1))
await db.$disconnect()
