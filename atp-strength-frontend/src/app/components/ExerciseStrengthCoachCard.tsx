"use client";

import React, { useState } from "react";
import {
  Trophy,
  Award,
  Zap,
  TrendingUp,
  Target,
  ArrowRight,
  ShieldCheck,
  Timer,
  ChevronRight,
  Flame,
  Scale,
  Sparkles,
  Info,
} from "lucide-react";
import type { StrengthLevelResult, CoachEvaluationResult } from "@/lib/strengthStandards";

interface ExerciseStrengthCoachCardProps {
  standards: StrengthLevelResult;
  coach: CoachEvaluationResult;
  bodyweightKg: number;
  onUpdateBodyweight?: (newBw: number) => void;
  onApplyTargetLoad?: (loadKg: number) => void;
  className?: string;
}

export function ExerciseStrengthCoachCard({
  standards,
  coach,
  bodyweightKg,
  onUpdateBodyweight,
  onApplyTargetLoad,
  className = "",
}: ExerciseStrengthCoachCardProps) {
  const [isEditingBw, setIsEditingBw] = useState(false);
  const [tempBw, setTempBw] = useState(String(bodyweightKg || 75));

  const handleSaveBw = () => {
    const val = parseFloat(tempBw);
    if (val && val >= 30 && val <= 250 && onUpdateBodyweight) {
      onUpdateBodyweight(val);
    }
    setIsEditingBw(false);
  };

  const TIERS = [
    { id: "NOVICE", label: "Principiante", badge: "🥉", min: standards.thresholds.novice },
    { id: "INTERMEDIATE", label: "Intermedio", badge: "🥈", min: standards.thresholds.intermediate },
    { id: "ADVANCED", label: "Avanzado", badge: "🥇", min: standards.thresholds.advanced },
    { id: "ELITE", label: "Élite", badge: "💎", min: standards.thresholds.elite },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* ── 1. ESCALA Y NIVELES DE FUERZA (STRENGTH STANDARDS) ── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-zinc-950 via-zinc-900/90 to-zinc-950 border border-zinc-800 shadow-xl space-y-4">
        {/* Header con Nivel Actual y Selector de Peso Corporal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl">{standards.badge}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">
                    NIVEL DE FUERZA OFICIAL
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-300">
                    {standards.categoryPattern}
                  </span>
                </div>
                <h3 className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${standards.color}`}>
                  {standards.tierLabel.toUpperCase()}
                </h3>
              </div>
            </div>
          </div>

          {/* Ratios y Calibración de Peso Corporal */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="px-3 py-1.5 rounded-xl bg-black border border-zinc-800 flex items-center gap-2 text-xs font-mono">
              <span className="text-zinc-400">Ratio:</span>
              <strong className="text-amber-400 font-bold">{standards.ratioFormatted}</strong>
            </div>

            {isEditingBw ? (
              <div className="flex items-center gap-1 bg-black border border-amber-500/50 rounded-xl px-2 py-1">
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                <input
                  type="number"
                  step="0.5"
                  min="40"
                  max="200"
                  value={tempBw}
                  onChange={(e) => setTempBw(e.target.value)}
                  className="w-14 bg-transparent text-white font-mono text-xs font-bold focus:outline-none"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveBw();
                    if (e.key === "Escape") setIsEditingBw(false);
                  }}
                />
                <span className="text-zinc-500 text-[10px] font-mono">kg</span>
                <button
                  type="button"
                  onClick={handleSaveBw}
                  className="px-2 py-0.5 rounded bg-amber-400 hover:bg-amber-300 text-black text-[10px] font-mono font-bold cursor-pointer"
                >
                  OK
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setTempBw(String(bodyweightKg || 75));
                  setIsEditingBw(true);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Editar tu peso corporal para calibrar los estándares"
              >
                <Scale className="w-3.5 h-3.5 text-zinc-400" />
                <span>{bodyweightKg || 75} kg</span>
                <span className="text-[10px] text-zinc-500 underline">Editar</span>
              </button>
            )}
          </div>
        </div>

        {/* Escalímetro de los 4 Niveles */}
        <div className="space-y-2">
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center font-mono">
            {TIERS.map((t, idx) => {
              const isCurrent = standards.tierIndex === idx;
              const isPassed = standards.tierIndex > idx;
              return (
                <div
                  key={t.id}
                  className={`p-2 sm:p-2.5 rounded-xl border transition-all ${
                    isCurrent
                      ? "bg-amber-500/15 border-amber-400 shadow-md shadow-amber-500/10 text-white"
                      : isPassed
                      ? "bg-zinc-900/80 border-emerald-500/40 text-emerald-300"
                      : "bg-zinc-950/60 border-zinc-850 text-zinc-600"
                  }`}
                >
                  <div className="text-base sm:text-lg mb-0.5">{t.badge}</div>
                  <div className="text-[10px] sm:text-xs font-bold truncate">{t.label}</div>
                  <div className="text-[9px] sm:text-[11px] font-bold text-zinc-400 mt-0.5">
                    {t.min} kg+
                  </div>
                  {isCurrent && (
                    <span className="inline-block mt-1 px-1.5 py-0.2 rounded bg-amber-400 text-black text-[8px] sm:text-[9px] font-black uppercase">
                      Actual
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Barra de Progreso hacia el Siguiente Nivel */}
          {standards.nextTierLabel ? (
            <div className="p-3 rounded-xl bg-black/60 border border-zinc-850 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    Próximo objetivo: <strong className="text-white">{standards.nextTierLabel}</strong>
                  </span>
                </span>
                <span className="text-amber-400 font-bold">
                  {standards.progressToNextTierPct}%
                </span>
              </div>

              {/* Barra SVG/CSS */}
              <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-700"
                  style={{ width: `${Math.max(4, Math.min(100, standards.progressToNextTierPct))}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span>
                  Te faltan: <strong className="text-emerald-400 font-bold">{standards.kgToNextTier} kg</strong> para subir de categoría
                </span>
                <span className="text-zinc-500 text-[10px]">
                  1RM actual: {standards.oneRepMax} kg
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 flex items-center gap-2 text-xs font-mono text-purple-300">
              <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <span>
                ¡Máximo escalón alcanzado! Estás en la categoría <strong>Élite / Maestro de la Fuerza</strong>. Perteneces al percentil 99% de fuerza en este patrón motor.
              </span>
            </div>
          )}

          <p className="text-[11px] text-zinc-500 font-mono italic">
            📚 {standards.standardQuote}
          </p>
        </div>
      </div>

      {/* ── 2. DIAGNÓSTICO DEL COACH MAESTRO DE LA FUERZA ── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
                ANÁLISIS BIOMECÁNICO & PROGRAMACIÓN
              </span>
              <h4 className="text-sm sm:text-base font-black text-white font-mono">
                DIAGNÓSTICO DEL COACH PROFESIONAL
              </h4>
            </div>
          </div>

          <span className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold ${coach.statusBadgeColor}`}>
            {coach.statusLabel}
          </span>
        </div>

        {/* Resumen de Métricas de Progresión */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 block">SESIONES LOGUEADAS</span>
            <strong className="text-white text-sm">{coach.sessionsLogged} registradas</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 block">PROGRESIÓN NETA</span>
            <strong className={`text-sm ${coach.netProgressionKg >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {coach.netProgressionKg >= 0 ? `+${coach.netProgressionKg}` : coach.netProgressionKg} kg ({coach.netProgressionPct >= 0 ? `+${coach.netProgressionPct}` : coach.netProgressionPct}%)
            </strong>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 block">MARCA BASE INICIAL</span>
            <strong className="text-zinc-300 text-sm">{coach.baseline1Rm} kg</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 block">ESTADO SNC</span>
            <strong className="text-amber-400 text-sm">{coach.strengthPillarRating}</strong>
          </div>
        </div>

        {/* Mensaje Pedagógico del Coach */}
        <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-300 text-xs sm:text-sm leading-relaxed space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>{coach.coachHeadline}</span>
          </div>
          <p className="text-zinc-300 font-sans leading-relaxed">
            {coach.coachDiagnosis}
          </p>
        </div>

        {/* Prescripción Táctica para la Próxima Sesión */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-zinc-900 to-zinc-950 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider block">
              PRESCRIPCIÓN PARA TU PRÓXIMA SESIÓN
            </span>
            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-xl sm:text-2xl font-black text-white">
                {coach.nextTargetLoadKg} kg
              </span>
              <span className="text-xs text-zinc-400">
                × {coach.nextTargetRepsStr}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400 pt-0.5">
              <span className="flex items-center gap-1">
                <Timer className="w-3.5 h-3.5 text-emerald-400" />
                Descanso ATP: <strong className="text-zinc-200">{Math.floor(coach.recommendedRestSeconds / 60)} min ({coach.recommendedRestSeconds}s)</strong>
              </span>
            </div>
          </div>

          {onApplyTargetLoad && (
            <button
              type="button"
              onClick={() => onApplyTargetLoad(coach.nextTargetLoadKg)}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-mono font-black text-xs uppercase tracking-wider transition-all transform active:scale-95 shadow-md shadow-amber-400/20 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Zap className="w-3.5 h-3.5 fill-black" />
              <span>APLICAR ESTA CARGA</span>
            </button>
          )}
        </div>

        {/* Clave Biomecánica del Movimiento */}
        <div className="p-3 rounded-xl bg-black border border-zinc-850 flex items-start gap-2.5 text-xs font-mono text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-zinc-300 block mb-0.5">Clave Biomecánica del Maestro:</strong>
            <span className="text-zinc-400">{coach.biomechanicalCue}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
