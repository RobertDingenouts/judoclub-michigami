export interface JudoTerm {
  uitspraak: string;
  nederlands: string;
  categorie: string;
  level: 'algemeen' | 'wedstrijd' | 0 | 1 | 2 | 3 | 4 | 5;
}

export const levelNames: Record<string, string> = {
  'algemeen': 'Algemene Termen',
  'wedstrijd': 'Wedstrijdtraining',
  '0': 'Witte Band',
  '1': 'Gele Band',
  '2': 'Oranje Band',
  '3': 'Groene Band',
  '4': 'Blauwe Band',
  '5': 'Bruine Band',
};

export const beltColors: Record<string, string> = {
  'algemeen': '#0054a6',
  'wedstrijd': '#495057',
  '0': '#e0e0e0',
  '1': '#f9c500',
  '2': '#f37021',
  '3': '#009444',
  '4': '#0054a6',
  '5': '#8b4513',
};

export const judoTerms: JudoTerm[] = [
  // Algemene Termen
  { uitspraak: 'Dojo', nederlands: 'Oefenzaal', categorie: 'Algemeen', level: 'algemeen' },
  { uitspraak: 'Tatami', nederlands: 'Judomat', categorie: 'Algemeen', level: 'algemeen' },
  { uitspraak: 'Judogi', nederlands: 'Judopak', categorie: 'Algemeen', level: 'algemeen' },
  { uitspraak: 'Sensei', nederlands: 'Leraar', categorie: 'Personen', level: 'algemeen' },
  { uitspraak: 'Judoka', nederlands: 'Beoefenaar van judo', categorie: 'Personen', level: 'algemeen' },
  { uitspraak: 'Tori', nederlands: 'Die de worp uitvoert', categorie: 'Personen', level: 'algemeen' },
  { uitspraak: 'Uke', nederlands: 'Die de worp ondergaat', categorie: 'Personen', level: 'algemeen' },
  { uitspraak: 'Rei', nederlands: 'Groeten', categorie: 'Commando', level: 'algemeen' },
  { uitspraak: 'Hajime', nederlands: 'Begin!', categorie: 'Commando', level: 'algemeen' },
  { uitspraak: 'Matte', nederlands: 'Stop!', categorie: 'Commando', level: 'algemeen' },
  { uitspraak: 'Sore made', nederlands: 'Einde van de wedstrijd', categorie: 'Commando', level: 'algemeen' },
  { uitspraak: 'Maitta', nederlands: 'Ik geef op (aftikken)', categorie: 'Commando', level: 'algemeen' },
  { uitspraak: 'Kumi-kata', nederlands: 'Manier van vastpakken', categorie: 'Concept', level: 'algemeen' },
  { uitspraak: 'Ne-waza', nederlands: 'Grondtechnieken', categorie: 'Concept', level: 'algemeen' },
  { uitspraak: 'Tachi-waza', nederlands: 'Staande technieken', categorie: 'Concept', level: 'algemeen' },
  // Wedstrijdtraining
  { uitspraak: 'Shiai', nederlands: 'Wedstrijd', categorie: 'Wedstrijd', level: 'wedstrijd' },
  { uitspraak: 'Ippon', nederlands: 'Vol punt (directe winst)', categorie: 'Score', level: 'wedstrijd' },
  { uitspraak: 'Waza-ari', nederlands: 'Half punt', categorie: 'Score', level: 'wedstrijd' },
  { uitspraak: 'Shido', nederlands: 'Strafpunt', categorie: 'Straf', level: 'wedstrijd' },
  { uitspraak: 'Hansoku-make', nederlands: 'Diskwalificatie', categorie: 'Straf', level: 'wedstrijd' },
  { uitspraak: 'Osaekomi', nederlands: 'Houdgreep ingezet!', categorie: 'Commando', level: 'wedstrijd' },
  { uitspraak: 'Toketa', nederlands: 'Houdgreep verbroken', categorie: 'Commando', level: 'wedstrijd' },
  { uitspraak: 'Golden Score', nederlands: 'Verlenging bij gelijke stand', categorie: 'Wedstrijd', level: 'wedstrijd' },
  { uitspraak: 'Kuzushi', nederlands: 'Balansverstoring', categorie: 'Concept', level: 'wedstrijd' },
  { uitspraak: 'Tsukuri', nederlands: 'Inzet van de worp', categorie: 'Concept', level: 'wedstrijd' },
  { uitspraak: 'Kake', nederlands: 'De eigenlijke worp', categorie: 'Concept', level: 'wedstrijd' },
  // Witte Band (level 0)
  { uitspraak: 'Ushiro', nederlands: 'Achterwaarts', categorie: 'Bouwsteen', level: 0 },
  { uitspraak: 'Ukemi', nederlands: 'Val', categorie: 'Bouwsteen', level: 0 },
  { uitspraak: 'Ushiro-ukemi', nederlands: 'Achterwaartse val', categorie: 'Ukemi-waza', level: 0 },
  { uitspraak: 'Yoko', nederlands: 'Zijwaarts', categorie: 'Bouwsteen', level: 0 },
  { uitspraak: 'Yoko-ukemi', nederlands: 'Zijwaartse val', categorie: 'Ukemi-waza', level: 0 },
  { uitspraak: 'Mae', nederlands: 'Voorwaarts', categorie: 'Bouwsteen', level: 0 },
  { uitspraak: 'Mae-ukemi', nederlands: 'Voorwaartse val', categorie: 'Ukemi-waza', level: 0 },
  { uitspraak: 'Zenpo', nederlands: 'Voorwaarts (met draai)', categorie: 'Bouwsteen', level: 0 },
  { uitspraak: 'Kaiten', nederlands: 'Rol', categorie: 'Bouwsteen', level: 0 },
  { uitspraak: 'Zenpo-kaiten-ukemi', nederlands: 'Voorwaartse rolval', categorie: 'Ukemi-waza', level: 0 },
  // Gele Band (level 1)
  { uitspraak: 'O', nederlands: 'Groot', categorie: 'Bouwsteen', level: 1 },
  { uitspraak: 'Ko', nederlands: 'Klein', categorie: 'Bouwsteen', level: 1 },
  { uitspraak: 'Soto', nederlands: 'Buitenwaarts', categorie: 'Bouwsteen', level: 1 },
  { uitspraak: 'Uchi', nederlands: 'Binnenwaarts', categorie: 'Bouwsteen', level: 1 },
  { uitspraak: 'Gari', nederlands: 'Maaien', categorie: 'Bouwsteen', level: 1 },
  { uitspraak: 'Goshi', nederlands: 'Heup', categorie: 'Bouwsteen', level: 1 },
  { uitspraak: 'O-soto-gari', nederlands: 'Groot - buitenwaarts - maaien', categorie: 'Ashi-waza', level: 1 },
  { uitspraak: 'O-goshi', nederlands: 'Grote heupworp', categorie: 'Koshi-waza', level: 1 },
  { uitspraak: 'Kesa-gatame', nederlands: 'Sjaalgreep', categorie: 'Osaekomi-waza', level: 1 },
  // Oranje Band (level 2)
  { uitspraak: 'Barai', nederlands: 'Vegen', categorie: 'Bouwsteen', level: 2 },
  { uitspraak: 'Guruma', nederlands: 'Wiel', categorie: 'Bouwsteen', level: 2 },
  { uitspraak: 'Otoshi', nederlands: 'Laten vallen', categorie: 'Bouwsteen', level: 2 },
  { uitspraak: 'De-ashi-barai', nederlands: 'Voorwaarts - voet - vegen', categorie: 'Ashi-waza', level: 2 },
  { uitspraak: 'Hiza-guruma', nederlands: 'Knie - wiel', categorie: 'Ashi-waza', level: 2 },
  { uitspraak: 'Koshi-guruma', nederlands: 'Heup - wiel', categorie: 'Koshi-waza', level: 2 },
  { uitspraak: 'Yoko-shiho-gatame', nederlands: 'Zijwaartse vierpuntsgreep', categorie: 'Osaekomi-waza', level: 2 },
  // Groene Band (level 3)
  { uitspraak: 'Nage', nederlands: 'Worp', categorie: 'Bouwsteen', level: 3 },
  { uitspraak: 'Seoi', nederlands: 'Schouder', categorie: 'Bouwsteen', level: 3 },
  { uitspraak: 'Ashi', nederlands: 'Been/voet', categorie: 'Bouwsteen', level: 3 },
  { uitspraak: 'Ippon-seoi-nage', nederlands: 'Enkelvoudige schouderworp', categorie: 'Kata-waza', level: 3 },
  { uitspraak: 'Ko-uchi-gari', nederlands: 'Klein - binnenwaarts - maaien', categorie: 'Ashi-waza', level: 3 },
  { uitspraak: 'O-uchi-gari', nederlands: 'Groot - binnenwaarts - maaien', categorie: 'Ashi-waza', level: 3 },
  { uitspraak: 'Kami-shiho-gatame', nederlands: 'Bovenwaartse vierpuntsgreep', categorie: 'Osaekomi-waza', level: 3 },
  // Blauwe Band (level 4)
  { uitspraak: 'Harai', nederlands: 'Vegen (zwaai)', categorie: 'Bouwsteen', level: 4 },
  { uitspraak: 'Tsurikomi', nederlands: 'Trekken en optillen', categorie: 'Bouwsteen', level: 4 },
  { uitspraak: 'Okuri', nederlands: 'Beide/samen', categorie: 'Bouwsteen', level: 4 },
  { uitspraak: 'Harai-goshi', nederlands: 'Vegen - heup', categorie: 'Koshi-waza', level: 4 },
  { uitspraak: 'Okuri-ashi-barai', nederlands: 'Beide - benen - vegen', categorie: 'Ashi-waza', level: 4 },
  { uitspraak: 'Tate-shiho-gatame', nederlands: 'Langwaartse vierpuntsgreep', categorie: 'Osaekomi-waza', level: 4 },
  // Bruine Band (level 5)
  { uitspraak: 'Jime', nederlands: 'Verwurging', categorie: 'Bouwsteen', level: 5 },
  { uitspraak: 'Gatame', nederlands: 'Controle/greep', categorie: 'Bouwsteen', level: 5 },
  { uitspraak: 'Kata', nederlands: 'Schouder/vorm', categorie: 'Bouwsteen', level: 5 },
  { uitspraak: 'Tsurikomi-goshi', nederlands: 'Trekken en optillen - heup', categorie: 'Koshi-waza', level: 5 },
  { uitspraak: 'Sasae-tsurikomi-ashi', nederlands: 'Blokkeren - trekken en optillen - been', categorie: 'Ashi-waza', level: 5 },
  { uitspraak: 'Okuri-eri-jime', nederlands: 'Schuivende reversverwurging', categorie: 'Shime-waza', level: 5 },
];
