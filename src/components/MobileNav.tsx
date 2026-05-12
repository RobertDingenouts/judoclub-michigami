'use client';

import { type SectionId } from './nav-config';
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
  { id: 'cursusjapans', emoji: '🇯🇵', label: 'C. Japans' },
];

export function MobileNav({ activeSection, onSectionChange }: MobileNavProps) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-judo-red-border shadow-lg safe-area-bottom">
      <div className="flex justify-around items-center h-16">
        {mainNavItems.map((item) => (
          <AnimatedButton key={item.id} onClick={() => onSectionChange(item.id)} variants={subtleHover}>
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
      </div>
    </div>
  );
}
