import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { LOGO_URI } from './logo-uri'

const styles = StyleSheet.create({
  page: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fffafa', // brand-50 (Bijna wit)
    padding: 24,
    fontFamily: 'Helvetica',
  },
  outerBorder: {
    borderWidth: 6,
    borderColor: '#a90000', // brand-600 (Hoofdkleur rood)
    flex: 1,
  },
  innerBorder: {
    borderWidth: 2,
    borderColor: '#d4a843', // accent-gold (Premium accent)
    margin: 12,
    flex: 1,
  },
  contentContainer: {
    padding: 40,
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
  },
  logo: {
    width: 70,
    height: 70,
    marginBottom: 12,
  },
  clubName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#a90000',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  clubSub: {
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#666666',
    letterSpacing: 3,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: '#d4a843',
    width: '30%',
    alignSelf: 'center',
    marginVertical: 15,
  },
  titleSection: {
    alignItems: 'center',
  },
  title: {
    fontSize: 46,
    fontFamily: 'Times-Roman', // Serif voor formele, traditionele uitstraling
    color: '#1a1a1a',
    letterSpacing: 6,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Helvetica',
    color: '#444444',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 8,
  },
  recipientSection: {
    alignItems: 'center',
  },
  presentedTo: {
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  recipientName: {
    fontSize: 36,
    fontFamily: 'Times-Roman',
    color: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#a90000',
    paddingHorizontal: 20,
    paddingBottom: 8,
    minWidth: 300,
    textAlign: 'center',
  },
  descriptionSection: {
    alignItems: 'center',
  },
  description: {
    fontSize: 13,
    fontFamily: 'Helvetica',
    color: '#333333',
    textAlign: 'center',
    lineHeight: 1.6,
    maxWidth: 450,
    marginBottom: 24,
  },
  beltContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  beltBar: {
    height: 14,
    width: 140,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#cccccc', // Subtiele rand zodat de witte band ook zichtbaar is
  },
  beltText: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#a90000',
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  signatureBlock: {
    alignItems: 'center',
    width: '40%',
  },
  signatureLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#1a1a1a',
    marginBottom: 6,
  },
  signatureLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dateBlock: {
    alignItems: 'center',
    width: '40%',
  },
  dateText: {
    fontSize: 12,
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  verificationSection: {
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
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
}

const BELT_LABELS_NL: Record<string, string> = {
  WIT:       'Witte band',
  GEEL:      'Gele band',
  ORANJE:    'Oranje band',
  GROEN:     'Groene band',
  BLAUW:     'Blauwe band',
  BRUIN_1:   'Bruine band 1e ke',
  BRUIN_2:   'Bruine band 2e ke',
  BRUIN_3:   'Bruine band 3e ke',
  Zwart_1:   'Zwarte band 1e dan',
  Zwart_2:   'Zwarte band 2e dan',
  Zwart_3:   'Zwarte band 3e dan',
}

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
  const beltColor = BELT_COLORS[beltLevel] || '#a90000'
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
            <View style={styles.contentContainer}>
              {/* Header: Logo + Clubnaam */}
              <View style={styles.header}>
                <Image src={LOGO_URI} style={styles.logo} />
                <Text style={styles.clubName}>Judoclub Michigami Steenbergen</Text>
                <Text style={styles.clubSub}>Stichting Judo Club</Text>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Titel */}
              <View style={styles.titleSection}>
                <Text style={styles.title}>Diploma</Text>
                <Text style={styles.subtitle}>Certificaat van Behaalde Judo Examen</Text>
              </View>

              {/* Ontvanger */}
              <View style={styles.recipientSection}>
                <Text style={styles.presentedTo}>Ernstig en met trots toegekend aan</Text>
                <Text style={styles.recipientName}>{recipientName}</Text>
              </View>

              {/* Beschrijving + Band */}
              <View style={styles.descriptionSection}>
                <Text style={styles.description}>{description}</Text>
                {hasBelt && (
                  <View style={styles.beltContainer}>
                    <View style={[styles.beltBar, { backgroundColor: beltColor }]} />
                    <Text style={styles.beltText}>{beltLabel}</Text>
                  </View>
                )}
                <Text style={[styles.description, { marginTop: 8, marginBottom: 0 }]}>
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
                  <Text style={styles.signatureLabel}>Datum</Text>
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
        </View>
      </Page>
    </Document>
  )
}
