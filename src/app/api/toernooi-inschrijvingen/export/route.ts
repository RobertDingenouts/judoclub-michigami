import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'
import { TOERNOOIEN } from '@/lib/toernooien'
import ExcelJS from 'exceljs'

export const dynamic = 'force-dynamic'

// GET /api/toernooi-inschrijvingen/export?toernooi=<slug>
// Bouwt het exacte Shintai-inleverformaat (xlsx) uit de inschrijvingen.
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
  const ws = wb.addWorksheet('Inschrijfformulier')

  const boldFont: Partial<ExcelJS.Font> = { bold: true }
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
  const bestandsnaam = `Inschrijfformulier Shintai Kersttoernooi 13 december 2026 - Michigami (${entries.length} deelnemers).xlsx`
  return new NextResponse(Buffer.from(buf as ArrayBuffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(bestandsnaam)}`,
    },
  })
}
