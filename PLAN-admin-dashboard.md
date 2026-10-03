# Plan: Michigami Admin Dashboard 2.0 — "Eén dashboard, alles inzichtelijk"

Datum: 2026-10-03 · Status: ONTWERP, wacht op goedkeuring Robert

## 1. Huidige staat (analyse)

### Admin dashboard (7 losse pagina's, veel heen-en-weer-klikken)
| Pagina | Inhoud | Probleem |
|---|---|---|
| /admin | 4 statistiekkaartjes, bandverdeling, locaties, recente examens | Says nothing actionable; geen ledenlijst, geen financiën, geen aanwezigheid |
| /admin/students | Ledenlijst + zoek/filter + prullenbak | Weinig kolommen; alle details alleen op detailpagina |
| /admin/students/[id] | Detail + bewerken | Extra klik voor elke gegevens |
| /admin/bandoverzicht | Huidige band, volgende band, tijd-in-band | Dubbelt met studentenlijst; aparte pagina |
| /admin/progress | Alleen Cursus Japans voortgang | Nis-pagina |
| /admin/exams (+new/[id]) | Examenadministratie | Los van bandoverzicht |
| /admin/diplomas | Diploma's | Los |
| /admin/inschrijvingen | Website-inschrijvingen (MembershipApplication) | Los; goed dat dit er is |

**Ontbreekt volledig:** aanwezigheidbeheer, contributie/facturatie, lesplanning/onderwerpen, wedstrijden, bondsnummers, bandgeschiedenis.

### Database (Neon/Prisma) — wat er wél is
- `User` + `Member` (contact, adres, geboortedatum, band, locatie, toestemmingen, noodscontact, medicalNotes) — prima basis, **blijft staan**
- `ExamAttempt` + `ExamResult` + `Diploma` (bandexamens met uitslagen) — **blijft staan**
- `CourseProgress` (Cursus Japans) — blijft
- `MembershipApplication` (inschrijvingen website) — blijft
- `Event` (agenda) — blijft
- **Ontbreekt:** Attendance, TrainingDay/lesrooster, Payment/Contributie, BondHistory, Competition, bondsnummer-veld

### Excel-bestanden op NAS (voorhermes/judo) — de waarheid over hoe gewerkt wordt
1. **aanwezigheidslijst 2026e.xlsx** (kernstuk, 8 tabbladen):
   - Tabbladen per kwartaal (1e t/m 3e bijgewerkt, 4e leeg/onjuist). Kolommen: Nr. | Achternaam | Naam | [13 vrijdagdatums] | betaald | (legenda rechts)
   - Celwaarden: `✓` (aanwezig), `A` = **afgemeld**, `v` = **vakantie/geen les**, leeg/False = **niet aanwezig (niet afgemeld)**
   - Kleuren = betaallabels: geel=gaat op examen, groen=betaald/slip-examenbetaling, paars=bandbetaling, rood=stichting leergeld, blauw=vrijgesteld
   - Leden staan in **blokken = trainingsgroepen** (1e groep, 2e groep, 3e groep, senioren/trainers onderaan)
   - Verborgen tabblad **"Bondsnummer leden"**: bondsnummer + **datums per behaalde band/slip** → dit is de budopaspoort-data!
   - Tabbladen "gegevens 2025" + "oud leden": zelfde structuur (lid sinds, gbdatum, banddatums, plaats, jaren lid)
   - "betaald"-kolom per kwartaal = contributiestatus zit nu in de lijst zelf
2. **aanwezigheidslijst ovjv.xlsx** = zelfde opzet voor **woensdag Oud-Vossemeer** (woensdagdatums)
3. **4de kwartaal betaling michigami.xlsx**: 114 factuurblokken (1 per lid, Rabo NL13 0136 9125 08, KVK 20090897, €42/kwartaal, o.i.v. 2026-10-01), Blad2 = leden per groep, Blad3 = prijstabelfunctie (contributie €42/kw, €183/jaar, administratiekosten €10, bandexamen €15, 1 maand €14, 1e/2e herinnering)
4. **Inschrijven Judoclub Michigami 8.xlsx**: oude Google Forms-inschrijvingen → allang vervangen door website-formulier, alleen voor reconciliatie
5. **Financieel overzicht 2026**: bank/kas/balans/begroting — buiten scope van het dashboard (blijft Excel), maar contributie-inkomsten kunnen er later uit gevoed worden

## 2. Doel

Eén dashboard waar alles meteen zichtbaar is:
- **PC**: breed dashboard met kolommen/widgets, alle ledengegevens uitklapbaar in de lijst zelf
- **Mobiel (op de mat!)**: compacte, duim-bedienbare aanwezigheidsmodus met grote knoppen; alles met max. 1–2 tikken
- Lokaal draaiend via Tailscale (poort 3100) bekijken en itereren vóór live

## 3. Nieuwe informatie-architectuur

Van 7 klike pagina's → **4 werkgebieden** met één startpagina:

### 🏠 Start (PC: dashboard, mobiel: compacte kaartjes)
- **Vandaag/morgen**: welke les, waar, welke groep, activiteit/onderwerp, ingelogde trainers
- **Aanwezigheid live**: lidmaatschapsstatus van de dag (aanwezig/afgemeld/ziek), direct invulbaar
- **Financiën-tegel**: # niet-betaald dit kwartaal, totaal openstaand € , knoppen: "Facturen alle niet-betaalden" / "herinneringen"
- **Inschrijvingen-tegel**: openstaande PENDING applications met goedkeurknop
- **Examen-tegel**: leden die op examen staan + volgende examendatum
- **Weken-trend**: aanwezigheidspercentage per week (grafiekje)

### 👥 Leden (vervangt students + bandoverzicht + progress)
Eén slimme tabel, sorteerbaar/filterbaar op groep/locatie/band/leeftijd/betaald:
- Rij = naam + bandstrip + groep + leeftijd + bondsnummer + betaald-vlag + volgende examen (band of slip + datum-indicatie)
- **Rij uitklappen** (inline accordion, geen pagina-wissel): adres, telefoon, ouders/contact, geboortedatum, bandgeschiedenis (datums per band/slip), examenuitslagen, Cursus Japans, wedstrijden, notities/medisch, toestemmingen
- Bewerken inline in de uitgeklapte rij (niet aparte edit-pagina)
- Zoeken = live filter

### 📅 Aanwezigheid + Lesplanning (het mat-gedeelte)
- **Kalenderblad per kwartaal**: rijen = leden (gegroepeerd per trainingsgroep), kolommen = lesdata — als de Excel, maar dan digitaal; PC-breed scrollbaar
- **Lesmodus (mobiel-first)**: kies datum → groep → grote knoppen per lid: ✅ aanwezig · 🅰 afgemeld · ❌ niet aanwezig · 🤒 ziek · 🔁 verzet · 🏖 vakantie; tik wisselt status, automatisch opgeslagen; onderaan: "activiteit/onderwerp van deze les" + notitie
- **Lesplanning**: jaar/kwartaaloverzicht met groepsrooster (woensdag Vossenkuil, vrijdag Knotwilg 1e/2e/3e groep), les toevoegen/annuleren, vakantieblokken, examen-/wedstrijddagen markeren
- Statistiek: aanwezig % per lid per periode (input voor contributie-korting/beleid en budopaspoort)

### 💰 Contributie & Facturatie
- Contributie per lid per periode (standaard €42/kwartaal, aanpasbaar: maandbedrag, vrijgesteld, stichting leergeld, administratiekosten, examen €15)
- Status per kwartaal: onbetaald / betaald / herinnering 1 / herinnering 2 / vrijgesteld
- **Knop "Genereer facturen niet-betaalden"** → PDF per lid in de stijl van de huidige factuursjabloon (clubgegevens, Rabo, KVK, betalingsvoorwaarden, namen-bestuur) + ZIP/totaaloverzicht
- Los lid aanklikken → losse factuur of herinnering (mail/WhatsApp-tekst kopiëren)
- Factuurnummers + geschiedenis (audit trail)

### 🥋 Budopaspoort (digitaal, per lid)
- Bondsnummer op Member
- Bandgeschiedenis: overgenomen uit "Bondsnummer leden" + "gegevens 2025" (datums per band/slip) + nieuwe examens lopen via ExamAttempt
- Volgende examen: band of slip + vereiste wachtijd (belt-utils heeft de logica al)
- Wedstrijden: datum, toernooi, resultaat (handmatig tekenbaar, evt. later import)
- Zichtbaar voor lid zelf op /leden (digitaal paspoort-gevoel)

## 4. Schema-uitbreiding (additief, níets slopen)

```prisma
model TrainingDay { id, date, location, group, cancelled, activity String?, notes, @@unique([date, group]) }
model Attendance  { id, memberId, trainingDayId, status enum(AANWEZIG,AFGEMELD,NIET_AANWEZIG,ZIEK,VERZET,VAKANTIE), note, @@unique([memberId, trainingDayId]) }
model ContributionPeriod { id, label "2026-Q4", start, end, amount Decimal }
model Payment     { id, memberId, periodId, amount, status enum(OPEN,BETAALD,HERINNERING1,HERINNERING2,VIJGESTELD), dueDate, invoiceNumber?, paidAt, note }
model BondHistory { id, memberId, belt BeltLevel, awardedAt, source (EXAM/IMPORT) }
model Competition { id, memberId, date, name, result?, notes }
// Member krijgt: bondsnummer String? @unique
```
- Alle tabellen nieuw → **geen migratie-risico voor bestaande data**; `prisma migrate deploy` op Neon doet alleen CREATE TABLE
- Member.bestaande velden blijven; Excel-import vult gaten op (bondsnummer, gbdatum, banddatums)

## 5. Import & reconciliatie (data staat nu op 3 plekken)

1. Importscript (TS, draait lokaal): Excel → DB
   - Leden: uit "gegevens 2025" + "Bondsnummer leden" + 2026-tabbladen; matchen op naam tegen bestaande Member-records (website-inschrijvingen)
   - **Reconciliatie-rapport**: "in Excel maar niet in DB", "in DB maar niet in Excel", "gestopt volgens Excel maar actief in DB" → in het dashboard een eigen **"Data-check"-tegel** met één-klik-oplossingen (aanmaken/archiveren/overnemen)
   - Aanwezigheid Q1–Q3 2026 + beide locaties → Attendance
   - Bandgeschiedenis → BondHistory
   - Contributiestatus "betaald"-kolommen → Payment
2. 4e kwartaal wordt in het systeem zelf ingevuld (Excel is daar onjuist — wordt genegeerd behalve factuursjabloon)
3. Daarna: Excel is verleden tijd, NAS-bestand blijft als back-up

## 6. Techniek & uitrol

- Zelfde Next.js-app, zelfde auth (isAdmin), zelfde huisstijl (#a90000, bandkleuren)
- Nieuwe layout: desktop = vaste sidebar met 4 werkgebieden + startpagina; mobiel = bottom-tabbar (Start/Leden/Les/Facturen) met grote touch-targets
- **Lokaal**: `npm run dev -p 3100` op kiebel → Robert bekijkt via Tailscale (100.89.108.51:3100) — eerst PC, dan telefoon
- Pas na akkoord: push → Vercel (sw.js cachebump! → deploy-lijst judoclub-platform skill)
- Oude admin-pagina's blijven bestaan tijdens bouw; nieuwe dashboard wordt op `/admin` gezet als alles klopt

## 7. Fases (elke fase rijdend te bekijken)

1. **Fase 0 — lokaal draaiend krijgen**: DB-bereikbaarheid lokaal (Neon-connectionstring of lokale kopie), `npm run dev:3100`, baseline-screenshots
2. **Fase 1 — Schema + import**: nieuwe tabellen + Excel-import + reconciliatierapport (data-check tegel)
3. **Fase 2 — Leden-tabel**: alles-uitklapbare lijst incl. bandgeschiedenis, bondsnummer, betaald-vlag, volgende examen
4. **Fase 3 — Aanwezigheid**: kalender + mobiele lesmodus + lesplanning/vakanties
5. **Fase 4 — Contributie & facturen**: perioden, statussen, PDF-facturen (sjabloon uit 4de-kwartaal-bestand), bulk + enkel
6. **Fase 5 — Startdashboard + budopaspoort**: alles samenkomen op 1 pagina, wedstrijden, statistiek
7. **Fase 6 — Scherp**: data-check afronden, oude Excel afzwaaien, deploy

## 7b. Belangrijke bevinding: DB is véél leger dan de Excel's (gemeten 2026-10-03)

Live-productie-DB (Neon): **13 actieve Members** (incl. testrecord "Robas Test" en "Bestuur Michigami"), 21 Users, 11 open/oude inschrijvingen, 0 ExamAttempts, 15 diploma's, 24 courseProgress. De Excel-lidlijst bevat ~45 namen (kinderen + ouders + trainers). → De website-DB is NOOIT de volledige ledenadministratie geweest; de Excel is dat wél. De import-fase is dus geen nice-to-have maar de kern: zonder import is er geen ledenlijst om bij te houden.

Reeds gezet voor lokaal draaien (fase 0, risico-vrij):
- Neon-branch **`admin-dashboard-dev`** (kopie van productie, klaar) — `.env.local` in michigami-website wijst naar deze branch via de gepoolde endpoint. Alles bouwen/testen/importeren gebeurt hier; productie blijft onaangeroerd tot jij akkoord geeft.
- Lokaal opstarten: `npm run dev -p 3100` → via Tailscale: http://100.89.108.51:3100/admin

## 8. Open vragen (antwoord van Robert nodig)

1. **DB voor lokaal draaien**: Neon-productie-connectionstring (dan zie je echte data) OF verse lokale DB + Excel-import (geen risico voor live)? → advies: lokale kopie voor bouw, importscript later tegen productie draaien
2. Bevestig cel-afspraken: `✓`=aanwezig, `A`=afgemeld, `v`=vakantie/geen les, leeg=niet aanwezig niet-afgemeld. Klopt dat?
3. Blokken in de lijst = 1e groep / 2e groep / 3e groep / senioren+trainers — klopt die indeling en welke groepen bestaan er nu precies?
4. Contributie: €42/kwartaal, €183/jaar, €14/maand, examen €15, admin €10 — actuele bedragen?
5. Wedstrijdregistratie: alleen bijhouden (datum+naam+resultaat) of ook uitslagen-import?
