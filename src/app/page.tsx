'use client'

import { useState, useMemo } from 'react'
import {
  beltLevels,
  nageWaza,
  katameWaza,
  ukemiWaza,
  beltRequirements,
  getCategoryById,
  getRequirementsForBelt,
  type BeltLevel,
  type Technique,
} from '@/data/exam-requirements'

type ViewMode = 'all' | 'new'
type DetailLevel = 'counts' | 'techniques' | 'full'

// Club colors for JC Michigami
const CLUB_COLORS = {
  primary: '#8B0000',      // Dark red
  secondary: '#DC143C',    // Crimson
  accent: '#FFD700',       // Gold
  dark: '#1a1a1a',         // Near black
  light: '#f8f8f8',        // Light background
  text: '#333333',         // Text color
  textLight: '#ffffff',    // Light text
}

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
]

export default function JudoExamDashboard() {
  const [selectedBeltId, setSelectedBeltId] = useState<string>('wit')
  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [detailLevel, setDetailLevel] = useState<DetailLevel>('techniques')
  const [showDirectTransition, setShowDirectTransition] = useState(false)
  const [fromBeltId, setFromBeltId] = useState<string>('wit')
  
  // Collapsible state - track which categories are expanded
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  const selectedBelt = beltLevels.find(b => b.id === selectedBeltId)
  const fromBelt = beltLevels.find(b => b.id === fromBeltId)
  const beltReq = getRequirementsForBelt(selectedBeltId)
  const fromBeltReq = showDirectTransition ? getRequirementsForBelt(fromBeltId) : null

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  // Expand all categories
  const expandAll = () => {
    setExpandedCategories(new Set(ALL_CATEGORIES.map(c => c.id)))
  }

  // Collapse all categories
  const collapseAll = () => {
    setExpandedCategories(new Set())
  }

  // Calculate requirements for display
  const requirements = useMemo(() => {
    if (showDirectTransition && fromBeltId !== selectedBeltId) {
      const fromReqs = getRequirementsForBelt(fromBeltId)
      const toReqs = getRequirementsForBelt(selectedBeltId)
      if (!fromReqs || !toReqs) return []
      
      return toReqs.requirements.map(toReq => {
        const fromReq = fromReqs.requirements.find(r => r.categoryId === toReq.categoryId)
        const fromCount = fromReq?.count || 0
        return {
          categoryId: toReq.categoryId,
          totalCount: toReq.count,
          newCount: Math.max(0, toReq.count - fromCount),
          previousCount: fromCount
        }
      })
    }
    
    const beltIndex = beltLevels.findIndex(b => b.id === selectedBeltId)
    const currentReqs = getRequirementsForBelt(selectedBeltId)
    if (!currentReqs) return []
    
    if (viewMode === 'all') {
      return currentReqs.requirements.map(req => ({
        categoryId: req.categoryId,
        totalCount: req.count,
        newCount: req.count,
        previousCount: 0
      }))
    } else {
      if (beltIndex === 0) {
        return currentReqs.requirements.map(req => ({
          categoryId: req.categoryId,
          totalCount: req.count,
          newCount: req.count,
          previousCount: 0
        }))
      }
      
      const prevReqs = getRequirementsForBelt(beltLevels[beltIndex - 1].id)
      if (!prevReqs) return []
      
      return currentReqs.requirements.map(req => {
        const prevReq = prevReqs.requirements.find(r => r.categoryId === req.categoryId)
        const prevCount = prevReq?.count || 0
        return {
          categoryId: req.categoryId,
          totalCount: req.count,
          newCount: Math.max(0, req.count - prevCount),
          previousCount: prevCount
        }
      })
    }
  }, [selectedBeltId, viewMode, showDirectTransition, fromBeltId])

  // Get belt color style
  const getBeltColorStyle = (belt: BeltLevel) => {
    if (belt.isSlip && belt.parentBelt) {
      const parentColor = beltLevels.find(b => b.id === belt.parentBelt)?.color || '#FFFFFF'
      return {
        background: `linear-gradient(90deg, ${parentColor} 0%, ${parentColor} 40%, ${belt.color} 45%, ${belt.color} 55%, ${parentColor} 60%, ${parentColor} 100%)`,
        border: belt.id === 'wit' || belt.id === 'wit-gele-slip' ? '2px solid #666' : 'none'
      }
    }
    return {
      backgroundColor: belt.color,
      border: belt.id === 'wit' ? '2px solid #666' : 'none'
    }
  }

  // Get techniques for display
  const getTechniquesForDisplay = (categoryId: string, totalCount: number, previousCount: number) => {
    const category = getCategoryById(categoryId)
    if (!category) return { all: [], new: [] }
    
    return {
      all: category.techniques.slice(0, totalCount),
      new: category.techniques.slice(previousCount, totalCount)
    }
  }

  // Only belts (no slips)
  const onlyBelts = beltLevels.filter(b => !b.isSlip)

  // Get category display info
  const getCategoryInfo = (categoryId: string) => {
    if (categoryId === 'ukemi-waza') {
      return { nameNl: 'Valbreektechnieken', nameJa: 'Ukemi-waza', icon: '🛡️' }
    }
    const nageCat = nageWaza.subcategories.find(s => s.id === categoryId)
    if (nageCat) {
      const icons: Record<string, string> = {
        'ashi-waza': '🦵',
        'koshi-waza': '🔄',
        'kata-waza': '💪',
        'te-waza': '🤚',
        'sutemi-waza': '⬇️'
      }
      return { nameNl: nageCat.nameNl, nameJa: nageCat.nameJa, icon: icons[categoryId] || 'Throw' }
    }
    const katameCat = katameWaza.subcategories.find(s => s.id === categoryId)
    if (katameCat) {
      const icons: Record<string, string> = {
        'osaekomi-waza': '🔒',
        'shime-waza': '😤',
        'kansetsu-waza': '💪'
      }
      return { nameNl: katameCat.nameNl, nameJa: katameCat.nameJa, icon: icons[categoryId] || 'Control' }
    }
    return { nameNl: categoryId, nameJa: '', icon: '' }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: CLUB_COLORS.light }}>
      {/* Header */}
      <header 
        className="text-white py-6 px-4 shadow-lg"
        style={{ background: `linear-gradient(135deg, ${CLUB_COLORS.primary} 0%, ${CLUB_COLORS.dark} 100%)` }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
              style={{ backgroundColor: CLUB_COLORS.accent, color: CLUB_COLORS.dark }}
            >
              JC
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Judoclub Michigami Steenbergen</h1>
              <p style={{ color: CLUB_COLORS.accent }}>Exameneisen Kyu-graden</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Control Panel */}
        <div 
          className="rounded-xl shadow-lg p-4 md:p-6 mb-6"
          style={{ backgroundColor: 'white', borderLeft: `4px solid ${CLUB_COLORS.secondary}` }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Belt Selection */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold mb-2" style={{ color: CLUB_COLORS.primary }}>
                Selecteer examen niveau
              </label>
              <div className="flex flex-wrap gap-2">
                {beltLevels.map((belt) => (
                  <button
                    key={belt.id}
                    onClick={() => setSelectedBeltId(belt.id)}
                    className={`relative w-10 h-10 rounded-lg transition-all shadow-md ${
                      selectedBeltId === belt.id ? 'ring-2 ring-offset-2 scale-110' : 'hover:scale-105'
                    }`}
                    style={{
                      ...getBeltColorStyle(belt),
                      ringColor: selectedBeltId === belt.id ? CLUB_COLORS.secondary : undefined
                    }}
                    title={belt.name}
                  >
                    {belt.isSlip && (
                      <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-gray-400 border border-white"></span>
                    )}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-sm" style={{ color: CLUB_COLORS.text }}>
                <strong>{selectedBelt?.name}</strong>
                {selectedBelt?.kyu && <span className="ml-2 opacity-70">({selectedBelt.kyu}e kyu)</span>}
              </p>
            </div>

            {/* View Mode & Detail Level */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: CLUB_COLORS.primary }}>
                  Weergave
                </label>
                <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: CLUB_COLORS.primary }}>
                  <button
                    onClick={() => setViewMode('all')}
                    className="flex-1 px-3 py-2 text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: viewMode === 'all' ? CLUB_COLORS.primary : 'white',
                      color: viewMode === 'all' ? 'white' : CLUB_COLORS.text
                    }}
                  >
                    Alles
                  </button>
                  <button
                    onClick={() => setViewMode('new')}
                    className="flex-1 px-3 py-2 text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: viewMode === 'new' ? CLUB_COLORS.secondary : 'white',
                      color: viewMode === 'new' ? 'white' : CLUB_COLORS.text
                    }}
                  >
                    Nieuw
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: CLUB_COLORS.primary }}>
                  Detail
                </label>
                <select
                  value={detailLevel}
                  onChange={(e) => setDetailLevel(e.target.value as DetailLevel)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{ borderColor: CLUB_COLORS.primary, color: CLUB_COLORS.text }}
                >
                  <option value="counts">Alleen aantallen</option>
                  <option value="techniques">Technieken</option>
                  <option value="full">Met vertaling</option>
                </select>
              </div>
            </div>

            {/* Direct Transition */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: CLUB_COLORS.primary }}>
                Directe overgang
              </label>
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => setShowDirectTransition(!showDirectTransition)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                  style={{ backgroundColor: showDirectTransition ? CLUB_COLORS.secondary : '#ccc' }}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${
                      showDirectTransition ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-sm" style={{ color: CLUB_COLORS.text }}>Band → band</span>
              </div>
              {showDirectTransition && (
                <select
                  value={fromBeltId}
                  onChange={(e) => setFromBeltId(e.target.value)}
                  className="w-full px-2 py-1 border rounded text-sm"
                  style={{ borderColor: CLUB_COLORS.primary }}
                >
                  {onlyBelts.map((belt) => (
                    <option key={belt.id} value={belt.id}>{belt.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Main Content - Unified Overview */}
        <div 
          className="rounded-xl shadow-lg overflow-hidden"
          style={{ backgroundColor: 'white' }}
        >
          {/* Header with expand/collapse buttons */}
          <div 
            className="p-4 flex items-center justify-between"
            style={{ backgroundColor: CLUB_COLORS.primary }}
          >
            <h2 className="text-xl font-bold text-white">
              {showDirectTransition ? `${fromBelt?.name} → ${selectedBelt?.name}` : `Exameneisen ${selectedBelt?.name}`}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="px-3 py-1 rounded text-sm font-medium transition-colors"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
              >
                Alles open
              </button>
              <button
                onClick={collapseAll}
                className="px-3 py-1 rounded text-sm font-medium transition-colors"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
              >
                Alles dicht
              </button>
            </div>
          </div>

          {/* Category List */}
          <div className="divide-y divide-gray-200">
            {ALL_CATEGORIES.map((catInfo) => {
              const req = requirements.find(r => r.categoryId === catInfo.id)
              const count = viewMode === 'new' ? (req?.newCount || 0) : (req?.totalCount || 0)
              const newCount = req?.newCount || 0
              const prevCount = req?.previousCount || 0
              
              // Get special counts for ukemi-waza and nage-komi, kantel
              const isUkemi = catInfo.id === 'ukemi-waza'
              const displayCount = isUkemi ? 4 : count
              const isExpanded = expandedCategories.has(catInfo.id)
              const categoryInfo = getCategoryInfo(catInfo.id)
              const techniques = getTechniquesForDisplay(catInfo.id, req?.totalCount || 0, prevCount)
              
              // Skip if no requirements and view mode is new
              if (!isUkemi && count === 0 && viewMode === 'new') return null
              
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
                          color: viewMode === 'new' && newCount > 0 ? '#16a34a' : CLUB_COLORS.secondary 
                        }}
                      >
                        {displayCount}
                      </span>
                      {viewMode === 'new' && newCount > 0 && !isUkemi && (
                        <span className="text-sm text-green-600 font-medium">
                          (+{newCount} nieuw)
                        </span>
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
                              className={`p-2 bg-white rounded border-l-2 ${
                                tech.forbidden ? 'border-red-500' : ''
                              }`}
                              style={{ borderColor: tech.forbidden ? '#dc2626' : CLUB_COLORS.secondary }}
                            >
                              <span 
                                className="font-medium"
                                style={{ 
                                  color: tech.forbidden ? '#dc2626' : CLUB_COLORS.dark 
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
              )
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
                    <span 
                      className="text-3xl font-bold"
                      style={{ color: CLUB_COLORS.secondary }}
                    >
                      {beltReq?.nageKomi || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                    <div>
                      <h4 className="font-bold" style={{ color: CLUB_COLORS.dark }}>Kanteltechnieken</h4>
                      <p className="text-sm" style={{ color: '#666' }}>Nader te specificeren</p>
                    </div>
                    <span 
                      className="text-3xl font-bold"
                      style={{ color: CLUB_COLORS.secondary }}
                    >
                      {beltReq?.kantelTechnieken || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer 
        className="mt-8 py-4 px-4"
        style={{ backgroundColor: CLUB_COLORS.dark, color: 'white' }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <p className="font-medium">Judoclub Michigami Steenbergen</p>
          <p className="text-sm opacity-70 mt-1">Exameneisen Dashboard</p>
        </div>
      </footer>
    </div>
  )
}
