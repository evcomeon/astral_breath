/**
 * Stardust Breath Garden - 8x8 Synthesis Board
 * Features:
 * - Rich Item Descriptions on both Click (Inspector Panel) and Hover (Floating Tooltip)
 * - One-Click Synthesis (一键合成 / Quick Auto-Merge) with live pair counter
 * - Desktop drag-and-drop & mobile tap-to-merge
 * - Materials pouch and quick shard shop
 */

import React, { useState } from 'react';
import { BoardSlot, GameSaveState, ItemId, Language } from '../types/game';
import { ITEMS } from '../data/items';
import { RECIPES } from '../data/recipes';
import { getTranslation } from '../i18n/translations';
import { sound } from '../engine/audio';
import { countMergeablePairs } from '../engine/board';
import {
  Sparkles,
  Sun,
  Flame,
  Gem,
  Plus,
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
  Wand2,
  X,
  ArrowRight,
  Info,
  ArrowUpDown,
  GitFork,
} from 'lucide-react';

interface BoardViewProps {
  save: GameSaveState;
  lang: Language;
  onSlotClick: (index: number) => void;
  onSlotDrop: (fromIndex: number, toIndex: number) => void;
  selectedSlotIndex: number | null;
  onBuyGlimmerShard: () => void;
  onQuickMerge: () => void;
  onDeselect: () => void;
  onViewItemPath: (itemId: ItemId) => void;
  onSortBoard: () => void;
  autoSortEnabled?: boolean;
  onToggleAutoSort?: () => void;
  onCondense?: (amount: number) => void;
}

export const BoardView: React.FC<BoardViewProps> = ({
  save,
  lang,
  onSlotClick,
  onSlotDrop,
  selectedSlotIndex,
  onBuyGlimmerShard,
  onQuickMerge,
  onDeselect,
  onViewItemPath,
  onSortBoard,
  autoSortEnabled = true,
  onToggleAutoSort,
  onCondense,
}) => {
  const [draggedSlot, setDraggedSlot] = useState<number | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

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

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!save.board[index].itemId) return;
    setDraggedSlot(index);
    e.dataTransfer.setData('text/plain', String(index));
    sound.playClick();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromIndex = draggedSlot !== null ? draggedSlot : parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (!isNaN(fromIndex) && fromIndex !== toIndex) {
      onSlotDrop(fromIndex, toIndex);
    }
    setDraggedSlot(null);
  };

  const freeSlotsCount = save.board.filter((s) => !s.itemId).length;
  const mergeablePairsCount = countMergeablePairs(save.board);

  // Selected item inspector details
  const selectedSlot = selectedSlotIndex !== null ? save.board[selectedSlotIndex] : null;
  const selectedItem = selectedSlot && selectedSlot.itemId ? ITEMS[selectedSlot.itemId] : null;

  // Count instances of selected item on board (total stacked quantity)
  const selectedItemCountOnBoard = selectedItem
    ? save.board
        .filter((s) => s.itemId === selectedItem.id)
        .reduce((sum, s) => sum + (s.stackCount || 1), 0)
    : 0;

  // Recipe lookup for next tier
  const getNextTierRecipe = (itemId: ItemId) => {
    return RECIPES.find((r) => r.inputs.length === 1 && r.inputs[0].itemId === itemId);
  };

  return (
    <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center justify-center p-2 sm:p-3 select-none">
      {/* Top Board Meta & One-Click Merge Bar */}
      <div className="w-full flex flex-wrap items-center justify-between text-xs text-slate-400 mb-2 font-mono px-2 gap-2">
        <div className="flex items-center space-x-2">
          <span className="text-cyan-400 font-bold tracking-wider">{getTranslation(lang, 'boardTitle')}</span>
          <span className="text-slate-600">|</span>
          <span>
            {getTranslation(lang, 'boardEmptySlots')}: <strong className="text-slate-200">{freeSlotsCount}/64</strong>
          </span>
        </div>

        {/* Action Buttons: Auto-Sort Toggle, Quick Sort, and One-Click Synthesis */}
        <div className="flex flex-wrap items-center space-x-2 gap-y-1">
          {/* Auto-Sort Toggle (默认等级由高到低) */}
          {onToggleAutoSort && (
            <button
              onClick={() => {
                sound.playClick();
                onToggleAutoSort();
              }}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide border transition shadow-sm ${
                autoSortEnabled
                  ? 'bg-cyan-950/80 border-cyan-500/70 text-cyan-200 shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                  : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-300'
              }`}
              title="星盘自动排序：默认等级由高到低。开启后每次合成或凝聚将自动规整高等级道具在前"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  autoSortEnabled ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'
                }`}
              />
              <span className="hidden sm:inline">
                {autoSortEnabled
                  ? lang === 'zh-CN'
                    ? '自动排序: 开启 (高到低)'
                    : 'Auto-Sort: ON (High-Low)'
                  : lang === 'zh-CN'
                  ? '自动排序: 关闭'
                  : 'Auto-Sort: OFF'}
              </span>
              <span className="sm:hidden">
                {autoSortEnabled ? '自动: 开' : '自动: 关'}
              </span>
            </button>
          )}

          {/* Quick Manual Sort Button (由高到低) */}
          <button
            onClick={() => {
              sound.playClick();
              onSortBoard();
            }}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/60 text-slate-200 transition shadow-sm"
            title="将星盘所有道具立即按等级从高到低规整排序"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">{getTranslation(lang, 'sortBoardBtn')}</span>
            <span className="sm:hidden">排序</span>
          </button>

          {/* One-Click Synthesis (一键合成) Prominent Action Button */}
          <button
            onClick={() => {
              if (mergeablePairsCount > 0) {
                sound.playMerge(3);
                onQuickMerge();
              } else {
                sound.playClick();
                onQuickMerge();
              }
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition shadow-lg cursor-pointer ${
              mergeablePairsCount > 0
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border border-purple-400/80 shadow-[0_0_15px_rgba(168,85,247,0.35)] animate-pulse'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-300 border border-slate-700/60'
            }`}
            title={mergeablePairsCount > 0 ? '点击一键合成所有同级道具' : '当前暂无可合并的同级道具（点击获取提示）'}
          >
            <Wand2 className="w-3.5 h-3.5 text-purple-200" />
            <span>{getTranslation(lang, 'quickMergeBtn')}</span>
            {mergeablePairsCount > 0 ? (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-purple-400/30 text-purple-200 text-[10px] font-mono border border-purple-300/40">
                {getTranslation(lang, 'quickMergePairs', { count: mergeablePairsCount })}
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 hidden sm:inline">
                ({getTranslation(lang, 'quickMergeEmpty')})
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Quick Condense Helper Strip on Top of Board */}
      {onCondense && (
        <div className="w-full mb-2 px-3 py-1.5 bg-slate-950/60 backdrop-blur-md border border-slate-800/80 rounded-xl flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-2 text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>{getTranslation(lang, 'condenseBtn')}:</span>
            <span className="text-cyan-300 font-bold tabular-nums">
              {BigInt(save.dust || '0').toLocaleString()} 星尘
            </span>
          </div>

          <div className="flex items-center space-x-1">
            {[1, 5, 10].map((amt) => {
              const cost = BigInt(amt * 10);
              const dust1Capacity =
                freeSlotsCount * 999 +
                save.board
                  .filter((s) => s.itemId === 'MERGE_DUST_1')
                  .reduce((sum, s) => sum + Math.max(0, 999 - s.stackCount), 0);
              const canAfford = BigInt(save.dust || '0') >= cost && dust1Capacity >= amt;
              return (
                <button
                  key={amt}
                  onClick={() => {
                    sound.playClick();
                    onCondense(amt);
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer active:scale-95 ${
                    canAfford
                      ? 'bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border border-slate-800 hover:border-slate-700'
                  }`}
                  title={
                    canAfford
                      ? `消耗 ${amt * 10} 星尘生成 ${amt} 个星尘团 I`
                      : BigInt(save.dust || '0') < cost
                      ? `星尘不足（需要 ${amt * 10} 星尘，点击查看提示）`
                      : `星盘容纳已满（需要 ${amt} 空间，点击查看提示）`
                  }
                >
                  +{amt}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Item Description Inspector Banner (When an item is clicked) */}
      {selectedItem && (
        <div className="w-full mb-3 p-3 bg-slate-950/90 border border-cyan-500/70 rounded-xl shadow-[0_0_25px_rgba(56,189,248,0.2)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs backdrop-blur-xl animate-in fade-in duration-200">
          <div className="flex items-start sm:items-center space-x-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner flex-shrink-0"
              style={{
                backgroundColor: selectedItem.color + '20',
                borderColor: selectedItem.color + '60',
                color: selectedItem.color,
              }}
            >
              {getIconComponent(selectedItem.icon, 'w-6 h-6')}
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    sound.playClick();
                    onViewItemPath(selectedItem.id);
                  }}
                  className="font-bold text-white text-sm hover:text-cyan-300 underline decoration-cyan-500/50 underline-offset-4 flex items-center space-x-1 cursor-pointer transition text-left"
                  title="点击查看合成路径"
                >
                  <span>{getTranslation(lang, selectedItem.nameKey)}</span>
                  <span className="text-[10px] text-cyan-400 font-mono font-normal">🔗 查看路径</span>
                </button>
                {selectedItem.tier && (
                  <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono">
                    {selectedItem.tier}{getTranslation(lang, 'tierLabel')}
                  </span>
                )}
                <span className="text-[11px] text-slate-400 font-mono">
                  {getTranslation(lang, 'totalOnBoard')}: <strong className="text-cyan-300">{selectedItemCountOnBoard}</strong>
                  {selectedSlot && (
                    <span className="ml-2 text-amber-300 font-semibold">
                      (本格: {selectedSlot.stackCount || 1}/999)
                    </span>
                  )}
                </span>
              </div>

              {/* Complete Description */}
              <p className="text-slate-300 text-[11px] leading-relaxed max-w-xl">
                {getTranslation(lang, selectedItem.descKey)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-center flex-shrink-0">
            {/* Target next tier hint */}
            {(() => {
              const nextRecipe = getNextTierRecipe(selectedItem.id);
              if (nextRecipe) {
                const nextItem = ITEMS[nextRecipe.output.itemId];
                return (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onViewItemPath(nextItem.id);
                    }}
                    className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-700/60 hover:border-cyan-500/50 text-[11px] text-slate-300 font-mono cursor-pointer transition text-left"
                    title="点击查看进阶道具合成路径"
                  >
                    <span className="text-slate-400">{getTranslation(lang, 'nextTierTarget')}:</span>
                    <span style={{ color: nextItem.color }} className="font-semibold underline decoration-dotted">
                      {getTranslation(lang, nextItem.nameKey)}
                    </span>
                    <span className="text-purple-400">(+{nextRecipe.formationXp}XP)</span>
                  </button>
                );
              }
              return (
                <span className="hidden md:inline text-[11px] text-amber-400 font-mono">
                  {getTranslation(lang, 'maxTierReached')}
                </span>
              );
            })()}

            {/* Deselect button */}
            <button
              onClick={onDeselect}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs transition"
            >
              <X className="w-3.5 h-3.5" />
              <span>{getTranslation(lang, 'deselectBtn')}</span>
            </button>
          </div>
        </div>
      )}

      {/* The 8x8 Grid Container */}
      <div className="relative p-2 sm:p-3 bg-slate-950/80 backdrop-blur-xl border border-slate-800/90 rounded-2xl shadow-[0_0_35px_rgba(0,0,0,0.8)]">
        <div className="grid grid-cols-8 gap-1 sm:gap-2">
          {save.board.map((slot, index) => {
            const item = slot.itemId ? ITEMS[slot.itemId] : null;
            const isSelected = selectedSlotIndex === index;
            const isHovered = hoveredSlot === index;
            const nextRecipe = item ? getNextTierRecipe(item.id) : null;
            const nextItem = nextRecipe ? ITEMS[nextRecipe.output.itemId] : null;

            // Determine if tooltip should appear above or below
            const isTopRow = Math.floor(index / 8) < 2;

            return (
              <div
                key={index}
                draggable={Boolean(slot.itemId)}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onClick={() => onSlotClick(index)}
                onMouseEnter={() => setHoveredSlot(index)}
                onMouseLeave={() => setHoveredSlot(null)}
                className={`relative w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  slot.itemId
                    ? 'bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 shadow-md'
                    : 'bg-slate-950/40 hover:bg-slate-900/40 border border-slate-800/40'
                } ${
                  isSelected
                    ? 'ring-2 ring-cyan-400 border-cyan-400 shadow-[0_0_18px_rgba(56,189,248,0.6)] scale-105 z-20'
                    : ''
                }`}
                style={{
                  boxShadow: item ? `inset 0 0 10px ${item.glowColor}, 0 0 12px ${item.glowColor}` : undefined,
                }}
              >
                {/* Item Icon Rendering */}
                {item && (
                  <div className="flex flex-col items-center justify-center pointer-events-none">
                    {/* Top-left subtle tier indicator */}
                    {item.tier && (
                      <span className="absolute top-0.5 left-1 text-[8px] sm:text-[9px] font-mono text-slate-400/80 leading-none select-none">
                        {item.tier}阶
                      </span>
                    )}

                    <div style={{ color: item.color }} className="transition-transform transform hover:scale-110">
                      {getIconComponent(item.icon, 'w-5 h-5 sm:w-7 sm:h-7')}
                    </div>

                    {/* Bottom-right quantity badge */}
                    <span
                      className="absolute bottom-0.5 right-0.5 px-1 min-w-[15px] h-[14px] flex items-center justify-center rounded bg-slate-950/90 border border-slate-700/70 text-[9px] sm:text-[10px] font-mono font-bold text-amber-200 drop-shadow-[0_1px_2px_rgba(0,0,0,1)] leading-none select-none z-10"
                      title={`数量: ${slot.stackCount || 1}`}
                    >
                      {slot.stackCount || 1}
                    </span>
                  </div>
                )}

                {/* Rich Hover Description Tooltip */}
                {isHovered && item && (
                  <div
                    className={`absolute ${
                      isTopRow ? 'top-full mt-2' : 'bottom-full mb-2'
                    } left-1/2 -translate-x-1/2 w-64 p-3 bg-slate-950/98 border border-cyan-500/70 rounded-xl shadow-2xl z-50 text-[11px] text-slate-200 pointer-events-none backdrop-blur-xl animate-in fade-in duration-150`}
                  >
                    {/* Tooltip Header */}
                    <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playClick();
                          onViewItemPath(item.id);
                        }}
                        className="flex items-center space-x-1.5 hover:text-cyan-300 pointer-events-auto cursor-pointer"
                        title="点击查看合成路径"
                      >
                        <span style={{ color: item.color }}>●</span>
                        <span className="font-bold text-cyan-300 underline decoration-cyan-500/40 underline-offset-2">
                          {getTranslation(lang, item.nameKey)}
                        </span>
                        <GitFork className="w-3 h-3 text-cyan-400" />
                      </button>
                      {item.tier ? (
                        <span className="px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono">
                          {item.tier}{getTranslation(lang, 'tierLabel')}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">造物</span>
                      )}
                    </div>

                    {/* Tooltip Description */}
                    <p className="text-slate-300 text-[11px] leading-relaxed mb-2 font-sans">
                      {getTranslation(lang, item.descKey)}
                    </p>

                    {/* Tooltip Stats / Next Target */}
                    <div className="pt-1.5 border-t border-slate-800/80 space-y-1 font-mono text-[10px] text-slate-400">
                      {/* Stack count */}
                      <div className="flex justify-between">
                        <span>{lang === 'zh-CN' ? '堆叠数量' : 'Stack count'}:</span>
                        <span className="text-amber-300 font-bold">{slot.stackCount || 1} / 999</span>
                      </div>
                      {item.dustValue && (
                        <div className="flex justify-between">
                          <span>{getTranslation(lang, 'itemEquivalentDust')}:</span>
                          <span className="text-cyan-300 font-bold">{item.dustValue} 星尘</span>
                        </div>
                      )}
                      {nextItem && nextRecipe && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            sound.playClick();
                            onViewItemPath(nextItem.id);
                          }}
                          className="flex justify-between items-center text-purple-300 w-full hover:underline pointer-events-auto cursor-pointer"
                          title="点击查看进阶道具合成路径"
                        >
                          <span>{getTranslation(lang, 'nextTierTarget')}:</span>
                          <span className="font-semibold">
                            {getTranslation(lang, nextItem.nameKey)} (+{nextRecipe.formationXp}XP)
                          </span>
                        </button>
                      )}
                      <div className="text-[9px] text-cyan-400 pt-1 text-center font-semibold">
                        点击名称弹出合成路径 · 拖拽合成/堆叠
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Materials Pouch Bar */}
      <div className="w-full mt-3 flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-950/70 backdrop-blur-md rounded-xl border border-slate-800/80">
        <div className="flex items-center space-x-3 sm:space-x-5 text-xs font-mono">
          {/* Glimmer Shards */}
          <button
            onClick={() => {
              sound.playClick();
              onViewItemPath('MAT_GLIMMER');
            }}
            className="flex items-center space-x-1.5 hover:text-white cursor-pointer transition text-left"
            title="点击查看微光碎片合成路径与获取方式"
          >
            <Sun className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400 hover:text-amber-300 underline decoration-slate-700 hover:decoration-amber-400 underline-offset-2">
              {getTranslation(lang, 'item_MAT_GLIMMER')}:
            </span>
            <span className="text-amber-200 font-bold tabular-nums">{save.materials.glimmer}/999</span>
          </button>

          {/* Spacetime Ash */}
          <button
            onClick={() => {
              sound.playClick();
              onViewItemPath('MAT_ASH');
            }}
            className="flex items-center space-x-1.5 hover:text-white cursor-pointer transition text-left"
            title="点击查看时空余烬合成路径与获取方式"
          >
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-slate-400 hover:text-orange-300 underline decoration-slate-700 hover:decoration-orange-400 underline-offset-2">
              {getTranslation(lang, 'item_MAT_ASH')}:
            </span>
            <span className="text-orange-200 font-bold tabular-nums">{save.materials.ash}/999</span>
          </button>

          {/* Formation Crystal */}
          <button
            onClick={() => {
              sound.playClick();
              onViewItemPath('MAT_CRYSTAL');
            }}
            className="flex items-center space-x-1.5 hover:text-white cursor-pointer transition text-left"
            title="点击查看凝形结晶合成路径与获取方式"
          >
            <Gem className="w-4 h-4 text-purple-400" />
            <span className="text-slate-400 hover:text-purple-300 underline decoration-slate-700 hover:decoration-purple-400 underline-offset-2">
              {getTranslation(lang, 'item_MAT_CRYSTAL')}:
            </span>
            <span className="text-purple-200 font-bold tabular-nums">{save.materials.crystal}/999</span>
          </button>
        </div>

        {/* Quick Shard Purchase Button (R_SHARD_BUY) */}
        <button
          onClick={() => {
            sound.playClick();
            onBuyGlimmerShard();
          }}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/40 text-amber-200 text-xs font-medium transition"
        >
          <Plus className="w-3 h-3 text-amber-400" />
          <span>{getTranslation(lang, 'buyShardTitle')}</span>
        </button>
      </div>
    </div>
  );
};
