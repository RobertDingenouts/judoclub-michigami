'use client';

import { useState } from 'react';
import { type SectionId } from './nav-config';
import { contactInfo } from '@/data/contact';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

interface MobileActionBarProps {
  activeSection: SectionId;
  onSectionChange: (section: SectionId) => void;
}

const whatsappUrl = `https://wa.me/31${contactInfo.whatsapp.slice(1)}?text=${encodeURIComponent('Hoi! Ik wil graag meer informatie over een proefles judo.')}`;

// All items in order: nav + action pills merged into one list
const allItems: { id: SectionId | string; emoji: string; label: string; isExternal?: boolean; url?: string }[] = [
  { id: 'home', emoji: '🏠', label: 'Home' },
  { id: 'agenda', emoji: '📅', label: 'Agenda' },
  { id: 'technieken', emoji: '🥋', label: 'Technieken' },
  { id: 'exameneisen', emoji: '🎯', label: 'Examens' },
  { id: 'whatsapp', emoji: '💬', label: 'WhatsApp', isExternal: true, url: whatsappUrl },
  { id: 'leden', emoji: '📅', label: 'Proefles' },
  { id: 'info', emoji: 'ℹ️', label: 'Info' },
  { id: 'leden', emoji: '👤', label: 'Lid Worden' },
  { id: 'cursusjapans', emoji: '🇯🇵', label: 'C.Japans' },
];

const moreLinks: { id: SectionId | string; emoji: string; label: string; isExternal?: boolean; url?: string }[] = [
  { id: 'locatie', emoji: '📍', label: 'Locatie' },
  { id: 'contact', emoji: '✉️', label: 'Contact' },
  { id: 'foto-galerij', emoji: '📸', label: "Foto's" },
  { id: 'video-galerij', emoji: '🎬', label: "Video's" },
  { id: 'lestijden', emoji: '🕐', label: 'Lestijden' },
  { id: 'band-knopen', emoji: '🪢', label: 'Band Knopen' },
  { id: 'formulieren', emoji: '📋', label: 'Formulieren' },
];

export function MobileActionBar({ activeSection, onSectionChange }: MobileActionBarProps) {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <div className="md:hidden fixed bottom-4 left-0 right-0 z-50 pointer-events-none">
      <div
        className="flex gap-1.5 overflow-x-auto -webkit-overflow-scrolling-touch px-2 pointer-events-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {allItems.map((item) =>
          item.isExternal ? (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 inline-flex items-center gap-1 h-9 px-3 rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-gray-200/60 text-xs font-medium text-foreground active:scale-[0.99] transition-transform"
            >
              <span className="text-sm">{item.emoji}</span>
              <span>{item.label}</span>
            </a>
          ) : (
            <button
              key={item.id + item.label}
              onClick={() => onSectionChange(item.id as SectionId)}
              className={`flex-shrink-0 inline-flex items-center gap-1 h-9 px-3 rounded-full shadow-lg border text-xs font-medium active:scale-[0.99] transition-all ${
                activeSection === item.id
                  ? 'bg-judo-red/90 backdrop-blur-md text-white border-judo-red'
                  : 'bg-white/80 backdrop-blur-md text-foreground border-gray-200/60'
              }`}
            >
              <span className="text-sm">{item.emoji}</span>
              <span>{item.label}</span>
            </button>
          )
        )}

        {/* More pill — opens bottom sheet */}
        <Drawer direction="bottom" open={moreOpen} onOpenChange={setMoreOpen}>
          <DrawerTrigger asChild>
            <button className="flex-shrink-0 inline-flex items-center gap-1 h-9 px-3 rounded-full bg-white/80 backdrop-blur-md shadow-lg border border-gray-200/60 text-xs font-medium text-foreground active:scale-[0.99] transition-transform">
              <span className="text-sm">⋯</span>
              <span>Meer</span>
            </button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[70vh]">
            <DrawerHeader>
              <DrawerTitle className="text-center font-bold" style={{ color: '#8c0000' }}>
                Meer Opties
              </DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-6 space-y-1">
              {moreLinks.map((link) => (
                link.isExternal ? (
                  <a
                    key={link.id}
                    href={link.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-judo-red-bg transition-all active:scale-[0.99]"
                  >
                    <span>{link.emoji}</span>
                    <span>{link.label}</span>
                  </a>
                ) : (
                  <button
                    key={link.id}
                    onClick={() => { onSectionChange(link.id as SectionId); setMoreOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.99] ${
                      activeSection === link.id
                        ? 'bg-judo-red text-white'
                        : 'text-foreground hover:bg-judo-red-bg'
                    }`}
                  >
                    <span>{link.emoji}</span>
                    <span>{link.label}</span>
                  </button>
                )
              ))}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
