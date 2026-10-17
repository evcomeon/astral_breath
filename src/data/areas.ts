/**
 * Stardust Breath Garden - Garden Areas
 * Conforming strictly to PRD Section 9
 */

import { AreaDef, AreaId } from '../types/game';

export const AREAS: Record<AreaId, AreaDef> = {
  AREA_01: {
    id: 'AREA_01',
    nameKey: 'area_AREA_01',
    descKey: 'area_AREA_01_desc',
    featuresKey: 'area_AREA_01_feat',
    requiredDust: 0,
    bonusDescKey: 'area_AREA_01_feat',
  },
  AREA_02: {
    id: 'AREA_02',
    nameKey: 'area_AREA_02',
    descKey: 'area_AREA_02_desc',
    featuresKey: 'area_AREA_02_feat',
    requiredDust: 5000,
    requiredItem: 'OBJ_BREATH_CORE',
    bonusDescKey: 'area_AREA_02_feat',
  },
  AREA_03: {
    id: 'AREA_03',
    nameKey: 'area_AREA_03',
    descKey: 'area_AREA_03_desc',
    featuresKey: 'area_AREA_03_feat',
    requiredDust: 20000,
    requiredItem: 'MERGE_DUST_7',
    bonusDescKey: 'area_AREA_03_feat',
  },
};
