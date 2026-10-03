// Import Excel-administratie -> Neon dev-branch (admin-dashboard-dev)
// Run: node --env-file=.env.local scripts/import-judo-excel.mjs <json>
import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const db = new PrismaClient()
const data = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))

const TUSS = ['van','de','den','der','ter','ten','van de','van den','van der','vd']
function norm(s){ return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z ]/g,'').replace(/\s+/g,' ').trim() }
function matchKey(fn, ln){
  // tussenvoegsel-consistente key: sorteer tussenvoegsels, zet achter
  let parts = norm(ln).split(' ').filter(Boolean)
  let tuss = [], rest = []
  for (const p of parts){ if (TUSS.includes(p)) tuss.push(p); else rest.push(p) }
  return `${norm(fn)}|${[...tuss, ...rest].join(' ')}`
}

const report = { aangemaakt: [], bijgewerkt: [], gematcht: [], gestopt: [], geslagen: [], conflicten: [], geskipt: [] }
const master = new Map() // key -> {voornaam, achternaam, bondsnummer, geboortedatum, bands:{}, portretrecht, groep, actief2026, oud, bronnen:[]}

function upsertMaster(fn, ln, extra, bron){
  const k = matchKey(fn, ln)
  if (!k.includes('|') || !k.split('|')[0] || !k.split('|')[1]) { report.geskipt.push({fn, ln, reden:'onvolledige naam', bron}); return }
  let e = master.get(k)
  if (!e){ e = { voornaam: fn, achternaam: ln, bands:{}, groep:null, actief2026:false, oud:false, bronnen:[] } ; master.set(k, e) }
  e.bronnen.push(bron)
  for (const [f,v] of Object.entries(extra||{})){
    if (v === undefined || v === null || v === '') continue
    if (f === 'bands'){ Object.assign(e.bands, v) }
    else if (!e[f]) e[f] = v
  }
}

// 1) Vrijdag 2026 blokken -> groepen + actief
const GROEPEN = ['VRIJDAG_1E','VRIJDAG_2E','VRIJDAG_3E']
for (const [kw, sheet] of Object.entries(data.vrijdag2026)){
  sheet.blokken.forEach((blok, bi) => {
    blok.forEach(m => {
      // blok 3: leden zonder Nr. onderaan = senioren/trainers -> herkennen aan ontbreken in factuurgroep? We markeren later via afwezigheid bands. Eerst: alles VRIJDAG_3E, trainers worden overschreven via groepslijst factuur.
      upsertMaster(m.voornaam, m.achternaam, { groep: GROEPEN[bi] ?? 'VRIJDAG_3E', actief2026: true }, `vrijdag-${kw}`)
    })
  })
}
// Factuur Blad2-lijst (groepsindeling officieel) — hardgecodeerd uit 4de-kwartaal-bestand
const FACTUUR = {
  VRIJDAG_1E: ['Emily Kasteele, van de','Teun Nederkoorn','Jasper Michielsen','Nino van Wagtendonk','Mika Morice','Myla Geers','Benjamin Pelle','Matthijs Brouwers','Vive Dingenouts','Aiden Verhoek','Hanna Kleefman','Lola Ingels','Mark Ligtenberg'],
  VRIJDAG_2E: ['Lotte van der Werf','Tom van de Kasteele','Ryan Geers','Makar Hunko','Ariël Ritsma','Jayden de Kok','Luuk van Adrichem','Joey Verhoek','Marina van Hees','Mika Hack','Luca Hack','Deen Herselman','Manuel Hees, van'],
  VRIJDAG_3E: ['Bikkel Verweij','Damian Vermeij','Pepijn Vortman','Niels van Eekelen','Ashley Koens','Lucas Mariën','Tycho Glandorf','Kjeld Glandorf'],
}
for (const [g, namen] of Object.entries(FACTUUR)) for (const n of namen){
  const parts = n.split(' '); const fn = parts[0]; const ln = parts.slice(1).join(' ')
  const e = master.get(matchKey(fn, ln)); if (e) e.groep = g
}
// Trainers/senioren (geen Nr. in Excel, onderaan blok 3)
const SENIOREN = ['Robert Dingenouts','Robin Hack','Pascal Hack','Wendy Jansen','Tessa Drogers','Ivo Poot','Chiem Geers','Jacco Loos','Bas Ritsma','Julia Runhaar']
for (const n of SENIOREN){ const parts=n.split(' '); const e = master.get(matchKey(parts[0], parts.slice(1).join(' '))); if (e) e.groep='SENIOREN' }

// 2) Woensdag
for (const [kw, sheet] of Object.entries(data.woensdag2026||{})){
  sheet.blokken[0].forEach(m => upsertMaster(m.voornaam, m.achternaam, { woensdag: true, actief2026: true }, `woensdag-${kw}`))
}
// 3) Bondsnummers + bandgeschiedenis
for (const m of data.bondsnummers) upsertMaster(m.voornaam, m.achternaam, { bondsnummer: m.bondsnummer, geboortedatum: m.geboortedatum, bands: m.bands, portretrecht: m.portretrecht }, 'bonds')
// 4) Gegevens 2025 (actieve kern) + oud leden
for (const m of data.gegevens2025) upsertMaster(m.voornaam, m.achternaam, { geboortedatum: m.geboortedatum, bands: m.bands, lidSinds: m.lid_sinds, plaats: m.plaats }, '2025')
for (const m of data.oudleden) { const k = matchKey(m.voornaam, m.achternaam); upsertMaster(m.voornaam, m.achternaam, { geboortedatum: m.geboortedatum, bands: m.bands, oud: true }, 'oud')
  const e = master.get(k); if (e && !e.actief2026) e.oud = true }

// 5) Bestaande DB-leden matchen
const dbMembers = await db.member.findMany({ include: { user: { select: { id: true, role: true } } } })
const dbByKey = new Map()
for (const m of dbMembers) dbByKey.set(matchKey(m.firstName, m.lastName), m)

const BELT_ENUM = new Set(['WIT','WIT_GEEL','GEEL','GEEL_ORANJE','ORANJE','ORANJE_GROEN','GROEN','GROEN_BLAUW','BLAUW','BLAUW_BRUIN','BRUIN','ZWART_1'])
const BELT_ALIAS = { BLAUW:'BLAUW', BRUIN:'BRUIN' }

let created = 0, updated = 0
const memberByKey = new Map()
for (const [k, e] of master){
  const isActive = e.actief2026 && !e.oud
  let m = dbByKey.get(k)
  if (m){
    memberByKey.set(k, m)
    const patch = {}
    if (e.bondsnummer && m.bondsnummer !== e.bondsnummer) patch.bondsnummer = e.bondsnummer
    if (e.geboortedatum && !m.dateOfBirth) patch.dateOfBirth = new Date(e.geboortedatum)
    if (e.groep && !m.primaryGroup) patch.primaryGroup = e.groep
    if (e.actief2026 && !m.isActive) patch.isActive = true
    if (e.lidSinds && m.joinDate.toISOString().slice(0,10) !== e.lidSinds) patch.joinDate = new Date(e.lidSinds)
    if (e.plaats && !m.city) patch.city = e.plaats
    // huidige band = laatste gedateerde band uit geschiedenis
    const bandEntries = Object.entries(e.bands).sort((a,b) => a[1].localeCompare(b[1]))
    const laatste = bandEntries.length ? (BELT_ALIAS[bandEntries.at(-1)[0]] || bandEntries.at(-1)[0]) : null
    if (laatste && BELT_ENUM.has(laatste) && m.currentBelt !== laatste) patch.currentBelt = laatste
    if (Object.keys(patch).length){ await db.member.update({ where: { id: m.id }, data: patch }); report.bijgewerkt.push(`${e.voornaam} ${e.achternaam}`) }
    report.gematcht.push(`${e.voornaam} ${e.achternaam}`)
    updated++
  } else {
    const user = await db.user.create({ data: { role: 'MEMBER', is_active: isActive } })
    const bandEntries = Object.entries(e.bands).sort((a,b) => a[1].localeCompare(b[1]))
    const laatste = bandEntries.length ? (BELT_ALIAS[bandEntries.at(-1)[0]] || bandEntries.at(-1)[0]) : null
    m = await db.member.create({ data: {
      userId: user.id, firstName: e.voornaam, lastName: e.achternaam,
      dateOfBirth: e.geboortedatum ? new Date(e.geboortedatum) : null,
      bondsnummer: e.bondsnummer || null,
      primaryGroup: e.groep || null,
      isActive,
      joinDate: e.lidSinds ? new Date(e.lidSinds) : undefined,
      city: e.plaats || null,
      currentBelt: laatste && BELT_ENUM.has(laatste) ? laatste : null,
      location: e.woensdag && !e.actief2026 ? 'OUD_VOSSEMEER' : 'STeenbergen',
    }, include: { user: true } })
    memberByKey.set(k, m)
    report.aangemaakt.push(`${e.voornaam} ${e.achternaam}${isActive?'':' (gestopt)'}`)
    created++
  }
  // bandgeschiedenis
  for (const [belt, datum] of Object.entries(e.bands)){
    const b = BELT_ALIAS[belt] || belt
    if (!BELT_ENUM.has(b)) { report.conflicten.push({lid:`${e.voornaam} ${e.achternaam}`, band:b, reden:'onbekende band'}); continue }
    await db.bondHistory.upsert({
      where: { memberId_belt: { memberId: m.id, belt: b } },
      create: { memberId: m.id, belt: b, awardedAt: new Date(datum), source: 'IMPORT' },
      update: {},
    })
  }
}

// 6) Aanwezigheid: TrainingDay + Attendance
const STATUSMAP = { true:'AANWEZIG', false:'NIET_AANWEZIG', 'A':'AFGEMELD', 'v':'VAKANTIE' }
async function importAttendance(sheets, locatie){
  for (const [kw, sheet] of Object.entries(sheets)){
    for (const [bi, blok] of sheet.blokken.entries()){
      const groep = locatie === 'WOENSDAG' ? 'WOENSDAG' : (GROEPEN[bi] ?? 'VRIJDAG_3E')
      for (const ds of sheet.datums){
        const day = await db.trainingDay.upsert({
          where: { date_group: { date: new Date(ds), group: groep } },
          create: { date: new Date(ds), location: locatie, group: groep },
          update: {},
        })
        for (const mem of blok){
          const m = memberByKey.get(matchKey(mem.voornaam, mem.achternaam)); if (!m) continue
          const raw = mem.aanwezigheid[ds]
          let st = raw === undefined ? null : STATUSMAP[typeof raw === 'boolean' ? raw : raw]
          if (!st) continue
          await db.attendance.upsert({
            where: { memberId_trainingDayId: { memberId: m.id, trainingDayId: day.id } },
            create: { memberId: m.id, trainingDayId: day.id, status: st },
            update: { status: st },
          })
        }
      }
    }
  }
}
await importAttendance(data.vrijdag2026, 'STEENBERGEN')
await importAttendance(data.woensdag2026, 'OUD_VOSSEMEER')

// 7) Contributieperiodes + payments uit betaald-vlaggen
const PERIODE = { '2026-Q1': ['2026-01-01','2026-03-31'], '2026-Q2': ['2026-04-01','2026-06-30'], '2026-Q3': ['2026-07-01','2026-09-30'], '2026-Q4': ['2026-10-01','2026-12-31'] }
for (const [label, [s, e]] of Object.entries(PERIODE)){
  await db.contributionPeriod.upsert({ where: { label }, create: { label, start: new Date(s), end: new Date(e) }, update: {} })
}
// betaald per kwartaal per lid (vrijdaglijst = gezagslist voor contributie)
for (const [kw, sheet] of Object.entries(data.vrijdag2026)){
  const period = await db.contributionPeriod.findUnique({ where: { label: kw } })
  for (const blok of sheet.blokken) for (const mem of blok){
    const m = memberByKey.get(matchKey(mem.voornaam, mem.achternaam)); if (!m) continue
    if (m.primaryGroup === 'SENIOREN') continue
    await db.payment.upsert({
      where: { memberId_periodId: { memberId: m.id, periodId: period.id } },
      create: { memberId: m.id, periodId: period.id, amount: 42,
        status: mem.betaald ? 'BETAALD' : 'OPEN',
        dueDate: new Date(PERIODE[kw][1]), paidAt: mem.betaald ? new Date(PERIODE[kw][1]) : null },
      update: { status: mem.betaald ? 'BETAALD' : 'OPEN' },
    })
  }
}
// Q4: OPEN voor alle actieve jeugd (factuurknop kan direct)
{
  const period = await db.contributionPeriod.findUnique({ where: { label: '2026-Q4' } })
  const actieven = await db.member.findMany({ where: { isActive: true, primaryGroup: { notIn: ['SENIOREN'] } } })
  for (const m of actieven){
    await db.payment.upsert({ where: { memberId_periodId: { memberId: m.id, periodId: period.id } },
      create: { memberId: m.id, periodId: period.id, amount: 42, status: 'OPEN', dueDate: new Date('2026-10-01') }, update: {} })
  }
}

// 8) Opschoneer-regels (idempotent, ook op productie draaibaar)
// a) Testrecord weg
const testRec = await db.member.findFirst({ where: { firstName: 'Robas', lastName: 'Test' } })
if (testRec) {
  await db.attendance.deleteMany({ where: { memberId: testRec.id } })
  await db.payment.deleteMany({ where: { memberId: testRec.id } })
  await db.bondHistory.deleteMany({ where: { memberId: testRec.id } })
  await db.member.delete({ where: { id: testRec.id } })
  report.geslagen.push('testrecord Robas Test verwijderd')
}
// b) Typo-duplicaten samenvoegen: Dingehouts -> Dingenouts, Schavione -> Schiavone
for (const [typo, correct] of [['Dingehouts','Dingenouts'], ['Schavione','Schiavone']]){
  const bad = await db.member.findMany({ where: { lastName: typo } })
  for (const b of bad){
    const good = await db.member.findFirst({ where: { firstName: b.firstName, lastName: correct } })
    if (good){
      // aanwezigheid verplaatsen naar goed record (upsert; conflict op eigen aanwezigheid: goede wint)
      const att = await db.attendance.findMany({ where: { memberId: b.id } })
      for (const a of att) {
        await db.attendance.upsert({ where: { memberId_trainingDayId: { memberId: good.id, trainingDayId: a.trainingDayId } }, create: { memberId: good.id, trainingDayId: a.trainingDayId, status: a.status, note: a.note }, update: {} })
      }
      await db.attendance.deleteMany({ where: { memberId: b.id } })
      const bh = await db.bondHistory.findMany({ where: { memberId: b.id } })
      for (const h of bh) {
        await db.bondHistory.upsert({ where: { memberId_belt: { memberId: good.id, belt: h.belt } }, create: { memberId: good.id, belt: h.belt, awardedAt: h.awardedAt, source: h.source }, update: {} })
      }
      await db.bondHistory.deleteMany({ where: { memberId: b.id } })
      await db.payment.deleteMany({ where: { memberId: b.id } })  // worden opnieuw aangemaakt door backfill/cleanup
      if (!good.primaryGroup && b.primaryGroup) {
        await db.member.update({ where: { id: good.id }, data: { primaryGroup: b.primaryGroup } })
      }
      await db.member.delete({ where: { id: b.id } })
      report.geslagen.push(`typo ${b.firstName} ${typo} samengevoegd met ${correct}`)
    }
  }
}
// c) Woensdag-only leden krijgen groep WOENSDAG
{
  const woensdagSet = new Set()
  for (const sheet of Object.values(data.woensdag2026||{}))
    for (const m of sheet.blokken[0]) { const k = matchKey(m.voornaam, m.achternaam); if (k.split('|')[1]) woensdagSet.add(k) }
  for (const [k, m] of memberByKey){
    const mem = await db.member.findUnique({ where: { id: m.id } })
    if (mem && !mem.primaryGroup && woensdagSet.has(k)){
      await db.member.update({ where: { id: m.id }, data: { primaryGroup: 'WOENSDAG' } })
    }
  }
}

// d) Payments die vóór de inschrijving vallen weghalen (bv. nieuw lid dat per ongeluk
//    een payment in een verlopen periode heeft): periode eindigt vóór joinDate.
{
  const per = await db.contributionPeriod.findMany()
  const leden = await db.member.findMany({ where: { joinDate: { gte: new Date(0) } }, select: { id: true, joinDate: true } })
  for (const m of leden) {
    const teEarly = per.filter(p => p.end < m.joinDate).map(p => p.id)
    if (!teEarly.length) continue
    const del = await db.payment.deleteMany({ where: { memberId: m.id, periodId: { in: teEarly }, status: { in: ['OPEN', 'HERINNERING1', 'HERINNERING2'] } } })
    if (del.count) report.geslagen.push(`${del.count} payment(s) vóór inschrijving verwijderd (${m.id})`)
  }
}

// f) Payments van GESTOPTe leden in periodes die ná hun leaveDate starten:
//    niet verschuldigd -> weg.
{
  const ex = await db.member.findMany({ where: { clubStatus: 'GESTOPT', leaveDate: { not: null } }, select: { id: true, leaveDate: true } })
  const per = await db.contributionPeriod.findMany()
  for (const m of ex) {
    const future = per.filter(p => p.start >= m.leaveDate).map(p => p.id)
    if (!future.length) continue
    const del = await db.payment.deleteMany({ where: { memberId: m.id, periodId: { in: future }, status: { in: ['OPEN', 'HERINNERING1', 'HERINNERING2'] } } })
    if (del.count) report.geslagen.push(`${del.count} open payment(s) na uitschrijving verwijderd (${m.id})`)
  }
}

// g) Reserve-lijst: geen volwaardig lid maar af en toe op de mat
const RESERVE = { 'chiem|geers': 'ex-lid, komt nog weleens meedoen', 'tessa|drogers': 'woonachtig Oud-Vossemeer, komt af en toe in Steenbergen' }
for (const [k, reden] of Object.entries(RESERVE)){
  const m = memberByKey.get(k)
  if (m){
    await db.member.update({ where: { id: m.id }, data: { clubStatus: 'RESERVE', isActive: false, remarks: reden } })
    report.geslagen.push(`reserve: ${k.replace('|',' ')} → RESERVE`)
  }
}
// bestaande gestopten een duidelijke status geven
await db.member.updateMany({ where: { isActive: false, clubStatus: 'LID', remarks: null }, data: { clubStatus: 'GESTOPT' } })

// 9) Rapport
const counts = {
  members: await db.member.count(), active: await db.member.count({ where: { isActive: true } }),
  attendance: await db.attendance.count(), days: await db.trainingDay.count(),
  payments: await db.payment.count(), open: await db.payment.count({ where: { status: 'OPEN' } }),
  bondHistory: await db.bondHistory.count(),
}
fs.writeFileSync('/home/suffie/.hermes/profiles/michigami/cache/scratch/judo-nas/import-report.json', JSON.stringify({ counts, report }, null, 1))
console.log(JSON.stringify(counts))
console.log("aangemaakt:", report.aangemaakt.length, "gematcht:", report.gematcht.length, "gestopt:", report.oudleden?.length ?? 0, "geskipt:", report.geskipt.length)
console.log("geskipt:", JSON.stringify(report.geskipt))
await db.$disconnect()
