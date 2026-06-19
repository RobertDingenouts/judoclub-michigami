# Aanwezigheidsregistratie — Implementatieplan

> Judoclub Michigami — Complete architectuur voor het bijhouden van trainingaanwezigheid
> Per locatie (Steenbergen / Oud-Vossemeer), per trainingssessie, per lid.

---

## Inhoudsopgave

1. [Overzicht & Doel](#1-overzicht--doel)
2. [Database Modellen (Prisma)](#2-database-modellen-prisma)
3. [API Endpoints](#3-api-endpoints)
4. [Admin Pagina's](#4-admin-pagina)
5. [Component Architectuur](#5-component-architectuur)
6. [Admin Dashboard Widget — "Vandaag"](#6-admin-dashboard-widget---vandaag)
7. [Bestandsstructuur](#7-bestandsstructuur)
8. [Implementatievolgorde](#8-implementatievolgorde)
9. [Migratie & Seed Data](#9-migratie--seed-data)
10. [Beveiliging & Auth](#10-beveiliging--auth)

---

## 1. Overzicht & Doel

Het systeem maakt het mogelijk om:
- Een **trainingsschema** (rooster) te beheren per dag/tijd/locatie/instructor
- **Aanwezigheid** per trainingssessie vast te leggen per lid
- Bulk-actie: **"Markeer allen aanwezig"** met individuele uitzonderingen
- **Afwijzelreden**: Ziek, Toernooi, Vakantie, Overgeslagen, Ander
- **Geschiedenis** per lid in een kalenderweergave (groen = aanwezig, rood = afwezig)
- **Statistieken**: % aanwezigheid per lid, per maand, per locatie
- **CSV-export** van alle aanwezigheidsdata
- Alles beperkt tot **ADMIN**-gebruikers (bestaande auth-stack)

### Locaties

| Waarde | Label | Adres |
|---|---|---|
| `STeenbergen` | Steenbergen | Sportcentrum De Knotwilg, Wipstraat 2 |
| `OUD_VOSSEMEER` | Oud-Vossemeer | Dorpshuis De Vossenkuil, Bou Kooijmanstraat 48 |

### Huidig schema (uit `src/data/schedule.ts`)

| Dag | Groep | Tijd | Locatie |
|---|---|---|---|
| Woensdag | Algemene training | 19:00–20:00 | Oud-Vossemeer |
| Vrijdag | Groep 1 (6–9 jaar) | 18:45–19:45 | Steenbergen |
| Vrijdag | Groep 2+ (9+ jaar) | 19:45–20:45 | Steenbergen |

---

## 2. Database Modellen (Prisma)

### 2.1 Enums toevoegen aan `prisma/schema.prisma`

```prisma
// Locatie — al bekend uit student-progress-types.ts
enum TrainingLocation {
  STeenbergen
  OUD_VOSSEMEER
}

// Aanwezige status
enum AttendanceStatus {
  PRESENT           // Aanwezig
  ABSENT            // Afwezig
}

// Reden voor afwezigheid
enum AbsenceReason {
  GEEN              // Geen reden (aanwezig)
  ZIEK              // Ziek
  TOERNOOI          // Toernooi / competitie
  VAKANTIE          // Vakantie
  OVERGESLAGEN      // Opgewogen / overgeslagen
  ANDER             // Ander (vrij tekstveld)
}
```

### 2.2 Model: `ClassSchedule`

```prisma
model ClassSchedule {
  id           String           @id @default(cuid())
  dayOfWeek    Int              // 0 = zondag, ..., 2 = dinsdag, ..., 6 = zaterdag
  groupName    String           // Bijv. "Groep 1", "Algemene training", "Groep 2+"
  startTime    String           // Bijv. "19:00" (HH:mm)
  endTime      String           // Bijv. "20:00"
  location     TrainingLocation
  instructor   String?          // Naam trainer/instructor
  isActive     Boolean          @default(true)
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt

  // Relaties
  attendances  Attendance[]

  @@index([dayOfWeek, location])
  @@index([isActive])
}
```

**Toelichting:**
- `dayOfWeek` als `Int` (0–6) voor eenvoudige query's ("welke lessen zijn op vrijdag = 5?")
- `startTime` / `endTime` als `String` (HH:mm) — voldoet voor sortering en weergave
- `isActive` zodat verouderde schema's uitgeschakeld kunnen worden zonder te verwijderen
- `instructor` optioneel — niet elke sessie heeft een vaste instructor

### 2.3 Model: `Attendance`

```prisma
model Attendance {
  id            String           @id @default(cuid())
  memberId      String
  userId        String
  classScheduleId String?        // Verwijzing naar ClassSchedule (optioneel: voor ad-hoc trainingen)
  date          DateTime         // Datum van de training (date-only, op middernacht UTC)
  location      TrainingLocation
  startTime     String           // Kopie van ClassSchedule.startTime (denormalisatie voor snelheid)
  status        AttendanceStatus // PRESENT of ABSENT
  absenceReason AbsenceReason    @default(GEEN)
  note          String?          // Vrij tekstveld voor "ANDER" of extra info
  recordedBy    String           // userId van de admin die dit registreerde
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt

  // Relaties
  member        Member           @relation(fields: [memberId], references: [id])
  classSchedule ClassSchedule?   @relation(fields: [classScheduleId], references: [id])

  // Uniek: één record per lid per datum per locatie per tijdslot
  @@unique([memberId, date, location, startTime])
  @@index([date, location])
  @@index([memberId, date])
  @@index([recordedBy])
}
```

**Toelichting:**
- `userId` als redundante FK naar `User` — voor snelle joins zonder via `Member`
- `classScheduleId` optioneel — soms is er een ad-hoc training die niet in het schema staat
- `startTime` is denormaliseerd uit `ClassSchedule` zodat we ook zonder join kunnen filteren
- `date` is een `DateTime` — in queries gebruiken we `startOfDay` / `endOfDay` filters
- Unieke constraint voorkomt dubbele registraties voor hetzelfde lid op dezelfde training
- `recordedBy` traceert welke admin de data heeft ingevoerd

### 2.4 Relaties in bestaande modellen

Geen wijzigingen nodig in `Member` — de `Attendance` model heeft een relation naar `Member`. We voegen een optionele relation toe aan het `Member` model voor volledigheid:

```prisma
// In model Member (toevoegen):
attendances    Attendance[]
```

---

## 3. API Endpoints

Alle endpoints zijn **ADMIN-only** — auth check via `isAdmin()` uit `@/lib/auth`.

### 3.1 Trainingsschema

#### `GET /api/admin/schedule`

Haal het volledige trainingsschema op.

**Query params:**
| Param | Type | Verplicht | Standaard | Omschrijving |
|---|---|---|---|---|
| `location` | `string` | Nee | — | Filter op locatie (`STeenbergen` / `OUD_VOSSEMEER`) |
| `dayOfWeek` | `number` | Nee | — | Filter op dag (0–6) |
| `active` | `boolean` | Nee | `true` | Alleen actieve schema's |

**Response:**
```json
{
  "schedules": [
    {
      "id": "cl...",
      "dayOfWeek": 5,
      "groupName": "Groep 1",
      "startTime": "18:45",
      "endTime": "19:45",
      "location": "STeenbergen",
      "instructor": "Robert",
      "isActive": true
    }
  ]
}
```

**Bestand:** `src/app/api/admin/schedule/route.ts`

---

#### `POST /api/admin/schedule`

Maak of update een trainingsschema.

**Body:**
```json
{
  "id": "cl...",              // optioneel — voor update
  "dayOfWeek": 5,
  "groupName": "Groep 1",
  "startTime": "18:45",
  "endTime": "19:45",
  "location": "STeenbergen",
  "instructor": "Robert",
  "isActive": true
}
```

**Response:**
```json
{ "success": true, "schedule": { ... } }
```

---

### 3.2 Aanwezigheid

#### `GET /api/admin/attendance`

Haal alle data op voor het aanwezigheidsscherm van een bepaalde datum.

**Query params:**
| Param | Type | Verplicht | Standaard | Omschrijving |
|---|---|---|---|---|
| `date` | `string` (ISO) | **Ja** | — | Datum van de training |
| `location` | `string` | **Ja** | — | `STeenbergen` of `OUD_VOSSEMEER` |
| `scheduleId` | `string` | Nee | — | Specifieke ClassSchedule (optioneel) |

**Response:**
```json
{
  "date": "2025-06-19",
  "location": "STeenbergen",
  "schedules": [
    { "id": "cl...", "groupName": "Groep 1", "startTime": "18:45", "endTime": "19:45", "instructor": "Robert" }
  ],
  "members": [
    {
      "id": "me...",
      "firstName": "Jan",
      "lastName": "Jansen",
      "currentBelt": "GEEL",
      "location": "STeenbergen",
      "attendance": {
        "status": "PRESENT",
        "absenceReason": "GEEN",
        "note": null
      }
    }
  ],
  "summary": {
    "total": 15,
    "present": 12,
    "absent": 3
  }
}
```

**Bestand:** `src/app/api/admin/attendance/route.ts`

---

#### `POST /api/admin/attendance/record`

Bulk-registreer aanwezigheid voor een trainingssessie.

**Body:**
```json
{
  "date": "2025-06-19",
  "location": "STeenbergen",
  "scheduleId": "cl...",
  "startTime": "18:45",
  "records": [
    { "memberId": "me...", "status": "PRESENT", "absenceReason": "GEEN", "note": null },
    { "memberId": "me...", "status": "ABSENT", "absenceReason": "ZIEK", "note": "" },
    { "memberId": "me...", "status": "ABSENT", "absenceReason": "ANDER", "note": "Verjaardagsfeest" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "recorded": 15,
  "updated": 3,
  "created": 12
}
```

**Bestand:** `src/app/api/admin/attendance/record/route.ts`

---

#### `GET /api/admin/attendance/history`

Haal de aanwezigheidsgeschiedenis op voor een specifiek lid.

**Query params:**
| Param | Type | Verplicht | Standaard | Omschrijving |
|---|---|---|---|---|
| `memberId` | `string` | **Ja** | — | Lid ID |
| `from` | `string` (ISO) | Nee | 3 maanden geleden | Startdatum |
| `to` | `string` (ISO) | Nee | Vandaag | Einddatum |
| `location` | `string` | Nee | — | Filter op locatie |

**Response:**
```json
{
  "member": {
    "id": "me...",
    "firstName": "Jan",
    "lastName": "Jansen",
    "currentBelt": "GEEL"
  },
  "attendance": [
    {
      "id": "at...",
      "date": "2025-06-18",
      "location": "STeenbergen",
      "startTime": "18:45",
      "status": "PRESENT",
      "absenceReason": "GEEN",
      "note": null
    }
  ],
  "expectedClasses": [
    { "date": "2025-06-18", "location": "STeenbergen", "startTime": "18:45" }
  ]
}
```

**Bestand:** `src/app/api/admin/attendance/history/route.ts`

---

#### `GET /api/admin/attendance/stats`

Aanwezigheidsstatistieken.

**Query params:**
| Param | Type | Verplicht | Standaard | Omschrijving |
|---|---|---|---|---|
| `memberId` | `string` | Nee | — | Per lid (als niet opgegeven: alle leden) |
| `location` | `string` | Nee | — | Filter op locatie |
| `from` | `string` (ISO) | Nee | 12 maanden geleden | Startdatum |
| `to` | `string` (ISO) | Nee | Vandaag | Einddatum |
| `groupBy` | `string` | Nee | `member` | `member` \| `month` \| `location` |

**Response (groupBy=member):**
```json
{
  "stats": [
    {
      "memberId": "me...",
      "name": "Jan Jansen",
      "total": 48,
      "present": 42,
      "absent": 6,
      "percentage": 87.5,
      "byLocation": {
        "STeenbergen": { "total": 30, "present": 27, "percentage": 90.0 },
        "OUD_VOSSEMEER": { "total": 18, "present": 15, "percentage": 83.3 }
      }
    }
  ]
}
```

**Response (groupBy=month):**
```json
{
  "stats": [
    {
      "month": "2025-06",
      "total": 12,
      "present": 10,
      "absent": 2,
      "percentage": 83.3
    }
  ]
}
```

**Bestand:** `src/app/api/admin/attendance/stats/route.ts`

---

#### `GET /api/admin/attendance/export/csv`

Exporteer aanwezigheidsdata als CSV.

**Query params:**
| Param | Type | Verplicht | Standaard | Omschrijving |
|---|---|---|---|---|
| `from` | `string` (ISO) | Nee | 12 maanden geleden | Startdatum |
| `to` | `string` (ISO) | Nee | Vandaag | Einddatum |
| `location` | `string` | Nee | — | Filter op locatie |
| `memberId` | `string` | Nee | — | Filter op lid |

**Response:**
- Content-Type: `text/csv`
- Headers: `Date,Location,Time,Member,Status,AbsenceReason,Note`
- Gebruikt `;` als scheidingsteken (Nederlandse standaard)

**Bestand:** `src/app/api/admin/attendance/export/csv/route.ts`

---

## 4. Admin Pagina's

### 4.1 `/admin/attendance` — Aanwezigheid Registreren

**Doel:** Per datum een training kiezen en aanwezigheid per lid vastleggen.

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Aanwezigheidsregistratie                               │
│  [📅 Date Picker] [📍 Locatie: Steenbergen ▾] [Opslaan] │
├─────────────────────────────────────────────────────────┤
│  📋 Trainingsschema voor vandaag (Vrijdag 19-06-2026)   │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Groep 1 (18:45–19:45) ▸ [Aanwezigheid registreren]│  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Groep 2+ (19:45–20:45) ▸ [Aanwezigheid registreren]│ │
│  └───────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│  [Expandeerd per groep]                                 │
│                                                         │
│  Groep 1 — 18:45–19:45                                  │
│  📍 Steenbergen  👤 Robert                               │
│                                                         │
│  [☑ Markeer Allen Aanwezig]                             │
│                                                         │
│  ┌──────┬──────────────────┬──────┬──────────────────┐  │
│  │ Lid  │ Status           │ Reden │ Opmerking        │  │
│  ├──────┼──────────────────┼──────┼──────────────────┤  │
│  │ Jan  │ [Aanwezig ▾]     │ —    │ —                │  │
│  │ Piet │ [Afwezig ▾]      │ [Ziek▾]│                 │  │
│  │ ...  │ ...              │ ...  │ ...              │  │
│  └──────┴──────────────────┴──────┴──────────────────┘  │
│                                                         │
│  Samenvatting: 15 totaal, 12 aanwezig, 3 afwezig       │
│  [💾 Opslaan]                                           │
└─────────────────────────────────────────────────────────┘
```

**Functionaliteit:**
- Date picker default op **vandaag**
- Locatie-filter: **Steenbergen** / **Oud-Vossemeer** / **Alle**
- Per trainingssessie: uitklapbare lijst met leden
- **"Markeer Allen Aanwezig"** toggle — zet alle leden op PRESENT
- Klik op een individueel lid om status te veranderen naar ABSENT + reden kiezen
- Reden-dropdown verschijnt alleen bij ABSENT
- Bij reden "ANDER": extra tekstveld voor opmerking
- Samenvatting onderaan met aantallen
- Opslaan knop POST naar `/api/admin/attendance/record`
- Leden worden gefilterd op hun `location` veld (uit `Member.location`)

**Bestand:** `src/app/admin/attendance/page.tsx`

---

### 4.2 `/admin/attendance/history` — Geschiedenis per Lid

**Doel:** Kalenderweergave van aanwezigheid per lid met statistieken.

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Aanwezigheidsgeschiedenis                              │
│  [🔍 Lid zoeken...] [📍 Locatie ▾] [📅 Periode ▾]       │
├─────────────────────────────────────────────────────────┤
│  Jan Jansen — Gele band                                 │
│                                                         │
│  Statistieken:                                          │
│  ┌──────────────┬──────────────┬──────────────┐         │
│  │ 87,5%        │ 42 / 48      │ 6 afwezig    │         │
│  │ aanwezigheid │ aanwezig     │              │         │
│  └──────────────┴──────────────┴──────────────┘         │
│                                                         │
│  Kalender (Juni 2025) ← ▸                              │
│  Ma Di Wo Do Vr Za Zo                                    │
│       1  2  3  4  5  6                                  │
│  7  8  9 10 11 12 13                                    │
│  🟢🟢🟢🟢🔴🟢🟢   🟢 = aanwezig, 🔴 = afwezig          │
│  14 15 16 17 18 19 20                                   │
│  🟢🟢🟢🟢🟢🟢🟢   Klik op dag voor details              │
│                                                         │
│  Details per dag (tooltip/modal):                       │
│  Datum | Locatie | Tijd | Status | Reden | Opmerking    │
├─────────────────────────────────────────────────────────┤
│  Overzicht Alle Leden (tabel)                           │
│                                                         │
│  ┌──────────────┬────┬─────┬──────┬──────────┐         │
│  │ Lid          │ %  │ Tota│ Aanw │ Afwez    │         │
│  ├──────────────┼────┼─────┼──────┼──────────┤         │
│  │ Jan Jansen   │87,5│ 48  │ 42   │ 6        │         │
│  │ Piet Jansen  │95,8│ 48  │ 46   │ 2        │         │
│  │ ...          │... │ ... │ ...  │ ...      │         │
│  └──────────────┴────┴─────┴──────┴──────────┘         │
└─────────────────────────────────────────────────────────┘
```

**Functionaliteit:**
- Lid-selector (dropdown of zoekveld)
- Kalenderweergave met kleurcodes:
  - 🟢 Groen = PRESENT
  - 🔴 Rood = ABSENT
  - ⚪ Grijs = geen data (geen training op die dag)
- Klik op dagcel → detail tooltip/modal met locatie, tijd, reden
- Periode-filter: Laatste maand / 3 maanden / 6 maanden / 12 maanden / Aangepast
- Tabel met alle leden en hun aanwezigheidspercentage
- Sorteerbaar op naam, percentage, totaal
- Filter op locatie

**Bestand:** `src/app/admin/attendance/history/page.tsx`

---

### 4.3 `/admin/attendance/stats` — Statistieken

**Doel:** Overzichtelijke statistieken per lid, per maand, per locatie.

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Aanwezigheidsstatistieken                              │
│  [📍 Locatie ▾] [📅 Periode ▾] [📊 Groepeer op ▾]       │
├─────────────────────────────────────────────────────────┤
│  [Tabs: Per Lid | Per Maand | Per Locatie]              │
│                                                         │
│  ── Per Lid ──                                         │
│  (Bar chart of tabel met percentages)                   │
│                                                         │
│  ── Per Maand ──                                       │
│  (Lijngrafiek of tabel met maandelijkse percentages)    │
│                                                         │
│  ── Per Locatie ──                                     │
│  (Vergelijking Steenbergen vs Oud-Vossemeer)            │
│                                                         │
│  [📥 Exporteer CSV]                                     │
└─────────────────────────────────────────────────────────┘
```

**Functionaliteit:**
- Drie tabs voor verschillende groeperingen
- Bar charts (eigen component, geen externe bibliotheek nodig — Tailwind bars)
- CSV-export knop die naar `/api/admin/attendance/export/csv` linkt
- Filter op locatie en periode
- Gemiddelde aanwezigheid per locatie

**Bestand:** `src/app/admin/attendance/stats/page.tsx`

---

## 5. Component Architectuur

### 5.1 Components Overzicht

```
src/components/attendance/
├── AttendanceDatePicker.tsx        # Date picker met navigatie (vorige/volgende dag)
├── LocationFilter.tsx              # Locatie dropdown (Steenbergen / Oud-Vossemeer / Alle)
├── ClassScheduleCard.tsx           # Uitklapbare card per trainingssessie
├── MemberAttendanceRow.tsx         # Rij in de tabel: lid + status + reden + opmerking
├── AttendanceSummary.tsx           # Samenvatting: totaal / aanwezig / afwezig
├── AttendanceCalendar.tsx          # Kalenderweergave (groen/rood) per lid
├── AttendanceCalendarCell.tsx      # Individuele dagcel in de kalender
├── AttendanceStatsTable.tsx        # Tabel met percentages per lid
├── AttendanceStatsChart.tsx        # Eenvoudige bar chart (Tailwind)
├── AbsenceReasonSelect.tsx         # Dropdown voor afwezigheidsreden
├── MarkAllPresentToggle.tsx        # Toggle: markeer allen aanwezig
├── AttendanceRecordForm.tsx        # Form voor het opslaan van aanwezigheid
├── TodayWidget.tsx                 # "Vandaag" widget voor admin dashboard
└── CsvExportButton.tsx             # CSV-export knop
```

### 5.2 Component Details

#### `AttendanceDatePicker.tsx`
- Date picker met dag/navigatie (← →)
- Default op vandaag
- Toont dag van de week + datum in Nederlands
- Brand kleuren: rode accenten voor today

#### `LocationFilter.tsx`
- Dropdown: Alle / Steenbergen / Oud-Vossemeer
- Gebruikt `TRAINING_LOCATIONS` uit `@/lib/student-progress-types`
- Visueel onderscheid met locatie-emoji (📍)

#### `ClassScheduleCard.tsx`
- Toont groepnaam, tijd, locatie, instructor
- Uitklapbaar (chevron toggle)
- "Aanwezigheid registreren" knop
- Kleurcodering per locatie

#### `MemberAttendanceRow.tsx`
- Toont: lidnaam, bandkleur indicator, status dropdown, reden dropdown, opmerking
- Status dropdown: Aanwezig / Afwezig
- Reden dropdown verschijnt alleen bij Afwezig
- Bij "Ander": extra tekstveld
- Bandkleur balk links (gebruikt `BELT_COLORS`)

#### `AttendanceSummary.tsx`
- Totaal aantal leden
- Aantal aanwezig (groen)
- Aantal afwezig (rood)
- Percentage aanwezig

#### `AttendanceCalendar.tsx`
- Maandkalender met dagcellen
- Kleurcodes: 🟢 PRESENT, 🔴 ABSENT, ⚪ geen data
- Navigatie ← → tussen maanden
- Tooltip op hover met details
- Responsive: op mobiel compactere weergave

#### `AttendanceStatsTable.tsx`
- Tabel: Lid, %, Totaal, Aanwezig, Afwezig
- Sorteerbaar op elke kolom
- Filter op locatie
- Bandkleur indicator

#### `AttendanceStatsChart.tsx`
- Horizontale bar charts (Tailwind alleen)
- Elke bar = een lid
- Breedte = percentage aanwezigheid
- Kleur: groen → rood gradient op basis van percentage

#### `TodayWidget.tsx`
- Widget voor admin dashboard
- Toont vandaag's trainingen met locatie + tijd
- Korte link naar `/admin/attendance?date=today`
- Toont aantal leden per locatie

---

## 6. Admin Dashboard Widget — "Vandaag"

### 6.1 Plaatsing

Nieuwe statcard in het bestaande grid op `/admin/page.tsx`:

```tsx
// Bestaande 4 cards: Studenten, Examens, Diploma's, Slagingspercentage
// Nieuwe 5e card (of vervanging):
<StatCard
  title="Vandaag's Trainingen"
  value={todayClassCount}
  icon="📋"
  href="/admin/attendance"
  subtitle={`${todayDate} — ${locationsString}`}
/>
```

### 6.2 Uitgebreide Widget (optioneel)

Een apart sectie onder de statcards:

```
┌─────────────────────────────────────────────────────────┐
│  📋 Vandaag's Trainingen — Vrijdag 19 juni 2026         │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 📍 Steenbergen — De Knotwilg                      │  │
│  │ 18:45–19:45  Groep 1 (6–9 jaar)  👤 Robert       │  │
│  │ [Registreren]  (15 leden)                         │  │
│  │                                                   │  │
│  │ 19:45–20:45  Groep 2+ (9+ jaar)  👤 Robert       │  │
│  │ [Registreren]  (20 leden)                         │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 📍 Oud-Vossemeer — De Vossenkuil                  │  │
│  │ (geen trainingen vandaag)                         │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Data fetching:**
- Server-side component (RSC) in `page.tsx`
- Query `ClassSchedule` voor `dayOfWeek` = vandaag
- Query `Member.count` per locatie voor aantallen
- Link naar `/admin/attendance?date=YYYY-MM-DD`

---

## 7. Bestandsstructuur

```
/home/suffie/michigami-website/
├── prisma/
│   └── schema.prisma                          # ← ClassSchedule, Attendance + enums toevoegen
│
├── src/
│   ├── lib/
│   │   └── attendance-types.ts                # ← TypeScript types voor aanwezigheid
│   │
│   ├── components/
│   │   └── attendance/
│   │       ├── AttendanceDatePicker.tsx
│   │       ├── LocationFilter.tsx
│   │       ├── ClassScheduleCard.tsx
│   │       ├── MemberAttendanceRow.tsx
│   │       ├── AttendanceSummary.tsx
│   │       ├── AttendanceCalendar.tsx
│   │       ├── AttendanceCalendarCell.tsx
│   │       ├── AttendanceStatsTable.tsx
│   │       ├── AttendanceStatsChart.tsx
│   │       ├── AbsenceReasonSelect.tsx
│   │       ├── MarkAllPresentToggle.tsx
│   │       ├── AttendanceRecordForm.tsx
│   │       ├── TodayWidget.tsx
│   │       └── CsvExportButton.tsx
│   │
│   ├── app/
│   │   ├── admin/
│   │   │   ├── layout.tsx                     # ← Nieuwe nav-link toevoegen
│   │   │   ├── page.tsx                       # ← TodayWidget toevoegen
│   │   │   └── attendance/
│   │   │       ├── page.tsx                   # ← Aanwezigheid registreren
│   │   │       ├── history/
│   │   │       │   └── page.tsx               # ← Geschiedenis per lid
│   │   │       └── stats/
│   │   │           └── page.tsx               # ← Statistieken
│   │   │
│   │   └── api/
│   │       └── admin/
│   │           ├── schedule/
│   │           │   └── route.ts               # ← GET + POST trainingsschema
│   │           └── attendance/
│   │               ├── route.ts               # ← GET huidige aanwezigheid
│   │               ├── record/
│   │               │   └── route.ts           # ← POST bulk registreren
│   │               ├── history/
│   │               │   └── route.ts           # ← GET geschiedenis per lid
│   │               ├── stats/
│   │               │   └── route.ts           # ← GET statistieken
│   │               └── export/
│   │                   └── csv/
│   │                       └── route.ts       # ← GET CSV export
│   │
│   └── data/
│       └── schedule.ts                        # ← Bestaat al, blijft als fallback/static data
```

---

## 8. Implementatievolgorde

Volg deze volgorde voor incrementele implementatie:

### Fase 1: Database & Types (Stap 1–3)

1. **Prisma schema aanpassen** — Enums + modellen toevoegen
2. **Database migreren** — `npx prisma migrate dev --name add_attendance`
3. **TypeScript types** — `src/lib/attendance-types.ts`

### Fase 2: API Endpoints (Stap 4–6)

4. **Schedule API** — `GET/POST /api/admin/schedule`
5. **Attendance API** — `GET /api/admin/attendance` + `POST /api/admin/attendance/record`
6. **History + Stats + CSV API** — Overige endpoints

### Fase 3: Components (Stap 7)

7. **Components bouwen** — Alle components in `src/components/attendance/`

### Fase 4: Admin Pagina's (Stap 8–10)

8. **`/admin/attendance`** — Hoofdpagina aanwezigheid registreren
9. **`/admin/attendance/history`** — Geschiedenis per lid
10. **`/admin/attendance/stats`** — Statistieken + CSV export

### Fase 5: Integratie (Stap 11–12)

11. **Admin layout navigatie** — Nieuwe link toevoegen
12. **Dashboard widget** — "Vandaag" widget op `/admin/page.tsx`

### Fase 6: Seed Data (Stap 13)

13. **Seed initieel schema** — Bestaande trainingstijden uit `src/data/schedule.ts` importeren

---

## 9. Migratie & Seed Data

### 9.1 Prisma Migratie

```bash
cd /home/suffie/michigami-website
npx prisma migrate dev --name add_attendance_tracking
```

### 9.2 Seed Script

**Bestand:** `prisma/seed-attendance.ts`

```typescript
import { db } from '../src/lib/db'
import { TrainingLocation, AbsenceReason } from '@prisma/client'

async function seedSchedule() {
  // Woensdag (dayOfWeek=2) — Algemene training Oud-Vossemeer
  await db.classSchedule.upsert({
    where: { /* unieke combinatie */ },
    update: {},
    create: {
      dayOfWeek: 2,                          // Woensdag
      groupName: 'Algemene training',
      startTime: '19:00',
      endTime: '20:00',
      location: TrainingLocation.OUD_VOSSEMEER,
      instructor: 'Robert',
      isActive: true,
    },
  })

  // Vrijdag (dayOfWeek=4) — Groep 1 Steenbergen
  await db.classSchedule.upsert({
    where: { /* ... */ },
    update: {},
    create: {
      dayOfWeek: 4,                          // Vrijdag
      groupName: 'Groep 1',
      startTime: '18:45',
      endTime: '19:45',
      location: TrainingLocation.STeenbergen,
      instructor: 'Robert',
      isActive: true,
    },
  })

  // Vrijdag (dayOfWeek=4) — Groep 2+ Steenbergen
  await db.classSchedule.upsert({
    where: { /* ... */ },
    update: {},
    create: {
      dayOfWeek: 4,                          // Vrijdag
      groupName: 'Groep 2+',
      startTime: '19:45',
      endTime: '20:45',
      location: TrainingLocation.STeenbergen,
      instructor: 'Robert',
      isActive: true,
    },
  })
}
```

**Opmerking:** Voor `upsert` met composite where-clause, voeg een `@@unique` constraint toe:
```prisma
@@unique([dayOfWeek, startTime, location])
```

---

## 10. Beveiliging & Auth

Alle endpoints en pagina's gebruiken de **bestaande auth-stack**:

### API routes
```typescript
// In elke API route:
import { isAdmin } from '@/lib/auth'

export async function GET(request: Request) {
  const admin = await isAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })
  }
  // ...
}
```

### Pagina's
- `/admin/attendance/*` valt onder middleware matcher `/admin/:path*`
- Middleware checkt session + ADMIN role → redirect naar `/admin-login` bij falen
- `AdminLayout` doet ook server-side check via `isAdmin()`

### Audit trail
- `recordedBy` veld in `Attendance` slaat userId op van de admin
- Kan later uitgebreid worden met een `AuditLog` model

---

## Aanvullende Opmerkingen

### Performance
- `Attendance` tabel kan snel groeien (per lid × per training = ~50 leden × ~100 trainingen/jaar = 5000 rijen/jaar)
- Indexen op `[memberId, date]` en `[date, location]` dekken alle query patronen
- CSV export: stream response i.p.v. geheugenbuffer voor grote datasets

### UX
- Alle labels in **Nederlands**
- Brand kleuren: `#a90000` (primary), `#8c0000` (primary-dark), `#2a2a2a` (text-dark), `#f5f5f0` (bg-light)
- **Geen blauwe links** — rode accenten
- Mobile-first: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-X`
- Kalender op mobiel: compacte 7-kolommen grid

### Toekomstige Uitbreidingen
- **Ouders notificatie** bij afwezigheid (e-mail/app push)
- **Lid dashboard** — eigen aanwezigheid inzien op `/leden/aanwezigheid`
- **Automatische verwachting** — `ExpectedClass` model dat automatisch trainingen genereert
- **QR-code check-in** — trainer scant QR-code van lid
- **Excel export** naast CSV

### TypeScript Types (`src/lib/attendance-types.ts`)

```typescript
export type AttendanceStatus = 'PRESENT' | 'ABSENT'
export type AbsenceReason = 'GEEN' | 'ZIEK' | 'TOERNOOI' | 'VAKANTIE' | 'OVERGESLAGEN' | 'ANDER'

export interface AttendanceRecordInput {
  memberId: string
  status: AttendanceStatus
  absenceReason: AbsenceReason
  note?: string | null
}

export interface RecordAttendanceBody {
  date: string              // ISO date
  location: string          // STeenbergen | OUD_VOSSEMEER
  scheduleId: string
  startTime: string
  records: AttendanceRecordInput[]
}

export interface AttendanceMember {
  id: string
  firstName: string
  lastName: string
  currentBelt: string | null
  location: string
  attendance: {
    status: AttendanceStatus
    absenceReason: AbsenceReason
    note: string | null
  } | null
}

export interface AttendanceSummary {
  total: number
  present: number
  absent: number
}

export interface AttendanceStat {
  memberId: string
  name: string
  total: number
  present: number
  absent: number
  percentage: number
  byLocation: Record<string, { total: number; present: number; percentage: number }>
}

export const ABSENCE_REASON_LABELS_NL: Record<AbsenceReason, string> = {
  GEEN:         '—',
  ZIEK:         'Ziek',
  TOERNOOI:     'Toernooi / Competitie',
  VAKANTIE:     'Vakantie',
  OVERGESLAGEN: 'Overgeslagen',
  ANDER:        'Ander',
}

export const DAY_OF_WEEK_LABELS_NL = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag']

export const DAY_OF_WEEK_SHORT_NL = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za']
```
