/**
 * Stardust Breath Garden - Astral Companions Modal
 * Strict implementation of PRD Section 5 (Single active slot, shared companion XP)
 */

import React from 'react';
import { CharacterId, GameSaveState, Language } from '../types/game';
import { CHARACTERS, COMPANION_XP_THRESHOLDS, getCharacterBonus } from '../data/characters';
import { getTranslation } from '../i18n/translations';
import { Users, X, Check, Lock, Sparkles, Heart } from 'lucide-react';
import { sound } from '../engine/audio';

interface CharactersModalProps {
  save: GameSaveState;
  lang: Language;
  onEquipCharacter: (id: CharacterId) => void;
  onClose: () => void;
  isInline?: boolean;
}

export const CharactersModal: React.FC<CharactersModalProps> = ({
  save,
  lang,
  onEquipCharacter,
  onClose,
  isInline = false,
}) => {
  const currentLevel = save.companionLevel;
  const currentXp = save.companionXp;
  const isMaxLevel = currentLevel >= 5;
  const nextThreshold = isMaxLevel ? 200 : COMPANION_XP_THRESHOLDS[currentLevel];
  const prevThreshold = COMPANION_XP_THRESHOLDS[currentLevel - 1];
  const xpInLevel = Math.max(0, currentXp - prevThreshold);
  const xpNeededInLevel = nextThreshold - prevThreshold;
  const progressPercent = isMaxLevel ? 100 : Math.min(100, Math.floor((xpInLevel / xpNeededInLevel) * 100));

  const characterList: CharacterId[] = ['CHR_LUMA', 'CHR_NORI', 'CHR_VELA', 'CHR_ORIN'];

  const modalBody = (
    <div className={`relative w-full max-w-2xl bg-slate-950/95 border border-cyan-500/50 rounded-2xl shadow-[0_0_50px_rgba(56,189,248,0.25)] p-5 sm:p-6 text-slate-200 ${isInline ? 'mx-auto' : 'max-h-[90vh] overflow-y-auto'}`}>
      {!isInline && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      )}

        {/* Header */}
        <div className="flex items-center space-x-3 mb-5 pb-3 border-b border-slate-800">
          <div className="p-2.5 bg-cyan-500/20 border border-cyan-500/40 rounded-xl text-cyan-300">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide font-['Cinzel','Noto_Serif_SC']">
              {getTranslation(lang, 'charactersTitle')}
            </h2>
            <p className="text-xs text-slate-400">{getTranslation(lang, 'charactersDesc')}</p>
          </div>
        </div>

        {/* Shared Companion XP & Level Banner */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 mb-5">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-pink-400 fill-pink-400/20" />
              <span className="text-sm font-semibold text-slate-200">
                {getTranslation(lang, 'companionLevel')}: <strong className="text-cyan-300 font-mono">Lv{currentLevel}</strong>
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {getTranslation(lang, 'companionSharedXp')}: <strong className="text-slate-200">{currentXp}/200</strong>
            </span>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex justify-between">
            <span>每次合成获得陪伴经验 = max(1, ⌊凝形经验/4⌋)</span>
            <span>{isMaxLevel ? getTranslation(lang, 'companionMaxLevel') : `升至 Lv${currentLevel + 1} 还需 ${nextThreshold - currentXp} XP`}</span>
          </div>
        </div>

        {/* Characters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-2">
          {characterList.map((charId) => {
            const char = CHARACTERS[charId];
            const isUnlocked = save.discoveredCharacterIds.includes(charId);
            const isEquipped = save.equippedCharacterId === charId;
            const currentBonus = getCharacterBonus(charId, currentLevel);

            return (
              <div
                key={charId}
                className={`relative p-4 rounded-xl border transition-all ${
                  isEquipped
                    ? 'bg-cyan-950/40 border-cyan-500/80 shadow-[0_0_20px_rgba(56,189,248,0.2)]'
                    : isUnlocked
                    ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/60 border-slate-900 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg text-slate-950 shadow-md"
                      style={{ backgroundColor: isUnlocked ? char.avatarColor : '#475569' }}
                    >
                      {char.symbol}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">{getTranslation(lang, char.nameKey)}</h3>
                      <p className="text-[11px] text-cyan-300/80">{getTranslation(lang, char.titleKey)}</p>
                    </div>
                  </div>

                  {isEquipped && (
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-semibold border border-cyan-400/40">
                      {getTranslation(lang, 'alreadyEquipped')}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                  {getTranslation(lang, char.descKey)}
                </p>

                {isUnlocked ? (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="text-xs font-mono">
                      <span className="text-slate-400">{getTranslation(lang, 'companionBonus')}: </span>
                      <strong className="text-emerald-400 font-bold">+{(currentBonus * 100).toFixed(1)}%</strong>
                    </div>

                    {!isEquipped && (
                      <button
                        onClick={() => {
                          sound.playCollect();
                          onEquipCharacter(charId);
                        }}
                        className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium shadow-sm transition"
                      >
                        {getTranslation(lang, 'equipButton')}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center space-x-1.5 text-xs text-amber-400/80 font-mono">
                    <Lock className="w-3.5 h-3.5" />
                    <span>{getTranslation(lang, char.unlockConditionKey)}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
  );

  if (isInline) {
    return (
      <div className="w-full h-full overflow-y-auto p-2 sm:p-4 animate-in fade-in duration-200">
        {modalBody}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      {modalBody}
    </div>
  );
};
