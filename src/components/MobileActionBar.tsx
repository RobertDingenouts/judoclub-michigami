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

const actionPills = [
  { id: 'whatsapp', emoji: '💬', label: 'WhatsApp', isExternal: true, url: whatsappUrl },
  { id: 'leden' as SectionId, emoji: '📅', label: 'Proefles' },
  { id: 'info' as SectionId, emoji: 'ℹ️', label: 'Info' },
  { id: 'leden' as SectionId, emoji: '👤', label: 'Lid Worden' },
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
    <div className="md:hidden fixed bottom-[4.5rem] left-0 right-0 z-40 px-2 pb-1">
      <div
        className="flex gap-1.5 overflow-x-auto -webkit-overflow-scrolling-touch scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {actionPills.map((pill) => (
          pill.isExternal ? (
            <a
              key={pill.id}
              href={pill.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 inline-flex items-center gap-1 h-8 px-3 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-gray-200/50 text-xs font-medium text-foreground active:scale-[0.97] transition-transform"
            >
              <span className="text-sm">{pill.emoji}</span>
              <span>{pill.label}</span>
            </a>
          ) : (
            <button
              key={pill.id + pill.label}
              onClick={() => onSectionChange(pill.id as SectionId)}
              className={`flex-shrink-0 inline-flex items-center gap-1 h-8 px-3 rounded-full shadow-sm border text-xs font-medium active:scale-[0.97] transition-all ${
                activeSection === pill.id
                  ? 'bg-judo-red/90 backdrop-blur-md text-white border-judo-red'
                  : 'bg-white/80 backdrop-blur-md text-foreground border-gray-200/50'
              }`}
            >
              <span className="text-sm">{pill.emoji}</span>
              <span>{pill.label}</span>
            </button>
          )
        ))}

        {/* More pill — opens bottom sheet */}
        <Drawer direction="bottom" open={moreOpen} onOpenChange={setMoreOpen}>
          <DrawerTrigger asChild>
            <button className="flex-shrink-0 inline-flex items-center gap-1 h-8 px-3 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-gray-200/50 text-xs font-medium text-foreground active:scale-[0.97] transition-transform">
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
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-judo-red-bg transition-all active:scale-[0.98]"
                  >
                    <span>{link.emoji}</span>
                    <span>{link.label}</span>
                  </a>
                ) : (
                  <button
                    key={link.id}
                    onClick={() => { onSectionChange(link.id as SectionId); setMoreOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.98] ${
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
