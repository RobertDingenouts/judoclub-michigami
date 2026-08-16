'use client';

import { type SectionId, sectionLabels } from './nav-config';
import { AnimatePresence, motion } from 'framer-motion';

interface SidebarProps {
  activeSection: SectionId;
  onSectionChange: (section: SectionId) => void;
}

const navItems: { id: SectionId; emoji: string; label: string }[] = [
  { id: 'home', emoji: '🏠', label: 'Home' },
  { id: 'agenda', emoji: '📅', label: 'Agenda' },
  { id: 'technieken', emoji: '🥋', label: 'Technieken' },
  { id: 'exameneisen', emoji: '🎯', label: 'Exameneisen' },
  { id: 'cursusjapans', emoji: '🇯🇵', label: 'Cursus Japans' },
  { id: 'formulieren', emoji: '📋', label: 'Formulieren' },
  { id: 'info', emoji: 'ℹ️', label: 'Info' },
  { id: 'login', emoji: '👤', label: 'Inloggen' },
];

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col w-[280px] min-w-[280px] border-r border-judo-red-border bg-white h-screen sticky top-0">
      {/* Logo / Header */}
      <div className="p-6 border-b border-judo-red-border">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="w-10 h-10 flex items-center justify-center">
            <img src="/logo-hd.png" alt="Michigami" className="w-10 h-10 object-contain" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-judo-red">Michigami</h1>
            <p className="text-xs text-muted-foreground">Judoclub Steenbergen</p>
          </div>
        </div>
        {/* Japanese accent */}
        <div className="mt-2 text-right text-3xl text-judo-red/10 font-serif select-none" aria-hidden="true">
          柔道
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar">
        <AnimatePresence initial={false}>
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.id}>
              <motion.button
                onClick={() => onSectionChange(item.id)}
                layout
                layoutId={`sidebar-${item.id}`}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  activeSection === item.id
                    ? 'bg-judo-red text-white shadow-md shadow-judo-red/20'
                    : 'text-foreground hover:bg-judo-red-bg hover:text-judo-red-text'
                }`}
              >
                <span className="text-base">{item.emoji}</span>
                <span>{item.label}</span>
              </motion.button>
            </li>
          ))}
        </ul>
        </AnimatePresence>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-judo-red-border">
        <div className="text-xs text-muted-foreground text-center">
          <p>Opgericht 1993</p>
          <p className="mt-1">🇯🇵 柔道場</p>
        </div>
      </div>
    </aside>
  );
}
