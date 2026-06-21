'use client';

import { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, ImageOff, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { techniqueCategories, type TechniqueCategory, type Technique } from '@/data/techniques';
import { getTechniqueImage } from '@/data/technique-images';
import { AnimatedCard, AnimatedButton, subtleHover } from '@/components/ui/animated-card';

// ==========================================================================
// LIGHTBOX COMPONENT
// ==========================================================================
function ImageLightbox({ src, onClose }: { src?: string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
      ref={ref}
    >
      <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 z-10"
        >
          <X className="w-4 h-4" />
        </button>
        {src ? (
          <img src={src} alt="" className="w-full h-auto rounded-lg shadow-2xl" />
        ) : (
          <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
            <ImageOff className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================================================
// MAIN COMPONENT
// ==========================================================================
export function TechniquesSection() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [expandedTech, setExpandedTech] = useState<number | null>(null);
  const [showImages, setShowImages] = useState(true);
  const [lightbox, setLightbox] = useState<{ src?: string } | null>(null);

  const category = techniqueCategories[activeCategory];

  return (
    <div className="space-y-4">
      <AnimatedCard>
        <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] rounded-2xl p-4 sm:p-5 text-white shadow-lg overflow-hidden">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Technieken</h1>
          <p className="text-white/80 mt-1 text-xs sm:text-sm">Alle judotechnieken met illustraties en video-uitleg</p>
        </div>
      </AnimatedCard>

      {/* Global image toggle */}
      <div className="flex justify-end">
        <AnimatedButton onClick={() => setShowImages(!showImages)} variants={subtleHover}>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${showImages ? 'bg-[#a90000] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
            {showImages ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {showImages ? "Foto's tonen" : "Foto's verbergen"}
          </div>
        </AnimatedButton>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 flex-wrap" style={{ scrollbarWidth: 'thin', WebkitOverflowScrolling: 'touch' }}>
        {techniqueCategories.map((cat, idx) => (
          <AnimatedButton key={cat.key} onClick={() => { setActiveCategory(idx); setExpandedTech(null); }} variants={subtleHover}>
            <div className={`flex-shrink-0 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-medium transition-all whitespace-nowrap ${activeCategory === idx ? 'bg-[#a90000] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-[#fdf6f6] border border-gray-200'}`}>
              <span className="hidden sm:inline">{cat.label}</span>
              <span className="sm:hidden truncate max-w-[60px]">{cat.label.split(' ')[0]}</span>
            </div>
          </AnimatedButton>
        ))}
      </div>

      {/* Techniques Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {category.techniques.map((tech) => {
          const img = getTechniqueImage(category.key, tech.id);
          const hasImage = img?.available;
          const primarySrc = img?.thumbnail;

          return (
            <AnimatedCard key={tech.id} variants={subtleHover}>
              <Card className="border-0 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  <button
                    onClick={() => setExpandedTech(expandedTech === tech.id ? null : tech.id)}
                    className="w-full text-left p-3 sm:p-4 hover:bg-[#f8f9fa] transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Thumbnail image */}
                      {showImages && hasImage && primarySrc && (
                        <div
                          className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:ring-2 hover:ring-[#a90000] transition-all"
                          onClick={(e) => { e.stopPropagation(); setLightbox({ src: primarySrc }); }}
                        >
                          <img
                            src={primarySrc}
                            alt={tech.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm">{tech.dutch}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{tech.name}</p>
                      </div>
                      {expandedTech === tech.id ? <EyeOff className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <Eye className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                    </div>
                  </button>

                  {expandedTech === tech.id && (
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2 border-t border-[#e8eaed] pt-3">
                      {/* Full image in expanded view */}
                      {showImages && hasImage && img?.thumbnail && (
                        <div
                          className="rounded-lg overflow-hidden bg-gray-100 border border-[#e8eaed] cursor-pointer hover:ring-2 hover:ring-[#a90000] transition-all"
                          onClick={() => setLightbox({ src: img.thumbnail })}
                        >
                          <img
                            src={img.thumbnail}
                            alt={tech.name}
                            className="w-full h-auto"
                          />
                        </div>
                      )}
                      {showImages && !hasImage && (
                        <div className="rounded-lg overflow-hidden bg-gray-100 border border-[#e8eaed] flex items-center justify-center py-8">
                          <div className="text-center">
                            <ImageOff className="w-8 h-8 text-gray-300 mx-auto" />
                            <p className="text-xs text-gray-400 mt-1">Geen illustratie beschikbaar</p>
                          </div>
                        </div>
                      )}
                      {tech.youtubeId && (
                        <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 border border-[#e8eaed]">
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

      {/* Lightbox */}
      {lightbox && (
        <ImageLightbox
          src={lightbox.src}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}
