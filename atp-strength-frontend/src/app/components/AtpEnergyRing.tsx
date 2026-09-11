"use client";

import React from "react";
import { formatTime } from "@/lib/workoutStrategies";
import { Zap, Heart } from "lucide-react";

interface AtpEnergyRingProps {
  remainingSeconds: number;
    atpSaturationPercent: number;
  timerTitle?: string;
  className?: string;
}

/**
 * Apple Fitness-grade Radial SVG Energy Ring for ATP-PCr resynthesis.
 * Features dual-gradient phosphagen saturation, tabular wall-clock numerals,
 * and physiological zone guidance.
 */
export function AtpEnergyRing({
  remainingSeconds,
    atpSaturationPercent,
  timerTitle = "Resíntesis de ATP-PCr",
  className = "",
}: AtpEnergyRingProps) {
  const radius = 86;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius; // ~ 540.35px
  const clampedPercent = Math.max(0, Math.min(100, atpSaturationPercent));
  const strokeDashoffset = circumference - (circumference * clampedPercent) / 100;

  // Physiological zone diagnosis
  const getZoneInfo = (pct: number) => {
    if (pct < 35) {
      return {
        label: "Fase de Desfosforilación",
        sub: "Respiración diafragmática • Baja el ritmo cardíaco",
        color: "text-cyan-400",
        pillBg: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
      };
    }
    if (pct < 75) {
      return {
        label: "Glucólisis & Resíntesis Activa",
        sub: "Reabastecimiento de creatina fosfato mitocondrial",
        color: "text-purple-400",
        pillBg: "bg-purple-500/10 border-purple-500/30 text-purple-400",
      };
    }
    if (pct < 98) {
      return {
        label: "Saturación Neuromuscular Alta",
        sub: "Aproximándose al 100% de fuerza máxima",
        color: "text-amber-400",
        pillBg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
      };
    }
    return {
      label: "Fuerza Máxima Restaurada",
      sub: "SNC y fosfágeno al 100% • ¡Listo para la serie!",
      color: "text-emerald-400",
      pillBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    };
  };

  const zone = getZoneInfo(clampedPercent);

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {/* SVG Radial Gauge */}
      <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
        <svg
          className="w-full h-full -rotate-90 transform"
          viewBox="0 0 200 200"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="atpEnergyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" />
              <stop offset="45%" stopColor="#a855f7" />
              <stop offset="85%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id="ringGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Track */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-zinc-800/50 dark:text-zinc-900/80"
          />

          {/* Active Energy Saturation Arc */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke="url(#atpEnergyGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter="url(#ringGlow)"
            className="transition-all duration-300 ease-out"
          />
        </svg>

        {/* Center Display: Time & Saturation */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest mb-1">
            <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>{timerTitle}</span>
          </div>

          <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white tabular-nums drop-shadow-md">
            {formatTime(remainingSeconds)}
          </div>

          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="text-xs font-mono font-bold text-zinc-300">
              {clampedPercent}%
            </span>
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Saturación</span>
          </div>
        </div>
      </div>

      {/* Physiological Bio-Feedback Pill */}
      <div className="text-center space-y-1 max-w-sm px-4">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono font-semibold transition-all ${zone.pillBg}`}>
          <Heart className="w-3 h-3 animate-pulse" />
          <span>{zone.label}</span>
        </div>
        <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
          {zone.sub}
        </p>
      </div>
    </div>
  );
}
