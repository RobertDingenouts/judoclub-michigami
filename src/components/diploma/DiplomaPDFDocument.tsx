import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { LOGO_URI as LOGO_URI_RAW } from './logo-uri'

// -----------------------------------------------------------------------------
// 1. CONFIGURATIE & KLEUREN
// -----------------------------------------------------------------------------

const BRAND_RED = '#a90000'
const BRAND_GOLD = '#d4a843'
const NEUTRAL_DARK = '#1a1a1a'
const NEUTRAL_LIGHT = '#fffafa' // Bijna wit, brand-50
const NEUTRAL_GRAY = '#666666'

// Gebruik de LOGO_URI alleen als deze geldig is (niet leeg)
const LOGO_URI = LOGO_URI_RAW && LOGO_URI_RAW.length > 100 ? LOGO_URI_RAW : ''

const BELT_COLORS: Record<string, string> = {
  WIT:           '#FFFFFF',
  WIT_GEEL:      '#FFFFFF',
  GEEL:          '#FFD700',
  GEEL_ORANJE:   '#FFD700',
  ORANJE:        '#FF8C00',
  ORANJE_GROEN:  '#FF8C00',
  GROEN:         '#228B22',
  GROEN_BLAUW:   '#228B22',
  BLAUW:         '#0000FF',
  BLAUW_BRUIN:   '#0000FF',
  BRUIN:         '#8B4513',
  ZWART_1:       '#000000',
  ZWART_2:       '#000000',
  ZWART_3:       '#000000',
  ZWART_4:       '#000000',
  ZWART_5:       '#000000',
  ZWART_6:       '#000000',
  ZWART_7:       '#000000',
  ZWART_8:       '#000000',
  ZWART_9:       '#000000',
  ZWART_10:      '#000000',
  // Legacy
  BRUIN_1:       '#8B4513',
  BRUIN_2:       '#8B4513',
  BRUIN_3:       '#8B4513',
  Zwart_1:       '#000000',
  Zwart_2:       '#000000',
  Zwart_3:       '#000000',
  // Fallbacks voor niet-band diploma's
  COURSE_JAPANESE: BRAND_GOLD,
  ACHIEVEMENT: BRAND_RED,
}

const BELT_LABELS_NL: Record<string, string> = {
  WIT:           'Witte Band',
  WIT_GEEL:      'Witte Band met Gele Slip',
  GEEL:          'Gele Band',
  GEEL_ORANJE:   'Gele Band met Oranje Slip',
  ORANJE:        'Oranje Band',
  ORANJE_GROEN:  'Oranje Band met Groene Slip',
  GROEN:         'Groene Band',
  GROEN_BLAUW:   'Groene Band met Blauwe Slip',
  BLAUW:         'Blauwe Band',
  BLAUW_BRUIN:   'Blauwe Band met Bruine Slip',
  BRUIN:         'Bruine Band',
  ZWART_1:       'Zwarte Band 1e Dan',
  ZWART_2:       'Zwarte Band 2e Dan',
  ZWART_3:       'Zwarte Band 3e Dan',
  ZWART_4:       'Zwarte Band 4e Dan',
  ZWART_5:       'Zwarte Band 5e Dan',
  ZWART_6:       'Zwarte Band 6e Dan',
  ZWART_7:       'Zwarte Band 7e Dan',
  ZWART_8:       'Zwarte Band 8e Dan',
  ZWART_9:       'Zwarte Band 9e Dan',
  ZWART_10:      'Zwarte Band 10e Dan',
  // Legacy
  BRUIN_1:       'Bruine Band 1e Ke',
  BRUIN_2:       'Bruine Band 2e Ke',
  BRUIN_3:       'Bruine Band 3e Ke',
  Zwart_1:       'Zwarte Band 1e Dan',
  Zwart_2:       'Zwarte Band 2e Dan',
  Zwart_3:       'Zwarte Band 3e Dan',
  // Fallbacks voor niet-band diploma's
  COURSE_JAPANESE: 'Online Cursus Japans',
  ACHIEVEMENT: 'Bijzondere Prestatie',
}

// -----------------------------------------------------------------------------
// 2. STYLESHEET (Strict @react-pdf/renderer compatible)
// -----------------------------------------------------------------------------

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: NEUTRAL_LIGHT,
    padding: 40,
    fontFamily: 'Helvetica',
  },
  // Buitenste rand: Dik, rood, scherpe hoeken
  outerBorder: {
    flex: 1,
    borderWidth: 4,
    borderColor: BRAND_RED,
    padding: 4, // Ruimte tussen buitenste en binnenste rand
  },
  // Binnenste rand: Dun, goud, scherpe hoeken
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
  // Typografisch logo als fallback/ondersteuning voor de afbeelding
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
  websiteUrl: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: NEUTRAL_GRAY,
    letterSpacing: 2,
    marginTop: 4,
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
    // Geen borderRadius volgens specificatie "Scherpe hoeken"
  },
  beltLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 20,
    color: NEUTRAL_DARK,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  beltPrefix: {
    fontFamily: 'Times-Roman',
    fontSize: 16,
    color: NEUTRAL_DARK,
    textAlign: 'center',
    marginBottom: 8,
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
  // Verificatie sectie (subtiel, absolute onderaan)
  verificationSection: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  verificationCode: {
    fontFamily: 'Courier', // Monospace voor codes is altijd netjes
    fontSize: 9,
    color: '#999999',
    letterSpacing: 1,
  },
  verificationUrl: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: '#bbbbbb',
    marginTop: 2,
  },
})

// -----------------------------------------------------------------------------
// 3. COMPONENT DEFINITIE
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
  description,
  awardedAt,
  verificationCode,
  examiner,
  baseUrl = 'https://judoclubmichigami.nl',
}: DiplomaPDFProps) {
  const beltColor = BELT_COLORS[beltLevel] || BRAND_RED
  const beltLabel = BELT_LABELS_NL[beltLevel] || beltLevel
  const hasBelt = beltLevel && beltLevel !== '' && beltLevel !== 'COURSE_JAPANESE' && beltLevel !== 'ACHIEVEMENT'

  // Formateer datum naar Nederlands formaat: "13 februari 2026"
  const dateStr = new Date(awardedAt).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // Bepaal de beschrijvende tekst op basis van het type diploma
  const defaultDescription = beltLevel === 'COURSE_JAPANESE'
    ? 'de online cursus Japans (judo terminologie) met goed gevolg heeft voltooid en de bijbehorende kennis heeft aangetoond.'
    : 'met succes het examen heeft afgelegd voor de cursus judo terminologie'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.outerBorder}>
          <View style={styles.innerBorder}>

            {/* HEADER */}
            <View style={styles.header}>
              {/* Logo Sectie */}
              <View style={styles.logoContainer}>
                {LOGO_URI ? (
                  <Image src={LOGO_URI} style={{ width: 80, height: 80, marginBottom: 10 }} />
                ) : (
                  // Typografische fallback als er geen base64 logo is,
                  // dit ziet er alsnog zeer professioneel uit.
                  <View style={{ alignItems: 'center' }}>
                    <Text style={styles.logoTextPrimary}>Michigami</Text>
                    <Text style={styles.logoTextSecondary}>Judoclub Michigami</Text>
                  </View>
                )}
              </View>

              <Text style={styles.mainTitle}>Diploma</Text>
              <Text style={styles.subTitle}>{title}</Text>
              <Text style={styles.websiteUrl}>www.judoclubmichigami.nl</Text>
            </View>

            {/* CONTENT */}
            <View style={styles.content}>
              <Text style={styles.introText}>Hierbij wordt bevestigd dat</Text>

              <Text style={styles.recipientName}>{recipientName}</Text>

              <Text style={styles.descriptionText}>
                {defaultDescription}
              </Text>

              {/* Visuele weergave van de band of prestatie */}
              <View style={styles.achievementBox}>
                {hasBelt && <Text style={styles.beltPrefix}>voor de</Text>}
                <View style={[styles.beltBar, { backgroundColor: beltColor }]} />
                <Text style={styles.beltLabel}>{beltLabel}</Text>
              </View>
            </View>

            {/* FOOTER */}
            <View style={styles.footer}>
              <View style={styles.signatureBlock}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureLabel}>
                  {examiner || 'Examinator / Leraar'}
                </Text>
              </View>

              <View style={styles.dateBlock}>
                <Text style={styles.dateText}>{dateStr}</Text>
                <Text style={styles.locationText}>Nederland</Text>
              </View>
            </View>

            {/* VERIFICATIE (Subtiel onderaan) */}
            <View style={styles.verificationSection}>
              <Text style={styles.verificationCode}>
                Code: {verificationCode}
              </Text>
              <Text style={styles.verificationUrl}>
                Verifieer dit diploma op {baseUrl}/diploma/verifieren/{verificationCode}
              </Text>
            </View>

          </View>
        </View>
      </Page>
    </Document>
  )
}
