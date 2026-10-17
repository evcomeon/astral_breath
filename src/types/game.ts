/**
 * Stardust Breath Garden (星尘溯息庭)
 * Core Game Type Definitions according to PRD v1.2
 */

export type Language = 'zh-CN' | 'en-US';

export type GameState = 'TITLE' | 'PLAYING';

export type ActiveModal =
  | null
  | 'SETTLEMENT'
  | 'CONDENSE'
  | 'CHARACTERS'
  | 'COMPENDIUM'
  | 'AREAS'
  | 'SETTINGS'
  | 'TESTS'
  | 'VICTORY'
  | 'BUY_SHARD';

export type ItemId =
  | 'RES_DUST'
  | 'MAT_GLIMMER'
  | 'MAT_ASH'
  | 'MAT_CRYSTAL'
  | 'MERGE_DUST_1'
  | 'MERGE_DUST_2'
  | 'MERGE_DUST_3'
  | 'MERGE_DUST_4'
  | 'MERGE_DUST_5'
  | 'MERGE_DUST_6'
  | 'MERGE_DUST_7'
  | 'MERGE_DUST_8'
  | 'MERGE_GLIMMER_1'
  | 'MERGE_GLIMMER_2'
  | 'MERGE_GLIMMER_3'
  | 'OBJ_GLIMMER_CORE'
  | 'OBJ_RESONANCE_ARRAY'
  | 'OBJ_BREATH_CORE'
  | 'OBJ_GARDEN_SEED'
  | 'OBJ_STAR_RELIC'
  | 'ITEM_BREATH_RETAINER';

export type ItemType = 'resource' | 'material' | 'merge_dust' | 'merge_glimmer' | 'artifact' | 'special';

export const MAX_STACK_SIZE = 999;

export interface ItemDef {
  id: ItemId;
  nameKey: string;
  descKey: string;
  type: ItemType;
  tier?: number;
  dustValue?: number;
  maxStack: number; // 999 for all items (stackable up to 999)
  icon: string;
  color: string;
  glowColor: string;
}

export interface BoardSlot {
  itemId: ItemId | null;
  stackCount: number;
}

export interface RecipeInput {
  itemId: ItemId;
  count: number;
}

export interface RecipeOutput {
  itemId: ItemId;
  count: number;
}

export interface RecipeDef {
  id: string;
  nameKey: string;
  inputs: RecipeInput[];
  output: RecipeOutput;
  formationXp: number;
  unlocks?: string;
  descriptionKey?: string;
}

export type CharacterId = 'CHR_LUMA' | 'CHR_NORI' | 'CHR_VELA' | 'CHR_ORIN';

export interface CharacterDef {
  id: CharacterId;
  nameKey: string;
  titleKey: string;
  descKey: string;
  unlockConditionKey: string;
  baseOfflineBonusBps: number; // 200 = 2%, 300 = 3%
  maxLevel: number;
  avatarColor: string;
  symbol: string;
}

export type AreaId = 'AREA_01' | 'AREA_02' | 'AREA_03';

export interface AreaDef {
  id: AreaId;
  nameKey: string;
  descKey: string;
  featuresKey: string;
  requiredDust: number;
  requiredItem?: ItemId;
  bonusDescKey: string;
}

export interface PendingReward {
  rewardId: string;
  items: { itemId: ItemId; count: number }[];
  createdAtUtcMs: number;
}

export interface FrozenSettlementSnapshot {
  startUtcMs: number;
  endUtcMs: number;
  elapsedSeconds: number;
  computedReward: number;
  aMultiplier: number;
  bMultiplier: number;
  cMultiplier: number;
  requestId: string;
  ashAwarded: boolean;
}

export interface GameSaveState {
  schemaVersion: number;
  saveId: string;
  createdAtUtcMs: number;
  lastClaimUtcMs: number;
  lastSeenUtcMs: number;
  timezoneId: string;
  dust: string; // BigInt stored as string
  board: BoardSlot[]; // Length 64 (8x8)
  materials: {
    glimmer: number;
    ash: number;
    crystal: number;
  };
  discoveredItemIds: ItemId[];
  discoveredCharacterIds: CharacterId[];
  equippedCharacterId: CharacterId;
  formationXp: number;
  formationLevel: number; // 1 to 20
  companionXp: number; // shared, max 200
  companionLevel: number; // 1 to 5
  unlockedAreaIds: AreaId[];
  repairedAreaIds: AreaId[];
  claimedMilestones: string[];
  lastAshClaimUtcMs: number;
  pendingRewards: PendingReward[];
  breathCarrySeconds: number; // Future version compatibility, default 0
  frozenSettlementSnapshot?: FrozenSettlementSnapshot | null;
  settings: {
    soundEnabled: boolean;
    soundVolume: number;
    language: Language;
    autoSortBoard?: boolean;
  };
  checksum: string;
}
