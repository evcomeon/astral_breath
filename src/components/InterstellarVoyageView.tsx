/**
 * Stardust Breath Garden - Interstellar Voyage (星际旅行 / 首页默认视界)
 * Features:
 * - Mesmerizing 3D Perspective Hyperspace Warp Canvas (60fps) with star trails, cosmic dust, and sacred core
 * - Interactive Warp Speed Controls (Cruise 1.0c, Warp 3.8c, Hyperwarp 9.9c, Cosmic Leap 25.0c)
 * - Live Stardust Accumulation Telemetry & Breath Yield ticker
 * - Companion Cosmic Flight Logs & Encounter Telemetry
 * - Quick Action Buttons: Enter Astrolabe, Quick Condense, Settle Offline Breath, Synthesis Paths
 */

import React, { useEffect, useRef, useState } from 'react';
import { AreaId, GameSaveState, ItemId, Language } from '../types/game';
import { CHARACTERS, getCharacterBonus } from '../data/characters';
import { calculateFactorA } from '../engine/offline';
import { getFormationMultiplierB } from '../engine/progression';
import { getTranslation } from '../i18n/translations';
import { sound } from '../engine/audio';
import {
  Sparkles,
  Zap,
  Rocket,
  Compass,
  Hourglass,
  Layers,
  Wand2,
  ChevronRight,
  GitFork,
  Radio,
  Activity,
  Flame,
  Sun,
  Gem,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface InterstellarVoyageViewProps {
  save: GameSaveState;
  lang: Language;
  onNavigateToTab: (tab: 'ASTROLABE' | 'COMPENDIUM' | 'COMPANIONS' | 'GARDEN' | 'SETTINGS') => void;
  onOpenCondense: () => void;
  onOpenSettlement: () => void;
  onViewItemPath: (itemId: ItemId) => void;
  onQuickMerge: () => void;
  mergeablePairsCount: number;
  currentAreaId: AreaId;
}

interface WarpStar {
  x: number;
  y: number;
  z: number;
  prevZ: number;
  color: string;
  size: number;
}

export const InterstellarVoyageView: React.FC<InterstellarVoyageViewProps> = ({
  save,
  lang,
  onNavigateToTab,
  onOpenCondense,
  onOpenSettlement,
  onViewItemPath,
  onQuickMerge,
  mergeablePairsCount,
  currentAreaId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [warpSpeedMultiplier, setWarpSpeedMultiplier] = useState<number>(3.8); // 1.0, 3.8, 9.9, 25.0
  const [currentDistanceLightYears, setCurrentDistanceLightYears] = useState<number>(142.85);

  const activeChar = CHARACTERS[save.equippedCharacterId];
  const charBonus = getCharacterBonus(save.equippedCharacterId, save.companionLevel);

  // Live offline accumulation calculation
  const now = Date.now();
  const elapsedSeconds = Math.max(0, Math.floor((now - save.lastClaimUtcMs) / 1000));
  const elapsedHours = elapsedSeconds / 3600;
  const factorA = calculateFactorA(elapsedHours);
  const factorB = getFormationMultiplierB(save.formationLevel);
  const factorC = charBonus;
  const grossAccumulatedDust = BigInt(
    Math.floor(elapsedSeconds * 1.0 * factorA * factorB * (1.0 + factorC))
  );

  // Hourly rate estimation
  const hourlyRate = Math.floor(3600 * 1.0 * factorA * factorB * (1.0 + factorC));

  // Continual light years progression
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDistanceLightYears((prev) => prev + 0.005 * warpSpeedMultiplier);
    }, 100);
    return () => clearInterval(timer);
  }, [warpSpeedMultiplier]);

  // 3D Hyperspace Warp Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Initialize 400 3D warp stars
    const starCount = 420;
    const stars: WarpStar[] = [];
    const maxZ = 1200;

    const starColors =
      currentAreaId === 'AREA_03'
        ? ['#34d399', '#6ee7b7', '#fef08a', '#ffffff', '#38bdf8']
        : currentAreaId === 'AREA_02'
        ? ['#c084fc', '#e879f9', '#fde047', '#ffffff', '#38bdf8']
        : ['#38bdf8', '#818cf8', '#a5f3fc', '#ffffff', '#fef08a'];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width * 2.5,
        y: (Math.random() - 0.5) * height * 2.5,
        z: Math.random() * maxZ,
        prevZ: 0,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        size: Math.random() * 1.8 + 0.8,
      });
    }

    let lastTime = performance.now();
    let coreRotation = 0;

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      // Dark cosmos space background with subtle gradient
      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, width, height);

      // Central perspective origin
      const cx = width / 2;
      const cy = height * 0.44;

      // Base speed mapped from warpSpeedMultiplier
      const speed = warpSpeedMultiplier * 140 * dt;

      // Draw Warp Stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.prevZ = star.z;
        star.z -= speed;

        if (star.z <= 1) {
          star.z = maxZ;
          star.prevZ = maxZ;
          star.x = (Math.random() - 0.5) * width * 2.5;
          star.y = (Math.random() - 0.5) * height * 2.5;
        }

        // Project 3D coordinates to 2D
        const k = 400 / star.z;
        const px = star.x * k + cx;
        const py = star.y * k + cy;

        const prevK = 400 / star.prevZ;
        const prevPx = star.x * prevK + cx;
        const prevPy = star.y * prevK + cy;

        if (px >= -50 && px <= width + 50 && py >= -50 && py <= height + 50) {
          const depthRatio = 1 - star.z / maxZ;
          const alpha = Math.min(1, Math.max(0.1, depthRatio * 1.2));
          const lineWidth = Math.max(0.6, (1 - star.z / maxZ) * (warpSpeedMultiplier > 8 ? 2.8 : 1.8));

          ctx.beginPath();
          ctx.moveTo(prevPx, prevPy);
          ctx.lineTo(px, py);
          ctx.strokeStyle = star.color;
          ctx.globalAlpha = alpha;
          ctx.lineWidth = lineWidth;
          ctx.stroke();

          // Star head glow
          ctx.beginPath();
          ctx.arc(px, py, star.size * (0.5 + depthRatio * 0.8), 0, Math.PI * 2);
          ctx.fillStyle = star.color;
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1.0;

      // Central Sacred Sanctum Core Hologram
      coreRotation += dt * (0.2 + warpSpeedMultiplier * 0.05);
      ctx.save();
      ctx.translate(cx, cy);

      // Ambient radial core glow
      const radialCore = ctx.createRadialGradient(0, 0, 5, 0, 0, 180);
      radialCore.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
      radialCore.addColorStop(0.5, 'rgba(99, 102, 241, 0.08)');
      radialCore.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radialCore;
      ctx.beginPath();
      ctx.arc(0, 0, 180, 0, Math.PI * 2);
      ctx.fill();

      // Rotating celestial compass rings
      ctx.rotate(coreRotation);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([6, 10]);
      ctx.beginPath();
      ctx.arc(0, 0, 85, 0, Math.PI * 2);
      ctx.stroke();

      ctx.rotate(-coreRotation * 2.2);
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 14]);
      ctx.beginPath();
      ctx.arc(0, 0, 55, 0, Math.PI * 2);
      ctx.stroke();

      // Center navigation reticle
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [warpSpeedMultiplier, currentAreaId]);

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-y-auto select-none">
      {/* 3D Hyperspace Warp Canvas Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full block" />
        {/* Subtle vignette and scanline grid overlay */}
        <div className="absolute inset-0 bg-radial from-transparent via-slate-950/40 to-slate-950/90 pointer-events-none" />
      </div>

      {/* Main Content Overlay */}
      <div className="relative z-10 w-full max-w-6xl mx-auto p-4 md:p-6 flex flex-col justify-between h-full space-y-4">
        {/* Top Voyage Navigation Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/70 backdrop-blur-xl border border-cyan-500/30 p-3 sm:p-4 rounded-2xl shadow-[0_0_30px_rgba(56,189,248,0.15)]">
          <div className="flex items-center space-x-3">
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/30 to-purple-600/30 border border-cyan-400/50 flex items-center justify-center shadow-inner">
              <Rocket className="w-6 h-6 text-cyan-300 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-wide font-['Cinzel','Noto_Serif_SC']">
                  {getTranslation(lang, 'voyageTitle')}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-[10px] text-cyan-300 font-mono">
                  {getTranslation(lang, 'warpHyperdrive')}
                </span>
              </div>
              <p className="text-xs text-slate-300/80">
                {getTranslation(lang, 'voyageSubtitle')}
              </p>
            </div>
          </div>

          {/* Warp Speed Preset Selector */}
          <div className="flex items-center space-x-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-700/80 text-xs font-mono">
            <span className="text-[10px] text-slate-400 px-1 hidden sm:inline">
              {getTranslation(lang, 'warpSpeed')}:
            </span>
            {[
              { label: '1.0c', val: 1.0, name: '亚光速' },
              { label: '3.8c', val: 3.8, name: '常规曲率' },
              { label: '9.9c', val: 9.9, name: '跃迁极速' },
              { label: '25.0c', val: 25.0, name: '超维折叠' },
            ].map((spd) => (
              <button
                key={spd.val}
                onClick={() => {
                  sound.playClick();
                  setWarpSpeedMultiplier(spd.val);
                  if (spd.val >= 9.9) sound.playMerge(4);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  warpSpeedMultiplier === spd.val
                    ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-[0_0_12px_rgba(56,189,248,0.5)] border border-cyan-400/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {spd.label}
              </button>
            ))}
          </div>
        </div>

        {/* Center Cockpit Telemetry & Real-time Accumulation Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-auto">
          {/* Telemetry Card 1: Flight Telemetry & Coordinates */}
          <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800 hover:border-cyan-500/50 p-4 rounded-2xl shadow-xl transition space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono pb-2 border-b border-slate-800/80">
              <span className="flex items-center space-x-1.5 text-cyan-400 font-semibold">
                <Compass className="w-4 h-4" />
                <span>航行坐标系</span>
              </span>
              <span className="text-emerald-400 flex items-center space-x-1">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span>巡航稳定</span>
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">{getTranslation(lang, 'warpSector')}:</span>
                <span className="text-white font-bold tracking-wider">
                  {currentAreaId === 'AREA_03'
                    ? '穹顶天枢 · 0x03'
                    : currentAreaId === 'AREA_02'
                    ? '凝形星环 · 0x02'
                    : '原初星云 · 0x01'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">已跃迁距离:</span>
                <span className="text-cyan-300 font-bold tabular-nums">
                  {currentDistanceLightYears.toFixed(2)} 光年
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">星庭谐振度:</span>
                <span className="text-emerald-300 font-bold">100% 稳态</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">凝形等级:</span>
                <span className="text-purple-300 font-bold">
                  Lv{save.formationLevel} (B: {factorB.toFixed(2)})
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span>陪伴星灵:</span>
              <span
                style={{ color: activeChar.avatarColor }}
                className="font-bold flex items-center space-x-1"
              >
                <span>{activeChar.symbol}</span>
                <span>{getTranslation(lang, activeChar.nameKey)}</span>
                <span className="text-emerald-400">(+{(factorC * 100).toFixed(1)}%)</span>
              </span>
            </div>
          </div>

          {/* Telemetry Card 2: Live Accrued Stardust & Settle Hero */}
          <div className="bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-xl border border-cyan-500/50 p-4 rounded-2xl shadow-[0_0_30px_rgba(56,189,248,0.2)] flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono pb-2 border-b border-slate-800/80">
              <span className="flex items-center space-x-1.5 text-amber-400 font-semibold">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>{getTranslation(lang, 'voyageDustYield')}</span>
              </span>
              <span className="text-cyan-400 font-mono text-[10px]">
                {elapsedHours < 1 ? `${Math.floor(elapsedSeconds / 60)} 分钟` : `${elapsedHours.toFixed(1)} 小时`}
              </span>
            </div>

            <div className="text-center py-2 space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-cyan-200 to-white tracking-tight tabular-nums">
                +{grossAccumulatedDust.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-300 font-mono">
                当前沉淀速率: <strong className="text-cyan-300">~{hourlyRate.toLocaleString()}</strong> 星尘/小时
              </p>
            </div>

            {/* Quick Settle CTA */}
            <button
              onClick={() => {
                sound.playCollect();
                onOpenSettlement();
              }}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl font-bold text-xs tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.35)] transition transform active:scale-95"
            >
              <Hourglass className="w-4 h-4 text-slate-950" />
              <span>{getTranslation(lang, 'quickSettleCTA')}</span>
            </button>
          </div>

          {/* Telemetry Card 3: Quick Astrolabe Synthesis Actions */}
          <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800 hover:border-purple-500/50 p-4 rounded-2xl shadow-xl transition space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono pb-2 border-b border-slate-800/80">
              <span className="flex items-center space-x-1.5 text-purple-400 font-semibold">
                <Layers className="w-4 h-4" />
                <span>星盘造物工坊</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                空位: {save.board.filter((s) => !s.itemId).length}/64
              </span>
            </div>

            <div className="space-y-2">
              {/* Enter Astrolabe Button */}
              <button
                onClick={() => {
                  sound.playClick();
                  onNavigateToTab('ASTROLABE');
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-500/50 text-indigo-200 text-xs font-semibold transition group shadow-md"
              >
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>{getTranslation(lang, 'enterMatrixCTA')}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-indigo-300 transform group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Quick Merge (if mergeable pairs exist) */}
              {mergeablePairsCount > 0 ? (
                <button
                  onClick={() => {
                    sound.playMerge(3);
                    onQuickMerge();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/60 text-purple-200 text-xs font-semibold transition animate-pulse"
                >
                  <div className="flex items-center space-x-2">
                    <Wand2 className="w-4 h-4 text-purple-300" />
                    <span>{getTranslation(lang, 'quickMergeBtn')}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-purple-400/30 text-[10px] text-purple-200 font-mono">
                    {mergeablePairsCount} 组就绪
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenCondense();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 text-xs font-semibold transition"
                >
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-cyan-300" />
                    <span>{getTranslation(lang, 'condenseBtn')}</span>
                  </div>
                  <span className="text-[10px] text-cyan-400 font-mono">10星尘/个</span>
                </button>
              )}
            </div>

            {/* Quick Material Inspection Link */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">核心材料:</span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    sound.playClick();
                    onViewItemPath('MAT_GLIMMER');
                  }}
                  className="flex items-center space-x-1 text-amber-300 hover:underline cursor-pointer"
                  title="点击查看微光碎片合成路径"
                >
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>{save.materials.glimmer}</span>
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    onViewItemPath('MAT_ASH');
                  }}
                  className="flex items-center space-x-1 text-orange-300 hover:underline cursor-pointer"
                  title="点击查看时空余烬合成路径"
                >
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span>{save.materials.ash}</span>
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    onViewItemPath('MAT_CRYSTAL');
                  }}
                  className="flex items-center space-x-1 text-purple-300 hover:underline cursor-pointer"
                  title="点击查看凝形结晶合成路径"
                >
                  <Gem className="w-3.5 h-3.5 text-purple-400" />
                  <span>{save.materials.crystal}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Companion Flight Log Message Footer */}
        <div className="bg-slate-950/75 backdrop-blur-md border border-slate-800/90 p-3 rounded-xl flex items-center justify-between text-xs text-slate-300 font-mono">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-slate-950 font-bold text-xs flex-shrink-0"
              style={{ backgroundColor: activeChar.avatarColor }}
            >
              {activeChar.symbol}
            </span>
            <span className="text-cyan-300 font-semibold flex-shrink-0">
              [{getTranslation(lang, activeChar.nameKey)}]:
            </span>
            <span className="truncate text-slate-300">
              {getTranslation(lang, 'companionCompanionGreeting')}
            </span>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onNavigateToTab('COMPANIONS');
            }}
            className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 text-[11px] flex-shrink-0 ml-2"
          >
            切换伴旅
          </button>
        </div>
      </div>
    </div>
  );
};
