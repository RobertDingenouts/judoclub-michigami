# Bandoverzicht & Gradensysteem — Architectuurplan

> **Judoclub Michigami** — Centraal overzicht van alle leden, hun huidige graad, en volgende stap.
>
> Status: **Definitief ontwerp** — 19 juni 2026
> Versie: 2.0 (herzien met kyu/dan systeem + dan-kleuren)

---

## 1. Doel & Scope

### Probleem
Admins hebben geen overzicht van:
- Welke leden welke graad hebben
- Hoelang ze in bezit zijn van hun huidige graad
- Wat de volgende graad is (slip voor jeugd, directe band voor volwassenen)
- Per locatie wie er wat heeft

### Oplossing
Centraal admin-overzicht (`/admin/bandoverzicht`) dat per lid toont:
- Huidige graad met kleur
- In bezit sinds + hoelang
- Volgende graad (afhankelijk van leeftijd: slip of directe volgende band)
- Filter per locatie, per graad, per leeftijdscategorie

**Belangrijk:** Geen minimale wachttijd tussen examens. Het systeem is puur informatief — de admin bepaalt wanneer iemand mag opnemen.

---

## 2. Gradensysteem

### 2.1 Kyu-graden (Leerlinggraden)

| # | Graad | Kleur | Japanse naam | DB enum | Kleur hex |
|---|-------|-------|-------------|---------|-----------|
| 1 | 6e Kyu | Wit | Rok-Kyu | `WIT` | `#FFFFFF` |
| 2 | 5e Kyu | Geel | Go-Kyu | `GEEL` | `#FFD700` |
| 3 | 4e Kyu | Oranje | Yon-Kyu | `ORANJE` | `#FF8C00` |
| 4 | 3e Kyu | Groen | San-Kyu | `GROEN` | `#228B22` |
| 5 | 2e Kyu | Blauw | Ni-Kyu | `BLAUW` | `#0000FF` |
| 6 | 1e Kyu | Bruin | Ichi-Kyu | `BRUIN` | `#8B4513` |

### 2.2 Dan-graden (Meestergraden)

| # | Graad | Kleur | Japanse naam | DB enum | Kleur hex |
|---|-------|-------|-------------|---------|-----------|
| 1 | 1e Dan | Zwart | Sho-Dan | `ZWART_1` | `#000000` |
| 2 | 2e Dan | Zwart | Ni-Dan | `ZWART_2` | `#000000` |
| 3 | 3e Dan | Zwart | San-Dan | `ZWART_3` | `#000000` |
| 4 | 4e Dan | Zwart | Yon-Dan | `ZWART_4` | `#000000` |
| 5 | 5e Dan | Zwart | Go-Dan | `ZWART_5` | `#000000` |
| 6 | 6e Dan | Rood-Wit geblokt | Roku-Dan | `ZWART_6` | `#C41E3A/#FFFFFF` |
| 7 | 7e Dan | Rood-Wit geblokt | Shichi-Dan | `ZWART_7` | `#C41E3A/#FFFFFF` |
| 8 | 8e Dan | Rood-Wit geblokt | Hachi-Dan | `ZWART_8` | `#C41E3A/#FFFFFF` |
| 9 | 9e Dan | Rood | Ku-Dan | `ZWART_9` | `#C41E3A` |
| 10 | 10e Dan | Rood | Ju-Dan | `ZWART_10` | `#C41E3A` |

> **Niet in scope voor nu:** 11e Dan (Rood) en 12e Dan (Wit brede band) — deze graden zijn uitzonderlijk zeldzaam en worden niet in het systeem opgenomen tenzij nodig.

### 2.3 Slip-systeem (Alleen jeugd < 13 jaar)

Tussen de kyu-graden kunnen jeugdleden (onder de 13) een "slip" examen doen:

| Huidige band | Slip naam | DB enum | Weergave |
|-------------|-----------|---------|---------|
| Wit | Wit met gele slip | `WIT_GEEL` | "Witte band met gele slip" |
| Geel | Geel met oranje slip | `GEEL_ORANJE` | "Gele band met oranje slip" |
| Oranje | Oranje met groene slip | `ORANJE_GROEN` | "Oranje band met groene slip" |
| Groen | Groen met blauwe slip | `GROEN_BLAUW` | "Groene band met blauwe slip" |
| Blauw | Blauw met bruine slip | `BLAUW_BRUIN` | "Blauwe band met bruine slip" |

**Regels slip:**
- Alleen beschikbaar voor leden < 13 jaar op moment van examen
- Volwassenen (≥ 13) gaan direct van band naar band
- Na Bruin (1e Kyu) → direct naar Zwart (1e Dan), geen slips meer
- Dan-graden hebben geen slips

### 2.4 Volgorde arrays

**Volwassenen (≥ 13 jaar):**
```
WIT → GEEL → ORANJE → GROEN → BLAUW → BRUIN → ZWART_1 → ZWART_2 → ... → ZWART_10
```

**Jeugd (< 13 jaar):**
```
WIT → WIT_GEEL → GEEL → GEEL_ORANJE → ORANJE → ORANJE_GROEN → GROEN → GROEN_BLAUW → BLAUW → BLAUW_BRUIN → BRUIN → ZWART_1 → ...
```

---

## 3. Database Schema

### 3.1 Bestaande enum — `BeltLevel`

De huidige enum in `prisma/schema.prisma` is al correct:
```prisma
enum BeltLevel {
  // Kyu grades + slips
  WIT, WIT_GEEL, GEEL, GEEL_ORANJE, ORANJE, ORANJE_GROEN,
  GROEN, GROEN_BLAUW, BLAUW, BLAUW_BRUIN, BRUIN,
  // Dan grades
  ZWART_1, ZWART_2, ZWART_3, ZWART_4, ZWART_5,
  ZWART_6, ZWART_7, ZWART_8, ZWART_9, ZWART_10,
  // Legacy (tijdelijk behouden)
  BRUIN_1, BRUIN_2, BRUIN_3, Zwart_1, Zwart_2, Zwart_3
}
```

**Geen wijziging nodig** — de enum dekt het volledige gradensysteem.

### 3.2 Dan-graden kleuren

Voor de UI hebben we een mapping van belt level → kleur. De hogere dan-graden krijgen speciale kleuren:

```typescript
// src/lib/student-progress-types.ts
export const BELT_COLORS: Record<BeltLevel, string> = {
  // Kyu
  WIT:          '#FFFFFF',
  WIT_GEEL:     '#FFFFFF',
  GEEL:         '#FFD700',
  GEEL_ORANJE:  '#FFD700',
  ORANJE:       '#FF8C00',
  ORANJE_GROEN: '#FF8C00',
  GROEN:        '#228B22',
  GROEN_BLAUW:  '#228B22',
  BLAUW:        '#0000FF',
  BLAUW_BRUIN:  '#0000FF',
  BRUIN:        '#8B4513',
  // Dan — Zwart (1e-5e)
  ZWART_1:      '#000000',
  ZWART_2:      '#000000',
  ZWART_3:      '#000000',
  ZWART_4:      '#000000',
  ZWART_5:      '#000000',
  // Dan — Rood-Wit geblokt (6e-8e)
  ZWART_6:      '#C41E3A', // Rood (rood-wit in UI met CSS pattern)
  ZWART_7:      '#C41E3A',
  ZWART_8:      '#C41E3A',
  // Dan — Rood (9e-10e)
  ZWART_9:      '#C41E3A',
  ZWART_10:     '#C41E3A',
  // Legacy
  BRUIN_1:      '#8B4513',
  BRUIN_2:      '#8B4513',
  BRUIN_3:      '#8B4513',
  Zwart_1:      '#000000',
  Zwart_2:      '#000000',
  Zwart_3:      '#000000',
}
```

### 3.3 Dan-grade indicator

Voor de UI: 6e-8e Dan krijgt een "rood-wit geblokt" patroon. Dit doen we met CSS:

```css
/* Rood-wit geblokt patroon voor 6e-8e Dan */
.belt-dan-red-white {
  background: repeating-linear-gradient(
    45deg,
    #C41E3A,
    #C41E3A 10px,
    #FFFFFF 10px,
    #FFFFFF 20px
  );
}
```

---

## 4. Business Logic

### 4.1 Leeftijd-bepaling

```typescript
// src/lib/belt-utils.ts
function isYouth(dateOfBirth: Date | null): boolean {
  if (!dateOfBirth) return false // Stel volwassen in als geen geboortedatum
  const today = new Date()
  const age = today.getFullYear() - dateOfBirth.getFullYear()
  const monthDiff = today.getMonth() - dateOfBirth.getMonth()
  const actualAge = monthDiff < 0 ? age - 1 : age
  return actualAge < 13
}
```

### 4.2 Volgende graad berekenen

```typescript
// src/lib/belt-utils.ts
import type { BeltLevel } from '@prisma/client'

const ADULT_ORDER: BeltLevel[] = [
  'WIT', 'GEEL', 'ORANJE', 'GROEN', 'BLAUW', 'BRUIN',
  'ZWART_1', 'ZWART_2', 'ZWART_3', 'ZWART_4', 'ZWART_5',
  'ZWART_6', 'ZWART_7', 'ZWART_8', 'ZWART_9', 'ZWART_10',
]

const YOUTH_ORDER: BeltLevel[] = [
  'WIT', 'WIT_GEEL', 'GEEL', 'GEEL_ORANJE', 'ORANJE', 'ORANJE_GROEN',
  'GROEN', 'GROEN_BLAUW', 'BLAUW', 'BLAUW_BRUIN', 'BRUIN',
  'ZWART_1', 'ZWART_2', 'ZWART_3', 'ZWART_4', 'ZWART_5',
  'ZWART_6', 'ZWART_7', 'ZWART_8', 'ZWART_9', 'ZWART_10',
]

export function getNextBelt(currentBelt: BeltLevel | null, isYouthMember: boolean): BeltLevel | null {
  const order = isYouthMember ? YOUTH_ORDER : ADULT_ORDER
  const currentIndex = order.indexOf(currentBelt!)
  if (currentIndex === -1 || currentIndex >= order.length - 1) {
    return null // Max grade bereikt
  }
  return order[currentIndex + 1]
}

export function isSlipBelt(belt: BeltLevel): boolean {
  return ['WIT_GEEL', 'GEEL_ORANJE', 'ORANJE_GROEN', 'GROEN_BLAUW', 'BLAUW_BRUIN'].includes(belt)
}

export function isDanGrade(belt: BeltLevel): boolean {
  return belt.startsWith('ZWART_') || ['Zwart_1', 'Zwart_2', 'Zwart_3'].includes(belt)
}

export function getDanNumber(belt: BeltLevel): number | null {
  const match = belt.match(/ZWART_(\d+)/) || belt.match(/Zwart_(\d+)/)
  return match ? parseInt(match[1]) : null
}

export function getDanColorClass(belt: BeltLevel): string {
  const danNum = getDanNumber(belt)
  if (!danNum) return ''
  if (danNum >= 6 && danNum <= 8) return 'belt-dan-red-white'
  if (danNum >= 9) return 'belt-dan-red'
  return 'belt-dan-black'
}
```

### 4.3 Hoelang in bezit

```typescript
// src/lib/belt-utils.ts
export function getTimeInBelt(
  lastExamDate: Date | null,
  joinDate: Date
): { years: number; months: number; weeks: number; text: string } {
  const fromDate = lastExamDate || joinDate
  const now = new Date()
  const diffMs = now.getTime() - fromDate.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  const years = Math.floor(diffDays / 365)
  const months = Math.floor((diffDays % 365) / 30)
  const weeks = Math.floor((diffDays % 30) / 7)

  let parts: string[] = []
  if (years > 0) parts.push(`${years} jaar`)
  if (months > 0) parts.push(`${months} maand${months > 1 ? 'en' : ''}`)
  if (weeks > 0 || parts.length === 0) parts.push(`${weeks} week${weeks !== 1 ? 'en' : ''}`)

  return { years, months, weeks, text: parts.join(', ') }
}
```

### 4.4 Graad label genereren

```typescript
// src/lib/belt-utils.ts
export const BELT_LABELS_NL: Record<BeltLevel, string> = {
  WIT:          'Witte band',
  WIT_GEEL:     'Witte band met gele slip',
  GEEL:         'Gele band',
  GEEL_ORANJE:  'Gele band met oranje slip',
  ORANJE:       'Oranje band',
  ORANJE_GROEN: 'Oranje band met groene slip',
  GROEN:        'Groene band',
  GROEN_BLAUW:  'Groene band met blauwe slip',
  BLAUW:        'Blauwe band',
  BLAUW_BRUIN:  'Blauwe band met bruine slip',
  BRUIN:        'Bruine band',
  ZWART_1:      '1e Dan (Zwarte band)',
  ZWART_2:      '2e Dan (Zwarte band)',
  ZWART_3:      '3e Dan (Zwarte band)',
  ZWART_4:      '4e Dan (Zwarte band)',
  ZWART_5:      '5e Dan (Zwarte band)',
  ZWART_6:      '6e Dan (Rood-wit geblokt)',
  ZWART_7:      '7e Dan (Rood-wit geblokt)',
  ZWART_8:      '8e Dan (Rood-wit geblokt)',
  ZWART_9:      '9e Dan (Rode band)',
  ZWART_10:     '10e Dan (Rode band)',
  BRUIN_1:      'Bruine band (oud)',
  BRUIN_2:      'Bruine band (oud)',
  BRUIN_3:      'Bruine band (oud)',
  Zwart_1:      '1e Dan (Zwarte band)',
  Zwart_2:      '2e Dan (Zwarte band)',
  Zwart_3:      '3e Dan (Zwarte band)',
}
```

---

## 5. API Endpoints

### 5.1 GET /api/admin/band-overzicht

Haalt alle actieve leden op met graadinformatie.

**Query params:**
- `location` — `STeenbergen` | `OUD_VOSSEMEER` | `ALL` (default)
- `belt` — Filter op huidige graad
- `q` — Zoeken op naam

**Response:**
```typescript
interface BeltOverviewMember {
  memberId: string
  firstName: string
  lastName: string
  email: string | null
  dateOfBirth: Date | null
  age: number | null
  isYouth: boolean
  location: string | null
  currentBelt: BeltLevel | null
  currentBeltLabel: string
  currentBeltColor: string
  currentBeltIsSlip: boolean
  currentBeltIsDan: boolean
  danNumber: number | null
  danColorClass: string
  joinDate: Date
  lastExamDate: Date | null
  timeInBelt: { years: number; months: number; weeks: number; text: string }
  nextBelt: BeltLevel | null
  nextBeltLabel: string | null
  nextBeltIsSlip: boolean
  examCount: number // Aantal geslaagde examens
}

interface BeltOverviewResponse {
  members: BeltOverviewMember[]
  summary: {
    total: number
    byLocation: Record<string, number>
    byBelt: Record<string, number>
    youth: number
    adults: number
    hasSlip: number
    danGrades: number
  }
}
```

**Implementatie:**
```typescript
// src/app/api/admin/band-overzicht/route.ts
export async function GET(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return error(403)

  const { searchParams } = new URL(request.url)
  const location = searchParams.get('location') || 'ALL'
  const belt = searchParams.get('belt') || ''
  const q = searchParams.get('q') || ''

  const where: any = { isActive: true }
  if (location !== 'ALL') where.location = location
  if (belt) where.currentBelt = belt
  if (q) {
    where.OR = [
      { firstName: { contains: q, mode: 'insensitive' } },
      { lastName: { contains: q, mode: 'insensitive' } },
    ]
  }

  const members = await db.member.findMany({
    where,
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    include: {
      examAttempts: {
        where: { status: 'COMPLETED_PASSED' },
        orderBy: { examDate: 'desc' },
        select: { examDate: true, beltLevel: true },
      },
    },
  })

  // Transform to response format
  const result = members.map(m => transformMember(m))

  return NextResponse.json({ members: result, summary: computeSummary(result) })
}
```

---

## 6. Admin Pagina

### 6.1 /admin/bandoverzicht

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  BANDOVERZICHT                                              │
│  Overzicht van alle leden, hun graad en volgende stap       │
├─────────────────────────────────────────────────────────────┤
│  [Zoeken: ___] [Locatie: Alle ▼] [Graad: Alle ▼]           │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐ │
│  │ 47         │ │ 32         │ │ 15         │ │ 3        │ │
│  │ Totaal     │ │ Jeugd      │ │ Volwassenen│ │ Dan-graden│ │
│  └────────────┘ └────────────┘ └────────────┘ └──────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Jan Jansen              │ Witte band                   ││
│  │ Steenbergen · Jeugd     │ In bezit: 4 maanden          ││
│  │ Volgende: Witte band m. │ [Bekijken]                   ││
│  │         gele slip       │                              ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Marie De Vries          │ Gele band                    ││
│  │ Oud-Vossemeer · Volw.   │ In bezit: 1 jaar, 2 maanden  ││
│  │ Volgende: Oranje band   │ [Bekijken]                   ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Robert Bakker           │ 3e Dan (Zwarte band)  ■■     ││
│  │ Steenbergen · Volw.     │ In bezit: 5 jaar           ││
│  │ Volgende: 4e Dan        │ [Bekijken]                   ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Member Card Component

Elk lid krijgt een card met:
- **Linkerkant:** Naam, locatie, leeftijdscategorie
- **Midden:** Huidige graad met kleurindicator, in bezit tijd
- **Rechterkant:** Volgende graad, link naar detailpagina

**Kleurindicator per graadtype:**
- Kyu: Vaste kleur (wit, geel, oranje, etc.)
- Slip: Gradient van huidige + volgende kleur
- Zwart (1e-5e Dan): Zwarte balk
- Rood-wit (6e-8e Dan): Geblokt patroon (CSS)
- Rood (9e-10e Dan): Rode balk

---

## 7. Component Architectuur

```
src/components/band-overzicht/
├── Filters.tsx              # Zoeken, locatie, graad filter
├── Summary.tsx              # Statistieken cards (totaal, jeugd, volwassenen, dan)
├── MemberCard.tsx           # Per-lid card met graad, tijd, volgende
├── BeltBadge.tsx            # Graad badge met kleur (kyu, slip, dan kleuren)
└── DanPattern.tsx           # CSS patterns voor rood-wit geblokt
```

### 7.1 BeltBadge Component

```tsx
// src/components/band-overzicht/BeltBadge.tsx
interface BeltBadgeProps {
  belt: BeltLevel
  showLabel?: boolean
}

export function BeltBadge({ belt, showLabel = true }: BeltBadgeProps) {
  const color = BELT_COLORS[belt]
  const label = BELT_LABELS_NL[belt]
  const isSlip = isSlipBelt(belt)
  const danClass = getDanColorClass(belt)

  return (
    <div className="flex items-center gap-2">
      <div className={`h-4 w-8 rounded border border-gray-300 ${danClass || ''}`}
        style={!danClass ? { backgroundColor: color } : undefined}
        title={label} />
      {showLabel && <span className="text-sm font-medium">{label}</span>}
    </div>
  )
}
```

---

## 8. Bestandsstructuur

```
src/
├── lib/
│   └── belt-utils.ts                    # NIEUW: alle belt logica
│       ├── isYouth()
│       ├── getNextBelt()
│       ├── isSlipBelt()
│       ├── isDanGrade()
│       ├── getDanNumber()
│       ├── getDanColorClass()
│       ├── getTimeInBelt()
│       ├── BELT_LABELS_NL (update)
│       ├── BELT_COLORS (update)
│       ├── ADULT_ORDER
│       └── YOUTH_ORDER
├── app/
│   ├── admin/
│   │   ├── bandoverzicht/
│   │   │   └── page.tsx                 # NIEUW: admin overzicht pagina
│   │   └── layout.tsx                   # BESTAAND: link toevoegen
│   └── api/
│       └── admin/
│           └── band-overzicht/
│               └── route.ts             # NIEUW: API endpoint
├── components/
│   └── band-overzicht/
│       ├── Filters.tsx                  # NIEUW
│       ├── Summary.tsx                  # NIEUW
│       ├── MemberCard.tsx               # NIEUW
│       ├── BeltBadge.tsx                # NIEUW
│       └── DanPattern.tsx               # NIEUW (CSS patterns)
└── globals.css                          # UPDATE: dan pattern CSS toevoegen
```

---

## 9. Bestanden die aangepast moeten worden

### 9.1 src/lib/student-progress-types.ts
- `BELT_LABELS_NL` — labels updaten met dan-naming (1e Dan, 6e Dan rood-wit, etc.)
- `BELT_COLORS` — kleuren updaten voor ZWART_6 t/m ZWART_10
- `BELT_ORDER` — vervangen door `ADULT_ORDER` + `YOUTH_ORDER` in belt-utils.ts

### 9.2 src/app/admin/layout.tsx
- Navigatielink toevoegen: `<AdminLink href="/admin/bandoverzicht" icon="🥋" label="Bandoverzicht" />`

### 9.3 src/app/admin/page.tsx
- Dashboard widget: "X leden op witte band", "Y dan-graden" (optioneel)

### 9.4 src/globals.css
- CSS patterns toevoegen voor dan-graden:
```css
.belt-dan-black {
  background-color: #000000;
}
.belt-dan-red-white {
  background: repeating-linear-gradient(
    45deg,
    #C41E3A,
    #C41E3A 8px,
    #FFFFFF 8px,
    #FFFFFF 16px
  );
  border: 1px solid #C41E3A;
}
.belt-dan-red {
  background-color: #C41E3A;
}
```

### 9.5 Bestanden die BELT_LABELS_NL / BELT_COLORS importeren
Alle bestanden die deze constants gebruiken moeten worden gecheckt op compatibiliteit:
- `src/components/UserDropdown.tsx`
- `src/components/sections/ProfileSection.tsx`
- `src/components/sections/DiplomasSection.tsx`
- `src/components/diploma/DiplomaPDFDocument.tsx`
- `src/app/admin/page.tsx`
- `src/app/leden/page.tsx`
- `src/app/leden/voortgang/page.tsx`
- `src/app/api/cursus-japans/sync/route.ts`

---

## 10. Implementatievolgorde

### Fase 1: Core logica (belt-utils.ts)
1. `src/lib/belt-utils.ts` aanmaken met alle functies
2. `BELT_LABELS_NL` + `BELT_COLORS` updaten in `student-progress-types.ts`
3. Unit tests voor getNextBelt() (jeugd vs volwassen)

### Fase 2: API endpoint
4. `src/app/api/admin/band-overzicht/route.ts` aanmaken
5. Test: `curl /api/admin/band-overzicht` als admin

### Fase 3: CSS + Components
6. Dan pattern CSS in `globals.css`
7. `BeltBadge.tsx` component
8. `MemberCard.tsx` component
9. `Filters.tsx` + `Summary.tsx`

### Fase 4: Pagina + Navigatie
10. `src/app/admin/bandoverzicht/page.tsx`
11. Link in admin layout
12. Optioneel: dashboard widget

### Fase 5: Bestaande bestanden syncen
13. Alle bestanden die BELT_LABELS_NL/BELT_COLORS gebruiken controleren
14. Diploma PDF component updaten (dan-graden kleuren)
15. Build + deploy

---

## 11. Startprompt voor Implementatie-sessie

```
BELT OVERZICHT IMPLEMENTEREN — Judoclub Michigami

Lees eerst:
1. BANDOVERZICHT-PLAN.md — volledig architectuurplan
2. AGENTS.md — project conventies
3. judoclub-platform skill — context

Taak: Implementeer het bandoverzicht volgens het plan in BANDOVERZICHT-PLAN.md.

Volgorde:
1. Maak src/lib/belt-utils.ts met alle logica (isYouth, getNextBelt, getTimeInBelt, etc.)
2. Update BELT_LABELS_NL + BELT_COLORS in student-progress-types.ts
3. Maak API endpoint GET /api/admin/band-overzicht
4. Voeg dan-pattern CSS toe aan globals.css
5. Maak components: BeltBadge, MemberCard, Filters, Summary
6. Maak pagina /admin/bandoverzicht
7. Voeg link toe aan admin layout
8. npm run build → 0 errors
9. git commit + push

Belangrijk:
- Slip alleen voor < 13 jaar, volwassenen direct band-naar-band
- Dan-graden: 1e-5e zwart, 6e-8e rood-wit geblokt, 9e-10e rood
- Geen minimale wachttijd tussen examens — puur informatief overzicht
- BELT_LABELS_NL is single source of truth — importeer overal vandaan
- Exporteer ADULT_ORDER en YOUTH_ORDER uit belt-utils.ts

Test na build:
- npm run build → 0 errors
- curl https://judoclub-michigami.vercel.app/admin/bandoverzicht → 307 (auth redirect = goed)
```

---

## 12. Migratie: Legacy belt waarden

Bestaande DB records kunnen legacy waarden hebben:
- `BRUIN_1`, `BRUIN_2`, `BRUIN_3` → migreren naar `BRUIN`
- `Zwart_1`, `Zwart_2`, `Zwart_3` → migreren naar `ZWART_1`, `ZWART_2`, `ZWART_3`

Dit is apart van het bandoverzicht en kan later worden gedaan. Zie `prisma/schema.prisma` voor legacy enum waarden.

---

*Einde plan — versie 2.0, 19 juni 2026*
