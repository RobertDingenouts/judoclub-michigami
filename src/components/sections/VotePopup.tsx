'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

const STORAGE_KEY = 'michigami-stem-popup-gezien-2026';
const ACTIE_POPUP_KEY = 'michigami-actie-popup-gezien';
const ACTIE_EINDE = new Date('2026-10-01T23:59:59');
const STEM_BEGIN = new Date('2026-09-07T00:00:00');
const STEM_EINDE = new Date('2026-09-29T23:59:59');

export function VotePopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Alleen tonen tijdens de stemperiode en nog niet eerder gesloten
    const nu = new Date();
    if (nu < STEM_BEGIN || nu > STEM_EINDE) return;
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      // localStorage niet beschikbaar — popup tonen
    }

    let timer: ReturnType<typeof setTimeout> | undefined;

    const openPopup = () => {
      // Korte vertraging zodat de pagina eerst is geladen
      timer = setTimeout(() => setOpen(true), 1200);
    };

    let actieNogOpen = false;
    try {
      // Alleen als de actie-popup (gratis inschrijven) nog niet gesloten
      // is en nog actueel → die krijgt eerst de aandacht
      actieNogOpen = nu < ACTIE_EINDE && !localStorage.getItem(ACTIE_POPUP_KEY);
    } catch {
      actieNogOpen = false;
    }

    if (!actieNogOpen) {
      openPopup();
    } else {
      const onActieGezien = () => {
        window.removeEventListener('actie-popup-gezien', onActieGezien);
        openPopup();
      };
      window.addEventListener('actie-popup-gezien', onActieGezien);
      return () => {
        window.removeEventListener('actie-popup-gezien', onActieGezien);
        if (timer) clearTimeout(timer);
      };
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  const close = () => {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // negeer
    }
  };

  const naarNieuws = () => {
    close();
    // Scrollarea-scroll + sectiewissel in ClientPage
    window.dispatchEvent(new CustomEvent('navigate-section', { detail: 'nieuws' }));
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Achtergrond */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={close}
          />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Sluitknop */}
            <button
              onClick={close}
              aria-label="Sluiten"
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 text-gray-600 hover:bg-white hover:text-[#a90000] transition-colors shadow-sm"
            >
              ✕
            </button>

            {/* Rode kopband */}
            <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] px-6 pt-6 pb-5 text-white">
              <div className="text-3xl mb-2">🗳️</div>
              <h3 className="text-xl font-bold leading-tight">
                Het is weer zover: Rabo ClubSupport!
              </h3>
              <p className="text-sm mt-1 text-white/90">
                Stem van <strong>7 t/m 29 september</strong> op jouw
                favoriete clubs — en natuurlijk op{' '}
                <strong>Michigami</strong>! 💙🧡
              </p>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <ul className="space-y-3 text-sm text-[#2a2a2a]">
                <li className="flex gap-3">
                  <span className="text-lg">📲</span>
                  <span>
                    Stem via de <strong>Rabo App</strong>: Instellingen →
                    Lidmaatschap → Rabo ClubSupport
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-lg">🆓</span>
                  <span>
                    Nog geen lid? Word <strong>gratis lid</strong> in de app
                    en stem op jouw 3 favoriete clubs
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-lg">👶</span>
                  <span>
                    Stemmen kan al <strong>vanaf 12 jaar</strong> (met
                    toestemming van een ouder/verzorger in de app)
                  </span>
                </li>
              </ul>

              {/* CTA */}
              <button
                onClick={naarNieuws}
                className="mt-5 w-full bg-[#a90000] hover:bg-[#8c0000] text-white font-bold py-3 rounded-xl transition-colors shadow-md"
              >
                📰 Lees het nieuwsbericht
              </button>

              {/* Flyer-afbeelding */}
              <div className="mt-4 flex justify-center">
                <Image
                  src="/stem-rabo-clubsupport-2026.jpg"
                  alt="Rabo ClubSupport — stem op Judoclub Michigami"
                  width={1080}
                  height={1350}
                  className="h-28 w-auto rounded-lg shadow-sm"
                />
              </div>

              <p className="text-xs text-gray-500 mt-3 text-center">
                Alvast ontzettend bedankt voor je steun! Samen maken we
                Michigami nog sterker. 💪🥋
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
