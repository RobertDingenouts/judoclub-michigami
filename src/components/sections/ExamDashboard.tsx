'use client';

import { useState, useMemo } from 'react';
import {
  beltLevels as examBeltLevels,
  techniqueCategories as examCategories,
  techniques as examTechniques,
  beltRequirements,
  getTechniquesForBelt,
  getNewTechniquesForBelt,
  getCategoryInfo,
  getParentBelt,
  type BeltLevel,
  type Technique as ExamTechnique,
} from '@/data/exam-requirements';

// Club colors - matches original Kimi dashboard
const CLUB_COLORS = {
  primary: '#8B0000',
  secondary: '#DC143C',
  accent: '#FFD700',
  dark: '#1a1a1a',
  light: '#f8f8f8',
  text: '#333333',
};

// All categories in order for unified view
const ALL_CATEGORIES = [
  { id: 'ukemi-waza', mainCategory: null, order: 0 },
  { id: 'ashi-waza', mainCategory: 'nage-waza', order: 1 },
  { id: 'koshi-waza', mainCategory: 'nage-waza', order: 2 },
  { id: 'kata-waza', mainCategory: 'nage-waza', order: 3 },
  { id: 'te-waza', mainCategory: 'nage-waza', order: 4 },
  { id: 'sutemi-waza', mainCategory: 'nage-waza', order: 5 },
  { id: 'osaekomi-waza', mainCategory: 'katame-waza', order: 6 },
  { id: 'shime-waza', mainCategory: 'katame-waza', order: 7 },
  { id: 'kansetsu-waza', mainCategory: 'katame-waza', order: 8 },
];

export function ExamDashboard() {
  const [selectedBeltId, setSelectedBeltId] = useState<string>('wit');
  const [viewMode, setViewMode] = useState<'all' | 'new'>('all');
  const [detailLevel, setDetailLevel] = useState<'counts' | 'techniques' | 'full'>('techniques');
  const [showDirectTransition, setShowDirectTransition] = useState(false);
  const [fromBeltId, setFromBeltId] = useState<string>('wit');

  // Collapsible state - track which categories are expanded
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const selectedBelt = examBeltLevels.find(b => b.id === selectedBeltId);
  const fromBelt = examBeltLevels.find(b => b.id === fromBeltId);
  const beltReq = beltRequirements.find(r => r.beltId === selectedBeltId);
  const fromBeltReq = showDirectTransition ? beltRequirements.find(r => r.beltId === fromBeltId) : null;

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Expand all categories
  const expandAll = () => {
    setExpandedCategories(new Set(ALL_CATEGORIES.map(c => c.id)));
  };

  // Collapse all categories
  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  // Calculate requirements for display
  const requirements = useMemo(() => {
    if (showDirectTransition && fromBeltId !== selectedBeltId) {
      const fromReqs = beltRequirements.find(r => r.beltId === fromBeltId);
      const toReqs = beltRequirements.find(r => r.beltId === selectedBeltId);
      if (!fromReqs || !toReqs) return [];

      return toReqs.requirements.map(toReq => {
        const fromReq = fromReqs.requirements.find(r => r.categoryId === toReq.categoryId);
        const fromCount = fromReq?.count || 0;
        return {
          categoryId: toReq.categoryId,
          totalCount: toReq.count,
          newCount: Math.max(0, toReq.count - fromCount),
          previousCount: fromCount,
        };
      });
    }

    const beltIndex = examBeltLevels.findIndex(b => b.id === selectedBeltId);
    const currentReqs = beltRequirements.find(r => r.beltId === selectedBeltId);
    if (!currentReqs) return [];

    if (viewMode === 'all') {
      return currentReqs.requirements.map(req => ({
        categoryId: req.categoryId,
        totalCount: req.count,
        newCount: req.count,
        previousCount: 0,
      }));
    } else {
      if (beltIndex === 0) {
        return currentReqs.requirements.map(req => ({
          categoryId: req.categoryId,
          totalCount: req.count,
          newCount: req.count,
          previousCount: 0,
        }));
      }

      const prevBelt = examBeltLevels[beltIndex - 1];
      const prevReqs = beltRequirements.find(r => r.beltId === prevBelt.id);
      if (!prevReqs) return [];

      return currentReqs.requirements.map(req => {
        const prevReq = prevReqs.requirements.find(r => r.categoryId === req.categoryId);
        const prevCount = prevReq?.count || 0;
        return {
          categoryId: req.categoryId,
          totalCount: req.count,
          newCount: Math.max(0, req.count - prevCount),
          previousCount: prevCount,
        };
      });
    }
  }, [selectedBeltId, viewMode, showDirectTransition, fromBeltId]);

  // Get belt color style
  const getBeltColorStyle = (belt: BeltLevel) => {
    if (belt.isSlip && getParentBelt(belt.id)) {
      const parentColor = getParentBelt(belt.id)?.color || '#FFFFFF';
      return {
        background: `linear-gradient(90deg, ${parentColor} 0%, ${parentColor} 40%, ${belt.color} 45%, ${belt.color} 55%, ${parentColor} 60%, ${parentColor} 100%)`,
        border: belt.id === 'wit' || belt.id === 'wit-gele-slip' ? '2px solid #666' : 'none',
      };
    }
    return {
      backgroundColor: belt.color,
      border: belt.id === 'wit' ? '2px solid #666' : 'none',
    };
  };

  // Get category info helper
  const getCategoryInfoHelper = (categoryId: string) => {
    return getCategoryInfo(categoryId);
  };

  // Get techniques for display
  const getTechniquesForDisplay = (categoryId: string, totalCount: number, prevCount: number) => {
    const categoryInfo = getCategoryInfoHelper(categoryId);
    const allTechs = examTechniques.filter(t => t.category === categoryId);

    return {
      all: allTechs.slice(0, totalCount),
      new: allTechs.slice(prevCount, totalCount),
    };
  };

  // Ukemi techniques (always show all 4)
  const ukemiWaza = getCategoryInfoHelper('ukemi-waza');

  return (
    <div className="space-y-4">
      {/* Belt Selector Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
        <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {examBeltLevels.map((belt) => {
            const isActive = selectedBeltId === belt.id;
            return (
              <button
                key={belt.id}
                onClick={() => setSelectedBeltId(belt.id)}
                className={`flex-shrink-0 w-12 h-12 rounded-lg transition-all ${
                  isActive ? 'ring-2 ring-[#a90000] ring-offset-2 scale-110 shadow-md' : 'hover:scale-105 opacity-70 hover:opacity-100'
                }`}
                style={getBeltColorStyle(belt)}
                title={belt.name}
              >
                <span className="text-xs font-bold" style={{ color: belt.color === '#FFFFFF' ? '#333' : 'white' }}>
                  {belt.kyu || ''}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-2 text-center">
          <span className="text-sm font-medium" style={{ color: CLUB_COLORS.primary }}>
            {selectedBelt?.name}
          </span>
          {selectedBelt?.kyu && (
            <span className="ml-2 text-xs text-gray-500">({selectedBelt.kyu}e kyu)</span>
          )}
        </div>
      </div>

      {/* Controls Row */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Weergave toggle */}
          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-gray-50">
            <span className="text-xs font-medium text-gray-600">Weergave</span>
            <div className="flex gap-1">
              <button
                onClick={() => setViewMode('all')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  viewMode === 'all' ? 'bg-[#a90000] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                Alles
              </button>
              <button
                onClick={() => setViewMode('new')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  viewMode === 'new' ? 'bg-[#a90000] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                Nieuw
              </button>
            </div>
          </div>

          {/* Detail level */}
          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-gray-50">
            <span className="text-xs font-medium text-gray-600">Detail</span>
            <select
              value={detailLevel}
              onChange={(e) => setDetailLevel(e.target.value as any)}
              className="text-xs bg-white border border-gray-200 rounded px-2 py-1"
            >
              <option value="counts">Aantallen</option>
              <option value="techniques">Technieken</option>
              <option value="full">Met vertaling</option>
            </select>
          </div>

          {/* Direct transition toggle */}
          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-gray-50 col-span-2 md:col-span-2">
            <span className="text-xs font-medium text-gray-600">Directe overgang</span>
            <div className="flex items-center gap-2">
              <select
                value={fromBeltId}
                onChange={(e) => setFromBeltId(e.target.value)}
                className="text-xs bg-white border border-gray-200 rounded px-2 py-1"
                disabled={!showDirectTransition}
              >
                {examBeltLevels.filter(b => !b.isSlip).map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              <span className="text-gray-400">→</span>
              <button
                onClick={() => setShowDirectTransition(!showDirectTransition)}
                className={`w-10 h-5 rounded-full transition-colors ${showDirectTransition ? 'bg-[#a90000]' : 'bg-gray-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${showDirectTransition ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Unified Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header with expand/collapse buttons */}
        <div className="p-4 flex items-center justify-between" style={{ backgroundColor: CLUB_COLORS.primary }}>
          <h2 className="text-xl font-bold text-white">
            {showDirectTransition ? `${fromBelt?.name} → ${selectedBelt?.name}` : `Exameneisen ${selectedBelt?.name}`}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={expandAll}
              className="px-3 py-1 rounded text-sm font-medium transition-colors bg-white/20 text-white hover:bg-white/30"
            >
              Alles open
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-1 rounded text-sm font-medium transition-colors bg-white/20 text-white hover:bg-white/30"
            >
              Alles dicht
            </button>
          </div>
        </div>

        {/* Category List */}
        <div className="divide-y divide-gray-200">
          {ALL_CATEGORIES.map((catInfo) => {
            const req = requirements.find(r => r.categoryId === catInfo.id);
            const count = viewMode === 'new' ? (req?.newCount || 0) : (req?.totalCount || 0);
            const newCount = req?.newCount || 0;
            const prevCount = req?.previousCount || 0;

            // Get special counts for ukemi-waza and nage-komi, kantel
            const isUkemi = catInfo.id === 'ukemi-waza';
            const displayCount = isUkemi ? 4 : count;
            const isExpanded = expandedCategories.has(catInfo.id);
            const categoryInfo = getCategoryInfoHelper(catInfo.id);
            const techniques = getTechniquesForDisplay(catInfo.id, req?.totalCount || 0, prevCount);

            // Skip if no requirements and view mode is new
            if (!isUkemi && count === 0 && viewMode === 'new') return null;

            return (
              <div key={catInfo.id} className="border-b border-gray-100 last:border-b-0">
                {/* Category Header - Clickable */}
                <button
                  onClick={() => toggleCategory(catInfo.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{categoryInfo.icon}</span>
                    <div className="text-left">
                      <h3 className="font-bold text-lg" style={{ color: CLUB_COLORS.dark }}>
                        {categoryInfo.nameNl}
                      </h3>
                      <p className="text-sm" style={{ color: CLUB_COLORS.primary }}>
                        {categoryInfo.nameJa}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="text-2xl font-bold"
                      style={{
                        color: viewMode === 'new' && newCount > 0 ? '#16a34a' : CLUB_COLORS.secondary,
                      }}
                    >
                      {displayCount}
                    </span>
                    {viewMode === 'new' && newCount > 0 && !isUkemi && (
                      <span className="text-sm text-green-600 font-medium">(+{newCount} nieuw)</span>
                    )}
                    <svg
                      className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{ color: CLUB_COLORS.primary }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && detailLevel !== 'counts' && (
                  <div className="px-4 pb-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 pt-2">
                      {isUkemi ? (
                        // Ukemi-waza always shows all 4 techniques
                        ukemiWaza.techniques.map((tech, idx) => (
                          <div
                            key={tech.id}
                            className="p-2 bg-white rounded border-l-2"
                            style={{ borderColor: CLUB_COLORS.secondary }}
                          >
                            <span className="font-medium" style={{ color: CLUB_COLORS.dark }}>
                              {idx + 1}. {tech.nameJa}
                            </span>
                            {detailLevel === 'full' && (
                              <span className="text-sm ml-2" style={{ color: '#666' }}>
                                ({tech.nameNl})
                              </span>
                            )}
                          </div>
                        ))
                      ) : (
                        // Other categories
                        (viewMode === 'new' ? techniques.new : techniques.all).map((tech, idx) => (
                          <div
                            key={tech.id}
                            className={`p-2 bg-white rounded border-l-2 ${tech.forbidden ? 'border-red-500' : ''}`}
                            style={{ borderColor: tech.forbidden ? '#dc2626' : CLUB_COLORS.secondary }}
                          >
                            <span
                              className="font-medium"
                              style={{
                                color: tech.forbidden ? '#dc2626' : CLUB_COLORS.dark,
                              }}
                            >
                              {(viewMode === 'new' ? prevCount : 0) + idx + 1}. {tech.nameJa}
                            </span>
                            {detailLevel === 'full' && (
                              <span className="text-sm ml-2" style={{ color: '#666' }}>
                                ({tech.nameNl})
                              </span>
                            )}
                            {tech.forbidden && (
                              <span className="ml-2 text-xs text-red-500 font-medium">*verboden</span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Nage-komi and Kanteltechnieken */}
          <div className="border-t-2" style={{ borderColor: CLUB_COLORS.primary }}>
            <div className="p-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <div>
                    <h4 className="font-bold" style={{ color: CLUB_COLORS.dark }}>Nage-komi</h4>
                    <p className="text-sm" style={{ color: '#666' }}>Worpen in 1 minuut</p>
                  </div>
                  <span className="text-3xl font-bold" style={{ color: CLUB_COLORS.secondary }}>
                    {beltReq?.nageKomi || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <div>
                    <h4 className="font-bold" style={{ color: CLUB_COLORS.dark }}>Kanteltechnieken</h4>
                    <p className="text-sm" style={{ color: '#666' }}>Nader te specificeren</p>
                  </div>
                  <span className="text-3xl font-bold" style={{ color: CLUB_COLORS.secondary }}>
                    {beltReq?.kantelTechnieken || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
