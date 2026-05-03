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
| Database | SQLite + Prisma ORM | latest |
| Deploy | Vercel | auto-deploy on push to main |

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

## HERINNERINGEN VOOR AGENTS

- De gebruiker heet Robert, partner Robin van der Gaag
- Domeinen: aisurprise.nl, judoclubmichigami.nl, steenbergenaanzee.nl
- Altijd concept mail eerst tonen voor ik iets verstuurd
- Alles lokaal/open source preferentie (RTX 5090, WSL2)
- Telegram communicatie: kort, direct, geen zachte bewoordingen
