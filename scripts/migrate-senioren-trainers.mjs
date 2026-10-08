// Eenmalige migratie (okt 2026): SENIOREN-groep opsplitsen.
// - Niet-trainer senioren (Jacco, Bas, Julia, Chiem) -> VRIJDAG_2E ("gewoon groep 2")
// - Trainers (Robert, Robin Hack, Pascal, Wendy) -> primaryGroup SENIOREN (= "Trainers")
//   + isTrainer=true, zodat Robert en Robin Hack in de trainerslijst verschijnen.
// - Bestuur Michigami blijft puur ADMIN (wordt door code-wijziging geen trainer meer).
// - gender 'Man' -> 'M' (consistentie met M/V).
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
const prod = fs.readFileSync('/home/suffie/.hermes/profiles/michigami/cache/scratch/prod_url.txt', 'utf8').trim()
const db = new PrismaClient({ datasourceUrl: prod })

const apply = process.argv.includes('--apply')

async function main() {
  const senioren = await db.member.findMany({
    where: { primaryGroup: 'SENIOREN' },
    select: { id: 1, firstName: 1, lastName: 1, isTrainer: 1, clubStatus: 1 },
  })
  console.log('Nu in SENIOREN:')
  for (const m of senioren) console.log(' ', m.firstName, m.lastName, '| trainer', m.isTrainer, '|', m.clubStatus)

  const robert = await db.member.findFirst({ where: { email: 'Robertdingenouts@gmail.com', isActive: true } })
  const robinHack = await db.member.findFirst({ where: { firstName: 'Robin', lastName: 'Hack' } })
  console.log('Robert:', robert?.id, '| Robin Hack:', robinHack?.id)

  if (!apply) { console.log('\nDRY RUN — niets gewijzigd. Met --apply uitvoeren.'); return }

  for (const m of senioren) {
    const isTrainer = ['Pascal', 'Wendy'].includes(m.firstName)
    if (!isTrainer) {
      await db.member.update({ where: { id: m.id }, data: { primaryGroup: 'VRIJDAG_2E' } })
      console.log(`→ ${m.firstName} ${m.lastName}: SENIOREN -> VRIJDAG_2E`)
    }
  }
  for (const t of [robert, robinHack]) {
    if (!t) continue
    await db.member.update({ where: { id: t.id }, data: { primaryGroup: 'SENIOREN', isTrainer: true } })
    console.log(`→ trainer: ${t.firstName} ${t.lastName}: grp SENIOREN + isTrainer=true`)
  }
  const g = await db.member.updateMany({ where: { gender: 'Man' }, data: { gender: 'M' } })
  console.log(`gender 'Man' -> 'M': ${g.count} record(s)`)

  console.log('\nControle SENIOREN na migratie:')
  const na = await db.member.findMany({ where: { primaryGroup: 'SENIOREN' }, select: { firstName: 1, lastName: 1, isTrainer: 1 } })
  for (const m of na) console.log(' ', m.firstName, m.lastName, '| trainer', m.isTrainer)
}
main().finally(() => db.$disconnect())
