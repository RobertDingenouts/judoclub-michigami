'use client';

import { type SectionId } from './nav-config';
import { Menu, X, Mail, MapPin, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedButton, subtleHover } from '@/components/ui/animated-card';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

interface MobileNavProps {
  activeSection: SectionId;
  onSectionChange: (section: SectionId) => void;
}

const mainNavItems: { id: SectionId; emoji: string; label: string }[] = [
  { id: 'home', emoji: '🏠', label: 'Home' },
  { id: 'agenda', emoji: '📅', label: 'Agenda' },
  { id: 'technieken', emoji: '🥋', label: 'Technieken' },
  { id: 'exameneisen', emoji: '🎯', label: 'Examens' },
  { id: 'info', emoji: 'ℹ️', label: 'Info' },
];

const moreNavItems: { id: SectionId; emoji: string; label: string }[] = [
  { id: 'cursusjapans', emoji: '🇯🇵', label: 'Cursus Japans' },
  { id: 'formulieren', emoji: '📋', label: 'Formulieren' },
  { id: 'login', emoji: '👤', label: 'Inloggen' },
];

const quickActions = [
  { id: 'contact' as SectionId, icon: Mail, label: 'Contact', color: '#c00000' },
  { id: 'locatie' as SectionId, icon: MapPin, label: 'Locaties', color: '#2980b9' },
  { id: 'leden' as SectionId, icon: UserPlus, label: 'Proefles / Lid', color: '#27ae60' },
];

export function MobileNav({ activeSection, onSectionChange }: MobileNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSectionChange = (id: SectionId) => {
    onSectionChange(id);
    setMenuOpen(false);
  };

  return (
    <>
      {/* Bottom Tab Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-judo-red-border shadow-lg">
        <div className="flex justify-around items-center h-16">
          {mainNavItems.map((item) => (
            <AnimatedButton key={item.id} onClick={() => handleSectionChange(item.id)} variants={subtleHover}>
              <div className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 min-w-0 flex-1 transition-colors ${
                activeSection === item.id
                  ? 'text-judo-red'
                  : 'text-muted-foreground hover:text-judo-red'
              }`}>
                <span className="text-lg">{item.emoji}</span>
                <span className="text-[10px] font-medium truncate">{item.label}</span>
              </div>
            </AnimatedButton>
          ))}
          {/* More button — now uses shadcn Drawer */}
          <Drawer direction="right">
            <DrawerTrigger asChild>
              <button className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 min-w-0 flex-1 transition-colors active:scale-[0.98] ${
                menuOpen ? 'text-judo-red' : 'text-muted-foreground hover:text-judo-red'
              }`}>
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                <span className="text-[10px] font-medium">Meer</span>
              </button>
            </DrawerTrigger>
            <DrawerContent className="max-w-[85vw]">
              <DrawerHeader>
                <DrawerTitle className="text-center font-bold" style={{ color: '#8c0000' }}>
                  Meer Opties
                </DrawerTitle>
              </DrawerHeader>
              <div className="px-4 pb-6 space-y-2">
                {moreNavItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSectionChange(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.98] ${
                      activeSection === item.id
                        ? 'bg-judo-red text-white'
                        : 'text-foreground hover:bg-judo-red-bg'
                    }`}
                  >
                    <span>{item.emoji}</span>
                    <span>{item.label}</span>
                  </button>
                ))}

                {/* Quick Actions Divider */}
                <div className="border-t border-gray-100 my-3" />
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4">Sneltoetsen</p>

                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => onSectionChange(action.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-judo-red-bg transition-all active:scale-[0.98]"
                  >
                    <action.icon className="w-5 h-5" style={{ color: action.color }} />
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      {/* More Menu Overlay (legacy — kept for fallback) */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="lg:hidden fixed inset-0 bg-black/30 z-40"
              onClick={() => setMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            />
            <motion.div
              className="lg:hidden fixed bottom-16 left-0 right-0 z-50 bg-white border-t border-judo-red-border shadow-lg p-4"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div className="space-y-2">
                {moreNavItems.map((item) => (
                  <AnimatedButton key={item.id} onClick={() => handleSectionChange(item.id)} variants={subtleHover}>
                    <div className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      activeSection === item.id
                        ? 'bg-judo-red text-white'
                        : 'text-foreground hover:bg-judo-red-bg'
                    }`}>
                      <span>{item.emoji}</span>
                      <span>{item.label}</span>
                    </div>
                  </AnimatedButton>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
