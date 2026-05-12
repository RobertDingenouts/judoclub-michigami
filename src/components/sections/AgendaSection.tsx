'use client';

import { useState, useEffect, useRef } from 'react';
import { Calendar, Flame, MapPin, Clock, ArrowRight, Ban, Trophy, XCircle, CircleDot } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { agendaItems } from '@/data/agenda';

function getEmojiIcon(emoji: string, className = "w-5 h-5") {
  switch (emoji) {
    case 'ban': return <Ban className={`${className} text-[#c00000]`} />;
    case 'medal': return <Trophy className={`${className} text-[#c00000]`} />;
    case 'champagne': return <Trophy className={`${className} text-[#c00000]`} />;
    case 'xmark': return <XCircle className={`${className} text-[#c00000]`} />;
    default: return <CircleDot className={`${className} text-[#c00000]`} />;
  }
}

export function AgendaSection() {
  const desktopFirstFutureRef = useRef<HTMLTableRowElement>(null);
  const mobileFirstFutureRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstFutureIdx = agendaItems.findIndex(i => !i.cancelled && new Date(i.compareDate) >= today);

  useEffect(() => {
    // Desktop: scroll to first future event row in table
    if (window.innerWidth >= 768 && desktopFirstFutureRef.current) {
      const el = desktopFirstFutureRef.current;
      setTimeout(() => {
        const scrollContainer = el.closest('[data-slot="scroll-area-viewport"]')
          || el.closest('.ScrollAreaViewport')
          || document.querySelector('[data-slot="scroll-area-viewport"]');

        if (scrollContainer) {
          const elementTop = el.getBoundingClientRect().top + scrollContainer.scrollTop;
          scrollContainer.scrollTo({
            top: elementTop - scrollContainer.clientHeight / 3,
            behavior: 'smooth',
          });
        } else {
          desktopFirstFutureRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }

    // Mobile: scroll to first future event card
    if (window.innerWidth < 768 && mobileFirstFutureRef.current) {
      setTimeout(() => {
        mobileFirstFutureRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 text-white shadow-lg relative overflow-hidden">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold truncate">Judoclub Michigami</h1>
        <p className="text-white/80 mt-1 text-xs sm:text-sm">Activiteitenkalender <span className="font-bold text-[#fce0e0]">2026</span></p>
        <div className="w-10 sm:w-12 md:w-16 h-0.5 sm:h-1 bg-white/30 rounded-full mt-2 sm:mt-3" />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden border border-[#e8eaed]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#fdf6f6]">
              <th className="px-5 py-4 text-left text-xs font-semibold text-[#5c0000] uppercase tracking-wider"><Calendar className="w-4 h-4 inline mr-2" />Datum</th>
              <th className="px-3 py-4 w-10"></th>
              <th className="px-5 py-4 text-left text-xs font-semibold text-[#5c0000] uppercase tracking-wider"><Flame className="w-4 h-4 inline mr-2" />Evenement</th>
              <th className="px-5 py-4 text-left text-xs font-semibold text-[#5c0000] uppercase tracking-wider">Details</th>
              <th className="px-5 py-4 text-left text-xs font-semibold text-[#5c0000] uppercase tracking-wider"><MapPin className="w-4 h-4 inline mr-2" />Locatie</th>
              <th className="px-5 py-4 text-left text-xs font-semibold text-[#5c0000] uppercase tracking-wider"><Clock className="w-4 h-4 inline mr-2" />Tijd/Info</th>
            </tr>
          </thead>
          <tbody>
            {agendaItems.map((item, idx) => {
              const eventDate = new Date(item.compareDate);
              eventDate.setHours(0, 0, 0, 0);
              const isPast = !item.cancelled && eventDate < today;
              const isFirstFuture = idx === firstFutureIdx;

              return (
                <tr key={idx} ref={isFirstFuture ? desktopFirstFutureRef : null} className={`border-b border-[#e8eaed] last:border-b-0 transition-colors hover:bg-[#fff2f2] ${item.cancelled ? 'cancelled-event' : isPast ? 'past-event' : ''}`}>
                  <td className={`px-5 py-4 font-semibold whitespace-nowrap ${item.cancelled ? 'text-[#c00000] line-through opacity-60' : isPast ? 'text-gray-400 font-medium' : 'text-[#8c0000]'}`}>{item.displayDate}</td>
                  <td className="px-3 py-4 text-center">{getEmojiIcon(item.emoji)}</td>
                  <td className="px-5 py-4">
                    <span className={`font-semibold ${item.cancelled ? 'text-[#c00000]' : isPast ? 'text-gray-400 font-medium' : 'text-[#c00000]'}`}>{item.event}</span>
                    {item.eventSub && <span className={`block text-sm mt-0.5 ${isPast ? 'text-gray-400' : 'text-gray-500'}`}>{item.eventSub}</span>}
                  </td>
                  <td className={`px-5 py-4 text-sm ${isPast ? 'text-gray-400' : 'text-gray-600'}`}>{item.details || '-'}</td>
                  <td className="px-5 py-4 text-sm">
                    {item.locationUrl && item.location !== '-' ? (
                      <a href={item.locationUrl} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1 hover:underline ${isPast ? 'text-gray-400 pointer-events-none line-through' : 'text-[#c00000] hover:text-[#a00000]'}`}>
                        <MapPin className="w-3.5 h-3.5" /> {item.location}
                      </a>
                    ) : (<span className={isPast ? 'text-gray-400' : 'text-gray-600'}>{item.location}</span>)}
                    {item.locationSub && <span className="block text-xs text-gray-400">{item.locationSub}</span>}
                  </td>
                  <td className="px-5 py-4 text-sm">
                    <span className={isPast ? 'text-gray-400' : 'text-gray-600'}>{item.time}</span>
                    {item.inschrijfUrl && !item.cancelled && !isPast && (
                      <a href={item.inschrijfUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 bg-[#d90000] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#b20000] transition-colors shadow-sm">
                        <ArrowRight className="w-3.5 h-3.5" /> {item.inschrijfTekst}
                      </a>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        {agendaItems.map((item, idx) => {
          const eventDate = new Date(item.compareDate);
          eventDate.setHours(0, 0, 0, 0);
          const isPast = !item.cancelled && eventDate < today;
          const isFirstFuture = idx === firstFutureIdx;

          return (
            <div key={idx} ref={isFirstFuture ? mobileFirstFutureRef : null} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${item.cancelled ? 'border-red-200 opacity-60' : isPast ? 'border-gray-200 opacity-60' : 'border-[#ddc0c0]'}`}>
              <div className={`px-4 py-2 flex items-center gap-2 ${item.cancelled ? 'bg-red-50' : isPast ? 'bg-gray-50' : 'bg-[#fdf6f6]'}`}>
                {getEmojiIcon(item.emoji, "w-4 h-4")}
                <span className={`text-xs font-semibold ${item.cancelled ? 'text-[#c00000] line-through' : isPast ? 'text-gray-400' : 'text-[#8c0000]'}`}>{item.displayDate}</span>
                {item.cancelled && <Badge variant="destructive" className="text-[10px] ml-auto">AFGELAST</Badge>}
                {isPast && !item.cancelled && <Badge variant="secondary" className="text-[10px] ml-auto">Voorbij</Badge>}
              </div>
              <div className="px-4 py-3 space-y-1">
                <p className={`font-semibold text-sm ${item.cancelled ? 'text-[#c00000]' : isPast ? 'text-gray-400' : 'text-[#c00000]'}`}>
                  {item.event} {item.eventSub && <span className="font-normal text-gray-500">{item.eventSub}</span>}
                </p>
                {item.details && <p className="text-xs text-gray-500">{item.details}</p>}
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                  {item.location !== '-' && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location}</span>}
                  {item.time !== '-' && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.time}</span>}
                </div>
                {item.inschrijfUrl && !item.cancelled && !isPast && (
                  <a href={item.inschrijfUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 bg-[#d90000] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#b20000] transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" /> {item.inschrijfTekst}
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `.past-event td { opacity: 0.6; color: #777 !important; }.past-event .text-\\[\\#8c0000\\] { color: #888 !important; font-weight: 500; }.past-event .text-\\[\\#c00000\\] { color: #888 !important; font-weight: 500; }.cancelled-event td { text-decoration: line-through; opacity: 0.6; background-color: #fafafa; }.cancelled-event .text-\\[\\#c00000\\] { color: #c00000 !important; text-decoration: line-through; }` }} />
    </div>
  );
}
