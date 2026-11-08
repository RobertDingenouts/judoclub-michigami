// Puur (geen db-imports): exameneisen per doel-band,-cliënt-en-server te gebruiken.
import { beltRequirements, techniqueCategories } from '@/data/exam-requirements'

export const BELT_SEQ = ['WIT','WIT_GEEL','GEEL','GEEL_ORANJE','ORANJE','ORANJE_GROEN','GROEN','GROEN_BLAUW','BLAUW','BLAUW_BRUIN','BRUIN'] as const
export type DoelBelt = typeof BELT_SEQ[number]

export const BELT_NL: Record<string, string> = {
  WIT: 'witte band', WIT_GEEL: 'wit/gele slip', GEEL: 'gele band', GEEL_ORANJE: 'geel/oranje slip',
  ORANJE: 'oranje band', ORANJE_GROEN: 'oranje/groene slip', GROEN: 'groene band', GROEN_BLAUW: 'groen/blauwe slip',
  BLAUW: 'blauwe band', BLAUW_BRUIN: 'blauw/bruine slip', BRUIN: 'bruine band',
}

const BELT_REQ_ID: Record<string, string> = {
  WIT: 'wit', WIT_GEEL: 'wit-gele-slip', GEEL: 'geel', GEEL_ORANJE: 'geel-oranje-slip',
  ORANJE: 'oranje', ORANJE_GROEN: 'oranje-groene-slip', GROEN: 'groen', GROEN_BLAUW: 'groen-blauwe-slip',
  BLAUW: 'blauw', BLAUW_BRUIN: 'blauw-bruine-slip', BRUIN: 'bruin',
}

export const KORT: Record<string, string> = {
  'te-waza': 'Armw.', 'kata-waza': 'Schouderw.', 'koshi-waza': 'Heupw.', 'ashi-waza': 'Beenw.',
  'sutemi-waza': 'Offerw.', 'osaekomi-waza': 'Houdg.', 'shime-waza': 'Wurging', 'kansetsu-waza': 'Armklem',
  'ukemi-waza': 'Vallen', 'nage-komi': 'Nage-komi', 'kanteltechnieken': 'Kantelen',
}

export const VAKVOLGORDE = ['te-waza','kata-waza','koshi-waza','ashi-waza','sutemi-waza','osaekomi-waza','shime-waza','kansetsu-waza','ukemi-waza','nage-komi','kanteltechnieken'] as const

export interface EisVak { id: string; naam: string; kort: string; aantal: number }

export function eisenVoorBelt(belt: string | null): EisVak[] | null {
  if (!belt) return null
  const reqId = BELT_REQ_ID[belt]
  if (!reqId) return null
  const req = beltRequirements.find(r => r.beltId === reqId)
  if (!req) return null
  const vakken: EisVak[] = []
  for (const catId of VAKVOLGORDE) {
    let aantal = 0
    let naam = KORT[catId] ?? catId
    if (catId === 'nage-komi') { aantal = req.nageKomi; naam = 'Nage-komi' }
    else if (catId === 'kanteltechnieken') { aantal = req.kantelTechnieken; naam = 'Kanteltechnieken' }
    else if (catId === 'ukemi-waza') { aantal = req.ukemiWaza ?? 4; naam = 'Vallen' }
    else {
      aantal = req.requirements[catId] ?? 0
      const cat = techniqueCategories.find(c => c.id === catId)
      if (cat) naam = cat.nameNl
    }
    if (aantal > 0) vakken.push({ id: catId, naam, kort: KORT[catId] ?? naam, aantal })
  }
  return vakken
}
