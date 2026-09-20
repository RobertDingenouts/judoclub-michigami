export interface ClassSession {
  groupName: string;
  ageRange: string;
  startTime: string;
  endTime: string;
  location: string;
}

export interface ScheduleDay {
  day: string;
  dayLabel: string;
  sessions: ClassSession[];
}

export interface ScheduleInfo {
  title: string;
  subtitle: string;
  days: ScheduleDay[];
}

export const scheduleInfo: ScheduleInfo = {
  title: 'Lestijden',
  subtitle: 'Judoclub Michigami — woensdag & vrijdag',
  days: [
    {
      day: 'woensdag',
      dayLabel: 'Woensdagavond',
      sessions: [
        {
          groupName: 'Algemene training',
          ageRange: 'Alle leeftijden',
          startTime: '19:00',
          endTime: '20:00',
          location: 'De Vossenkuil, Oud-Vossemeer',
        },
      ],
    },
    {
      day: 'vrijdag',
      dayLabel: 'Vrijdagavond',
      sessions: [
        {
          groupName: 'Groep 1',
          ageRange: '6 t/m 9 jaar',
          startTime: '18:45',
          endTime: '19:45',
          location: 'De Knotwilg, Steenbergen',
        },
        {
          groupName: '2e groep',
          ageRange: '9 jaar en ouder',
          startTime: '19:45',
          endTime: '20:45',
          location: 'De Knotwilg, Steenbergen',
        },
      ],
    },
  ],
};
