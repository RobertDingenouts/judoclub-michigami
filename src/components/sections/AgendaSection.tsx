'use client';

import { useState, useEffect, useRef } from 'react';
import { agendaItems, type AgendaItem } from '@/data/agenda';
import { MapPin, ExternalLink, Trophy, Ban, X } from 'lucide-react';

export function AgendaSection() {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const tableRef = useRef<HTMLTableElement>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    // Auto-scroll to first future event
    if (tableRef.current) {
      const firstFutureRow = tableRef.current.querySelector('[data-future="true"]');
      if (firstFutureRow) {
        firstFutureRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [filter]);

  const filteredItems = agendaItems.filter(item => {
    const itemDate = new Date(item.compareDate);
    if (filter === 'upcoming') return itemDate >= today;
    if (filter === 'past') return itemDate < today;
    return true;
  });

  const isPast = (item: AgendaItem) => new Date(item.compareDate) < today;
  const isFuture = (item: AgendaItem) => new Date(item.compareDate) >= today;

  const getEmojiIcon = (emoji: string) => {
    switch (emoji) {
      case 'medal': return <Trophy className="w-4 h-4 text-yellow-600" />;
      case 'ban': return <Ban className="w-4 h-4 text-gray-400" />;
      case 'xmark': return <X className="w-4 h-4 text-red-500" />;
      case 'champagne': return <span className="text-base">🍾</span>;
      default: return <span className="text-base">📅</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-judo-red-darker via-judo-red to-judo-red-bright text-white p-4 sm:p-6 md:p-8">
        <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-[5rem] sm:text-[7rem] md:text-[8rem] leading-none opacity-[0.06] font-serif select-none max-w-full" aria-hidden="true">
          柔道
        </div>
        <div className="relative z-10">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold truncate">Activiteitenkalender 2026</h1>
          <p className="mt-1 text-xs sm:text-sm text-white/80">Judoclub Michigami Steenbergen</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[
          { key: 'all' as const, label: 'Alles' },
          { key: 'upcoming' as const, label: 'Komend' },
          { key: 'past' as const, label: 'Afgelopen' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.key
                ? 'bg-judo-red text-white'
                : 'bg-judo-red-bg text-judo-red-text hover:bg-judo-red-border'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table / Cards */}
      <div className="bg-white rounded-xl border border-judo-red-border overflow-hidden">
        <div className="overflow-x-auto">
          <table ref={tableRef} className="agenda-table w-full">
            <thead>
              <tr className="bg-gradient-to-r from-judo-red to-judo-red-bright text-white text-sm">
                <th className="text-left py-3 px-4 font-semibold">Datum</th>
                <th className="text-center py-3 px-2 font-semibold w-10"></th>
                <th className="text-left py-3 px-4 font-semibold">Evenement</th>
                <th className="text-left py-3 px-4 font-semibold hidden md:table-cell">Details</th>
                <th className="text-left py-3 px-4 font-semibold">Locatie</th>
                <th className="text-left py-3 px-4 font-semibold w-28">Tijd/Info</th>
                <th className="text-center py-3 px-4 font-semibold w-28"></th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, idx) => {
                const past = isPast(item);
                const future = isFuture(item);
                const cancelled = item.cancelled;

                return (
                  <tr
                    key={idx}
                    data-future={future && !cancelled}
                    className={`border-b border-judo-red-border/50 transition-colors ${
                      cancelled
                        ? 'opacity-60 bg-red-50/50'
                        : past
                        ? 'opacity-60 bg-gray-50/50'
                        : 'hover:bg-judo-red-bg-light'
                    }`}
                  >
                    {/* Datum */}
                    <td
                      data-label="Datum"
                      className={`py-3 px-4 text-sm whitespace-nowrap ${
                        past ? 'line-through text-gray-400' : 'font-medium text-foreground'
                      }`}
                    >
                      {item.displayDate}
                    </td>

                    {/* Emoji */}
                    <td data-label="" className="py-3 px-2 text-center">
                      {getEmojiIcon(item.emoji)}
                    </td>

                    {/* Evenement */}
                    <td data-label="Evenement" className="py-3 px-4 text-sm">
                      <span className={cancelled ? 'line-through text-red-600 font-medium' : past ? 'text-gray-400' : 'font-medium text-foreground'}>
                        {item.event}
                      </span>
                      {item.eventSub && (
                        <span className={`block text-xs ${cancelled ? 'text-red-400' : 'text-muted-foreground'}`}>
                          {item.eventSub}
                        </span>
                      )}
                    </td>

                    {/* Details */}
                    <td data-label="Details" className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">
                      {item.details || '-'}
                    </td>

                    {/* Locatie */}
                    <td data-label="Locatie" className="py-3 px-4 text-sm">
                      {item.locationUrl && !cancelled ? (
                        <a
                          href={item.locationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1 ${
                            past ? 'text-gray-400 pointer-events-none' : 'text-judo-red hover:text-judo-red-dark'
                          }`}
                        >
                          <MapPin className="w-3 h-3" />
                          {item.location}
                          {item.locationSub && <span className="text-xs text-muted-foreground">({item.locationSub})</span>}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className={past ? 'text-gray-400' : 'text-foreground'}>
                          {item.location}
                          {item.locationSub && <span className="text-xs text-muted-foreground ml-1">({item.locationSub})</span>}
                        </span>
                      )}
                    </td>

                    {/* Tijd */}
                    <td data-label="Tijd" className={`py-3 px-4 text-sm ${past ? 'text-gray-400' : 'text-foreground'}`}>
                      {item.time || '-'}
                    </td>

                    {/* Inschrijven */}
                    <td data-label="" className="py-3 px-4 text-center">
                      {item.inschrijfUrl && !cancelled && !past ? (
                        <a
                          href={item.inschrijfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 bg-judo-red-bright hover:bg-judo-red text-white text-xs px-3 py-1.5 rounded-md font-medium transition-colors"
                        >
                          {item.inschrijfTekst || 'Inschrijven'}
                        </a>
                      ) : cancelled ? (
                        <span className="text-xs text-red-500 font-medium">Afgelast</span>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Trophy className="w-3 h-3 text-yellow-600" /> Toernooi / Evenement
        </div>
        <div className="flex items-center gap-1.5">
          <Ban className="w-3 h-3 text-gray-400" /> Geen les
        </div>
        <div className="flex items-center gap-1.5">
          <X className="w-3 h-3 text-red-500" /> Afgelast
        </div>
      </div>
    </div>
  );
}
