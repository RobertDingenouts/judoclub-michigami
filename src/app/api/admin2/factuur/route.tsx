import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

export const dynamic = 'force-dynamic'

Font.registerHyphenationCallback(word => [word])

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10, color: '#2a2a2a', padding: 40, lineHeight: 1.5 },
  club: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#a90000', marginBottom: 4 },
  small: { fontSize: 8.5, color: '#555' },
  block: { marginBottom: 14 },
  tableHeader: { fontFamily: 'Helvetica-Bold', backgroundColor: '#f5f5f0', padding: 5, fontSize: 9 },
  row: { padding: 5, borderBottomWidth: 0.5, borderBottomColor: '#ddd', fontSize: 9 },
  total: { fontFamily: 'Helvetica-Bold', fontSize: 12, textAlign: 'right', marginTop: 8 },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  footer: { fontSize: 7.5, color: '#666', marginTop: 24, lineHeight: 1.4 },
})

type Fact = {
  naam: string; bedrag: number; omschrijving: string; factuurNr: string
  datum: string; betaalDatum: string
}

function FactuurPage({ f }: { f: Fact }) {
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.club}>J.C. Michigami Steenbergen</Text>
      <Text style={styles.small}>Gevestigd te Steenbergen · KVK 20090897 · Rabo NL 13 Rabo 0136 9125 08</Text>

      <View style={styles.headRow}>
        <View>
          <Text style={styles.small}>Factuur aan:</Text>
          <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold' }}>{f.naam}</Text>
        </View>
        <View style={{ textAlign: 'right' }}>
          <Text style={styles.small}>Factuurnummer: {f.factuurNr}</Text>
          <Text style={styles.small}>Factuurdatum: {f.datum}</Text>
          <Text style={styles.small}>Betalen vóór: <Text style={{ fontFamily: 'Helvetica-Bold' }}>{f.betaalDatum}</Text></Text>
        </View>
      </View>

      <View style={styles.block}>
        <Text style={styles.tableHeader}>Omschrijving</Text>
        <View style={{ flexDirection: 'row' }}>
          <Text style={{ ...styles.row, width: '70%' }}>{f.omschrijving}</Text>
          <Text style={{ ...styles.row, width: '30%', textAlign: 'right' }}>€ {f.bedrag.toFixed(2).replace('.', ',')}</Text>
        </View>
        <Text style={styles.total}>Totaal: € {f.bedrag.toFixed(2).replace('.', ',')}</Text>
      </View>

      <Text style={styles.footer}>
        Algemene info:{`\n`}
        De contributie per jaar bedraagt €183,-. Betaling geschiedt per kwartaal; het volledige jaarbedrag kan vooraf voldaan worden.{`\n`}
        Note: uw rekeningafschrift is tevens uw betalingsbewijs.{`\n\n`}
        Gevolgen achterstallige betaling:{`\n`}
        Bij achterstallige contributie is de judoka uitgesloten voor deelname aan trainingen, examens en wedstrijden tot de contributie is voldaan.{`\n\n`}
        Namens het bestuur,{`\n`}
        Penningmeester J.C. Michigami
      </Text>
    </Page>
  )
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Geen admin' }, { status: 403 })
  const sp = req.nextUrl.searchParams
  const periode = sp.get('periode')
  const paymentId = sp.get('paymentId')

  let payments: { id: string; amount: unknown; status: string; dueDate: Date | null; invoiceNumber: string | null; member: { firstName: string; lastName: string } | null; period: { label: string } }[] = []

  if (paymentId) {
    const p = await db.payment.findUnique({
      where: { id: paymentId },
      include: { member: true, period: true },
    })
    if (!p) return NextResponse.json({ error: 'Factuur niet gevonden' }, { status: 404 })
    payments = [p as any]
  } else if (periode) {
    payments = await db.payment.findMany({
      where: { period: { label: periode }, status: { in: ['OPEN', 'HERINNERING1', 'HERINNERING2'] } },
      include: { member: true, period: true },
      orderBy: [{ member: { lastName: 'asc' } }],
    })
  } else {
    return NextResponse.json({ error: 'paymentId of periode nodig' }, { status: 400 })
  }

  if (payments.length === 0) {
    return new NextResponse('Alle facturen betaald — niets te genereren.', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  }

  // Factuurnummers toekennen als nog geen (MC-2026-Q4-001)
  const today = new Date().toLocaleDateString('nl-NL')
  const facts: Fact[] = []
  for (let i = 0; i < payments.length; i++) {
    const p = payments[i]
    const pl = periode ?? p.period.label
    let nr = p.invoiceNumber
    if (!nr) {
      nr = `MC-${pl}-${String(i + 1).padStart(3, '0')}`
      await db.payment.update({ where: { id: p.id }, data: { invoiceNumber: nr } })
    }
    facts.push({
      naam: p.member ? `${p.member.firstName} ${p.member.lastName}` : 'Onbekend',
      bedrag: Number(p.amount),
      omschrijving: `Contributie ${pl}`,
      factuurNr: nr,
      datum: today,
      betaalDatum: p.dueDate ? p.dueDate.toLocaleDateString('nl-NL') : today,
    })
  }

  const doc = <Document>{facts.map((f, i) => <FactuurPage key={i} f={f} />)}</Document>
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
