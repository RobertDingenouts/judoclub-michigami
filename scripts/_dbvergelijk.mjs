import { PrismaClient } from '@prisma/client'
import fs from 'fs'
const dev = fs.readFileSync('/home/suffie/.hermes/profiles/michigami/cache/scratch/dev_url.txt', 'utf8').trim()
const prod = fs.readFileSync('/home/suffie/.hermes/profiles/michigami/cache/scratch/prod_url.txt', 'utf8').trim()
for (const [naam, url] of [['DEV (admin-dashboard-dev)', dev], ['PROD (production)', prod]]) {
  const db = new PrismaClient({ datasourceUrl: url })
  console.log('===', naam, '===')
  const [m, u, a, p, at, td] = await Promise.all([
    db.member.count(), db.user.count(), db.membershipApplication.count(),
    db.payment.count(), db.attendance.count(), db.trainingDay.count(),
  ])
  console.log('  Member', m, '| User', u, '| App', a, '| Payment', p, '| Attendance', at, '| TrainingDay', td)
  const wolf = await db.member.count({ where: { lastName: 'de Wolf' } })
  const robin = await db.member.findFirst({ where: { firstName: 'Robin', lastName: 'Van der Gaag' }, select: { isActive: true } })
  const admin = await db.user.findFirst({ where: { email: 'robertdingenouts@gmail.com' }, select: { passwordHash: true } })
  console.log('  de-Wolf records:', wolf, '| Robin vd Gaag actief:', robin?.isActive, '| admin pw-hash lengte:', admin?.passwordHash?.length, admin?.passwordHash?.slice(0, 7))
  await db.$disconnect()
}
