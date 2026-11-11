import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'
import { TOERNOOIEN, splitNaam, isoNaarDmYyyy } from '@/lib/toernooien'
import ExcelJS from 'exceljs'

export const dynamic = 'force-dynamic'

// GET /api/toernooi-inschrijvingen/export?toernooi=<slug>
// Bouwt het exacte inleverformaat van de organisator uit de inschrijvingen:
//   - Shintai    (xlsx, kolommen NR/NAAM/CLUB/MAN-VROUW/LEEFTIJD/GEWICHT/BAND/NIVEAU)
//   - Yoshi-Kwai (xlsx naar hun inschrijvingsformulier: Familienaam/Voornaam/
//                 M-V/Geb Dat/Graad kyu/Pré = X/Gew in kg, met clubkopteksten)
export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Geen admin' }, { status: 403 })

  const slug = req.nextUrl.searchParams.get('toernooi') || 'kersttoernooi-shintai-2026'
  const cfg = TOERNOOIEN[slug]
  if (!cfg) return NextResponse.json({ error: 'Onbekend toernooi' }, { status: 400 })

  const entries = await db.tournamentEntry.findMany({
    where: { toernooi: slug },
    orderBy: [{ leeftijd: 'asc' }, { naam: 'asc' }],
  })

  const wb = new ExcelJS.Workbook()
  wb.creator = 'Judoclub Michigami'
  wb.created = new Date()

  const boldFont: Partial<ExcelJS.Font> = { bold: true }

  if (cfg.exportFormat === 'yoshikwai') {
    const ws = wb.addWorksheet('Blad1')

    // Kopteksten zoals in hun originele inschrijvingsformulier-Tornooi.xls
    ws.getCell('B3').value = 'DEELNEMENDE CLUB :'
    ws.getCell('B3').font = boldFont
    ws.getCell('C3').value = 'Judoclub Michigami'
    ws.getCell('F3').value = '21 februari 2027'
    ws.getCell('B5').value = 'Plaats wedstrijd: Sted. Sporthal Luisbekelaar - Luisbekelaar z/n - 2140 Borgerhout'
    ws.getCell('B7').value = 'Contactpersoon:'
    ws.getCell('C7').value = cfg.contact.naam
    ws.getCell('B8').value = 'Adres:'
    ws.getCell('C8').value = cfg.locatie
    ws.getCell('B9').value = 'E-mail:'
    ws.getCell('C9').value = cfg.contact.email
    ws.getCell('B10').value = 'Tel:'
    ws.getCell('C10').value = cfg.contact.telefoon

    const headers = ['Nr', 'Familienaam', 'Voornaam', 'M / V', 'Geb Dat', 'Graad kyu', 'Pré = X', 'Gew in kg']
    const hdrRow = ws.getRow(12)
    headers.forEach((h, i) => { hdrRow.getCell(i + 1).value = h })
    hdrRow.font = boldFont
    hdrRow.eachCell(c => {
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } }
      c.border = { bottom: { style: 'thin' }, top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
    })

    entries.forEach((e, i) => {
      const { voornaam, familienaam } = splitNaam(e.naam)
      const row = ws.getRow(13 + i)
      row.values = [
        i + 1,
        familienaam,
        voornaam,
        e.geslacht === 'Man' ? 'M' : 'V',
        e.geboortedatum ? isoNaarDmYyyy(e.geboortedatum) : '',
        e.band,
        e.niveau === 'Pre' ? 'X' : '',
        e.gewicht,
      ]
      row.eachCell({ includeEmpty: true }, c => {
        c.border = { top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' } }
      })
    })

    ws.getColumn(1).width = 6
    ws.getColumn(2).width = 22
    ws.getColumn(3).width = 18
    ws.getColumn(4).width = 8
    ws.getColumn(5).width = 12
    ws.getColumn(6).width = 11
    ws.getColumn(7).width = 9
    ws.getColumn(8).width = 11

    const buf = await wb.xlsx.writeBuffer()
    return downloadExcel(buf, `inschrijvingsformulier-Tornooi - Judoclub Michigami (${entries.length} deelnemers).xlsx`)
  }

  // ---- Tokyokai-layout (eenvoudige deelnemerslijst: naam/geboortedatum/
  // geslacht/gewicht/band — exact wat Ronald Versluijs per mail vraagt) ----
  if (cfg.exportFormat === 'tokyokai') {
    const ws = wb.addWorksheet('Deelnemers')

    ws.getCell('A1').value = cfg.shintaiTitel
    ws.getCell('A1').font = { bold: true, size: 14 }
    ws.getCell('A2').value = 'Club: Judoclub Michigami'
    ws.getCell('A3').value = `Contact: ${cfg.contact.naam} · ${cfg.contact.telefoon} · ${cfg.contact.email}`

    const headers = ['Nr', 'Naam judoka', 'Geboortedatum', 'Geslacht', 'Gewicht (kg)', 'Band']
    const hdrRow = ws.getRow(5)
    headers.forEach((h, i) => { hdrRow.getCell(i + 1).value = h })
    hdrRow.font = boldFont
    hdrRow.eachCell(c => {
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } }
      c.border = { bottom: { style: 'thin' } }
    })

    entries.forEach((e, i) => {
      const row = ws.getRow(6 + i)
      row.values = [
        i + 1,
        e.naam,
        e.geboortedatum ? isoNaarDmYyyy(e.geboortedatum) : '',
        e.geslacht === 'Man' ? 'M' : 'V',
        e.gewicht,
        e.band,
      ]
    })

    ;[6, 28, 14, 10, 13, 9].forEach((w, i) => { ws.getColumn(i + 1).width = w })

    const buf = await wb.xlsx.writeBuffer()
    return downloadExcel(buf, `tokyokai-deelnemers - Judoclub Michigami (${entries.length} deelnemers).xlsx`)
  }

  // ---- Shintai-layout ----
  const ws = wb.addWorksheet('Inschrijfformulier')

  ws.getCell('A1').value = cfg.shintaiTitel
  ws.getCell('A1').font = { bold: true, size: 14 }
  ws.getCell('A2').value = 'NAAM CLUB / VERENIGING'
  ws.getCell('C2').value = 'Judoclub Michigami'
  ws.getCell('A3').value = 'NAAM CONTACTPERSOON'
  ws.getCell('C3').value = cfg.contact.naam
  ws.getCell('A4').value = 'TELEFOONNR. CONTACTPERSOON'
  ws.getCell('C4').value = cfg.contact.telefoon
  ws.getCell('A5').value = 'EMAIL CONTACTPERSOON'
  ws.getCell('C5').value = cfg.contact.email
  ws.getCell('A6').value = `UITERLIJKE INLEVERDATUM IS ${cfg.deadlineShintai.toUpperCase()} PER EMAIL : INFO@SPORTSCHOOLSHINTAI.NL`
  ws.getCell('A7').value = 'INSCHRIJFFORMULIER'
  ws.getCell('A7').font = boldFont

  const headers = ['NR', 'NAAM JUDOKA', 'CLUBNAAM', 'MAN / VROUW', 'LEEFTIJD', 'GEWICHT', 'BAND', 'NIVEAU']
  const hdrRow = ws.getRow(8)
  headers.forEach((h, i) => { hdrRow.getCell(i + 1).value = h })
  hdrRow.font = boldFont
  hdrRow.eachCell(c => {
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } }
    c.border = { bottom: { style: 'thin' } }
  })

  entries.forEach((e, i) => {
    const row = ws.getRow(9 + i)
    row.values = [
      i + 1,
      e.naam,
      'Judoclub Michigami',
      e.geslacht,
      e.leeftijd,
      e.gewicht,
      e.band,
      e.niveau,
    ]
  })

  const t = 9 + entries.length + 1
  ws.getCell(`A${t}`).value = 'INSCHRIJFGELD 15,00 PER JUDOKA OVER TE MAKEN OP NL05 RABO 0101280769 TNV SPORTSCHOOL SHINTAI'
  ws.getCell(`A${t + 1}`).value = `MET VERMELDING : KERSTTOERNOOI 2026 - JUDOCLUB MICHIGAMI - ${entries.length} DEELNEMERS`

  // Kolombreedtes als in het Shintai-originaal
  ws.getColumn(1).width = 6
  ws.getColumn(2).width = 26
  ws.getColumn(3).width = 22
  ws.getColumn(4).width = 13
  ws.getColumn(5).width = 10
  ws.getColumn(6).width = 10
  ws.getColumn(7).width = 10
  ws.getColumn(8).width = 9

  const buf = await wb.xlsx.writeBuffer()
  return downloadExcel(buf, `Inschrijfformulier Shintai Kersttoernooi 13 december 2026 - Michigami (${entries.length} deelnemers).xlsx`)
}

function downloadExcel(buf: ExcelJS.Buffer, bestandsnaam: string) {
  return new NextResponse(Buffer.from(buf as ArrayBuffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(bestandsnaam)}`,
    },
  })
}
