# Bandexamen Overzicht & Automatische Alerts — Architectuurplan

> **Judoclub Michigami** — Admin systeem voor het bijhouden van examenklaarheid per lid.
>
> Status: **Ontwerp** — 19 juni 2026

---

## Inhoudsopgave

1. [Doel & Scope](#1-doel--scope)
2. [Bedrijfslogica — "Klaar voor examen" berekening](#2-bedrijfslogica--klar-voor-examen-berekening)
3. [API Endpoints](#3-api-endpoints)
4. [Admin Pagina's](#4-admin-pagina)
5. [Component Architectuur](#5-component-architectuur)
6. [Dashboard Widget](#6-dashboard-widget)
7. [Configuratie](#7-configuratie)
8. [Bestandsstructuur](#8-bestandsstructuur)
9. [Implementatievolgorde](#9-implementatievolgorde)

---

## 1. Doel & Scope

### Probleem
Admins hebben geen overzicht van welke leden klaar zijn voor hun volgende bandexamen. Momenteel moet dit handmatig nagekeken worden per student.

### Oplossing
Een centraal admin-overzicht (`/admin/bandoverzicht`) dat automatisch berekent:
- Welke leden **klaar** zijn voor hun volgende examen
- Welke leden **nog moeten wachten** (en tot wanneer)
- Overzicht **per locatie** (Steenbergen / Oud-Vossemeer)
- Snelkoppeling op het admin dashboard: "X leden klaar voor examen"

### Niet in scope (voor nu)
- Automatische e-mail/SMS alerts naar ouders/leden
- Kalenderintegratie voor examenplanning
- Publice zichtbaarheid (alleen admin)

---

## 2. Bedrijfslogica — "Klaar voor examen" berekening

### 2.1 Regels

| Scenario | Minimale wachttijd | Referentiedatum |
|----------|-------------------|-----------------|
| Eerste examen (Wit → volgende band) | **3 maanden** (configureerbaar) | `Member.joinDate` |
| Opvolgend examen | **6 maanden** (configureerbaar) | Datum laatste geslaagd examen (`ExamAttempt.examDate`) |
| Geen joinDate én geen examens | **Niet berekenbaar** | — |
| Lid heeft hoogste band (ZWART_10) | **Geen volgende examen** | — |

### 2.2 Configuratie-variabelen

```env
# Minimum maanden tussen examens (opvolgend)
EXAM_MIN_MONTHS_BETWEEN=6

# Minimum maanden sinds lidmaatschap voor eerste examen
EXAM_MIN_MONTHS_FIRST=3
```

### 2.3 Kernfunctie: `calculateExamReadiness`

```typescript
// src/lib/exam-readiness.ts

import { db } from '@/lib/db'
import type { Member, ExamAttempt, BeltLevel } from '@prisma/client'
import { BELT_ORDER, nextBelt } from '@/lib/student-progress-types'

// Configuratie ophalen
const MIN_MONTHS_BETWEEN = parseInt(process.env.EXAM_MIN_MONTHS_BETWEEN || '6', 10)
const MIN_MONTHS_FIRST = parseInt(process.env.EXAM_MIN_MONTHS_FIRST || '3', 10)

export interface ExamReadiness {
  memberId: string
  userId: string
  firstName: string
  lastName: string
  location: string | null

  // Huidige status
  currentBelt: BeltLevel | null
  currentBeltLabel: string

  // Volgende examen
  nextBelt: BeltLevel | null
  nextBeltLabel: string

  // Berekening
  isReady: boolean
  readyFrom: Date | null        // Datum vanaf wanneer examen mag
  lastExamDate: Date | null     // Datum laatste geslaagde examen
  daysUntilReady: number | null // Negatief = al klaar, 0 = vandaag, positief = nog wachten
  daysSinceLastExam: number | null

  // Context
  joinDate: Date
  isFirstExam: boolean          // true als geen geslaagde examens
  hasScheduledExam: boolean     // true als al een SCHEDULED examen bestaat
  scheduledExamDate: Date | null
}

/**
 * Berekent examenklaarheid voor één lid.
 *
 * Logica:
 * 1. Zoek laatste geslaagde ExamAttempt (COMPLETED_PASSED)
 * 2. Bepaal referenceDate:
 *    - Als er een geslaagd examen is: examDate van dat examen
 *    - Anders: joinDate van het lid
 * 3. Bereken readyFrom = referenceDate + minMonths
 * 4. Vergelijk met nu → isReady
 * 5. Bepaal nextBelt via BELT_ORDER
 */
export async function calculateExamReadiness(member: Member): Promise<ExamReadiness | null> {
  // Haal examens op
  const examAttempts = await db.examAttempt.findMany({
    where: { memberId: member.id },
    orderBy: { examDate: 'desc' },
  })

  // Laatste geslaagde examen
  const lastPassedExam = examAttempts.find(
    (e) => e.status === 'COMPLETED_PASSED' && e.examDate
  )

  // Gepland examen (nog niet afgerond)
  const scheduledExam = examAttempts.find(
    (e) => e.status === 'SCHEDULED'
  )

  // Huidige band
  const currentBelt = member.currentBelt

  // Bepaal volgende band
  const next = currentBelt ? nextBelt(currentBelt) : null

  // Als er geen volgende band meer is (ZWART_10), geen examen mogelijk
  if (next === null) {
    return {
      memberId: member.id,
      userId: member.userId,
      firstName: member.firstName,
      lastName: member.lastName,
      location: member.location,
      currentBelt,
      currentBeltLabel: beltLabelDutch(currentBelt),
      nextBelt: null,
      nextBeltLabel: '—',
      isReady: false,
      readyFrom: null,
      lastExamDate: lastPassedExam?.examDate ?? null,
      daysUntilReady: null,
      daysSinceLastExam: lastPassedExam?.examDate
        ? daysBetween(lastPassedExam.examDate, new Date())
        : null,
      joinDate: member.joinDate,
      isFirstExam: !lastPassedExam,
      hasScheduledExam: !!scheduledExam,
      scheduledExamDate: scheduledExam?.examDate ?? null,
    }
  }

  // Bepaal referentiedatum en minimum wachttijd
  const isFirstExam = !lastPassedExam
  const referenceDate = lastPassedExam?.examDate ?? member.joinDate
  const minMonths = isFirstExam ? MIN_MONTHS_FIRST : MIN_MONTHS_BETWEEN

  // Bereken readyFrom
  const readyFrom = addMonths(referenceDate, minMonths)
  const now = new Date()
  const isReady = now >= readyFrom

  // Dagen tot examen mag (negatief = al klaar)
  const daysUntilReady = daysBetween(readyFrom, now)

  return {
    memberId: member.id,
    userId: member.userId,
    firstName: member.firstName,
    lastName: member.lastName,
    location: member.location,
    currentBelt,
    currentBeltLabel: beltLabelDutch(currentBelt),
    nextBelt: next!,
    nextBeltLabel: beltLabelDutch(next!),
    isReady,
    readyFrom,
    lastExamDate: lastPassedExam?.examDate ?? null,
    daysUntilReady,
    daysSinceLastExam: lastPassedExam?.examDate
      ? daysBetween(lastPassedExam.examDate, new Date())
      : null,
    joinDate: member.joinDate,
    isFirstExam,
    hasScheduledExam: !!scheduledExam,
    scheduledExamDate: scheduledExam?.examDate ?? null,
  }
}

/**
 * Berekent examenklaarheid voor alle actieve leden.
 * Ideaal voor de API endpoint.
 */
export async function calculateAllExamReadiness(): Promise<ExamReadiness[]> {
  const members = await db.member.findMany({
    where: { isActive: true },
    select: {
      id: true,
      userId: true,
      firstName: true,
      lastName: true,
      currentBelt: true,
      location: true,
      joinDate: true,
    },
    orderBy: { lastName: 'asc' },
  })

  const results: ExamReadiness[] = []
  for (const member of members) {
    const readiness = await calculateExamReadiness(member as Member)
    if (readiness) results.push(readiness)
  }
  return results
}

// ============================================================================
// Helper functies
// ============================================================================

/**
 * Voegt maanden toe aan een datum.
 * Bijv. addMonths(new Date('2025-01-15'), 6) → new Date('2025-07-15')
 */
function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

/**
 * Berekent aantal dagen tussen twee datums.
 * Positief = endDate is in het verleden t.o.v. startDate.
 */
function daysBetween(start: Date, end: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.round((end.getTime() - start.getTime()) / msPerDay)
}

/**
 * Nederlandse label voor een band.
 * Gebruikt BELT_LABELS_NL uit student-progress-types.
 */
function beltLabelDutch(belt: BeltLevel | null): string {
  if (!belt) return 'Geen band'
  const labels: Record<string, string> = {
    WIT: 'Wit', WIT_GEEL: 'Wit+Geel', GEEL: 'Geel', GEEL_ORANJE: 'Geel+Oranje',
    ORANJE: 'Oranje', ORANJE_GROEN: 'Oranje+Groen', GROEN: 'Groen', GROEN_BLAUW: 'Groen+Blauw',
    BLAUW: 'Blauw', BLAUW_BRUIN: 'Blauw+Bruin', BRUIN: 'Bruin',
    ZWART_1: 'Zwart 1e Dan', ZWART_2: 'Zwart 2e Dan', ZWART_3: 'Zwart 3e Dan',
    ZWART_4: 'Zwart 4e Dan', ZWART_5: 'Zwart 5e Dan', ZWART_6: 'Zwart 6e Dan',
    ZWART_7: 'Zwart 7e Dan', ZWART_8: 'Zwart 8e Dan', ZWART_9: 'Zwart 9e Dan',
    ZWART_10: 'Zwart 10e Dan',
    BRUIN_1: 'Bruin 1e Ke', BRUIN_2: 'Bruin 2e Ke', BRUIN_3: 'Bruin 3e Ke',
    Zwart_1: 'Zwart 1e Dan', Zwart_2: 'Zwart 2e Dan', Zwart_3: 'Zwart 3e Dan',
  }
  return labels[belt] || belt
}
```

### 2.4 Voorbeelden

| Lid | joinDate | Laatste examen | Nu | Berekening | Resultaat |
|-----|----------|----------------|-----|-----------|-----------|
| Jan | 2025-06-01 | Geen | 2026-06-19 | 2025-06-01 + 3m = 2025-09-01 | ✅ Klaar (261 dagen klaar) |
| Lisa | 2026-04-01 | Geen | 2026-06-19 | 2026-04-01 + 3m = 2026-07-01 | ⏳ 12 dagen wachten |
| Pieter | 2025-01-10 | 2025-09-15 (GEEL) | 2026-06-19 | 2025-09-15 + 6m = 2026-03-15 | ✅ Klaar (96 dagen klaar) |
| Sophie | 2025-01-10 | 2026-02-20 (ORANJE) | 2026-06-19 | 2026-02-20 + 6m = 2026-08-20 | ⏳ 62 dagen wachten |

---

## 3. API Endpoints

### 3.1 `GET /api/admin/band-overzicht`

**Doel:** Haal examenklaarheid op voor alle (of gefilterde) leden.

**Query parameters:**
| Parameter | Type | Verplicht | Standaard | Beschrijving |
|-----------|------|-----------|-----------|-------------|
| `location` | string | Nee | `""` | `STeenbergen`, `OUD_VOSSEMEER`, of `""` (alle) |
| `belt` | string | Nee | `""` | `BeltLevel` enum waarde, of `""` (alle) |
| `status` | string | Nee | `""` | `ready`, `waiting`, `scheduled`, of `""` (alle) |
| `search` | string | Nee | `""` | Zoek op naam |

**Auth:** Vereist `ADMIN` rol (via `isAdmin()` check).

**Response:**
```typescript
interface BandOverzichtResponse {
  members: ExamReadiness[]
  summary: {
    total: number
    ready: number
    waiting: number
    scheduled: number
    noNextBelt: number
  }
  filters: {
    location: string
    belt: string
    status: string
    search: string
  }
}
```

**Bestand:** `src/app/api/admin/band-overzicht/route.ts`

```typescript
// src/app/api/admin/band-overzicht/route.ts

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'
import type { BeltLevel } from '@prisma/client'
import { calculateExamReadiness } from '@/lib/exam-readiness'
import type { ExamReadiness } from '@/lib/exam-readiness'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const admin = await isAdmin()
  if (!admin) return NextResponse.json({ error: 'Niet gemachtigd' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const locationFilter = searchParams.get('location') || ''
  const beltFilter = searchParams.get('belt') || ''
  const statusFilter = searchParams.get('status') || ''
  const searchQuery = searchParams.get('search') || ''

  // Bouw where-clausule
  const where: any = { isActive: true }
  if (locationFilter) where.location = locationFilter
  if (beltFilter) where.currentBelt = beltFilter as BeltLevel
  if (searchQuery) {
    where.OR = [
      { firstName: { contains: searchQuery, mode: 'insensitive' } },
      { lastName: { contains: searchQuery, mode: 'insensitive' } },
    ]
  }

  // Haal leden op
  const members = await db.member.findMany({
    where,
    orderBy: { lastName: 'asc' },
  })

  // Bereken examenklaarheid per lid
  const readinessList: ExamReadiness[] = []
  for (const member of members) {
    const readiness = await calculateExamReadiness(member)
    if (readiness) readinessList.push(readiness)
  }

  // Filter op status (client-side filter na berekening)
  let filtered = readinessList
  if (statusFilter === 'ready') {
    filtered = readinessList.filter((r) => r.isReady && r.nextBelt !== null)
  } else if (statusFilter === 'waiting') {
    filtered = readinessList.filter((r) => !r.isReady && r.nextBelt !== null)
  } else if (statusFilter === 'scheduled') {
    filtered = readinessList.filter((r) => r.hasScheduledExam)
  }

  // Samenvatting
  const summary = {
    total: readinessList.length,
    ready: readinessList.filter((r) => r.isReady && r.nextBelt !== null).length,
    waiting: readinessList.filter((r) => !r.isReady && r.nextBelt !== null).length,
    scheduled: readinessList.filter((r) => r.hasScheduledExam).length,
    noNextBelt: readinessList.filter((r) => r.nextBelt === null).length,
  }

  return NextResponse.json({
    members: filtered,
    summary,
    filters: {
      location: locationFilter,
      belt: beltFilter,
      status: statusFilter,
      search: searchQuery,
    },
  })
}
```

### 3.2 `GET /api/admin/band-overzicht/stats`

**Doel:** Samenvattende statistieken per locatie voor de dashboard widget en de "Per locatie" sectie.

**Auth:** Vereist `ADMIN` rol.

**Response:**
```typescript
interface BandOverzichtStatsResponse {
  overall: {
    total: number
    ready: number
    waiting: number
  }
  perLocation: {
    location: string
    locationLabel: string
    total: number
    ready: number
    waiting: number
    readySoon: number       // Binnen 30 dagen klaar
  }[]
  perBelt: {
    belt: string
    beltLabel: string
    ready: number
    waiting: number
  }[]
}
```

**Bestand:** `src/app/api/admin/band-overzicht/stats/route.ts`

```typescript
// src/app/api/admin/band-overzicht/stats/route.ts

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'
import { calculateExamReadiness } from '@/lib/exam-readiness'
import { LOCATION_LABELS_NL } from '@/lib/student-progress-types'

export const dynamic = 'force-dynamic'

export async function GET() {
  const admin = await isAdmin()
  if (!admin) return NextResponse.json({ error: 'Niet gemachtigd' }, { status: 401 })

  const members = await db.member.findMany({
    where: { isActive: true },
  })

  const readinessList = []
  for (const member of members) {
    const readiness = await calculateExamReadiness(member)
    if (readiness) readinessList.push(readiness)
  }

  // Per locatie
  const locations = [...new Set(readinessList.map((r) => r.location).filter(Boolean))]
  const perLocation = locations.map((loc) => {
    const locMembers = readinessList.filter((r) => r.location === loc)
    const ready = locMembers.filter((r) => r.isReady && r.nextBelt !== null)
    const readySoon = locMembers.filter(
      (r) => !r.isReady && r.daysUntilReady !== null && r.daysUntilReady <= 30
    )
    return {
      location: loc!,
      locationLabel: LOCATION_LABELS_NL[loc as keyof typeof LOCATION_LABELS_NL] || loc!,
      total: locMembers.length,
      ready: ready.length,
      waiting: locMembers.length - ready.length,
      readySoon: readySoon.length,
    }
  })

  // Per band
  const belts = [...new Set(readinessList.map((r) => r.currentBelt).filter(Boolean))]
  const perBelt = belts.map((belt) => {
    const beltMembers = readinessList.filter((r) => r.currentBelt === belt)
    const ready = beltMembers.filter((r) => r.isReady && r.nextBelt !== null)
    return {
      belt: belt!,
      beltLabel: beltLabelDutch(belt!),
      ready: ready.length,
      waiting: beltMembers.length - ready.length,
    }
  })

  const overall = {
    total: readinessList.length,
    ready: readinessList.filter((r) => r.isReady && r.nextBelt !== null).length,
    waiting: readinessList.filter((r) => !r.isReady && r.nextBelt !== null).length,
  }

  return NextResponse.json({ overall, perLocation, perBelt })
}
```

---

## 4. Admin Pagina

### 4.1 `/admin/bandoverzicht`

**Bestand:** `src/app/admin/bandoverzicht/page.tsx`

**Layout:** Server component met client-side interactieve filters.

#### Pagina-indeling

```
┌─────────────────────────────────────────────────────────────────────┐
│  🥋 Bandexamen Overzicht                                            │
│  Overzicht van examenklaarheid per lid                              │
├─────────────────────────────────────────────────────────────────────┤
│  [Filters]                                                          │
│  Zoeken: [________]  Locatie: [Alle ▼]  Band: [Alle ▼]  Status: [Alle ▼]│
├─────────────────────────────────────────────────────────────────────┤
│  [Samenvatting — 4 stat-kaarten in rij]                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │ ✅ Klaar  │ │ ⏳ Wachten│ │ 📋 Gepland│ │ 👥 Totaal │              │
│  │    12     │ │    18    │ │    3     │ │    33    │              │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘              │
├─────────────────────────────────────────────────────────────────────┤
│  ✅ Klaar voor examen (12 leden)                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Jan de Vries  │ Wit → Wit+Geel │ Lid sinds: 01-06-2025      │  │
│  │               │ Kan vanaf: 01-09-2025 (261 dagen klaar)     │  │
│  │               │ [Bekijk lid] [Examen plannen]               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Pieter Jansen │ Geel → Geel+Oranje │ Laatste: 15-09-2025    │  │
│  │               │ Kan vanaf: 15-03-2026 (96 dagen klaar)      │  │
│  │               │ [Bekijk lid] [Examen plannen]               │  │
│  └──────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│  ⏳ Nog te kort wachten (18 leden)                                  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Lisa Bakker   │ Wit → Wit+Geel │ Lid sinds: 01-04-2026      │  │
│  │               │ Kan vanaf: 01-07-2026 (nog 12 dagen)        │  │
│  │               │ ████████████████████░░░░░░░░░ 78%           │  │
│  │               │ [Bekijk lid]                                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Sophie Visser │ Oranje → Oranje+Groen │ Laatste: 20-02-2026  │  │
│  │               │ Kan vanaf: 20-08-2026 (nog 62 dagen)        │  │
│  │               │ ██████████████████░░░░░░░░░░░░░░░ 57%       │  │
│  │               │ [Bekijk lid]                                │  │
│  └──────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│  📍 Per locatie                                                     │
│  ┌──────────────────────┐  ┌──────────────────────┐               │
│  │ 📍 Steenbergen        │  │ 📍 Oud-Vossemeer      │               │
│  │ 👥 20 leden           │  │ 👥 13 leden           │               │
│  │ ✅ 8 klaar            │  │ ✅ 4 klaar            │               │
│  │ ⏳ 12 wachten         │  │ ⏳ 9 wachten           │               │
│  │ 📋 2 gepland          │  │ 📋 1 gepland          │               │
│  │ [Bekijk locatie →]    │  │ [Bekijk locatie →]    │               │
│  └──────────────────────┘  └──────────────────────┘               │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Pagina-implementatie (server component)

```typescript
// src/app/admin/bandoverzicht/page.tsx

import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { calculateExamReadiness } from '@/lib/exam-readiness'
import { BandOverzichtFilters } from '@/components/admin/band-overzicht/Filters'
import { BandOverzichtSummary } from '@/components/admin/band-overzicht/Summary'
import { MemberReadinessCard } from '@/components/admin/band-overzicht/MemberReadinessCard'
import { LocationSummary } from '@/components/admin/band-overzicht/LocationSummary'
import { BELT_LABELS_NL, TRAINING_LOCATIONS } from '@/lib/student-progress-types'
import type { BeltLevel } from '@prisma/client'

export const dynamic = 'force-dynamic'

export default async function BandOverzichtPage({
  searchParams,
}: {
  searchParams?: Promise<{
    location?: string
    belt?: string
    status?: string
    search?: string
  }>
}) {
  const admin = await isAdmin()
  if (!admin) redirect('/admin-login')

  const params = await searchParams
  const locationFilter = params?.location || ''
  const beltFilter = params?.belt || ''
  const statusFilter = params?.status || ''
  const searchQuery = params?.search || ''

  // Bouw where-clausule
  const where: any = { isActive: true }
  if (locationFilter) where.location = locationFilter
  if (beltFilter) where.currentBelt = beltFilter as BeltLevel
  if (searchQuery) {
    where.OR = [
      { firstName: { contains: searchQuery, mode: 'insensitive' } },
      { lastName: { contains: searchQuery, mode: 'insensitive' } },
    ]
  }

  // Haal leden op
  const members = await db.member.findMany({
    where,
    orderBy: { lastName: 'asc' },
  })

  // Bereken examenklaarheid
  const readinessList = []
  for (const member of members) {
    const readiness = await calculateExamReadiness(member)
    if (readiness) readinessList.push(readiness)
  }

  // Filter op status
  let readyMembers: typeof readinessList = []
  let waitingMembers: typeof readinessList = []
  let allFiltered = readinessList

  if (statusFilter === 'ready') {
    allFiltered = readinessList.filter((r) => r.isReady && r.nextBelt !== null)
    readyMembers = allFiltered
  } else if (statusFilter === 'waiting') {
    allFiltered = readinessList.filter((r) => !r.isReady && r.nextBelt !== null)
    waitingMembers = allFiltered
  } else if (statusFilter === 'scheduled') {
    allFiltered = readinessList.filter((r) => r.hasScheduledExam)
  } else {
    // Geen status filter — split in twee secties
    readyMembers = readinessList.filter((r) => r.isReady && r.nextBelt !== null)
    waitingMembers = readinessList.filter((r) => !r.isReady && r.nextBelt !== null)
  }

  // Samenvattingsdata
  const summary = {
    total: readinessList.length,
    ready: readinessList.filter((r) => r.isReady && r.nextBelt !== null).length,
    waiting: readinessList.filter((r) => !r.isReady && r.nextBelt !== null).length,
    scheduled: readinessList.filter((r) => r.hasScheduledExam).length,
    noNextBelt: readinessList.filter((r) => r.nextBelt === null).length,
  }

  // Per locatie data
  const locations = [...new Set(readinessList.map((r) => r.location).filter(Boolean))]
  const locationData = locations.map((loc) => {
    const locMembers = readinessList.filter((r) => r.location === loc)
    return {
      location: loc!,
      total: locMembers.length,
      ready: locMembers.filter((r) => r.isReady && r.nextBelt !== null).length,
      waiting: locMembers.filter((r) => !r.isReady && r.nextBelt !== null).length,
      scheduled: locMembers.filter((r) => r.hasScheduledExam).length,
    }
  })

  // Unieke banden voor filter dropdown
  const uniqueBelts = [...new Set(members.map((m) => m.currentBelt).filter(Boolean))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2a2a2a]">🥋 Bandexamen Overzicht</h1>
          <p className="text-sm text-gray-500 mt-1">
            Overzicht van examenklaarheid per lid
          </p>
        </div>
      </div>

      {/* Filters */}
      <BandOverzichtFilters
        currentLocation={locationFilter}
        currentBelt={beltFilter}
        currentStatus={statusFilter}
        currentSearch={searchQuery}
        uniqueBelts={uniqueBelts as BeltLevel[]}
      />

      {/* Samenvatting */}
      <BandOverzichtSummary summary={summary} />

      {/* Klaar voor examen */}
      {(readyMembers.length > 0 || statusFilter === '') && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-green-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-sm">✓</span>
            Klaar voor examen ({readyMembers.length} leden)
          </h2>
          <div className="space-y-3">
            {readyMembers.map((readiness) => (
              <MemberReadinessCard key={readiness.memberId} readiness={readiness} />
            ))}
          </div>
        </section>
      )}

      {/* Nog te kort wachten */}
      {(waitingMembers.length > 0 || statusFilter === '') && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-yellow-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100 text-sm">⏳</span>
            Nog te kort wachten ({waitingMembers.length} leden)
          </h2>
          <div className="space-y-3">
            {waitingMembers.map((readiness) => (
              <MemberReadinessCard key={readiness.memberId} readiness={readiness} />
            ))}
          </div>
        </section>
      )}

      {/* Geplande examens */}
      {statusFilter === 'scheduled' && allFiltered.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
          <p className="text-lg font-medium text-gray-400">Geen geplande examens</p>
        </div>
      )}

      {/* Geen resultaten */}
      {statusFilter !== '' && allFiltered.length === 0 && statusFilter !== 'scheduled' && (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
          <p className="text-lg font-medium text-gray-400">Geen leden gevonden met deze filters</p>
          <p className="mt-1 text-sm text-gray-400">Probeer andere filters</p>
        </div>
      )}

      {/* Per locatie overzicht */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-[#2a2a2a]">📍 Per locatie</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {locationData.map((loc) => (
            <LocationSummary key={loc.location} location={loc} />
          ))}
          {locationData.length === 0 && (
            <p className="text-center text-sm text-gray-400">
              Geen locaties gevonden
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
```

---

## 5. Component Architectuur

### 5.1 Component-overzicht

```
src/components/admin/band-overzicht/
├── Filters.tsx              ← Filterbalk (zoeken + dropdowns)
├── Summary.tsx              ← 4 stat-kaarten (Klaar, Wachten, Gepland, Totaal)
├── MemberReadinessCard.tsx  ← Kaart per lid met examenklaarheid
├── LocationSummary.tsx      ← Kaart per locatie
└── ReadinessProgressBar.tsx ← Voortgangsbaar "dagen tot examen"
```

### 5.2 `Filters.tsx`

**Bestand:** `src/components/admin/band-overzicht/Filters.tsx`

**Type:** Client component (`"use client"`)

**Functie:**
- Zoekveld voor naam
- Dropdown locatie (Alle / Steenbergen / Oud-Vossemeer)
- Dropdown band (Alle + unieke banden uit DB)
- Dropdown status (Alle / Klaar / Wachten / Gepland)
- Filter wordt toegepast via URL search params (next/link of router.push)

```typescript
// src/components/admin/band-overzicht/Filters.tsx

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import { BELT_LABELS_NL, TRAINING_LOCATIONS } from '@/lib/student-progress-types'
import type { BeltLevel } from '@prisma/client'

interface FiltersProps {
  currentLocation: string
  currentBelt: string
  currentStatus: string
  currentSearch: string
  uniqueBelts: BeltLevel[]
}

export function BandOverzichtFilters({
  currentLocation,
  currentBelt,
  currentStatus,
  currentSearch,
  uniqueBelts,
}: FiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateSearchParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      }
      router.push(`/admin/bandoverzicht?${params.toString()}`)
    },
    [router, searchParams]
  )

  // Debounced search
  const handleSearch = useDebouncedCallback((value: string) => {
    updateSearchParams({ search: value })
  }, 300)

  return (
    <form className="flex flex-col gap-3 sm:flex-row">
      {/* Zoekveld */}
      <div className="relative flex-1">
        <svg /* search icon */ />
        <input
          type="search"
          defaultValue={currentSearch}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Zoek op naam..."
          className="w-full rounded-md border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
        />
      </div>

      {/* Locatie dropdown */}
      <select
        value={currentLocation}
        onChange={(e) => updateSearchParams({ location: e.target.value })}
        className="rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none"
      >
        <option value="">Alle locaties</option>
        {TRAINING_LOCATIONS.map((loc) => (
          <option key={loc.value} value={loc.value}>{loc.label}</option>
        ))}
      </select>

      {/* Band dropdown */}
      <select
        value={currentBelt}
        onChange={(e) => updateSearchParams({ belt: e.target.value })}
        className="rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none"
      >
        <option value="">Alle banden</option>
        {uniqueBelts.map((belt) => (
          <option key={belt} value={belt}>{BELT_LABELS_NL[belt] || belt}</option>
        ))}
      </select>

      {/* Status dropdown */}
      <select
        value={currentStatus}
        onChange={(e) => updateSearchParams({ status: e.target.value })}
        className="rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none"
      >
        <option value="">Alle statussen</option>
        <option value="ready">✅ Klaar voor examen</option>
        <option value="waiting">⏳ Nog wachten</option>
        <option value="scheduled">📋 Gepland examen</option>
      </select>
    </form>
  )
}
```

### 5.3 `Summary.tsx`

**Bestand:** `src/components/admin/band-overzicht/Summary.tsx`

**Type:** Server component

**Functie:** Toont 4 stat-kaarten in een grid.

```typescript
// src/components/admin/band-overzicht/Summary.tsx

interface SummaryData {
  total: number
  ready: number
  waiting: number
  scheduled: number
  noNextBelt: number
}

interface SummaryProps {
  summary: SummaryData
}

export function BandOverzichtSummary({ summary }: SummaryProps) {
  const cards = [
    {
      title: 'Klaar voor examen',
      value: summary.ready,
      icon: '✅',
      color: 'text-green-700',
      bg: 'bg-green-50',
      border: 'border-green-200',
      subtitle: 'Kunnen examen doen',
    },
    {
      title: 'Nog wachten',
      value: summary.waiting,
      icon: '⏳',
      color: 'text-yellow-700',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      subtitle: `${summary.waiting > 0 ? 'Moeten nog wachten' : '—'}`,
    },
    {
      title: 'Gepland examen',
      value: summary.scheduled,
      icon: '📋',
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      subtitle: 'Al een datum ingepland',
    },
    {
      title: 'Totaal',
      value: summary.total,
      icon: '👥',
      color: 'text-[#2a2a2a]',
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      subtitle: `${summary.noNextBelt > 0 ? `${summary.noNextBelt} hebben hoogste band` : 'Actieve leden'}`,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map((card) => (
        <div key={card.title} className={`rounded-lg border ${card.border} ${card.bg} p-4 shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">{card.title}</p>
              <p className={`mt-1 text-3xl font-bold ${card.color}`}>{card.value}</p>
              <p className="mt-1 text-xs text-gray-400">{card.subtitle}</p>
            </div>
            <span className="text-2xl opacity-60">{card.icon}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
```

### 5.4 `MemberReadinessCard.tsx`

**Bestand:** `src/components/admin/band-overzicht/MemberReadinessCard.tsx`

**Type:** Server component

**Functie:** Toont een kaart per lid met:
- Naam + avatar
- Huidige band → Volgende band (met kleurbadges)
- Laatste examen datum of lidmaatschapsdatum
- "Kan examen doen vanaf" datum
- Dagen tot/naar klaar (met voortgangsbaar voor wachtende leden)
- Links: "Bekijk lid" → `/admin/students/[id]`, "Examen plannen" → `/admin/exams/new?memberId=...`

```typescript
// src/components/admin/band-overzicht/MemberReadinessCard.tsx

import Link from 'next/link'
import { BELT_COLORS, BELT_LABELS_NL } from '@/lib/student-progress-types'
import type { BeltLevel } from '@prisma/client'
import type { ExamReadiness } from '@/lib/exam-readiness'
import { ReadinessProgressBar } from './ReadinessProgressBar'

interface MemberReadinessCardProps {
  readiness: ExamReadiness
}

export function MemberReadinessCard({ readiness }: MemberReadinessCardProps) {
  const isReady = readiness.isReady && readiness.nextBelt !== null
  const borderColor = isReady ? 'border-green-200' : 'border-yellow-200'
  const bgAccent = isReady ? 'bg-green-50/50' : 'bg-yellow-50/50'

  const formatDate = (date: Date | null) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <div className={`rounded-lg border ${borderColor} bg-white p-5 shadow-sm transition-colors hover:border-[#a90000]/30`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Linkerkant: Naam + band info */}
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
            isReady ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {readiness.firstName?.[0]}{readiness.lastName?.[0]}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[#2a2a2a]">
                {readiness.firstName} {readiness.lastName}
              </h3>
              {readiness.hasScheduledExam && (
                <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  📋 Gepland
                </span>
              )}
            </div>

            {/* Band progressie */}
            <div className="mt-1.5 flex items-center gap-2">
              {/* Huidige band */}
              <span
                className="inline-flex h-4 w-4 rounded-full border border-gray-300"
                style={{ backgroundColor: BELT_COLORS[readiness.currentBelt as BeltLevel] || '#ccc' }}
              />
              <span className="text-xs font-medium text-gray-600">
                {readiness.currentBeltLabel}
              </span>

              {/* Pijl */}
              <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>

              {/* Volgende band */}
              {readiness.nextBelt ? (
                <>
                  <span
                    className="inline-flex h-4 w-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: BELT_COLORS[readiness.nextBelt as BeltLevel] || '#ccc' }}
                  />
                  <span className="text-xs font-medium text-gray-600">
                    {readiness.nextBeltLabel}
                  </span>
                </>
              ) : (
                <span className="text-xs text-gray-400">Hoogste band bereikt</span>
              )}
            </div>

            {/* Datum info */}
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
              {readiness.lastExamDate ? (
                <span>Laatste examen: {formatDate(readiness.lastExamDate)}</span>
              ) : (
                <span>Eerste examen — lid sinds {formatDate(readiness.joinDate)}</span>
              )}
              {readiness.location && (
                <span className="text-blue-600">📍 {readiness.location === 'STeenbergen' ? 'Steenbergen' : 'Oud-Vossemeer'}</span>
              )}
            </div>
          </div>
        </div>

        {/* Rechterkant: Klaar-status + acties */}
        <div className="flex flex-col items-end gap-3">
          {/* Klaar/wachten badge */}
          {readiness.nextBelt && (
            <>
              <div className="text-right">
                <p className="text-xs text-gray-500">Kan examen doen vanaf:</p>
                <p className={`text-sm font-bold ${
                  isReady ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {formatDate(readiness.readyFrom)}
                </p>
              </div>

              {/* Dagen info */}
              {readiness.daysUntilReady !== null && (
                <div>
                  {isReady ? (
                    <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                      ✅ Al {Math.abs(readiness.daysUntilReady)} dagen klaar
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                      ⏳ Nog {readiness.daysUntilReady} dagen
                    </span>
                  )}
                </div>
              )}

              {/* Voortgangsbaar voor wachtende leden */}
              {!isReady && readiness.readyFrom && (
                <ReadinessProgressBar
                  startDate={readiness.lastExamDate ?? readiness.joinDate}
                  targetDate={readiness.readyFrom}
                  minMonths={readiness.isFirstExam ? 3 : 6}
                />
              )}
            </>
          )}

          {/* Actieknoppen */}
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/students/${readiness.memberId}`}
              className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              Bekijk lid →
            </Link>
            {isReady && (
              <Link
                href={`/admin/exams/new?memberId=${readiness.memberId}`}
                className="rounded-md bg-[#a90000] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#8c0000]"
              >
                Examen plannen
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

### 5.5 `ReadinessProgressBar.tsx`

**Bestand:** `src/components/admin/band-overzicht/ReadinessProgressBar.tsx`

**Type:** Server component

**Functie:** Visuele voortgangsbaar die toont hoe ver een lid is in de wachttijd.

```typescript
// src/components/admin/band-overzicht/ReadinessProgressBar.tsx

import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

interface ReadinessProgressBarProps {
  startDate: Date
  targetDate: Date
  minMonths: number
}

export function ReadinessProgressBar({ startDate, targetDate, minMonths }: ReadinessProgressBarProps) {
  const now = new Date()
  const totalMs = targetDate.getTime() - startDate.getTime()
  const elapsedMs = now.getTime() - startDate.getTime()
  const progress = Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100))

  return (
    <div className="mt-2 w-full max-w-[200px]">
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{format(startDate, 'dd-MM', { locale: nl })}</span>
        <span>{Math.round(progress)}%</span>
        <span>{format(targetDate, 'dd-MM', { locale: nl })}</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full bg-yellow-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
```

### 5.6 `LocationSummary.tsx`

**Bestand:** `src/components/admin/band-overzicht/LocationSummary.tsx`

**Type:** Server component

**Functie:** Kaart per locatie met samenvattende cijfers.

```typescript
// src/components/admin/band-overzicht/LocationSummary.tsx

import Link from 'next/link'

interface LocationData {
  location: string
  total: number
  ready: number
  waiting: number
  scheduled: number
}

interface LocationSummaryProps {
  location: LocationData
}

export function LocationSummary({ location }: LocationSummaryProps) {
  const label = location.location === 'STeenbergen' ? 'Steenbergen' : 'Oud-Vossemeer'

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">📍 {label}</p>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-600">
              👥 <span className="font-semibold">{location.total}</span> leden
            </p>
            <p className="text-sm text-green-600">
              ✅ <span className="font-semibold">{location.ready}</span> klaar voor examen
            </p>
            <p className="text-sm text-yellow-600">
              ⏳ <span className="font-semibold">{location.waiting}</span> nog wachten
            </p>
            {location.scheduled > 0 && (
              <p className="text-sm text-blue-600">
                📋 <span className="font-semibold">{location.scheduled}</span> gepland
              </p>
            )}
          </div>
        </div>
        <Link
          href={`/admin/bandoverzicht?location=${location.location}`}
          className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
        >
          Bekijk →
        </Link>
      </div>
    </div>
  )
}
```

---

## 6. Dashboard Widget

### 6.1 Waar te plaatsen

Op de admin dashboard pagina (`/admin/page.tsx`), in de bestaande stat-kaarten rij:

```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐
│ 👥       │ │ 🎯       │ │ 🏆       │ │ 📊       │ │ ✅ Klaar examen │
│ Studenten│ │ Examens  │ │ Diploma's│ │ Slagings%│ │    12           │
│  33      │ │  47      │ │  42      │ │  91%     │ │ [Bekijk →]     │
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────────────┘
```

### 6.2 Implementatie

Voeg een **5e stat-kaart** toe aan de bestaande grid in `src/app/admin/page.tsx`:

```typescript
// In src/app/admin/page.tsx — voeg toe na de bestaande queries:

const examReadinessCount = await db.member.count({
  where: { isActive: true },
})
// Bereken exact aantal "klaar" — zie onderstaande aanpak

// ... bestaande grid ...

// NIEUWE 5e kaart:
<StatCard
  title="Klaar voor examen"
  value={readyCount}
  icon="✅"
  href="/admin/bandoverzicht"
  subtitle="Kunnen examen doen"
  accent="green"
/>
```

**Let op:** Het exacte aantal "klaar" leden vereist de berekeningslogica. Om dit efficiënt te houden:

**Optie A (aanbevolen):** Roep de `calculateExamReadiness` functie aan in de dashboard page en tel het aantal `isReady: true`. Dit is acceptabel omdat het slechts een paar honderd leden betreft.

**Optie B (prestatie-optimalisatie):** Cache de resultaat in een server-side variable of database veld dat bijgewerkt wordt via een cron job (bijv. dagelijks).

```typescript
// In src/app/admin/page.tsx:

import { calculateExamReadiness } from '@/lib/exam-readiness'

// In de component:
const members = await db.member.findMany({
  where: { isActive: true },
})

let readyCount = 0
for (const member of members) {
  const readiness = await calculateExamReadiness(member)
  if (readiness?.isReady && readiness.nextBelt !== null) {
    readyCount++
  }
}
```

### 6.3 Sidebar navigatie

Voeg een nieuwe link toe aan de admin sidebar (`src/app/admin/layout.tsx`):

```typescript
<AdminLink href="/admin/bandoverzicht" icon="🥋" label="Bandoverzicht" />
```

Plaats deze tussen "Examens" en "Voortgang":

```
📊 Overzicht
👥 Studenten
🎯 Examens
🥋 Bandoverzicht     ← NIEUW
📈 Voortgang
🏆 Diploma's
🔍 Diploma Verifiëren
```

---

## 7. Configuratie

### 7.1 Omgevingsvariabelen

Voeg toe aan `.env` (of `.env.local`):

```env
# ============================================================================
# Bandexamen configuratie
# ============================================================================

# Minimum aantal maanden tussen opvolgende examens
EXAM_MIN_MONTHS_BETWEEN=6

# Minimum aantal maanden sinds lidmaatschap voor eerste examen
EXAM_MIN_MONTHS_FIRST=3

# Aantal dagen vooruitkijken voor "binnenkort klaar" melding
EXAM_READY_SOON_DAYS=30
```

### 7.2 Type-safe config module

**Bestand:** `src/lib/exam-config.ts`

```typescript
// src/lib/exam-config.ts

/**
 * Configuratie voor bandexamen timing.
 * Waarden kunnen worden overschreven via omgevingsvariabelen.
 */
export const examConfig = {
  /** Minimum maanden tussen opvolgende examens (standaard: 6) */
  minMonthsBetween: parseInt(process.env.EXAM_MIN_MONTHS_BETWEEN || '6', 10),

  /** Minimum maanden sinds lidmaatschap voor eerste examen (standaard: 3) */
  minMonthsFirst: parseInt(process.env.EXAM_MIN_MONTHS_FIRST || '3', 10),

  /** Aantal dagen vooruitkijken voor "binnenkort klaar" (standaard: 30) */
  readySoonDays: parseInt(process.env.EXAM_READY_SOON_DAYS || '30', 10),
}

// Validatie
if (examConfig.minMonthsBetween < 1 || examConfig.minMonthsBetween > 24) {
  console.warn('EXAM_MIN_MONTHS_BETWEEN moet tussen 1 en 24 liggen, gebruik standaard 6')
}

if (examConfig.minMonthsFirst < 1 || examConfig.minMonthsFirst > 12) {
  console.warn('EXAM_MIN_MONTHS_FIRST moet tussen 1 en 12 liggen, gebruik standaard 3')
}
```

Deze config wordt geïmporteerd in `src/lib/exam-readiness.ts`:

```typescript
import { examConfig } from '@/lib/exam-config'

// Gebruik examConfig.minMonthsBetween in plaats van hardcoded waarden
const minMonths = isFirstExam ? examConfig.minMonthsFirst : examConfig.minMonthsBetween
```

---

## 8. Bestandsstructuur

### Nieuwe bestanden

```
/home/suffie/michigami-website/
├── src/
│   ├── lib/
│   │   ├── exam-readiness.ts              ← Kernlogica: calculateExamReadiness()
│   │   └── exam-config.ts                 ← Configuratie: min. maanden, etc.
│   │
│   ├── components/
│   │   └── admin/
│   │       └── band-overzicht/
│   │           ├── Filters.tsx             ← Filterbalk (client component)
│   │           ├── Summary.tsx             ← 4 stat-kaarten (server component)
│   │           ├── MemberReadinessCard.tsx ← Kaart per lid (server component)
│   │           ├── LocationSummary.tsx     ← Kaart per locatie (server component)
│   │           └── ReadinessProgressBar.tsx ← Voortgangsbaar (server component)
│   │
│   └── app/
│       ├── admin/
│       │   ├── layout.tsx                  ← ✏️ AANPASSEN: sidebar link toevoegen
│       │   ├── page.tsx                    ← ✏️ AANPASSEN: dashboard widget toevoegen
│       │   └── bandoverzicht/
│       │       └── page.tsx                ← NIEUW: hoofdpagina
│       │
│       └── api/
│           └── admin/
│               └── band-overzicht/
│                   ├── route.ts            ← NIEUW: GET /api/admin/band-overzicht
│                   └── stats/
│                       └── route.ts        ← NIEUW: GET /api/admin/band-overzicht/stats
│
├── .env.local                              ← ✏️ AANPASSEN: EXAM_* variabelen toevoegen
└── BANDOVERZICHT-PLAN.md                   ← Dit bestand
```

### Aangepaste bestanden

| Bestand | Wijziging |
|---------|-----------|
| `src/app/admin/layout.tsx` | Voeg `<AdminLink href="/admin/bandoverzicht" icon="🥋" label="Bandoverzicht" />` toe aan navigatie |
| `src/app/admin/page.tsx` | Voeg 5e stat-kaart "Klaar voor examen" toe + bereken `readyCount` |

---

## 9. Implementatievolgorde

### Fase 1: Kernlogica (laagste risico)
1. ✅ `src/lib/exam-config.ts` — Configuratiemodule
2. ✅ `src/lib/exam-readiness.ts` — `calculateExamReadiness()` + `calculateAllExamReadiness()`

### Fase 2: API endpoints
3. ✅ `src/app/api/admin/band-overzicht/route.ts` — Hoofdendpoint
4. ✅ `src/app/api/admin/band-overzicht/stats/route.ts` — Stats endpoint

### Fase 3: Components
5. ✅ `src/components/admin/band-overzicht/Summary.tsx`
6. ✅ `src/components/admin/band-overzicht/MemberReadinessCard.tsx`
7. ✅ `src/components/admin/band-overzicht/ReadinessProgressBar.tsx`
8. ✅ `src/components/admin/band-overzicht/LocationSummary.tsx`
9. ✅ `src/components/admin/band-overzicht/Filters.tsx`

### Fase 4: Pagina's
10. ✅ `src/app/admin/bandoverzicht/page.tsx` — Hoofdpagina

### Fase 5: Integratie
11. ✅ `src/app/admin/layout.tsx` — Sidebar link toevoegen
12. ✅ `src/app/admin/page.tsx` — Dashboard widget toevoegen
13. ✅ `.env.local` — Configuratievariabelen toevoegen

### Testing
- Test `calculateExamReadiness()` met verschillende scenario's:
  - Nieuw lid (< 3 maanden)
  - Lid klaar voor eerste examen (> 3 maanden, geen examens)
  - Lid met recent geslaagd examen (< 6 maanden)
  - Lid klaar voor opvolgend examen (> 6 maanden)
  - Lid met hoogste band (ZWART_10)
  - Lid met gepland examen (SCHEDULED)
  - Lid zonder joinDate

---

## Technische overwegingen

### Prestaties
- Bij ~100 leden: `calculateAllExamReadiness()` doet ~100 DB queries (1 per lid voor exam attempts). Dit is acceptabel voor admin-gebruik.
- **Optimalisatie:** Eventueel batch-query van alle ExamAttempts in één keer:
  ```typescript
  const allAttempts = await db.examAttempt.findMany({
    where: {
      memberId: { in: memberIds },
      status: { in: ['COMPLETED_PASSED', 'SCHEDULED'] },
    },
  })
  // Groepeer per memberId in memory
  ```

### Caching
- Admin data verandert niet frequent → `dynamic = 'force-dynamic'` is voldoende
- Voor dashboard widget: overweeg revalidatie interval via `revalidatePath('/admin', 'layout')`

### Datums
- Alle datums worden vergeleken op dag-niveau (geen tijdszone issues)
- `addMonths()` gebruikt `setMonth()` — let op eind-van-de-maand edge cases (bijv. 31 jan + 1 maand = 28 feb)

### Edge cases
- Lid met `joinDate` in de toekomst → wordt als "nog wachten" getoond
- Lid zonder `currentBelt` → wordt getoond met "Geen band → Wit"
- Lid met alleen `COMPLETED_FAILED` examens → telt als "eerste examen" (geen geslaagde examens)
- Lid met `SCHEDULED` examen → wordt gemarkeerd maar telt nog steeds in ready/waiting

---

## Toekomstige uitbreidingen (niet in scope)

1. **Automatische alerts** — E-mail naar ouders wanneer lid klaar is
2. **Bulk-examenplanning** — Selecteer meerdere "klaar" leden en plan examen in één keer
3. **Export** — CSV export van overzicht
4. **Historie** — Toon wanneer leden eerder klaar waren maar niet hebben geëxamineerd
5. **Publieke status** — Leden kunnen zelf zien wanneer ze klaar zijn (via `/leden/voortgang`)
