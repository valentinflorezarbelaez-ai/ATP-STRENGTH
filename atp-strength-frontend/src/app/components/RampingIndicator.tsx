"use client";

import { Layers } from "lucide-react";
import type { PhasePrescriptions } from "@/lib/workoutStrategies";

export type RampBadgeKey = "F1" | "F2" | "F3" | "F4";
export type RampingIndicatorVariant = "badge-grid" | "guide-list";

export interface RampingIndicatorProps {
  variant?: RampingIndicatorVariant;
  exerciseName: string;
  prescriptions?: PhasePrescriptions;
  activePhaseStep: string;
  completedWarmupKeys: string[];
  onSelectPhase: (key: RampBadgeKey) => void;
}

export function RampingIndicator({
  variant = "badge-grid",
  prescriptions,
  activePhaseStep,
  completedWarmupKeys,
  onSelectPhase,
}: RampingIndicatorProps) {
  const phases = [
    { key: "F1" as const, reps: "10 reps", kg: prescriptions?.phase_1_activation ?? 20, desc: "Activación" },
    { key: "F2" as const, reps: "5 reps", kg: prescriptions?.phase_2_light ?? 0, desc: "Aproximación" },
    { key: "F3" as const, reps: "3 reps", kg: prescriptions?.phase_3_medium ?? 0, desc: "Media" },
    { key: "F4" as const, reps: "1 rep pesada", kg: prescriptions?.phase_4_pap ?? 0, desc: "Potenciación PAP" },
  ];

  if (variant === "guide-list") {
    return (
      <div className="space-y-2 font-mono text-xs">
        {phases.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => onSelectPhase(p.key)}
            className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
              activePhaseStep === p.key
                ? "bg-amber-500/20 border-amber-500 text-white"
                : completedWarmupKeys.includes(p.key)
                ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-300"
                : "bg-black border-zinc-800 text-zinc-400"
            }`}
          >
            <span className="font-bold">{p.key}</span> · {p.desc} · {p.kg} kg · {p.reps}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-white uppercase flex items-center gap-1.5 text-xs">
          <Layers className="w-3.5 h-3.5 text-amber-400" /> HOJA DE RUTA: ACLIMATACIÓN SNC
        </span>
        <span className="text-[10px] text-zinc-500">Toca cualquier fase</span>
      </div>
      <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-2">
        Fases de Aclimatación SNC (F1–F4):
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono text-xs">
        {phases.map((p) => {
          const isDone = completedWarmupKeys.includes(p.key);
          const isCurrent = activePhaseStep === p.key;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => onSelectPhase(p.key)}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                isCurrent
                  ? "bg-amber-500/20 border-amber-500 text-white shadow-lg shadow-amber-500/10"
                  : isDone
                  ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-300"
                  : "bg-black border-zinc-800 text-zinc-400 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center justify-between text-[10px]">
                <span className={isCurrent ? "text-amber-400 font-bold" : "text-zinc-500"}>
                  {p.key}: {p.kg} kg
                </span>
                {isDone && <span className="text-emerald-400 font-bold">✓</span>}
                {isCurrent && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
              </div>
              <div className="text-[11px] text-zinc-300 mt-1">{p.reps}</div>
              <div className="text-sm font-black text-amber-400 mt-0.5">{p.kg} kg</div>
              <div className="text-[9px] text-zinc-500 mt-0.5">{p.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
