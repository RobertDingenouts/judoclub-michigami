'use client';

import React, { useState } from 'react';
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
import { MobileNav } from '@/components/MobileNav';
import { HomeSection } from '@/components/sections/HomeSection';
import { InfoSection } from '@/components/sections/InfoSection';
import { AgendaSection } from '@/components/sections/AgendaSection';
import { TechniquesSection } from '@/components/sections/TechniquesSection';
import { CategoryHubSection } from '@/components/sections/CategoryHubSection';
import { navGroups, mobileNavItems, groupHubMap, allNavItems, type Section } from '@/components/nav-config';

// ============ MAIN APP ============
// Dynamic page titles per section for SEO
const sectionTitles: Record<Section, string> = {
  'home': 'Judoclub Michigami Steenbergen - Judo voor Jong en Oud',
  'agenda': 'Agenda & Trainingstijden | Judoclub Michigami',
  'technieken': 'Judo Technieken | Judoclub Michigami',
  'exameneisen': 'Judo Exameneisen per Band | Judoclub Michigami',
  'cursusjapans': 'Cursus Japans voor Judo | Judoclub Michigami',
  'formulieren': 'Formulieren | Judoclub Michigami',
  'info': 'Over Ons - Judoclub Michigami Steenbergen',
  'login': 'Inloggen | Judoclub Michigami',
  'leden': 'Lid Worden bij Judoclub Michigami',
  'lestijden': 'Trainingstijden & Lestijden | Judoclub Michigami',
  'band-knopen': 'Band Knopen - Judo Rijgvolgorde | Judoclub Michigami',
  'foto-galerij': 'Foto\'s - Fotogalerij | Judoclub Michigami',
  'video-galerij': 'Video\'s - Videogalerij | Judoclub Michigami',
  'locatie': 'Locatie & Bereikbaarheid | Judoclub Michigami',
  'contact': 'Contact - Judoclub Michigami Steenbergen',
  'nieuws': 'Nieuwsberichten | Judoclub Michigami',
  'techniekenkaart': 'Techniekenkaart Judo | Judoclub Michigami',
  'juridisch': 'Juridisch & Privacy | Judoclub Michigami',
  'club-hub': 'Club Informatie | Judoclub Michigami',
  'judoschool-hub': 'Judo School | Judoclub Michigami',
  'media-hub': 'Media - Foto\'s & Video\'s | Judoclub Michigami',
};

export default function MichigamiApp() {
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Update document title when section changes (SPA SEO)
  useEffect(() => {
    const title = sectionTitles[activeSection];
    if (title) {
      document.title = title;
    }
  }, [activeSection]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8f9fa] w-full overflow-x-hidden">
      {/* Desktop Sidebar — Glassmorphism */}
      <aside className="hidden md:flex flex-col w-64 backdrop-blur-xl bg-white/80 border-r border-white/30 min-h-screen fixed left-0 top-0 z-40 shadow-lg shadow-black/5">
        <SidebarContent activeSection={activeSection} onSelect={(s) => setActiveSection(s)} />
      </aside>

      {/* Sidebar Content — Mobile: hamburger button + overlay */}
      <div className="md:hidden fixed top-3 left-3 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2.5 rounded-xl bg-white shadow-lg border border-[#e8eaed] hover:shadow-xl transition-shadow"
        >
          {sidebarOpen ? (
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </div>

      {/* Mobile Sidebar Overlay — Glassmorphism */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}>
          <aside className="w-72 backdrop-blur-xl bg-white/90 min-h-screen shadow-2xl max-w-[calc(100vw-1rem)]" onClick={(e) => e.stopPropagation()}>
            <SidebarContent activeSection={activeSection} onSelect={(s) => { setActiveSection(s); setSidebarOpen(false); }} />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 w-full min-w-0">
        <ScrollArea key={activeSection} className="h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-3.5rem)] md:h-screen w-full">
          <div className="p-2 sm:p-4 md:p-8 max-w-[100vw] mx-auto w-full pb-16 sm:pb-0">
            {activeSection === 'home' && <HomeSection onNavigate={setActiveSection} />}
            {activeSection === 'agenda' && <AgendaSection />}
            {activeSection === 'technieken' && <TechniquesSection />}
            {activeSection === 'exameneisen' && <ExamDashboard />}
            {activeSection === 'cursusjapans' && <JapaneseCourseSection />}
            {activeSection === 'formulieren' && <FormsSection />}
            {activeSection === 'info' && <InfoSection />}
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
            {activeSection === 'club-hub' && <CategoryHubSection group={navGroups[0]} onNavigate={setActiveSection} navGroups={navGroups} groupHubMap={groupHubMap} />}
            {activeSection === 'judoschool-hub' && <CategoryHubSection group={navGroups[1]} onNavigate={setActiveSection} navGroups={navGroups} groupHubMap={groupHubMap} />}
            {activeSection === 'media-hub' && <CategoryHubSection group={navGroups[2]} onNavigate={setActiveSection} navGroups={navGroups} groupHubMap={groupHubMap} />}
          </div>
        </ScrollArea>
      </main>

      {/* Mobile Bottom Nav */}
      <MobileNav activeSection={activeSection} onSectionChange={setActiveSection} />
    </div>
  );
}
