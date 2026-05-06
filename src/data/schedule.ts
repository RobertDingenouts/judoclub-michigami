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
          startTime: '19:30',
          endTime: '20:30',
          location: 'De Knotwilg, Steenbergen',
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
          groupName: 'Groep 2',
          ageRange: '9 t/m 12 jaar',
          startTime: '19:45',
          endTime: '20:45',
          location: 'De Knotwilg, Steenbergen',
        },
        {
          groupName: 'Groep 3',
          ageRange: '13 jaar en ouder',
          startTime: '20:45',
          endTime: '21:45',
          location: 'De Knotwilg, Steenbergen',
        },
      ],
    },
  ],
};
