/**
 * Stardust Breath Garden - Bottom Navigation Bar (底部导航架构)
 * Features:
 * - Fluid tab switching between:
 *   1. 星际旅行 (Interstellar Voyage - Default Home with 3D starfield animation)
 *   2. 溯息星盘 (Astrolabe 8x8 Board & Condense)
 *   3. 造物图鉴 (Compendium & Forge Recipes)
 *   4. 星灵伴旅 (Astral Companions & Multiplier Buffs)
 *   5. 庭院重构 (Garden Realms & Area Restoration)
 *   6. 时空枢纽 (Chrono Warp, Test Runner, & Settings)
 * - Badges for mergeable pairs, unclaimed offline stardust, and compendium progress
 * - Low-occlusion, frosted glass cyberpunk-astral styling with tactile audio feedback
 */

import React from 'react';
import { Language } from '../types/game';
import { getTranslation } from '../i18n/translations';
import { sound } from '../engine/audio';
import {
  Rocket,
  Layers,
  BookOpen,
  Users,
  Landmark,
  Settings,
  Sparkles,
  Wand2,
} from 'lucide-react';

export type MainNavTab =
  | 'VOYAGE'
  | 'ASTROLABE'
  | 'COMPENDIUM'
  | 'COMPANIONS'
  | 'GARDEN'
  | 'SETTINGS';

interface BottomNavBarProps {
  currentTab: MainNavTab;
  onTabChange: (tab: MainNavTab) => void;
  lang: Language;
  mergeablePairsCount: number;
  hasUnclaimedOffline: boolean;
  discoveredCount: number;
  totalItemsCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onTabChange,
  lang,
  mergeablePairsCount,
  hasUnclaimedOffline,
  discoveredCount,
  totalItemsCount,
}) => {
  const tabs = [
    {
      id: 'VOYAGE' as MainNavTab,
      labelKey: 'navVoyage',
      fallbackLabel: '星际旅行',
      icon: Rocket,
      badge: hasUnclaimedOffline ? (
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
      ) : null,
    },
    {
      id: 'ASTROLABE' as MainNavTab,
      labelKey: 'navMatrix',
      fallbackLabel: '溯息星盘',
      icon: Layers,
      badge:
        mergeablePairsCount > 0 ? (
          <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full bg-purple-500 text-[10px] font-bold text-white shadow-md animate-pulse">
            {mergeablePairsCount}
          </span>
        ) : null,
    },
    {
      id: 'COMPENDIUM' as MainNavTab,
      labelKey: 'navCompendium',
      fallbackLabel: '造物图鉴',
      icon: BookOpen,
      badge: (
        <span className="hidden sm:inline-block ml-1 text-[9px] text-slate-400 font-mono">
          {discoveredCount}/{totalItemsCount}
        </span>
      ),
    },
    {
      id: 'COMPANIONS' as MainNavTab,
      labelKey: 'navCompanions',
      fallbackLabel: '星灵伴旅',
      icon: Users,
      badge: null,
    },
    {
      id: 'GARDEN' as MainNavTab,
      labelKey: 'navSanctum',
      fallbackLabel: '庭院界域',
      icon: Landmark,
      badge: null,
    },
    {
      id: 'SETTINGS' as MainNavTab,
      labelKey: 'navSettings',
      fallbackLabel: '时空枢纽',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-slate-950/90 backdrop-blur-2xl border-t border-slate-800/90 shadow-[0_-10px_35px_rgba(0,0,0,0.8)] px-2 sm:px-4 py-1.5 select-none">
      <div className="max-w-4xl mx-auto flex items-center justify-around">
        {tabs.map((t) => {
          const isActive = currentTab === t.id;
          const Icon = t.icon;
          const label = getTranslation(lang, t.labelKey as any) || t.fallbackLabel;

          return (
            <button
              key={t.id}
              onClick={() => {
                if (!isActive) {
                  sound.playClick();
                  onTabChange(t.id);
                }
              }}
              className={`relative flex flex-col items-center justify-center py-1 px-2 sm:px-3 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'text-cyan-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              {/* Active ambient glow bar */}
              {isActive && (
                <div className="absolute -top-1.5 w-8 h-1 rounded-full bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 shadow-[0_0_12px_rgba(56,189,248,0.8)]" />
              )}

              {/* Icon with relative badge */}
              <div className="relative my-0.5">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive
                      ? 'scale-110 text-cyan-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]'
                      : 'text-slate-400'
                  }`}
                />
                {t.badge}
              </div>

              {/* Label */}
              <span className="text-[10px] sm:text-[11px] tracking-wide font-sans mt-0.5">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
