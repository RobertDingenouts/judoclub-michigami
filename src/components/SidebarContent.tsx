'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, ChevronRight, Facebook, Mail, Youtube } from 'lucide-react';
import { navGroups, groupHubMap, type Section } from '@/components/nav-config';
import { AnimatedCard, AnimatedButton, subtleHover } from '@/components/ui/animated-card';
import { UserDropdown } from '@/components/UserDropdown';
import { LangToggle } from '@/components/LangToggle';
import { useT } from '@/i18n/LangContext';

export function SidebarContent({ activeSection, onSelect }: { activeSection: Section; onSelect: (s: Section) => void }) {
  const { t } = useT();
  const [searchQuery, setSearchQuery] = useState('');
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const toggleGroup = (label: string) => {
    setOpenGroup(prev => prev === label ? null : label);
  };

  // Zoekfunctie: label (NL + EN) + inhoudelijke synoniemen per sectie,
  // zodat "prijzen", "vakantie" of "video's" ook de juiste pagina vinden.
  const q = searchQuery.trim().toLowerCase();
  const SECTION_KEYWORDS: Partial<Record<Section, string[]>> = {
    agenda: ['vakantie', 'vakanties', 'holiday', 'holidays', 'evenement', 'evenementen', 'event', 'events', 'toernooi', 'toernooien', 'tournament', 'lesvrij', 'no lesson', 'geen les'],
    info: ['over ons', 'about us', 'verhaal', 'story', 'geschiedenis', 'history', 'club', 'michigami', 'les', 'trainer', 'instructeur', 'lesser'],
    timeline: ['geschiedenis', 'history', 'jaar', 'years', 'tijdlijn', 'timeline'],
    leden: ['prijs', 'prijzen', 'price', 'prices', 'kosten', 'costs', 'lidmaatschap', 'membership', 'aanmelden', 'register', 'subscription', 'abonnement', 'contributie', 'proefles', 'proeflesser', 'trial', 'free lesson', 'gratis', 'vrijblijvend', 'kennismaking'],
    lestijden: ['lestijd', 'lestijden', 'tijd', 'tijden', 'time', 'times', 'rooster', 'schedule', 'training', 'trainen', 'woensdag', 'vrijdag', 'wednesday', 'friday'],
    locatie: ['adres', 'address', 'locatie', 'location', 'hal', 'zaal', 'knotwilg', 'vossenkuil', 'steenbergen', 'vossemeer', 'parkeren', 'parking', 'route'],
    contact: ['mail', 'email', 'bellen', 'telefoon', 'phone', 'vraag', 'question', 'contact', 'whatsapp'],
    'wat-is-judo': ['judo', 'uitleg', 'wat is', 'beginner', 'beginners', 'hoe werkt', 'band', 'banden', 'slip', 'slips', 'graad', 'graden', 'kyu', 'dan', 'black belt', 'zachte weg', 'les', 'lesopbouw', 'judoles', 'proefles', 'kleding', 'judogi', 'pak', 'wat is judo', 'what is judo'],
    technieken: ['worp', 'worpen', 'techniek', 'technieken', 'technique', 'techniques', 'uchi mata', 'go kyaku', 'harai', 'kata', 'val', 'breakfall'],
    exameneisen: ['examen', 'examens', 'exam', 'exams', 'eisen', 'requirements', 'band', 'slip', 'kyu', 'dan', 'graden', 'slagingskans'],
    cursusjapans: ['japans', 'japanes', 'japan', 'woorden', 'words', 'termen', 'terms', 'vocabulaire', 'cursus', 'course', 'quiz', 'flashcards'],
    nieuws: ['nieuws', 'news', 'bericht', 'berichten', 'post', 'posts', 'artikelen', 'articles'],
    'foto-galerij': ['foto', 'foto\'s', 'photo', 'photos', 'galerij', 'gallery', 'plaatjes', 'images'],
    'video-galerij': ['video', 'video\'s', 'filmpje', 'filmpjes', 'youtube', 'movies'],
    muziek: ['muziek', 'music', 'lied', 'liederen', 'song', 'songs', 'audio'],
    juridisch: ['privacy', 'algemene voorwaarden', 'terms', 'gedragscode', 'conduct', 'verklaring', 'legal'],
    'band-knopen': ['band', 'knopen', 'strik', 'dassen', 'tie', 'belt', 'obi', 'dragen'],
    home: ['home', 'start', 'welkom', 'welcome', 'begin'],
  };

  const filteredGroups = q
    ? navGroups
        .map(g => ({
          ...g,
          items: g.items.filter(item =>
            item.label.toLowerCase().includes(q) ||
            t(item.label).toLowerCase().includes(q) ||
            item.key.toLowerCase().includes(q) ||
            (SECTION_KEYWORDS[item.key] || []).some(k =>
              k.startsWith(q) || q.startsWith(k) || (k.length >= 5 && q.includes(k))
            )
          ),
        }))
        .filter(g => g.items.length > 0)
    : navGroups;

  return (
    <div className="flex flex-col h-full bg-washi">
      {/* Logo / Brand — washi + hanko */}
      <div className="p-4 border-b border-[#2a2a2a]/10 flex flex-col items-center relative overflow-hidden">
        {/* Faint seigaiha waves behind the logo */}
        <div className="relative">
          <AnimatedCard variants={subtleHover}>
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-white to-[#fbf9f4] border border-[#2a2a2a]/10 flex items-center justify-center mb-2 shadow-sm ring-2 ring-white/60">
              <Image src="/logo.png" alt="Judoclub Michigami" width={72} height={72} className="object-contain" />
            </div>
          </AnimatedCard>
          {/* Hanko seal — 道 (dō — de weg, Michigami) */}
          <span className="absolute -right-1 -bottom-1 hanko w-9 h-9 text-[13px] rotate-[-8deg]">
            道
          </span>
        </div>
        <p className="relative text-[10px] text-[#8a7f70] tracking-[0.2em] uppercase">{t('Opgericht in 1993')}</p>
        <p className="relative font-mincho text-[11px] text-[#a90000]/70 tracking-[0.35em] mt-0.5">道上</p>
      </div>

      {/* Search Bar */}
      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a7f70]" />
          <input
            type="text"
            placeholder={t('Zoek...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white/70 border border-[#2a2a2a]/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#a90000]/30 focus:border-[#a90000] placeholder:text-[#8a7f70] focus-kin"
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
                    <div className="flex-1 flex items-center gap-2 px-2 py-1.5 text-[11px] font-bold text-[#8a7f70] uppercase tracking-wider hover:text-[#a90000] transition-colors">
                      <span className="text-base leading-none">{group.emoji}</span>
                      <span>{t(group.label)}</span>
                    </div>
                  </AnimatedButton>
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className="px-1 py-1.5 hover:text-[#3d362d] transition-colors"
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
                              ? 'bg-gradient-to-r from-[#fdf0f0] to-white text-[#a90000] font-semibold shadow-sm ring-1 ring-[#a90000]/15'
                              : 'text-[#3d362d] hover:bg-[#a90000]/[0.04] hover:text-[#1c1915]'
                          }`}>
                        {item.icon}
                        <span className="truncate">{t(item.label)}</span>
                        {activeSection === item.key && (
                          <div className="w-1.5 h-4 rounded-lg bg-gradient-to-b from-[#c00000] to-[#8c0000] ml-auto flex-shrink-0" />
                        )}
                      </motion.div>
                    </AnimatedButton>
                  ))}
                  </div>
                </motion.div>
              )}
              </AnimatePresence>

              {/* Separator — gold hairline */}
              {!searchQuery.trim() && (
                <div className="px-2 py-1.5">
                  <div className="h-px bg-gradient-to-r from-transparent via-[#2a2a2a]/15 to-transparent" />
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Login Button or User Dropdown */}
      <div className="px-3 py-2">
        <UserDropdown onSectionChange={(s) => onSelect(s as any)} />
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#2a2a2a]/10 relative overflow-hidden">
        <div className="relative flex items-center justify-center mb-2">
          <LangToggle />
        </div>
        <div className="relative flex items-center gap-2 justify-center">
          <AnimatedButton as="a" href="https://www.facebook.com/judoclubmichigami" target="_blank" rel="noopener noreferrer" variants={subtleHover}>
            <div className="p-1.5 rounded-lg hover:bg-[#a90000]/[0.06] text-[#8a7f70] hover:text-[#a90000] transition-colors">
              <Facebook className="w-4 h-4" />
            </div>
          </AnimatedButton>
          <AnimatedButton as="a" href="mailto:judoclub_michigami@hotmail.com" variants={subtleHover}>
            <div className="p-1.5 rounded-lg hover:bg-[#a90000]/[0.06] text-[#8a7f70] hover:text-[#a90000] transition-colors">
              <Mail className="w-4 h-4" />
            </div>
          </AnimatedButton>
          <AnimatedButton as="a" href="https://www.youtube.com/channel/UC8tXSKppIMF6awS2cj7w50A" target="_blank" rel="noopener noreferrer" variants={subtleHover}>
            <div className="p-1.5 rounded-lg hover:bg-[#a90000]/[0.06] text-[#8a7f70] hover:text-[#a90000] transition-colors">
              <Youtube className="w-4 h-4" />
            </div>
          </AnimatedButton>
        </div>
        <p className="relative text-[10px] text-[#8a7f70] text-center mt-1.5 tracking-wide">
          柔道 · {t('Opgericht in 1993')}
        </p>
      </div>
    </div>
  );
}
