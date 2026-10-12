'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useT } from '@/i18n/LangContext';

const STORAGE_KEY = 'michigami-actie-popup-gezien';
const ACTIE_EINDE = new Date('2026-12-31T23:59:59');

export function ActionPopup() {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [actieActief, setActieActief] = useState(true);

  useEffect(() => {
    // Alleen tonen als de actie nog loopt en nog niet eerder gesloten
    if (new Date() > ACTIE_EINDE) return;
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      // localStorage niet beschikbaar — popup tonen
    }
    // Korte vertraging zodat de pagina eerst is geladen
    const t = setTimeout(() => setOpen(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // negeer
    }
    // Meld dat de actie-popup gesloten is, zodat andere popups (bijv. de
    // Rabo ClubSupport stem-popup) daarna pas mogen tonen
    window.dispatchEvent(new CustomEvent('actie-popup-gezien'));
  };

  const openProefles = () => {
    close();
    // Bestaande proefles-drawer in ClientPage openen
    window.dispatchEvent(new CustomEvent('open-proefles'));
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
              aria-label={t('Sluiten')}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 text-gray-600 hover:bg-white hover:text-[#a90000] transition-colors shadow-sm"
            >
              ✕
            </button>

            {/* Rode kopband */}
            <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] px-6 pt-6 pb-5 text-white">
              <div className="text-3xl mb-2">🎁</div>
              <h3 className="text-xl font-bold leading-tight">
                {t('Actie: gratis inschrijven!')}
              </h3>
              <p className="text-sm mt-1 text-white/90">
                {t('Schrijf je vóór')} <strong>{t('31 december')}</strong> {t('in en betaal geen inschrijfgeld van €15.')}
              </p>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <ul className="space-y-3 text-sm text-[#2a2a2a]">
                <li className="flex gap-3">
                  <span className="text-lg">1️⃣</span>
                  <span>
                    {t('Meld je aan voor een')}{' '}
                    <strong>{t('gratis proefles')}</strong>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-lg">2️⃣</span>
                  <span>
                    {t('Volg')} <strong>{t('3 gratis proeflessen')}</strong> {t('en ervaar wat judo met je doet')}
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-lg">3️⃣</span>
                  <span>
                    {t('Schrijf je vóór')} <strong>{t('31 december')}</strong> {t('in en')}{' '}
                    <strong>{t('bespaar €15')}</strong> {t('inschrijfkosten!')}
                  </span>
                </li>
              </ul>

              <p className="text-xs text-gray-500 mt-4">
                {t('Voor iedereen vanaf 6 jaar — woensdagavond in Oud-Vossemeer & vrijdagavond in Steenbergen.')}
              </p>

              {/* CTA */}
              <button
                onClick={openProefles}
                className="mt-5 w-full bg-[#a90000] hover:bg-[#8c0000] text-white font-bold py-3 rounded-xl transition-colors shadow-md"
              >
                🥋 {t('Meld je aan voor een gratis proefles')}
              </button>

              {/* In samenwerking met */}
              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-center gap-2">
                <span className="text-[11px] text-gray-400 uppercase tracking-wide">
                  {t('In samenwerking met')}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-center">
                <Image
                  src="/logo-knotwilg.png"
                  alt="Sportcentrum de Knotwilg"
                  width={110}
                  height={53}
                  className="h-10 w-auto"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
