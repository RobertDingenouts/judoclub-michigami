'use client';

import { useState } from 'react';
import { X, Calendar, Phone } from 'lucide-react';
import { TrialLessonForm } from '@/components/sections/TrialLessonForm';
import { contactInfo } from '@/data/contact';

export function StickyCTA({ onNavigate }: { onNavigate?: (section: string) => void }) {
  const [formOpen, setFormOpen] = useState(false);

  const whatsappLink = `https://wa.me/31${contactInfo.whatsapp.slice(1)}?text=${encodeURIComponent('Hoi! Ik wil graag meer informatie over een proefles judo.')}`;

  return (
    <>
      {/* Desktop: Fixed top-right button */}
      <button
        onClick={() => setFormOpen(true)}
        className="hidden md:flex fixed top-4 right-4 z-50 items-center gap-2 bg-gradient-to-r from-[#a90000] to-[#c00000] text-white px-5 py-3 rounded-full font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all"
      >
        <Calendar className="w-4 h-4" />
        Proefles Aanvragen
      </button>

      {/* Mobile: Fixed bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-[#e8eaed] p-2 sm:p-3 safe-area-bottom">
        <div className="flex items-center gap-2">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm"
          >
            <Phone className="w-3.5 h-3.5" />
            WhatsApp
          </a>
          <button
            onClick={() => setFormOpen(true)}
            className="flex items-center justify-center gap-1.5 flex-2 bg-gradient-to-r from-[#a90000] to-[#c00000] text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm"
            style={{ flex: 2 }}
          >
            <Calendar className="w-3.5 h-3.5" />
            Proefles Aanvragen
          </button>
        </div>
      </div>

      {/* Modal Overlay */}
      {formOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setFormOpen(false)}
          />
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
            <TrialLessonForm onClose={() => setFormOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
