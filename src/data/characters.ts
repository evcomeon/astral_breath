/**
 * Stardust Breath Garden - Character Roster & Progression
 * Conforming strictly to PRD Section 5
 */

import { CharacterDef, CharacterId } from '../types/game';

export const CHARACTERS: Record<CharacterId, CharacterDef> = {
  CHR_LUMA: {
    id: 'CHR_LUMA',
    nameKey: 'char_CHR_LUMA',
    titleKey: 'char_CHR_LUMA_title',
    descKey: 'char_CHR_LUMA_desc',
    unlockConditionKey: 'char_CHR_LUMA_unlock',
    baseOfflineBonusBps: 200, // 2%
    maxLevel: 5,
    avatarColor: '#38bdf8',
    symbol: '✦',
  },
  CHR_NORI: {
    id: 'CHR_NORI',
    nameKey: 'char_CHR_NORI',
    titleKey: 'char_CHR_NORI_title',
    descKey: 'char_CHR_NORI_desc',
    unlockConditionKey: 'char_CHR_NORI_unlock',
    baseOfflineBonusBps: 300, // 3%
    maxLevel: 5,
    avatarColor: '#818cf8',
    symbol: '◈',
  },
  CHR_VELA: {
    id: 'CHR_VELA',
    nameKey: 'char_CHR_VELA',
    titleKey: 'char_CHR_VELA_title',
    descKey: 'char_CHR_VELA_desc',
    unlockConditionKey: 'char_CHR_VELA_unlock',
    baseOfflineBonusBps: 200, // 2%
    maxLevel: 5,
    avatarColor: '#c084fc',
    symbol: '★',
  },
  CHR_ORIN: {
    id: 'CHR_ORIN',
    nameKey: 'char_CHR_ORIN',
    titleKey: 'char_CHR_ORIN_title',
    descKey: 'char_CHR_ORIN_desc',
    unlockConditionKey: 'char_CHR_ORIN_unlock',
    baseOfflineBonusBps: 300, // 3%
    maxLevel: 5,
    avatarColor: '#34d399',
    symbol: '❖',
  },
};

/**
 * Shared Companion XP Thresholds (Cumulative)
 * Lv1: 0
 * Lv2: 20
 * Lv3: 60
 * Lv4: 120
 * Lv5: 200 (Cap)
 */
export const COMPANION_XP_THRESHOLDS = [0, 20, 60, 120, 200];

export function calculateCompanionLevel(xp: number): number {
  if (xp >= 200) return 5;
  if (xp >= 120) return 4;
  if (xp >= 60) return 3;
  if (xp >= 20) return 2;
  return 1;
}

/**
 * Returns character bonus C as decimal (e.g. 0.02 for 2%, 0.042 for 4.2%)
 */
export function getCharacterBonus(charId: CharacterId, companionLevel: number): number {
  const def = CHARACTERS[charId];
  if (!def) return 0;
  const baseFraction = def.baseOfflineBonusBps / 10000;
  const levelMultiplier = 1 + 0.1 * (companionLevel - 1);
  return Number((baseFraction * levelMultiplier).toFixed(6));
}
