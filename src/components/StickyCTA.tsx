'use client';

import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrialLessonForm } from '@/components/sections/TrialLessonForm';
import { onOpenProeflesForm } from '@/lib/form-events';

export function StickyCTA({ onNavigate }: { onNavigate?: (section: string) => void }) {
  const [formOpen, setFormOpen] = useState(false);

  // Listen for global form open events (from InfoSection, MembershipSection, etc.)
  useEffect(() => {
    return onOpenProeflesForm(() => setFormOpen(true));
  }, []);

  return (
    <>
      {/* Desktop: Fixed top-right button — shu vermilion, gold hairline */}
      <button onClick={() => setFormOpen(true)} className="hidden md:flex fixed top-4 right-4 z-50 items-center gap-2 bg-gradient-to-b from-[#c00000] to-[#8c0000] text-white pl-4 pr-5 py-3 font-bold text-base shadow-lg shadow-[#a90000]/30 hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer rounded-none border border-[#8c0000]">
        <Calendar className="w-5 h-5" />
        Gratis Proefles
        <span aria-hidden className="font-mincho text-[10px] text-white/70 tracking-widest ml-0.5">体験</span>
      </button>

      {/* Mobile bottom bar replaced by MobileActionBar — hidden */}

      {/* Modal Overlay */}
      <AnimatePresence>
        {formOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
              onClick={() => setFormOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.div
              className="fixed inset-0 z-[60] flex items-center justify-center p-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-none shadow-2xl">
                <TrialLessonForm onClose={() => setFormOpen(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
