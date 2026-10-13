export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  date?: string; // YYYY-MM-DD or just YYYY
  imageUrl?: string;
}

export interface NewsYear {
  year: number;
  articles: NewsArticle[];
}

export const newsArchive: NewsYear[] = [

  {
    year: 2026,
    articles: [

      {
        id: "lintjestoernooi-oktober-2026",
        title: "Lintjestoernooi — trots op onze judoka's! 🥋",
        content:
          "Afgelopen zondag stond het Lintjestoernooi in Roosendaal op het programma en onze judoka's hebben het geweldig gedaan! Ze vochten heel fel en lieten mooie, verschillende technieken zien. Ik ben echt trots op ze. 💪\n\nDe puntenstand:\n🥋 Vive — 191\n🥋 Ariël — 51\n🥋 Yord — 36\n🥋 Rayn — 33\n🥋 Benjamin — 20\n🥋 Myla — 20\n\nEn een hele mooie mijlpaal: Ariël behaalde haar eerste lintje, het gele lintje! Gefeliciteerd Ariël! 🎉\n\nVoor de judoka's die meededen was het meteen een mooie oefening voor het Jubileumtoernooi van OVJV aanstaande zaterdag in Oud-Vossemeer. Veel succes daar! 👊\n\nOp zondag 8 november is de volgende editie van het Lintjestoernooi. Wil je ook meedoen? Inschrijven kan via: https://budoschool-corschuurbiers.nl/3-3/",
        date: "2026-10-13",
        imageUrl: "/instagram/202610/geel-lintje-lintjestoernooi-okt2026.webp",
      },

      {
        id: "rabo-clubsupport-2026",
        title: "🗳️ Steun Judoclub Michigami bij Rabo ClubSupport 2026!",
        content:
          "Het is weer zover: de stemperiode van Rabo ClubSupport is geopend! 💙🧡\n\nVan 7 t/m 29 september kun je weer stemmen op jouw favoriete clubs. En natuurlijk doen wij met Judoclub Michigami dit jaar ook weer mee!\n\nElke stem brengt ons een stap dichter bij onze clubdoelen. Ben je klant bij de Rabobank? Vergeet dan niet om je stem op ons uit te brengen via de Rabo App (Instellingen > Lidmaatschap > Rabo ClubSupport).\n\nHelp je mee?\n\n• Breng zelf je stem uit op Judoclub Michigami!\n• Vraag ook je gezinsleden, familie, vrienden en buren om op ons te stemmen.\n\nWist je dat stemmen al kan vanaf 12 jaar (met toestemming van een ouder/verzorger in de app via Ouderlijk toezicht)?\n\nDe uitslag is bekend tussen 5 en 16 oktober. Alvast ontzettend bedankt voor jullie steun! Samen maken we Michigami nog sterker! 💪🥋",
        date: "2026-09-07",
        imageUrl: "/stem-rabo-clubsupport-2026.jpg",
      },

      {
        id: "gratis-inschrijven-actie-2026",
        title: "🎁 Actie: gratis inschrijven vóór 31 december!",
        content:
          "We hebben goed nieuws! Als je vóór 31 december 2026 bij Judoclub Michigami inschrijft, betaal je géén inschrijfgeld van €15. Zo kun je dit jaar nog voordelig starten met judo! 🥋\n\nHoe werkt het?\n\n1️⃣ Schrijf je in voor een gratis proefles via de 'Proefles' knop op onze website.\n2️⃣ Kom 3x gratis proeflessen volgen en ervaar zelf wat judo met je doet.\n3️⃣ Bevalt het? Schrijf je dan vóór 31 december in en bespaar je de €15 inschrijfkosten!\n\nVoor iedereen vanaf 6 jaar — van kind tot volwassene. We trainen woensdagavond in Oud-Vossemeer (De Vossenkuil) en vrijdagavond in Steenbergen (Sportcentrum de Knotwilg).\n\nDit doen we in samenwerking met Sportcentrum de Knotwilg Steenbergen. Kom langs, we zien je op de mat! 🙌",
        date: "2026-08-23",
      },

      {
        id: "examenresultaten-februari-2026",
        title: "Examenresultaten — mooie vooruitgang! 🎉",
        content:
          "Hard werken en doorzetten wordt beloond. We zijn trots op de mooie vooruitgang die onze judoka's vorige week hebben laten zien:\n\n⚪ 4x Witte band\n🟡 3x Gele slip\n🟡 5x Gele band\n🟠 2x Oranje slip\n🟠 2x Oranje band\n🟢 3x Groene slip\n\nGefeliciteerd allemaal! 🎉",
        date: "2026-02",
        imageUrl: "/instagram/202602/17880571311378479.webp",
      },

      {
        id: "lintjestoernooi-februari-2026",
        title: "Lintjestoernooi — Mika, Lotte, Vive en Luuk!",
        content:
          "Gisteren hebben Mika, Lotte, Vive en Luuk weer hard gevochten en veel ervaring opgedaan bij het Lintjestoernooi. Ze hebben het alle vier goed gedaan en mooie punten gescoord met worpen en houdgrepen.\n\nDe behaalde punten:\n🥋 Vive — 174\n🥋 Lotte — 61\n🥋 Mika — 59\n🥋 Luuk — 40\n\nMika en Luuk hebben gisteren hun gele lintje behaald, gefeliciteerd!\n\nOp 8 maart is de volgende editie.",
        date: "2026-02",
        imageUrl: "/instagram/202602/18086493668155953.webp",
      }
    ],
  },

  {
    year: 2025,
    articles: [

      {
        id: "teun-gele-slip-augustus-2025",
        title: "Teun geslaagd voor gele slip — na operatie doorgezet! 💪",
        content:
          "Voor de vakantie moest Teun zijn examen even uitstellen vanwege een operatie, maar gisteren heeft hij dat goedgemaakt: geslaagd voor zijn gele slip! 🥋💪 Gefeliciteerd Teun! #doorzetten",
        date: "2025-08",
        imageUrl: "/instagram/202508/18343839076164581.webp",
      },

      {
        id: "14-judoka-examen-juni-2025",
        title: "14 judoka's — allemaal gehaald! 🔥",
        content:
          "Gisteravond hebben 14 judoka's hun band of slipexamen gedaan — en allemaal gehaald! 💪 Ze hebben ervoor moeten zweten… letterlijk! Het ging er zó fanatiek aan toe dat er zelfs stoom van de mat kwam 🔥\n\nGefeliciteerd toppers, jullie hebben het verdiend! 🥳",
        date: "2025-06",
        imageUrl: "/instagram/202506/17911599114036467.webp",
      },

      {
        id: "witte-banden-mei-2025",
        title: "Toppers geslaagd voor de witte band! 🥋",
        content:
          "Deze toppers hebben gisteren laten zien dat ze de grondbeginselen van judo onder de knie hebben! Allemaal geslaagd voor de witte band. De kwaliteit was zichtbaar: je zag dat er extra geoefend was. Trots op onze judoka's! 💪",
        date: "2025-05",
        imageUrl: "/instagram/202505/18059800228932051.webp",
      },

      {
        id: "lola-witte-band-2025",
        title: "Lola geslaagd voor de Witte Band!",
        content:
          "En ook Lola geslaagd voor de Witte Band! 🥋 Keurig examen afgelegd, dik verdiend! 💪",
        date: "2025-05",
        imageUrl: "/instagram/202505/17964879629866342.webp",
      },
      {
        id: "spelletjesdag-februari-2025",
        title: "Spelletjesdag bij Judoclub Michigami! 🎲",
        content:
          "De laatste training voor de vakantie is bij ons meestal spelletjesdag! We doen dan allerlei spellen die te maken hebben met judo, snelheid en reactievermogen. Zo speelden we voor de kerstvakantie vorig jaar ons eigen judoganzebord, ontworpen door Robin Hack.",
        date: "2025-02",
        imageUrl: "/instagram/202502/18083536591593823.webp",
      },

      {
        id: "lintjestoernooi-januari-2025",
        title: "Eerste Lintjestoernooi van 2025 — Trots op onze judoka's!",
        content:
          "Vandaag vond het eerste lintjestoernooi van 2025 plaats bij Budoschool Cor Schuurbiers in Roosendaal. Onze judoka's hebben hard gevochten en veel ervaring opgedaan.\n\nTrots op onze judoka's! Afgelopen zondag lieten ze weer mooie prestaties zien op de mat.",
        date: "2025-01-12",
      },
      {
        id: "examen-resultaten-januari-2025",
        title: "Trots op onze judoka's — Examenresultaten",
        content:
          "Hard werken en doorzetten wordt beloond. We zijn trots op de mooie vooruitgang die onze judoka's vorige week hebben laten zien:\n\n⚪ 4x Witte band\n🟡 3x Gele slip\n🟠 2x Oranje band\n🟢 3x Groene slip\n\nGefeliciteerd allemaal! Deze resultaten zijn dik verdiend na maanden van hard trainen.",
        date: "2025-01",
      },
      {
        id: "examen-februari-2025",
        title: "Twee judoka's geslaagd — Gele slip, gele band en oranje band!",
        content:
          "Gisteren waren er weer examens! Twee judoka's haalden hun gele slip, één de gele band en één zelfs de oranje band!\n\nEn ook Lola geslaagd voor de Witte Band! Keurig examen afgelegd — dik verdiend!\n\nFeliciteringen aan alle geslaagden!",
        date: "2025-02",
      },
      {
        id: "vriendjesdag-september-2025",
        title: "Vriendjesdag 2025 — Kom gratis judo proef doen!",
        content:
          "Kom gezellig met ons mee trainen op vrijdagavond! Tijdens de Vriendjesdag mag je gratis een les judo komen proef doen. De eerste 3 lessen zijn gratis voor nieuwe leden. Kom langs in Sportcentrum de Knotwilg in Steenbergen of De Vossenkuil in Oud-Vossemeer!",
        date: "2025-06",
      },
      {
        id: "rabo-clubsupport-september-2025",
        title: "✨ Rabo ClubSupport 2025 — Stem op Judoclub Michigami!",
        content:
          "Het is weer zover! Judoclub Michigami doet mee aan Rabo ClubSupport. Stem tussen 1 en 23 september via de Rabo App en steun onze club!\n\nOpen de Rabo App → Ga naar Lidmaatschap > Rabo ClubSupport → Stem op Judoclub Michigami.\n\nIedere stem telt en helpt ons om mooie dingen voor de club te realiseren. Bedankt voor jouw steun!",
        date: "2025-09-01",
      },
      {
        id: "lintjestoernooi-mika-lotte-vive-luuk-2025",
        title: "Mika, Lotte, Vive en Luuk — Lintjestoernooi resultaten",
        content:
          "Gisteren hebben Mika, Lotte, Vive en Luuk weer hard gevochten en veel ervaring opgedaan bij het Lintjestoernooi. Ze hebben het alle vier goed gedaan!\n\nDe behaalde punten:\n• Vive — 174 punten\n• Lotte — 61 punten\n• Mika — 59 punten\n• Luuk — 40 punten\n\nMika en Luuk hebben gisteren hun gele lintje behaald, gefeliciteerd! Op 8 maart is de volgende editie. Wil je ook meedoen? Inschrijven via: https://budoschool-corschuurbiers.nl/3-3/",
        date: "2025",
      },
      {
        id: "laatsteseizoen-spelletjesdag-examens-2025",
        title: "Laatste judoles van het seizoen — Spelletjesdag + Examens!",
        content:
          "De laatste judoles van het seizoen was niet alleen een gezellige spelletjesdag, maar ook het moment voor een paar verlate examens!\n\nTwee judoka's haalden hun gele slip, één de gele band en één zelfs de oranje band! 💪✨ Wat een mooie afsluiting van het seizoen — vol inzet én plezier.\n\nStuk voor stuk dichter bij dat grote doel: de zwarte band 🖤 Blijf trainen, blijf groeien — jullie zijn op de goede weg. We zijn trots op jullie inzet!\n\nFijne zomer allemaal en tot na de vakantie! 🌞",
        date: "2025-06",
        imageUrl: "/instagram/202506/18033414857673919.webp",
      }
    ],
  },

  {
    year: 2024,
    articles: [

      {
        id: "shintai-jubileumtoernooi-2024",
        title: "Actief judoweekend — Shintai jubileumtoernooi + Lintjestoernooi",
        content:
          "Afgelopen weekend was een actief judoweekend voor Michigami.\n\nVrijdag hebben Teun en Maan hun witte band diploma gehaald.\n\nZaterdag deden 8 judoka's mee aan het jubileumtoernooi van Shintai in Halsteren (25-jarig bestaan):\n• Jax: 1e plaats\n• Ashley en Lucas: 2e plaats\n• Damian en Julia: 3e plaats\n• Lotte en Ivo: 4e plaats\n• Lola: 5e plaats\n\nZondag ervaring opgedaan bij het Lintjestoernooi — Vive en Ivo haalden hun eerste lintje!\n\nPuntenstand: Ivo 45, Vive 42, Luuk 24, Jan 18.",
        date: "2024-12",
        imageUrl: "/instagram/202412/18033690059145049.webp",
      },

      {
        id: "18-judoka-examen-december-2024",
        title: "18 judoka's behalen nieuwe band of slip!",
        content:
          "Afgelopen vrijdag hebben maar liefst 18 judoka's een nieuwe band of slip behaald. Tijdens de examens lieten ze zien hoe hard ze geoefend hebben. Bij het opnoemen van de Japanse benamingen wisten velen direct de juiste technieken te laten zien — knap gedaan!\n\nWe zijn trots op jullie inzet en doorzettingsvermogen. Blijf zo doorgaan, op naar de volgende band of slip!",
        date: "2024-12",
        imageUrl: "/instagram/202412/18048006761489114.webp",
      },

      {
        id: "lintjestoernooi-november-2024",
        title: "Lintjestoernooi Roosendaal — 7 judoka's mee!",
        content:
          "Vandaag hebben zeven judoka's van Judoclub Michigami meegedaan aan het Lintjestoernooi van Cor Schuurbiers in Roosendaal! Een mooie kans om ervaring op te doen in een ontspannen sfeer.\n\n📊 Behaalde punten:\n🥋 Merijn — 13\n🥋 Jayden — 16\n🥋 Jochem — 18\n🥋 Lola — 18\n🥋 Jax — 18\n🥋 Vive — 21\n🥋 Ivo — 21\n\nDe volgende ronde staat gepland op 8 december.",
        date: "2024-11",
        imageUrl: "/instagram/202411/17853748029319957.webp",
      },

      {
        id: "examens-einde-schooljaar-2024",
        title: "Succesvolle examens — einde schooljaar 2024",
        content:
          "Gisteravond was een succesvolle afsluiting van het schooljaar met de examens voor witte banden, gele slips, gele banden en een oranje band. Iedereen heeft superhard getraind en dat was te zien! De kwaliteit was echt hoog, wat een topprestaties. We zijn supertrots op jullie allemaal.",
        date: "2024-06",
        imageUrl: "/instagram/202406/18007030151320287.webp",
      },

      {
        id: "wendy-jansen-1e-dan-2024",
        title: "Wendy Jansen behaalt 1e Dan zwarte band! 🎉",
        content:
          "Trots moment bij de judoles gisterenavond! Wendy Jansen heeft met succes haar 1e dan zwarte band behaald. Om haar dankbaarheid te tonen, bedankte ze haar sensei's, uke en judopartners met zelf gegraveerde glazen met 'arigato' en een judo illustratie. De kinderen kregen allemaal een zakje snoep of chips.\n\nGefeliciteerd Wendy! 🥋👏",
        date: "2024-06",
        imageUrl: "/instagram/202406/18022436702039909.webp",
      },

      {
        id: "judo-takeover-video-2024",
        title: "Keep holding on! #judo #takeover",
        content:
          "Bekijk onze nieuwe video op Facebook en Instagram — een leuke kijk achter de schermen van Judoclub Michigami. Kom zelf ook eens kijken of meetrainen!",
        date: "2024-03-20",
      },
      {
        id: "vriendjesdag-2024",
        title: "Vriendjes- en vriendinnetjesdag 2024",
        content:
          "Kom gezellig met ons mee trainen op vrijdagavond! Tijdens de Vriendjes- en vriendinnetjesdag mag je gratis een les judo komen proef doen. De eerste 3 lessen zijn gratis voor nieuwe leden. Kom langs in Sportcentrum de Knotwilg in Steenbergen!",
        date: "2024-06",
      },
      {
        id: "open-clubkampioenschappen-2024",
        title: "Open Clubkampioenschappen 2024 — Wat een fantastische avond!",
        content:
          "Wat een fantastische avond tijdens de Open Clubkampioenschappen 2024! De sfeer was gezellig en vriendschappelijk, met fanatieke judoka's die hun beste gevechten leverden. Ook bij de senioren was er veel actie — we hadden een mooi aantal judoka's die erg aan het knokken waren.\n\nDe junioren lieten geweldige acties zien tijdens de Open Clubkampioenschappen 2024 in Steenbergen! Geniet mee van de mooiste momenten en technieken.\n\nBedankt aan alle deelnemers, ouders en vrijwilligers voor een geslaagd toernooi!",
        date: "2024-09-27",
      },
      {
        id: "rabo-clubsupport-september-2024",
        title: "✨ Rabo ClubSupport — Stem op Judoclub Michigami!",
        content:
          "Het is weer zover! Judoclub Michigami doet mee aan Rabo ClubSupport. Stem tussen 1 en 23 september via de Rabo App en steun onze club!\n\nOpen de Rabo App → Ga naar Lidmaatschap > Rabo ClubSupport → Stem op Judoclub Michigami.\n\nIedere stem telt en helpt ons om mooie dingen voor de club te realiseren. Bedankt voor jouw steun!",
        date: "2024-09-01",
      },
      {
        id: "chocolade-trainers-2024",
        title: "De trainers werden verwend met chocolade judogi 🍫",
        content:
          "De trainers werden verwend door een creatieve judoka met een lekkere reep chocola, prachtig verpakt als een judogi. Wat een heerlijke en attente verrassing! Dankjewel voor deze leuke attentie.",
        date: "2024-10",
      },
      {
        id: "sinterklaas-video-2024",
        title: "Belangrijk bericht van Sinterklaas! 🎅",
        content:
          "Sinterklaas is langs geweest bij Judoclub Michigami! Bekijk de video op onze Facebook pagina voor een belangrijk bericht aan alle judoka's. Sinterklaas herinnert iedereen eraan om door te trainen en hun best te doen!",
        date: "2024-11-30",
      },      {
        id: "cjjf-kata-training-2024",
        title: "CJJF Kata en technische training in onze dojo",
        content:
          "Gisteren vond de CJJF Kata en technische training plaats in onze dojo. Het was een prachtige gelegenheid om weer in contact te komen met andere judoka's van de CJJF Budo, van elkaar te leren en voor sommigen om nog goed te trainen voor de komende Dangraden (zwarte banden) examens.",
        date: "2024-03",
        imageUrl: "/instagram/202403/18338069749129662.webp",
      },

      {
        id: "nieuwe-matten-vriendjesdag-2024",
        title: "Nieuwe matten — dankzij donatie Kruisbeek!",
        content:
          "Wat een geweldige week voor Judoclub Michigami Steenbergen! Na jarenlang sparen en dankzij een donatie hebben we deze nieuwe matten kunnen aanschaffen. We hebben ze meteen getest met een leuke, drukbezochte vriendjes- en vriendinnetjes training.\n\nSpeciale dank aan de opgeheven schaatsbaan de Kruisbeek voor hun donatie. Jullie hebben ons enorm geholpen!\n\nOok willen wij graag Bas Carwash Team, Hans Dingenouts, Robert Dingenouts, Robin Hack en Pascal Hack bedanken voor het sjouwen, schoonmaken en leggen van de nieuwe matten.",
        date: "2024-03",
        imageUrl: "/instagram/202403/17874703655999244.webp",
      }
    ],
  },

  {
    year: 2018,
    articles: [

      {
        id: "25-jaar-judoclub-michigami",
        title: "25 Jaar Judoclub Michigami",
        content:
          "Dit jaar bestaat Judoclub Michigami al 25 jaar! Dat vierden wij met een judotoernooi op 6 oktober. Het was een geslaagde dag en de deelnemers gingen met mooie prijzen naar huis. Alle vrijwilligers weer bedankt voor de hulp.\n\nOok onze judoka's wisten allemaal een mooi prijsje te bemachtigen:\n\n1e plaats: Tobias Plasmans, Robert Dingenouts\n2e plaats: Yves Harmsen, Siep van der Pligt, Renske van den Berg\n3e plaats: Tycho Glandorf, Nena van Roosendaal\n4e plaats: Cosette Harmsen, Kjeld Glandorf",
        date: "2018-10-06",
      },

      {
        id: "zomervakantie-2018",
        title: "Zomervakantie 2018 weer voorbij",
        content:
          "Vrijdag 24 augustus beginnen de judolessen eindelijk weer. Ik hoop dat jullie een fijne vakantie hebben gehad en weer vol energie zitten om er weer keihard tegenaan te gaan, tot vrijdag!",
        date: "2018-08-24",
      },

      {
        id: "paastoernooi-uitslag-2018",
        title: "Uitslag Paastoernooi",
        content:
          "Ook op het paastoernooi van OVJV op 31 maart waren enkele van onze judoka's weer actief. Amelie en Yves Harmsen gingen met de 2e prijs mee naar huis. Cosette Harmsen en Tobias Plasmans wisten de 3e plaats te bemachtigen. Keurige prestatie!",
        date: "2018-03-31",
      },

      {
        id: "cjjf-bondskampioenschappen-bergen-op-zoom-2018",
        title: "CJJF Bondskampioenschappen Bergen op Zoom",
        content:
          "Afgelopen zaterdag 3 maart vonden de eerste van 4 bondskampioenschappen van 2018 plaats in Bergen op Zoom. Judoclub Michigami was vertegenwoordigd met 6 judoka's. Allemaal gingen zij met een mooie beker naar huis dus weer een mooie prestatie!\n\n3e plaats: Amelie Harmsen, Kjeld Glandorf\n2e plaats: Cosette Harmsen\n1e plaats: Yves Harmsen, Tycho Glandorf, Robert Dingenouts\n\nEr worden 4 bondskampioenschappen gehouden dit jaar, aan het einde van het jaar wordt gekeken wie de kampioenen zijn voor elke categorie en maken de judoka's kans op een grote wisselbeker. Ze zijn al goed op weg!",
        date: "2018-03-03",
      },

      {
        id: "toernooi-yukio-tani-huijbergen-2018",
        title: "Toernooi Yukio Tani Huijbergen",
        content:
          "Onze judoka's gingen wederom allemaal met een prijs naar huis op het Toernooi van Yukio Tani in Huijbergen. Met de 1e plaats voor Cosette Harmsen, 2e plaats voor Yves Harmsen, Amelie Harmsen en Kian van Dorst, 3e plaats voor Kjeld Glandorf en Tycho Glandorf. Gefeliciteerd!",
        date: "2018",
      },

      {
        id: "cjjf-bondstournooi-michigami-2018",
        title: "CJJF Bondstournooi bij Michigami",
        content:
          "Dit jaar hebben we mede mogelijk gemaakt dat er in sporthal De Buitelstee in Dinteloord de CJJF bondskampioenschappen gehouden konden worden. Onze judoka's hebben allemaal na hard knokken weer mooie prijzen mee naar huis genomen!",
        date: "2018",
      }
    ],
  },

  {
    year: 2017,
    articles: [

      {
        id: "witte-gele-banden-toernooi-heerle-2017",
        title: "Witte en gele banden toernooi Heerle",
        content:
          "Zaterdag 19 november werd door judovereniging Garami in Heerle het witte en gele banden toernooi georganiseerd. Er kwamen veel jonge judoka's op af vanuit Nederland, België en Engeland. Onze judoka's van Michigami hebben er goed gepresteerd en haalden vele prijzen weg. Siep van der Pligt zat in een hele sterke poule en werd na hard knokken 4e. Kjeld en Tycho Glandorf gingen allebei met de 3e plaats mee naar huis. Cosette en Amelie Harmsen en Kian van Dorst wisten de 2e plaats te bemachtigen. Brenden Snel en Tobias Plasmans wisten alle wedstrijden te winnen en behaalden de 1e plaats. Wij zijn trots op jullie!",
        date: "2017-11-19",
      },

      {
        id: "3e-dan-geslaagd-2017",
        title: "Judoka's/Trainers Michigami Geslaagd voor 3e Dan",
        content:
          "Zaterdag 4 juni werden in Steenbergen in de Knotwilg de Dan examens afgenomen van de CJJF. Na een tijd lang hard trainen gingen 4 judoka's van Michigami: Robin Hack, Pascal Hack, Robert Dingenouts en John Kok op voor hun 3e dan. Alle 4 zijn zij geslaagd en er werd bij vermeld dat het niveau wederom erg hoog lag bij alle kandidaten dit jaar.",
        date: "2017-06-04",
      },

      {
        id: "budo-kidsdag-budodag-2017",
        title: "BUDO Kidsdag/Budodag",
        content:
          "Zaterdag 5 maart organiseerden wij samen met de CJJF de Budo Kidsdag/Budodag in de Knotwilg Steenbergen. Jeugd en volwassenen kregen les in verschillende Budo/Vechtsporten. Iedereen heeft ervan genoten en het was een geslaagde dag!",
        date: "2017-03-05",
      }
    ],
  },

  {
    year: 2016,
    articles: [

      {
        id: "budo-kidsdag-aankondiging-2016",
        title: "CJJF BUDO Kidsdag/Budodag - Aankondiging",
        content:
          "Dit jaar organiseren wij weer samen met de CJJF een Budo Kidsdag/Budodag. Op zaterdag 5 maart is iedereen welkom om kennis te maken met verschillende Budosporten. Voor onze leden is het dit jaar helemaal gratis! Zorg er wel voor dat je op tijd je inschrijfformulier hebt ingeleverd. Ook kun je familie, vrienden of kennissen meenemen, voor niet-leden onder de 13 jaar zijn de kosten €5,-. Vanaf 13 jaar €10,-.\n\nDe deelnemers onder 13 jaar worden om 9.30 verwacht in de tennishal in sportcentrum de Knotwilg. Voor hen zal het eindigen om 12.15. Om 12.45 worden dan de deelnemers vanaf 13 jaar verwacht en dit zal eindigen om 16.30. We hopen dat jullie er allemaal bij zijn!",
        date: "2016-03-05",
      },

      {
        id: "toernooi-yukio-tani-huijbergen-februari-2016",
        title: "Toernooi Yukio-Tani Huijbergen",
        content:
          "Zaterdag 20 februari hebben 8 judoka's van Michigami meegedaan aan het beginners-toernooi van Yukio-Tani in Huijbergen. Het toernooi was goed georganiseerd en onze judoka's hebben weer vele prijzen mee naar huis genomen. Frederik Colombijn eindigde op de 4e plaats. Cosette Harmsen, Sjoerd Uitdewilligen en Ozzy Cools behaalden de 3e plaats. De 2e plaats werd behaald door Jayden van der Have, Yves Harmsen, Bram van der Zanden en Bryan Rombout. Allemaal gefeliciteerd, heel goed gedaan!",
        date: "2016-02-20",
      },

      {
        id: "lestijden-gewijzigd-2016",
        title: "Let op! Lestijden zijn gewijzigd",
        content:
          "Vanaf vrijdag 8 januari 2016 zullen alle lessen 15 minuten later beginnen dan we gewend zijn.",
        date: "2016-01-08",
      }
    ],
  },

  {
    year: 2015,
    articles: [

      {
        id: "yoshi-bergen-op-zoom-2015",
        title: "Judotoernooi Yoshi Bergen op Zoom",
        content:
          "Zaterdag 20 juni hebben onze toppers van judoclub Michigami weer vele prijzen binnengehaald op het judotoernooi van Yoshi in Bergen op Zoom. Drie maal werd de 4e plaats gehaald door Martijn Noordzij, Sjoerd Uitdewilligen en Sjors van Duijn. Dennis Kamerman wist de 3e plaats te bemachtigen. Ricardo den Heijer ging met de 2e prijs naar huis. En de 1e plaats werd behaald door Latif Nurzad en Robert Dingenouts. Gefeliciteerd allemaal!",
        date: "2015-06-20",
      },

      {
        id: "dutch-open-international-2015",
        title: "Michigami Succesvol op Dutch Open International Championships",
        content:
          "Zaterdag 21 maart 2015 deden 4 judoka's van judoclub Michigami weer mee aan de Dutch Open International Championships in Dalfsen. De beste judoka's van Nederland en vele andere landen komen hier naartoe om te strijden voor een plek op het podium. De judoka's hebben heel goed gepresteerd. Latif Nurzad, Ricardo den Heijer en Damian van Leijenhorst behaalden alle drie de 2e Plaats. Bernd Engelen heeft ook goed gevochten, alleen helaas door een klein foutje raakte hij gediskwalificeerd, hierdoor werd hij 5e. We zijn erg trots op onze judoka's, allemaal van harte gefeliciteerd!",
        date: "2015-03-21",
      },

      {
        id: "shinomaki-loenhout-2015",
        title: "Judo Toernooi Shinomaki Loenhout",
        content:
          "Zondag 8 februari werd in Loenhout een judotoernooi gehouden door judoclub Shinomaki. Hieraan hebben enkele judoka's van onze club meegedaan. Damian van Leijenhorst behaalde de 1e Plaats. Daphne Spruyt en Sjoert Uitdewilligen wisten beide de 2e Plaats te bemachtigen. Sjors van Duijn behaalde de 3e Plaats. Allemaal gefeliciteerd met de behaalde prijzen!",
        date: "2015-02-08",
      },

      {
        id: "budo-kidsdag-imaf-2015",
        title: "CJJF-BUDO / IMAF BUDO KIDSDAG 2015",
        content:
          "Zaterdag 17 Januari werd in de Knotwilg te Steenbergen de CJJF-BUDO / IMAF BUDO KIDSDAG gehouden. Kinderen tot en met 12 jaar, waaronder ook een aantal van judoclub Michigami, deden mee aan verschillende onderdelen zoals een wedstrijd Vechtbal, een cursus weerbaarheid waarbij je leerde hoe om te gaan met pestkoppen bijvoorbeeld, en nog enkele andere onderdelen zoals valbreken en budo reactiespelen. De kinderen hebben zich weer lekker kunnen uitleven en aan het eind kregen ze nog een leuk aandenken mee en werd er een grote groepsfoto gemaakt.",
        date: "2015-01-17",
      }
    ],
  },

  {
    year: 2014,
    articles: [

      {
        id: "kerstvakantie-2014",
        title: "Kerstvakantie",
        content:
          "Vrijdag 19 december is alweer de laatste les van 2014! Op vrijdag 26 december 2014 en 2 januari 2015 zullen er geen judo lessen plaatsvinden. De eerste lessen van 2015 zijn op vrijdag 9 januari. Wij wensen jullie prettige kerstdagen en een plezierig en gezond judo jaar toe.\n\nNamens de trainers Koos, Robert, Pascal en Robin.",
        date: "2014-12-19",
      },

      {
        id: "sinterklaastoernooi-heerle-2014",
        title: "Sinterklaastoernooi Heerle",
        content:
          "Afgelopen zaterdag organiseerde Judovereniging Garami weer het jaarlijkse internationaal Sinterklaastoernooi in Heerle. 6 Judoka's van Michigami streden mee voor een podiumplaats. Sjors van Duijn wist al zijn tegenstanders te verslaan en won daarmee de 1e prijs! Frederik Colombijn wist een 3e plaats te bemachtigen. Martijn Noordzij, Lorenz Franken en Ricardo den Heijer eindigden alle 3 op de 4e plaats. Sjoerd Uitdewilligen behaalde de 6e plaats. Alle judoka's weer gefeliciteerd met de behaalde plaatsen!",
        date: "2014-11-22",
      },

      {
        id: "toernooi-bergen-op-zoom-zomer-2014",
        title: "Toernooi Bergen op Zoom - Zomertoernooi",
        content:
          "Afgelopen zaterdag was het alweer het laatste judotoernooi voor de zomerstop. 2 judoka's van Michigami wisten de 1e plaats te behalen: Ricardo den Heijer en Latif Nurzad. Tim Saarloos wist een 3e plaats te bemachtigen. Lamont Sterk eindigde op de 4e plaats, Frederik Colombijn op de 5e plaats en Dennis Kamerman werd 6e. Allemaal gefeliciteerd met de behaalde prijzen!",
        date: "2014-06-21",
      },

      {
        id: "dangraad-examens-2e-dan-2014",
        title: "Trainers Michigami Geslaagd voor 2e Dan",
        content:
          "Zaterdag 7 juni werden in Steenbergen de dangraad examens gehouden van de C.J.J.F. Van judoclub Michigami waren er drie judoka's/trainers die hun examen aflegden voor de 2e Dan. Robin Hack deed examen met Robert Dingenouts en Pascal Hack met John Kok van judoclub Yoshi. De afgelopen tijd hebben zij hard ervoor getraind bij verschillende judoclubs, de examinatoren waren daarom ook erg tevreden over de kwaliteit van de afgelegde examens.",
        date: "2014-06-07",
      },

      {
        id: "survivalrun-steenbergen-2014",
        title: "Survivalrun Steenbergen",
        content:
          "5 judoka's van Michigami hebben meegedaan met de survivalrun in Steenbergen. Met blauwe plekken, nat en onder de modder hebben zij allemaal de finish gehaald. Stef van Dijk was als individu. Robin Hack, Robert Dingenouts, Pascal Hack en Franco Hack deden mee aan de koppelrun. Mede dankzij teamwork werden alle hindernissen overwonnen.",
        date: "2014-04-27",
      },

      {
        id: "toernooi-stichting-judo-geelhoed-2014",
        title: "Toernooi Stichting Judo Geelhoed",
        content:
          "Lamont Sterk was als enige van Judoclub Michigami aanwezig op het Tholense Judo en Vechtbal toernooi. Twee keer liet Lamont zich door zijn tegenstanders verrassen en bereikte uiteindelijk een gedeelde derde plaats. Met Vechtbal wist hij een tweede plaats te behalen.",
        date: "2014-04-26",
      },

      {
        id: "slipexamens-april-2014",
        title: "6 Judoka's Geslaagd voor Slipexamens",
        content:
          "De gele slip werd behaald door Quintin v/d Bruggen, Noah v/d Bruggen en Kimberly Otto. De oranje slip door Anouk Franken. En een groene slip voor Tim Saarloos en Ian Ossenblok. Gefeliciteerd!",
        date: "2014-04-25",
      },

      {
        id: "paastoernooi-oud-vossemeer-2014",
        title: "Paastoernooi Oud-Vossemeer",
        content:
          "Zaterdag 19 april deden 4 judoka's van JC Michigami mee aan het Paastoernooi te Oud Vossemeer en wisten weer een prijs te bemachtigen. Een tweede plaats was er voor Frederik Colombijn en Daphne Spruit. Derde plaats was voor Lamont Sterk. Mathijs Schrauwen eindigde op een vijfde plaats.",
        date: "2014-04-19",
      },

      {
        id: "toernooi-berendrecht-2014",
        title: "Mooi Toernooi in Berendrecht voor Michigami",
        content:
          "Het was voor Judoclub Michigami weer een mooi toernooi met 3 eerste, 2 tweede en 3 derde plaatsen. Ook was het voor 7 judokaatjes de eerste keer dat ze aan een wedstrijd meededen en ook zij hebben zich goed verdedigd! Matthijs Schrauwen wist zelfs zilver in de wacht te slepen en Daphne Spruit, Bjorn Ossenblok en Dylan Leijenhorst wisten een bronzen prijs binnen te halen. Voor de overigen was er een mooie herinneringsmedaille.\n\nDe ervaren wedstrijd judoka's wisten eveneens goed te scoren, Goud was er voor Marijn van de Berg, Damian Leijenhorst en Latif Nurzad. Zilver voor Ricardo den Heijer.",
        date: "2014-03-31",
      },

      {
        id: "vechtbaltoernooi-lamont-2014",
        title: "Vechtbaltoernooi - Bericht van Lamont",
        content:
          'Hallo allemaal, ik vond het gisteren super dat vechtbal toernooi. Ik heb alles gewonnen. En natuurlijk de medaille vind ik het leukst, de spelletjes die we daarna deden vond ik ook leuk. Van Lamont',
        date: "2014-03-22",
      },

      {
        id: "vechtbaltoernooi-22-maart-2014",
        title: "Vechtbaltoernooi 22 maart 2014",
        content:
          "Lamont Sterk was als enige van Judoclub Michigami aanwezig op het Tholense Judo en Vechtbal toernooi. Twee keer liet Lamont zich door zijn tegenstanders verrassen en bereikte uiteindelijk een gedeelde derde plaats. Met Vechtbal wist hij een tweede plaats te behalen.",
        date: "2014-03-22",
      }
    ],
  },

  {
    year: 2013,
    articles: [

      {
        id: "28-judokas-geslaagd-bandenexamens-2013",
        title: "28 Judoka's Geslaagd voor Bandenexamens",
        content:
          "Afgelopen maanden hebben onze judoka's keihard getraind om alle technieken onder controle te krijgen en ze moesten ook de Japanse benamingen erbij kennen. 29 november was het dan zover, het bandenexamen. Natuurlijk waren ze allemaal erg zenuwachtig want er waren veel papa's en mama's komen kijken om te zien wat ze allemaal geleerd hadden. Maar ondanks de zenuwen hebben ze laten zien dat ze de technieken goed beheersten, ze hebben het allemaal fantastisch gedaan.\n\nDe volgende judoka's zijn allemaal geslaagd:\n\n6e kyu (witte band): Sjoerd Buuron, Sjoerd Uitdewillige, Quintin van de Bruggen, Noah van de Bruggen, Matthijs Schrauwen, Dennes Kamerman, Benjamin Beekman, Daphne Spruyt\n\n5e kyu (gele band): Björn Ossenblok, Damian Guldemond, Jeppe Drenth, Thijs Huizer, Sjors van Duijn, Frederik Colombijn, Anouk Franken, Lynn Moerenhout, Giovanni de Meijer, Dylan van Leijenhorst\n\n4e kyu (oranje band): Réno Blaauw, Lucani Spaans, Chiem Geers, Lorenz Franken, Ian Ossenblok, Lamont Sterk, Joeri Ligtenberg, Tim Saarloos\n\n3e kyu (groene band): Jacco Loos, Kjeld Springer\n\nAllemaal nogmaals gefeliciteerd, we zijn erg trots op wat jullie hebben bereikt. Op naar de volgende band!",
        date: "2013-11-29",
      },

      {
        id: "sinterklaastoernooi-heerle-2013",
        title: "Judoclub Michigami haalt weer veel prijzen weg bij Sinterklaastoernooi in Heerle",
        content:
          "Latif Nurzad wist een 1e plaats te bemachtigen. Daarnaast zijn er 5 judoka's met de 2e plaats naar huis gegaan: Frederik Colombijn, Ricardo den Heijer, Sjoerd Buuron, Joeri Ligtenberg en Jeppe Drenth. 2 maal werd de 3e prijs gewonnen door Björn Ossenblok en Noah van den Bruggen. Bernd Engelen en Matthijs Schrauwen behaalden de 4e plaats. En ten slotte behaalden Quintin van der Bruggen en Damian Guldenmond de 5e plaats. Alle judoka's van harte gefeliciteerd met de behaalde prijzen!",
        date: "2013-11-23",
      },

      {
        id: "tokyokai-toernooi-2013",
        title: "Michigami heeft weer goed gescoord op Judo Toernooi Tokyokai",
        content:
          "Onze 4 jonge judoka's hebben allemaal fantastisch gejudood. Quintin van de Bruggen wist een 1e plaats in de wacht te slepen. Noah van de Bruggen ging naar huis met de 3e plaats. Matthijs Schrauwen en Lamont Sterk behaalden allebei de 4e plaats. Gefeliciteerd!",
        date: "2013-11-09",
      },

      {
        id: "bandenexamens-november-2013",
        title: "Bandenexamens november 2013",
        content:
          'Dit jaar organiseren wij de bandenexamens op 29 november. Ook degenen die niet voor een band op gaan kunnen natuurlijk gewoon meedoen met de les, misschien verdien je wel een slip! Ouders zijn van harte welkom om te komen kijken. Degenen die voor examen op gaan, doe je best!',
        date: "2013-11-09",
      }
    ],
  }
];

export const socialLinks = {
  facebook: "https://www.facebook.com/judoclubmichigami",
  instagram: "https://www.instagram.com/judoclub_michigami/",
  youtube: "https://www.youtube.com/@JudoMichigami",
};
