/**
 * Stardust Breath Garden - Recipe Definitions
 * Strict implementation of PRD Section 4
 */

import { RecipeDef } from '../types/game';

export const RECIPES: RecipeDef[] = [
  // Ordinary Dust Merges
  {
    id: 'R_DUST_1',
    nameKey: 'item_MERGE_DUST_2',
    inputs: [{ itemId: 'MERGE_DUST_1', count: 2 }],
    output: { itemId: 'MERGE_DUST_2', count: 1 },
    formationXp: 2,
  },
  {
    id: 'R_DUST_2',
    nameKey: 'item_MERGE_DUST_3',
    inputs: [{ itemId: 'MERGE_DUST_2', count: 2 }],
    output: { itemId: 'MERGE_DUST_3', count: 1 },
    formationXp: 4,
    unlocks: 'CHR_NORI',
  },
  {
    id: 'R_DUST_3',
    nameKey: 'item_MERGE_DUST_4',
    inputs: [{ itemId: 'MERGE_DUST_3', count: 2 }],
    output: { itemId: 'MERGE_DUST_4', count: 1 },
    formationXp: 8,
  },
  {
    id: 'R_DUST_4',
    nameKey: 'item_MERGE_DUST_5',
    inputs: [{ itemId: 'MERGE_DUST_4', count: 2 }],
    output: { itemId: 'MERGE_DUST_5', count: 1 },
    formationXp: 16,
  },
  {
    id: 'R_DUST_5',
    nameKey: 'item_MERGE_DUST_6',
    inputs: [{ itemId: 'MERGE_DUST_5', count: 2 }],
    output: { itemId: 'MERGE_DUST_6', count: 1 },
    formationXp: 32,
  },
  {
    id: 'R_DUST_6',
    nameKey: 'item_MERGE_DUST_7',
    inputs: [{ itemId: 'MERGE_DUST_6', count: 2 }],
    output: { itemId: 'MERGE_DUST_7', count: 1 },
    formationXp: 64,
  },
  {
    id: 'R_DUST_7',
    nameKey: 'item_MERGE_DUST_8',
    inputs: [{ itemId: 'MERGE_DUST_7', count: 2 }],
    output: { itemId: 'MERGE_DUST_8', count: 1 },
    formationXp: 128,
  },

  // Glimmer Shards conversion
  {
    id: 'R_GLIMMER_1',
    nameKey: 'item_MERGE_GLIMMER_1',
    inputs: [{ itemId: 'MAT_GLIMMER', count: 2 }],
    output: { itemId: 'MERGE_GLIMMER_1', count: 1 },
    formationXp: 0,
  },
  {
    id: 'R_GLIMMER_2',
    nameKey: 'item_MERGE_GLIMMER_2',
    inputs: [{ itemId: 'MERGE_GLIMMER_1', count: 2 }],
    output: { itemId: 'MERGE_GLIMMER_2', count: 1 },
    formationXp: 3,
  },
  {
    id: 'R_GLIMMER_3',
    nameKey: 'item_MERGE_GLIMMER_3',
    inputs: [{ itemId: 'MERGE_GLIMMER_2', count: 2 }],
    output: { itemId: 'MERGE_GLIMMER_3', count: 1 },
    formationXp: 6,
  },
  {
    id: 'R_CORE',
    nameKey: 'item_OBJ_GLIMMER_CORE',
    inputs: [{ itemId: 'MERGE_GLIMMER_3', count: 2 }],
    output: { itemId: 'OBJ_GLIMMER_CORE', count: 1 },
    formationXp: 12,
  },

  // Functional & End-Game Artifact Recipes
  {
    id: 'R_ARRAY',
    nameKey: 'item_OBJ_RESONANCE_ARRAY',
    inputs: [
      { itemId: 'MERGE_DUST_5', count: 1 },
      { itemId: 'OBJ_GLIMMER_CORE', count: 1 },
      { itemId: 'MAT_CRYSTAL', count: 1 },
    ],
    output: { itemId: 'OBJ_RESONANCE_ARRAY', count: 1 },
    formationXp: 20,
    unlocks: 'CHR_VELA',
  },
  {
    id: 'R_BREATH',
    nameKey: 'item_OBJ_BREATH_CORE',
    inputs: [
      { itemId: 'MERGE_DUST_6', count: 1 },
      { itemId: 'MAT_ASH', count: 2 },
      { itemId: 'MAT_CRYSTAL', count: 1 },
    ],
    output: { itemId: 'OBJ_BREATH_CORE', count: 1 },
    formationXp: 30,
    unlocks: 'AREA_02',
  },
  {
    id: 'R_SEED',
    nameKey: 'item_OBJ_GARDEN_SEED',
    inputs: [
      { itemId: 'MERGE_DUST_7', count: 1 },
      { itemId: 'MAT_GLIMMER', count: 2 },
    ],
    output: { itemId: 'OBJ_GARDEN_SEED', count: 1 },
    formationXp: 40,
    unlocks: 'AREA_03',
  },
  {
    id: 'R_RELIC',
    nameKey: 'item_OBJ_STAR_RELIC',
    inputs: [
      { itemId: 'MERGE_DUST_8', count: 1 },
      { itemId: 'OBJ_BREATH_CORE', count: 1 },
      { itemId: 'MAT_CRYSTAL', count: 1 },
    ],
    output: { itemId: 'OBJ_STAR_RELIC', count: 1 },
    formationXp: 50,
  },
];
