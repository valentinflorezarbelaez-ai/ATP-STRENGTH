"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  X,
  Zap,
  Flame,
  Activity,
  Shield,
  TrendingUp,
  Target,
  Clock,
  BarChart3,
  Award,
  ChevronDown,
} from "lucide-react";
import { NeuromuscularRadarChart } from "@/app/components/NeuromuscularRadarChart";

// ═══════════════════════════════════════════════════════════════
// CALCULADORA UNIVERSAL DE FUERZA & FASES NEUROMUSCULARES
// Agnóstica al ejercicio • Submáximo y Directo • Modo Coach
// ═══════════════════════════════════════════════════════════════

export interface UniversalStrengthCalcModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTimer?: (seconds: number, title: string) => void;
}

type ExperienceLevel = "beginner" | "intermediate" | "advanced";
type WeightUnit = "kg" | "lb";
type InputMode = "submax" | "direct";
type ActiveTab = "calc" | "protocol" | "radar" | "coach" | "roadmap";

interface PhaseSet {
  label: string;
  pct: number;
  reps: string;
  rest: number;
  tempo: string;
}

interface TrainingPhase {
  name: string;
  purpose: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  pctRange: [number, number];
  sets: PhaseSet[];
  instruction: string;
  rpe: string;
  icon: React.ReactNode;
}

const LEVEL_CONFIG: Record<
  ExperienceLevel,
  { baselineRatio: number; progressionRate: number; restMultiplier: number; label: string; desc: string }
> = {
  beginner: {
    baselineRatio: 0.65,
    progressionRate: 0.025,
    restMultiplier: 1.1,
    label: "Iniciación",
    desc: "< 1 año",
  },
  intermediate: {
    baselineRatio: 0.72,
    progressionRate: 0.02,
    restMultiplier: 1.0,
    label: "Intermedio",
    desc: "1–3 años",
  },
  advanced: {
    baselineRatio: 0.77,
    progressionRate: 0.015,
    restMultiplier: 0.95,
    label: "Avanzado / Élite",
    desc: "3+ años",
  },
};

function roundWeight(weight: number, unit: WeightUnit): number {
  const increment = unit === "kg" ? 0.5 : 2.5;
  const minWeight = unit === "kg" ? 5 : 10;
  const rounded = Math.round(weight / increment) * increment;
  return Math.max(rounded, minWeight);
}

function formatRest(seconds: number): string {
  if (seconds >= 60) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}m ${sec ? `${sec}s` : ""}`;
  }
  return `${seconds}s`;
}

// Estimación híbrida submáxima Brzycki + Epley
function computeSubmax1RM(weight: number, reps: number, rir: number): number {
  let totalReps = reps + rir;
  if (totalReps <= 1) return weight;
  if (totalReps >= 37) totalReps = 36;
  const brzycki = weight * (36 / (37 - totalReps));
  const epley = weight * (1 + totalReps / 30);
  return brzycki * 0.5 + epley * 0.5;
}

function getPhases(workingMax: number, level: ExperienceLevel): TrainingPhase[] {
  const restMul = LEVEL_CONFIG[level].restMultiplier;

  return [
    {
      name: "ACTIVACIÓN NEURAL & MOVILIDAD",
      purpose: "Preparar cápsulas articulares, líquido sinovial y propioceptores",
      colorClass: "text-cyan-400",
      bgClass: "bg-cyan-500/10",
      borderClass: "border-cyan-500/30",
      pctRange: [0.20, 0.30],
      rpe: "4–5",
      icon: <Zap className="w-4 h-4" />,
      sets: [
        { label: "Serie 1", pct: 0.22, reps: "10–12", rest: Math.round(45 * restMul), tempo: "2-0-2-0" },
        { label: "Serie 2", pct: 0.30, reps: "8–10", rest: Math.round(60 * restMul), tempo: "2-0-2-0" },
      ],
      instruction:
        "Movimientos ligeros y controlados. Excursión articular completa y respiración diafragmática. Calibra el canal neuromuscular y lubrica articulaciones sin fatiga metabólica.",
    },
    {
      name: "RAMPA PROGRESIVA & TENSIÓN",
      purpose: "Aclimatar tejido conectivo y reclutar unidades motoras progresivamente",
      colorClass: "text-emerald-400",
      bgClass: "bg-emerald-500/10",
      borderClass: "border-emerald-500/30",
      pctRange: [0.42, 0.58],
      rpe: "5–6",
      icon: <Activity className="w-4 h-4" />,
      sets: [
        { label: "Serie 1", pct: 0.42, reps: "6–8", rest: Math.round(60 * restMul), tempo: "2-1-1-0" },
        { label: "Serie 2", pct: 0.50, reps: "5–6", rest: Math.round(90 * restMul), tempo: "2-1-X-0" },
        { label: "Serie 3", pct: 0.58, reps: "4–5", rest: Math.round(90 * restMul), tempo: "2-1-X-0" },
      ],
      instruction:
        "Aumento progresivo con intención concéntrica explosiva (CAT). Cada repetición debe sentirse limpia y rápida. Cortar antes de la fatiga: cero deuda metabólica, máxima frescura neural.",
    },
    {
      name: "POTENCIACIÓN POST-ACTIVACIÓN (PAP)",
      purpose: "Reclutar fibras rápidas Tipo IIx mediante potenciación neural",
      colorClass: "text-amber-400",
      bgClass: "bg-amber-500/10",
      borderClass: "border-amber-500/30",
      pctRange: [0.68, 0.76],
      rpe: "7–8",
      icon: <Flame className="w-4 h-4" />,
      sets: [
        { label: "Serie 1", pct: 0.68, reps: "3–4", rest: Math.round(120 * restMul), tempo: "2-1-X-1" },
        { label: "Serie 2", pct: 0.76, reps: "2–3", rest: Math.round(150 * restMul), tempo: "2-1-X-1" },
      ],
      instruction:
        "MÁXIMA INTENCIÓN en cada repetición. Acelera la barra sin desacelerar. Frecuencia de disparo neural máxima. Descanso de 2 a 2.5 min para resintetizar fosfágenos de ATP.",
    },
    {
      name: "TRABAJO EFECTIVO — ZONA DE FUERZA",
      purpose: "Zona diana para tensión miofibrilar y desarrollo de fuerza máxima",
      colorClass: "text-orange-400",
      bgClass: "bg-orange-500/10",
      borderClass: "border-orange-500/30",
      pctRange: [0.80, 0.85],
      rpe: "8–9",
      icon: <Target className="w-4 h-4" />,
      sets: [
        { label: "Serie 1", pct: 0.80, reps: "4–5", rest: Math.round(180 * restMul), tempo: "3-1-X-1" },
        { label: "Serie 2", pct: 0.82, reps: "3–4", rest: Math.round(180 * restMul), tempo: "3-1-X-1" },
        { label: "Serie 3", pct: 0.85, reps: "3–4", rest: Math.round(210 * restMul), tempo: "3-1-X-1" },
        { label: "Serie 4", pct: 0.85, reps: "2–3", rest: Math.round(210 * restMul), tempo: "3-1-X-1" },
      ],
      instruction:
        "ZONA DE MÁXIMA CALIDAD. Descenso excéntrico controlado (3s), micro-pausa isométrica y explosión concéntrica. NO forzar al fallo. Descanso de 3 a 3.5 min para recargar la batería neural.",
    },
    {
      name: "INTENSIDAD PICO / UMBRAL NEURAL",
      purpose: "Contracción voluntaria máxima y reclutamiento de unidades motoras umbral",
      colorClass: "text-red-400",
      bgClass: "bg-red-500/10",
      borderClass: "border-red-500/30",
      pctRange: [0.88, 0.92],
      rpe: "9–10",
      icon: <TrendingUp className="w-4 h-4" />,
      sets: [
        { label: "Serie 1", pct: 0.88, reps: "2–3", rest: Math.round(240 * restMul), tempo: "3-2-X-1" },
        {
          label: "Serie 2",
          pct: level === "advanced" ? 0.92 : 0.90,
          reps: "1–2",
          rest: Math.round(270 * restMul),
          tempo: "3-2-X-1",
        },
      ],
      instruction:
        "ESFUERZO MÁXIMO. Intentar únicamente si la velocidad de barra fue nítida en Fase 4. Mantener bracing neumático indestructible. Si la velocidad cae >20%, terminar la serie inmediatamente.",
    },
    {
      name: "DESCARGA PARASIMPÁTICA & VÍA VAGAL",
      purpose: "Restaurar equilibrio vascular, aclarar metabolitos y pasar a recuperación celular",
      colorClass: "text-violet-400",
      bgClass: "bg-violet-500/10",
      borderClass: "border-violet-500/30",
      pctRange: [0.38, 0.48],
      rpe: "4–5",
      icon: <Shield className="w-4 h-4" />,
      sets: [
        { label: "Serie 1", pct: 0.48, reps: "8–10", rest: Math.round(60 * restMul), tempo: "3-1-2-0" },
        { label: "Serie 2", pct: 0.38, reps: "10–12", rest: Math.round(45 * restMul), tempo: "3-1-2-0" },
      ],
      instruction:
        "Repeticiones rítmicas lentas con respiración nasal profunda. Activa el nervio vago y conmuta el sistema nervioso autónomo de lucha o huida a regeneración celular.",
    },
  ];
}

export function UniversalStrengthCalcModal({
  isOpen,
  onClose,
  onStartTimer,
}: UniversalStrengthCalcModalProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("calc");
  const [inputMode, setInputMode] = useState<InputMode>("submax");
  const [mainWeight, setMainWeight] = useState<number>(70);
  const [reps, setReps] = useState<number>(6);
  const [rir, setRir] = useState<number>(2);
  const [useTrainingMax, setUseTrainingMax] = useState<boolean>(true);
  const [unit, setUnit] = useState<WeightUnit>("kg");
  const [level, setLevel] = useState<ExperienceLevel>("beginner");
  const [expandedPhase, setExpandedPhase] = useState<number | null>(3); // auto-expandir fase efectiva
  const [hasCalculated, setHasCalculated] = useState<boolean>(true);

  // Estados del Protocolo de Testeo PR
  const [protoWeight, setProtoWeight] = useState<number>(60);
  const [protoReps, setProtoReps] = useState<number>(4);

  // Cálculo derivado de 1RM
  const estimated1RM = useMemo(() => {
    if (!mainWeight || mainWeight <= 0) return 0;
    if (inputMode === "direct") return mainWeight;
    return computeSubmax1RM(mainWeight, reps, rir);
  }, [mainWeight, reps, rir, inputMode]);

  // Balance de trabajo: 90% Training Max o 100% 1RM
  const workingMax = useMemo(() => {
    if (estimated1RM <= 0) return 0;
    return useTrainingMax ? estimated1RM * 0.90 : estimated1RM;
  }, [estimated1RM, useTrainingMax]);

  const phases = useMemo(() => {
    if (workingMax <= 0) return [];
    return getPhases(workingMax, level);
  }, [workingMax, level]);

  const totalSets = useMemo(() => phases.reduce((sum, p) => sum + p.sets.length, 0), [phases]);

  const estimatedDuration = useMemo(() => {
    let totalSeconds = 0;
    phases.forEach((phase) => {
      phase.sets.forEach((set) => {
        const avgReps = parseInt(set.reps) || 5;
        const tempoSec = set.tempo
          .split("-")
          .reduce((a: number, b: string) => a + (b === "X" ? 1 : parseInt(b) || 1), 0);
        totalSeconds += avgReps * tempoSec + set.rest;
      });
    });
    return Math.ceil(totalSeconds / 60);
  }, [phases]);

  const progressionWeeks = useMemo(() => {
    if (workingMax <= 0) return [];
    return [
      { label: "Semana 1", tag: "ACUMULACIÓN", mult: 1.0, colorClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
      { label: "Semana 2", tag: "+2.5% CARGA", mult: 1.025, colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
      { label: "Semana 3", tag: "+5.0% PICO", mult: 1.05, colorClass: "text-orange-400 bg-orange-500/10 border-orange-500/30" },
      { label: "Semana 4", tag: "DESCARGA (-40%)", mult: 0.60, colorClass: "text-violet-400 bg-violet-500/10 border-violet-500/30" },
    ];
  }, [workingMax]);

  const handleStartRest = useCallback(
    (seconds: number, phaseName: string) => {
      if (onStartTimer) {
        onStartTimer(seconds, `DESCANSO — ${phaseName}`);
      }
    },
    [onStartTimer]
  );

  const applyProtocolResults = () => {
    if (!protoWeight || protoWeight <= 0) return;
    setInputMode("submax");
    setMainWeight(protoWeight);
    setReps(protoReps || 4);
    setRir(2);
    setActiveTab("calc");
    setHasCalculated(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md overflow-hidden p-0 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full sm:max-w-3xl h-[100dvh] sm:h-auto sm:max-h-[88vh] rounded-t-2xl sm:rounded-2xl bg-zinc-950 border-t sm:border border-zinc-800 shadow-2xl shadow-amber-500/10 overflow-hidden flex flex-col">
        {/* Encabezado Oscuro Obsidian */}
        <div className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800 px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-xs sm:text-sm font-mono font-bold tracking-widest text-zinc-100 uppercase">
                  NEURO<span className="text-amber-400">{"//"}</span>STRENGTH
                </h2>
                <span className="text-[8px] sm:text-[9px] font-mono px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
                  UNIVERSAL
                </span>
              </div>
              <p className="text-sm text-zinc-400">
                Calculadora de cargas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-11 min-w-11 rounded-xl border border-zinc-800 text-zinc-200 cursor-pointer inline-flex items-center justify-center"
            aria-label="Cerrar calculadora"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navegación por Pestañas */}
        <div className="grid grid-cols-5 border-b border-zinc-800/80 bg-zinc-900/60 p-1 sm:p-2 gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("calc")}
            className={`flex items-center justify-center gap-1 min-h-11 px-1 rounded-lg text-sm font-medium cursor-pointer ${
              activeTab === "calc"
                ? "bg-amber-500/20 border border-amber-500/50 text-amber-300"
                : "text-zinc-300"
            }`}
          >
            <span>Fases</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("protocol")}
            className={`flex items-center justify-center gap-1 min-h-11 px-1 rounded-lg text-sm font-medium cursor-pointer ${
              activeTab === "protocol"
                ? "bg-cyan-500/20 border border-cyan-500/50 text-cyan-300"
                : "text-zinc-300"
            }`}
          >
            <span>Marca</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("radar")}
            className={`flex items-center justify-center gap-1 min-h-11 px-1 rounded-lg text-sm font-medium cursor-pointer ${
              activeTab === "radar"
                ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-300"
                : "text-zinc-300"
            }`}
          >
            <span>Equilibrio</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("coach")}
            className={`flex items-center justify-center gap-1 min-h-11 px-1 rounded-lg text-sm font-medium cursor-pointer ${
              activeTab === "coach"
                ? "bg-orange-500/20 border border-orange-500/50 text-orange-300"
                : "text-zinc-300"
            }`}
          >
            <span>Coach</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("roadmap")}
            className={`flex items-center justify-center gap-1 min-h-11 px-1 rounded-lg text-sm font-medium cursor-pointer ${
              activeTab === "roadmap"
                ? "bg-violet-500/20 border border-violet-500/50 text-violet-300"
                : "text-zinc-300"
            }`}
          >
            <span>Semanas</span>
          </button>
        </div>

        {/* Pestaña: Simetría Neuromuscular & Pentágono */}
        {activeTab === "radar" && (
          <div className="p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto overscroll-contain pb-24 sm:pb-6">
            <NeuromuscularRadarChart currentWorkingWeight={workingMax} />
          </div>
        )}

        {/* Pestaña 1: Calculadora de Fases */}
        {activeTab === "calc" && (
          <div className="p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto overscroll-contain pb-24 sm:pb-6">
            {/* Tarjeta de Entrada Oscura */}
            <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4 sm:p-5 space-y-4">
              {/* Selector de Modo */}
              <div className="grid grid-cols-2 gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setInputMode("submax")}
                  className={`py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    inputMode === "submax"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Balance Submáximo (Sin PR)
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("direct")}
                  className={`py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    inputMode === "direct"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  1RM / PR Conocido Directo
                </button>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                {inputMode === "submax"
                  ? "Ingresá una serie de trabajo cómoda (carga, repeticiones limpias y RIR). El motor calcula tu balance base inicial y todas las fases neuromusculares sin llegar al fallo."
                  : "Ingresá tu 1-Rep Max comprobado. El motor deriva cada zona de aproximación, potenciación PAP y series efectivas según porcentajes neuromusculares rigurosos."}
              </p>

              {/* Cuadrícula de Entradas Dinámica */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                {/* Entrada de Carga */}
                <div>
                  <label className="block text-[10px] font-mono font-bold tracking-wider uppercase text-zinc-400 mb-1">
                    {inputMode === "submax" ? "Carga de Trabajo" : "1RM / PR Conocido"}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={mainWeight || ""}
                      onChange={(e) => setMainWeight(parseFloat(e.target.value) || 0)}
                      placeholder="70"
                      min={1}
                      max={999}
                      step={0.5}
                      inputMode="decimal"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 font-mono text-xl font-bold text-center text-zinc-100 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-500 uppercase pointer-events-none">
                      {unit}
                    </span>
                  </div>
                </div>

                {/* Entrada de Repeticiones */}
                {inputMode === "submax" ? (
                  <div>
                    <label className="block text-[10px] font-mono font-bold tracking-wider uppercase text-zinc-400 mb-1">
                      Repeticiones Limpias
                    </label>
                    <input
                      type="number"
                      value={reps || ""}
                      onChange={(e) => setReps(parseInt(e.target.value, 10) || 1)}
                      min={1}
                      max={15}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 font-mono text-xl font-bold text-center text-zinc-100 outline-none focus:border-amber-500"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-mono font-bold tracking-wider uppercase text-zinc-400 mb-1">
                      Unidad de Peso
                    </label>
                    <div className="flex rounded-xl border border-zinc-700 overflow-hidden h-[46px]">
                      <button
                        type="button"
                        onClick={() => setUnit("kg")}
                        className={`flex-1 font-mono font-bold text-xs transition-all cursor-pointer ${
                          unit === "kg" ? "bg-amber-500 text-zinc-950" : "bg-zinc-950 text-zinc-400"
                        }`}
                      >
                        KG
                      </button>
                      <button
                        type="button"
                        onClick={() => setUnit("lb")}
                        className={`flex-1 font-mono font-bold text-xs transition-all cursor-pointer ${
                          unit === "lb" ? "bg-amber-500 text-zinc-950" : "bg-zinc-950 text-zinc-400"
                        }`}
                      >
                        LB
                      </button>
                    </div>
                  </div>
                )}

                {/* Selector RIR */}
                {inputMode === "submax" ? (
                  <div>
                    <label className="block text-[10px] font-mono font-bold tracking-wider uppercase text-zinc-400 mb-1">
                      Repeticiones en Reserva (RIR)
                    </label>
                    <select
                      value={rir}
                      onChange={(e) => setRir(parseInt(e.target.value, 10))}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 font-mono text-xs text-zinc-200 outline-none focus:border-amber-500 h-[46px]"
                    >
                      <option value={2}>2 RIR (Seguro y Limpio - Recomendado)</option>
                      <option value={1}>1 RIR (Esfuerzo Sólido)</option>
                      <option value={0}>0 RIR (Máximo Técnico)</option>
                      <option value={3}>3 RIR (Conservador)</option>
                    </select>
                  </div>
                ) : null}
              </div>

              {/* Escudo de Longevidad: 90% Training Max */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <div className="space-y-0.5">
                  <div className="text-xs font-mono font-bold text-zinc-200 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>Trabajar al 90%</span>
                  </div>
                  <p className="text-sm text-zinc-400">
                    Las series salen del 90% de tu máximo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setUseTrainingMax(!useTrainingMax)}
                  className={`min-h-11 px-4 rounded-xl text-sm font-semibold cursor-pointer ${
                    useTrainingMax
                      ? "bg-amber-400 text-black"
                      : "bg-zinc-800 text-zinc-200"
                  }`}
                >
                  {useTrainingMax ? "Al 90%" : "Al máximo"}
                </button>
              </div>

              {/* Nivel de Experiencia */}
              <div>
                <label className="block text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-zinc-400 mb-2">
                  Adaptabilidad Neuromuscular
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.entries(LEVEL_CONFIG) as [ExperienceLevel, typeof LEVEL_CONFIG.beginner][]).map(
                    ([key, cfg]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setLevel(key)}
                        className={`rounded-lg border p-2 text-center transition-all cursor-pointer ${
                          level === key
                            ? "border-amber-500 bg-amber-500/10"
                            : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                        }`}
                      >
                        <span
                          className={`block text-[10px] font-mono font-bold tracking-wider uppercase ${
                            level === key ? "text-amber-400" : "text-zinc-400"
                          }`}
                        >
                          {cfg.label}
                        </span>
                        <span className="block text-[9px] text-zinc-500">{cfg.desc}</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Sección de Resultados */}
            {hasCalculated && workingMax > 0 && (
              <div className="space-y-4">
                {/* Tarjeta de Visualización de 1RM & TM */}
                <div className="rounded-xl bg-zinc-950 border border-amber-500/30 p-4 text-center">
                  <span className="block text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-amber-400 mb-1">
                    {useTrainingMax ? "1RM Estimado & Training Max al 90%" : "1-Rep Max Calculado"}
                  </span>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="font-mono text-3xl font-black text-amber-300">
                      {roundWeight(workingMax, unit)}
                    </span>
                    <span className="text-sm font-mono text-amber-500">{unit}</span>
                    {useTrainingMax && (
                      <span className="text-xs font-mono text-zinc-500 ml-2">
                        (1RM Real: {roundWeight(estimated1RM, unit)} {unit})
                      </span>
                    )}
                  </div>
                  <span className="block text-[10px] text-zinc-400 mt-1">
                    Prescripción universal • Resíntesis de ATP y protección de tendones garantizada
                  </span>
                </div>

                {/* Métricas de Resumen */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-2 text-center">
                    <span className="block text-[8px] font-mono text-zinc-500 uppercase tracking-wider">Fases</span>
                    <span className="block font-mono text-sm font-bold text-zinc-200">6 Zonas</span>
                  </div>
                  <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-2 text-center">
                    <span className="block text-[8px] font-mono text-zinc-500 uppercase tracking-wider">Series</span>
                    <span className="block font-mono text-sm font-bold text-zinc-200">{totalSets}</span>
                  </div>
                  <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-2 text-center">
                    <span className="block text-[8px] font-mono text-zinc-500 uppercase tracking-wider">Sesión</span>
                    <span className="block font-mono text-sm font-bold text-zinc-200">~{estimatedDuration}m</span>
                  </div>
                  <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-2 text-center">
                    <span className="block text-[8px] font-mono text-zinc-500 uppercase tracking-wider">Carga Trabajo</span>
                    <span className="block font-mono text-sm font-bold text-amber-400">{roundWeight(workingMax * 0.85, unit)} {unit}</span>
                  </div>
                </div>

                {/* Acordeón de Fases Neuromusculares */}
                <div className="space-y-2.5">
                  {phases.map((phase, i) => {
                    const isExpanded = expandedPhase === i;
                    const avgPct = (phase.pctRange[0] + phase.pctRange[1]) / 2;
                    const mainWeightForPhase = roundWeight(workingMax * avgPct, unit);
                    const pctLabel = `${Math.round(phase.pctRange[0] * 100)}–${Math.round(phase.pctRange[1] * 100)}%`;

                    return (
                      <div
                        key={i}
                        className={`rounded-xl border transition-all duration-300 ${
                          isExpanded ? phase.borderClass : "border-zinc-800"
                        } bg-zinc-950 hover:border-zinc-700`}
                      >
                        {/* Cabecera de Fase */}
                        <button
                          type="button"
                          onClick={() => setExpandedPhase(isExpanded ? null : i)}
                          className="w-full flex items-center gap-3 p-3.5 cursor-pointer text-left"
                          aria-expanded={isExpanded}
                        >
                          <div className={`p-2 rounded-lg ${phase.bgClass} ${phase.colorClass} flex-shrink-0`}>
                            {phase.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="block text-[9px] font-mono text-zinc-500 tracking-wider uppercase">
                              FASE 0{i + 1}
                            </span>
                            <span className={`block text-xs font-mono font-bold tracking-wide ${phase.colorClass}`}>
                              {phase.name}
                            </span>
                            <span className="block text-[10px] text-zinc-400 truncate">{phase.purpose}</span>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className={`block font-mono text-base font-black ${phase.colorClass}`}>
                              {mainWeightForPhase} {unit}
                            </span>
                            <span className="block text-[9px] font-mono text-zinc-500">{pctLabel}</span>
                          </div>
                          <ChevronDown
                            className={`w-4 h-4 text-zinc-500 transition-transform duration-300 flex-shrink-0 ${
                              isExpanded ? "rotate-180 text-amber-400" : ""
                            }`}
                          />
                        </button>

                        {/* Cuerpo de Fase */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-2 border-t border-zinc-800/80 space-y-3 animate-in fade-in duration-200">
                            {/* Tabla de Series */}
                            <div className="space-y-1.5">
                              <div className="grid grid-cols-5 sm:grid-cols-6 gap-1 sm:gap-2 text-[9px] font-mono text-zinc-500 uppercase tracking-wider px-2">
                                <span>Serie</span>
                                <span className="text-center">Carga</span>
                                <span className="text-center">Reps</span>
                                <span className="text-center hidden sm:block">Tempo</span>
                                <span className="text-center">Descanso</span>
                                <span className="text-center">Timer</span>
                              </div>
                              {phase.sets.map((set, si) => {
                                const setWeight = roundWeight(workingMax * set.pct, unit);
                                return (
                                  <div
                                    key={si}
                                    className="grid grid-cols-5 sm:grid-cols-6 gap-1 sm:gap-2 items-center bg-zinc-900/60 hover:bg-zinc-900 rounded-xl py-2 px-2.5 text-xs font-mono transition-colors"
                                  >
                                    <span className="text-zinc-500 text-[10px] font-bold">{set.label}</span>
                                    <span className={`text-center font-bold text-xs sm:text-sm ${phase.colorClass}`}>
                                      {setWeight} <span className="text-[10px] opacity-75">{unit}</span>
                                    </span>
                                    <span className="text-center text-zinc-300 font-medium">{set.reps}</span>
                                    <span className="text-center text-zinc-400 hidden sm:block">{set.tempo}</span>
                                    <span className="text-center text-zinc-300">{formatRest(set.rest)}</span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStartRest(set.rest, phase.name);
                                      }}
                                      className="flex items-center justify-center w-8 h-8 mx-auto rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-zinc-950 active:scale-90 transition-all cursor-pointer shadow-sm"
                                      title={`Iniciar descanso de ${set.rest}s`}
                                    >
                                      <Clock className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Instrucción de Fase */}
                            <div className="p-3 rounded-lg bg-zinc-900/80 border-l-2 border-amber-500 text-xs text-zinc-300 leading-relaxed">
                              {phase.instruction}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pestaña 2: Protocolo PR de Calibración */}
        {activeTab === "protocol" && (
          <div className="p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto overscroll-contain pb-24 sm:pb-6">
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 space-y-1">
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                <Target className="w-4 h-4 text-cyan-400" />
                Protocolo Submáximo de Calibración (Cero Fallo Mecánico)
              </span>
              <p className="text-xs text-zinc-300">
                Nunca testees un 1RM al fallo mecánico. Usá esta rampa de 3 etapas para testear cualquier ejercicio (barra, mancuerna o máquina) de forma segura y dejar que el algoritmo calcule tu PR exacto.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                  Etapa 01 • Calibración Articular
                </span>
                <h4 className="text-sm font-bold text-zinc-200">Preparación Articular y Trayectoria</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Realizá de 10 a 12 repeticiones fluidas con barra vacía o polea ligera. Respiración diafragmática. Cero fricción y alineación articular perfecta.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                  Etapa 02 • Tensión Progresiva
                </span>
                <h4 className="text-sm font-bold text-zinc-200">Rampa de Carga & Activación</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Cargá ~50% de tu capacidad percibida. Ejecutá 5 repeticiones explosivas y nítidas. Descanso de 2 minutos completos. Evaluá la velocidad concéntrica.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                  Etapa 03 • Serie Ancla Submáxima
                </span>
                <h4 className="text-sm font-bold text-zinc-200">El Ancla de 3–5 Reps (RIR 2 Estricto)</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Elegí una carga sólida que puedas mover entre 3 y 5 repeticiones manteniendo estrictamente 2 repeticiones en reserva (RIR 2). Detené la serie en cuanto la velocidad concéntrica empiece a decaer.
                </p>
              </div>
            </div>

            {/* Entrada de Resultados */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-amber-500/40 space-y-3 text-center">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block">
                ⚡ Ingresar Resultados de la Etapa 03
              </span>
              <div className="flex gap-3 justify-center items-center">
                <div className="w-32">
                  <label className="block text-[9px] font-mono text-zinc-400 mb-1">CARGA ({unit})</label>
                  <input
                    type="number"
                    value={protoWeight || ""}
                    onChange={(e) => setProtoWeight(parseFloat(e.target.value) || 0)}
                    placeholder="60"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 font-mono text-center font-bold text-zinc-100"
                  />
                </div>
                <div className="w-28">
                  <label className="block text-[9px] font-mono text-zinc-400 mb-1">REPS LIMPIAS</label>
                  <input
                    type="number"
                    value={protoReps || ""}
                    onChange={(e) => setProtoReps(parseInt(e.target.value, 10) || 1)}
                    min={1}
                    max={10}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 font-mono text-center font-bold text-zinc-100"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={applyProtocolResults}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-amber-500/10 hover:shadow-amber-500/30 transition-all"
              >
                Aplicar al Calculador Universal de Fases &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Pestaña 3: Doctrinas del Coach & Recuperación ATP */}
        {activeTab === "coach" && (
          <div className="p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto overscroll-contain pb-24 sm:pb-6">
            {/* Ciencia de Resíntesis de ATP-CP */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5 uppercase">
                  <Activity className="w-4 h-4" />
                  Curva de Resíntesis Neuromuscular de ATP-CP
                </span>
                <span className="text-[10px] font-mono text-zinc-400">95–98% Recarga Completa</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                La fosfocreatina es el combustible de alto voltaje para el reclutamiento de unidades motoras rápidas. Acortar el descanso por debajo de 180s agota la batería del sistema nervioso central y convierte la fuerza en resistencia metabólica.
              </p>
              <div className="grid grid-cols-4 gap-2 pt-2">
                <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-center">
                  <span className="block font-mono text-[10px] text-red-400 font-bold">30s</span>
                  <span className="block text-[9px] text-zinc-400">50% ATP</span>
                </div>
                <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-center">
                  <span className="block font-mono text-[10px] text-amber-400 font-bold">90s</span>
                  <span className="block text-[9px] text-zinc-400">85% ATP</span>
                </div>
                <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-center">
                  <span className="block font-mono text-[10px] text-emerald-400 font-bold">180s</span>
                  <span className="block text-[9px] text-zinc-400">95% ATP</span>
                </div>
                <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-center">
                  <span className="block font-mono text-[10px] text-cyan-400 font-bold">300s</span>
                  <span className="block text-[9px] text-zinc-400">99% ATP</span>
                </div>
              </div>
            </div>

            {/* Doctrinas Biomecánicas Universales */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <div className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>1. Entrenamiento de Aceleración Compensatoria (CAT)</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Nunca muevas la barra lento a propósito. Acelera con 100% de intención concéntrica a lo largo de todo el rango. Fuerza = Masa &times; Aceleración. La aceleración concéntrica máxima recluta unidades motoras tipo IIx sin fatiga metabólica.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <div className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>2. Bracing Neumático en 360 Grados</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Inhala expandiendo el torso hacia el piso pélvico y costillas inferiores en 360°. Tensa la pared abdominal para generar Presión Intra-Abdominal (PIA), creando una columna hidráulica rígida que protege la columna lumbar.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <div className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>3. Irradiación Neural & Agarre Férreo</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Aprieta la barra o mancuerna con máxima fuerza de agarre. La Ley de Irradiación de Sherrington demuestra que la tensión de agarre amplifica la señal nerviosa y estabiliza hombros, escápulas y torso.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <div className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  <span>4. Regla del 20% de Caída de Velocidad</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Si una repetición tarda visiblemente más en subir que la primera (caída de velocidad &gt;20%), termina la serie. Las repeticiones forzadas al fallo retrasan la recuperación neural días enteros con nulo estímulo extra de fuerza.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pestaña 4: Periodización por Ondas */}
        {activeTab === "roadmap" && (
          <div className="p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto overscroll-contain pb-24 sm:pb-6">
            <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/30 space-y-1">
              <span className="text-xs font-mono font-bold text-violet-300 uppercase flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-violet-400" />
                Curva de Periodización por Ondas (4 Semanas)
              </span>
              <p className="text-xs text-zinc-300">
                La adaptación neuromuscular requiere ondulación de cargas. Progresión escalonada seguida de una descarga obligatoria evita el estancamiento neural y regenera los enlaces de colágeno.
              </p>
            </div>

            <div className="space-y-2.5">
              {progressionWeeks.map((week, idx) => {
                const weekLoad = roundWeight(workingMax * 0.82 * week.mult, unit);
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-zinc-200">{week.label}</span>
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${week.colorClass}`}>
                          {week.tag}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-500">
                        {idx === 3 ? "Regeneración de tendones y sistema nervioso" : "Sobrecarga progresiva controlada"}
                      </span>
                    </div>
                    <span className="font-mono text-base font-black text-amber-400">
                      {weekLoad} {unit}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 leading-relaxed">
              💡 <strong>Criterio de Avance:</strong> Si completaste las series de la Semana 3 con velocidad nítida y técnica impecable, sumá entre <strong>2.5% y 5%</strong> a tu balance de trabajo para el próximo ciclo.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
