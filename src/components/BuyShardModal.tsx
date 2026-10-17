/**
 * Stardust Breath Garden - Purchase Glimmer Shards Modal (R_SHARD_BUY)
 * 1,000 stardust per unit into materials pouch
 */

import React, { useState } from 'react';
import { GameSaveState, Language } from '../types/game';
import { getTranslation } from '../i18n/translations';
import { Sun, X, Plus, Minus } from 'lucide-react';
import { sound } from '../engine/audio';

interface BuyShardModalProps {
  save: GameSaveState;
  lang: Language;
  onBuy: (count: number) => void;
  onClose: () => void;
}

export const BuyShardModal: React.FC<BuyShardModalProps> = ({
  save,
  lang,
  onBuy,
  onClose,
}) => {
  const currentDust = BigInt(save.dust || '0');
  const currentShards = save.materials.glimmer;
  const maxCanHold = 999 - currentShards;
  const maxAffordable = Number(currentDust / 1000n);
  const maxPossible = Math.min(maxAffordable, maxCanHold);

  const [count, setCount] = useState<number>(Math.min(1, maxPossible));

  const handleConfirm = () => {
    if (maxPossible <= 0) {
      sound.playShatter();
      return;
    }
    if (count <= 0 || count > maxPossible) return;
    sound.playCollect();
    onBuy(count);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-950/95 border border-amber-500/50 rounded-2xl shadow-[0_0_50px_rgba(251,191,36,0.25)] p-6 text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-800">
          <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-300">
            <Sun className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide font-['Cinzel','Noto_Serif_SC']">
              {getTranslation(lang, 'buyShardTitle')}
            </h2>
            <p className="text-xs text-slate-400">{getTranslation(lang, 'buyShardDesc')}</p>
          </div>
        </div>

        {/* Price & Balance */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2 mb-5 font-mono text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">{getTranslation(lang, 'buyShardPrice')}:</span>
            <span className="text-amber-300 font-bold">1,000 星尘 / 个</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">{getTranslation(lang, 'availableDust')}:</span>
            <span className="text-cyan-300 font-bold tabular-nums">{currentDust.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">当前持有微光碎片:</span>
            <span className="text-amber-200 font-bold tabular-nums">{currentShards}/999</span>
          </div>
        </div>

        {/* Count Selector */}
        {maxPossible > 0 ? (
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => setCount(Math.max(1, count - 1))}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-2xl font-bold font-mono text-amber-200 w-16 text-center tabular-nums">
                {count}
              </span>
              <button
                onClick={() => setCount(Math.min(maxPossible, count + 1))}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-center space-x-2">
              {[1, 2, 5, 10, maxPossible].filter((v, i, a) => v <= maxPossible && a.indexOf(v) === i).map((v) => (
                <button
                  key={v}
                  onClick={() => setCount(v)}
                  className={`px-3 py-1 rounded-md text-xs font-mono border transition ${
                    count === v
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {v === maxPossible ? `Max (${v})` : v}
                </button>
              ))}
            </div>

            <div className="text-center text-xs font-mono text-slate-400">
              应付星尘: <span className="text-cyan-300 font-bold tabular-nums">{(count * 1000).toLocaleString()}</span>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-red-300 text-xs text-center mb-6">
            {maxCanHold <= 0 ? '材料箱已满 (999/999)' : '星尘不足，每个需 1,000 星尘'}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-sm font-medium border border-slate-800 cursor-pointer"
          >
            {getTranslation(lang, 'cancel')}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 py-2.5 rounded-xl text-white text-sm font-bold tracking-wide shadow-lg transition cursor-pointer active:scale-95 ${
              maxPossible > 0
                ? 'bg-amber-600 hover:bg-amber-500 border border-amber-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700'
            }`}
            title={maxPossible <= 0 ? (maxCanHold <= 0 ? '材料箱已满' : '星尘不足') : '确认购买'}
          >
            {getTranslation(lang, 'buyShardConfirm')}
          </button>
        </div>
      </div>
    </div>
  );
};
