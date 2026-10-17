/**
 * Stardust Breath Garden - Condense Dust Modal
 * Converts account stardust into MERGE_DUST_1 on the 8x8 matrix
 */

import React, { useState } from 'react';
import { GameSaveState, Language } from '../types/game';
import { getTranslation } from '../i18n/translations';
import { Sparkles, X, Plus, Minus } from 'lucide-react';
import { sound } from '../engine/audio';

interface CondenseDustModalProps {
  save: GameSaveState;
  lang: Language;
  onCondense: (amount: number) => void;
  onClose: () => void;
}

export const CondenseDustModal: React.FC<CondenseDustModalProps> = ({
  save,
  lang,
  onCondense,
  onClose,
}) => {
  const currentDust = BigInt(save.dust || '0');
  const maxAffordable = Number(currentDust / 10n);
  const freeSlots = save.board.filter((s) => !s.itemId || s.stackCount <= 0).length;
  const existingDust1Capacity = save.board
    .filter((s) => s.itemId === 'MERGE_DUST_1')
    .reduce((sum, s) => sum + Math.max(0, 999 - s.stackCount), 0);
  const totalBoardCapacity = freeSlots * 999 + existingDust1Capacity;
  const maxPossible = Math.min(maxAffordable, totalBoardCapacity);

  const [amount, setAmount] = useState<number>(Math.min(1, maxPossible));

  const handleConfirm = () => {
    if (maxPossible <= 0) {
      sound.playShatter();
      return;
    }
    if (amount <= 0 || amount > maxPossible) return;
    sound.playCollect();
    onCondense(amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-950/95 border border-cyan-500/50 rounded-2xl shadow-[0_0_50px_rgba(56,189,248,0.25)] p-6 text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-800">
          <div className="p-2.5 bg-cyan-500/20 border border-cyan-500/40 rounded-xl text-cyan-300">
            <Sparkles className="w-6 h-6 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide font-['Cinzel','Noto_Serif_SC']">
              {getTranslation(lang, 'condenseTitle')}
            </h2>
            <p className="text-xs text-slate-400">{getTranslation(lang, 'condenseDesc')}</p>
          </div>
        </div>

        {/* Status Numbers */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2 mb-5 font-mono text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">{getTranslation(lang, 'availableDust')}:</span>
            <span className="text-cyan-300 font-bold tabular-nums">{currentDust.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">{getTranslation(lang, 'targetBoardSpaces')}:</span>
            <span className="text-slate-200 font-bold tabular-nums">{freeSlots}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-800/80">
            <span className="text-amber-400">{getTranslation(lang, 'maxCondense')}:</span>
            <span className="text-amber-300 font-bold tabular-nums">{maxPossible}</span>
          </div>
        </div>

        {/* Amount Selector */}
        {maxPossible > 0 ? (
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => setAmount(Math.max(1, amount - 1))}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-2xl font-bold font-mono text-cyan-200 w-16 text-center tabular-nums">
                {amount}
              </span>
              <button
                onClick={() => setAmount(Math.min(maxPossible, amount + 1))}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Quick buttons */}
            <div className="flex justify-center space-x-2">
              {[1, 5, 10, maxPossible].filter((v, i, a) => v <= maxPossible && a.indexOf(v) === i).map((v) => (
                <button
                  key={v}
                  onClick={() => setAmount(v)}
                  className={`px-3 py-1 rounded-md text-xs font-mono border transition ${
                    amount === v
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {v === maxPossible ? `Max (${v})` : v}
                </button>
              ))}
            </div>

            <div className="text-center text-xs font-mono text-slate-400">
              消耗星尘: <span className="text-cyan-300 font-bold tabular-nums">{amount * 10}</span>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-red-300 text-xs text-center mb-6">
            {freeSlots === 0 ? getTranslation(lang, 'boardFull') : getTranslation(lang, 'insufficientDust')}
          </div>
        )}

        {/* Buttons */}
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
                ? 'bg-cyan-600 hover:bg-cyan-500 border border-cyan-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700'
            }`}
            title={maxPossible <= 0 ? (freeSlots === 0 ? '星盘已满' : '星尘不足') : '确认凝聚'}
          >
            {getTranslation(lang, 'confirmCondense')}
          </button>
        </div>
      </div>
    </div>
  );
};
