/**
 * Stardust Breath Garden - Save & Persistence Management
 * Conforming strictly to PRD Section 10.2 & 10.3
 */

import { GameSaveState, Language } from '../types/game';
import { createEmptyBoard } from './board';
import { calculateFormationLevel } from './progression';
import { calculateCompanionLevel } from '../data/characters';

const PRIMARY_SAVE_KEY = 'stardust_garden_save_v1_2';
const BACKUP_PREFIX = 'stardust_garden_backup_';
const MAX_BACKUPS = 3;

export function generateInitialSave(lang: Language = 'zh-CN'): GameSaveState {
  const now = Date.now();
  const state: GameSaveState = {
    schemaVersion: 1,
    saveId: `save_${now}_${Math.random().toString(36).substring(2, 9)}`,
    createdAtUtcMs: now,
    lastClaimUtcMs: now,
    lastSeenUtcMs: now,
    timezoneId: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    dust: '0',
    board: createEmptyBoard(),
    materials: {
      glimmer: 0,
      ash: 0,
      crystal: 0,
    },
    discoveredItemIds: ['RES_DUST'],
    discoveredCharacterIds: ['CHR_LUMA'],
    equippedCharacterId: 'CHR_LUMA',
    formationXp: 0,
    formationLevel: 1,
    companionXp: 0,
    companionLevel: 1,
    unlockedAreaIds: ['AREA_01'],
    repairedAreaIds: ['AREA_01'],
    claimedMilestones: [],
    lastAshClaimUtcMs: 0,
    pendingRewards: [],
    breathCarrySeconds: 0,
    frozenSettlementSnapshot: null,
    settings: {
      soundEnabled: true,
      soundVolume: 0.7,
      language: lang,
      autoSortBoard: true,
    },
    checksum: '',
  };

  state.checksum = computeChecksum(state);
  return state;
}

export function computeChecksum(state: Partial<GameSaveState>): string {
  const payload = `${state.saveId}:${state.formationXp}:${state.dust}:${state.companionXp}:${state.createdAtUtcMs}`;
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    hash = (hash << 5) - hash + payload.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(16);
}

/**
 * Recomputes derived progress fields to ensure integrity (AT-019)
 */
export function recomputeDerivedProgress(rawState: GameSaveState): GameSaveState {
  const state: GameSaveState = { ...rawState };
  // Recalculate levels directly from XP
  state.formationLevel = calculateFormationLevel(state.formationXp);
  state.companionLevel = calculateCompanionLevel(state.companionXp);

  // Validate equipped character
  if (!state.discoveredCharacterIds.includes(state.equippedCharacterId)) {
    state.equippedCharacterId = 'CHR_LUMA';
  }

  // Ensure board length 64
  if (!Array.isArray(state.board) || state.board.length !== 64) {
    state.board = createEmptyBoard();
  }

  // Ensure materials
  state.materials = {
    glimmer: Math.max(0, Math.min(999, state.materials?.glimmer || 0)),
    ash: Math.max(0, Math.min(999, state.materials?.ash || 0)),
    crystal: Math.max(0, Math.min(999, state.materials?.crystal || 0)),
  };

  // Ensure settings & autoSort
  if (!state.settings) {
    state.settings = { soundEnabled: true, soundVolume: 0.7, language: 'zh-CN', autoSortBoard: true };
  } else if (state.settings.autoSortBoard === undefined) {
    state.settings.autoSortBoard = true;
  }

  state.checksum = computeChecksum(state);
  return state;
}

/**
 * Loads save state from localStorage, falling back to backups if invalid
 */
export function loadGameSave(): GameSaveState {
  try {
    const raw = localStorage.getItem(PRIMARY_SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as GameSaveState;
      if (parsed && typeof parsed.formationXp === 'number') {
        return recomputeDerivedProgress(parsed);
      }
    }
  } catch (e) {
    console.warn('Failed to parse primary save, trying backups...', e);
    for (let i = 1; i <= MAX_BACKUPS; i++) {
      try {
        const backupRaw = localStorage.getItem(`${BACKUP_PREFIX}${i}`);
        if (backupRaw) {
          const parsed = JSON.parse(backupRaw) as GameSaveState;
          if (parsed && typeof parsed.formationXp === 'number') {
            return recomputeDerivedProgress(parsed);
          }
        }
      } catch {
        // continue
      }
    }
  }

  return generateInitialSave();
}

/**
 * Saves game state with atomic rotation and 3 backups
 */
export function saveGame(state: GameSaveState): boolean {
  try {
    const updated = {
      ...state,
      lastSeenUtcMs: Date.now(),
    };
    updated.formationLevel = calculateFormationLevel(updated.formationXp);
    updated.companionLevel = calculateCompanionLevel(updated.companionXp);
    updated.checksum = computeChecksum(updated);

    const serialized = JSON.stringify(updated);

    // Rotate backups
    try {
      const b2 = localStorage.getItem(`${BACKUP_PREFIX}2`);
      if (b2) localStorage.setItem(`${BACKUP_PREFIX}3`, b2);
      const b1 = localStorage.getItem(`${BACKUP_PREFIX}1`);
      if (b1) localStorage.setItem(`${BACKUP_PREFIX}2`, b1);
      const primary = localStorage.getItem(PRIMARY_SAVE_KEY);
      if (primary) localStorage.setItem(`${BACKUP_PREFIX}1`, primary);
    } catch {
      // Storage might be constrained
    }

    localStorage.setItem(PRIMARY_SAVE_KEY, serialized);
    return true;
  } catch (err) {
    console.error('Failed to save game state:', err);
    return false;
  }
}
