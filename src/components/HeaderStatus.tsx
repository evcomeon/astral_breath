/**
 * Stardust Breath Garden - Header HUD & Status Clusters
 * Low-occlusion, world-matched status bar with tabular-nums readouts
 */

import React, { useState } from 'react';
import { GameSaveState, Language, ActiveModal, ItemId } from '../types/game';
import { getTranslation } from '../i18n/translations';
import { calculateFactorA } from '../engine/offline';
import { getFormationMultiplierB } from '../engine/progression';
import { getCharacterBonus, CHARACTERS } from '../data/characters';
import {
  Sparkles,
  Users,
  BookOpen,
  Landmark,
  Settings,
  Volume2,
  VolumeX,
  Globe,
  Hourglass,
  Layers,
  ChevronDown,
  Info,
  CheckCircle2,
  Wand2,
} from 'lucide-react';
import { sound } from '../engine/audio';

interface HeaderStatusProps {
  save: GameSaveState;
  lang: Language;
  onOpenModal: (modal: ActiveModal) => void;
  onToggleSound: () => void;
  onToggleLang: () => void;
  onBatchMerge: () => void;
  canBatchMerge: boolean;
  hasUnclaimedOffline: boolean;
  onViewItemPath: (itemId: ItemId) => void;
}

export const HeaderStatus: React.FC<HeaderStatusProps> = ({
  save,
  lang,
  onOpenModal,
  onToggleSound,
  onToggleLang,
  onBatchMerge,
  canBatchMerge,
  hasUnclaimedOffline,
  onViewItemPath,
}) => {
  const [showFormulaTooltip, setShowFormulaTooltip] = useState(false);

  // Compute live breath duration & temporary A factor
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - save.lastClaimUtcMs) / 1000));
  const elapsedHours = elapsedSeconds / 3600;
  const factorA = calculateFactorA(elapsedHours);
  const factorB = getFormationMultiplierB(save.formationLevel);
  const factorC = getCharacterBonus(save.equippedCharacterId, save.companionLevel);
  const activeChar = CHARACTERS[save.equippedCharacterId];

  // Format breath elapsed time string
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const dustDisplay = BigInt(save.dust || '0').toLocaleString();

  return (
    <header className="relative z-20 w-full px-3 md:px-6 py-2.5 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-slate-200">
      {/* Left Cluster: Stardust Balance & Multipliers */}
      <div className="flex items-center space-x-3 md:space-x-5">
        {/* Stardust Resource Readout */}
        <button
          onClick={() => {
            sound.playClick();
            onViewItemPath('RES_DUST');
          }}
          className="flex items-center space-x-2 bg-slate-900/90 hover:bg-slate-800/90 px-3.5 py-1.5 rounded-full border border-cyan-500/30 hover:border-cyan-500/60 shadow-[0_0_12px_rgba(56,189,248,0.15)] cursor-pointer transition text-left"
          title="点击查看星尘沉淀机制与演化路径"
        >
          <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[10px] text-cyan-300/70 font-mono uppercase tracking-wider leading-none">
              {getTranslation(lang, 'accountDust')}
            </span>
            <span className="text-base md:text-lg font-bold font-mono text-cyan-100 tabular-nums leading-tight">
              {dustDisplay}
            </span>
          </div>
        </button>

        {/* Multipliers & Breath Efficiency Badge */}
        <div
          className="relative group cursor-pointer flex items-center space-x-2 bg-slate-900/60 hover:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/60 transition-colors"
          onClick={() => setShowFormulaTooltip(!showFormulaTooltip)}
        >
          <div className="flex items-center space-x-1.5 text-xs font-mono">
            <span className="text-amber-400 font-semibold tabular-nums">A: {factorA.toFixed(4)}</span>
            <span className="text-slate-500">·</span>
            <span className="text-purple-400 font-semibold tabular-nums">B: {factorB.toFixed(2)}</span>
            <span className="text-slate-500">·</span>
            <span className="text-emerald-400 font-semibold tabular-nums">C: +{(factorC * 100).toFixed(1)}%</span>
            <Info className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </div>

          {/* Detailed Formula Tooltip */}
          {showFormulaTooltip && (
            <div
              className="absolute top-full left-0 mt-2 w-80 p-3.5 bg-slate-900/95 border border-cyan-500/40 rounded-xl shadow-2xl z-50 text-xs backdrop-blur-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="font-semibold text-cyan-300 mb-1.5 pb-1 border-b border-slate-700/60 flex justify-between items-center">
                <span>{getTranslation(lang, 'multiplierBreakdown')}</span>
                <span className="text-[10px] text-slate-400 font-mono">{formatTime(elapsedSeconds)}</span>
              </div>
              <div className="space-y-1.5 text-slate-300 font-mono">
                <div className="flex justify-between">
                  <span className="text-amber-300">{getTranslation(lang, 'factorA')}:</span>
                  <span className="font-bold tabular-nums text-white">{factorA.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-300">{getTranslation(lang, 'factorB')}:</span>
                  <span className="font-bold tabular-nums text-white">{factorB.toFixed(2)} (Lv{save.formationLevel})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-300">{getTranslation(lang, 'factorC')}:</span>
                  <span className="font-bold tabular-nums text-white">+{(factorC * 100).toFixed(1)}% ({getTranslation(lang, activeChar.nameKey)})</span>
                </div>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-cyan-200/90 font-sans">
                  {getTranslation(lang, 'totalFormula')}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active Companion Avatar */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenModal('CHARACTERS');
          }}
          className="hidden lg:flex items-center space-x-2 bg-slate-900/60 hover:bg-slate-800/80 px-2.5 py-1.5 rounded-full border border-slate-700/60 text-xs"
        >
          <span
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-slate-950 font-bold"
            style={{ backgroundColor: activeChar.avatarColor }}
          >
            {activeChar.symbol}
          </span>
          <span className="text-slate-300 font-medium">{getTranslation(lang, activeChar.nameKey)}</span>
          <span className="text-[10px] text-slate-400 font-mono">Lv{save.companionLevel}</span>
        </button>
      </div>

      {/* Center/Right Action Clusters */}
      <div className="flex items-center space-x-2 md:space-x-2.5">
        {/* Condense Dust Button */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenModal('CONDENSE');
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/50 text-cyan-200 text-xs font-medium tracking-wide shadow-[0_0_10px_rgba(56,189,248,0.2)] transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>{getTranslation(lang, 'condenseBtn')}</span>
        </button>

        {/* Offline Settle Button (Flashing if unclaimed snapshot exists) */}
        <button
          onClick={() => {
            sound.playCollect();
            onOpenModal('SETTLEMENT');
          }}
          className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition border ${
            hasUnclaimedOffline
              ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-400/80 text-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.3)] animate-pulse'
              : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-300'
          }`}
        >
          <Hourglass className="w-3.5 h-3.5 text-amber-400" />
          <span>{getTranslation(lang, 'settleBtn')}</span>
          {hasUnclaimedOffline && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping"></span>
          )}
        </button>

        {/* Batch Merge Button (Unlocked with OBJ_RESONANCE_ARRAY) */}
        {canBatchMerge && (
          <button
            onClick={() => {
              sound.playMerge(4);
              onBatchMerge();
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-purple-950/70 hover:bg-purple-900/80 border border-purple-500/50 text-purple-200 text-xs font-medium tracking-wide shadow-[0_0_10px_rgba(168,85,247,0.2)] transition"
          >
            <Wand2 className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">{getTranslation(lang, 'batchMergeBtn')}</span>
            <span className="sm:hidden">批量</span>
          </button>
        )}

        {/* Navigation Dropdown / Buttons */}
        <div className="flex items-center space-x-1 border-l border-slate-800 pl-2">
          {/* Characters */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenModal('CHARACTERS');
            }}
            title={getTranslation(lang, 'charactersNav')}
            className="p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white"
          >
            <Users className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Compendium */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenModal('COMPENDIUM');
            }}
            title={getTranslation(lang, 'compendiumNav')}
            className="p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white"
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
          </button>

          {/* Areas */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenModal('AREAS');
            }}
            title={getTranslation(lang, 'areasNav')}
            className="p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white"
          >
            <Landmark className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Tests AT-001..028 */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenModal('TESTS');
            }}
            title={getTranslation(lang, 'testRunnerNav')}
            className="p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-700/60 text-emerald-400"
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenModal('SETTINGS');
            }}
            title={getTranslation(lang, 'settingsNav')}
            className="p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Language Switch */}
          <button
            onClick={onToggleLang}
            title={getTranslation(lang, 'langToggle')}
            className="px-2 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-700/60 text-xs font-mono text-slate-300 hover:text-white"
          >
            {lang === 'zh-CN' ? 'EN' : '中'}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={getTranslation(lang, 'soundToggle')}
            className="p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white"
          >
            {save.settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
