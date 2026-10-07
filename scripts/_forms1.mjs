// Match Microsoft Forms-inschrijvingen (43) tegen Member-records; vul aan wat mist.
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
const db = new PrismaClient()
const forms = JSON.parse(fs.readFileSync('/home/suffie/.hermes/profiles/michigami/cache/scratch/forms.json', 'utf8'))

const norm = s => (s || '').toLowerCase().replace(/[^a-z]/g, '')
const leden = await db.member.findMany({ select: { id: true, firstName: true, lastName: true, isActive: true, clubStatus: true, dateOfBirth: true, phone: true, phone2: true, email: true, address: true, postalCode: true, city: true, gender: true } })

const matches = []
for (const f of forms) {
  const fn = norm(f['Voornaam']), ln = norm(f['Achternaam'])
  if (!fn) continue
  const cand = leden.filter(m => norm(m.firstName) === fn && norm(m.lastName) === ln)
  matches.push({ id: f['Id'], vorm: `${f['Voornaam']} ${f['Achternaam']}`.trim(), gevonden: cand.map(c => ({ id: c.id, naam: `${c.firstName} ${c.lastName}`, actief: c.isActive, status: c.clubStatus })) })
}
fs.writeFileSync('/home/suffie/michigami-backups/forms-match.json', JSON.stringify(matches, null, 1))
const zonder = matches.filter(m => m.gevonden.length === 0)
const dubbel = matches.filter(m => m.gevonden.length > 1)
console.log('TOTAAL forms:', matches.length, '| geen match:', zonder.length, '| dubbele match:', dubbel.length)
console.log('GEEN MATCH:', JSON.stringify(zonder.map(z => z.vorm)))
console.log('DUBBEL:', JSON.stringify(dubbel.map(d => ({ v: d.vorm, g: d.gevonden.map(x => x.naam + (x.actief ? '' : '(inactief)')) }))))
await db.$disconnect()
