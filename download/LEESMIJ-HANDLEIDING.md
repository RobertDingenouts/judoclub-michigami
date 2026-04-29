# Judo Exameneisen Dashboard - Handleiding

## 📁 Bestanden

- **`judo-exameneisen-dashboard.html`** - Compleet standalone HTML bestand (werkt zonder server)
- **`judo-exam-requirements.json`** - Data bestand voor database/LLM gebruik

---

## 🚀 Gebruik

### Openen
1. Download het bestand `judo-exameneisen-dashboard.html`
2. Open het in een webbrowser (dubbelklik of rechtsklik → Openen met)
3. Het werkt direct, geen installatie nodig!

### Plaatsen op website
1. Upload het HTML bestand naar je webserver
2. Of plak de inhoud in een bestaande pagina

---

## 🎨 Kleuren Aanpassen

Zoek bovenin het HTML bestand de `:root` sectie (rond regel 15):

```css
:root {
  --primary: #8B0000;      /* Donkerrood - hoofdkleur */
  --secondary: #DC143C;    /* Crimson - accent kleur */
  --accent: #FFD700;       /* Goud - highlights */
  --dark: #1a1a1a;         /* Bijna zwart */
  --light: #f8f8f8;        /* Lichte achtergrond */
  --text: #333333;         /* Tekst kleur */
}
```

Pas de kleurcodes aan (bijv. `#FF0000` voor rood).

---

## 📸 Plaatjes Toevoegen

### Stap 1: Plaats plaatjes in een map
Maak een map `images` naast het HTML bestand en zet daar je plaatjes in.

### Stap 2: Voeg plaatje toe aan een techniek
Zoek de techniek in de `CATEGORIES` sectie en voeg `image` toe:

```javascript
{ 
  id: 'ashi-1', 
  nameJa: 'O-soto-gari', 
  nameNl: 'Grote buitenwaartse veeg',
  image: 'images/o-soto-gari.jpg'  // ← Voeg dit toe
},
```

### Stap 3: Zorg dat detailniveau op "Met vertaling" staat
Plaatjes worden alleen getoond bij het hoogste detailniveau.

---

## 🎬 Video's Toevoegen

### Optie 1: Eigen video bestand
```javascript
{ 
  id: 'ashi-1', 
  nameJa: 'O-soto-gari', 
  nameNl: 'Grote buitenwaartse veeg',
  video: 'videos/o-soto-gari.mp4'  // MP4 bestand
},
```

### Optie 2: YouTube video
```javascript
{ 
  id: 'ashi-1', 
  nameJa: 'O-soto-gari', 
  nameNl: 'Grote buitenwaartse veeg',
  youtubeId: 'dQw4w9WgXcQ'  // Het ID uit youtube.com/watch?v=XXXXX
},
```

### Video mapstructuur
```
📁 jouw-map/
├── judo-exameneisen-dashboard.html
├── 📁 images/
│   ├── o-soto-gari.jpg
│   └── ...
└── 📁 videos/
    ├── o-soto-gari.mp4
    └── ...
```

---

## ➕ Nieuwe Techniek Toevoegen

### Stap 1: Voeg techniek toe aan categorie
Zoek de juiste categorie in `CATEGORIES` en voeg een techniek toe:

```javascript
'ashi-waza': {
  nameNl: 'Beenworpen',
  nameJa: 'Ashi-waza',
  icon: '🦵',
  techniques: [
    { id: 'ashi-1', nameJa: 'O-soto-gari', nameNl: 'Grote buitenwaartse veeg' },
    { id: 'ashi-2', nameJa: 'De-ashi-barai', nameNl: 'Voorwaartse voetveeg' },
    // Voeg nieuwe techniek toe:
    { id: 'ashi-16', nameJa: 'Nieuwe-techniek', nameNl: 'Nieuwe techniek' },
  ]
},
```

### Stap 2: Update exameneisen
Pas `BELT_REQUIREMENTS` aan als het aantal technieken verandert:

```javascript
'bruin': {
  requirements: {
    'ashi-waza': 16,  // Verhoogd van 15 naar 16
    // ...
  },
  nageKomi: 20, kantelTechnieken: 5
}
```

---

## ➕ Nieuwe Band/Slip Toevoegen

### Stap 1: Voeg band toe aan `BELT_LEVELS`

```javascript
const BELT_LEVELS = [
  // ... bestaande banden ...
  { id: 'zwart', name: 'Zwarte band', kyu: null, color: '#000000', isSlip: false },
];
```

### Stap 2: Voeg exameneisen toe aan `BELT_REQUIREMENTS`

```javascript
const BELT_REQUIREMENTS = {
  // ... bestaande eisen ...
  'zwart': {
    requirements: {
      'ashi-waza': 15,
      'koshi-waza': 15,
      // etc.
    },
    nageKomi: 25,
    kantelTechnieken: 6
  }
};
```

---

## 🗑️ Techniek Verwijderen

### Stap 1: Verwijder uit categorie
Haal de techniek weg uit de `techniques` array.

### Stap 2: Update exameneisen
Verlaag de aantallen in `BELT_REQUIREMENTS` indien nodig.

---

## 🔧 Iconen Wijzigen

Elke categorie heeft een icon:

```javascript
'ashi-waza': {
  nameNl: 'Beenworpen',
  icon: '🦵',  // ← Wijzig dit emoji
  // ...
},
```

Beschikbare emoji's die goed passen:
- 🦵 Been
- 🔄 Draaien
- 💪 Spierkracht
- 🤚 Hand
- ⬇️ Omlaag
- 🔒 Slot
- 😤 Gezicht
- 🛡️ Schild

Of gebruik tekst zoals "Beenworpen" als je geen emoji wilt.

---

## 🌐 Op Je Eigen Website Plaatsen

### WordPress
1. Ga naar Pagina's → Nieuwe pagina
2. Klik op het tabblad "HTML" of gebruik een "Custom HTML" blok
3. Plak de volledige HTML code

### JudoClub Michigami website
1. Log in op je website beheer
2. Maak een nieuwe pagina of bewerk een bestaande
3. Plak de HTML code in de HTML-modus

### Los bestand uploaden
1. Upload het bestand via FTP naar je webserver
2. Het is dan bereikbaar op: `https://jouwwebsite.nl/judo-exameneisen.html`

---

## 💡 Tips

### Performance
- Houd plaatjes klein (max 500KB per plaatje)
- Gebruik MP4 video's van max 5MB
- YouTube video's laden trager maar besparen bandbreedte

### Backups
- Maak altijd een backup voordat je het bestand aanpast
- Sla verschillende versies op (bijv. `judo-examen-v1.html`, `judo-examen-v2.html`)

### Testen
- Test in verschillende browsers (Chrome, Firefox, Safari)
- Test ook op mobiel!

---

## 📞 Hulp Nodig?

Neem contact op met de developer of raadpleeg de broncode comments.

---

## Versie Geschiedenis

| Versie | Datum | Wijzigingen |
|--------|-------|-------------|
| 1.1.0 | 2024 | Kata-waza gecorrigeerd naar 6 technieken, clubkleuren |
| 1.0.0 | 2024 | Eerste versie |
