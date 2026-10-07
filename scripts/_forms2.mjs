// Pas Microsoft Forms-inschrijvingen toe op Member-records (Robert: Forms = zelf ingevoerd = meest betrouwbaar).
// Vult aan en overschrijft; alle wijzigingen worden gelogd naar backup-bestand.
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
const db = new PrismaClient()
const forms = JSON.parse(fs.readFileSync('/home/suffie/.hermes/profiles/michigami/cache/scratch/forms.json', 'utf8'))
const norm = s => (s || '').toLowerCase().replace(/[^a-z]/g, '')
const clean = s => (s || '').trim().replace(/\s+/g, ' ')

const leden = await db.member.findMany()
const wijzigingen = []
let toegepast = 0

for (const f of forms) {
  const fn = clean(f['Voornaam']), ln = clean(f['Achternaam'])
  if (!fn || fn === 'test') continue
  const m = leden.find(x => norm(x.firstName) === norm(fn) && norm(x.lastName) === norm(ln))
  if (!m) continue
  const data = {}
  // Geboortedatum: Ilvy-speciaal — ouder schreef "geboortejaar is 2014, krijg ik niet gewijzigd"
  let dob = f['Geboortedatum'] ? new Date(f['Geboortedatum']) : null
  if (dob && norm(fn) === 'ilvy' && dob.getFullYear() === 2025) dob = new Date(2014, 5, 12)
  if (dob && !isNaN(dob)) data.dateOfBirth = dob
  const tel1 = clean(f['Telefoonnummer 1']).replace(/\s+/g, '')
  const tel2 = clean(f['Telefoonnummer 2']).replace(/\s+/g, '')
  const mail = clean(f['E-mailadres\u00a0'] || f['E-mailadres '] || '')
  if (tel1 && tel1 !== 'anonymous') data.phone = tel1
  if (tel2) data.phone2 = tel2
  if (mail && mail !== 'anonymous' && mail.includes('@')) data.email = mail.toLowerCase()
  const adr = clean(f['Adres']); if (adr) data.address = adr
  const pc = clean(f['Postcode']).toUpperCase(); if (pc) data.postalCode = pc
  const stad = clean(f['Woonplaats']); if (stad) data.city = stad
  const gesl = clean(f['Geslacht']); if (['M', 'V'].includes(gesl)) data.gender = gesl
  const opm = clean(f['Overige opmerkingen'])
  if (opm && !m.remarks) data.remarks = opm

  const diff = {}
  for (const [k, v] of Object.entries(data)) {
    const old = m[k]
    if (v instanceof Date ? (!old || old.getTime() !== v.getTime()) : (old !== v && (v || !old))) diff[k] = { van: old instanceof Date ? old.toISOString().slice(0, 10) : old, naar: v instanceof Date ? v.toISOString().slice(0, 10) : v }
  }
  if (Object.keys(diff).length) {
    await db.member.update({ where: { id: m.id }, data })
    wijzigingen.push({ id: m.id, naam: `${m.firstName} ${m.lastName}`, wijzigingen: diff })
    toegepast++
  }
}
fs.writeFileSync('/home/suffie/michigami-backups/forms-toegepast.json', JSON.stringify(wijzigingen, null, 1))
console.log('LIDAANPASSINGEN:', toegepast)

// Robin vd Gaag: actief als ouder-record (Robert: "robin actief ja")
await db.member.update({ where: { id: 'cmt65cd6x0003l104n6dqbhxz' }, data: { isActive: true } })
console.log('Robin vd Gaag: actief (rol Ouder blijft)')

// Controle: nog openstaande gaten bij actieve leden
const gaps = await db.$queryRawUnsafe(`
  SELECT COUNT(*)::int AS totaal,
    COUNT(*) FILTER (WHERE "dateOfBirth" IS NULL)::int AS dob,
    COUNT(*) FILTER (WHERE phone IS NULL AND "phone2" IS NULL)::int AS tel,
    COUNT(*) FILTER (WHERE email IS NULL)::int AS mail,
    COUNT(*) FILTER (WHERE address IS NULL)::int AS adr
  FROM "Member" WHERE "isActive" = true AND "clubStatus" NOT IN ('PROEF','VRIJGESTELD','GESTOPT')`)
console.log('GATEN NA CORRECTIE:', JSON.stringify(gaps))
await db.$disconnect()
