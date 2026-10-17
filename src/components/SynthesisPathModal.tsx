/**
 * Stardust Breath Garden - Synthesis Pathway Modal (合成路径溯源面板)
 * Displays direct recipe, complete lineage tree, downstream evolution, and inventory check
 * Interactive: clicking any item node immediately shifts the inspector to that item!
 */

import React from 'react';
import { GameSaveState, ItemId, Language, RecipeDef } from '../types/game';
import { ITEMS } from '../data/items';
import { RECIPES } from '../data/recipes';
import { getTranslation } from '../i18n/translations';
import { sound } from '../engine/audio';
import { getRecipeStatus } from '../engine/board';
import {
  Sparkles,
  Sun,
  Flame,
  Gem,
  CircleDot,
  Disc,
  Zap,
  Diamond,
  Shield,
  Compass,
  Orbit,
  Crown,
  SunDim,
  SunMedium,
  Layers,
  Hourglass,
  Sprout,
  Award,
  Scroll,
  X,
  ArrowRight,
  GitFork,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  Wand2,
} from 'lucide-react';

interface SynthesisPathModalProps {
  itemId: ItemId;
  save: GameSaveState;
  lang: Language;
  onSelectItem: (itemId: ItemId) => void;
  onClose: () => void;
  onCraftRecipe?: (recipe: RecipeDef) => void;
  onOpenCondense?: () => void;
  onOpenBuyShard?: () => void;
}

export const SynthesisPathModal: React.FC<SynthesisPathModalProps> = ({
  itemId,
  save,
  lang,
  onSelectItem,
  onClose,
  onCraftRecipe,
  onOpenCondense,
  onOpenBuyShard,
}) => {
  const item = ITEMS[itemId] || ITEMS['RES_DUST'];

  const getIconComponent = (iconName: string, className: string) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles className={className} />;
      case 'Sun': return <Sun className={className} />;
      case 'Flame': return <Flame className={className} />;
      case 'Gem': return <Gem className={className} />;
      case 'CircleDot': return <CircleDot className={className} />;
      case 'Disc': return <Disc className={className} />;
      case 'Zap': return <Zap className={className} />;
      case 'Diamond': return <Diamond className={className} />;
      case 'Shield': return <Shield className={className} />;
      case 'Compass': return <Compass className={className} />;
      case 'Orbit': return <Orbit className={className} />;
      case 'Crown': return <Crown className={className} />;
      case 'SunDim': return <SunDim className={className} />;
      case 'SunMedium': return <SunMedium className={className} />;
      case 'Layers': return <Layers className={className} />;
      case 'Hourglass': return <Hourglass className={className} />;
      case 'Sprout': return <Sprout className={className} />;
      case 'Award': return <Award className={className} />;
      case 'Scroll': return <Scroll className={className} />;
      default: return <Sparkles className={className} />;
    }
  };

  // Inventory count (including stacked counts)
  const onBoardCount = save.board
    .filter((s) => s.itemId === itemId)
    .reduce((sum, s) => sum + (s.stackCount || 1), 0);
  let inPouchCount = 0;
  if (itemId === 'MAT_GLIMMER') inPouchCount = save.materials.glimmer;
  if (itemId === 'MAT_ASH') inPouchCount = save.materials.ash;
  if (itemId === 'MAT_CRYSTAL') inPouchCount = save.materials.crystal;
  if (itemId === 'RES_DUST') inPouchCount = Number(BigInt(save.dust || '0'));

  // Recipes that produce this item
  const directProducingRecipes = RECIPES.filter((r) => r.output.itemId === itemId);

  // Recipes that consume this item
  const downstreamRecipes = RECIPES.filter((r) =>
    r.inputs.some((inp) => inp.itemId === itemId)
  );

  // Build ancestral chain for Dust Mass tiers
  const getLineageChain = (id: ItemId): ItemId[] => {
    const chain: ItemId[] = [];
    if (id.startsWith('MERGE_DUST_')) {
      const tier = parseInt(id.replace('MERGE_DUST_', ''), 10);
      for (let t = 1; t <= tier; t++) {
        chain.push(`MERGE_DUST_${t}` as ItemId);
      }
    } else if (id.startsWith('MERGE_GLIMMER_')) {
      const tier = parseInt(id.replace('MERGE_GLIMMER_', ''), 10);
      chain.push('MAT_GLIMMER');
      for (let t = 1; t <= tier; t++) {
        chain.push(`MERGE_GLIMMER_${t}` as ItemId);
      }
    } else if (id === 'OBJ_GLIMMER_CORE') {
      chain.push('MAT_GLIMMER', 'MERGE_GLIMMER_1', 'MERGE_GLIMMER_2', 'MERGE_GLIMMER_3', 'OBJ_GLIMMER_CORE');
    } else if (id === 'OBJ_RESONANCE_ARRAY') {
      chain.push('MERGE_DUST_5', 'OBJ_GLIMMER_CORE', 'MAT_CRYSTAL', 'OBJ_RESONANCE_ARRAY');
    } else if (id === 'OBJ_BREATH_CORE') {
      chain.push('MERGE_DUST_6', 'MAT_ASH', 'MAT_CRYSTAL', 'OBJ_BREATH_CORE');
    } else if (id === 'OBJ_GARDEN_SEED') {
      chain.push('MERGE_DUST_7', 'MAT_GLIMMER', 'OBJ_GARDEN_SEED');
    } else if (id === 'OBJ_STAR_RELIC') {
      chain.push('MERGE_DUST_8', 'OBJ_BREATH_CORE', 'MAT_CRYSTAL', 'OBJ_STAR_RELIC');
    }
    return chain;
  };

  const lineageChain = getLineageChain(itemId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-950/98 border border-cyan-500/60 rounded-2xl shadow-[0_0_60px_rgba(56,189,248,0.25)] p-5 sm:p-6 text-slate-200 max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-800">
          <div className="p-2.5 bg-cyan-500/20 border border-cyan-500/40 rounded-xl text-cyan-300">
            <GitFork className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide font-['Cinzel','Noto_Serif_SC']">
              {getTranslation(lang, 'synthesisPathTitle')}
            </h2>
            <p className="text-xs text-slate-400">{getTranslation(lang, 'synthesisPathSubtitle')}</p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Target Item Hero Banner */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg flex-shrink-0"
                style={{
                  backgroundColor: item.color + '25',
                  borderColor: item.color + '70',
                  color: item.color,
                  boxShadow: `0 0 16px ${item.glowColor}`,
                }}
              >
                {getIconComponent(item.icon, 'w-8 h-8')}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {getTranslation(lang, item.nameKey)}
                  </h3>
                  {item.tier && (
                    <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/50 text-cyan-300 text-[10px] font-mono font-bold">
                      {item.tier}{getTranslation(lang, 'tierLabel')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  {getTranslation(lang, item.descKey)}
                </p>
                {item.dustValue && (
                  <div className="text-[11px] text-cyan-300 font-mono mt-1">
                    {getTranslation(lang, 'itemEquivalentDust')}: <strong>{item.dustValue}</strong> 星尘
                  </div>
                )}
              </div>
            </div>

            {/* Current Inventory Tag */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800 text-xs font-mono">
              <span className="text-slate-400 text-[10px] uppercase tracking-wider">
                {getTranslation(lang, 'currentInventoryStatus')}
              </span>
              <div className="flex items-center space-x-2 sm:space-x-0 sm:flex-col sm:items-end text-right">
                {item.type !== 'material' && item.type !== 'resource' && (
                  <span className="text-cyan-200 font-bold">
                    {getTranslation(lang, 'inBoardSlots', { count: onBoardCount })}
                  </span>
                )}
                {(item.type === 'material' || item.type === 'resource') && (
                  <span className="text-amber-300 font-bold">
                    {getTranslation(lang, 'inMaterialPouch', { count: inPouchCount })}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Upstream Ancestor Breadcrumb Chain */}
          {lineageChain.length > 1 && (
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
              <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>{getTranslation(lang, 'upstreamLineage')}</span>
              </div>

              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs font-mono">
                {lineageChain.map((chainItemId, idx) => {
                  const chainItem = ITEMS[chainItemId];
                  const isCurrent = chainItemId === itemId;

                  return (
                    <React.Fragment key={chainItemId}>
                      {idx > 0 && <span className="text-slate-600 font-bold">→</span>}
                      <button
                        onClick={() => {
                          sound.playClick();
                          onSelectItem(chainItemId);
                        }}
                        className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border transition whitespace-nowrap ${
                          isCurrent
                            ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 font-bold shadow-[0_0_10px_rgba(56,189,248,0.3)]'
                            : 'bg-slate-900/80 border-slate-700/70 text-slate-400 hover:text-white hover:border-slate-500'
                        }`}
                      >
                        <span style={{ color: chainItem.color }}>●</span>
                        <span>{getTranslation(lang, chainItem.nameKey)}</span>
                        {chainItem.tier && <span className="text-[10px] text-slate-500 font-bold">T{chainItem.tier}</span>}
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 1: How to Obtain / Direct Synthesis Recipe */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
              {getTranslation(lang, 'howToObtain')}
            </h4>

            {/* Special Source Notes */}
            {itemId === 'RES_DUST' && (
              <div className="p-3 bg-cyan-950/30 border border-cyan-500/40 rounded-xl text-xs text-slate-300 leading-relaxed">
                🌌 <strong>离线溯息自然析出</strong>：基础产速 $r=1$ 星尘/秒。随离线时长提升 A(h) 系数，在线凝形提升 B(L) 乘数，星灵提供 C 加成。
              </div>
            )}

            {itemId === 'MERGE_DUST_1' && (
              <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-2">
                  <span className="text-cyan-300 font-bold">10 × 星尘 (RES_DUST)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-white font-bold">{getTranslation(lang, item.nameKey)} ×1</span>
                </div>
                {onOpenCondense && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onOpenCondense();
                      onClose();
                    }}
                    className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition"
                  >
                    {getTranslation(lang, 'condenseDirectBtn')}
                  </button>
                )}
              </div>
            )}

            {itemId === 'MAT_GLIMMER' && (
              <div className="p-3 bg-amber-950/20 border border-amber-500/40 rounded-xl space-y-2 text-xs">
                <p className="text-slate-300">
                  ✨ <strong>来源 1</strong>: 首次合成【星尘团 III】时作为一次性里程碑奖励自动赐予 2 个。
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                  <span className="text-amber-300 font-mono">来源 2: 消耗 1,000 星尘购入 1 个</span>
                  {onOpenBuyShard && (
                    <button
                      onClick={() => {
                        sound.playClick();
                        onOpenBuyShard();
                        onClose();
                      }}
                      className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition"
                    >
                      前往购买
                    </button>
                  )}
                </div>
              </div>
            )}

            {itemId === 'MAT_ASH' && (
              <div className="p-3 bg-orange-950/30 border border-orange-500/40 rounded-xl text-xs text-orange-200 space-y-1">
                <div className="font-bold text-orange-300">⏳ 时空流转沉淀 (MAT_ASH)</div>
                <p className="text-slate-300 leading-relaxed">
                  每距上次发放达到 <strong>72,000 秒（20小时）</strong>，并在上线有效领取星尘时赐予 1 个；新存档首个有效领取立即获得 1 个。
                </p>
              </div>
            )}

            {itemId === 'MAT_CRYSTAL' && (
              <div className="p-3 bg-purple-950/30 border border-purple-500/40 rounded-xl text-xs text-purple-200 space-y-1">
                <div className="font-bold text-purple-300">💎 凝形空间结晶 (MAT_CRYSTAL)</div>
                <p className="text-slate-300 leading-relaxed">
                  在星盘上首次突破合成 <strong>星尘团 IV (阶4)</strong>、<strong>星尘团 VI (阶6)</strong>、<strong>星尘团 VIII (阶8)</strong> 时各赠予 1 枚（全存档共 3 枚，精准对应法阵、晶核、遗物配方消耗）。
                </p>
              </div>
            )}

            {/* Direct Recipe Box */}
            {directProducingRecipes.map((recipe) => {
              const status = getRecipeStatus(save, recipe, lang);

              return (
                <div
                  key={recipe.id}
                  className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col gap-2.5 text-xs font-mono transition hover:border-slate-700"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-2 flex-wrap">
                      {/* Inputs */}
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        {recipe.inputs.map((inp, idx) => {
                          const inpItem = ITEMS[inp.itemId];
                          const req = status.items[idx];
                          const isSatisfied = req ? req.isSatisfied : false;
                          const currentVal = req ? req.current : 0;

                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                sound.playClick();
                                onSelectItem(inp.itemId);
                              }}
                              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border cursor-pointer transition ${
                                isSatisfied
                                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 hover:border-cyan-400 text-slate-200'
                                  : 'bg-red-950/30 hover:bg-red-900/40 border-red-500/40 hover:border-red-400 text-red-200'
                              }`}
                              title={`点击查看【${getTranslation(lang, inpItem.nameKey)}】获取途径（需求 ${inp.count}，现有 ${currentVal}）`}
                            >
                              <span style={{ color: inpItem.color }}>●</span>
                              <span className="underline decoration-dotted underline-offset-2">
                                {getTranslation(lang, inpItem.nameKey)}
                              </span>
                              <span className={`font-bold ml-1 ${isSatisfied ? 'text-emerald-300' : 'text-amber-300'}`}>
                                ({currentVal}/{inp.count} {isSatisfied ? '✓' : '✗'})
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <ArrowRight className="w-4 h-4 text-cyan-400 flex-shrink-0" />

                      {/* Output */}
                      <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/60 text-cyan-200 font-bold shadow-sm">
                        <span>{getTranslation(lang, item.nameKey)}</span>
                        <span>×{recipe.output.count}</span>
                      </div>
                    </div>

                    {/* XP & Quick Craft action */}
                    <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end flex-shrink-0">
                      <span className="text-purple-400 font-bold">+{recipe.formationXp} XP</span>
                      {onCraftRecipe && (
                        <button
                          onClick={() => {
                            onCraftRecipe(recipe);
                          }}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer active:scale-95 ${
                            status.canCraft
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-900/50 animate-pulse border border-indigo-400/60'
                              : 'bg-slate-800 hover:bg-slate-700/80 text-amber-300 border border-amber-500/40 hover:border-amber-400 shadow-sm'
                          }`}
                          title={status.canCraft ? '原料已齐全，点击开始共鸣制作' : `${status.primaryMissingReason}（点击获取指引）`}
                        >
                          <Wand2 className="w-3.5 h-3.5" />
                          <span>{status.canCraft ? getTranslation(lang, 'craftNowBtn') : '材料不足 (点击引导)'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Guidance Line */}
                  <div className="pt-2 border-t border-slate-800/80 text-[11px] flex flex-wrap items-center justify-between gap-1.5">
                    {status.canCraft ? (
                      <span className="text-emerald-300 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>原料充足，点击【{getTranslation(lang, 'craftNowBtn')}】即可在星盘共鸣生成！</span>
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

          {/* Section 2: Downstream Recipes (Where this item is used) */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
              {getTranslation(lang, 'downstreamUsage')}
            </h4>

            {downstreamRecipes.length > 0 ? (
              <div className="space-y-2">
                {downstreamRecipes.map((recipe) => {
                  const outItem = ITEMS[recipe.output.itemId];
                  const otherInputs = recipe.inputs.filter((i) => i.itemId !== itemId);

                  return (
                    <div
                      key={recipe.id}
                      onClick={() => {
                        sound.playClick();
                        onSelectItem(recipe.output.itemId);
                      }}
                      className="p-3 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/60 rounded-xl flex items-center justify-between text-xs font-mono cursor-pointer transition"
                    >
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="text-slate-400">作为原料合成:</span>
                        <div className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-white font-bold">
                          <span style={{ color: outItem.color }}>★</span>
                          <span className="text-cyan-200">{getTranslation(lang, outItem.nameKey)}</span>
                        </div>

                        {otherInputs.length > 0 && (
                          <span className="text-[11px] text-slate-400">
                            (需额外: {otherInputs.map((oi) => `${getTranslation(lang, ITEMS[oi.itemId].nameKey)}×${oi.count}`).join(' + ')})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-1 text-cyan-400 text-[11px]">
                        <span>查看该产物</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/60 text-xs text-slate-400 font-mono">
                {getTranslation(lang, 'noDownstream')}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Hint */}
        <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>{getTranslation(lang, 'clickNodeToInspect')}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-700 transition"
          >
            {getTranslation(lang, 'cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};
