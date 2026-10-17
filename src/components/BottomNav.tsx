/**
 * Stardust Breath Garden - Bottom Navigation Bar (底部导航架构)
 * Clean, responsive, glassmorphic navigation bar with active indicators and badges
 */

import React from 'react';
import { Language, CharacterId } from '../types/game';
import { getTranslation } from '../i18n/translations';
import { sound } from '../engine/audio';
import { CHARACTERS } from '../data/characters';
import {
  Rocket,
  Grid3X3,
  Users,
  BookOpen,
  Landmark,
  Settings,
} from 'lucide-react';

export type NavTab = 'VOYAGE' | 'MATRIX' | 'COMPANIONS' | 'COMPENDIUM' | 'SANCTUM' | 'SETTINGS';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  lang: Language;
  mergeablePairsCount: number;
  equippedCharacterId: CharacterId;
  repairedAreaCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  lang,
  mergeablePairsCount,
  equippedCharacterId,
  repairedAreaCount,
}) => {
  const activeChar = CHARACTERS[equippedCharacterId];

  const navItems = [
    {
      id: 'VOYAGE' as NavTab,
      labelKey: 'navVoyage',
      icon: Rocket,
      badge: null,
    },
    {
      id: 'MATRIX' as NavTab,
      labelKey: 'navMatrix',
      icon: Grid3X3,
      badge: mergeablePairsCount > 0 ? mergeablePairsCount : null,
      badgeColor: 'bg-purple-500 text-white',
    },
    {
      id: 'COMPANIONS' as NavTab,
      labelKey: 'navCompanions',
      icon: Users,
      badge: activeChar.symbol,
      badgeColor: 'bg-cyan-500 text-slate-950 font-bold',
    },
    {
      id: 'COMPENDIUM' as NavTab,
      labelKey: 'navCompendium',
      icon: BookOpen,
      badge: null,
    },
    {
      id: 'SANCTUM' as NavTab,
      labelKey: 'navSanctum',
      icon: Landmark,
      badge: `${repairedAreaCount}/3`,
      badgeColor: 'bg-emerald-600/80 text-emerald-100',
    },
    {
      id: 'SETTINGS' as NavTab,
      labelKey: 'navSettings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <nav className="relative z-30 w-full bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/90 shadow-[0_-5px_30px_rgba(0,0,0,0.8)] select-none">
      <div className="max-w-4xl mx-auto px-2 sm:px-4 flex items-center justify-around py-1.5 sm:py-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (!isActive) {
                  sound.playClick();
                  onSelectTab(item.id);
                }
              }}
              className={`relative flex flex-col items-center justify-center py-1 px-2 sm:px-4 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-cyan-300 scale-105'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              {/* Active glow pill background */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/15 to-transparent rounded-xl border-b-2 border-cyan-400"></div>
              )}

              {/* Icon Container with optional badge */}
              <div className="relative mb-0.5">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]' : 'text-slate-400'
                  }`}
                />

                {/* Badge indicator */}
                {item.badge !== null && (
                  <span
                    className={`absolute -top-1.5 -right-2 px-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full text-[9px] font-mono shadow-sm ${
                      item.badgeColor || 'bg-cyan-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] sm:text-[11px] tracking-wider font-medium font-sans ${
                  isActive ? 'font-bold text-cyan-200' : 'text-slate-400'
                }`}
              >
                {getTranslation(lang, item.labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
