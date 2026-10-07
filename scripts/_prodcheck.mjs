import { PrismaClient } from '@prisma/client'
import fs from 'fs'
const prod = fs.readFileSync('/home/suffie/.hermes/profiles/michigami/cache/scratch/prod_url.txt', 'utf8').trim()
const p = new PrismaClient({ datasourceUrl: prod })
const rh = await p.$queryRawUnsafe(`
  SELECT m.id, m."firstName", m."lastName", m."isTrainer", m."isActive", m."clubStatus", m."currentBelt", m."bondsnummer",
         m."joinDate"::date AS lid_sinds, u.id AS uid, u.email, u.role::text AS rol
  FROM "Member" m LEFT JOIN "User" u ON u.id=m."userId"
  WHERE lower(m."lastName")='hack' OR lower(m."firstName")='robas' OR lower(u.email)='aisurprisenl@gmail.com'`)
console.log('LEDEN:', JSON.stringify(rh, null, 1))
const jj = await p.$queryRawUnsafe(`
  SELECT id, "firstName", "lastName", status::text, "memberId", "preferredGroup", "createdAt"::date
  FROM "MembershipApplication" WHERE lower("firstName")='jan'`)
console.log('JAN JANSEN APP:', JSON.stringify(jj, null, 1))
const cp = await p.$queryRawUnsafe(`SELECT COUNT(*)::int n FROM "CourseProgress"`)
const ea = await p.$queryRawUnsafe(`SELECT COUNT(*)::int n FROM "ExamAttempt"`)
const dip = await p.$queryRawUnsafe(`SELECT COUNT(*)::int n FROM "Diploma"`)
console.log('PROD CourseProgress:', cp[0].n, '| ExamAttempt:', ea[0].n, '| Diploma:', dip[0].n)
await p.$disconnect()
