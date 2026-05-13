'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExamDashboard } from '@/components/sections/ExamDashboard';
import { FormsSection } from '@/components/sections/FormsSection';
import { LoginSection } from '@/components/sections/LoginSection';
import { JapaneseCourseSection } from '@/components/sections/JapaneseCourseSection';
import { MembershipSection } from '@/components/sections/MembershipSection';
import { ScheduleSection } from '@/components/sections/ScheduleSection';
import { BeltKnotsSection } from '@/components/sections/BeltKnotsSection';
import { PhotoGallery } from '@/components/gallery/PhotoGallery';
import { VideoGallery } from '@/components/gallery/VideoGallery';
import { LocationSection } from '@/components/sections/LocationSection';
import { ContactSection } from '@/components/sections/ContactSection';
import { NewsSection } from '@/components/sections/NewsSection';
import { TechniquesCardSection } from '@/components/sections/TechniquesCardSection';
import { LegalSection } from '@/components/sections/LegalSection';
import { SidebarContent } from '@/components/SidebarContent';
import { MobileActionBar } from '@/components/MobileActionBar';
import { HomeSection } from '@/components/sections/HomeSection';
import { InfoSection } from '@/components/sections/InfoSection';
import { AgendaSection } from '@/components/sections/AgendaSection';
import { TechniquesSection } from '@/components/sections/TechniquesSection';
import { CategoryHubSection } from '@/components/sections/CategoryHubSection';
import { TimelineSection } from '@/components/sections/TimelineSection';
import { PullToRefreshIndicator } from '@/components/PullToRefreshIndicator';
import { StickyCTA } from '@/components/StickyCTA';
import { TrialLessonForm } from '@/components/sections/TrialLessonForm';
import { navGroups, mobileNavItems, groupHubMap, allNavItems, type Section } from '@/components/nav-config';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

// Sections that support pull-to-refresh
const PULL_REFRESH_SECTIONS = new Set(['agenda', 'nieuws', 'home']);

// ============ MAIN APP ============
// Dynamic page titles + descriptions per section for SEO
const sectionMeta: Record<Section, { title: string; description: string }> = {
  'home': {
    title: 'Judoclub Michigami Steenbergen - Judo voor Jong en Oud',
    description: 'Judo voor jong en oud, voor beginners en gevorderden - recreatief of prestatiegericht. Judoclub Michigami Steenbergen, opgericht in 1993.',
  },
  'agenda': {
    title: 'Agenda & Trainingstijden | Judoclub Michigami',
    description: 'Trainingstijden en agenda van Judoclub Michigami Steenbergen. Judolessen voor alle niveaus.',
  },
  'technieken': {
    title: 'Judo Technieken | Judoclub Michigami',
    description: 'Complete overzicht van judo technieken: werptchnieken, grapplichting, klemmen en wurgen met video\'s.',
  },
  'exameneisen': {
    title: 'Judo Exameneisen per Band | Judoclub Michigami',
    description: 'Exameneisen voor alle judo graden van witte band tot zwarte band. Technieken per kleurband met video\'s.',
  },
  'cursusjapans': {
    title: 'Cursus Japans voor Judo | Judoclub Michigami',
    description: 'Leer de Japanse termen die in judo worden gebruikt. Cursus Japans voor judoka\'s.',
  },
  'formulieren': {
    title: 'Formulieren | Judoclub Michigami',
    description: 'Download formulieren voor lidmaatschap, inschrijving en andere administratie bij Judoclub Michigami.',
  },
  'info': {
    title: 'Over Ons - Judoclub Michigami Steenbergen',
    description: 'Alles over Judoclub Michigami Steenbergen. Geschiedenis, missie en informatie over onze judoclub.',
  },
  'login': {
    title: 'Inloggen | Judoclub Michigami',
    description: 'Log in op het ledenportaal van Judoclub Michigami Steenbergen.',
  },
  'leden': {
    title: 'Lid Worden bij Judoclub Michigami',
    description: 'Word lid van Judoclub Michigami Steenbergen. Informatie over lidmaatschap, contributie en inschrijven.',
  },
  'lestijden': {
    title: 'Trainingstijden & Lestijden | Judoclub Michigami',
    description: 'De trainingstijden van Judoclub Michigami Steenbergen. Judolessen voor kinderen en volwassenen.',
  },
  'band-knopen': {
    title: 'Band Knopen - Judo Rijgvolgorde | Judoclub Michigami',
    description: 'Hoe knoop je een judoband? Stap-voor-stap instructie en de rijgvolgorde van judo graden.',
  },
  'foto-galerij': {
    title: 'Foto\'s - Fotogalerij | Judoclub Michigami',
    description: 'Fotogalerij van trainingen, toernooien en evenementen van Judoclub Michigami Steenbergen.',
  },
  'video-galerij': {
    title: 'Video\'s - Videogalerij | Judoclub Michigami',
    description: 'Videogalerij met judo trainingen, technieken en toernooi highlights van Judoclub Michigami.',
  },
  'locatie': {
    title: 'Locatie & Bereikbaarheid | Judoclub Michigami',
    description: 'Zoek ons op! Locatie en bereikbaarheid van Judoclub Michigami Steenbergen.',
  },
  'contact': {
    title: 'Contact - Judoclub Michigami Steenbergen',
    description: 'Neem contact op met Judoclub Michigami Steenbergen. E-mail, telefoon en social media.',
  },
  'nieuws': {
    title: 'Nieuwsberichten | Judoclub Michigami',
    description: 'Het laatste nieuws van Judoclub Michigami Steenbergen. Toernooi resultaten, evenementen en clubnieuws.',
  },
  'techniekenkaart': {
    title: 'Techniekenkaart Judo | Judoclub Michigami',
    description: 'Interactieve techniekenkaart van judo. Verken alle judo technieken visueel.',
  },
  'juridisch': {
    title: 'Juridisch & Privacy | Judoclub Michigami',
    description: 'Privacyverklaring, algemene voorwaarden en juridische informatie van Judoclub Michigami.',
  },
  'timeline': {
    title: 'Club Geschiedenis - Tijdlijn | Judoclub Michigami',
    description: 'De geschiedenis van Judoclub Michigami en judo in Steenbergen. Van oprichting tot vandaag.',
  },
  'club-hub': {
    title: 'Club Informatie | Judoclub Michigami',
    description: 'Algemene clubinformatie van Judoclub Michigami Steenbergen.',
  },
  'judoschool-hub': {
    title: 'Judo School | Judoclub Michigami',
    description: 'Judo school informatie: lessen, technieken en exameneisen bij Judoclub Michigami.',
  },
  'media-hub': {
    title: 'Media - Foto\'s & Video\'s | Judoclub Michigami',
    description: 'Foto\'s en video\'s van trainingen, toernooien en evenementen van Judoclub Michigami.',
  },
};

// Helper: update meta tags dynamically for SPA navigation
function updateMetaTags(section: Section) {
  const meta = sectionMeta[section];
  if (!meta) return;

  document.title = meta.title;

  // Update description meta tag
  let descTag = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
  if (descTag) {
    descTag.content = meta.description;
  } else {
    descTag = document.createElement('meta');
    descTag.name = 'description';
    descTag.content = meta.description;
    document.head.appendChild(descTag);
  }

  // Update OG tags
  const updateOrSetMeta = (property: string, content: string) => {
    let tag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
    if (tag) {
      tag.content = content;
    } else {
      tag = document.createElement('meta');
      tag.setAttribute('property', property);
      tag.content = content;
      document.head.appendChild(tag);
    }
  };

  updateOrSetMeta('og:title', meta.title);
  updateOrSetMeta('og:description', meta.description);
  updateOrSetMeta('og:url', `https://judoclubmichigami.nl/#${section}`);
}

export default function MichigamiApp() {
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [proeflesOpen, setProeflesOpen] = useState(false);

  // Pull-to-refresh state
  const [ptrPulling, setPtrPulling] = useState(false);
  const [ptrRefreshing, setPtrRefreshing] = useState(false);
  const [ptrProgress, setPtrProgress] = useState(0);
  const touchStartY = useRef(0);

  // Listen for custom event from MobileActionBar to open proefles drawer
  useEffect(() => {
    const handler = () => setProeflesOpen(true);
    window.addEventListener('open-proefles', handler);
    return () => window.removeEventListener('open-proefles', handler);
  }, []);

  // Update document title + meta tags when section changes (SPA SEO)
  useEffect(() => {
    updateMetaTags(activeSection);
  }, [activeSection]);

  // Scroll-to-top on section change — ref-based approach for reliability
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Use requestAnimationFrame to wait for state update + AnimatePresence mount,
    // then retry a few frames if the viewport isn't ready yet.
    let attempts = 0;
    const maxAttempts = 6; // ~100ms at 60fps — enough for 300ms animation to start rendering
    let rafId: number;

    const tryScroll = () => {
      if (attempts >= maxAttempts) return;
      attempts++;

      const viewport = scrollAreaRef.current?.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]');
      if (viewport) {
        viewport.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Fallback: try again next frame or use window scroll
        if (attempts < maxAttempts) {
          rafId = requestAnimationFrame(tryScroll);
        } else {
          window.scrollTo(0, 0);
        }
      }
    };

    rafId = requestAnimationFrame(tryScroll);
    return () => cancelAnimationFrame(rafId);
  }, [activeSection]);

  // After initial scroll-to-top, agenda section scrolls to first future date via its own useEffect (300ms delay) — no extra handling needed here.

  // Pull-to-refresh handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!PULL_REFRESH_SECTIONS.has(activeSection)) return;
    touchStartY.current = e.touches[0].clientY;
  }, [activeSection]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!PULL_REFRESH_SECTIONS.has(activeSection) || ptrRefreshing) return;

    const diff = e.touches[0].clientY - touchStartY.current;
    if (diff > 0 && window.scrollY === 0) {
      setPtrPulling(true);
      setPtrProgress(Math.min(diff / 120, 1)); // threshold at 120px
      e.preventDefault();
    }
  }, [activeSection, ptrRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!ptrPulling || ptrProgress < 1) {
      setPtrPulling(false);
      setPtrProgress(0);
      return;
    }

    setPtrRefreshing(true);
    // Simulate refresh (scroll to top animation + brief delay)
    await new Promise((r) => setTimeout(r, 800));
    setPtrRefreshing(false);
    setPtrPulling(false);
    setPtrProgress(0);
  }, [ptrPulling, ptrProgress]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8f9fa] w-full overflow-x-hidden">
      {/* Pull-to-refresh indicator */}
      <PullToRefreshIndicator isPulling={ptrPulling} isRefreshing={ptrRefreshing} progress={ptrProgress} />

      {/* Desktop Sidebar — Glassmorphism */}
      <aside className="hidden md:flex flex-col w-64 backdrop-blur-xl bg-white/80 border border-white/20 min-h-screen fixed left-0 top-0 z-40 shadow-lg shadow-black/5">
        <SidebarContent activeSection={activeSection} onSelect={(s) => setActiveSection(s)} />
      </aside>

      {/* Sidebar Content — Mobile: hamburger button + overlay */}
      <div className="md:hidden fixed top-3 left-3 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2.5 rounded-xl bg-white/70 backdrop-blur-md shadow-lg border border-white/30 hover:shadow-xl transition-shadow"
        >
          {sidebarOpen ? (
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </div>

      {/* Mobile Sidebar Overlay — Glassmorphism */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          >
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-72 backdrop-blur-xl bg-white/80 border-r border-white/20 min-h-screen shadow-2xl max-w-[calc(100vw-1rem)]"
              onClick={(e) => e.stopPropagation()}
            >
              <SidebarContent activeSection={activeSection} onSelect={(s) => { setActiveSection(s); setSidebarOpen(false); }} />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 w-full min-w-0">
        <div ref={scrollAreaRef} className="h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-3.5rem)] md:h-screen w-full">
        <ScrollArea className="w-full h-full">
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="p-2 sm:p-4 md:p-8 max-w-[100vw] mx-auto w-full pb-[8rem] sm:pb-0"
            >
            {activeSection === 'home' && <HomeSection onNavigate={setActiveSection} />}
            {activeSection === 'agenda' && <AgendaSection />}
            {activeSection === 'technieken' && <TechniquesSection />}
            {activeSection === 'exameneisen' && <ExamDashboard />}
            {activeSection === 'cursusjapans' && <JapaneseCourseSection />}
            {activeSection === 'formulieren' && <FormsSection />}
            {activeSection === 'info' && <InfoSection onNavigate={setActiveSection} />}
            {activeSection === 'login' && <LoginSection />}
            {activeSection === 'leden' && <MembershipSection />}
            {activeSection === 'lestijden' && <ScheduleSection />}
            {activeSection === 'band-knopen' && <BeltKnotsSection />}
            {activeSection === 'foto-galerij' && <PhotoGallery />}
            {activeSection === 'video-galerij' && <VideoGallery />}
            {activeSection === 'locatie' && <LocationSection />}
            {activeSection === 'contact' && <ContactSection />}
            {activeSection === 'nieuws' && <NewsSection />}
            {activeSection === 'techniekenkaart' && <TechniquesCardSection />}
            {activeSection === 'juridisch' && <LegalSection />}
            {activeSection === 'timeline' && <TimelineSection />}
            {activeSection === 'club-hub' && <CategoryHubSection group={navGroups[0]} onNavigate={setActiveSection} navGroups={navGroups} groupHubMap={groupHubMap} />}
            {activeSection === 'judoschool-hub' && <CategoryHubSection group={navGroups[1]} onNavigate={setActiveSection} navGroups={navGroups} groupHubMap={groupHubMap} />}
            {activeSection === 'media-hub' && <CategoryHubSection group={navGroups[2]} onNavigate={setActiveSection} navGroups={navGroups} groupHubMap={groupHubMap} />}
            </motion.div>
          </AnimatePresence>
          </div>
        </ScrollArea>
        </div>
      </main>

      {/* Mobile Action Bar (merged single bar) */}
      <MobileActionBar activeSection={activeSection} onSectionChange={setActiveSection} onProeflesClick={() => setProeflesOpen(true)} />

      {/* Sticky CTA + Form Modal (global) */}
      <StickyCTA onNavigate={(s) => setActiveSection(s as Section)} />

      {/* Proefles Drawer — opened from bottom nav */}
      <Drawer open={proeflesOpen} onOpenChange={setProeflesOpen}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader>
            <DrawerTitle className="text-center text-lg font-bold" style={{ color: '#8c0000' }}>
              Proefles Aanvragen
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6">
            <TrialLessonForm onClose={() => setProeflesOpen(false)} />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
