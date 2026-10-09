"use client";

import { useEffect, useRef } from "react";
import { Zap, Timer, Sparkles, ShieldCheck, Flame } from "lucide-react";
import { formatTime } from "@/lib/workoutStrategies";
import { hapticPulse } from "@/lib/zenAudio";

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
  const lastVibratedSecondRef = useRef<number | null>(null);

  // Pulsos hápticos viscerales en hitos biológicos clave
  useEffect(() => {
    if (!isRunning) return;

    if (remainingSeconds === 180 && lastVibratedSecondRef.current !== 180) {
      lastVibratedSecondRef.current = 180;
      hapticPulse([150, 80, 150]); // Doble pulso: 95% ATP regenerado
    } else if (remainingSeconds === 0 && lastVibratedSecondRef.current !== 0) {
      lastVibratedSecondRef.current = 0;
      hapticPulse([300, 120, 300, 120, 450]); // Triple pulso largo: 100% SNC listo
    }
  }, [remainingSeconds, isRunning]);

  // Respiración cromática periférica según la ventana biológica
  const isZero = remainingSeconds <= 0;
  const isNearEnd = remainingSeconds <= 60 && !isZero;
  const isAtp95 = remainingSeconds <= 180 && remainingSeconds > 60;

  const containerGlow = isZero
    ? "border-emerald-400 bg-emerald-950/20 shadow-[0_0_70px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400/50"
    : isNearEnd
    ? "border-emerald-500/50 bg-zinc-950 shadow-[0_0_50px_rgba(16,185,129,0.15)]"
    : isAtp95
    ? "border-amber-400/70 bg-zinc-950 shadow-[0_0_55px_rgba(245,158,11,0.2)]"
    : "border-amber-500/30 bg-zinc-950 shadow-2xl";

  const statusBadge = isZero ? (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
      100% SNC RESTAURADO · ¡HORA DE TIRAR!
    </span>
  ) : isNearEnd ? (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
      98% ATP · AJUSTÁ EL AGARRE Y PREPARÁ LA BARRA
    </span>
  ) : isAtp95 ? (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
      <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
      95% ATP REGENERADO · RESPIRACIÓN DIAFRAGMÁTICA
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-zinc-900 text-zinc-300 border border-zinc-800">
      <Timer className="w-3.5 h-3.5 text-amber-400" />
      RESÍNTESIS CELULAR DE FOSFÁGENOS EN CURSO
    </span>
  );

  return (
    <div
      className={`w-full p-6 sm:p-10 rounded-3xl transition-all duration-700 text-center space-y-6 ${containerGlow}`}
    >
      <div className="flex flex-col items-center justify-center gap-2">
        {statusBadge}
        <p className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase">
          Temporizador Biológico Visible a Distancia
        </p>
      </div>

      {/* Dígitos masivos para visibilidad a 3 metros en el rack */}
      <p
        className={`text-7xl sm:text-8xl md:text-9xl font-black font-mono tabular-nums tracking-tighter select-none transition-all duration-300 ${
          isZero
            ? "text-emerald-400 drop-shadow-[0_0_35px_rgba(16,185,129,0.5)] animate-bounce"
            : isNearEnd
            ? "text-emerald-300 drop-shadow-[0_0_25px_rgba(16,185,129,0.3)]"
            : isAtp95
            ? "text-amber-300 drop-shadow-[0_0_25px_rgba(251,191,36,0.3)]"
            : "text-zinc-50 drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]"
        }`}
      >
        {formatTime(remainingSeconds)}
      </p>

      {/* Explicación de la Ciencia del ATP */}
      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 max-w-md mx-auto space-y-1.5 text-left sm:text-center">
        <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400 font-semibold font-mono">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Fisiología del Descanso para Fuerza Máxima</span>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed">
          {remainingSeconds >= 240
            ? "Ventana 4-5 min: El sistema nervioso central se recalibra por completo. Evita la fatiga neural acumulada."
            : remainingSeconds >= 150
            ? "Ventana 3 min: Fosfocreatina muscular restaurada al 95-98%. Ya podés levantar con técnica impecable."
            : isZero
            ? "Tiempo cumplido. Sistema neuromuscular al 100% de su capacidad. Enfocá la mente y atacá el peso."
            : "Fase final de descanso: Llená el diafragma de aire, activá el core y asegurá tu base."}
        </p>
      </div>

      {/* Botones de Presets de Descanso Biológico con háptica */}
      {onSetSeconds && (
        <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => {
              hapticPulse([35]);
              onSetSeconds(180);
            }}
            className="flex-1 py-2 px-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-400/60 text-xs font-mono font-medium text-zinc-200 cursor-pointer transition-all active:scale-95"
            title="3 minutos: 95% de resíntesis de fosfocreatina"
          >
            3 min (95% ATP)
          </button>
          <button
            type="button"
            onClick={() => {
              hapticPulse([35]);
              onSetSeconds(240);
            }}
            className="flex-1 py-2 px-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-400/60 text-xs font-mono font-medium text-zinc-200 cursor-pointer transition-all active:scale-95"
            title="4 minutos: 98% de resíntesis"
          >
            4 min (98% ATP)
          </button>
          <button
            type="button"
            onClick={() => {
              hapticPulse([35]);
              onSetSeconds(300);
            }}
            className="flex-1 py-2 px-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-400/60 text-xs font-mono font-bold text-amber-300 cursor-pointer transition-all active:scale-95"
            title="5 minutos: 100% de recuperación del SNC"
          >
            5 min (100% SNC)
          </button>
        </div>
      )}

      {/* Controles de Acción Principal */}
      <div className="space-y-2.5 max-w-md mx-auto">
        <button
          type="button"
          onClick={() => {
            hapticPulse([50]);
            onReady();
          }}
          className={`w-full min-h-12 h-14 rounded-2xl font-bold text-base cursor-pointer shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 ${
            isZero
              ? "bg-emerald-400 hover:bg-emerald-300 text-black shadow-emerald-400/25 animate-pulse"
              : "bg-amber-400 hover:bg-amber-300 text-black shadow-amber-400/20"
          }`}
        >
          <Sparkles className="w-4 h-4 fill-black" />
          <span>¡LISTO! VOLVER A LA BARRA</span>
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              hapticPulse([30]);
              onTogglePause();
            }}
            className="flex-1 min-h-11 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-sm font-medium text-zinc-100 cursor-pointer transition-all"
          >
            {isRunning ? "Pausar" : "Seguir"}
          </button>
          <button
            type="button"
            onClick={() => {
              hapticPulse([30]);
              onAddThirty();
            }}
            className="min-h-11 px-5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-sm font-medium text-zinc-100 cursor-pointer transition-all"
          >
            +30 s
          </button>
        </div>
      </div>
    </div>
  );
}
