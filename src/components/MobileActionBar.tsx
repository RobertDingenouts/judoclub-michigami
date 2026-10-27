'use client';

import { useEffect, useState } from 'react';
import { Home, CalendarDays, Info, UserPlus, MoreHorizontal } from 'lucide-react';
import { type SectionId } from './nav-config';
import { getBeltLabel } from '@/lib/belt-utils';
import { LangToggle } from './LangToggle';
import { useT } from '@/i18n/LangContext';
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

// Vast aantal pillen — past altijd op het scherm, de rest gaat in "Meer"
const mainItems: { id: SectionId | string; icon: React.ReactNode; label: string; isProefles?: boolean }[] = [
  { id: 'home', icon: <Home className="w-4 h-4" />, label: 'Home' },
  { id: 'agenda', icon: <CalendarDays className="w-4 h-4" />, label: 'Agenda' },
  { id: 'info', icon: <Info className="w-4 h-4" />, label: 'Info' },
  { id: 'proefles', icon: <UserPlus className="w-4 h-4" />, label: 'Proefles', isProefles: true },
];

const moreLinks: { id: SectionId | string; label: string; isExternal?: boolean; url?: string }[] = [
  { id: 'leden', label: 'Lid worden' },
  { id: 'technieken', label: 'Technieken' },
  { id: 'exameneisen', label: 'Examens' },
  { id: 'cursusjapans', label: 'Cursus Japans' },
  { id: 'lestijden', label: 'Lestijden' },
  { id: 'nieuws', label: 'Nieuws' },
  { id: 'signin', label: 'Inloggen', isExternal: true, url: '/signin' },
  { id: 'locatie', label: 'Locaties' },
  { id: 'contact', label: 'Contact' },
  { id: 'foto-galerij', label: "Foto's" },
  { id: 'video-galerij', label: "Video's" },
  { id: 'band-knopen', label: 'Band knopen' },
  { id: 'formulieren', label: 'Formulieren' },
];

export function MobileActionBar({ activeSection, onSectionChange, onProeflesClick }: MobileActionBarProps) {
  const { t } = useT();
  const [moreOpen, setMoreOpen] = useState(false);

  const [user, setUser] = useState<any | null>(null);
  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (d.authenticated && d.user) setUser(d.user); }).catch(() => {});
  }, []);

  const lidLinks: { href: string; label: string; show?: boolean }[] = user ? [
    { href: '/leden', label: 'Leden Dashboard' },
    { href: '/leden/voortgang', label: 'Voortgang' },
    { href: "/leden/diploma's", label: "Mijn Diploma's" },
    { href: '/leden/cursus-japans', label: 'Cursus Japans' },
    { href: '/leden/prijslijst', label: 'Materiaal & Prijzen' },
    { href: '/leden/profiel/bewerken', label: 'Profiel & Instellingen' },
    { href: '/admin', label: 'Admin Dashboard', show: user.role === 'ADMIN' },
  ] : [];

  return (
    <div className="md:hidden fixed bottom-4 left-3 right-3 z-50 pointer-events-none">
      <div
        className="flex gap-1.5 pointer-events-auto items-center justify-between bg-white/85 backdrop-blur-md rounded-2xl border border-[#2a2a2a]/10 shadow-lg px-2 py-1.5"
      >
        {mainItems.map((item) => (
          <button
            key={item.id + item.label}
            onClick={() => {
              if (item.isProefles) {
                onProeflesClick?.();
              } else {
                onSectionChange(item.id as SectionId);
              }
            }}
            className={`flex-1 inline-flex flex-col items-center gap-0.5 h-12 px-2 rounded-xl text-[11px] font-medium active:scale-[0.98] transition-all ${
              item.isProefles
                ? 'text-white'
                : activeSection === item.id
                ? 'bg-[#fff2f2] text-[#8c0000]'
                : 'text-[#1c1915]'
            }`}
            style={item.isProefles ? { backgroundColor: '#a90000' } : undefined}
          >
            {item.icon}
            <span>{t(item.label)}</span>
          </button>
        ))}

        {/* More pill — opens bottom sheet */}
        <Drawer direction="bottom" open={moreOpen} onOpenChange={setMoreOpen}>
          <DrawerTrigger asChild>
            <button className="flex-1 inline-flex flex-col items-center gap-0.5 h-12 px-2 rounded-xl text-[11px] font-medium text-[#1c1915] active:scale-[0.98] transition-transform">
              <MoreHorizontal className="w-4 h-4" />
              <span>{t('Meer')}</span>
            </button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[70vh]">
            <DrawerHeader>
              <DrawerTitle className="text-center font-bold" style={{ color: '#8c0000' }}>
                {t('Meer')}
              </DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-6 space-y-1">
              {user && (
                <>
                  <div className="flex items-center gap-3 px-1 pt-1 pb-2">
                    <span className="w-9 h-9 rounded-lg bg-[#a90000] text-white text-[11px] font-bold flex items-center justify-center">
                      {((user.member?.firstName || user.name || '·').trim().split(' ').map((n: string) => n[0]).join('') || '·').toUpperCase().slice(0, 2)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#2a2a2a]">{user.member?.firstName || user.name}</p>
                      {(user.member?.currentBelt || user.currentBelt) && <p className="text-[11px] text-gray-500">{getBeltLabel(user.member?.currentBelt || user.currentBelt)}</p>}
                    </div>
                  </div>
                  {lidLinks.filter(l => l.show !== false).map(l => (
                    <a key={l.href} href={l.href}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#2a2a2a] hover:bg-[#fdf6f6] active:scale-[0.99]">
                      <span>{t(l.label)}</span>
                    </a>
                  ))}
                  <div className="border-t border-[#2a2a2a]/10 my-2" />
                </>
              )}
              <div className="flex justify-center py-2 border-b border-[#2a2a2a]/10 mb-2">
                <LangToggle />
              </div>
              {moreLinks.map((link) => (
                link.isExternal ? (
                  <a
                    key={link.id}
                    href={link.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-judo-red-bg transition-all active:scale-[0.99]"
                  >
                    <span>{t(link.label)}</span>
                  </a>
                ) : (
                  <button
                    key={link.id}
                    onClick={() => { onSectionChange(link.id as SectionId); setMoreOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all active:scale-[0.99] ${
                      activeSection === link.id
                        ? 'bg-[#fff2f2] text-foreground border border-judo-red'
                        : 'text-foreground hover:bg-judo-red-bg'
                    }`}
                  >
                    <span>{t(link.label)}</span>
                  </button>
                )
              ))}
              {user && (
                <button
                  onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/'; }}
                  className="w-full flex items-center gap-3 px-4 py-3 mt-3 rounded-lg text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 active:scale-[0.99]">
                  <span>{t('Uitloggen')}</span>
                </button>
              )}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
