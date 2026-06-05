'use client';

import { useState, useEffect, useRef } from 'react';
import { Calendar, Flame, MapPin, Clock, ArrowRight, Ban, Trophy, XCircle, CircleDot } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { agendaItems } from '@/data/agenda';

interface Weegtijd {
  time: string;
  age: string;
}

interface AgendaItemWithWeegtijden {
  compareDate: string;
  displayDate: string;
  event: string;
  emoji: string;
  eventSub?: string;
  details?: string;
  location: string;
  locationSub?: string;
  locationUrl?: string;
  time: string;
  inschrijfUrl?: string;
  inschrijfTekst?: string;
  cancelled?: boolean;
  weegtijden?: Weegtijd[];
  special?: boolean;
}

function getEmojiIcon(emoji: string, className = "w-5 h-5") {
  switch (emoji) {
    case 'ban': return <Ban className={`${className} text-[#c00000]`} />;
    case 'medal': return <Trophy className={`${className} text-[#c00000]`} />;
    case 'champagne': return <Trophy className={`${className} text-[#c00000]`} />;
    case 'xmark': return <XCircle className={`${className} text-[#c00000]`} />;
    default: return <CircleDot className={`${className} text-[#c00000]`} />;
  }
}

function InfoTooltip({ weegtijden }: { weegtijden: Weegtijd[] }) {
  const [hovered, setHovered] = useState(false);

  return (
    <span
      className="inline-flex relative ml-1"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        className="w-[22px] h-[22px] rounded-full bg-[#a90000] text-white text-[11px] font-bold flex items-center justify-center cursor-pointer hover:bg-[#8c0000] hover:scale-110 transition-all border-none"
        aria-label="Weegtijden"
      >
        i
      </button>
      {hovered && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white border-2 border-[#a90000] rounded-lg px-4 py-3 min-w-[240px] shadow-lg z-50 text-sm">
          <h4 className="m-0 mb-2 text-[#a90000] text-sm font-bold">⏰ Weegtijden</h4>
          <ul className="list-none p-0 m-0">
            {weegtijden.map((wt, i) => (
              <li key={i} className="py-1 text-sm text-[#333] border-b border-gray-100 last:border-b-0">
                <span className="font-semibold text-[#c00000]">{wt.time}</span> — {wt.age}
              </li>
            ))}
          </ul>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px]">
            <div className="w-0 h-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-[#a90000]" />
          </div>
        </div>
      )}
    </span>
  );
}

export function AgendaSection() {
  const desktopFirstFutureRef = useRef<HTMLTableRowElement>(null);
  const mobileFirstFutureRef = useRef<HTMLDivElement>(null);
  const [confettiActive, setConfettiActive] = useState(false);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstFutureIdx = agendaItems.findIndex(i => !i.cancelled && new Date(i.compareDate) >= today);

  const triggerConfetti = () => {
    setConfettiActive(true);
    setTimeout(() => setConfettiActive(false), 3000);
  };

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
    <>
      <style>{`
        @keyframes special-pulse { 0%, 100% { border-color: #ffd700; } 50% { border-color: #ffaa00; } }
        @keyframes special-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .special-event-row { border-left: 4px solid #ffd700 !important; background: linear-gradient(90deg, #fffef0 0%, #ffffff 30%) !important; cursor: pointer; }
        .special-event-row:hover { background: linear-gradient(90deg, #fffbe0 0%, #fff8f0 30%) !important; }
        .special-badge { display: inline-flex; align-items: center; gap: 2px; font-size: 11px; font-weight: 700; color: #b8860b; background: linear-gradient(135deg, #fff8dc, #ffd700); padding: 2px 8px; border-radius: 999px; border: 1px solid #daa520; white-space: nowrap; }
        .special-card { border: 2px solid #ffd700 !important; background: linear-gradient(135deg, #fffef5, #ffffff) !important; animation: special-pulse 3s ease-in-out infinite; cursor: pointer; }
        .special-card .special-badge-mobile { display: inline-flex; align-items: center; gap: 3px; font-size: 10px; font-weight: 700; color: #b8860b; background: linear-gradient(135deg, #fff8dc, #ffd700); padding: 2px 10px; border-radius: 999px; border: 1px solid #daa520; margin-left: auto; white-space: nowrap; }
        @keyframes confetti-fall { 0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; } 100% { transform: translateY(110vh) rotate(720deg); opacity: 0; } }
        .confetti-piece { position: fixed; top: 0; width: 10px; height: 10px; z-index: 9999; pointer-events: none; animation: confetti-fall 3s linear forwards; }
      `}</style>
      <div className="space-y-4">
      {/* Header — gradient branding zoals oude agenda */}
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
              const weegtijden = (item as AgendaItemWithWeegtijden).weegtijden;

              return (
                <tr key={idx} ref={isFirstFuture ? desktopFirstFutureRef : null} className={`border-b border-[#e8eaed] last:border-b-0 transition-colors hover:bg-[#fff2f2] ${item.cancelled ? 'cancelled-event' : isPast ? 'past-event' : ''} ${item.special ? 'special-event-row' : ''}`} style={item.special ? { animation: 'special-pulse 3s ease-in-out infinite' } : undefined} onClick={item.special ? triggerConfetti : undefined}>
                  <td className={`px-5 py-4 font-semibold whitespace-nowrap ${item.cancelled ? 'text-[#c00000] line-through opacity-60' : isPast ? 'text-gray-400 font-medium' : 'text-[#8c0000]'}`}>{item.displayDate}</td>
                  <td className="px-3 py-4 text-center">{item.special ? <span className="text-lg">⭐</span> : getEmojiIcon(item.emoji)}</td>
                  <td className="px-5 py-4">
                    <span className={`font-semibold ${item.cancelled ? 'text-[#c00000]' : isPast ? 'text-gray-400 font-medium' : 'text-[#c00000]'}`}>{item.event}</span>
                    {item.special && <span className="ml-2 special-badge">🎉 50-jarig!</span>}
                    {item.eventSub && <span className={`block text-sm mt-0.5 ${isPast ? 'text-gray-400' : 'text-gray-500'}`}>{item.eventSub}</span>}
                  </td>
                  <td className={`px-5 py-4 text-sm ${isPast ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.details || '-'}
                    {weegtijden && (
                      <InfoTooltip weegtijden={weegtijden} />
                    )}
                  </td>
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
                        <ArrowRight className="w-3.5 h-3.5" /> {item.inschrijfTekst || 'Inschrijven'}
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
          const weegtijden = (item as AgendaItemWithWeegtijden).weegtijden;

          return (
            <div key={idx} ref={isFirstFuture ? mobileFirstFutureRef : null} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${item.cancelled ? 'border-red-200 opacity-60' : isPast ? 'border-gray-200 opacity-60' : item.special ? 'special-card' : 'border-[#ddc0c0]'}`} onClick={item.special ? triggerConfetti : undefined}>
              <div className={`px-4 py-2 flex items-center gap-2 ${item.cancelled ? 'bg-red-50' : isPast ? 'bg-gray-50' : item.special ? 'bg-yellow-50' : 'bg-[#fdf6f6]'}`}>
                {item.special ? <span className="text-base">⭐</span> : getEmojiIcon(item.emoji, "w-4 h-4")}
                <span className={`text-xs font-semibold ${item.cancelled ? 'text-[#c00000] line-through' : isPast ? 'text-gray-400' : item.special ? 'text-[#b8860b]' : 'text-[#8c0000]'}`}>{item.displayDate}</span>
                {item.special && <span className="special-badge-mobile">🎉 50-jarig!</span>}
                {item.cancelled && <Badge variant="destructive" className="text-[10px] ml-auto">AFGELAST</Badge>}
                {isPast && !item.cancelled && <Badge variant="secondary" className="text-[10px] ml-auto">Voorbij</Badge>}
              </div>
              <div className="px-4 py-3 space-y-1">
                <p className={`font-semibold text-sm ${item.cancelled ? 'text-[#c00000]' : isPast ? 'text-gray-400' : 'text-[#c00000]'}`}>
                  {item.event} {item.eventSub && <span className="font-normal text-gray-500">{item.eventSub}</span>}
                </p>
                {item.details && <p className="text-xs text-gray-500">{item.details}</p>}
                {/* Weegtijden info button for mobile */}
                {weegtijden && (
                  <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-xs font-bold text-[#a90000] mb-1">⏰ Weegtijden</p>
                    <ul className="space-y-0.5">
                      {weegtijden.map((wt, i) => (
                        <li key={i} className="text-xs text-gray-600">
                          <span className="font-semibold text-[#c00000]">{wt.time}</span> — {wt.age}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex flex-col gap-2 text-xs text-gray-500 mt-1">
                   {item.location !== '-' && <span className="flex items-center gap-1"><MapPin className="w-3 h-3 flex-shrink-0"/>{item.locationUrl ? <a href={item.locationUrl} target="_blank" rel="noopener noreferrer" className="text-[#c00000] hover:underline">{item.location}</a> : <>{item.location}</>}{item.locationSub && <span className="text-gray-400">{item.locationSub}</span>}</span>}
                   {item.time !== '-' && <span className="flex items-center gap-1"><Clock className="w-3 h-3 flex-shrink-0"/>{item.time}</span>}
                 </div>
                {item.inschrijfUrl && !item.cancelled && !isPast && (
                  <a href={item.inschrijfUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 bg-[#d90000] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#b20000] transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" /> {item.inschrijfTekst || 'Inschrijven'}
                  </a>
                )}
              </div>
            </div>
          );
        })}
     </div>

    <style dangerouslySetInnerHTML={{ __html: `.past-event td { opacity: 0.6; color: #777 !important; }.past-event .text-\\\\\\\\\\\\\\\\[\\\\\\\\\\\\\\\\#8c0000\\\\\\\\\\\\\\\\] { color: #888 !important; font-weight: 500; }.past-event .text-\\\\\\\\\\\\\\\\[\\\\\\\\\\\\\\\\#c00000\\\\\\\\\\\\\\\\] { color: #888 !important; font-weight: 500; }.cancelled-event td { text-decoration: line-through; opacity: 0.6; background-color: #fafafa; }.cancelled-event .text-\\\\\\\\\\\\\\\\[\\\\\\\\\\\\\\\\#c00000\\\\\\\\\\\\\\\\] { color: #c00000 !important; text-decoration: line-through; }` }} />
    </div>

    {/* Confetti overlay */}
    {confettiActive && (
      <div className="fixed inset-0 pointer-events-none z-[9999]" aria-hidden="true">
        {Array.from({ length: 60 }).map((_, i) => {
          const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#ff9ff3', '#54a0ff', '#5f27cd', '#01a3a4', '#f368e0'];
          const color = colors[i % colors.length];
          const left = Math.random() * 100;
          const delay = Math.random() * 0.5;
          const size = 6 + Math.random() * 8;
          const shape = i % 3 === 0 ? '50%' : i % 3 === 1 ? '0' : '2px';
          return (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${left}%`,
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: color,
                borderRadius: shape,
                animationDelay: `${delay}s`,
                animationDuration: `${2.5 + Math.random() * 1.5}s`,
              }}
            />
          );
        })}
      </div>
    )}
    </>
  );
}
