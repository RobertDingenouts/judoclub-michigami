'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { techniqueCategories, type TechniqueCategory, type Technique } from '@/data/techniques';
import { AnimatedCard, AnimatedButton, subtleHover } from '@/components/ui/animated-card';
import { useT } from '@/i18n/LangContext';
import { techDutchFor } from '@/i18n/content';

// ==========================================================================
// MAIN COMPONENT
// ==========================================================================
export function TechniquesSection() {
  const { t, lang } = useT();
  const [activeCategory, setActiveCategory] = useState(0);
  const [expandedTech, setExpandedTech] = useState<number | null>(null);

  const category = techniqueCategories[activeCategory];

  return (
    <div className="space-y-4">
      <AnimatedCard>
        <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] rounded-lg p-4 sm:p-5 text-white shadow-lg overflow-hidden">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold">{t('Technieken')}</h1>
          <p className="text-white/80 mt-1 text-xs sm:text-sm">{t('Alle judotechnieken met video-uitleg')}</p>
        </div>
      </AnimatedCard>

      {/* Category Tabs */}
      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 flex-wrap" style={{ scrollbarWidth: 'thin', WebkitOverflowScrolling: 'touch' }}>
        {techniqueCategories.map((cat, idx) => (
          <AnimatedButton key={cat.key} onClick={() => { setActiveCategory(idx); setExpandedTech(null); }} variants={subtleHover}>
            <div className={`flex-shrink-0 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-lg text-[11px] sm:text-sm font-medium transition-all whitespace-nowrap ${activeCategory === idx ? 'bg-[#a90000] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-[#fdf6f6] border border-gray-200'}`}>
              <span className="hidden sm:inline">{t(cat.label)}</span>
              <span className="sm:hidden truncate max-w-[60px]">{t(cat.label).split(' ')[0]}</span>
            </div>
          </AnimatedButton>
        ))}
      </div>

      {/* Techniques Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {category.techniques.map((tech) => {
          return (
            <AnimatedCard key={tech.id} variants={subtleHover}>
              <Card className="border-0 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  <button
                    onClick={() => setExpandedTech(expandedTech === tech.id ? null : tech.id)}
                    className="w-full text-left p-3 sm:p-4 hover:bg-[#f8f9fa] transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 text-base leading-tight">{tech.name}</h3>
                        <p className="text-xs text-gray-600 mt-1">{techDutchFor(tech.dutch, lang)}</p>
                      </div>
                      {expandedTech === tech.id ? <EyeOff className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <Eye className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                    </div>
                  </button>

                  {expandedTech === tech.id && (
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2 border-t border-[#e9e0cf] pt-3">
                      {tech.youtubeId && (
                        <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 border border-[#e9e0cf]">
                          <iframe src={`https://www.youtube.com/embed/${tech.youtubeId}`} title={tech.name} className="w-full h-full" allowFullScreen />
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedCard>
          );
        })}
      </div>
    </div>
  );
}
