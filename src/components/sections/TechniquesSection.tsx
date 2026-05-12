'use client';

import { useState } from 'react';
import { Swords, Play, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { techniqueCategories, type TechniqueCategory, type Technique } from '@/data/techniques';

export function TechniquesSection() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [expandedTech, setExpandedTech] = useState<number | null>(null);

  const category = techniqueCategories[activeCategory];

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] rounded-2xl p-4 sm:p-5 text-white shadow-lg overflow-hidden">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-1.5 sm:gap-2 truncate"><Swords className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> Technieken</h1>
        <p className="text-white/80 mt-1 text-xs sm:text-sm">Alle judotechnieken met video-uitleg</p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 flex-wrap" style={{ scrollbarWidth: 'thin', WebkitOverflowScrolling: 'touch' }}>
        {techniqueCategories.map((cat, idx) => (
          <button key={cat.key} onClick={() => { setActiveCategory(idx); setExpandedTech(null); }} className={`flex-shrink-0 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-medium transition-all whitespace-nowrap ${activeCategory === idx ? 'bg-[#a90000] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-[#fdf6f6] border border-gray-200'}`}>
            <span className="hidden sm:inline">{cat.label}</span>
            <span className="sm:hidden truncate max-w-[60px]">{cat.label.split(' ')[0]}</span>
            <span className="ml-1 text-[10px] opacity-70 hidden sm:inline">{cat.labelJp}</span>
          </button>
        ))}
      </div>

      {/* Techniques Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {category.techniques.map((tech) => (
          <Card key={tech.id} className="border-0 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <button onClick={() => setExpandedTech(expandedTech === tech.id ? null : tech.id)} className="w-full text-left p-3 sm:p-4 hover:bg-[#f8f9fa] transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#fdf6f6] flex items-center justify-center flex-shrink-0">
                    <Swords className="w-5 h-5 text-[#c00000]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 text-sm">{tech.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{tech.japanese} — {tech.dutch}</p>
                  </div>
                  {expandedTech === tech.id ? <EyeOff className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <Eye className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                </div>
              </button>

              {expandedTech === tech.id && (
                <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2 border-t border-[#e8eaed] pt-3">
                  {tech.youtubeId && (
                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 border border-[#e8eaed]">
                      <iframe src={`https://www.youtube.com/embed/${tech.youtubeId}`} title={tech.name} className="w-full h-full" allowFullScreen />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
