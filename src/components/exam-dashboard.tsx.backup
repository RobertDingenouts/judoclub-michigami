'use client';

import { useState } from 'react';
import { belts, beltColors, getExamRequirements } from '@/data/exam-requirements';

type ViewMode = 'all' | 'new' | 'detail';

export default function ExamDashboard() {
  const [selectedBelt, setSelectedBelt] = useState('wit');
  const [viewMode, setViewMode] = useState<ViewMode>('new');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const requirements = getExamRequirements(selectedBelt);

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    requirements.forEach(r => { allExpanded[r.category] = true; });
    setExpandedCategories(allExpanded);
  };

  const collapseAll = () => {
    setExpandedCategories({});
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Belt Selector - Kimi style visual belts */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 md:p-4">
        <h3 className="text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 md:mb-3 text-center uppercase tracking-wide">
          Kies je band
        </h3>
        <div className="flex flex-wrap gap-1.5 md:gap-2 justify-center">
          {belts.map((belt) => (
            <button
              key={belt.id}
              onClick={() => setSelectedBelt(belt.id)}
              className={`
                relative px-2 md:px-3 py-1.5 md:py-2 rounded-lg border-2 transition-all duration-200 
                flex items-center gap-1 md:gap-1.5 text-xs md:text-sm font-semibold
                hover:scale-105 hover:-translate-y-0.5
                ${selectedBelt === belt.id 
                  ? 'ring-2 ring-red-600 ring-offset-2 dark:ring-offset-gray-800 scale-105' 
                  : 'hover:shadow-md'}
              `}
              style={{
                background: beltColors[belt.color as keyof typeof beltColors]?.bg || '#fff',
                color: beltColors[belt.color as keyof typeof beltColors]?.text || '#333',
                borderColor: beltColors[belt.color as keyof typeof beltColors]?.border || '#ccc',
              }}
            >
              {/* Visual belt indicator */}
              <span 
                className="w-3 h-3 md:w-4 md:h-4 rounded-sm border shadow-sm inline-block"
                style={{ 
                  background: beltColors[belt.color as keyof typeof beltColors]?.belt || '#fff',
                  borderColor: beltColors[belt.color as keyof typeof beltColors]?.border || '#ccc'
                }}
              />
              <span className="truncate">{belt.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 md:p-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
          <span className="text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">
            Weergave:
          </span>
          <div className="flex gap-1.5 md:gap-2 flex-wrap">
            {(['all', 'new', 'detail'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`
                  px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all
                  ${viewMode === mode
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}
                `}
              >
                {mode === 'all' ? 'Alles' : mode === 'new' ? 'Nieuw' : 'Detail'}
              </button>
            ))}
          </div>
        </div>

        {/* Expand/Collapse buttons */}
        <div className="flex gap-1.5 md:gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={expandAll}
            className="flex-1 px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs md:text-sm font-semibold hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
          >
            ▲ Alles open
          </button>
          <button
            onClick={collapseAll}
            className="flex-1 px-2 py-1 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-lg text-xs md:text-sm font-semibold hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors"
          >
            ▼ Alles dicht
          </button>
        </div>
      </div>

      {/* Exam Requirements */}
      <div className="space-y-2 md:space-y-3">
        {requirements.map((req) => (
          <div key={req.category} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(req.category)}
              className="w-full px-3 md:px-4 py-2 md:py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div>
                <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white">
                  {req.category}
                </h3>
                <p className="text-xs md:text-sm text-red-600 dark:text-red-400 font-medium">
                  {req.japaneseName}
                </p>
              </div>
              <span className="text-gray-500 dark:text-gray-400 text-lg ml-2 md:ml-3 flex-shrink-0">
                {expandedCategories[req.category] ? '−' : '+'}
              </span>
            </button>

            {/* Techniques List */}
            {expandedCategories[req.category] && (
              <div className="border-t border-gray-200 dark:border-gray-700 px-3 md:px-4 py-2 md:py-3 space-y-1.5 md:space-y-2">
                {req.techniques.map((tech, idx) => (
                  <div
                    key={idx}
                    className={`
                      flex items-start gap-2 p-2 md:p-3 rounded-lg text-xs md:text-sm
                      ${viewMode === 'new' && tech.new 
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500' 
                        : 'bg-gray-50 dark:bg-gray-700/50'}
                    `}
                  >
                    <span className="font-bold text-red-600 dark:text-red-400 min-w-[1.2rem] md:min-w-[1.5rem]">
                      {idx + 1}.
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white break-words">
                        {tech.name}
                      </p>
                      {viewMode === 'detail' && tech.description && (
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-0.5 break-words">
                          {tech.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Nage-komi & Kanteltechnieken info */}
                {viewMode === 'detail' && (
                  <div className="mt-2 md:mt-3 p-2 md:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs md:text-sm text-blue-800 dark:text-blue-300 font-medium">
                      💡 Voor dit examen: {req.nageKomi || 0} nage-komi + {req.kanteltechnieken || 0} kanteltechnieken vereist
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
