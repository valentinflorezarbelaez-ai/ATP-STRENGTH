"use client";

import { formatTime } from "@/lib/workoutStrategies";

export function RestClock({
  remainingSeconds,
  isRunning,
  onReady,
  onTogglePause,
  onAddThirty,
}: {
  remainingSeconds: number;
  isRunning: boolean;
  onReady: () => void;
  onTogglePause: () => void;
  onAddThirty: () => void;
}) {
  return (
    <div className="w-full p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-amber-500/30 text-center space-y-6">
      <p className="text-sm font-medium text-amber-300">Descanso</p>
      <p className="text-6xl sm:text-7xl font-semibold font-mono text-white tabular-nums tracking-tight">
        {formatTime(remainingSeconds)}
      </p>
      <p className="text-sm text-zinc-300 leading-relaxed max-w-sm mx-auto">
        Respirá. Cuando llegue a cero, volvé a la barra.
      </p>
      <div className="space-y-2 max-w-md mx-auto">
        <button
          type="button"
          onClick={onReady}
          className="w-full min-h-11 h-14 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-semibold text-base cursor-pointer"
        >
          Listo
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onTogglePause}
            className="flex-1 min-h-11 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-medium text-zinc-100 cursor-pointer"
          >
            {isRunning ? "Pausar" : "Seguir"}
          </button>
          <button
            type="button"
            onClick={onAddThirty}
            className="min-h-11 px-4 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-medium text-zinc-100 cursor-pointer"
          >
            +30 s
          </button>
        </div>
      </div>
    </div>
  );
}
