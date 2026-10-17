/**
 * Stardust Breath Garden - Settings & Archives Modal
 * Conforming strictly to PRD Section 10.1 & 10.2
 */

import React, { useRef, useState } from 'react';
import { GameSaveState, Language } from '../types/game';
import { getTranslation } from '../i18n/translations';
import { Settings, X, Volume2, Globe, Download, Upload, RotateCcw, HelpCircle, CheckCircle2, FastForward } from 'lucide-react';
import { sound } from '../engine/audio';

interface SettingsModalProps {
  save: GameSaveState;
  lang: Language;
  onUpdateSettings: (newSettings: GameSaveState['settings']) => void;
  onImportSave: (saveData: string) => void;
  onResetSave: () => void;
  onClose: () => void;
  isInline?: boolean;
  onOpenTestRunner?: () => void;
  onOpenTimeTravel?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  save,
  lang,
  onUpdateSettings,
  onImportSave,
  onResetSave,
  onClose,
  isInline = false,
  onOpenTestRunner,
  onOpenTimeTravel,
}) => {
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleExport = () => {
    sound.playClick();
    const dataStr = JSON.stringify(save, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stardust_garden_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        onImportSave(text);
        sound.playLevelUp();
      } catch (err) {
        setImportError('Invalid save format');
      }
    };
    reader.readAsText(file);
  };

  const modalBody = (
    <div className={`relative w-full max-w-xl bg-slate-950/95 border border-slate-700/80 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] p-5 sm:p-6 text-slate-200 ${isInline ? 'mx-auto' : 'max-h-[90vh] overflow-y-auto'}`}>
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
          <div className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-300">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide font-['Cinzel','Noto_Serif_SC']">
              {getTranslation(lang, 'settingsTitle')}
            </h2>
            <p className="text-xs text-slate-400">PRD v1.2 · 规范闭环与存档管理</p>
          </div>
        </div>

        {/* Audio & Display */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 mb-4 space-y-4">
          <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
            {getTranslation(lang, 'soundSettings')}
          </h3>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <span>{getTranslation(lang, 'bgmVolume')}</span>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={save.settings.soundVolume}
                onChange={(e) => {
                  const vol = parseFloat(e.target.value);
                  sound.setVolume(vol);
                  onUpdateSettings({ ...save.settings, soundVolume: vol });
                }}
                className="w-28 accent-cyan-400 cursor-pointer"
              />
              <span className="font-mono text-cyan-200 w-8 text-right">
                {Math.round(save.settings.soundVolume * 100)}%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              <span>{getTranslation(lang, 'langToggle')}</span>
            </div>
            <div className="flex space-x-1.5">
              <button
                onClick={() => onUpdateSettings({ ...save.settings, language: 'zh-CN' })}
                className={`px-2.5 py-1 rounded-md text-xs font-mono transition ${
                  lang === 'zh-CN'
                    ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-200'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                简体中文
              </button>
              <button
                onClick={() => onUpdateSettings({ ...save.settings, language: 'en-US' })}
                className={`px-2.5 py-1 rounded-md text-xs font-mono transition ${
                  lang === 'en-US'
                    ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-200'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>

        {/* Data Persistence & Backups */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 mb-4 space-y-3">
          <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
            {getTranslation(lang, 'dataManagement')}
          </h3>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExport}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>{copied ? '已导出！' : getTranslation(lang, 'exportSave')}</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span>{getTranslation(lang, 'importSave')}</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />

            <button
              onClick={() => {
                if (window.confirm(getTranslation(lang, 'resetConfirm'))) {
                  sound.playClick();
                  onResetSave();
                }
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-mono border border-red-500/40 transition ml-auto"
            >
              <RotateCcw className="w-3.5 h-3.5 text-red-400" />
              <span>{getTranslation(lang, 'resetSave')}</span>
            </button>
          </div>

          {importError && <p className="text-xs text-red-400 font-mono">{importError}</p>}
        </div>

        {/* Developer Diagnostics & Chrono Warp */}
        {(onOpenTimeTravel || onOpenTestRunner) && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 mb-4 space-y-3">
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
              <FastForward className="w-3.5 h-3.5" />
              <span>开发与调试工具 / Dev Tools</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {onOpenTimeTravel && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenTimeTravel();
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-mono transition"
                >
                  <FastForward className="w-3.5 h-3.5" />
                  <span>{getTranslation(lang, 'timeTravelNav')}</span>
                </button>
              )}
              {onOpenTestRunner && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenTestRunner();
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-mono transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{getTranslation(lang, 'testRunnerNav')}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* PRD Rules Help */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-cyan-300 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>{getTranslation(lang, 'offlineRulesHelp')}</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            {getTranslation(lang, 'offlineExplanation')}
          </p>
        </div>
      </div>
  );

  if (isInline) {
    return modalBody;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      {modalBody}
    </div>
  );
};
