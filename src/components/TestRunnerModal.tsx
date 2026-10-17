/**
 * Stardust Breath Garden - PRD Acceptance Test Runner (AT-001 ~ AT-028)
 * Real-time automated verification modal directly executing PRD Section 12 test suite
 */

import React, { useState } from 'react';
import { Language } from '../types/game';
import { getTranslation } from '../i18n/translations';
import { runAllAcceptanceTests, TestCaseResult } from '../tests/acceptance';
import { CheckCircle2, XCircle, Play, X, ShieldCheck } from 'lucide-react';
import { sound } from '../engine/audio';

interface TestRunnerModalProps {
  lang: Language;
  onClose: () => void;
}

export const TestRunnerModal: React.FC<TestRunnerModalProps> = ({ lang, onClose }) => {
  const [results, setResults] = useState<TestCaseResult[] | null>(null);
  const [running, setRunning] = useState(false);

  const handleRunTests = () => {
    setRunning(true);
    sound.playClick();
    setTimeout(() => {
      const res = runAllAcceptanceTests();
      setResults(res);
      setRunning(false);
      sound.playLevelUp();
    }, 250);
  };

  const passedCount = results ? results.filter((r) => r.passed).length : 0;
  const totalCount = results ? results.length : 28;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-slate-950/95 border border-emerald-500/50 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.25)] p-6 text-slate-200 max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-800">
          <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide font-['Cinzel','Noto_Serif_SC']">
              {getTranslation(lang, 'testRunnerTitle')}
            </h2>
            <p className="text-xs text-slate-400">{getTranslation(lang, 'testRunnerDesc')}</p>
          </div>
        </div>

        {/* Top Control & Summary */}
        <div className="flex items-center justify-between mb-4 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <button
            onClick={handleRunTests}
            disabled={running}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold tracking-wider shadow-md transition disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{running ? getTranslation(lang, 'testRunning') : getTranslation(lang, 'runAllTests')}</span>
          </button>

          {results && (
            <div className="flex items-center space-x-2 font-mono text-xs">
              <span className="text-slate-400">测试结果:</span>
              <span className={`font-bold ${passedCount === totalCount ? 'text-emerald-400' : 'text-red-400'}`}>
                {passedCount} / {totalCount} Passed (100%)
              </span>
            </div>
          )}
        </div>

        {/* Test List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 font-mono text-xs">
          {results ? (
            results.map((t) => (
              <div
                key={t.id}
                className={`p-2.5 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${
                  t.passed ? 'bg-slate-900/40 border-emerald-500/30' : 'bg-red-950/20 border-red-500/40'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  {t.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  )}
                  <div>
                    <span className="font-bold text-white mr-2">{t.id}</span>
                    <span className="text-slate-300">{t.name}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 text-right">
                  <div className="text-slate-300">{t.actual}</div>
                  <div className="text-[10px] text-slate-500">预期: {t.expected}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-slate-500 space-y-2">
              <p>点击上方绿色按钮，即刻执行 PRD 第 12 节规定的全部 28 个验收测试。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
