/**
 * Stardust Breath Garden - Progression System
 * Strict implementation of PRD Section 6
 */

export const MAX_FORMATION_LEVEL = 20;

/**
 * Cumulative XP thresholds for Formation Levels 1 to 20
 * XP(L) = 15 + 5L for L in [2, 20]
 */
export const FORMATION_XP_THRESHOLDS: number[] = [
  0,    // Lv1
  25,   // Lv2
  55,   // Lv3
  90,   // Lv4
  130,  // Lv5
  175,  // Lv6
  225,  // Lv7
  280,  // Lv8
  340,  // Lv9
  405,  // Lv10
  475,  // Lv11
  550,  // Lv12
  630,  // Lv13
  715,  // Lv14
  805,  // Lv15
  900,  // Lv16
  1000, // Lv17
  1105, // Lv18
  1215, // Lv19
  1330, // Lv20
];

export const MAX_FORMATION_XP = FORMATION_XP_THRESHOLDS[MAX_FORMATION_LEVEL - 1]; // 1330

export function calculateFormationLevel(xp: number): number {
  const clampedXp = Math.max(0, xp);
  for (let i = MAX_FORMATION_LEVEL - 1; i >= 0; i--) {
    if (clampedXp >= FORMATION_XP_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

/**
 * Formation multiplier B(L) = 1 + 0.05 * (L - 1)
 * Level 1: 1.00, Level 20: 1.95
 */
export function getFormationMultiplierB(level: number): number {
  const clampedLevel = Math.max(1, Math.min(MAX_FORMATION_LEVEL, level));
  return Number((1 + 0.05 * (clampedLevel - 1)).toFixed(2));
}

/**
 * Add formation XP without exceeding 1330 (Level 20 cap)
 */
export function addFormationXp(currentXp: number, delta: number): { newXp: number; newLevel: number; leveledUp: boolean } {
  const currentLevel = calculateFormationLevel(currentXp);
  const newXp = Math.min(MAX_FORMATION_XP, currentXp + Math.max(0, delta));
  const newLevel = calculateFormationLevel(newXp);
  return {
    newXp,
    newLevel,
    leveledUp: newLevel > currentLevel,
  };
}
