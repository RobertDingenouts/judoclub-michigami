import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { LOGO_URI } from './logo-uri'

// -----------------------------------------------------------------------------
// 1. CONFIGURATIE & KLEUREN
// -----------------------------------------------------------------------------

const BRAND_RED = '#a90000'
const BRAND_GOLD = '#d4a843'
const NEUTRAL_DARK = '#1a1a1a'
const NEUTRAL_LIGHT = '#fffafa' // brand-50 (bijna wit)
const NEUTRAL_GRAY = '#666666'

const BELT_COLORS: Record<string, string> = {
  WIT:       '#FFFFFF',
  GEEL:      '#FFD700',
  ORANJE:    '#FF8C00',
  GROEN:     '#228B22',
  BLAUW:     '#0000FF',
  BRUIN_1:   '#8B4513',
  BRUIN_2:   '#8B4513',
  BRUIN_3:   '#8B4513',
  Zwart_1:   '#000000',
  Zwart_2:   '#000000',
  Zwart_3:   '#000000',
  COURSE_JAPANESE: BRAND_GOLD,
  ACHIEVEMENT: BRAND_RED,
}

const BELT_LABELS_NL: Record<string, string> = {
  WIT:       'Witte Band',
  GEEL:      'Gele Band',
  ORANJE:    'Oranje Band',
  GROEN:     'Groene Band',
  BLAUW:     'Blauwe Band',
  BRUIN_1:   'Bruine Band 1e Kyu',
  BRUIN_2:   'Bruine Band 2e Kyu',
  BRUIN_3:   'Bruine Band 3e Kyu',
  Zwart_1:   'Zwarte Band 1e Dan',
  Zwart_2:   'Zwarte Band 2e Dan',
  Zwart_3:   'Zwarte Band 3e Dan',
  COURSE_JAPANESE: 'Cursus Japans',
  ACHIEVEMENT: 'Bijzondere Prestatie',
}

// -----------------------------------------------------------------------------
// 2. STYLESHEET (Strict @react-pdf/renderer compatible — geen borderRadius)
// -----------------------------------------------------------------------------

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: NEUTRAL_LIGHT,
    padding: 40,
    fontFamily: 'Helvetica',
  },
  // Buitenste rand: dik, rood, scherpe hoeken
  outerBorder: {
    flex: 1,
    borderWidth: 4,
    borderColor: BRAND_RED,
    padding: 4,
  },
  // Binnenste rand: dun, goud, scherpe hoeken
  innerBorder: {
    flex: 1,
    borderWidth: 2,
    borderColor: BRAND_GOLD,
    padding: 40,
    flexDirection: 'column',
  },
  // Header sectie
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 70,
    height: 70,
    marginBottom: 8,
  },
  // Typografisch logo als fallback
  logoTextPrimary: {
    fontFamily: 'Times-Bold',
    fontSize: 28,
    color: BRAND_RED,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  logoTextSecondary: {
    fontFamily: 'Helvetica',
    fontSize: 12,
    color: NEUTRAL_DARK,
    letterSpacing: 6,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  mainTitle: {
    fontFamily: 'Times-Bold',
    fontSize: 42,
    color: NEUTRAL_DARK,
    letterSpacing: 8,
    textTransform: 'uppercase',
    marginTop: 10,
  },
  subTitle: {
    fontFamily: 'Helvetica',
    fontSize: 16,
    color: NEUTRAL_GRAY,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 8,
  },
  // Content sectie
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  introText: {
    fontFamily: 'Times-Roman',
    fontSize: 16,
    color: NEUTRAL_DARK,
    textAlign: 'center',
    marginBottom: 10,
  },
  recipientName: {
    fontFamily: 'Times-Bold',
    fontSize: 36,
    color: BRAND_RED,
    textAlign: 'center',
    marginVertical: 15,
    borderBottomWidth: 2,
    borderBottomColor: BRAND_GOLD,
    paddingBottom: 4,
  },
  descriptionText: {
    fontFamily: 'Times-Roman',
    fontSize: 16,
    color: NEUTRAL_DARK,
    textAlign: 'center',
    lineHeight: 1.6,
    maxWidth: 450,
    marginBottom: 25,
  },
  // Band / Prestatie weergave
  achievementBox: {
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  beltBar: {
    height: 16,
    width: '60%',
    marginBottom: 12,
    // Geen borderRadius — scherpe hoeken
  },
  beltLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 20,
    color: NEUTRAL_DARK,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  // Footer sectie
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: BRAND_GOLD,
  },
  signatureBlock: {
    alignItems: 'center',
    width: 200,
  },
  signatureLine: {
    width: '100%',
    height: 1,
    backgroundColor: NEUTRAL_DARK,
    marginBottom: 8,
  },
  signatureLabel: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: NEUTRAL_GRAY,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dateBlock: {
    alignItems: 'center',
    width: 200,
  },
  dateText: {
    fontFamily: 'Times-Bold',
    fontSize: 14,
    color: NEUTRAL_DARK,
    marginBottom: 4,
  },
  locationText: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: NEUTRAL_GRAY,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // Verificatie sectie (subtiel)
  verificationSection: {
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
    marginTop: 20,
  },
  verificationCode: {
    fontSize: 9,
    fontFamily: 'Courier',
    color: '#888888',
    letterSpacing: 1,
  },
  verificationUrl: {
    fontSize: 8,
    fontFamily: 'Helvetica',
    color: '#aaaaaa',
    marginTop: 4,
  },
})

// -----------------------------------------------------------------------------
// 3. COMPONENT
// -----------------------------------------------------------------------------

interface DiplomaPDFProps {
  recipientName: string
  beltLevel: string
  title: string
  description?: string
  awardedAt: string
  verificationCode: string
  examiner?: string
  baseUrl?: string
}

export function DiplomaPDFDocument({
  recipientName,
  beltLevel,
  title,
  description = 'Hierbij wordt bevestigd dat de bovengetekende met succes het examen heeft afgelegd voor de',
  awardedAt,
  verificationCode,
  examiner,
  baseUrl = 'https://judoclubmichigami.nl',
}: DiplomaPDFProps) {
  const beltColor = BELT_COLORS[beltLevel] || BRAND_RED
  const beltLabel = BELT_LABELS_NL[beltLevel] || beltLevel
  const hasBelt = beltLevel && beltLevel !== ''
  const dateStr = new Date(awardedAt).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.outerBorder}>
          <View style={styles.innerBorder}>
            {/* Header: Logo + Titel */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Image src={LOGO_URI} style={styles.logo} />
                <Text style={styles.logoTextPrimary}>Michigami</Text>
                <Text style={styles.logoTextSecondary}>Judo Club Steenbergen</Text>
              </View>
              <Text style={styles.mainTitle}>Diploma</Text>
              <Text style={styles.subTitle}>Certificaat van Behaald Judo Examen</Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.introText}>Hierbij wordt bevestigd dat</Text>
              <Text style={styles.recipientName}>{recipientName}</Text>
              <Text style={styles.descriptionText}>{description}</Text>

              {/* Band / Prestatie */}
              {hasBelt && (
                <View style={styles.achievementBox}>
                  <View style={[styles.beltBar, { backgroundColor: beltColor }]} />
                  <Text style={styles.beltLabel}>{beltLabel}</Text>
                </View>
              )}

              <Text style={[styles.descriptionText, { marginTop: 12, marginBottom: 0 }]}>
                {title}
              </Text>
            </View>

            {/* Footer: Handtekening + Datum */}
            <View style={styles.footer}>
              <View style={styles.signatureBlock}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureLabel}>
                  {examiner || 'Examinator'}
                </Text>
              </View>
              <View style={styles.dateBlock}>
                <Text style={styles.dateText}>{dateStr}</Text>
                <Text style={styles.locationText}>Steenbergen</Text>
              </View>
            </View>

            {/* Verificatie */}
            <View style={styles.verificationSection}>
              <Text style={styles.verificationCode}>
                Verificatiecode: {verificationCode}
              </Text>
              <Text style={styles.verificationUrl}>
                Verifieer op {baseUrl}/diploma/verifieren/{verificationCode}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}
