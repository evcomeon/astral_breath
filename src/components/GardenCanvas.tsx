/**
 * Stardust Breath Garden - Celestial Ambient Canvas
 * 60fps isolated canvas with delta clamping, celestial particles, and sacred orbital rings
 */

import React, { useEffect, useRef } from 'react';
import { AreaId } from '../types/game';

interface GardenCanvasProps {
  currentAreaId: AreaId;
  repairedAreaCount: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  pulsePhase: number;
  pulseSpeed: number;
  color: string;
}

export const GardenCanvas: React.FC<GardenCanvasProps> = ({ currentAreaId, repairedAreaCount }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle pool
    const particleCount = 120;
    const particles: Particle[] = [];
    const colorPalette =
      currentAreaId === 'AREA_03'
        ? ['#10b981', '#34d399', '#6ee7b7', '#f59e0b']
        : currentAreaId === 'AREA_02'
        ? ['#c084fc', '#a855f7', '#fbbf24', '#38bdf8']
        : ['#38bdf8', '#818cf8', '#67e8f9', '#fef08a'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 15, // px per second
        vy: -10 - Math.random() * 25, // upward gentle drift
        radius: Math.random() * 2.2 + 0.6,
        baseAlpha: Math.random() * 0.5 + 0.2,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 1.5 + Math.random() * 2.5,
        color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
      });
    }

    let globalRotation = 0;

    const render = (time: number) => {
      const rawDt = (time - lastTime) / 1000;
      const dt = Math.min(rawDt, 0.05); // 60fps clamp per game craft guidelines
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Deep space atmospheric gradient
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height * 0.45,
        50,
        width / 2,
        height * 0.45,
        Math.max(width, height) * 0.75
      );

      if (currentAreaId === 'AREA_03') {
        bgGrad.addColorStop(0, 'rgba(6, 78, 59, 0.35)');
        bgGrad.addColorStop(0.5, 'rgba(15, 23, 42, 0.7)');
        bgGrad.addColorStop(1, 'rgba(2, 6, 23, 0.98)');
      } else if (currentAreaId === 'AREA_02') {
        bgGrad.addColorStop(0, 'rgba(88, 28, 135, 0.35)');
        bgGrad.addColorStop(0.5, 'rgba(30, 27, 75, 0.7)');
        bgGrad.addColorStop(1, 'rgba(3, 7, 18, 0.98)');
      } else {
        bgGrad.addColorStop(0, 'rgba(14, 116, 144, 0.3)');
        bgGrad.addColorStop(0.5, 'rgba(15, 23, 42, 0.7)');
        bgGrad.addColorStop(1, 'rgba(2, 6, 23, 0.98)');
      }

      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Celestial orbital sanctum rings
      globalRotation += dt * 0.08;
      ctx.save();
      ctx.translate(width / 2, height * 0.45);
      ctx.rotate(globalRotation);

      // Outer ring
      ctx.beginPath();
      ctx.arc(0, 0, Math.min(width, height) * 0.38, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 16]);
      ctx.stroke();

      // Middle ring
      ctx.beginPath();
      ctx.arc(0, 0, Math.min(width, height) * 0.26, 0, Math.PI * 2);
      ctx.strokeStyle = currentAreaId === 'AREA_03' ? 'rgba(52, 211, 153, 0.06)' : 'rgba(56, 189, 248, 0.06)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 12]);
      ctx.stroke();

      // Inner pulsating halo
      const breathScale = 1 + Math.sin(time * 0.001) * 0.04;
      ctx.beginPath();
      ctx.arc(0, 0, Math.min(width, height) * 0.15 * breathScale, 0, Math.PI * 2);
      ctx.fillStyle =
        currentAreaId === 'AREA_03'
          ? 'rgba(16, 185, 129, 0.03)'
          : currentAreaId === 'AREA_02'
          ? 'rgba(168, 85, 247, 0.03)'
          : 'rgba(56, 189, 248, 0.03)';
      ctx.fill();

      ctx.restore();

      // Draw and update stardust particles
      for (const p of particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.pulsePhase += p.pulseSpeed * dt;

        // Wrap around bounds
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const currentAlpha = p.baseAlpha * (0.6 + Math.sin(p.pulsePhase) * 0.4);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, currentAlpha));
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.globalAlpha = 1;

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [currentAreaId, repairedAreaCount]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};
