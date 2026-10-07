// Ilvi -> Ilvy de Wolf samenvoegen (Forms-inschrijving zegt "Ilvy"; Ilvi is typefout uit import)
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
const db = new PrismaClient()
const FROM = 'cmus49n8f008uieftootfxwsv' // Ilvi (band ORANJE, bondhist 1)
const TO = 'cmus49nvq009cieft3boq82po'   // Ilvy (correct volgens Forms)

// backup
const dump = { member: await db.member.findMany({ where: { id: FROM } }) }
for (const t of ['attendance', 'payment', 'bondHistory', 'examAttempt', 'diploma', 'competition']) {
  const key = t === 'diploma' ? 'recipientId' : 'memberId'
  dump[t] = await db[t].findMany({ where: { [key]: FROM } })
}
fs.writeFileSync('/home/suffie/michigami-backups/backup-ilvy-merge.json', JSON.stringify(dump, null, 1))

// attendance: duplicaten (zelfde dag) weggooien, rest verplaatsen
for (const a of await db.attendance.findMany({ where: { memberId: FROM } })) {
  const dup = await db.attendance.findFirst({ where: { memberId: TO, trainingDayId: a.trainingDayId } })
  if (dup) await db.attendance.delete({ where: { id: a.id } })
  else await db.attendance.update({ where: { id: a.id }, data: { memberId: TO } })
}
// payments: idem
for (const p of await db.payment.findMany({ where: { memberId: FROM } })) {
  const dup = await db.payment.findFirst({ where: { memberId: TO, periodId: p.periodId } })
  if (dup) await db.payment.delete({ where: { id: p.id } })
  else await db.payment.update({ where: { id: p.id }, data: { memberId: TO } })
}
// bondHistory: band-duplicaat weggooien
for (const b of await db.bondHistory.findMany({ where: { memberId: FROM } })) {
  const dup = await db.bondHistory.findFirst({ where: { memberId: TO, belt: b.belt } })
  if (dup) await db.bondHistory.delete({ where: { id: b.id } })
  else await db.bondHistory.update({ where: { id: b.id }, data: { memberId: TO } })
}
await db.examAttempt.updateMany({ where: { memberId: FROM }, data: { memberId: TO } })
await db.competition.updateMany({ where: { memberId: FROM }, data: { memberId: TO } })
await db.diploma.updateMany({ where: { recipientId: FROM }, data: { recipientId: TO } })
await db.courseProgress.updateMany({ where: { memberId: FROM }, data: { memberId: TO } })

// band overnemen van Ilvi naar Ilvy
await db.member.update({ where: { id: TO }, data: { currentBelt: 'ORANJE' } })
await db.member.delete({ where: { id: FROM } })

const na = await db.member.findFirst({ where: { id: TO }, select: { firstName: true, lastName: true, currentBelt: true, _count: { select: { attendance: true, payments: true, bondHistory: true } } } })
console.log('NA MERGE:', JSON.stringify(na))
const nog = await db.member.count({ where: { lastName: 'de Wolf' } })
console.log('de Wolf records over:', nog)
await db.$disconnect()
