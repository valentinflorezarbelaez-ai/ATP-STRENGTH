"use client";

import { Zap, Timer } from "lucide-react";
import { formatTime } from "@/lib/workoutStrategies";

export function RestClock({
  remainingSeconds,
  isRunning,
  onReady,
  onTogglePause,
  onAddThirty,
  onSetSeconds,
}: {
  remainingSeconds: number;
  isRunning: boolean;
  onReady: () => void;
  onTogglePause: () => void;
  onAddThirty: () => void;
  onSetSeconds?: (seconds: number) => void;
}) {
  return (
    <div className="w-full p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-amber-500/30 text-center space-y-6 shadow-2xl animate-in fade-in duration-300">
      <div className="flex items-center justify-center gap-2">
        <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
        <p className="text-xs font-mono font-bold tracking-widest text-amber-300 uppercase">
          Resíntesis de ATP-PCr & Recuperación Neural
        </p>
      </div>

      <p className="text-6xl sm:text-7xl font-semibold font-mono text-white tabular-nums tracking-tight drop-shadow-[0_0_25px_rgba(251,191,36,0.2)]">
        {formatTime(remainingSeconds)}
      </p>

      {/* Explicación de la Ciencia del ATP */}
      <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 max-w-md mx-auto space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400 font-semibold font-mono">
          <Timer className="w-3.5 h-3.5" />
          <span>3 a 5 Minutos para Cargas Máximas</span>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          {remainingSeconds >= 240
            ? "Ventana de 4-5 min: Recuperación al 100% de fosfocreatina muscular y protección del SNC."
            : remainingSeconds >= 150
            ? "Ventana de 3 min: 95-98% del ATP celular regenerado para evitar fallos de técnica."
            : "Fase final de descanso: Focalizá tu respiración diafragmática y prepará tu agarre."}
        </p>
      </div>

      {/* Botones de Presets de Descanso Biológico */}
      {onSetSeconds && (
        <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => onSetSeconds(180)}
            className="flex-1 py-1.5 px-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-400/50 text-[11px] font-mono font-medium text-zinc-300 cursor-pointer transition-all"
            title="3 minutos: 95% de resíntesis de fosfocreatina"
          >
            3 min (95% ATP)
          </button>
          <button
            type="button"
            onClick={() => onSetSeconds(240)}
            className="flex-1 py-1.5 px-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-400/50 text-[11px] font-mono font-medium text-zinc-300 cursor-pointer transition-all"
            title="4 minutos: 98% de resíntesis"
          >
            4 min (98% ATP)
          </button>
          <button
            type="button"
            onClick={() => onSetSeconds(300)}
            className="flex-1 py-1.5 px-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-400/50 text-[11px] font-mono font-medium text-amber-300 cursor-pointer transition-all"
            title="5 minutos: 100% de recuperación del SNC"
          >
            5 min (100% SNC)
          </button>
        </div>
      )}

      <div className="space-y-2 max-w-md mx-auto">
        <button
          type="button"
          onClick={onReady}
          className="w-full min-h-11 h-14 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-base cursor-pointer shadow-lg shadow-amber-400/20 active:scale-98 transition-all"
        >
          ¡Listo! Volver a la Barra
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onTogglePause}
            className="flex-1 min-h-11 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-sm font-medium text-zinc-100 cursor-pointer transition-all"
          >
            {isRunning ? "Pausar" : "Seguir"}
          </button>
          <button
            type="button"
            onClick={onAddThirty}
            className="min-h-11 px-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-sm font-medium text-zinc-100 cursor-pointer transition-all"
          >
            +30 s
          </button>
        </div>
      </div>
    </div>
  );
}
