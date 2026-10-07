import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
const wolf = await db.$queryRawUnsafe(`
  SELECT m.id, m."firstName", m."lastName", m."isActive", m."clubStatus", m."currentBelt",
         COALESCE(m."dateOfBirth"::date::text,'-') AS dob, COALESCE(m."joinDate"::date::text,'-') AS lid_sinds,
         m."createdAt"::date::text AS aangemaakt,
         (SELECT COUNT(*) FROM "Attendance" a WHERE a."memberId"=m.id)::int AS aanwezig,
         (SELECT COUNT(*) FROM "Payment" p WHERE p."memberId"=m.id)::int AS betalingen,
         (SELECT COUNT(*) FROM "BondHistory" b WHERE b."memberId"=m.id)::int AS bondhist,
         (SELECT COUNT(*) FROM "ExamAttempt" e WHERE e."memberId"=m.id)::int AS examens,
         (SELECT COUNT(*) FROM "Diploma" d WHERE d."recipientId"=m.id)::int AS diploma
  FROM "Member" m WHERE lower(m."lastName") LIKE '%wolf%' ORDER BY m."firstName"`)
console.log('WOLF:', JSON.stringify(wolf, null, 1))
// Robin + Vive + dochter-koppeling
const fam = await db.$queryRawUnsafe(`
  SELECT m.id, m."firstName", m."lastName", m."isActive", m."clubStatus", COALESCE(u.role::text,'-') AS rol, COALESCE(u.email,'-') AS mail, m."userId"
  FROM "Member" m LEFT JOIN "User" u ON u.id=m."userId"
  WHERE lower(m."firstName") IN ('robin','vive') OR lower(m."lastName") IN ('dingenouts','van der gaag')`)
console.log('FAMILIE:', JSON.stringify(fam, null, 1))
await db.$disconnect()
