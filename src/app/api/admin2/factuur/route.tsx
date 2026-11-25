import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

Font.registerHyphenationCallback(word => [word])

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10, color: '#2a2a2a', padding: 42, paddingTop: 36, lineHeight: 1.5 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  logo: { width: 74, height: 74 },
  club: { fontSize: 17, fontFamily: 'Helvetica-Bold', color: '#a90000', marginBottom: 2 },
  clubSub: { fontSize: 8.5, color: '#555' },
  rule: { borderBottomWidth: 2, borderBottomColor: '#a90000', marginBottom: 18, marginTop: 10 },
  factuurKop: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#a90000', marginBottom: 6 },
  small: { fontSize: 8.5, color: '#555' },
  adres: { fontSize: 10.5, fontFamily: 'Helvetica-Bold', marginBottom: 1 },
  meta: { fontSize: 9, color: '#444', marginBottom: 1 },
  block: { marginTop: 18 },
  tableHeader: { fontFamily: 'Helvetica-Bold', backgroundColor: '#f5f5f0', color: '#a90000', padding: 6, fontSize: 9, borderBottomWidth: 1, borderBottomColor: '#a90000' },
  row: { padding: 6, borderBottomWidth: 0.5, borderBottomColor: '#ddd', fontSize: 9.5 },
  rowAlt: { padding: 6, borderBottomWidth: 0.5, borderBottomColor: '#ddd', fontSize: 9.5, backgroundColor: '#fafaf7' },
  total: { fontFamily: 'Helvetica-Bold', fontSize: 13, color: '#a90000', textAlign: 'right', marginTop: 10 },
  footer: { fontSize: 7.5, color: '#666', marginTop: 26, lineHeight: 1.45 },
  footerRule: { borderTopWidth: 0.5, borderTopColor: '#ccc', marginTop: 18 },
})

type FactItem = { omschrijving: string; bedrag: number }
type Fact = {
  naam: string; adres: string | null; items: FactItem[]; totaal: number; factuurNr: string
  datum: string; betaalDatum: string; periodeLabel: string
}

function FactuurPage({ f, logo }: { f: Fact; logo: string }) {
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.club}>Judoclub Michigami</Text>
          <Text style={styles.clubSub}>Steenbergen · KVK 20090897 · Rabo NL13 Rabo 0136 9125 08</Text>
        </View>
        <Image style={styles.logo} src={logo} />
      </View>
      <View style={styles.rule} />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ width: '52%' }}>
          <Text style={styles.factuurKop}>Factuur {f.periodeLabel}</Text>
          <Text style={styles.small}>Factuur aan:</Text>
          <Text style={styles.adres}>{f.naam}</Text>
          {f.adres && <Text style={styles.small}>{f.adres}</Text>}
        </View>
        <View style={{ width: '44%', textAlign: 'right' }}>
          <Text style={styles.meta}>Factuurnummer: <Text style={{ fontFamily: 'Helvetica-Bold' }}>{f.factuurNr}</Text></Text>
          <Text style={styles.meta}>Factuurdatum: {f.datum}</Text>
          <Text style={styles.meta}>Betalen vóór: <Text style={{ fontFamily: 'Helvetica-Bold' }}>{f.betaalDatum}</Text></Text>
        </View>
      </View>

      <View style={styles.block}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={{ ...styles.tableHeader, width: '72%' }}>Omschrijving</Text>
          <Text style={{ ...styles.tableHeader, width: '28%', textAlign: 'right' }}>Bedrag</Text>
        </View>
        {f.items.map((it, i) => (
          <View key={i} style={{ flexDirection: 'row' }}>
            <Text style={{ ...(i % 2 ? styles.rowAlt : styles.row), width: '72%' }}>{it.omschrijving}</Text>
            <Text style={{ ...(i % 2 ? styles.rowAlt : styles.row), width: '28%', textAlign: 'right' }}>€ {it.bedrag.toFixed(2).replace('.', ',')}</Text>
          </View>
        ))}
        <Text style={styles.total}>Totaal: € {f.totaal.toFixed(2).replace('.', ',')}</Text>
      </View>

      <Text style={styles.footer}>
        Betalen op Rabo NL13 Rabo 0136 9125 08 t.n.v. Judoclub Michigami o.v.v. {f.factuurNr}.{`\n`}
        De contributie per jaar bedraagt €183,- en wordt per kwartaal berekend; het volledige jaarbedrag kan vooraf voldaan worden.
        Bij inschrijving onderweg in een kwartaal wordt de contributie naar verhouding berekend.{`\n`}
        Note: uw rekeningafschrift is tevens uw betalingsbewijs.{`\n\n`}
        Gevolgen achterstallige betaling:{`\n`}
        Bij achterstallige contributie is de judoka uitgesloten voor deelname aan trainingen, examens en wedstrijden tot de contributie is voldaan.{`\n\n`}
        Namens het bestuur,{`\n`}
        Penningmeester J.C. Michigami
      </Text>
      <View style={styles.footerRule} />
      <Text style={{ fontSize: 7, color: '#999', marginTop: 6 }}>Judoclub Michigami · judoclubmichigami.nl</Text>
    </Page>
  )
}

// Uniek volgnummer per periode: hoogste bestaande MC-<periode>-NNN + 1
async function volgendeNr(periodeLabel: string): Promise<string> {
  const prefix = `MC-${periodeLabel}-`
  const bestaand = await db.payment.findMany({
    where: { invoiceNumber: { startsWith: prefix } },
    select: { invoiceNumber: true },
  })
  let max = 0
  for (const p of bestaand) {
    const n = Number(p.invoiceNumber!.slice(prefix.length))
    if (Number.isFinite(n) && n > max) max = n
  }
  return `${prefix}${String(max + 1).padStart(3, '0')}`
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Geen admin' }, { status: 403 })
  const sp = req.nextUrl.searchParams
  const periode = sp.get('periode')
  const paymentId = sp.get('paymentId')

  let payments: { id: string; amount: unknown; status: string; dueDate: Date | null; invoiceNumber: string | null; items: string | null; note: string | null; member: { firstName: string | null; lastName: string | null; address: string | null; postalCode: string | null; city: string | null } | null; period: { label: string } }[] = []

  if (paymentId) {
    const p = await db.payment.findUnique({
      where: { id: paymentId },
      include: { member: true, period: true },
    })
    if (!p) return NextResponse.json({ error: 'Factuur niet gevonden' }, { status: 404 })
    payments = [p as any]
  } else if (periode) {
    const per = await db.contributionPeriod.findUnique({ where: { label: periode } })
    const memberFilter: Record<string, unknown> = {}
    if (per) {
      memberFilter.joinDate = { lte: per.end }
      memberFilter.OR = [{ leaveDate: null }, { leaveDate: { gte: per.start } }]
    }
    payments = await db.payment.findMany({
      where: { period: { label: periode }, status: { in: ['OPEN', 'HERINNERING1', 'HERINNERING2'] }, member: memberFilter as any },
      include: { member: true, period: true },
      orderBy: [{ member: { lastName: 'asc' } }],
    })
  } else {
    return NextResponse.json({ error: 'paymentId of periode nodig' }, { status: 400 })
  }

  if (payments.length === 0) {
    return new NextResponse('Alle facturen betaald — niets te genereren.', { headers: { 'Content-Type': 'text/plain; charset=utf-16' } })
  }

  const today = new Date().toLocaleDateString('nl-NL')
  const facts: Fact[] = []
  for (const p of payments) {
    // Altijd de eigen periode van deze payment: een ?periode=... parameter mag nooit een
    // factuur uit een andere periode een verkeerd nummer/label geven.
    const pl = p.period.label
    let nr = p.invoiceNumber
    if (!nr) {
      nr = await volgendeNr(pl)
      await db.payment.update({ where: { id: p.id }, data: { invoiceNumber: nr } })
    }
    // Factuurlijnen: eigen items (aangepast bedrag + extra's) of standaard contributielijn
    let items: FactItem[] | null = null
    if (p.items) {
      try {
        const parsed = JSON.parse(p.items)
        if (Array.isArray(parsed) && parsed.length) items = parsed.map((x: any) => ({ omschrijving: String(x.omschrijving ?? ''), bedrag: Number(x.bedrag) || 0 }))
      } catch { items = null }
    }
    if (!items) items = [{ omschrijving: `Contributie ${pl}`, bedrag: Number(p.amount) }]
    const totaal = items.reduce((s, it) => s + it.bedrag, 0)
    const m = p.member
    const adres = m?.address ? `${m.address}${m.postalCode ? ', ' + m.postalCode : ''}${m.city ? ' ' + m.city : ''}` : (m?.city ?? null)
    facts.push({
      naam: m ? `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim() : 'Onbekend',
      adres,
      items,
      totaal,
      factuurNr: nr,
      datum: today,
      betaalDatum: p.dueDate ? p.dueDate.toLocaleDateString('nl-NL') : today,
      periodeLabel: pl,
    })
  }

  const logoPath = path.join(process.cwd(), 'public', 'logo-sm.png')
  const logo = fs.existsSync(logoPath)
    ? `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`
    : undefined

  const doc = <Document>{facts.map((f, i) => <FactuurPage key={i} f={f} logo={logo ?? ''} />)}</Document>
  const { renderToBuffer } = await import('@react-pdf/renderer')
  const buf = await renderToBuffer(doc)
  const naam = facts.length === 1 ? `factuur-${facts[0].factuurNr}.pdf` : `facturen-${periode}-niet-betaald.pdf`

  return new NextResponse(new Uint8Array(buf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${naam}"`,
    },
  })
}
