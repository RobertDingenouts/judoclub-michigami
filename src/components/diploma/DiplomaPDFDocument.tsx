import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'a4',
    height: 'a4',
    padding: 40,
    backgroundColor: '#fafafa',
  },
  diplomaContainer: {
    width: '100%',
    height: '100%',
    borderWidth: 3,
    borderColor: '#a90000',
    borderRadius: 12,
    padding: 40,
    position: 'relative',
  },
  innerBorder: {
    borderWidth: 1,
    borderColor: '#d4d4d4',
    borderRadius: 8,
    padding: 30,
    height: '96%',
    position: 'relative',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  clubName: {
    fontSize: 14,
    fontFamily: 'Helvetica',
    color: '#a90000',
    fontWeight: 'bold',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Helvetica',
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  beltBar: {
    height: 8,
    width: 200,
    marginTop: 16,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  presentedTo: {
    fontSize: 12,
    fontFamily: 'Helvetica',
    color: '#888',
    textAlign: 'center',
    marginBottom: 8,
  },
  recipientName: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    textDecoration: 'underline',
    textDecorationColor: '#a90000',
    textDecorationWidth: 2,
  },
  description: {
    fontSize: 13,
    fontFamily: 'Helvetica',
    color: '#444',
    textAlign: 'center',
    lineHeight: 1.6,
    maxWidth: 450,
    marginBottom: 20,
  },
  beltAchieved: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#a90000',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  signatureBlock: {
    alignItems: 'center',
    flex: 1,
  },
  signatureLine: {
    width: 150,
    height: 1,
    backgroundColor: '#333',
    marginBottom: 6,
  },
  signatureLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#888',
    textAlign: 'center',
  },
  dateBlock: {
    alignItems: 'center',
    flex: 1,
  },
  verificationSection: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    alignItems: 'center',
  },
  verificationCode: {
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#aaa',
    textAlign: 'center',
  },
  verificationUrl: {
    fontSize: 8,
    fontFamily: 'Helvetica',
    color: '#bbb',
    textAlign: 'center',
    marginTop: 2,
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
  const dateStr = new Date(awardedAt).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.diplomaContainer}>
          <View style={styles.innerBorder}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.clubName}>Judoclub Michigami Steenbergen</Text>
              <Text style={styles.title}>DIPLOMA</Text>
              <Text style={styles.subtitle}>Certificaat van Behaalde Judo Examen</Text>
              <View style={[styles.beltBar, { backgroundColor: beltColor }]} />
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.presentedTo}>Ernstig en met trots toegekend aan</Text>
              <Text style={styles.recipientName}>{recipientName}</Text>
              <Text style={styles.description}>{description}</Text>
              <Text style={styles.beltAchieved}>{beltLabel}</Text>
              <Text style={[styles.presentedTo, { marginTop: 8 }]}>
                {title}
              </Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.signatureBlock}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureLabel}>
                  {examiner || 'Examinator'}
                </Text>
              </View>
              <View style={styles.dateBlock}>
                <Text style={{ fontSize: 12, fontFamily: 'Helvetica', color: '#444' }}>
                  {dateStr}
                </Text>
                <Text style={styles.signatureLabel}>Datum</Text>
              </View>
            </View>

            {/* Verification */}
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