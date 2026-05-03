export type SectionId = 
  | 'home' 
  | 'agenda' 
  | 'technieken' 
  | 'exameneisen' 
  | 'cursusjapans' 
  | 'formulieren' 
  | 'info' 
  | 'login'
  | 'leden'
  | 'lestijden'
  | 'band-knopen'
  | 'foto-galerij'
  | 'video-galerij'
  | 'locatie'
  | 'contact'
  | 'nieuws'
  | 'techniekenkaart'
  | 'evenementen'
  | 'juridisch';

export const sectionLabels: Record<SectionId, string> = {
  home: 'Home',
  agenda: 'Agenda',
  technieken: 'Technieken',
  exameneisen: 'Exameneisen',
  cursusjapans: 'Cursus Japans',
  formulieren: 'Formulieren',
  info: 'Info',
  login: 'Inloggen',
  leden: 'Lid Worden',
  lestijden: 'Lestijden',
  'band-knopen': 'Band Knopen',
  'foto-galerij': 'Foto Galerij',
  'video-galerij': 'Video Galerij',
  locatie: 'Locatie',
  contact: 'Contact',
  nieuws: 'Nieuws',
  techniekenkaart: 'Techniekenkaart',
  evenementen: 'Evenementen',
  juridisch: 'Juridisch',
};
