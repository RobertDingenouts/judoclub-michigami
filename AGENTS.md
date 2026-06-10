# Judoclub Michigami Website - AGENTS.md

## Project Overzicht
Judoclub Michigami website, gehost op Vercel. Complete migratie van oude Weebly site naar moderne Next.js 16 stack.

**Live URL:** https://judoclub-michigami.vercel.app
**GitHub:** https://github.com/RobertDingenouts/judoclub-michigami (private repo)
**Domein:** judoclubmichigami.nl

---

## BESTANDSSTRUCTUUR - BELANGRIJKE LOCATIES

### 📁 Huidige Stack (ACTIEF)
```
/home/suffie/michigami-website/          ← WSL project root (ACTIEF)
├── src/
│   ├── app/
│   │   └── page.tsx                     ← HOOFDPAGINA - alle secties + navigatie
│   ├── components/
│   │   ├── sections/
│   │   │   ├── ExamDashboard.tsx        ← Exameneisen dashboard (met video modal)
│   │   │   └── ...                      ← Overige sectie components
│   │   └── gallery/
│   │       ├── PhotoGallery.tsx         ← Fotogalerij met lightbox
│   │       └── VideoGallery.tsx         ← Videogalerij
│   ├── data/
│   │   ├── techniques.ts                ← Alle technieken + YouTube IDs
│   │   ├── exam-requirements.ts         ← Exameneisen per band
│   │   ├── agenda.ts                    ← Trainingstijden/agenda
│   │   └── judo-terms.ts                ← Japanse judo termen
│   └── lib/
│       └── ...                          ← Utils, hooks
├── public/                              ← Statische assets (logo's, robots.txt)
├── download/                            ← Backup exports (JSON, HTML dashboard)
│   ├── exameneisen.json                 ← Kimi K2.6 JSON data backup
│   └── judo-exam-dashboard.html         ← Originele dashboard HTML
└── .git/                                ← Git repo (push → GitHub → Vercel deploy)
```

### 📁 Legacy / Bronbestanden (Windows - LEES ONLY)
```
C:\ai\projecten\websites\michigami\161904874969d4855a79a16\  ← Oude Weebly export
├── index.html, info.html, technieken.html, etc.            ← 48 HTML pagina's
├── heupworpen.html, beenworpen.html, ...                   ← Techniek pagina's (met YouTube embeds!)
├── uploads/2/0/5/8/20583900/                               ← Alle originele foto's
└── *.html                                                   ← Bron voor content extractie

C:\ai\projecten\michigami\judo-examens-dashboard\            ← Kimi K2.6 output (BRON DATA)
├── dashboard.html                                           ← Originele exam dashboard
├── data/exameneisen.json                                    ← JSON met technieken + belt levels
├── db/schema.sql                                            ← SQL schema (referentie)
└── README.md                                                ← Kimi instructies

C:\Users\rober\Documents\Michigami\                          ← Documenten & backups
├── Backup mail/Judoclub_Michigami@hotmail.com.pst          ← Hotmail export (251MB)
├── backup website artifacts/                                ← Website backups
│   ├── Agenda 2025.html, Agenda 2026.html
│   └── Exameneisen_dashboard/                               ← Dashboard exports
├── Aanvraagformulier activiteitensubsidie 2027.pdf          ← Officiële documenten
└── Formulier activiteitenverslag 2025 ingevuld.pdf
```

---

## TECHNOLOGIE STACK

| Laag | Technologie | Versie |
|------|-----------|--------|
| Framework | Next.js | 16 (App Router) |
| Taal | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| UI Components | shadcn/ui | latest |
| State | Zustand | latest |
| Data Fetching | TanStack Query | latest |
| Form Validation | React Hook Form + Zod | latest |
| Database | Neon.tech PostgreSQL + Prisma ORM | latest |
| Deploy | Vercel | auto-deploy on push to main |

### Database
| Provider | Neon.tech |
| Project | judoclub-michigami |
| Region | AWS Europe Central 1 (Frankfurt) |
| Pooler | `ep-twilight-shape-allmuadm-pooler.c-3.eu-central-1.aws.neon.tech` |
| Database | neondb |

---

## DEPLOY WORKFLOW

```bash
# 1. Code aanpassen in /home/suffie/michigami-website/
# 2. Build testen
cd /home/suffie/michigami-website && npm run build

# 3. Commit & push (automatisch → Vercel deploy)
git add -A && git commit -m "beschrijving" && git push origin main

# 4. Live op: https://judoclub-michigami.vercel.app
```

---

## BELANGRIJKE COMPONENTS

### `src/app/page.tsx` - HOOFDPAGINA
- Alle secties worden hier gerenderd via `activeSection` state
- Navigatie: Home, Agenda, Technieken, Exameneisen, Cursus Japans
- Single-page experience (geen page reloads)

### `src/components/sections/ExamDashboard.tsx` - EXAMEN DASHBOARD
- Band selector (wit → bruin + slips)
- Weergave modi: Alles / Alleen nieuw
- Detail niveau: Aantallen / Technieknamen / Volledig
- **Video modal:** Elke techniek heeft 🔴 play knop → YouTube embed

### `src/data/techniques.ts` - TECHNIEKEN DATA
- 9 categorieën, ~100 technieken
- Elke techniek: id, name (Japanese), japanese, dutch, youtubeId?
- Bron: Kimi K2.6 JSON + YouTube links uit oude Weebly HTML

---

## DATA BRONNEN

| Data | Locatie | Status |
|------|---------|--------|
| Technieken + video's | `src/data/techniques.ts` | ✅ Actief in site |
| Exameneisen per band | `src/components/sections/ExamDashboard.tsx` (inline CATEGORIES) | ✅ Actief |
| Kimi K2.6 JSON backup | `/mnt/c/ai/projecten/michigami/judo-examens-dashboard/data/exameneisen.json` | 📦 Bron |
| Oude Weebly HTML | `/mnt/c/ai/projecten/websites/michigami/161904874969d4855a79a16/` | 📦 Legacy bron |
| Foto's (origineel) | `.../uploads/2/0/5/8/20583900/` | 📦 Legacy bron |
| Hotmail PST | `/mnt/c/Users/rober/Documents/Michigami/Backup mail/` | 📦 Archivéren |

---

## KLEUREN PALET

```css
--primary: #a90000        /* Rood - hoofdkleur */
--primary-dark: #8c0000   /* Donkerrood */
--text-dark: #2a2a2a      /* Tekst */
--bg-light: #f5f5f0       /* Lichte achtergrond */
--bg-dark: #1a1a1a        /* Donkere achtergrond */
```

---

## MOBILE RESPONSIVE REGELS
- Mobile-first grid: `grid-cols-1 sm:grid-cols-2 md:grid-cols-X`
- Global overflow preventie: `overflow-x-hidden`, `max-width: 100vw`
- Bottom nav op mobiel, hidden op desktop (`md:hidden`)
- iOS safe-area padding via `.safe-area-bottom`

---

## BELANGRIJKE CONVENTIES

1. **NOOIT** blauwe links gebruiken - altijd rode accenten
2. **Altijd** TypeScript interfaces voor data structures
3. **Commit messages:** `feat:`, `fix:`, `chore:` prefix
4. **Data files** in `src/data/` als `.ts` exports (niet `.json`)
5. **Video's:** YouTube IDs optioneel (`youtubeId?: string`)

---

## AUTH SYSTEM (Email/Password + iron-session)

**Geen Clerk — eigen email/password auth met bcrypt + iron-session cookies.**

### Routes
| Route | Doel | Auth nodig? |
|-------|------|-------------|
| `/signin` | Login (leden + admin) | Nee |
| `/signup` | Registratie nieuwe leden | Nee |
| `/admin-login` | Admin login (legacy) | Nee |
| `/admin/*` | Admin dashboard | Ja (ADMIN role) |
| `/leden/*` | Leden dashboard | Ja (MEMBER/PARENT/INSTRUCTOR/ADMIN) |

### API Endpoints
| Endpoint | Method | Doel |
|----------|--------|------|
| `/api/auth/login` | POST | `{email, password}` → session cookie |
| `/api/auth/logout` | POST | Destroy session |
| `/api/auth/register` | POST | `{name, email, password}` → user + member + session |
| `/api/auth/me` | GET | Huidige gebruiker ophalen |

### Auth Functies (`src/lib/auth.ts`)
- `login(email, password)` — verifieert credentials, zet session cookie
- `register(name, email, password)` — maakt User + Member aan, auto-login
- `getSession()` — iron-session cookie uitlezen
- `setSession(data)` — session cookie schrijven
- `destroySession()` — session verwijderen
- `getCurrentUser()` — User + Member profiel ophalen uit DB
- `isAdmin()` — check op ADMIN role
- `isMember()` — check op ingelogd lid (alle roles)
- `hashPassword()`, `verifyPassword()` — bcrypt helpers

### User Avatar Dropdown (na inloggen)
- **Na login/signup**: redirect naar home page `/` (niet meer naar `/admin` of `/leden`)
- **Desktop sidebar**: Avatar met bandkleur + dropdown (Profiel, Diploma's, Uitloggen + Admin Dashboard voor admins)
- **Mobile bottom bar**: Avatar knop met hover dropdown
- **Niet ingelogd**: "Inloggen / Registreren" knop in sidebar
- **Component**: `src/components/UserDropdown.tsx` (`UserDropdown` + `MobileUserAvatar`)

### Database Gebruikers
| Email | Role | Wachtwoord |
|-------|------|-----------|
| `robertdingenouts@gmail.com` | ADMIN | `admin123` |
| `judoclub_michigami@hotmail.com` | ADMIN | geen (Clerk legacy) |
| `suffiedingesaus@gmail.com` | ADMIN | geen (Clerk legacy) |

### Leden Dashboard (`/leden/`)
- `/leden/` — Overzicht met statistieken + snelle acties
- `/leden/voortgang` — Examen geschiedenis
- `/leden/diploma's` — Eigen diploma's + download
- `/leden/cursus-japans` — Cursus voortgang per band

### Belangrijk
- Admin login via `/signin` redirect naar `/admin`
- Leden login via `/signin` redirect naar `/leden`
- Registratie via `/signup` = auto-login → `/leden`
- Logout button redirect naar `/signin`
- Session cookies: 24 uur, httpOnly, sameSite=lax

---

## HERINNERINGEN VOOR AGENTS

- De gebruiker heet Robert, partner Robin van der Gaag
- Domeinen: aisurprise.nl, judoclubmichigami.nl, steenbergenaanzee.nl
- Altijd concept mail eerst tonen voor ik iets verstuurd
- Alles lokaal/open source preferentie (RTX 5090, WSL2)
- Telegram communicatie: kort, direct, geen zachte bewoordingen

---

## CURSUS JAPANS — UITSpraak AUDIO (June 2026)

**156 audio-bestanden** in `public/data/audio/japanese/` — elke Japanse term uit de cursus heeft een `.wav` bestand.

- **Stem:** Edge TTS `ja-JP-KeitaNeural` (native Japanse mannenstem)
- **Bestandsnaam:** `{uitspraak.toLowerCase().replace(/\s+/g, '-')}.wav` (bijv. `uchi-mata.wav`)
- **Data:** `src/data/japanese-course.ts` (158 termen, 8 modules)
- **Component:** `src/components/sections/JapaneseCourseSection.tsx`
  - `PlayButton` component: speaker icoon naast de term
  - Ziet in flashcard (voorkant + achterkant) + quiz modus
  - Audio pad: `/data/audio/japanese/{filename}.wav`
  - **Fix:** `key={cardIndex}` op Flashcard → reset flip state bij navigeren

**Nieuwe termen toevoegen:**
1. Term toevoegen aan `src/data/japanese-course.ts`
2. Audio genereren: `edge-tts --text "Term" --voice ja-JP-KeitaNeural --write-media public/data/audio/japanese/term.wav`
3. Git push → auto-deploy

**Flashcard fix:** `key={cardIndex}` op `<Flashcard>` component zodat het kaartje altijd op de voorkant begint bij navigeren.

---

## CURSUS JAPANS — DIPLOMA SYSTEEM (June 2026)

**Doel:** Lid doet examen per bandniveau → ≥80% = diploma + volgende band ontgrendeld.

**Flow:**
1. Lid opent Cursus Japans sectie op homepage → SPA component `JapaneseCourseSection`
2. Belt levels 0-5 (Wit→Bruin) zijn progressief ontgrendeld (vorige band eerst geslaagd)
3. Belt 0 (Wit) is altijd open
4. Lid kiest band → leert termen met flashcards → doet examen (quiz)
5. ≥80% score → `onPass(score, total)` callback → `POST /api/cursus-japans/sync`
6. API route:
   - Upsert `CourseProgress` record per `(userId, courseName, beltLevel)`
   - Als geslaagd: maak `COURSE_JAPANESE` diploma aan met verificatiecode `JP-XXXX-XXXX`
   - Ontgrendel volgende band niveau
   - Retourneert diploma info
7. Lid ziet diploma op `/leden/diploma's` (geel badge "🎓 Cursus Japans")
8. Lid ziet voortgang op `/leden/cursus-japans` (bandkleuren, progress bars, diploma badges)

**Key files:**
- `src/app/api/cursus-japans/sync/route.ts` — **POST**: sync quiz results, create diploma, unlock next. **GET**: fetch all progress + diplomas.
- `src/components/sections/JapaneseCourseSection.tsx` — SPA quiz component. `onPass(score, total)` callback. Belt order: `[0,1,2,3,4,5]` = `['WIT','GEEL','ORANJE','GROEN','BLAUW','BRUIN_1']`.
- `src/app/leden/cursus-japans/page.tsx` — Member dashboard. Toont belt-level progress, diploma badges, "Start examen" buttons. Auto-initializes missing belt levels on load.
- `src/components/sections/DiplomasSection.tsx` — Shows all diplomas. `COURSE_JAPANESE` type gets yellow ring + badge.
- `src/lib/diploma-generator.tsx` — PDF generation. `generateDiplomaPDF()` returns `Buffer` → convert via `new Uint8Array(buffer).buffer` (NOT `.slice()`).
- `src/app/api/diplomas/download/route.ts` — PDF download. Use `new Blob([pdfBuffer as ArrayBuffer])` for response (NOT `Uint8Array` directly).

**Database schema:** `CourseProgress` model — `@@unique([userId, courseName, beltLevel])`. Each user can have 6 records (one per belt level).

**BeltLevel type mismatch:** Prisma `BeltLevel` enum has `BRUIN_2`, `BRUIN_3`, `Zwart_1` etc. but Japanese course only uses `WIT`–`BRUIN_1` (6 levels). Use `as any` cast when passing string belt levels to Prisma, or define `type JapaneseBelt = 'WIT' | 'GEEL' | 'ORANJE' | 'GROEN' | 'BLAUW' | 'BRUIN_1'`.

**⚠️ `@react-pdf/renderer` buffer conversion:** `pdf(document).toBuffer()` returns `Buffer`. `pdfBuffer.buffer.slice(...)` throws "Offset is outside bounds". **Fix:** `new Uint8Array(pdfBuffer).buffer` in generator, `new Blob([pdfBuffer as ArrayBuffer])` in API route.

**⚠️ `db.model.fields.fieldName` returns `FieldRef`, not value.** Cannot use `db.courseProgress.fields.overallScore` in `Math.max()` — TS error. Use raw value directly.

**⚠️ Diploma PDF download URL needs `NEXT_PUBLIC_BASE_URL`:** `getDiplomaDownloadUrl()` uses this env var. Without it, falls back to `localhost:3000`. **Fix:** set on Vercel + `.env.local`. Use `window.location.origin` as fallback.

**⚠️ `useSearchParams()` needs Suspense:** Wrapped in `<Suspense>` in `/diploma/verifieren/page.tsx`. Auto-fills `?code=` parameter from URL.

**neonctl CLI for DB ops (`.env` has `***` placeholder):**
```bash
# Run SQL
echo "SQL here;" | neonctl psql production --project-id withered-surf-44483650 --db-name neondb --role-name neondb_owner

# List projects
neonctl projects list

# Get connection string (password masked as ***)
neonctl connection-string production --project-id withered-surf-44483650 --db-name neondb --role-name neondb_owner
```

**Migration (DONE):** `CourseProgress` unique constraint changed from `[userId, courseName]` to `[userId, courseName, beltLevel]`. SQL in `prisma/migrations/cursus-japans-diploma-systeem/migration.sql`.

**Diploma types:**
- `BELT_EXAM` — verification code prefix `MJ-XXXX-XXXX`
- `COURSE_JAPANESE` — verification code prefix `JP-XXXX-XXXX`
- `ACHIEVEMENT` — other achievements

**Belt level mapping (Japanese course):**
| Level | Enum | Label |
|-------|------|-------|
| 0 | WIT | Witte Band |
| 1 | GEEL | Gele Band |
| 2 | ORANJE | Oranje Band |
| 3 | GROEN | Groene Band |
| 4 | BLAUW | Blauwe Band |
| 5 | BRUIN_1 | Bruine Band |
