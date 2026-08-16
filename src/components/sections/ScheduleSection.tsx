'use client';

import { scheduleInfo } from '@/data/schedule';
import { Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

export function ScheduleSection() {
  const [navigateToAgenda, setNavigateToAgenda] = useState(false);

  useEffect(() => {
    if (navigateToAgenda) {
      window.location.hash = '#agenda';
      setNavigateToAgenda(false);
    }
  }, [navigateToAgenda]);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] rounded-lg p-4 sm:p-5 md:p-6 lg:p-8 text-white shadow-lg relative overflow-hidden">
        <svg
          viewBox="0 0 100 80"
          className="absolute top-0 right-0 w-20 sm:w-24 md:w-32 h-20 sm:h-24 md:h-32 text-white opacity-[0.06]"
          fill="currentColor"
        >
          <rect x="5" y="8" width="90" height="6" rx="2" />
          <rect x="12" y="18" width="76" height="4" rx="1" />
          <rect x="20" y="18" width="6" height="58" rx="1" />
          <rect x="74" y="18" width="6" height="58" rx="1" />
        </svg>
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold truncate">{scheduleInfo.title}</h1>
        <p className="text-white/80 mt-1 text-xs sm:text-sm">{scheduleInfo.subtitle}</p>
        <div className="w-10 sm:w-12 md:w-16 h-0.5 sm:h-1 bg-white/30 rounded-lg mt-2 sm:mt-3" />
      </div>

      {/* Schedule Cards */}
      {scheduleInfo.days.map((day, dayIdx) => (
        <div key={dayIdx} className="bg-white rounded-lg shadow-sm border border-[#e9e0cf] overflow-hidden">
          {/* Day Header */}
          <div className="bg-gradient-to-r from-[#fdf6f6] to-white px-4 sm:px-5 py-3 border-b border-[#e9e0cf]">
            <h3 className="font-bold text-[#8c0000] text-base sm:text-lg">{day.dayLabel}</h3>
          </div>

          {/* Sessions */}
          <div className="divide-y divide-[#e8eaed]">
            {day.sessions.map((session, sIdx) => (
              <div key={sIdx} className="p-4 sm:p-5 hover:bg-[#fdf6f6] transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  {/* Time */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Clock className="w-4 h-4 text-[#a90000]" />
                    <span className="text-sm font-bold text-[#8c0000]">{session.startTime}</span>
                    <span className="text-xs text-gray-400 mx-1">→</span>
                    <span className="text-sm font-bold text-[#8c0000]">{session.endTime}</span>
                  </div>

                  {/* Group Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{session.groupName}</h4>
                    <p className="text-xs sm:text-sm text-gray-500">{session.ageRange}</p>
                  </div>

                  {/* Location */}
                  <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-1 flex-shrink-0">
                    <svg
                      className="w-3.5 h-3.5 text-[#a90000]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="truncate">{session.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Note */}
      <div className="bg-[#fdf6f6] rounded-lg p-4 sm:p-5 border border-[#e9e0cf]">
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          <span className="font-bold text-[#8c0000]">Let op:</span> De lestijden kunnen wijzigen i.v.m. vakanties en evenementen.
          Houd de{' '}
          <button onClick={() => setNavigateToAgenda(true)} className="text-[#a90000] hover:text-[#8c0000] underline cursor-pointer">agenda</button> in de gaten voor de actuele informatie.
        </p>
      </div>
    </div>
  );
}
