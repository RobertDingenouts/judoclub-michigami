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
      {/* Desktop: Fixed top-right button — green, prominent "Gratis Proefles" */}
      <button onClick={() => setFormOpen(true)} className="hidden md:flex fixed top-4 right-4 z-50 items-center gap-2 bg-gradient-to-r from-[#27ae60] to-[#2ecc71] text-white px-6 py-3.5 rounded-full font-bold text-base shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer">
        <Calendar className="w-5 h-5" />
        Gratis Proefles
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
              <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
                <TrialLessonForm onClose={() => setFormOpen(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
