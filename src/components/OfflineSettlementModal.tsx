/**
 * Stardust Breath Garden - Offline Settlement Modal
 * Conforming strictly to PRD Section 7 & 10.1
 */

import React from 'react';
import { GameSaveState, Language, FrozenSettlementSnapshot } from '../types/game';
import { getTranslation } from '../i18n/translations';
import { Sparkles, Hourglass, Flame, Check, ShieldAlert } from 'lucide-react';
import { sound } from '../engine/audio';
import { getAshCooldownRemainingSeconds } from '../engine/offline';

interface OfflineSettlementModalProps {
  save: GameSaveState;
  snapshot: FrozenSettlementSnapshot;
  lang: Language;
  onClaim: () => void;
  onClose: () => void;
}

export const OfflineSettlementModal: React.FC<OfflineSettlementModalProps> = ({
  save,
  snapshot,
  lang,
  onClaim,
  onClose,
}) => {
  const formatSeconds = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const cooldownRemainingSec = getAshCooldownRemainingSeconds(save.lastAshClaimUtcMs, snapshot.endUtcMs);
  const remainingHours = (cooldownRemainingSec / 3600).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-950/95 border border-cyan-500/50 rounded-2xl shadow-[0_0_50px_rgba(56,189,248,0.25)] p-6 text-slate-200">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-800">
          <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-300">
            <Hourglass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide font-['Cinzel','Noto_Serif_SC']">
              {getTranslation(lang, 'settlementTitle')}
            </h2>
            <p className="text-xs text-cyan-200/80">{getTranslation(lang, 'settlementSubtitle')}</p>
          </div>
        </div>

        {/* Calculation Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3 mb-5 font-mono text-sm">
          {/* Duration */}
          <div className="flex justify-between items-center pb-2 border-b border-slate-800/60">
            <span className="text-slate-400 text-xs">{getTranslation(lang, 'settlementOfflineDuration')}:</span>
            <span className="font-bold text-cyan-300 tabular-nums">{formatSeconds(snapshot.elapsedSeconds)}</span>
          </div>

          {/* Breakdown Items */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-amber-400">{getTranslation(lang, 'settlementFactorADetail')}:</span>
              <span className="font-bold text-white tabular-nums">{snapshot.aMultiplier.toFixed(4)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-400">{getTranslation(lang, 'settlementFactorBDetail')}:</span>
              <span className="font-bold text-white tabular-nums">{snapshot.bMultiplier.toFixed(2)} (Lv{save.formationLevel})</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-emerald-400">{getTranslation(lang, 'settlementFactorCDetail')}:</span>
              <span className="font-bold text-white tabular-nums">+{(snapshot.cMultiplier * 100).toFixed(1)}%</span>
            </div>
          </div>

          {/* Resulting Stardust */}
          <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
            <span className="text-cyan-400 text-xs font-semibold">{getTranslation(lang, 'settlementGrossDust')}:</span>
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span className="text-xl font-bold text-white tabular-nums">
                +{snapshot.computedReward.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Spacetime Ash Reward Notice */}
        <div className="mb-5 p-3 rounded-xl bg-orange-950/40 border border-orange-500/40 flex items-start space-x-3 text-xs">
          <Flame className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
          <div className="text-orange-200">
            <div className="font-semibold text-orange-300 mb-0.5">{getTranslation(lang, 'settlementAshStatus')}</div>
            {snapshot.ashAwarded ? (
              <p className="text-emerald-300 font-semibold">
                {save.lastAshClaimUtcMs <= 0
                  ? getTranslation(lang, 'settlementAshFirstGrant')
                  : getTranslation(lang, 'settlementAshEligible')}
              </p>
            ) : (
              <p className="text-slate-400">
                {getTranslation(lang, 'settlementAshInCooldown', { hours: remainingHours })}
              </p>
            )}
          </div>
        </div>

        {/* Freeze Notice */}
        <p className="text-[11px] text-slate-400 mb-5 leading-relaxed bg-slate-900/40 p-2.5 rounded-lg border border-slate-800">
          {getTranslation(lang, 'freezeNotice')}
        </p>

        {/* Claim Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              sound.playCollect();
              onClaim();
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold tracking-wider text-sm shadow-[0_0_20px_rgba(56,189,248,0.3)] transition transform hover:scale-[1.02] flex items-center justify-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>{getTranslation(lang, 'claimRewardBtn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
