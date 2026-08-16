'use client';

import { useState } from 'react';
import { type SectionId } from './nav-config';
import { MobileUserAvatar } from './UserDropdown';
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
  onProeflesClick?: () => void;
}

// All items in order: Home → Agenda → Info → Proefles → Lid Worden → Technieken → Examens → C.Japans → Meer
const allItems: { id: SectionId | string; emoji: string; label: string; isProefles?: boolean }[] = [
  { id: 'home', emoji: '🏠', label: 'Home' },
  { id: 'agenda', emoji: '📅', label: 'Agenda' },
  { id: 'info', emoji: 'ℹ️', label: 'Info' },
  { id: 'proefles', emoji: '🥋', label: 'Proefles', isProefles: true },
  { id: 'leden', emoji: '👤', label: 'Lid Worden' },
  { id: 'technieken', emoji: '🎯', label: 'Technieken' },
  { id: 'exameneisen', emoji: '🏅', label: 'Examens' },
  { id: 'cursusjapans', emoji: '🇯🇵', label: 'C.Japans' },
];

const moreLinks: { id: SectionId | string; emoji: string; label: string; isExternal?: boolean; url?: string }[] = [
  { id: 'signin', emoji: '🔑', label: 'Inloggen / Registreren', isExternal: true, url: '/signin' },
  { id: 'locatie', emoji: '📍', label: 'Locatie' },
  { id: 'contact', emoji: '✉️', label: 'Contact' },
  { id: 'foto-galerij', emoji: '📸', label: "Foto's" },
  { id: 'video-galerij', emoji: '🎬', label: "Video's" },
  { id: 'lestijden', emoji: '🕐', label: 'Lestijden' },
  { id: 'band-knopen', emoji: '🪢', label: 'Band Knopen' },
  { id: 'formulieren', emoji: '📋', label: 'Formulieren' },
];

export function MobileActionBar({ activeSection, onSectionChange, onProeflesClick }: MobileActionBarProps) {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <div className="md:hidden fixed bottom-4 left-0 right-0 z-50 pointer-events-none">
      <div
        className="flex gap-1.5 overflow-x-auto -webkit-overflow-scrolling-touch px-2 pointer-events-auto items-center"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* User avatar — shows when logged in */}
        <MobileUserAvatar onSectionChange={(s) => { onSectionChange(s as SectionId); setMoreOpen(false); }} />
        {allItems.map((item) => (
          <button
            key={item.id + item.label}
            onClick={() => {
              if (item.isProefles) {
                onProeflesClick?.();
              } else {
                onSectionChange(item.id as SectionId);
              }
            }}
            className={`flex-shrink-0 inline-flex items-center gap-1 h-9 px-3 rounded-none shadow-lg border text-xs font-medium active:scale-[0.99] transition-all ${
              item.isProefles
                ? 'bg-gradient-to-r from-[#27ae60] to-[#2ecc71] text-white border-transparent'
                : activeSection === item.id
                ? 'bg-[#fff2f2] backdrop-blur-md text-foreground border-judo-red'
                : 'bg-white/80 backdrop-blur-md text-foreground border-gray-200/60'
            }`}
          >
            <span className="text-sm">{item.emoji}</span>
            <span>{item.label}</span>
          </button>
        ))}

        {/* More pill — opens bottom sheet */}
        <Drawer direction="bottom" open={moreOpen} onOpenChange={setMoreOpen}>
          <DrawerTrigger asChild>
            <button className="flex-shrink-0 inline-flex items-center gap-1 h-9 px-3 rounded-none bg-white/80 backdrop-blur-md shadow-lg border border-gray-200/60 text-xs font-medium text-foreground active:scale-[0.99] transition-transform">
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
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-none text-sm font-medium text-foreground hover:bg-judo-red-bg transition-all active:scale-[0.99]"
                  >
                    <span>{link.emoji}</span>
                    <span>{link.label}</span>
                  </a>
                ) : (
                  <button
                    key={link.id}
                    onClick={() => { onSectionChange(link.id as SectionId); setMoreOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-none text-sm font-medium transition-all active:scale-[0.99] ${
                      activeSection === link.id
                        ? 'bg-[#fff2f2] text-foreground border border-judo-red'
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
