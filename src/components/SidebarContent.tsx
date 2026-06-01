'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, ChevronRight, Facebook, Mail, Youtube } from 'lucide-react';
import { navGroups, groupHubMap, type Section } from '@/components/nav-config';
import { AnimatedCard, AnimatedButton, subtleHover } from '@/components/ui/animated-card';

export function SidebarContent({ activeSection, onSelect }: { activeSection: Section; onSelect: (s: Section) => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const toggleGroup = (label: string) => {
    setOpenGroup(prev => prev === label ? null : label);
  };

  const filteredGroups = searchQuery.trim()
    ? navGroups
        .map(g => ({
          ...g,
          items: g.items.filter(item =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter(g => g.items.length > 0)
    : navGroups;

  return (
    <div className="flex flex-col h-full">
      {/* Logo / Brand */}
      <div className="p-4 border-b border-[#e8eaed] flex flex-col items-center">
        <AnimatedCard variants={subtleHover}>
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#fdf6f6] to-white border-2 border-[#c00000]/10 flex items-center justify-center mb-2 shadow-sm">
            <Image src="/logo.png" alt="Judoclub Michigami" width={72} height={72} className="object-contain" />
          </div>
        </AnimatedCard>
        <p className="text-[10px] text-gray-400">Opgericht in 1993</p>
      </div>

      {/* Search Bar */}
      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Zoek..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-[#f8f9fa] border border-[#e8eaed] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#c00000]/30 focus:border-[#a90000] placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-1">
        <div className="space-y-1">
          {filteredGroups.map((group) => (
            <div key={group.label}>
              {/* Group Header */}
              {!searchQuery.trim() && (
                <div className="flex items-center">
                  <AnimatedButton onClick={() => onSelect(groupHubMap[group.label] as Section)} variants={subtleHover}>
                    <div className="flex-1 flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors">
                      <span className="text-sm">{group.emoji}</span>
                      <span>{group.label}</span>
                    </div>
                  </AnimatedButton>
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className="px-1 py-1.5 hover:text-gray-600 transition-colors"
                  >
                    <ChevronRight
                      className={`w-3 h-3 transition-transform ${
                        openGroup === group.label ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                </div>
              )}

              {/* Group Items */}
              <AnimatePresence initial={false}>
              {(openGroup === group.label || searchQuery.trim()) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="space-y-0.5">
                    {group.items.map((item) => (
                      <AnimatedButton key={item.key} onClick={() => onSelect(item.key)} variants={subtleHover}>
                        <motion.div
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.2 }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                            activeSection === item.key
                              ? 'bg-[#fdf6f6] text-[#c00000] font-medium'
                              : 'text-gray-600 hover:bg-[#f8f9fa] hover:text-gray-800'
                          }`}>
                        {item.icon}
                        <span className="truncate">{item.label}</span>
                        {activeSection === item.key && (
                          <div className="w-1 h-1 rounded-full bg-[#a90000] ml-auto flex-shrink-0" />
                        )}
                      </motion.div>
                    </AnimatedButton>
                  ))}
                  </div>
                </motion.div>
              )}
              </AnimatePresence>

              {/* Separator */}
              {!searchQuery.trim() && (
                <div className="px-2 py-1">
                  <div className="h-px bg-[#e8eaed]" />
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Login Button */}
      <div className="px-3 py-2">
        <a
          href="/signin"
          className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white transition-colors shadow-sm hover:opacity-90"
          style={{ backgroundColor: '#a90000' }}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12a9 9 0 0118 0" />
          </svg>
          Inloggen / Registreren
        </a>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#e8eaed]">
        <div className="flex items-center gap-2 justify-center">
          <AnimatedButton as="a" href="https://www.facebook.com/judoclubmichigami" target="_blank" rel="noopener noreferrer" variants={subtleHover}>
            <div className="p-1.5 rounded-md hover:bg-[#f8f9fa] text-gray-400 hover:text-[#c00000] transition-colors">
              <Facebook className="w-4 h-4" />
            </div>
          </AnimatedButton>
          <AnimatedButton as="a" href="mailto:judoclub_michigami@hotmail.com" variants={subtleHover}>
            <div className="p-1.5 rounded-md hover:bg-[#f8f9fa] text-gray-400 hover:text-[#c00000] transition-colors">
              <Mail className="w-4 h-4" />
            </div>
          </AnimatedButton>
          <AnimatedButton as="a" href="https://www.youtube.com/channel/UC8tXSKppIMF6awS2cj7w50A" target="_blank" rel="noopener noreferrer" variants={subtleHover}>
            <div className="p-1.5 rounded-md hover:bg-[#f8f9fa] text-gray-400 hover:text-[#c00000] transition-colors">
              <Youtube className="w-4 h-4" />
            </div>
          </AnimatedButton>
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-1.5">Opgericht in 1993</p>
      </div>
    </div>
  );
}
