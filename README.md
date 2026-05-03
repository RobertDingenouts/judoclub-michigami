# Judoclub Michigami - Website

Officiële website van **Judoclub Michigami** uit Steenbergen. Opgericht in 1993, judo voor jong en oud.

## 🌐 Live

https://judoclub-michigami.vercel.app

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **State**: Zustand + TanStack Query
- **Icons**: Lucide React
- **Deployment**: Vercel (auto-deploy op `main` push)

## 📁 Structuur

```
src/
├── app/                    # Next.js pages
│   └── page.tsx            # Main SPA met sectie-navigatie
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   ├── sections/           # Pagina-secties (Home, Agenda, etc.)
│   └── gallery/            # Foto & video galerij
├── data/                   # TypeScript data-bestanden
│   ├── agenda.ts           # Evenementenkalender
│   ├── techniques.ts       # Judotechnieken per categorie
│   ├── exam-requirements.ts# Exameneisen per band (JSON → TS)
│   ├── judo-terms.ts       # Japanse termen + vertaling
│   └── ...                 # Leden, locatie, contact, nieuws, etc.
└── lib/                    # Utils
```

## 🚀 Development

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # Productie build
npm start            # Productie server
```

## 📋 Secties (14 totaal)

| Sectie | Beschrijving |
|--------|-------------|
| Home | Hero, quick links, komende evenementen |
| Agenda | Volledige kalender 2025-2026 |
| Technieken | Alle judotechnieken per categorie |
| Exameneisen | Dashboard met band-selector & eisen |
| Cursus Japans | Leer Japanse termen + quiz |
| Lid Worden | Lidsmaatschap, prijzen, inschrijven |
| Lestijden | Trainingstijden per groep |
| Band Knopen | Tutorial + YouTube video's |
| Foto's | Fotogalerij met lightbox |
| Video's | Videogalerij met YouTube embeds |
| Locatie | Trainingslocaties + kaart |
| Contact | Contactformulier + info |
| Nieuws | Nieuwsberichten & updates |
| Techniekenkaart | Download PDF kaarten |
| Evenementen | Toernooi-archief per jaar |
| Juridisch | Statuten, gedragscode, privacy |

## 🎨 Design System

- **Kleuren**: Rood `#a90000` / `#8d2424`, donkergrijs `#2a2a2a`
- **Backgrounds**: Licht `#f5f5f0`, donker `#1a1a1a`
- **Mobiel-first**: Grid stacking, bottom nav op mobiel
- **Geen blauwe links** - overal rode accenten

## 📊 Data Bronnen

- Exameneisen: `public/band_en_slip_exameneisen.json` (Weebly export)
- Agenda: Handmatig onderhouden in `src/data/agenda.ts`
- Technieken: Gestructureerd per categorie & band niveau
- Foto's/Video's: Georganiseerd in `src/data/gallery.ts`

## 🔄 Deployment

Push naar `main` → Vercel bouwt automatisch → Live binnen ~30 seconden.

## 📞 Contact

- **Email**: judoclub_michigami@hotmail.com
- **Facebook**: /judoclubmichigami
- **YouTube**: @UC8tXSKppIMF6awS2cj7w50A

---

*Gebouwd met ❤️ voor Judoclub Michigami - 30+ jaar judo in Steenbergen.*
