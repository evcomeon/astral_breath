/**
 * Stardust Breath Garden - Board & Synthesis Engine
 * Conforming strictly to PRD Section 2, 4, 8
 */

import { BoardSlot, GameSaveState, ItemId, Language, RecipeDef } from '../types/game';
import { RECIPES } from '../data/recipes';
import { ITEMS } from '../data/items';
import { getTranslation } from '../i18n/translations';
import { addFormationXp } from './progression';
import { calculateCompanionLevel } from '../data/characters';

export const BOARD_SIZE = 64; // 8x8

export function createEmptyBoard(): BoardSlot[] {
  return Array.from({ length: BOARD_SIZE }, () => ({
    itemId: null,
    stackCount: 0,
  }));
}

export function getAvailableBoardSlots(board: BoardSlot[]): number[] {
  const slots: number[] = [];
  for (let i = 0; i < board.length; i++) {
    if (!board[i].itemId || board[i].stackCount <= 0) {
      slots.push(i);
    }
  }
  return slots;
}

export function countMergeablePairs(board: BoardSlot[]): number {
  const itemCounts: Record<string, number> = {};
  for (const slot of board) {
    if (slot.itemId && slot.stackCount > 0) {
      itemCounts[slot.itemId] = (itemCounts[slot.itemId] || 0) + slot.stackCount;
    }
  }

  let totalPairs = 0;
  for (const recipe of RECIPES) {
    if (recipe.inputs.length === 1 && recipe.inputs[0].count === 2) {
      const id = recipe.inputs[0].itemId;
      const count = itemCounts[id] || 0;
      totalPairs += Math.floor(count / 2);
    }
  }
  return totalPairs;
}

export function getItemRank(itemId: ItemId | null): number {
  if (!itemId) return -1;
  switch (itemId) {
    case 'OBJ_STAR_RELIC': return 900;
    case 'MERGE_DUST_8': return 800;
    case 'MERGE_DUST_7': return 700;
    case 'OBJ_GARDEN_SEED': return 650;
    case 'MERGE_DUST_6': return 600;
    case 'OBJ_BREATH_CORE': return 550;
    case 'MERGE_DUST_5': return 500;
    case 'OBJ_RESONANCE_ARRAY': return 450;
    case 'MERGE_DUST_4': return 400;
    case 'MERGE_DUST_3': return 300;
    case 'OBJ_GLIMMER_CORE': return 280;
    case 'MERGE_GLIMMER_3': return 260;
    case 'MERGE_GLIMMER_2': return 240;
    case 'MERGE_GLIMMER_1': return 220;
    case 'MERGE_DUST_2': return 200;
    case 'MERGE_DUST_1': return 100;
    case 'MAT_CRYSTAL': return 50;
    case 'MAT_ASH': return 40;
    case 'MAT_GLIMMER': return 30;
    default: return 10;
  }
}

/**
 * Sorts all items on the board by tier/level from high to low,
 * consolidating identical items into stacks up to 999,
 * placing empty slots neatly at the end
 */
export function sortBoardHighToLow(board: BoardSlot[]): BoardSlot[] {
  const itemCounts = new Map<ItemId, number>();
  for (const slot of board) {
    if (slot.itemId && slot.stackCount > 0) {
      itemCounts.set(slot.itemId, (itemCounts.get(slot.itemId) || 0) + slot.stackCount);
    }
  }

  const activeItems: BoardSlot[] = [];
  const sortedItemIds = Array.from(itemCounts.keys()).sort((a, b) => getItemRank(b) - getItemRank(a));

  for (const itemId of sortedItemIds) {
    let remaining = itemCounts.get(itemId)!;
    while (remaining > 0) {
      const take = Math.min(999, remaining);
      activeItems.push({ itemId, stackCount: take });
      remaining -= take;
    }
  }

  return Array.from({ length: BOARD_SIZE }, (_, idx) => {
    if (idx < activeItems.length) {
      return { ...activeItems[idx] };
    }
    return { itemId: null, stackCount: 0 };
  });
}

/**
 * Adds an amount of an item to the board, stacking up to 999 per slot
 */
export function addItemToBoard(
  board: BoardSlot[],
  itemId: ItemId,
  count: number
): { success: boolean; newBoard: BoardSlot[]; addedCount: number } {
  const newBoard = board.map((s) => ({ ...s }));
  let remaining = count;

  // 1. Fill existing slots of same item where stackCount < 999
  for (let i = 0; i < newBoard.length && remaining > 0; i++) {
    if (newBoard[i].itemId === itemId && newBoard[i].stackCount < 999) {
      const space = 999 - newBoard[i].stackCount;
      const add = Math.min(space, remaining);
      newBoard[i].stackCount += add;
      remaining -= add;
    }
  }

  // 2. Put into empty slots
  for (let i = 0; i < newBoard.length && remaining > 0; i++) {
    if (!newBoard[i].itemId || newBoard[i].stackCount <= 0) {
      const add = Math.min(999, remaining);
      newBoard[i] = { itemId, stackCount: add };
      remaining -= add;
    }
  }

  return {
    success: remaining === 0,
    newBoard,
    addedCount: count - remaining,
  };
}

export interface MergeResult {
  success: boolean;
  errorCode?: string;
  newBoard: BoardSlot[];
  producedItemId?: ItemId;
  targetSlotIndex?: number;
  xpEarned: number;
  companionXpEarned: number;
  milestonesUnlocked: string[];
  newDiscoveredItems: ItemId[];
}

/**
 * Merges two slots on the board according to PRD Section 2.1
 * Smaller index receives the output, the other is cleared (or deducts 1 if stacked).
 */
export function mergeSlots(
  save: GameSaveState,
  fromIndex: number,
  toIndex: number
): MergeResult {
  if (fromIndex === toIndex) {
    return {
      success: false,
      errorCode: 'SAME_SLOT',
      newBoard: save.board,
      xpEarned: 0,
      companionXpEarned: 0,
      milestonesUnlocked: [],
      newDiscoveredItems: [],
    };
  }

  const board = [...save.board.map((s) => ({ ...s }))];
  const itemA = board[fromIndex];
  const itemB = board[toIndex];

  if (!itemA.itemId || !itemB.itemId) {
    return {
      success: false,
      errorCode: 'EMPTY_SLOT',
      newBoard: save.board,
      xpEarned: 0,
      companionXpEarned: 0,
      milestonesUnlocked: [],
      newDiscoveredItems: [],
    };
  }

  if (itemA.itemId !== itemB.itemId) {
    return {
      success: false,
      errorCode: 'INCOMPATIBLE_ITEMS',
      newBoard: save.board,
      xpEarned: 0,
      companionXpEarned: 0,
      milestonesUnlocked: [],
      newDiscoveredItems: [],
    };
  }

  // Find recipe for pair of this item
  const recipe = RECIPES.find(
    (r) => r.inputs.length === 1 && r.inputs[0].itemId === itemA.itemId && r.inputs[0].count === 2
  );

  if (!recipe) {
    // If no merge recipe (e.g. max tier or non-merging artifacts), stack them together up to 999!
    const spaceInB = 999 - itemB.stackCount;
    if (spaceInB > 0) {
      const transfer = Math.min(spaceInB, itemA.stackCount);
      itemB.stackCount += transfer;
      itemA.stackCount -= transfer;
      if (itemA.stackCount <= 0) {
        board[fromIndex] = { itemId: null, stackCount: 0 };
      }
      return {
        success: true,
        newBoard: board,
        xpEarned: 0,
        companionXpEarned: 0,
        milestonesUnlocked: [],
        newDiscoveredItems: [],
      };
    }

    return {
      success: false,
      errorCode: 'NO_RECIPE_FOR_TIER',
      newBoard: save.board,
      xpEarned: 0,
      companionXpEarned: 0,
      milestonesUnlocked: [],
      newDiscoveredItems: [],
    };
  }

  const outputItemId = recipe.output.itemId;
  // Merged item takes the smaller index
  const targetIndex = Math.min(fromIndex, toIndex);
  const clearedIndex = Math.max(fromIndex, toIndex);

  if (itemA.stackCount === 1 && itemB.stackCount === 1) {
    board[targetIndex] = {
      itemId: outputItemId,
      stackCount: 1,
    };
    board[clearedIndex] = {
      itemId: null,
      stackCount: 0,
    };
  } else {
    // Stacked slots: consume 1 from each
    itemA.stackCount -= 1;
    itemB.stackCount -= 1;
    if (itemA.stackCount <= 0) {
      board[fromIndex] = { itemId: null, stackCount: 0 };
    }
    if (itemB.stackCount <= 0) {
      board[toIndex] = { itemId: null, stackCount: 0 };
    }

    // Place output item
    if (!board[targetIndex].itemId || board[targetIndex].stackCount <= 0) {
      board[targetIndex] = { itemId: outputItemId, stackCount: 1 };
    } else if (!board[clearedIndex].itemId || board[clearedIndex].stackCount <= 0) {
      board[clearedIndex] = { itemId: outputItemId, stackCount: 1 };
    } else {
      // Find existing slot of outputItemId < 999 or any free slot
      let placed = false;
      for (let i = 0; i < board.length; i++) {
        if (board[i].itemId === outputItemId && board[i].stackCount < 999) {
          board[i].stackCount += 1;
          placed = true;
          break;
        }
      }
      if (!placed) {
        for (let i = 0; i < board.length; i++) {
          if (!board[i].itemId || board[i].stackCount <= 0) {
            board[i] = { itemId: outputItemId, stackCount: 1 };
            placed = true;
            break;
          }
        }
      }
    }
  }

  const xpEarned = recipe.formationXp;
  const companionXpEarned = xpEarned > 0 ? Math.max(1, Math.floor(xpEarned / 4)) : 0;

  const milestonesUnlocked: string[] = [];
  const newDiscoveredItems: ItemId[] = [];

  if (!save.discoveredItemIds.includes(outputItemId)) {
    newDiscoveredItems.push(outputItemId);
  }

  return {
    success: true,
    newBoard: board,
    producedItemId: outputItemId,
    targetSlotIndex: targetIndex,
    xpEarned,
    companionXpEarned,
    milestonesUnlocked,
    newDiscoveredItems,
  };
}

/**
 * Moves, stacks, or swaps items between slots
 */
export function moveOrSwapSlot(
  board: BoardSlot[],
  fromIndex: number,
  toIndex: number
): BoardSlot[] {
  if (fromIndex === toIndex) return board;
  const newBoard = board.map((s) => ({ ...s }));
  const source = newBoard[fromIndex];
  const target = newBoard[toIndex];

  // If target has same item, stack them together up to 999
  if (source.itemId && target.itemId && source.itemId === target.itemId) {
    const space = 999 - target.stackCount;
    if (space > 0) {
      const transfer = Math.min(space, source.stackCount);
      target.stackCount += transfer;
      source.stackCount -= transfer;
      if (source.stackCount <= 0) {
        newBoard[fromIndex] = { itemId: null, stackCount: 0 };
      }
      return newBoard;
    }
  }

  // Otherwise swap
  newBoard[fromIndex] = target;
  newBoard[toIndex] = source;
  return newBoard;
}

export interface RecipeRequirementItem {
  itemId: ItemId;
  needed: number;
  current: number;
  isMaterial: boolean;
  isSatisfied: boolean;
  nameKey: string;
}

export interface RecipeRequirementStatus {
  canCraft: boolean;
  items: RecipeRequirementItem[];
  missingCount: number;
  isBoardFull: boolean;
  primaryMissingReason: string;
  guidanceTip: string;
}

/**
 * Calculates current requirement status for any recipe
 */
export function getRecipeStatus(
  save: GameSaveState,
  recipe: RecipeDef,
  lang: Language = 'zh-CN'
): RecipeRequirementStatus {
  const board = save.board;
  const materials = save.materials;

  const items: RecipeRequirementItem[] = [];
  let consumesBoardItem = false;

  for (const input of recipe.inputs) {
    const isMaterial =
      input.itemId === 'MAT_GLIMMER' ||
      input.itemId === 'MAT_ASH' ||
      input.itemId === 'MAT_CRYSTAL';
    let current = 0;
    if (input.itemId === 'MAT_GLIMMER') {
      current = materials.glimmer || 0;
    } else if (input.itemId === 'MAT_ASH') {
      current = materials.ash || 0;
    } else if (input.itemId === 'MAT_CRYSTAL') {
      current = materials.crystal || 0;
    } else {
      consumesBoardItem = true;
      current = board.reduce(
        (sum, s) => (s.itemId === input.itemId && s.stackCount > 0 ? sum + s.stackCount : sum),
        0
      );
    }

    const isSatisfied = current >= input.count;
    items.push({
      itemId: input.itemId,
      needed: input.count,
      current,
      isMaterial,
      isSatisfied,
      nameKey: ITEMS[input.itemId]?.nameKey || input.itemId,
    });
  }

  const missingItems = items.filter((i) => !i.isSatisfied);
  const freeSlots = getAvailableBoardSlots(board).length;
  // If recipe does not consume board items, it requires an empty board slot (or existing stackable slot)
  const hasExistingStackableSlot = board.some(
    (s) => s.itemId === recipe.output.itemId && s.stackCount + recipe.output.count <= 999
  );
  const isBoardFull = !consumesBoardItem && freeSlots === 0 && !hasExistingStackableSlot;

  const canCraft = missingItems.length === 0 && !isBoardFull;

  let primaryMissingReason = '';
  let guidanceTip = '';

  if (missingItems.length > 0) {
    const details = missingItems
      .map((m) => {
        const name = getTranslation(lang, m.nameKey);
        const loc = m.isMaterial
          ? lang === 'zh-CN'
            ? '背包'
            : 'pouch'
          : lang === 'zh-CN'
          ? '星盘'
          : 'board';
        return `【${name}】需 ${m.needed} (${loc} ${m.current})`;
      })
      .join('，');
    primaryMissingReason =
      lang === 'zh-CN' ? `缺少材料：${details}` : `Missing items: ${details}`;

    // Guidance tips based on first missing item
    const firstMissing = missingItems[0];
    if (firstMissing.itemId === 'MAT_GLIMMER') {
      guidanceTip =
        lang === 'zh-CN'
          ? '微光碎片可在材料箱购买（1000星尘），或首次合成星尘团III时赠予。'
          : 'Glimmer Shards can be bought in workshop or gained by fusing Dust III.';
    } else if (firstMissing.itemId === 'MAT_ASH') {
      guidanceTip =
        lang === 'zh-CN'
          ? '时空余烬需离线满20小时在上线领取时沉淀析出。'
          : 'Spacetime Ash drops after 20 hours offline upon collecting rewards.';
    } else if (firstMissing.itemId === 'MAT_CRYSTAL') {
      guidanceTip =
        lang === 'zh-CN'
          ? '凝形结晶在星盘突破合成4阶、6阶、8阶星尘团时自动赐予。'
          : 'Crystals are awarded upon forging Dust IV, VI, and VIII.';
    } else if (firstMissing.itemId === 'MERGE_DUST_1') {
      guidanceTip =
        lang === 'zh-CN'
          ? '可点击星盘上方【凝聚】消耗10星尘快速生成星尘团 I。'
          : 'Use Condense on Astrolabe to convert 10 Stardust into Dust I.';
    } else {
      guidanceTip =
        lang === 'zh-CN'
          ? `点击【${getTranslation(lang, firstMissing.nameKey)}】可查看前置合成路径！`
          : `Click ${getTranslation(lang, firstMissing.nameKey)} to view its synthesis path!`;
    }
  } else if (isBoardFull) {
    primaryMissingReason =
      lang === 'zh-CN'
        ? '星盘空间已满，无空位放置新产物，请先合并或腾出空格！'
        : 'Astrolabe board is full! Merge or clear a slot first.';
    guidanceTip =
      lang === 'zh-CN'
        ? '使用星盘上方【一键合成】整理空格，腾出位置即可完成共鸣！'
        : 'Use One-Click Merge on Astrolabe to free up slots!';
  }

  return {
    canCraft,
    items,
    missingCount: missingItems.length,
    isBoardFull,
    primaryMissingReason,
    guidanceTip,
  };
}

export interface CraftRecipeResult {
  success: boolean;
  errorCode?: string;
  message?: string;
  newSave?: GameSaveState;
  xpEarned?: number;
  companionXpEarned?: number;
  targetSlotIndex?: number;
}

/**
 * Applies a complex multi-ingredient Recipe from board or material storage
 */
export function craftRecipe(
  save: GameSaveState,
  recipe: RecipeDef,
  lang: Language = 'zh-CN'
): CraftRecipeResult {
  const status = getRecipeStatus(save, recipe, lang);
  if (!status.canCraft) {
    return {
      success: false,
      errorCode: status.isBoardFull ? 'BOARD_FULL' : 'MISSING_INGREDIENTS',
      message: `${status.primaryMissingReason}（${status.guidanceTip}）`,
    };
  }

  const newSave: GameSaveState = JSON.parse(JSON.stringify(save));
  const board = newSave.board;
  const materials = newSave.materials;

  const slotsToClear: number[] = [];

  for (const input of recipe.inputs) {
    if (input.itemId === 'MAT_GLIMMER') {
      materials.glimmer -= input.count;
    } else if (input.itemId === 'MAT_ASH') {
      materials.ash -= input.count;
    } else if (input.itemId === 'MAT_CRYSTAL') {
      materials.crystal -= input.count;
    } else {
      let needed = input.count;
      for (let i = 0; i < board.length && needed > 0; i++) {
        if (board[i].itemId === input.itemId && board[i].stackCount > 0) {
          const deduct = Math.min(needed, board[i].stackCount);
          board[i].stackCount -= deduct;
          needed -= deduct;
          if (board[i].stackCount <= 0) {
            board[i] = { itemId: null, stackCount: 0 };
            slotsToClear.push(i);
          }
        }
      }
    }
  }

  // Determine target slot for the output item
  let targetSlotIndex = -1;
  const outCount = recipe.output.count || 1;

  if (slotsToClear.length > 0) {
    // Put into first input slot (Section 2.1: 产物放入第一个输入格)
    slotsToClear.sort((a, b) => a - b);
    targetSlotIndex = slotsToClear[0];
    board[targetSlotIndex] = {
      itemId: recipe.output.itemId,
      stackCount: outCount,
    };
  } else {
    // Try to stack onto an existing slot first
    let stacked = false;
    for (let i = 0; i < board.length; i++) {
      if (board[i].itemId === recipe.output.itemId && board[i].stackCount + outCount <= 999) {
        board[i].stackCount += outCount;
        targetSlotIndex = i;
        stacked = true;
        break;
      }
    }

    if (!stacked) {
      // Need an empty board slot
      const freeSlots = getAvailableBoardSlots(board);
      if (freeSlots.length === 0) {
        return {
          success: false,
          errorCode: 'BOARD_FULL',
          message: lang === 'zh-CN' ? '星盘空间已满，无法放置产物' : 'Board is full',
        };
      }
      targetSlotIndex = freeSlots[0];
      board[targetSlotIndex] = {
        itemId: recipe.output.itemId,
        stackCount: outCount,
      };
    }
  }

  // Add XP
  const xpEarned = recipe.formationXp;
  let companionXpEarned = 0;
  if (xpEarned > 0) {
    const { newXp, newLevel } = addFormationXp(newSave.formationXp, xpEarned);
    newSave.formationXp = newXp;
    newSave.formationLevel = newLevel;

    // Companion shared XP
    companionXpEarned = Math.max(1, Math.floor(xpEarned / 4));
    newSave.companionXp = Math.min(200, newSave.companionXp + companionXpEarned);
    newSave.companionLevel = calculateCompanionLevel(newSave.companionXp);
  }

  if (!newSave.discoveredItemIds.includes(recipe.output.itemId)) {
    newSave.discoveredItemIds.push(recipe.output.itemId);
  }

  // Handle unlocks
  if (recipe.unlocks === 'CHR_VELA' && !newSave.discoveredCharacterIds.includes('CHR_VELA')) {
    newSave.discoveredCharacterIds.push('CHR_VELA');
  }

  const outItem = ITEMS[recipe.output.itemId];
  const prodName = outItem ? getTranslation(lang, outItem.nameKey) : recipe.output.itemId;

  return {
    success: true,
    newSave,
    xpEarned,
    companionXpEarned,
    targetSlotIndex,
    message:
      lang === 'zh-CN'
        ? `共鸣成功：制作出【${prodName}】，获得 +${xpEarned} 点凝形经验！`
        : `Resonated ${prodName}! Gained +${xpEarned} Formation XP!`,
  };
}

/**
 * Batch merges all available identical pairs sequentially (Section 3 OBJ_RESONANCE_ARRAY)
 */
export function executeBatchMerge(save: GameSaveState): {
  success: boolean;
  mergedCount: number;
  newSave: GameSaveState;
  totalXp: number;
} {
  let currentSave: GameSaveState = JSON.parse(JSON.stringify(save));
  let mergedCount = 0;
  let totalXp = 0;
  let changed = true;

  // Multi-pass merge until no more pairs can be merged
  while (changed) {
    changed = false;

    // Find all 2-item merge recipes (dust 1~7 and glimmer 1~2)
    const mergeRecipes = RECIPES.filter(
      (r) => r.inputs.length === 1 && r.inputs[0].count === 2
    );

    for (const recipe of mergeRecipes) {
      const inputId = recipe.inputs[0].itemId;
      const outputId = recipe.output.itemId;

      // Count total items of this type across board
      let totalCount = 0;
      for (const slot of currentSave.board) {
        if (slot.itemId === inputId && slot.stackCount > 0) {
          totalCount += slot.stackCount;
        }
      }

      const pairs = Math.floor(totalCount / 2);
      if (pairs > 0) {
        // Consume pairs * 2 of inputId
        let toConsume = pairs * 2;
        for (let i = 0; i < currentSave.board.length && toConsume > 0; i++) {
          if (currentSave.board[i].itemId === inputId) {
            const take = Math.min(toConsume, currentSave.board[i].stackCount);
            currentSave.board[i].stackCount -= take;
            toConsume -= take;
            if (currentSave.board[i].stackCount <= 0) {
              currentSave.board[i] = { itemId: null, stackCount: 0 };
            }
          }
        }

        // Add pairs of outputId to board
        const addRes = addItemToBoard(currentSave.board, outputId, pairs);
        currentSave.board = addRes.newBoard;

        const xp = pairs * recipe.formationXp;
        totalXp += xp;
        mergedCount += pairs;
        changed = true;

        if (xp > 0) {
          const { newXp, newLevel } = addFormationXp(currentSave.formationXp, xp);
          currentSave.formationXp = newXp;
          currentSave.formationLevel = newLevel;
          const compXp = Math.max(1, Math.floor(xp / 4));
          currentSave.companionXp = Math.min(200, currentSave.companionXp + compXp);
          currentSave.companionLevel = calculateCompanionLevel(currentSave.companionXp);
        }

        if (!currentSave.discoveredItemIds.includes(outputId)) {
          currentSave.discoveredItemIds.push(outputId);
        }
      }
    }
  }

  if (mergedCount > 0 && currentSave.settings.autoSortBoard !== false) {
    currentSave.board = sortBoardHighToLow(currentSave.board);
  }

  return {
    success: mergedCount > 0,
    mergedCount,
    newSave: currentSave,
    totalXp,
  };
}
