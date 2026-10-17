/**
 * Stardust Breath Garden - Garden Areas Restoration Modal
 * Conforming strictly to PRD Section 9
 */

import React from 'react';
import { AreaId, GameSaveState, Language } from '../types/game';
import { AREAS } from '../data/areas';
import { ITEMS } from '../data/items';
import { getTranslation } from '../i18n/translations';
import { Landmark, X, Check, Lock, Sparkles } from 'lucide-react';
import { sound } from '../engine/audio';

import { ItemId } from '../types/game';

interface GardenAreasModalProps {
  save: GameSaveState;
  lang: Language;
  onRepairArea: (areaId: AreaId) => void;
  onClose: () => void;
  onViewItemPath: (itemId: ItemId) => void;
  isInline?: boolean;
}

export const GardenAreasModal: React.FC<GardenAreasModalProps> = ({
  save,
  lang,
  onRepairArea,
  onClose,
  onViewItemPath,
  isInline = false,
}) => {
  const currentDust = BigInt(save.dust || '0');
  const areaIds: AreaId[] = ['AREA_01', 'AREA_02', 'AREA_03'];

  const modalBody = (
    <div className={`relative w-full max-w-2xl bg-slate-950/95 border border-emerald-500/50 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.25)] p-5 sm:p-6 text-slate-200 ${isInline ? 'mx-auto' : 'max-h-[90vh] overflow-y-auto'}`}>
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
          <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide font-['Cinzel','Noto_Serif_SC']">
              {getTranslation(lang, 'areasTitle')}
            </h2>
            <p className="text-xs text-slate-400">{getTranslation(lang, 'areasDesc')}</p>
          </div>
        </div>

        {/* Area Cards */}
        <div className="space-y-4">
          {areaIds.map((areaId) => {
            const area = AREAS[areaId];
            const isRepaired = save.repairedAreaIds.includes(areaId);
            const reqItem = area.requiredItem ? ITEMS[area.requiredItem] : null;
            const hasReqItem = !area.requiredItem || save.discoveredItemIds.includes(area.requiredItem);
            const hasEnoughDust = currentDust >= BigInt(area.requiredDust);
            const canRepair = !isRepaired && hasReqItem && hasEnoughDust;

            return (
              <div
                key={areaId}
                className={`p-4 rounded-xl border transition-all ${
                  isRepaired
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : canRepair
                    ? 'bg-slate-900/80 border-cyan-500/60 shadow-[0_0_15px_rgba(56,189,248,0.15)]'
                    : 'bg-slate-950/60 border-slate-900 opacity-70'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    <h3 className="font-bold text-base text-white">{getTranslation(lang, area.nameKey)}</h3>
                  </div>

                  {isRepaired ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center space-x-1 border border-emerald-500/30">
                      <Check className="w-3.5 h-3.5" />
                      <span>{getTranslation(lang, 'areaRepaired')}</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs font-mono border border-slate-700">
                      {getTranslation(lang, 'areaLocked')}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 mb-2 leading-relaxed">
                  {getTranslation(lang, area.descKey)}
                </p>

                <div className="text-[11px] text-cyan-300/80 font-mono mb-3">
                  功能: {getTranslation(lang, area.featuresKey)}
                </div>

                {/* Repair Constraints & Action */}
                {!isRepaired && (
                  <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                    <div className="space-y-1">
                      {reqItem && (
                        <div className="flex items-center space-x-1.5">
                          <span className="text-slate-400">{getTranslation(lang, 'repairPrerequisite')}:</span>
                          <button
                            onClick={() => {
                              sound.playClick();
                              onViewItemPath(reqItem.id);
                            }}
                            className={`underline decoration-dotted hover:decoration-solid flex items-center space-x-1 cursor-pointer transition ${
                              hasReqItem ? 'text-emerald-300' : 'text-red-400'
                            }`}
                            title="点击查看前置造物合成路径"
                          >
                            <span>{getTranslation(lang, reqItem.nameKey)}</span>
                            <span>{hasReqItem ? '✓' : '✗'}</span>
                          </button>
                        </div>
                      )}
                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-400">{getTranslation(lang, 'repairCost')}:</span>
                        <span className={hasEnoughDust ? 'text-cyan-300' : 'text-red-400'}>
                          {area.requiredDust.toLocaleString()} 星尘 ({currentDust.toLocaleString()} 可用)
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onRepairArea(areaId);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider transition cursor-pointer active:scale-95 ${
                        canRepair
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/50'
                          : 'bg-slate-800 hover:bg-slate-700/80 text-amber-300 border border-amber-500/40 hover:border-amber-400'
                      }`}
                      title={
                        canRepair
                          ? '消耗星尘修缮界域并解禁机能'
                          : !hasReqItem
                          ? `缺少前置造物【${reqItem ? getTranslation(lang, reqItem.nameKey) : ''}】（点击获取指引）`
                          : `星尘不足（需要 ${area.requiredDust.toLocaleString()}，点击获取指引）`
                      }
                    >
                      {canRepair ? getTranslation(lang, 'repairButton') : '条件不足 (点击查看)'}
                    </button>
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
