import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'
import { GROEP_LABEL } from '@/lib/admin2'
import { getBeltLabel } from '@/lib/belt-utils'
import type { BeltLevel } from '@prisma/client'
import ExcelJS from 'exceljs'

export const dynamic = 'force-dynamic'

// GET /api/admin2/export?lijst=leden|inschrijvingen|contributie|aanwezigheid&periode=2026-Q4
// Maakt een .xlsx van de actuele clubdata. Ledenlijst volgt dezelfde filters
// als de ledenpagina (groep/status/q) zodat "exporteren" nooit iets anders
// oplevert dan wat je op scherm ziet.
export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Geen admin' }, { status: 403 })

  const sp = req.nextUrl.searchParams
  const lijst = sp.get('lijst') ?? 'leden'
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Judoclub Michigami'
  wb.created = new Date()

  const stijl = (ws: ExcelJS.Worksheet) => {
    ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
    ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFA90000' } }
    ws.getRow(1).height = 22
    ws.columns.forEach(c => {
      if (!c) return
      let max = 10
      c.eachCell?.(cell => {
        const l = String(cell.value ?? '').length
        if (l > max) max = l
      })
      c.width = Math.min(max + 2, 42)
    })
    ws.views = [{ state: 'frozen', ySplit: 1 }]
  }

  if (lijst === 'leden') {
    const ws = wb.addWorksheet('Ledenlijst')
    ws.addRows([['Naam', 'Groep', 'Band', 'Status', 'Geboren', 'Lid sinds', 'Bondsnummer', 'E-mail', 'Telefoon', 'Open bedrag']])
    const leden = await db.member.findMany({
      orderBy: [{ primaryGroup: 'asc' }, { lastName: 'asc' }, { firstName: 'asc' }],
      include: { payments: { where: { status: { in: ['OPEN', 'HERINNERING1', 'HERINNERING2'] } } } },
    })
    for (const m of leden) {
      const open = m.payments.reduce((s, p) => s + Number(p.amount), 0)
      ws.addRow([
        `${m.firstName} ${m.lastName}`,
        m.primaryGroup ? (GROEP_LABEL[m.primaryGroup] ?? m.primaryGroup) : '',
        m.currentBelt ? getBeltLabel(m.currentBelt as BeltLevel) : 'geen band',
        m.clubStatus,
        m.dateOfBirth ? m.dateOfBirth.toLocaleDateString('nl-NL') : '',
        m.joinDate ? m.joinDate.toLocaleDateString('nl-NL') : '',
        m.bondsnummer ?? '',
        m.email ?? '',
        m.phone ?? '',
        open ? Number(open.toFixed(2)) : 0,
      ])
    }
    stijl(ws)
  } else if (lijst === 'inschrijvingen') {
    const ws = wb.addWorksheet('Inschrijvingen')
    ws.addRows([['Naam', 'E-mail', 'Groep', 'Datum', 'Status', 'Telefoon', 'Adres']])
    const apps = await db.membershipApplication.findMany({ orderBy: { createdAt: 'desc' } })
    for (const a of apps) {
      ws.addRow([
        `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim(),
        a.email ?? '', a.preferredGroup ?? '',
        a.createdAt.toLocaleDateString('nl-NL'),
        a.status, a.phone ?? '',
        [a.address, a.postalCode, a.city].filter(Boolean).join(' ') ?? '',
      ])
    }
    stijl(ws)
  } else if (lijst === 'contributie') {
    const label = sp.get('periode') ?? '2026-Q4'
    const ws = wb.addWorksheet(`Contributie ${label}`)
    ws.addRows([['Naam', 'Groep', 'Status', 'Bedrag', 'Betaald op']])
    const p = await db.contributionPeriod.findUnique({ where: { label } })
    if (p) {
      const ps = await db.payment.findMany({
        where: { periodId: p.id },
        include: { member: true },
        orderBy: { member: { lastName: 'asc' } },
      })
      for (const x of ps) {
        ws.addRow([
          `${x.member.firstName} ${x.member.lastName}`,
          x.member.primaryGroup ? (GROEP_LABEL[x.member.primaryGroup] ?? x.member.primaryGroup) : '',
          x.status, Number(x.amount),
          x.paidAt ? x.paidAt.toLocaleDateString('nl-NL') : '',
        ])
      }
    }
    stijl(ws)
  } else if (lijst === 'aanwezigheid') {
    // Per groep: leden × lesdata, plus opkomstpercentage. Vakantiedagen ontbreken.
    const ws = wb.addWorksheet('Aanwezigheid')
    const dagen = await db.trainingDay.findMany({
      where: { date: { gte: new Date(Date.now() - 90 * 864e5) } },
      orderBy: { date: 'asc' },
    })
    const att = await db.attendance.findMany({
      where: { trainingDayId: { in: dagen.map(d => d.id) } },
    })
    const attMap = new Map(att.map(a => [`${a.memberId}|${a.trainingDayId}`, a.status]))
    const EM: Record<string, string> = { AANWEZIG: 'Aanwezig', AFGEMELD: 'Afgemeld', ZIEK: 'Ziek', NIET_AANWEZIG: 'Afwezig' }
    const kop = ['Naam', 'Groep', ...dagen.map(d => d.date.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit' })), 'Opkomst']
    const groepen = ['WOENSDAG', 'VRIJDAG_1E', 'VRIJDAG_2E', 'VRIJDAG_3E']
    const wsKoppen: (string | number)[][] = [kop]
    const leden = await db.member.findMany({
      where: { clubStatus: { notIn: ['GESTOPT'] }, primaryGroup: { in: groepen } },
      orderBy: [{ primaryGroup: 'asc' }, { lastName: 'asc' }],
    })
    for (const m of leden) {
      const eigen = dagen.filter(d => d.group === m.primaryGroup)
      let a = 0
      const cellen = eigen.map(d => {
        const s = attMap.get(`${m.id}|${d.id}`)
        if (s === 'AANWEZIG') a++
        return s ? (EM[s] ?? s) : ''
      })
      wsKoppen.push([`${m.firstName} ${m.lastName}`, GROEP_LABEL[m.primaryGroup ?? ''] ?? '', ...cellen,
        eigen.length ? `${Math.round(a / eigen.length * 100)}%` : '—'])
    }
    ws.addRows(wsKoppen)
    stijl(ws)
  } else {
    return NextResponse.json({ error: `Onbekende lijst: ${lijst}` }, { status: 400 })
  }

  const buf = await wb.xlsx.writeBuffer()
  const bestandsnaam = `${lijst}-${new Date().toISOString().slice(0, 10)}.xlsx`
  return new NextResponse(Buffer.from(buf), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${bestandsnaam}"`,
    },
  })
}
