'use client';

import { type SectionId } from './nav-config';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedButton, subtleHover } from '@/components/ui/animated-card';

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
          {/* More button */}
          <AnimatedButton onClick={() => setMenuOpen(!menuOpen)} variants={subtleHover}>
            <div className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 min-w-0 flex-1 transition-colors ${
              menuOpen ? 'text-judo-red' : 'text-muted-foreground hover:text-judo-red'
            }`}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              <span className="text-[10px] font-medium">Meer</span>
            </div>
          </AnimatedButton>
        </div>
      </div>

      {/* More Menu Overlay */}
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
