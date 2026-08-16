'use client';

import { useState } from 'react';
import { yearAgendas, archiveEvents, type AgendaItem, type YearAgenda, type ArchiveEvent } from '@/data/events';

function AgendaItemCard({ item, year }: { item: AgendaItem; year: number }) {
  const eventDate = new Date(item.compareDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPast = eventDate < today;
  const isCanceled = item.canceled;

  return (
    <div
      className={`rounded-lg border p-4 sm:p-5 transition-all ${
        isCanceled
          ? 'bg-gray-50 border-gray-200 opacity-70'
          : isPast
            ? 'bg-gray-50 border-gray-200'
            : 'bg-white border-[#e9e0cf] hover:border-[#ddc0c0] hover:shadow-sm'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        {/* Date */}
        <div className="flex-shrink-0 text-center sm:text-left">
          <div className="text-sm font-semibold text-[#8c0000]">{item.displayDate}</div>
          <div className="text-xs text-gray-400">{year}</div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px bg-gray-200 flex-shrink-0 self-stretch" />

        {/* Event Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <h4 className={`font-semibold text-sm sm:text-base ${isCanceled ? 'line-through text-gray-500' : 'text-[#c00000]'}`}>
              {item.event}
            </h4>
            {isCanceled && (
              <span className="flex-shrink-0 text-[10px] font-bold text-[#c00000] bg-[#fdf6f6] px-2 py-0.5 rounded border border-[#ddc0c0]">
                AFGELAST
              </span>
            )}
          </div>

          {item.eventSub && (
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{item.eventSub}</p>
          )}

          {item.details && (
            <p className="text-xs sm:text-sm text-gray-600 mt-1" dangerouslySetInnerHTML={{ __html: item.details }} />
          )}

          {/* Location */}
          {item.location && item.location !== '-' && (
            <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
              <svg className="w-3.5 h-3.5 text-[#c00000] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span>
                {item.locationUrl ? (
                  <a
                    href={item.locationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#c00000] hover:underline"
                  >
                    {item.location}
                  </a>
                ) : (
                  item.location
                )}
              </span>
              {item.locationSub && <span>, {item.locationSub}</span>}
            </div>
          )}

          {/* Time */}
          {item.time && item.time !== '-' && (
            <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
              <svg className="w-3.5 h-3.5 text-[#c00000] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span dangerouslySetInnerHTML={{ __html: item.time }} />
            </div>
          )}

          {/* Registration Button */}
          {item.inschrijfUrl && item.inschrijfTekst && (
            <a
              href={item.inschrijfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#d90000] text-white text-xs font-semibold rounded-lg hover:bg-[#b20000] transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              {item.inschrijfTekst}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function ArchiveEventCard({ event }: { event: ArchiveEvent }) {
  return (
    <div className="bg-white rounded-lg border border-[#e9e0cf] overflow-hidden hover:shadow-sm transition-shadow">
      <div className="aspect-video bg-gradient-to-br from-[#fdf6f6] to-[#f5f0f0] flex items-center justify-center p-6">
        <div className="text-center">
          <svg className="w-10 h-10 text-[#c00000]/30 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-gray-400">{event.imageUrl}</p>
        </div>
      </div>
      <div className="p-4">
        <h4 className="font-semibold text-sm text-[#8c0000]">{event.title}</h4>
        {event.description && (
          <p className="text-xs text-gray-500 mt-1">{event.description}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">{event.year}</p>
      </div>
    </div>
  );
}

export function EventArchiveSection() {
  const [activeYear, setActiveYear] = useState(yearAgendas[0].year);
  const [activeTab, setActiveTab] = useState<'agenda' | 'archive'>('agenda');

  const currentAgenda = yearAgendas.find((y) => y.year === activeYear);
  const sortedItems = currentAgenda
    ? [...currentAgenda.items].sort((a, b) => a.compareDate.localeCompare(b.compareDate))
    : [];

  const groupedArchive = archiveEvents.reduce<Record<number, ArchiveEvent[]>>((acc, event) => {
    if (!acc[event.year]) acc[event.year] = [];
    acc[event.year].push(event);
    return acc;
  }, {});

  const archiveYears = Object.keys(groupedArchive)
    .map(Number)
    .sort((a, b) => b - a);

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
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold truncate">Agenda & Evenementen</h1>
        <p className="text-white/80 mt-1 text-xs sm:text-sm">Activiteitenkalender en archief van evenementen</p>
        <div className="w-10 sm:w-12 md:w-16 h-0.5 sm:h-1 bg-white/30 rounded-lg mt-2 sm:mt-3" />
      </div>

      {/* Main Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-[#e9e0cf] overflow-hidden">
        <div className="flex border-b border-[#e9e0cf]">
          <button
            onClick={() => setActiveTab('agenda')}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'agenda'
                ? 'bg-gradient-to-r from-[#fdf6f6] to-white text-[#a90000] border-b-2 border-[#a90000]'
                : 'text-gray-500 hover:text-[#a90000] hover:bg-[#fdf6f6]'
            }`}
          >
            Agenda
          </button>
          <button
            onClick={() => setActiveTab('archive')}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'archive'
                ? 'bg-gradient-to-r from-[#fdf6f6] to-white text-[#a90000] border-b-2 border-[#a90000]'
                : 'text-gray-500 hover:text-[#a90000] hover:bg-[#fdf6f6]'
            }`}
          >
            Archief
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {/* Agenda Tab */}
          {activeTab === 'agenda' && (
            <div className="space-y-4">
              {/* Year Selector */}
              <div className="flex flex-wrap gap-2">
                {yearAgendas.map((y) => (
                  <button
                    key={y.year}
                    onClick={() => setActiveYear(y.year)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      activeYear === y.year
                        ? 'bg-gradient-to-r from-[#a90000] to-[#c00000] text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {y.label}
                  </button>
                ))}
              </div>

              {/* Events List */}
              {currentAgenda && sortedItems.length > 0 && (
                <div className="space-y-3">
                  {sortedItems.map((item, idx) => (
                    <AgendaItemCard key={`${item.compareDate}-${idx}`} item={item} year={currentAgenda.year} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Archive Tab */}
          {activeTab === 'archive' && (
            <div className="space-y-6">
              {/* Year Filter */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTab('archive')}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#a90000] to-[#c00000] text-white shadow-sm"
                >
                  Alle
                </button>
                {archiveYears.map((year) => (
                  <span
                    key={year}
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-600"
                  >
                    {year} ({groupedArchive[year]?.length || 0})
                  </span>
                ))}
              </div>

              {/* Archive Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {archiveEvents
                  .sort((a, b) => b.year - a.year)
                  .map((event) => (
                    <ArchiveEventCard key={event.id} event={event} />
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
