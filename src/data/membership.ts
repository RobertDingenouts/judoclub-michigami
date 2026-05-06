export interface MembershipTier {
  name: string;
  targetAudience: string;
  price: string;
  pricePeriod: string;
  benefits: string[];
  icon: string;
}

export interface MembershipInfo {
  title: string;
  subtitle: string;
  trialLessons: string;
  signupUrl: string;
  signupText: string;
  tiers: MembershipTier[];
}

export const membershipInfo: MembershipInfo = {
  title: 'Lid worden',
  subtitle: 'Word lid van Judoclub Michigami',
  trialLessons: '3 gratis proeflessen',
  signupUrl: 'https://forms.office.com/r/8Vw9kPcLT6',
  signupText: 'Inschrijven',
  tiers: [
    {
      name: 'Jeugd',
      targetAudience: '6 – 12 jaar',
      price: '€42',
      pricePeriod: 'per kwartaal',
      benefits: [
        '2x per week lessen (woensdag & vrijdag)',
        'Speciaal jeugdprogramma',
        'Veilige en leuke omgeving',
        'Examens voor bandverhoging',
      ],
      icon: '🥋',
    },
    {
      name: 'Volwassenen',
      targetAudience: '13+ jaar',
      price: '€42',
      pricePeriod: 'per kwartaal',
      benefits: [
        '2x per week lessen (woensdag & vrijdag)',
        'Recreatief of competitief trainen',
        'Delen aan toernooien',
        'Examens voor bandverhoging',
      ],
      icon: '⚔️',
    },
    {
      name: 'Extra kosten',
      targetAudience: 'Alle leden',
      price: '€15',
      pricePeriod: 'eenmalig',
      benefits: [
        'Inschrijfgeld bij nieuw lidmaatschap',
      ],
      icon: '📋',
    },
    {
      name: 'Verzekering',
      targetAudience: 'Alle leden',
      price: '€15',
      pricePeriod: 'per jaar',
      benefits: [
        'Verplichte bondsverzekering',
        'Dekken bij blessures tijdens training en toernooien',
      ],
      icon: '🛡️',
    },
  ],
};
