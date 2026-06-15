# Judoclub Michigami — Diploma PDF Specificatie

**Doel:** Dit document bevat ALLE informatie die nodig is om een nieuw, mooier diploma PDF design te genereren. Upload dit bestand naar een AI model (bijv. Claude, GPT-4, Gemini) en vraag om een verbeterd `DiplomaPDFDocument` component te schrijven.

---

## 1. Hoe het Diploma Systeem Werkt

### Data Flow (End-to-End)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. ADMIN: Examen invoeren                                       │
│    /admin/exams → POST /api/exams/pending                      │
│    → ExamAttempt record in DB (status: SCHEDULED)              │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. ADMIN: Examen afsluiten (GESLAAGD)                           │
│    PATCH /api/admin/exams/[id] → status: COMPLETED_PASSED      │
│    → createDiplomaOnExamPass() wordt aangeroepen               │
│    → Diploma record in DB + verificatiecode (MJ-XXXX-XXXX)     │
│    → PDF wordt gegenereerd via @react-pdf/renderer             │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. LID: Diploma downloaden                                      │
│    /leden/diploma's → klik download                             │
│    → GET /api/diplomas/download?id=<diplomaId>                 │
│    → generateDiplomaPDF() → Blob → NextResponse (PDF)          │
└─────────────────────────────────────────────────────────────────┘
```

### Cursus Japans (Aparte Flow)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. LID: Quiz doen in Cursus Japans                              │
│    SPA component → JapaneseCourseSection.tsx                    │
│    → Quiz score ≥80% = geslaagd                                 │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Auto-sync naar server                                        │
│    POST /api/cursus-japans/sync                                 │
│    → CourseProgress upsert (isPassed: true)                     │
│    → Diploma record in DB + verificatiecode (JP-XXXX-XXXX)     │
│    → Volgende bandniveau unlocken                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Database Schema (Relevantie voor Diploma)

### Diploma Model (Prisma)

```prisma
model Diploma {
  id               String       @id @default(cuid())
  type             DiplomaType  // BELT_EXAM | COURSE_JAPANESE | ACHIEVEMENT
  title            String       // "Examen Gele Band Geslaagd"
  description      String?      // Lange tekst
  recipientId      String       // → Member.id
  userId           String       // → User.id
  beltLevel        BeltLevel?   // WIT, GEEL, ORANJE, GROEN, BLAUW, BRUIN_1, etc.
  courseName       String?      // "japanese" voor Cursus Japans
  examAttemptId    String?      @unique // → ExamAttempt.id (alleen voor BELT_EXAM)
  awardedAt        DateTime     @default(now())
  verificationCode String       @unique // "MJ-A1B2-C3D4" of "JP-A1B2-C3D4"
  imageUrl         String?      // Optionele afbeelding
  createdAt        DateTime     @default(now())
}

enum DiplomaType {
  BELT_EXAM
  COURSE_JAPANESE
  ACHIEVEMENT
}

enum BeltLevel {
  WIT, GEEL, ORANJE, GROEN, BLAUW, BRUIN_1, BRUIN_2, BRUIN_3, Zwart_1, Zwart_2, Zwart_3
}
```

### Data die beschikbaar is bij PDF generatie

```typescript
interface DiplomaPDFProps {
  recipientName: string    // "Jan Jansen" (uit Member.firstName + lastName)
  beltLevel: string        // "GEEL", "ORANJE", etc.
  title: string            // "Examen Gele Band Geslaagd"
  description?: string     // "Hierbij wordt bevestigd dat..."
  awardedAt: string        // ISO datum string
  verificationCode: string // "MJ-A1B2-C3D4" of "JP-A1B2-C3D4"
  examiner?: string        // Naam examinatar (optioneel)
  baseUrl?: string         // "https://judoclubmichigami.nl"
}
```

---

## 3. Huidige PDF Code (DiplomaPDFDocument.tsx)

**Locatie:** `src/components/diploma/DiplomaPDFDocument.tsx`

```tsx
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
```

---

## 4. @react-pdf/renderer Beperkingen (CRITIEK!)

### Wat WEL werkt:
- **Fonts:** Alleen built-in fonts: `Helvetica`, `Helvetica-Bold`, `Courier`, `Times-Roman`, etc. GEEN Google Fonts, GEEN custom fonts via URL
- **Kleuren:** HEX codes (`#a90000`), RGB, RGBA
- **Borders:** `borderWidth`, `borderColor`, `borderRadius`
- **Flexbox:** `flexDirection`, `justifyContent`, `alignItems`, `flex`
- **Position:** `position: 'absolute'`, `relative`
- **Text:** `fontSize`, `fontFamily`, `color`, `textAlign`, `fontWeight`, `textDecoration`, `letterSpacing`, `lineHeight`
- **Background:** `backgroundColor`
- **Afbeeldingen:** `<Image>` component met data URI of bestandspad

### Wat NIET werkt:
- **Google Fonts / Font.register()** — onbetrouwbaar op Vercel
- **Gradients** — geen `linearGradient`, `radialGradient`
- **Box-shadow** — niet ondersteund
- **CSS pseudo-elements** — geen `::before`, `::after`
- **SVG inline** — beperkt
- **External images via URL** — moet data URI of local path zijn
- **Complex positioning** — `transform`, `clip-path` werken niet

### Belangrijkste Rule:
> Het component MOET een `DiplomaPDFDocument` functional component zijn die een `<Document>` retourneert. Gebruik ALLEEN `@react-pdf/renderer` primitives: `Document`, `Page`, `Text`, `View`, `StyleSheet`, `Image`, `Link`.

---

## 5. Huisstijl Judoclub Michigami + Logo Instructie

### Kleurenpalet (Design System)

```css
/* Brand red palette (primary) */
--brand-900: #7a0000   /* Donkerste rood */
--brand-700: #8c0000   /* Donker rood */
--brand-600: #a90000   /* HOOFDKLEUR — gebruik dit */
--brand-500: #c00000   /* Licht rood */
--brand-100: #fdf6f6   /* Zeer licht rood (achtergrond) */
--brand-50:  #fffafa   /* Bijna wit (achtergrond) */

/* Neutral palette */
--neutral-950: #1a1a1a   /* Bijna zwart */
--neutral-900: #2a2a2a   /* Donkere tekst */
--neutral-100: #f5f5f0   /* Lichte achtergrond */

/* Accent */
--accent-gold: #d4a843   /* Goud — gebruik voor premium accenten */
```

### Typografie (Website)

- **Headings:** Rokkitt (serif) — formeel, traditioneel
- **Body:** Inter (sans-serif) — modern, leesbaar
- **Japans:** Noto Sans JP
- **Type scale:** Responsive clamp() van 0.7rem tot 3rem

**LET OP:** In @react-pdf/renderer zijn deze fonts NIET beschikbaar. Gebruik `Helvetica`, `Helvetica-Bold`, `Times-Roman`, `Courier` als fallback.

### Bandkleuren

```
WIT:    #FFFFFF
GEEL:   #FFD700
ORANJE: #FF8C00
GROEN:  #228B22
BLAUW:  #0000FF
BRUIN:  #8B4513
ZWART:  #000000
```

### Design Stijl

- **Formeel maar toegankelijk** — judo club, geen corporate
- **Rood (#a90000) als hoofdkleur** — nooit blauwe accenten
- **Goud (#d4a843) voor premium accenten** — bijv. decoratieve lijnen
- **Scherpe hoeken** — geen afgeronde borders op diploma
- **Sobere elegantie** — niet te versierd, wel professioneel

### Logo Instructie voor AI Model

Het logo is beschikbaar als `public/logo.png` (1845x1846, RGBA, transparante achtergrond).

**Voor @react-pdf/renderer:**
- Het logo is te groot voor inline base64 embed (~460KB)
- **Optie 1 (best):** Gebruik het logo als data URI met een gecomprimeerde versie. Run eerst: `convert logo.png -resize 400x400 -quality 80 logo-sm.png` en base64 encode
- **Optie 2:** Beschrijf het logo met tekst/SVG — een judo-figuur in rode cirkel met "MICHI GAMI" eromheen
- **Optie 3:** Gebruik `<Image src="data:image/png;base64,..." />` in de PDF met een klein logo (max 200x200px)

**Logo als data URI (voor in de PDF):**
```tsx
import { Image } from '@react-pdf/renderer'
// Embed base64 van gecomprimeerd logo (max 200x200px):
const LOGO_URI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
// In de PDF:
<Image src={LOGO_URI} style={{ width: 60, height: 60 }} />
```

**Belangrijk:** Het logo heeft transparante achtergrond — zorg dat het op een lichte achtergrond staat of met een subtiele schaduw/outline.

---

---

## 6. Wat de AI Moet Genereren

### Output:
Een compleet `DiplomaPDFDocument` TypeScript component dat:

1. **Zelfde interface gebruikt** als hierboven (`DiplomaPDFProps`)
2. **Alleen @react-pdf/renderer primitives** gebruikt
3. **Alleen built-in fonts** (Helvetica, Helvetica-Bold, Times-Roman, Courier)
4. **Mooier is** dan het huidige design

### Design Richtlijnen:
- Clubkleur: **#a90000** (rood) als primaire accent
- Goud: **#d4a843** voor premium accenten (randen, lijnen)
- Formeel, professioneel uiterlijk
- Bandkleur visueel prominent (bijv. decoratieve rand, balk, cirkel)
- Verificatiecode subtiel (niet storend)
- Handtekening + datum sectie
- **Logo** van Judoclub Michigami prominent in header
- Werkt voor ALLE diploma types (BELT_EXAM, COURSE_JAPANESE, ACHIEVEMENT)
- A4 formaat
- **Scherpe hoeken** — geen afgeronde borders
- **Sobere elegantie** — niet te versierd

### Design Ideeën:
- Dubbele rand: buitenste in brand rood (#a90000), binnenste in goud (#d4a843)
- Logo in header met clubnaam eronder
- Bandkleur als horizontale balk achter de bandnaam
- Decoratieve lijnen tussen secties (goud)
- Initiaals of monogram als watermerk
- Footer met handtekening (links) en datum (rechts) gescheiden door lijn
- Verificatiecode klein en discreet onderaan

---

## 7. Testen na Implementatie

Na het vervangen van `DiplomaPDFDocument.tsx`:

```bash
cd /home/suffie/michigami-website
npm run build  # Moet 0 errors geven
```

Test op live site:
1. Login als admin
2. Ga naar /admin/exams
3. Maak een examen met status COMPLETED_PASSED
4. Download diploma → moet PDF zijn, geen error

---

## 8. Bestandsstructuur

```
src/
├── components/diploma/
│   └── DiplomaPDFDocument.tsx    ← Dit is het bestand dat vervangen wordt
├── lib/
│   └── diploma-generator.tsx     ← Roep generateDiplomaPDF() aan
└── app/api/diplomas/download/
    └── route.tsx                 ← Download endpoint (verandert NIET)
```

**Alleen `DiplomaPDFDocument.tsx` hoeft te veranderen.** De rest van het systeem roept het component aan met dezelfde props en verwacht een `<Document>`.
