"use client";

import { Minimize2, Pause, Play, RotateCcw, Sparkles, Volume2 } from "lucide-react";
import { formatTime, resolveReadyLabel, type PhasePrescriptions } from "@/lib/workoutStrategies";

export type TimerDisplayVariant = "hero-inline" | "sidebar-card" | "zen-fullscreen";

export interface TimerDisplayProps {
  variant: TimerDisplayVariant;
  title: string;
  remainingSeconds: number;
  durationSeconds: number;
  isRunning: boolean;
  atpSaturationPercent: number;
  exerciseName: string;
  currentSet: number;
  activePhaseStep: string;
  prescriptions?: PhasePrescriptions;
  exerciseReps: string;
  onTogglePlayPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  onPlayChime: () => void;
  onOpenZen?: () => void;
  onCloseZen?: () => void;
}

export function TimerDisplay(props: TimerDisplayProps) {
  const {
    variant,
    title,
    remainingSeconds,
    durationSeconds,
    isRunning,
    atpSaturationPercent,
    exerciseName,
    currentSet,
    activePhaseStep,
    prescriptions,
    exerciseReps,
    onTogglePlayPause,
    onReset,
    onSkip,
    onPlayChime,
    onOpenZen,
    onCloseZen,
  } = props;

  const progressPercent =
    durationSeconds > 0 ? ((durationSeconds - remainingSeconds) / durationSeconds) * 100 : 0;
  const strokeDashoffset = 565.48 * (1 - progressPercent / 100);
  const readyLabel = resolveReadyLabel(activePhaseStep, prescriptions, exerciseReps, currentSet);

  if (variant === "hero-inline") {
    return (
      <div className="mt-4 p-4 rounded-2xl bg-zinc-950 border border-amber-500/30 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">{title}</div>
            <div className="text-3xl font-black font-mono text-white">{formatTime(remainingSeconds)}</div>
            <div className="text-xs text-zinc-400">Saturación ATP: {atpSaturationPercent}%</div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onSkip} className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-mono text-zinc-300 cursor-pointer">
              Saltar
            </button>
            {onOpenZen && (
              <button type="button" onClick={onOpenZen} className="px-3 py-2 rounded-xl bg-amber-500/20 border border-amber-500 text-xs font-mono text-amber-400 cursor-pointer">
                Zen
              </button>
            )}
          </div>
        </div>
        <div className="h-1.5 rounded-full bg-zinc-900 overflow-hidden">
          <div className="h-full bg-amber-400 transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>
    );
  }

  if (variant === "sidebar-card") {
    return (
      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
        <div className="text-[10px] font-mono text-zinc-400 uppercase mb-1">Resíntesis de ATP</div>
        <div className="text-2xl font-black font-mono text-white">{formatTime(remainingSeconds)}</div>
        <div className="text-xs text-amber-400 mt-1">{atpSaturationPercent}% ATP</div>
        {onOpenZen && (
          <button type="button" onClick={onOpenZen} className="mt-3 w-full py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-mono text-zinc-300 cursor-pointer">
            Ver Reloj Zen
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#000000] flex flex-col items-center justify-between p-6 md:p-12 animate-in fade-in duration-300">
      <div className="w-full max-w-4xl flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>
            {title.toUpperCase()} • {exerciseName.toUpperCase()} (SERIE {currentSet > 1 ? currentSet - 1 : 1} COMPLETADA)
          </span>
        </div>
        <button
          type="button"
          onClick={onCloseZen}
          className="px-4 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Minimize2 className="w-4 h-4" />
          <span>Cerrar</span>
        </button>
      </div>

      <div className="flex flex-col items-center justify-center my-auto">
        <div className="relative w-80 h-80 md:w-96 md:h-96 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" stroke="#121214" strokeWidth="5" fill="transparent" />
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke="#f59e0b"
              strokeWidth="5"
              strokeDasharray="565.48"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-7xl md:text-8xl font-black font-mono text-white tracking-tighter">
              {formatTime(remainingSeconds)}
            </span>
            <span className="text-sm font-mono text-amber-400 font-bold mt-3">
              Saturación de ATP: {atpSaturationPercent}%
            </span>
            <span className="text-xs font-mono text-zinc-400 mt-1 uppercase tracking-widest">
              {isRunning ? "Resíntesis en Silencio" : remainingSeconds === 0 ? "¡ATP 100% Recuperado!" : "Pausa"}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onCloseZen}
          className="mt-6 px-8 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-mono font-black text-xs sm:text-sm tracking-wider uppercase transition-all shadow-xl shadow-amber-400/20 active:scale-95 cursor-pointer flex items-center gap-2"
        >
          <Play className="w-4 h-4 fill-black" />
          <span>{readyLabel}</span>
        </button>

        <div className="flex items-center gap-5 mt-6">
          <button type="button" onClick={onTogglePlayPause} className="p-4 rounded-full bg-zinc-900/80 border border-zinc-700 text-white cursor-pointer" title={isRunning ? "Pausar" : "Reanudar"}>
            {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-white" />}
          </button>
          <button type="button" onClick={onReset} className="p-4 rounded-full bg-zinc-900/80 border border-zinc-700 text-zinc-400 cursor-pointer" title="Reiniciar descanso">
            <RotateCcw className="w-6 h-6" />
          </button>
          <button type="button" onClick={onPlayChime} className="p-4 rounded-full bg-zinc-900/80 border border-zinc-700 text-zinc-400 hover:text-amber-400 cursor-pointer" title="Campana Zen 528Hz">
            <Volume2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="text-center text-xs font-mono text-zinc-400 max-w-md">
        El sistema fosfágeno requiere entre 3 y 5 minutos para restaurar el 98% del ATP intracelular. Respira y mantén el foco.
      </div>
    </div>
  );
}
