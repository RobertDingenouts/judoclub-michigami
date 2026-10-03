// Import bandgeschiedenis vanuit 'aanwezigheidslijst ovjv.xlsx' → tabblad 'info leden'
// (woensdaggroep Oud-Vossemeer). Aanvullend op de hoofdimport: zet alleen currentBelt
// + bandHistory waar die nu nog ontbreken. Gebruik:
//   node --env-file=.env.local scripts/import-ovjv-banden.mjs <pad/naar/ovjv-banden.json>
import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'

const db = new PrismaClient()
const file = process.argv[2]
if (!file) { console.error('gebruik: node import-ovjv-banden.mjs <json>'); process.exit(1) }
const data = JSON.parse(readFileSync(file, 'utf8'))

const KOLOM_NAAR_BELT = {
  'witte band': 'WIT',
  'witte/gele slip': 'WIT_GEEL',
  'geel': 'GEEL',
  'geel/oranje slip': 'GEEL_ORANJE',
  'oranje': 'ORANJE',
  'oranje/ groen slip': 'ORANJE_GROEN',
  'groen': 'GROEN',
  'blauw': 'BLAUW',
  'bruin': 'BRUIN',
  'zwart': 'ZWART_1',
}
const BELT_ENUM = new Set(Object.keys(KOLOM_NAAR_BELT).map(k => KOLOM_NAAR_BELT[k]))

let gezet = 0, overgeslagen = []
for (const d of data) {
  const m = await db.member.findFirst({
    where: { firstName: { equals: d.naam, mode: 'insensitive' }, lastName: { equals: d.ach, mode: 'insensitive' } },
  })
  if (!m) { overgeslagen.push(`${d.naam} ${d.ach}: niet in DB`); continue }
  const entries = []
  for (const [kolom, datum] of Object.entries(d.belts)) {
    const b = KOLOM_NAAR_BELT[kolom.trim().toLowerCase()]
    if (!b) { overgeslagen.push(`${d.naam} ${d.ach}: onbekende kolom '${kolom}'`); continue }
    if (!/^\d{4}-\d{2}-\d{2}/.test(datum)) continue // 'onbekend' etc. overslaan
    entries.push({ belt: b, at: datum.slice(0, 10) })
  }
  if (!entries.length) { overgeslagen.push(`${d.naam} ${d.ach}: geen gedateerde bands`); continue }
  for (const e of entries) {
    await db.bondHistory.upsert({
      where: { memberId_belt: { memberId: m.id, belt: e.belt } },
      create: { memberId: m.id, belt: e.belt, awardedAt: new Date(e.at), source: 'IMPORT-OVJV' },
      update: {},
    })
  }
  const huidige = entries.sort((a, b) => a.at.localeCompare(b.at)).at(-1).belt
  if (m.currentBelt !== huidige) {
    await db.member.update({ where: { id: m.id }, data: { currentBelt: huidige } })
    gezet++
    console.log(`${m.firstName} ${m.lastName}: band -> ${huidige}`)
  }
}
console.log(`\nklaar: ${gezet} huidige bands gezet`)
if (overgeslagen.length) console.log('overgeslagen:\n' + overgeslagen.join('\n'))
await db.$disconnect()
