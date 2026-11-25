import { PrismaClient } from '@prisma/client'
import fs from 'fs'
const db = new PrismaClient()
const mid = 'cmt7omglw0002kz04pfy50k9a', uid = 'cmt7omglj0000kz0484znhylw', aid = 'cmt7ftsf00000l904sl8jmm8v'
const backup = {
  reden: 'Back-up vóór cascade-verwijdering test-inschrijving Test 1 / robinhack1@hotmail.com',
  datum: new Date().toISOString(),
  application: await db.membershipApplication.findUnique({ where: { id: aid } }),
  user: await db.user.findUnique({ where: { id: uid } }),
  member: await db.member.findUnique({ where: { id: mid } }),
  attendance: await db.attendance.findMany({ where: { memberId: mid } }),
  payments: await db.payment.findMany({ where: { memberId: mid } }),
  bondHistory: await db.bondHistory.findMany({ where: { memberId: mid } }),
}
fs.writeFileSync('/home/suffie/.hermes/profiles/michigami/cache/backup-test-robinhack1.json', JSON.stringify(backup, null, 2))
fs.chmodSync('/home/suffie/.hermes/profiles/michigami/cache/backup-test-robinhack1.json', 0o600) // bevat hashes/PII
console.log('BACKUP GESCHREVEN:', fs.statSync('/home/suffie/.hermes/profiles/michigami/cache/backup-test-robinhack1.json').size, 'bytes')
await db.$disconnect()
