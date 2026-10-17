/**
 * Stardust Breath Garden - Compendium & Recipe Forge
 * Item encyclopedia and direct recipe execution
 */

import React, { useState } from 'react';
import { GameSaveState, ItemId, Language, RecipeDef } from '../types/game';
import { ITEMS } from '../data/items';
import { RECIPES } from '../data/recipes';
import { getTranslation } from '../i18n/translations';
import {
  BookOpen,
  X,
  Sparkles,
  Check,
  Lock,
  ArrowRight,
  Wand2,
  GitFork,
  AlertCircle,
  HelpCircle,
  Sun,
  SunDim,
  Flame,
  Gem,
  Compass,
  Layers,
  Hourglass,
  Sprout,
  Crown,
  Scroll,
} from 'lucide-react';
import { sound } from '../engine/audio';
import { getRecipeStatus } from '../engine/board';

interface CompendiumModalProps {
  save: GameSaveState;
  lang: Language;
  onCraftRecipe: (recipe: RecipeDef) => void;
  onClose: () => void;
  onViewItemPath: (itemId: ItemId) => void;
  isInline?: boolean;
}

export const CompendiumModal: React.FC<CompendiumModalProps> = ({
  save,
  lang,
  onCraftRecipe,
  onClose,
  onViewItemPath,
  isInline = false,
}) => {
  const [activeTab, setActiveTab] = useState<'ITEMS' | 'RECIPES' | 'MILESTONES'>('ITEMS');

  const allItemIds = Object.keys(ITEMS) as ItemId[];

  const getIconComponent = (iconName: string, className: string) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles className={className} />;
      case 'Sun': return <Sun className={className} />;
      case 'SunDim': return <SunDim className={className} />;
      case 'Flame': return <Flame className={className} />;
      case 'Gem': return <Gem className={className} />;
      case 'Compass': return <Compass className={className} />;
      case 'Layers': return <Layers className={className} />;
      case 'Hourglass': return <Hourglass className={className} />;
      case 'Sprout': return <Sprout className={className} />;
      case 'Crown': return <Crown className={className} />;
      case 'Scroll': return <Scroll className={className} />;
      default: return <Sparkles className={className} />;
    }
  };

  const modalBody = (
    <div className={`relative w-full max-w-3xl bg-slate-950/95 border border-indigo-500/50 rounded-2xl shadow-[0_0_50px_rgba(99,102,241,0.25)] p-5 sm:p-6 text-slate-200 ${isInline ? 'mx-auto' : 'max-h-[90vh]'} flex flex-col`}>
      {!isInline && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      )}

        {/* Header */}
        <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-800">
          <div className="p-2.5 bg-indigo-500/20 border border-indigo-500/40 rounded-xl text-indigo-300">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide font-['Cinzel','Noto_Serif_SC']">
              {getTranslation(lang, 'compendiumTitle')}
            </h2>
            <p className="text-xs text-slate-400">{getTranslation(lang, 'compendiumDesc')}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-4 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('ITEMS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition ${
              activeTab === 'ITEMS'
                ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            {getTranslation(lang, 'tabItems')} ({save.discoveredItemIds.length}/{allItemIds.length})
          </button>
          <button
            onClick={() => setActiveTab('RECIPES')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition ${
              activeTab === 'RECIPES'
                ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            {getTranslation(lang, 'tabRecipes')} ({RECIPES.length})
          </button>
          <button
            onClick={() => setActiveTab('MILESTONES')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition ${
              activeTab === 'MILESTONES'
                ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            {getTranslation(lang, 'tabMilestones')}
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* Items Tab */}
          {activeTab === 'ITEMS' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {allItemIds.map((itemId) => {
                const item = ITEMS[itemId];
                const isDiscovered = save.discoveredItemIds.includes(itemId);

                // Calculate current owned quantity
                const onBoard = save.board
                  .filter((s) => s.itemId === itemId)
                  .reduce((sum, s) => sum + (s.stackCount || 1), 0);
                let inPouch = 0;
                if (itemId === 'MAT_GLIMMER') inPouch = save.materials.glimmer || 0;
                if (itemId === 'MAT_ASH') inPouch = save.materials.ash || 0;
                if (itemId === 'MAT_CRYSTAL') inPouch = save.materials.crystal || 0;
                const totalOwned = onBoard + inPouch;

                return (
                  <div
                    key={itemId}
                    onClick={() => {
                      sound.playClick();
                      onViewItemPath(itemId);
                    }}
                    className={`p-3 rounded-xl border transition cursor-pointer hover:border-cyan-500/60 ${
                      isDiscovered
                        ? 'bg-slate-900/60 border-slate-800 hover:bg-slate-850'
                        : 'bg-slate-950/40 border-slate-900 opacity-60 hover:opacity-100'
                    }`}
                    title="点击查看合成路径"
                  >
                    <div className="flex items-center space-x-2.5 mb-2">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center border border-slate-700/60 shadow-sm flex-shrink-0"
                        style={{
                          backgroundColor: isDiscovered ? item.color + '20' : '#1e293b',
                          borderColor: isDiscovered ? item.color + '50' : undefined,
                        }}
                      >
                        {isDiscovered ? (
                          <div style={{ color: item.color }}>
                            {getIconComponent(item.icon, 'w-5 h-5')}
                          </div>
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white hover:text-cyan-300 underline decoration-slate-700 hover:decoration-cyan-400 truncate">
                            {isDiscovered ? getTranslation(lang, item.nameKey) : getTranslation(lang, 'undiscoveredStatus')}
                          </h4>
                          <GitFork className="w-3 h-3 text-cyan-400 flex-shrink-0 ml-1" />
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] font-mono">
                          {item.tier && (
                            <span style={{ color: item.color }} className="font-semibold">
                              {item.tier}{getTranslation(lang, 'tierLabel')}
                            </span>
                          )}
                          {isDiscovered && (
                            <span className={totalOwned > 0 ? 'text-amber-300 font-bold' : 'text-slate-500'}>
                              {lang === 'zh-CN' ? `持有: ${totalOwned}` : `Owned: ${totalOwned}`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-3">
                      {isDiscovered ? getTranslation(lang, item.descKey) : '？？？'}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Recipes Tab */}
          {activeTab === 'RECIPES' && (
            <div className="space-y-3">
              {RECIPES.map((recipe) => {
                const outputItem = ITEMS[recipe.output.itemId];
                const status = getRecipeStatus(save, recipe, lang);

                return (
                  <div
                    key={recipe.id}
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2.5 transition hover:border-slate-700"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      {/* Ingredients -> Product */}
                      <div className="flex items-center space-x-2.5 text-xs font-mono flex-wrap">
                        {/* Inputs */}
                        <div className="flex items-center space-x-1.5 flex-wrap">
                          {recipe.inputs.map((inp, idx) => {
                            const item = ITEMS[inp.itemId];
                            const req = status.items[idx];
                            const isSatisfied = req ? req.isSatisfied : false;
                            const currentVal = req ? req.current : 0;

                            return (
                              <button
                                key={idx}
                                onClick={() => {
                                  sound.playClick();
                                  onViewItemPath(inp.itemId);
                                }}
                                className={`px-2 py-1 rounded border flex items-center space-x-1 cursor-pointer transition ${
                                  isSatisfied
                                    ? 'bg-slate-850 hover:bg-slate-800 border-slate-700 hover:border-cyan-400 text-slate-200'
                                    : 'bg-red-950/30 hover:bg-red-900/40 border-red-500/40 hover:border-red-400 text-red-200'
                                }`}
                                title={`点击查看【${getTranslation(lang, item.nameKey)}】获取途径（需求 ${inp.count}，现有 ${currentVal}）`}
                              >
                                <span className="underline decoration-dotted">{getTranslation(lang, item.nameKey)}</span>
                                <span className={`font-bold ml-1 ${isSatisfied ? 'text-emerald-300' : 'text-amber-300'}`}>
                                  ({currentVal}/{inp.count} {isSatisfied ? '✓' : '✗'})
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        <ArrowRight className="w-4 h-4 text-cyan-400 flex-shrink-0" />

                        {/* Output */}
                        <button
                          onClick={() => {
                            sound.playClick();
                            onViewItemPath(recipe.output.itemId);
                          }}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded font-bold border hover:scale-105 cursor-pointer transition shadow-sm"
                          style={{
                            color: outputItem.color,
                            backgroundColor: outputItem.color + '15',
                            borderColor: outputItem.color + '40',
                          }}
                          title="点击查看产物完整演化谱系"
                        >
                          <span className="underline decoration-dotted">{getTranslation(lang, outputItem.nameKey)}</span>
                          <GitFork className="w-3 h-3 ml-0.5 opacity-80" />
                        </button>
                      </div>

                      {/* XP & Action */}
                      <div className="flex items-center space-x-3 w-full sm:w-auto justify-end flex-shrink-0">
                        <span className="text-xs font-mono text-purple-400 font-bold">+{recipe.formationXp} XP</span>
                        <button
                          onClick={() => {
                            onCraftRecipe(recipe);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide flex items-center space-x-1.5 transition cursor-pointer active:scale-95 ${
                            status.canCraft
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-900/50 animate-pulse border border-indigo-400/60'
                              : 'bg-slate-800 hover:bg-slate-700/80 text-amber-300 border border-amber-500/40 hover:border-amber-400 shadow-sm'
                          }`}
                          title={status.canCraft ? '材料已齐全，点击开始共鸣制作' : `${status.primaryMissingReason}（点击获取指引）`}
                        >
                          <Wand2 className="w-3.5 h-3.5" />
                          <span>{status.canCraft ? getTranslation(lang, 'recipeCraftBtn') : '材料不足 (点击引导)'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Status & Guidance Tip Line */}
                    <div className="pt-2 border-t border-slate-800/80 text-[11px] flex flex-wrap items-center justify-between gap-1.5 font-mono">
                      {status.canCraft ? (
                        <span className="text-emerald-300 flex items-center space-x-1">
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>材料充足，点击【{getTranslation(lang, 'recipeCraftBtn')}】即可在星盘共鸣生成！</span>
                        </span>
                      ) : (
                        <div className="flex items-center space-x-1.5 text-amber-300/90 flex-wrap">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                          <span className="text-amber-300 font-medium">{status.primaryMissingReason}</span>
                          <span className="text-slate-400">· {status.guidanceTip}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Milestones Tab */}
          {activeTab === 'MILESTONES' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-white text-sm mb-1">首次合成星尘团 III (Tier 3)</h4>
                  <p className="text-slate-400 text-xs">赐予微光碎片 ×2，并唤醒星灵【凝形旅者 · 诺里】</p>
                </div>
                {save.discoveredItemIds.includes('MERGE_DUST_3') ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">已达成</span>
                ) : (
                  <span className="text-slate-500">未达成</span>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-white text-sm mb-1">首次合成星尘团 IV (Tier 4)</h4>
                  <p className="text-slate-400 text-xs">赐予【凝形结晶】×1（用于构筑法阵）</p>
                </div>
                {save.discoveredItemIds.includes('MERGE_DUST_4') ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">已达成</span>
                ) : (
                  <span className="text-slate-500">未达成</span>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-white text-sm mb-1">首次制作凝形法阵 (Array)</h4>
                  <p className="text-slate-400 text-xs">解锁棋盘【批量合成】机能，并唤醒星灵【维拉】</p>
                </div>
                {save.discoveredItemIds.includes('OBJ_RESONANCE_ARRAY') ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">已达成</span>
                ) : (
                  <span className="text-slate-500">未达成</span>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-white text-sm mb-1">修缮溯息深庭 (Area 3)</h4>
                  <p className="text-slate-400 text-xs">唤醒守护神灵【奥林】，开启终局星辰遗物配方</p>
                </div>
                {save.repairedAreaIds.includes('AREA_03') ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">已达成</span>
                ) : (
                  <span className="text-slate-500">未达成</span>
                )}
              </div>
            </div>
          )}
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
