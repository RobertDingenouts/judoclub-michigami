# Michigami Judo Website - Content Migration Plan

## Overview
- **Source**: Weebly export (48 HTML pages, 1229 images)
- **Target**: Next.js 16 site (currently has Home, Agenda, Exam Dashboard, Techniques)
- **Goal**: Migrate all missing content from Weebly to new site

## Missing Content Categories

### 1. Club Information (info.html, info1.html)
- Club history, philosophy, team
- **Priority**: HIGH
- **Format**: New data file + section component

### 2. Band-knopen (band-knopen.html)
- Belt knot instructions with images
- **Priority**: HIGH
- **Format**: New data file with belt names + image references

### 3. Fotos (fotos.html, overige-fotos.html)
- Photo gallery with images
- **Priority**: MEDIUM
- **Format**: Gallery component + image extraction

### 4. Videos (videos.html)
- Video content
- **Priority**: MEDIUM
- **Format**: Video embed component

### 5. Lid-worden (lid-worden.html)
- Membership information, forms
- **Priority**: HIGH
- **Format**: New page/section with membership tiers

### 6. Locatie (locatie.html)
- Location details, map
- **Priority**: MEDIUM
- **Format**: Location component with address

### 7. Contact (contact.html)
- Contact information
- **Priority**: MEDIUM
- **Format**: Contact section

### 8. Lestijden (lestijden.html)
- Class schedules
- **Priority**: HIGH
- **Format**: Schedule table/data file

### 9. Nieuws (nieuws.html)
- News articles
- **Priority**: MEDIUM
- **Format**: News feed component

### 10. Techniekenkaart (techniekenkaart.html)
- Techniques card/reference
- **Priority**: LOW
- **Format**: Reference card component

### 11. Cursus-japans (cursus-japans.html)
- Japanese course content
- **Priority**: MEDIUM
- **Format**: Course data file + section

### 12. Technieken sub-pages (10 HTML files)
- beenworpen, heupworpen, schouderworpen, armworpen, offerworpen
- houdgrepen, wurgingen, armklemmen, kanteltechnieken, valbreken
- **Priority**: MEDIUM
- **Format**: Integration into existing techniques module

### 13. Event pages (14 HTML files)
- 2025, 2026, clubkampioenschappen, budodag, etc.
- **Priority**: LOW
- **Format**: Archive/event section

### 14. Legal pages (4 HTML files)
- algemene-voorwaarden, gedragscode, privacyverklaring
- **Priority**: LOW
- **Format**: Legal section

## Migration Strategy

### Phase 1: Critical Content (HIGH priority)
1. Club info (info.html, info1.html)
2. Band-knopen (band-knopen.html)
3. Lid-worden (lid-worden.html)
4. Lestijden (lestijden.html)

### Phase 2: Important Content (MEDIUM priority)
5. Fotos (fotos.html, overige-fotos.html)
6. Videos (videos.html)
7. Locatie (locatie.html)
8. Contact (contact.html)
9. Nieuws (nieuws.html)
10. Cursus-japans (cursus-japans.html)
11. Technieken sub-pages (10 HTML files)

### Phase 3: Archive Content (LOW priority)
12. Techniekenkaart (techniekenkaart.html)
13. Event pages (14 HTML files)
14. Legal pages (4 HTML files)

## Implementation Details

### Data Files to Create
- `src/data/club-info.ts` - Club history, philosophy, team
- `src/data/belt-knots.ts` - Belt knot instructions
- `src/data/membership.ts` - Membership tiers, pricing
- `src/data/schedule.ts` - Class schedules
- `src/data/news.ts` - News articles
- `src/data/events.ts` - Event history
- `src/data/legal.ts` - Legal documents
- `src/data/gallery.ts` - Photo gallery references

### Components to Create
- `src/components/sections/ClubInfoSection.tsx`
- `src/components/sections/BeltKnotsSection.tsx`
- `src/components/sections/MembershipSection.tsx`
- `src/components/sections/ScheduleSection.tsx`
- `src/components/sections/NewsSection.tsx`
- `src/components/sections/EventArchiveSection.tsx`
- `src/components/sections/LegalSection.tsx`
- `src/components/gallery/PhotoGallery.tsx`
- `src/components/gallery/VideoGallery.tsx`

### Image Extraction
- Extract images from Weebly exports
- Optimize and convert to WebP format
- Store in `public/uploads/` directory
- Update references in data files

## File Mapping

| Weebly Page | New Location |
|-------------|--------------|
| info.html | src/data/club-info.ts + ClubInfoSection |
| band-knopen.html | src/data/belt-knots.ts + BeltKnotsSection |
| fotos.html | public/uploads/ + PhotoGallery component |
| videos.html | public/uploads/ + VideoGallery component |
| lid-worden.html | src/data/membership.ts + MembershipSection |
| locatie.html | src/app/page.tsx (new section) |
| contact.html | src/app/page.tsx (new section) |
| lestijden.html | src/data/schedule.ts + ScheduleSection |
| nieuws.html | src/data/news.ts + NewsSection |
| cursus-japans.html | src/data/japanese-course.ts + JapaneseSection |
| techniekenkaart.html | src/app/page.tsx (new section) |
| [10 technique sub-pages] | Integrate into existing techniques.ts |
| [14 event pages] | src/data/events.ts + EventArchiveSection |
| [4 legal pages] | src/data/legal.ts + LegalSection |

## Progress
- [ ] Phase 1: Critical content migration
- [ ] Phase 2: Important content migration
- [ ] Phase 3: Archive content migration
- [ ] Image extraction and optimization
- [ ] Testing and deployment
