// check of gestopten alleen in periodes met hun aanwezigheid vallen
import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
async function ledenVanPeriode(y, q) {
  const start = new Date(`${y}-${String((q-1)*3+1).padStart(2,'0')}-01`)
  const end = q===4 ? new Date(`${y+1}-01-01`) : new Date(`${y}-${String(q*3+1).padStart(2,'0')}-01`)
  const groepen = ['VRIJDAG_1E','VRIJDAG_2E','VRIJDAG_3E','WOENSDAG']
  return db.member.findMany({
    where: { clubStatus: { notIn: ['PROEF'] }, primaryGroup: { in: groepen },
      OR: [ { isActive: true, clubStatus: { not: 'GESTOPT' } },
            { attendance: { some: { trainingDay: { date: { gte: start, lt: end } } } } } ] },
    select: { firstName: true, lastName: true, clubStatus: true } })
}
for (const [y,q] of [[2026,3],[2026,4],[2027,1]]) {
  const l = await ledenVanPeriode(y,q)
  const h = l.filter(m => m.lastName==='Kleefman' || m.lastName==='Ligtenberg' || m.lastName==='van Wagtendonk')
  console.log(`${y}-Q${q}: totaal ${l.length}, gestopten erin:`, JSON.stringify(h.map(m=>m.firstName+' '+m.lastName)))
}
await db.$disconnect()
