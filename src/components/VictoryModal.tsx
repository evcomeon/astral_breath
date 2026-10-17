/**
 * Stardust Breath Garden - Victory Modal
 * Triggered upon forging the ultimate endgame artifact: OBJ_STAR_RELIC
 */

import React from 'react';
import { Language } from '../types/game';
import { getTranslation } from '../i18n/translations';
import { Award, Sparkles, Check } from 'lucide-react';
import { sound } from '../engine/audio';

interface VictoryModalProps {
  lang: Language;
  onClose: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ lang, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg">
      <div className="relative w-full max-w-lg bg-slate-950/95 border border-amber-500/60 rounded-3xl shadow-[0_0_80px_rgba(245,158,11,0.35)] p-8 text-center text-slate-200">
        <div className="relative mx-auto w-24 h-24 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400/20 to-purple-500/20 border border-amber-400/60 flex items-center justify-center shadow-inner">
            <Award className="w-10 h-10 text-amber-300 animate-bounce" />
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-100 to-amber-300 font-['Cinzel','Noto_Serif_SC'] mb-2">
          {getTranslation(lang, 'victoryTitle')}
        </h2>

        <p className="text-xs md:text-sm text-cyan-200/90 font-mono tracking-wider mb-5">
          {getTranslation(lang, 'victorySubtitle')}
        </p>

        <p className="text-xs text-slate-300 leading-relaxed mb-8 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          {getTranslation(lang, 'victoryDesc')}
        </p>

        <button
          onClick={() => {
            sound.playCollect();
            onClose();
          }}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold tracking-wider text-sm shadow-[0_0_25px_rgba(245,158,11,0.4)] transition transform hover:scale-[1.02] flex items-center justify-center space-x-2"
        >
          <Sparkles className="w-4 h-4 text-amber-200" />
          <span>{getTranslation(lang, 'continuePlaying')}</span>
        </button>
      </div>
    </div>
  );
};
