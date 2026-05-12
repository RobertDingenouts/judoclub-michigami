'use client';

import { ArrowRight } from 'lucide-react';
import type { Section } from '@/components/nav-config';

const itemDescriptions: Record<string, string> = {
  'home': 'Welkom & overzicht',
  'agenda': 'Evenementen & data',
  'leden': 'Lidmaatschap & kosten',
  'lestijden': 'Trainingstijden',
  'locatie': 'Onze locaties',
  'info': 'Geschiedenis & leiding',
  'contact': 'Neem contact op',
  'juridisch': 'Privacy & voorwaarden',
  'technieken': 'Alle judotechnieken',
  'exameneisen': 'Eisen per bandniveau',
  'cursusjapans': 'Japanse termen leren',
  'techniekenkaart': 'Overzicht kaarten',
  'band-knopen': 'Hoe je judoband knoopt',
  'nieuws': 'Nieuwsberichten',
  'foto-galerij': 'Fotoalbum',
  'video-galerij': 'Videogalerij',
};

const itemColors: Record<string, { color: string; bg: string }> = {
  'home': { color: '#c00000', bg: '#fff2f2' },
  'agenda': { color: '#c00000', bg: '#fff2f2' },
  'leden': { color: '#8c0000', bg: '#fff2f2' },
  'lestijden': { color: '#c00000', bg: '#fce8e8' },
  'locatie': { color: '#8c0000', bg: '#fff2f2' },
  'info': { color: '#c00000', bg: '#fff2f2' },
  'contact': { color: '#8c0000', bg: '#fff2f2' },
  'juridisch': { color: '#6c757d', bg: '#f4f5f6' },
  'technieken': { color: '#8c0000', bg: '#fff2f2' },
  'exameneisen': { color: '#c00000', bg: '#fce8e8' },
  'cursusjapans': { color: '#c00000', bg: '#fce8e8' },
  'techniekenkaart': { color: '#8c0000', bg: '#fff2f2' },
  'band-knopen': { color: '#c00000', bg: '#fce8e8' },
  'nieuws': { color: '#c00000', bg: '#fff2f2' },
  'foto-galerij': { color: '#8c0000', bg: '#fff2f2' },
  'video-galerij': { color: '#c00000', bg: '#fce8e8' },
};

export function CategoryHubSection({ group, onNavigate, navGroups, groupHubMap }: {
  group: { label: string; emoji: string; items: { key: Section; label: string; icon: React.ReactNode }[] };
  onNavigate: (s: Section) => void;
  navGroups: { label: string; emoji: string; items: { key: string }[] }[];
  groupHubMap: Record<string, Section>;
}) {
  return (
    <div className="space-y-6 pb-4 sm:pb-0">
      {/* Header */}
      <div className="text-center py-8 px-4" style={{ background: 'linear-gradient(135deg, #fdf6f6 0%, #fff 100%)' }}>
        <div className="text-5xl mb-3">{group.emoji}</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{group.label}</h1>
        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
          Verken alles over {group.label.toLowerCase()} — kies een onderwerp om te beginnen.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {group.items.map((item) => {
          const c = itemColors[item.key] || { color: '#c00000', bg: '#fff2f2' };
          return (
            <button key={item.key} onClick={() => onNavigate(item.key)} className="group flex items-start gap-4 p-5 rounded-2xl border transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] text-left" style={{ backgroundColor: c.bg, borderColor: c.color + '15' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110" style={{ backgroundColor: c.color + '15' }}>
                <span style={{ color: c.color }}>{item.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 group-hover:text-[#c00000] transition-colors">{item.label}</h3>
                <p className="text-xs text-gray-500 mt-1">{itemDescriptions[item.key] || ''}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#c00000] transition-colors flex-shrink-0 mt-1" />
            </button>
          );
        })}
      </div>

      {/* Verken ook */}
      <div className="border-t border-[#e8eaed] pt-5 mt-2">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Verken ook</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {navGroups.filter(g => g.label !== group.label).map(otherGroup => (
            <button key={otherGroup.label} onClick={() => onNavigate(groupHubMap[otherGroup.label])} className="flex items-center gap-3 p-4 rounded-xl border border-[#e8eaed] bg-white hover:shadow-md hover:border-[#c00000]/20 transition-all active:scale-[0.98]">
              <span className="text-3xl">{otherGroup.emoji}</span>
              <div className="text-left">
                <span className="text-sm font-semibold text-gray-700 block">{otherGroup.label}</span>
                <span className="text-[10px] text-gray-400">{otherGroup.items.length} onderwerpen</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
