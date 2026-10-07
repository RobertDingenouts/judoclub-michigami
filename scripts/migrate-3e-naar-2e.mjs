// Migratie (7 okt 2026): 3e groep opheffen en groepsgegevens repareren.
// 1. isTrainer-kolom + trainers vlaggen (Robert, Pascal, Robin vd Gaag, Wendy Jansen)
// 2. 3E-lesdagen: attendance verplaatsen naar de 2E-dag van dezelfde datum, 3E-dagen verwijderen
// 3. leden primaryGroup VRIJDAG_3E -> VRIJDAG_2E
// 4. legacy trainingGroups (VRI_OUD/VRI_JONG/WOEN) -> primaryGroup waar die nog null is
// 5. Nathan van Dieren: gewenste groep uit inschrijving (WOEN) overnemen
// Idempotent: draait veilig als hij al eerder heeft gelopen.
import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
const log = (...a) => console.log(...a)

// 1. isTrainer
await db.$executeRawUnsafe(`ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "isTrainer" BOOLEAN NOT NULL DEFAULT false`)
log('1. isTrainer-kolom ok')
const trainerNamen = [['Robert', 'Dingehouts'], ['Pascal', 'Hack'], ['Robin', 'Van der Gaag'], ['Wendy', 'Jansen']]
for (const [fn, ln] of trainerNamen) {
  const r = await db.member.updateMany({ where: { firstName: fn, lastName: ln }, data: { isTrainer: true } })
  log(`1. trainer ${fn} ${ln}: ${r.count}`)
}

// 2. 3E-dagen -> 2E-dagen
const dagen3 = await db.$queryRawUnsafe(`SELECT d3.id AS id3, d2.id AS id2 FROM "TrainingDay" d3 JOIN "TrainingDay" d2 ON d2.date = d3.date AND d2.group = 'VRIJDAG_2E' WHERE d3.group = 'VRIJDAG_3E'`)
log(`2. 3E-dagen met 2E-tweeling: ${dagen3.length}`)
let verplaatst = 0, botsend = 0
for (const { id3, id2 } of dagen3) {
  const att = await db.attendance.findMany({ where: { trainingDayId: id3 } })
  for (const a of att) {
    const bestaand = await db.attendance.findFirst({ where: { memberId: a.memberId, trainingDayId: id2 } })
    if (bestaand) { await db.attendance.delete({ where: { id: a.id } }); botsend++ }
    else { await db.attendance.update({ where: { id: a.id }, data: { trainingDayId: id2 } }); verplaatst++ }
  }
}
const del = await db.trainingDay.deleteMany({ where: { group: 'VRIJDAG_3E' } })
log(`2. attendance verplaatst: ${verplaatst}, botsingen opgeruimd: ${botsend}, 3E-dagen verwijderd: ${del.count}`)

// 3. leden 3E -> 2E
const m3 = await db.member.updateMany({ where: { primaryGroup: 'VRIJDAG_3E' }, data: { primaryGroup: 'VRIJDAG_2E' } })
log(`3. leden 3E->2E: ${m3.count}`)

// 4. legacy trainingGroups -> primaryGroup (alleen waar null)
const MAP = { VRI_OUD: 'VRIJDAG_2E', VRI_JONG: 'VRIJDAG_1E', WOEN: 'WOENSDAG' }
const candidates = await db.$queryRawUnsafe(`SELECT id, "firstName", "lastName", "trainingGroups"::text AS tg FROM "Member" WHERE "primaryGroup" IS NULL AND "trainingGroups" IS NOT NULL`)
for (const c of candidates) {
  const arr = JSON.parse(c.tg)
  const hit = arr.find(g => MAP[g])
  if (hit) { await db.member.update({ where: { id: c.id }, data: { primaryGroup: MAP[hit] } }); log(`4. ${c.firstName} ${c.lastName}: ${hit} -> ${MAP[hit]}`) }
}

// 5. Nathan: gewenste groep uit inschrijving
const nathan = await db.$queryRawUnsafe(`SELECT m.id, a."preferredGroup" FROM "Member" m JOIN "MembershipApplication" a ON a."memberId" = m.id WHERE m."firstName" = 'Nathan' AND m."lastName" = 'van Dieren' AND m."primaryGroup" IS NULL`)
for (const n of nathan) {
  const g = MAP[n.preferredGroup] ?? n.preferredGroup
  if (g) { await db.member.update({ where: { id: n.id }, data: { primaryGroup: g } }); log(`5. Nathan van Dieren: -> ${g}`) }
}

await db.$disconnect()
log('MIGRATIE KLAAR')
