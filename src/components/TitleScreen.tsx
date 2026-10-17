/**
 * Stardust Breath Garden - Title Screen
 * Conforming strictly to Game Shell requirements:
 * Bespoke inline SVG title lockup, 30-40% negative space, primary start CTA (Enter/Space), flat control hint
 */

import React, { useEffect } from 'react';
import { Language } from '../types/game';
import { getTranslation } from '../i18n/translations';
import { Sparkles, Volume2, VolumeX, Globe } from 'lucide-react';
import { sound } from '../engine/audio';

interface TitleScreenProps {
  onStart: () => void;
  lang: Language;
  onToggleLang: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  hasSaveData: boolean;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStart,
  lang,
  onToggleLang,
  soundEnabled,
  onToggleSound,
  hasSaveData,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        sound.playCollect();
        onStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStart]);

  return (
    <div
      onClick={() => {
        sound.playCollect();
        onStart();
      }}
      className="relative z-10 w-full h-screen flex flex-col justify-between items-center px-6 py-10 cursor-pointer select-none overflow-hidden"
    >
      {/* Top utility bar */}
      <div
        className="w-full max-w-5xl flex justify-between items-center text-xs text-slate-400 font-mono tracking-wider"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-2 bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/50">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>{getTranslation(lang, 'version')}</span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleLang}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lang === 'zh-CN' ? 'English' : '中文'}</span>
          </button>

          <button
            onClick={onToggleSound}
            className="p-2 rounded-full bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* Hero Centerpiece: Bespoke SVG Title Lockup */}
      <div className="flex flex-col items-center text-center max-w-2xl my-auto">
        {/* Animated Sacred Seal Emblem */}
        <div className="relative mb-8 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-2xl animate-pulse"></div>
          <svg className="w-28 h-28 text-cyan-300 drop-shadow-[0_0_25px_rgba(56,189,248,0.45)]" viewBox="0 0 100 100" fill="none">
            {/* Outer Octagram */}
            <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" opacity="0.6" />
            <polygon points="50,6 63,37 94,50 63,63 50,94 37,63 6,50 37,37" stroke="currentColor" strokeWidth="1.2" opacity="0.8" />
            {/* Inner Sacred Star */}
            <polygon points="50,18 59,41 82,50 59,59 50,82 41,59 18,50 41,41" stroke="#facc15" strokeWidth="1" opacity="0.9" fill="rgba(250, 204, 21, 0.05)" />
            {/* Core Luminescence */}
            <circle cx="50" cy="50" r="6" fill="#67e8f9" />
            <circle cx="50" cy="50" r="14" stroke="#c084fc" strokeWidth="0.8" opacity="0.5" />
          </svg>
        </div>

        {/* Title Lockup */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-300 font-['Cinzel','Noto_Serif_SC'] drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] mb-3">
          {getTranslation(lang, 'gameTitle')}
        </h1>

        <p className="text-sm md:text-base text-cyan-200/80 tracking-widest font-light uppercase mb-10 font-sans">
          {getTranslation(lang, 'gameSubtitle')}
        </p>

        {/* Start CTA */}
        <div className="group relative inline-flex items-center justify-center">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 opacity-60 blur-lg group-hover:opacity-100 transition duration-300"></div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              sound.playCollect();
              onStart();
            }}
            className="relative px-8 py-3.5 rounded-full bg-slate-950/90 border border-cyan-400/60 hover:border-cyan-300 text-white font-medium text-base md:text-lg tracking-wider shadow-[0_0_20px_rgba(56,189,248,0.25)] flex items-center space-x-3 transition-transform transform hover:scale-105"
          >
            <Sparkles className="w-5 h-5 text-cyan-300 animate-spin" style={{ animationDuration: '6s' }} />
            <span>{hasSaveData ? getTranslation(lang, 'continueJourney') : getTranslation(lang, 'startJourney')}</span>
          </button>
        </div>

        <p className="mt-5 text-xs text-slate-400 animate-pulse tracking-wide font-mono">
          {getTranslation(lang, 'pressAnyKey')}
        </p>
      </div>

      {/* Bottom Flat Control Hint */}
      <div className="w-full text-center pb-2">
        <div className="inline-block bg-slate-900/60 backdrop-blur-md px-6 py-2 rounded-full border border-slate-800 text-slate-400 text-xs font-mono tracking-wider">
          {getTranslation(lang, 'controlHint')}
        </div>
      </div>
    </div>
  );
};
