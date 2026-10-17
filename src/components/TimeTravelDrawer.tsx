/**
 * Stardust Breath Garden - Chrono Warp (Time Travel Tester)
 * Allows developers and players to jump forward in offline time to test
 * A curve saturation, Spacetime Ash grants, and rollback defenses
 */

import React from 'react';
import { Language } from '../types/game';
import { getTranslation } from '../i18n/translations';
import { FastForward, X, Clock, AlertTriangle } from 'lucide-react';
import { sound } from '../engine/audio';

interface TimeTravelDrawerProps {
  lang: Language;
  onWarpTime: (seconds: number) => void;
  onSimulateRollback: () => void;
  onClose: () => void;
}

export const TimeTravelDrawer: React.FC<TimeTravelDrawerProps> = ({
  lang,
  onWarpTime,
  onSimulateRollback,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-950/95 border border-cyan-500/50 rounded-2xl shadow-[0_0_50px_rgba(56,189,248,0.25)] p-6 text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-800">
          <div className="p-2.5 bg-cyan-500/20 border border-cyan-500/40 rounded-xl text-cyan-300">
            <FastForward className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide font-['Cinzel','Noto_Serif_SC']">
              {getTranslation(lang, 'timeTravelTitle')}
            </h2>
            <p className="text-xs text-slate-400">{getTranslation(lang, 'timeTravelDesc')}</p>
          </div>
        </div>

        {/* Quick Warp Options */}
        <div className="space-y-2 mb-4 font-mono text-xs">
          <button
            onClick={() => {
              sound.playClick();
              onWarpTime(600);
            }}
            className="w-full p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-left flex items-center justify-between text-slate-300 hover:text-white transition"
          >
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>{getTranslation(lang, 'jump10Min')}</span>
            </div>
            <span className="text-[10px] text-slate-500">+600s</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onWarpTime(3600);
            }}
            className="w-full p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-left flex items-center justify-between text-slate-300 hover:text-white transition"
          >
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>{getTranslation(lang, 'jump1Hour')}</span>
            </div>
            <span className="text-[10px] text-amber-400">A≈1.1106</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onWarpTime(4 * 3600);
            }}
            className="w-full p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-left flex items-center justify-between text-slate-300 hover:text-white transition"
          >
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>{getTranslation(lang, 'jump4Hours')}</span>
            </div>
            <span className="text-[10px] text-amber-400">A≈1.3161</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onWarpTime(20 * 3600);
            }}
            className="w-full p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-left flex items-center justify-between text-slate-300 hover:text-white transition"
          >
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-orange-400" />
              <span>{getTranslation(lang, 'jump20Hours')}</span>
            </div>
            <span className="text-[10px] text-orange-400">余烬解冻</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onWarpTime(48 * 3600);
            }}
            className="w-full p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-left flex items-center justify-between text-slate-300 hover:text-white transition"
          >
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>{getTranslation(lang, 'jump48Hours')}</span>
            </div>
            <span className="text-[10px] text-cyan-300">A=1.5000</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onWarpTime(72 * 3600);
            }}
            className="w-full p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-left flex items-center justify-between text-slate-300 hover:text-white transition"
          >
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>{getTranslation(lang, 'jump72Hours')}</span>
            </div>
            <span className="text-[10px] text-cyan-300">无上限验证</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onWarpTime(100 * 365 * 24 * 3600);
            }}
            className="w-full p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-left flex items-center justify-between text-slate-300 hover:text-white transition"
          >
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>{getTranslation(lang, 'jump100Years')}</span>
            </div>
            <span className="text-[10px] text-purple-300">BigInt安全</span>
          </button>
        </div>

        {/* Clock Rollback Safeguard Trigger */}
        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={() => {
              sound.playClick();
              onSimulateRollback();
            }}
            className="w-full p-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 text-left flex items-center space-x-2 text-xs font-mono text-red-300 transition"
          >
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{getTranslation(lang, 'simulateClockRollback')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
