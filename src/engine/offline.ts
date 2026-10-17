/**
 * Stardust Breath Garden - Offline Settlement Engine
 * Conforming strictly to PRD Section 7 & Appendix A
 */

import { FrozenSettlementSnapshot, GameSaveState } from '../types/game';
import { getFormationMultiplierB } from './progression';
import { getCharacterBonus } from '../data/characters';

export const ASH_COOLDOWN_SECONDS = 72000; // 20 hours
export const SATURATION_HOURS = 48;
export const SATURATION_SECONDS = SATURATION_HOURS * 3600;

// Precompute 1-minute lookup nodes (in basis points: 10000 = 1.0000) for 0 to 48 hours (2880 minutes)
const TOTAL_MINUTES = SATURATION_HOURS * 60; // 2880
const A_TABLE_BPS = new Uint16Array(TOTAL_MINUTES + 1);

for (let m = 0; m <= TOTAL_MINUTES; m++) {
  const h = m / 60;
  // A(h) = 1 + 0.5 * (1 - e^(-h/4))
  const rawA = 1 + 0.5 * (1 - Math.exp(-h / 4));
  // Round to 4 decimal places in BPS (1.0000 = 10000)
  A_TABLE_BPS[m] = Math.round(rawA * 10000);
}
// Pin 48-hour endpoint to exact 15000 bps
A_TABLE_BPS[TOTAL_MINUTES] = 15000;

/**
 * Calculates A(h) using the 1-minute node table and linear interpolation
 * Precision error <= ±0.0002 guaranteed
 */
export function calculateFactorA(hours: number): number {
  if (hours <= 0) return 1.0;
  if (hours >= SATURATION_HOURS) return 1.5;

  const totalMin = hours * 60;
  const idx = Math.floor(totalMin);
  const frac = totalMin - idx;

  if (idx >= TOTAL_MINUTES) return 1.5;

  const bps1 = A_TABLE_BPS[idx];
  const bps2 = A_TABLE_BPS[idx + 1];
  const interpolatedBps = bps1 + (bps2 - bps1) * frac;

  return Number((interpolatedBps / 10000).toFixed(4));
}

/**
 * Checks whether this settlement is eligible to receive 1 Spacetime Ash (MAT_ASH)
 */
export function isAshEligible(lastAshClaimUtcMs: number, currentClaimUtcMs: number): boolean {
  if (lastAshClaimUtcMs <= 0) {
    // First valid claim grants 1 ash immediately
    return true;
  }
  const elapsedSec = Math.floor((currentClaimUtcMs - lastAshClaimUtcMs) / 1000);
  return elapsedSec >= ASH_COOLDOWN_SECONDS;
}

/**
 * Seconds remaining until next Ash is eligible
 */
export function getAshCooldownRemainingSeconds(lastAshClaimUtcMs: number, currentClaimUtcMs: number): number {
  if (lastAshClaimUtcMs <= 0) return 0;
  const elapsedSec = Math.floor((currentClaimUtcMs - lastAshClaimUtcMs) / 1000);
  const remaining = ASH_COOLDOWN_SECONDS - elapsedSec;
  return Math.max(0, remaining);
}

export interface OfflineCalculationResult {
  elapsedSeconds: number;
  aMultiplier: number;
  bMultiplier: number;
  cMultiplier: number;
  dustReward: number; // BigInt safe integer
  ashAwarded: boolean;
  requestId: string;
}

/**
 * Pure function: calculates offline settlement reward snapshot
 * Formula: floor( r * d * A(h_eff / 3600) * B(L) * (1 + C) )
 */
export function calculateOfflineReward(
  save: GameSaveState,
  nowUtcMs: number
): OfflineCalculationResult {
  // If time rolled back more than 5 minutes (300,000 ms), pause reward (AT-018)
  if (save.lastSeenUtcMs > 0 && nowUtcMs < save.lastSeenUtcMs - 300000) {
    return {
      elapsedSeconds: 0,
      aMultiplier: 1.0,
      bMultiplier: getFormationMultiplierB(save.formationLevel),
      cMultiplier: getCharacterBonus(save.equippedCharacterId, save.companionLevel),
      dustReward: 0,
      ashAwarded: false,
      requestId: `clock_rollback_${nowUtcMs}`,
    };
  }

  // Elapsed real offline seconds: no cap
  const elapsedSeconds = Math.max(0, Math.floor((nowUtcMs - save.lastClaimUtcMs) / 1000));
  if (elapsedSeconds <= 0) {
    return {
      elapsedSeconds: 0,
      aMultiplier: 1.0,
      bMultiplier: getFormationMultiplierB(save.formationLevel),
      cMultiplier: getCharacterBonus(save.equippedCharacterId, save.companionLevel),
      dustReward: 0,
      ashAwarded: false,
      requestId: `zero_${nowUtcMs}`,
    };
  }

  const h_eff = (elapsedSeconds + (save.breathCarrySeconds || 0)) / 3600;
  const aMultiplier = calculateFactorA(h_eff);
  const bMultiplier = getFormationMultiplierB(save.formationLevel);
  const cMultiplier = getCharacterBonus(save.equippedCharacterId, save.companionLevel);

  // r = 1 dust / second
  // Gross = r * d * A * B * (1 + C)
  const rawDust = 1.0 * elapsedSeconds * aMultiplier * bMultiplier * (1 + cMultiplier);
  const dustReward = Math.floor(rawDust);

  const ashAwarded = isAshEligible(save.lastAshClaimUtcMs, nowUtcMs);
  const requestId = `claim_${nowUtcMs}_${elapsedSeconds}`;

  return {
    elapsedSeconds,
    aMultiplier,
    bMultiplier,
    cMultiplier,
    dustReward,
    ashAwarded,
    requestId,
  };
}

/**
 * Creates frozen settlement snapshot upon player login
 */
export function createSettlementSnapshot(save: GameSaveState, nowUtcMs: number): FrozenSettlementSnapshot | null {
  const result = calculateOfflineReward(save, nowUtcMs);
  if (result.elapsedSeconds <= 0 || result.dustReward <= 0) {
    return null;
  }
  return {
    startUtcMs: save.lastClaimUtcMs,
    endUtcMs: nowUtcMs,
    elapsedSeconds: result.elapsedSeconds,
    computedReward: result.dustReward,
    aMultiplier: result.aMultiplier,
    bMultiplier: result.bMultiplier,
    cMultiplier: result.cMultiplier,
    requestId: result.requestId,
    ashAwarded: result.ashAwarded,
  };
}
