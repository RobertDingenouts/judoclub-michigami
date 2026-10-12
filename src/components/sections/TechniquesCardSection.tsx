'use client';

import { techniquesCards } from '@/data/techniques-card';
import Image from 'next/image';
import { AnimatedCard, AnimatedButton } from '@/components/ui/animated-card';
import { useT } from '@/i18n/LangContext';
import { termFor } from '@/i18n/content';

export function TechniquesCardSection() {
  const { t, lang } = useT();
  return (
    <div className="space-y-6">
      {/* Header */}
      <AnimatedCard>
        <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] rounded-lg p-4 sm:p-5 md:p-6 lg:p-8 text-white shadow-lg relative overflow-hidden">
          <svg
            viewBox="0 0 100 80"
            className="absolute top-0 right-0 w-20 sm:w-24 md:w-32 h-20 sm:h-24 md:h-32 text-white opacity-[0.06]"
            fill="currentColor"
          >
            <rect x="5" y="8" width="90" height="6" rx="2" />
            <rect x="12" y="18" width="76" height="4" rx="1" />
            <rect x="20" y="18" width="6" height="58" rx="1" />
            <rect x="74" y="18" width="6" height="58" rx="1" />
          </svg>
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold truncate">{t('Techniekenkaart')}</h1>
          <p className="text-white/80 mt-1 text-xs sm:text-sm">{t("Downloadbare PDF's met judotechnieken en exameneisen")}</p>
          <div className="w-10 sm:w-12 md:w-16 h-0.5 sm:h-1 bg-white/30 rounded-lg mt-2 sm:mt-3" />
        </div>
      </AnimatedCard>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {techniquesCards.map((card, idx) => (
          <AnimatedCard key={idx}>
            <div className="bg-white rounded-lg shadow-sm border border-[#e9e0cf] overflow-hidden hover:shadow-md transition-shadow">
              {/* Image */}
              {card.imageUrl && (
                <div className="bg-[#fdf6f6] p-4 sm:p-6 flex items-center justify-center">
                  <Image
                    src={card.imageUrl}
                    alt={card.imageAlt || card.title}
                    width={250}
                    height={250}
                    className="max-w-[200px] sm:max-w-[250px] w-full h-auto"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-4 sm:p-6">
                <h3 className="font-bold text-[#8c0000] text-base sm:text-lg mb-2">{termFor('techniques-card', `card-${idx + 1}`, 'title', card.title, lang)}</h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">{termFor('techniques-card', `card-${idx + 1}`, 'description', card.description, lang)}</p>

                {/* Download Button */}
                <AnimatedButton as="a" href={card.pdfUrl} download>
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#a90000] to-[#c00000] text-white text-sm font-semibold rounded-lg hover:from-[#8c0000] hover:to-[#a90000] transition-colors shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {t('Bestand downloaden')}
                  </div>
                </AnimatedButton>
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>
    </div>
  );
}
