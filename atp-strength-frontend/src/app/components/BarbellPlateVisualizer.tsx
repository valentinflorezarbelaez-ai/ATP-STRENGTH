"use client";

import React from "react";

interface PlateItem {
  weight: number;
  count: number;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

interface BarbellPlateVisualizerProps {
  targetWeightKg: number;
  exerciseName?: string;
  className?: string;
}

const IWF_PLATES = [
  { weight: 25, bgClass: "bg-red-500/25", textClass: "text-red-400", borderClass: "border-red-500/50" },
  { weight: 20, bgClass: "bg-blue-500/25", textClass: "text-blue-400", borderClass: "border-blue-500/50" },
  { weight: 15, bgClass: "bg-amber-400/25", textClass: "text-amber-400", borderClass: "border-amber-400/50" },
  { weight: 10, bgClass: "bg-emerald-500/25", textClass: "text-emerald-400", borderClass: "border-emerald-500/50" },
  { weight: 5, bgClass: "bg-zinc-300/25", textClass: "text-zinc-200", borderClass: "border-zinc-400/50" },
  { weight: 2.5, bgClass: "bg-red-400/25", textClass: "text-red-300", borderClass: "border-red-400/40" },
  { weight: 1.25, bgClass: "bg-zinc-400/25", textClass: "text-zinc-300", borderClass: "border-zinc-400/40" },
  { weight: 0.5, bgClass: "bg-zinc-500/25", textClass: "text-zinc-400", borderClass: "border-zinc-500/40" },
];

export function BarbellPlateVisualizer({
  targetWeightKg,
  exerciseName = "",
  className = "",
}: BarbellPlateVisualizerProps) {
  const isBodyweight =
    exerciseName.toLowerCase().includes("dominada") ||
    exerciseName.toLowerCase().includes("pull-up") ||
    exerciseName.toLowerCase().includes("fondo") ||
    exerciseName.toLowerCase().includes("dip");

  if (isBodyweight) {
    return (
      <div className={`text-[10px] font-mono text-zinc-400 flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 ${className}`}>
        <span>Carga: Peso corporal</span>
        <span className="text-amber-400 font-bold">{targetWeightKg > 0 ? `+${targetWeightKg} kg lastre` : "Sin lastre"}</span>
      </div>
    );
  }

  const barWeight = 20; // Standard Olympic Barbell (kg)
  if (targetWeightKg <= barWeight) {
    return (
      <div className={`text-[10px] font-mono text-zinc-400 flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 ${className}`}>
        <span>Barra Olímpica sola</span>
        <span className="text-amber-400 font-bold">20.0 kg</span>
      </div>
    );
  }

  const perSideTarget = Math.round(((targetWeightKg - barWeight) / 2) * 100) / 100;
  let remaining = perSideTarget;
  const plateList: PlateItem[] = [];

  for (const p of IWF_PLATES) {
    if (remaining >= p.weight - 0.001) {
      const count = Math.floor((remaining + 0.001) / p.weight);
      if (count > 0) {
        plateList.push({
          weight: p.weight,
          count,
          bgClass: p.bgClass,
          textClass: p.textClass,
          borderClass: p.borderClass,
        });
        remaining = Math.round((remaining - count * p.weight) * 1000) / 1000;
      }
    }
  }

  return (
    <div className={`space-y-1.5 px-3 py-2 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-[11px] font-mono ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-zinc-400 text-[10px] uppercase tracking-wider">
          Barra 20kg + <strong className="text-white font-bold">{perSideTarget} kg</strong> / lado:
        </span>
        {remaining > 0.1 && (
          <span className="text-[9px] text-amber-400/80">+{remaining}kg rem</span>
        )}
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {plateList.map((p, idx) => (
          <span
            key={idx}
            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md border text-[10px] font-bold ${p.bgClass} ${p.textClass} ${p.borderClass}`}
            title={`${p.count}x disco(s) de ${p.weight} kg`}
          >
            {p.count > 1 ? `${p.count}×` : ""}
            {p.weight}
          </span>
        ))}
      </div>
    </div>
  );
}
