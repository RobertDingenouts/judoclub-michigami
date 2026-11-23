export interface LegalDocument {
  id: string;
  title: string;
  version?: string;
  lastUpdated?: string;
  sections: LegalSection[];
}

export interface LegalSection {
  heading: string;
  content: string;
}

export const legalDocuments: LegalDocument[] = [
  {
    id: 'algemene-voorwaarden-michigami',
    title: 'Algemene Voorwaarden Judoclub Michigami',
    version: '1.0',
    lastUpdated: '1 juni 2024',
    sections: [
      {
        heading: '1. Definities',
        content:
          '1.1 De Club: Judoclub Michigami.\n\n1.2 Lid: Iedere persoon die zich heeft ingeschreven bij de Club en de lidmaatschapsbijdrage betaalt.',
      },
      {
        heading: '2. Doel en Geest van Judo',
        content:
          'Judoclub Michigami bevordert de judosport met respect, discipline en sportiviteit. Wij verwachten van al onze leden dat zij deze judogeest omarmen.',
      },
      {
        heading: '3. Lidmaatschap en Inschrijving',
        content:
          '3.1 Proeflessen: Nieuwe leden mogen drie proeflessen gratis volgen om kennis te maken met judo bij Judoclub Michigami Steenbergen.\n\n3.2 Inschrijving: Lidmaatschap is mogelijk voor iedereen vanaf 6 jaar. Na de proeflessen dien je je in te schrijven via het inschrijfformulier op onze website.\n\n3.3 Beëindiging Lidmaatschap: Je kunt je afmelden per e-mail, WhatsApp of mondeling tijdens een les. Geef het uiterlijk één maand voor het einde van een kwartaal door; je lidmaatschap stopt dan per het einde van dat kwartaal.',
      },
      {
        heading: '4. Contributie en Kosten',
        content:
          '4.1 Lidmaatschapsbijdrage: De lidmaatschapsbijdrage bedraagt €42 per kwartaal of €168 per jaar, vooraf te betalen aan het begin van elke periode.\n\n4.2 Eenmalige Kosten: Eenmalige inschrijfkosten van €15 zijn van toepassing bij inschrijving. Tijdelijke actie: bij inschrijving vóór 31 december 2026 wordt het inschrijfgeld verwaard (gratis inschrijven).\n\n4.3 Jaarlijkse Bijdrage: Daarnaast is er een jaarlijkse bijdrage van €15 voor de verzekering van de club, te betalen bij de eerste periode van het jaar.\n\n4.4 Wijzigingen: Het bestuur evalueert elk jaar de kosten voor het lidmaatschap tijdens de bestuursvergadering en behoudt zich het recht voor om de contributie en andere kosten te wijzigen. Eventuele wijzigingen worden minimaal één maand van tevoren en op een transparante manier gecommuniceerd naar de leden.',
      },
      {
        heading: '5. Verzekering en gezondheid',
        content:
          '5.1 Alle leden zijn verzekerd via de door de club afgesloten verzekering (Everion) tijdens het lidmaatschap.\n\n5.2 Bij letsel tijdens het lidmaatschap dient het bestuur op de hoogte te worden gesteld. De verzekering kan dan de schade afwikkelen.\n\n5.3 Deelname aan trainingen, examens en toernooien is altijd vrijwillig; niemand is verplicht mee te doen. Ouders en verzorgers beoordelen of hun kind aan een les, examen of toernooi kan meedoen en geven dat, samen met gezondheidszaken en blessures, vooraf aan ons door. Bij een blessure of twijfel doet iemand niet mee en wordt een ander moment gepland; bij de vraag of iemand weer kan sporten na een blessure adviseren we overleg met de huisarts. De trainer beslist ter plaatse en houdt iemand bij twijfel apart.',
      },
      {
        heading: '6. Aansprakelijkheid',
        content:
          'De club is niet aansprakelijk voor schade die op enigerlei wijze verband houdt met het lidmaatschap, tenzij de schade aan het voorwerp van de verzekering valt en de verzekeraar deze schade vergoedt.',
      },
      {
        heading: '7. Wijzigingen van de Algemene Voorwaarden',
        content:
          'Het bestuur is gerechtigd de Algemene Voorwaarden te wijzigen. Wijzigingen worden kenbaar gemaakt aan de leden via de website en/of tijdens de trainingen. Wijzigingen treden in werking op de datum zoals vermeld bij de bekendmaking.',
      },
      {
        heading: '8. Slotbepalingen',
        content:
          '8.1 Op de Algemene Voorwaarden is Nederlands recht van toepassing.\n\n8.2 Indien één of meerdere bepalingen in de Algemene Voorwaarden nietig zijn of vernietigd worden, blijven de overige bepalingen in stand. Het bestuur zal in overleg met de leden een nieuwe bepaling opstellen waarbij de doelstelling van de oorspronkelijke bepaling zoveel mogelijk behouden blijft.',
      },
    ],
  },
  {
    id: 'gedragscode-michigami',
    title: 'Gedragscode Judoclub Michigami',
    version: '1.0',
    lastUpdated: '28 mei 2024',
    sections: [
      {
        heading: 'Inleiding',
        content:
          'Deze gedragscode is een aanvulling op de algemene voorwaarden van Judoclub Michigami en omvat de judoregels, ethische gedragsnormen, fair play, discipline en respect die wij als club hoog in het vaandel dragen. Alle leden, coaches, vrijwilligers en bezoekers worden geacht deze code na te leven.',
      },
      {
        heading: '1. Judo-regels',
        content:
          'Leden dienen de regels van judo, zoals vastgesteld door de internationale judofederaties, te kennen en te respecteren.\n\nDe regels zijn ontworpen om de veiligheid van alle deelnemers te waarborgen en een eerlijke competitie te bevorderen.\n\nTechnieken buiten de vastgestelde regels zijn niet toegestaan en kunnen leiden tot diskwalificatie.',
      },
      {
        heading: '2. Ethische Gedragsnormen',
        content:
          'Wij streven naar een cultuur van integriteit, waarbij eerlijkheid en transparantie voorop staan.\n\nDiscriminatie, pesten of ander ongewenst gedrag wordt niet getolereerd.\n\nConflicten worden op een constructieve manier opgelost, met respect voor ieders mening.',
      },
      {
        heading: '3. Fair Play',
        content:
          'Fair play betekent sporten met respect voor de regels, tegenstanders, scheidsrechters en publiek.\n\nHet gaat om het tonen van sportiviteit, zowel in overwinning als verlies.\n\nHet stimuleren van een positieve houding en het vermijden van vals spel zijn essentieel.',
      },
      {
        heading: '4. Discipline',
        content:
          'Discipline is de basis voor succes in judo en omvat punctualiteit, toewijding en het volgen van instructies.\n\nLeden worden verwacht zich te houden aan de trainingstijden en -schema\'s.\n\nZelfbeheersing en zelfreflectie worden aangemoedigd, zowel op de mat als daarbuiten.',
      },
      {
        heading: '5. Respect',
        content:
          'Respect is de kernwaarde van onze club. Dit betekent respect voor jezelf, je medejudoka\'s, coaches, en de judosport als geheel.\n\nHet gebruik van respectvolle taal en gebaren is verplicht.',
      },
    ],
  },
  {
    id: 'privacyverklaring-michigami',
    title: 'Privacyverklaring Judoclub Michigami',
    sections: [
      {
        heading: 'Beste leden van Judoclub Michigami',
        content:
          'Wij hechten veel waarde aan uw privacy en willen u graag informeren over hoe wij omgaan met uw persoonsgegevens en beeldmateriaal. Hieronder vindt u een overzicht van ons privacybeleid:',
      },
      {
        heading: '1. Verzameling van persoonsgegevens',
        content:
          '- Wij verzamelen persoonsgegevens via het inschrijfformulier, zoals namen, contactgegevens, geboortedata en judograden.\n\n- Deze gegevens worden gebruikt voor administratieve doeleinden, zoals ledenregistratie, communicatie en het organiseren van evenementen.',
      },
      {
        heading: '2. Bewaartermijn',
        content:
          '- Uw persoonsgegevens worden bewaard zolang u lid bent van Judoclub Michigami.\n\n- Bij uitschrijving worden uw gegevens binnen een redelijke termijn verwijderd, tenzij wettelijke verplichtingen anders voorschrijven.',
      },
      {
        heading: '3. Beeldmateriaal',
        content:
          '- Tijdens evenementen en trainingen kunnen foto\'s en video\'s worden gemaakt.\n\n- Wij gebruiken dit beeldmateriaal voor promotiedoeleinden op onze website, social media en andere communicatiekanalen.\n\n- Uw naam kan worden vermeld bij het beeldmateriaal, tenzij u anders aangeeft.',
      },
      {
        heading: '4. Toestemming',
        content:
          '- Bij inschrijving vragen wij uw toestemming voor het gebruik van uw persoonsgegevens en beeldmateriaal.\n\n- U kunt op elk moment uw toestemming intrekken door contact met ons op te nemen.',
      },
      {
        heading: '5. Rechten van betrokkenen',
        content:
          '- U heeft recht op inzage, correctie en verwijdering van uw persoonsgegevens.\n\n- Neem contact met ons op als u uw gegevens wilt wijzigen of verwijderen.\n\nWij streven ernaar om uw gegevens veilig en vertrouwelijk te behandelen.',
      },
    ],
  },
  {
    id: 'voorwaarden-clubkampioenschap-2024',
    title: 'Algemene Voorwaarden Clubkampioenschap 2024',
    sections: [
      {
        heading: 'Algemene Voorwaarden voor Open Clubkampioenschappen Judo - Judoclub Michigami Steenbergen',
        content: '',
      },
      {
        heading: 'Definities',
        content:
          '"Organisatie" verwijst naar Judoclub Michigami Steenbergen.\n\n"Deelnemer" verwijst naar elke judoka die zich inschrijft voor het toernooi.',
      },
      {
        heading: 'Toernooi',
        content:
          'Het toernooi vindt plaats op 27 september 2024. Deelnemers van 6 t/m 11 jaar dienen aanwezig te zijn vanaf 18:30 uur, en deelnemers vanaf 12 jaar vanaf 19:30 uur in de dojo bij sportcentrum De Knotwilg in Steenbergen.',
      },
      {
        heading: 'Inschrijving en Deelname',
        content:
          'Inschrijven voor het toernooi kan tot uiterlijk 28 juni 2024 of totdat de organisatie bepaalt dat het maximale aantal deelnemers is bereikt. De inschrijving voor dit jaar is gratis.',
      },
      {
        heading: 'Annulering',
        content:
          'Deelnemers kunnen hun inschrijving annuleren tot een week voor het toernooi. Aangezien er geen inschrijfkosten zijn, is er geen terugbetaling van toepassing.',
      },
      {
        heading: 'Veiligheid',
        content:
          'Er is EHBO aanwezig tijdens het toernooi. Van deelnemers wordt verwacht dat zij de judoregels en de judogeest respecteren.',
      },
      {
        heading: 'Portretrecht',
        content:
          'Tijdens het toernooi kunnen foto\'s en video\'s worden gemaakt van de deelnemers. Deze beelden kunnen worden gebruikt op social media, WhatsApp en in promotiemateriaal van de organisatie. Door deel te nemen aan het toernooi geeft de deelnemer toestemming aan de organisatie om deze beelden te gebruiken voor promotionele doeleinden.',
      },
      {
        heading: 'Beperkte Aansprakelijkheid',
        content:
          'De organisatie is niet aansprakelijk voor enige schade, verlies of letsel tenzij er sprake is van opzet of grove schuld van de organisatie. De aansprakelijkheid van de organisatie is in elk geval beperkt tot het bedrag dat in het desbetreffende geval onder de aansprakelijkheidsverzekering van de organisatie wordt uitbetaald.',
      },
      {
        heading: 'Vrijwaring',
        content:
          'De deelnemer vrijwaart de organisatie voor alle aanspraken van derden die voortvloeien uit de deelname aan het toernooi.',
      },
    ],
  },
];
