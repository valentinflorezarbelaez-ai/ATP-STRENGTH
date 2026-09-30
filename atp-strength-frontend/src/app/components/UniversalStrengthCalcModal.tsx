"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  X,
  Zap,
  Flame,
  Activity,
  Shield,
  ChevronRight,
  TrendingUp,
  Target,
  Clock,
  BarChart3,
  RotateCcw,
  Sparkles,
  HeartPulse,
  Award,
  ChevronDown,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// UNIVERSAL STRENGTH & NEUROMUSCULAR PHASE CALCULATOR
// Exercise-agnostic • Submaximal & Direct PR • Coach Mode
// ═══════════════════════════════════════════════════════════════

export interface UniversalStrengthCalcModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTimer?: (seconds: number, title: string) => void;
}

type ExperienceLevel = "beginner" | "intermediate" | "advanced";
type WeightUnit = "kg" | "lb";
type InputMode = "submax" | "direct";
type ActiveTab = "calc" | "protocol" | "coach" | "roadmap";

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
    label: "Foundation",
    desc: "< 1 year",
  },
  intermediate: {
    baselineRatio: 0.72,
    progressionRate: 0.02,
    restMultiplier: 1.0,
    label: "Established",
    desc: "1–3 years",
  },
  advanced: {
    baselineRatio: 0.77,
    progressionRate: 0.015,
    restMultiplier: 0.95,
    label: "Peak / Advanced",
    desc: "3+ years",
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

// Hybrid Brzycki + Epley submaximal 1RM estimation
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
      name: "NEURAL ACTIVATION & MOBILITY",
      purpose: "Prime joint capsules, synovial fluid, and proprioceptors",
      colorClass: "text-cyan-400",
      bgClass: "bg-cyan-500/10",
      borderClass: "border-cyan-500/30",
      pctRange: [0.20, 0.30],
      rpe: "4–5",
      icon: <Zap className="w-4 h-4" />,
      sets: [
        { label: "Set 1", pct: 0.22, reps: "10–12", rest: Math.round(45 * restMul), tempo: "2-0-2-0" },
        { label: "Set 2", pct: 0.30, reps: "8–10", rest: Math.round(60 * restMul), tempo: "2-0-2-0" },
      ],
      instruction:
        "Light, controlled movements. Full joint excursion and clean breathing. Calibrate the neuromuscular groove and lubricate articular surfaces without metabolic fatigue.",
    },
    {
      name: "PROGRESSIVE RAMP & TENSION",
      purpose: "Acclimate connective tissue and load motor units incrementally",
      colorClass: "text-emerald-400",
      bgClass: "bg-emerald-500/10",
      borderClass: "border-emerald-500/30",
      pctRange: [0.42, 0.58],
      rpe: "5–6",
      icon: <Activity className="w-4 h-4" />,
      sets: [
        { label: "Set 1", pct: 0.42, reps: "6–8", rest: Math.round(60 * restMul), tempo: "2-1-1-0" },
        { label: "Set 2", pct: 0.50, reps: "5–6", rest: Math.round(90 * restMul), tempo: "2-1-X-0" },
        { label: "Set 3", pct: 0.58, reps: "4–5", rest: Math.round(90 * restMul), tempo: "2-1-X-0" },
      ],
      instruction:
        "Progressive weight ramp with explosive concentric intent. Each rep must feel crisp. Stop well before fatigue: zero metabolic debt, high neural readiness.",
    },
    {
      name: "POST-ACTIVATION POTENTIATION (PAP)",
      purpose: "Recruit high-threshold Type IIx fibers via neural potentiation",
      colorClass: "text-amber-400",
      bgClass: "bg-amber-500/10",
      borderClass: "border-amber-500/30",
      pctRange: [0.68, 0.76],
      rpe: "7–8",
      icon: <Flame className="w-4 h-4" />,
      sets: [
        { label: "Set 1", pct: 0.68, reps: "3–4", rest: Math.round(120 * restMul), tempo: "2-1-X-1" },
        { label: "Set 2", pct: 0.76, reps: "2–3", rest: Math.round(150 * restMul), tempo: "2-1-X-1" },
      ],
      instruction:
        "MAXIMAL INTENT on every rep. Accelerate through the sticking point. Maximum neural rate coding. Full 2–2.5 min rest to replenish ATP stores.",
    },
    {
      name: "EFFECTIVE WORK — STRENGTH ZONE",
      purpose: "Target zone for myofibrillar tension and maximum force",
      colorClass: "text-orange-400",
      bgClass: "bg-orange-500/10",
      borderClass: "border-orange-500/30",
      pctRange: [0.80, 0.85],
      rpe: "8–9",
      icon: <Target className="w-4 h-4" />,
      sets: [
        { label: "Set 1", pct: 0.80, reps: "4–5", rest: Math.round(180 * restMul), tempo: "3-1-X-1" },
        { label: "Set 2", pct: 0.82, reps: "3–4", rest: Math.round(180 * restMul), tempo: "3-1-X-1" },
        { label: "Set 3", pct: 0.85, reps: "3–4", rest: Math.round(210 * restMul), tempo: "3-1-X-1" },
        { label: "Set 4", pct: 0.85, reps: "2–3", rest: Math.round(210 * restMul), tempo: "3-1-X-1" },
      ],
      instruction:
        "MAXIMUM QUALITY ZONE. Lower under control (3-second eccentric), brief isometric pause, then explode. DO NOT grind to failure. Rest 3–3.5 minutes for full neural battery recovery.",
    },
    {
      name: "PEAK INTENSITY / THRESHOLD",
      purpose: "Maximal voluntary contraction & threshold motor unit recruitment",
      colorClass: "text-red-400",
      bgClass: "bg-red-500/10",
      borderClass: "border-red-500/30",
      pctRange: [0.88, 0.92],
      rpe: "9–10",
      icon: <TrendingUp className="w-4 h-4" />,
      sets: [
        { label: "Set 1", pct: 0.88, reps: "2–3", rest: Math.round(240 * restMul), tempo: "3-2-X-1" },
        {
          label: "Set 2",
          pct: level === "advanced" ? 0.92 : 0.90,
          reps: "1–2",
          rest: Math.round(270 * restMul),
          tempo: "3-2-X-1",
        },
      ],
      instruction:
        "MAXIMUM EFFORT. Only attempt if bar speed was crisp in Phase 4. Maintain pristine structural bracing. If speed drops noticeably (>20%), terminate the set.",
    },
    {
      name: "PARASYMPATHETIC COOLDOWN & DOWN-REG",
      purpose: "Restore vascular balance, flush lactate, transition to recovery",
      colorClass: "text-violet-400",
      bgClass: "bg-violet-500/10",
      borderClass: "border-violet-500/30",
      pctRange: [0.38, 0.48],
      rpe: "4–5",
      icon: <Shield className="w-4 h-4" />,
      sets: [
        { label: "Set 1", pct: 0.48, reps: "8–10", rest: Math.round(60 * restMul), tempo: "3-1-2-0" },
        { label: "Set 2", pct: 0.38, reps: "10–12", rest: Math.round(45 * restMul), tempo: "3-1-2-0" },
      ],
      instruction:
        "Slow, rhythmic reps with deep nasal breathing. Activates the vagus nerve and shifts your autonomic nervous system from sympathetic fight-or-flight to cellular healing.",
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
  const [expandedPhase, setExpandedPhase] = useState<number | null>(3); // auto-expand effective phase
  const [hasCalculated, setHasCalculated] = useState<boolean>(true);

  // PR Protocol input states
  const [protoWeight, setProtoWeight] = useState<number>(60);
  const [protoReps, setProtoReps] = useState<number>(4);

  // Derived 1RM calculation
  const estimated1RM = useMemo(() => {
    if (!mainWeight || mainWeight <= 0) return 0;
    if (inputMode === "direct") return mainWeight;
    return computeSubmax1RM(mainWeight, reps, rir);
  }, [mainWeight, reps, rir, inputMode]);

  // Working max: 90% TM or 100% True Max
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
      { label: "Week 1", tag: "ACCUMULATION", mult: 1.0, colorClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
      { label: "Week 2", tag: "+2.5% LOAD", mult: 1.025, colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
      { label: "Week 3", tag: "+5.0% PEAK", mult: 1.05, colorClass: "text-orange-400 bg-orange-500/10 border-orange-500/30" },
      { label: "Week 4", tag: "DELOAD (-40%)", mult: 0.60, colorClass: "text-violet-400 bg-violet-500/10 border-violet-500/30" },
    ];
  }, [workingMax]);

  const handleStartRest = useCallback(
    (seconds: number, phaseName: string) => {
      if (onStartTimer) {
        onStartTimer(seconds, `REST — ${phaseName}`);
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
        {/* Header */}
        <div className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800 px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-xs sm:text-sm font-mono font-bold tracking-widest text-zinc-100 uppercase">
                  NEURO<span className="text-amber-400">//</span>STRENGTH
                </h2>
                <span className="text-[8px] sm:text-[9px] font-mono px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
                  UNIVERSAL
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] font-mono text-zinc-500 tracking-tight">
                CUALQUIER EJERCICIO • ADAPTACIÓN NEURAL • RECUPERACIÓN ATP
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-zinc-100 transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation — Mobile Adaptive */}
        <div className="grid grid-cols-4 border-b border-zinc-800/80 bg-zinc-900/60 p-1 sm:p-2 gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("calc")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-1.5 sm:py-2 px-1 sm:px-3 rounded-lg text-[10px] sm:text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === "calc"
                ? "bg-amber-500/20 border border-amber-500/50 text-amber-300 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span>CALC</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("protocol")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-1.5 sm:py-2 px-1 sm:px-3 rounded-lg text-[10px] sm:text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === "protocol"
                ? "bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Target className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span>TEST PR</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("coach")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-1.5 sm:py-2 px-1 sm:px-3 rounded-lg text-[10px] sm:text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === "coach"
                ? "bg-orange-500/20 border border-orange-500/50 text-orange-300 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
            <span>COACH</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("roadmap")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-1.5 sm:py-2 px-1 sm:px-3 rounded-lg text-[10px] sm:text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === "roadmap"
                ? "bg-violet-500/20 border border-violet-500/50 text-violet-300 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
            <span>ONDAS</span>
          </button>
        </div>

        {/* Tab 1: Calculator */}
        {activeTab === "calc" && (
          <div className="p-5 space-y-5 overflow-y-auto max-h-[75vh]">
            {/* Input Card */}
            <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4 sm:p-5 space-y-4">
              {/* Segmented Mode Selector */}
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
                  Submaximal Balance (No PR)
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
                  Direct Known 1RM / PR
                </button>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                {inputMode === "submax"
                  ? "Enter a comfortable working set (load, clean reps, and RIR). The engine computes your initial baseline balance and all neuromuscular phases without grinding to failure."
                  : "Enter your tested 1-Rep Max. The engine derives every warm-up, potentiation, and effective working zone based on strict neuromuscular percentages."}
              </p>

              {/* Dynamic Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                {/* Weight Input */}
                <div>
                  <label className="block text-[10px] font-mono font-bold tracking-wider uppercase text-zinc-500 mb-1">
                    {inputMode === "submax" ? "Working Weight" : "Known 1RM / PR"}
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
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 font-mono text-xl font-bold text-center text-zinc-100 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-500 uppercase pointer-events-none">
                      {unit}
                    </span>
                  </div>
                </div>

                {/* Submax: Reps Input */}
                {inputMode === "submax" ? (
                  <div>
                    <label className="block text-[10px] font-mono font-bold tracking-wider uppercase text-zinc-500 mb-1">
                      Clean Reps
                    </label>
                    <input
                      type="number"
                      value={reps || ""}
                      onChange={(e) => setReps(parseInt(e.target.value, 10) || 1)}
                      min={1}
                      max={15}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 font-mono text-xl font-bold text-center text-zinc-100 outline-none focus:border-amber-500"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-mono font-bold tracking-wider uppercase text-zinc-500 mb-1">
                      Unit
                    </label>
                    <div className="flex rounded-xl border border-zinc-700 overflow-hidden h-[46px]">
                      <button
                        type="button"
                        onClick={() => setUnit("kg")}
                        className={`flex-1 font-mono font-bold text-xs transition-all cursor-pointer ${
                          unit === "kg" ? "bg-amber-500 text-zinc-900" : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        KG
                      </button>
                      <button
                        type="button"
                        onClick={() => setUnit("lb")}
                        className={`flex-1 font-mono font-bold text-xs transition-all cursor-pointer ${
                          unit === "lb" ? "bg-amber-500 text-zinc-900" : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        LB
                      </button>
                    </div>
                  </div>
                )}

                {/* Submax: RIR Select */}
                {inputMode === "submax" ? (
                  <div>
                    <label className="block text-[10px] font-mono font-bold tracking-wider uppercase text-zinc-500 mb-1">
                      Reps In Reserve (RIR)
                    </label>
                    <select
                      value={rir}
                      onChange={(e) => setRir(parseInt(e.target.value, 10))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 font-mono text-xs text-zinc-200 outline-none focus:border-amber-500 h-[46px]"
                    >
                      <option value={2}>2 RIR (Safe & Clean - Rec.)</option>
                      <option value={1}>1 RIR (Solid Effort)</option>
                      <option value={0}>0 RIR (Technical Max)</option>
                      <option value={3}>3 RIR (Conservative)</option>
                    </select>
                  </div>
                ) : null}
              </div>

              {/* 90% Training Max Longevity Shield */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <div className="space-y-0.5">
                  <div className="text-xs font-mono font-bold text-zinc-200 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>90% Training Max (Longevity Shield)</span>
                  </div>
                  <p className="text-[10px] text-zinc-500">
                    Bases working sets on 90% of 1RM to safeguard joints, tendons, and eliminate central burnout.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setUseTrainingMax(!useTrainingMax)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    useTrainingMax
                      ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {useTrainingMax ? "ON (REC)" : "OFF (100%)"}
                </button>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-zinc-500 mb-2">
                  Neuromuscular Adaptability
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
                            : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
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

            {/* Results Section */}
            {hasCalculated && workingMax > 0 && (
              <div className="space-y-4">
                {/* 1RM & TM Display Card */}
                <div className="rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/30 p-4 text-center">
                  <span className="block text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-amber-400 mb-1">
                    {useTrainingMax ? "Estimated 1RM & 90% Training Max" : "Calculated 1-Rep Max"}
                  </span>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="font-mono text-3xl font-black text-amber-300">
                      {roundWeight(workingMax, unit)}
                    </span>
                    <span className="text-sm font-mono text-amber-500">{unit}</span>
                    {useTrainingMax && (
                      <span className="text-xs font-mono text-zinc-500 ml-2">
                        (True 1RM: {roundWeight(estimated1RM, unit)} {unit})
                      </span>
                    )}
                  </div>
                  <span className="block text-[10px] text-zinc-400 mt-1">
                    Universal execution prescription • Guaranteed CNS recovery & tendon preservation
                  </span>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="rounded-lg bg-zinc-900/60 border border-zinc-800 p-2 text-center">
                    <span className="block text-[8px] font-mono text-zinc-500 uppercase tracking-wider">Phases</span>
                    <span className="block font-mono text-sm font-bold text-zinc-200">6 Zones</span>
                  </div>
                  <div className="rounded-lg bg-zinc-900/60 border border-zinc-800 p-2 text-center">
                    <span className="block text-[8px] font-mono text-zinc-500 uppercase tracking-wider">Total Sets</span>
                    <span className="block font-mono text-sm font-bold text-zinc-200">{totalSets}</span>
                  </div>
                  <div className="rounded-lg bg-zinc-900/60 border border-zinc-800 p-2 text-center">
                    <span className="block text-[8px] font-mono text-zinc-500 uppercase tracking-wider">Session</span>
                    <span className="block font-mono text-sm font-bold text-zinc-200">~{estimatedDuration}m</span>
                  </div>
                  <div className="rounded-lg bg-zinc-900/60 border border-zinc-800 p-2 text-center">
                    <span className="block text-[8px] font-mono text-zinc-500 uppercase tracking-wider">Effective Load</span>
                    <span className="block font-mono text-sm font-bold text-amber-400">{roundWeight(workingMax * 0.85, unit)} {unit}</span>
                  </div>
                </div>

                {/* Phases Accordion */}
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
                        } bg-zinc-900/60 hover:border-zinc-700`}
                      >
                        {/* Phase Header */}
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
                              PHASE 0{i + 1}
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

                        {/* Phase Body */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-2 border-t border-zinc-800/80 space-y-3 animate-in fade-in duration-200">
                            {/* Sets Table — Mobile Optimized */}
                            <div className="space-y-1.5">
                              <div className="grid grid-cols-5 sm:grid-cols-6 gap-1 sm:gap-2 text-[9px] font-mono text-zinc-500 uppercase tracking-wider px-2">
                                <span>Set</span>
                                <span className="text-center">Weight</span>
                                <span className="text-center">Reps</span>
                                <span className="text-center hidden sm:block">Tempo</span>
                                <span className="text-center">Rest</span>
                                <span className="text-center">Timer</span>
                              </div>
                              {phase.sets.map((set, si) => {
                                const setWeight = roundWeight(workingMax * set.pct, unit);
                                return (
                                  <div
                                    key={si}
                                    className="grid grid-cols-5 sm:grid-cols-6 gap-1 sm:gap-2 items-center bg-zinc-800/40 hover:bg-zinc-800/60 rounded-xl py-2 px-2.5 text-xs font-mono transition-colors"
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
                                      title={`Start ${set.rest}s rest timer`}
                                    >
                                      <Clock className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Phase Instruction */}
                            <div className="p-3 rounded-lg bg-zinc-950/70 border-l-2 border-amber-500 text-xs text-zinc-400 leading-relaxed">
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

        {/* Tab 2: PR Protocol (Safe Assessment) */}
        {activeTab === "protocol" && (
          <div className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 space-y-1">
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                <Target className="w-4 h-4 text-cyan-400" />
                Submaximal Baseline Protocol (Zero Grinders)
              </span>
              <p className="text-xs text-zinc-300">
                Never test a true 1RM to mechanical failure. Use this 3-stage ramp to test any exercise, dumbbell, or machine safely and let the algorithm calculate your exact PR.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                  Stage 01 • Articular Calibration
                </span>
                <h4 className="text-sm font-bold text-zinc-200">Joint Priming & Motion Path</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Perform 10 to 12 smooth reps with empty bar or light pin. Breathe rhythmically. Zero joint friction, calibrate joint alignment.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                  Stage 02 • Progressive Tension
                </span>
                <h4 className="text-sm font-bold text-zinc-200">Ramp Set & Intent Activation</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Load ~50% perceived capacity. Perform 5 crisp, explosive reps. Rest 2 full minutes. Assess bar velocity.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                  Stage 03 • Submaximal Benchmark Set
                </span>
                <h4 className="text-sm font-bold text-zinc-200">The 3–5 Rep Anchor (Strict RIR 2)</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Choose a solid weight you can lift for 3 to 5 reps while strictly keeping 2 reps in reserve. Stop immediately when concentric speed slows down.
                </p>
              </div>
            </div>

            {/* Input benchmark results */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-amber-500/40 space-y-3 text-center">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block">
                ⚡ Input Stage 03 Benchmark Set
              </span>
              <div className="flex gap-3 justify-center items-center">
                <div className="w-32">
                  <label className="block text-[9px] font-mono text-zinc-400 mb-1">LOAD ({unit})</label>
                  <input
                    type="number"
                    value={protoWeight || ""}
                    onChange={(e) => setProtoWeight(parseFloat(e.target.value) || 0)}
                    placeholder="60"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 font-mono text-center font-bold text-zinc-100"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-[9px] font-mono text-zinc-400 mb-1">CLEAN REPS</label>
                  <input
                    type="number"
                    value={protoReps || ""}
                    onChange={(e) => setProtoReps(parseInt(e.target.value, 10) || 1)}
                    min={1}
                    max={10}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 font-mono text-center font-bold text-zinc-100"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={applyProtocolResults}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-amber-500/10 hover:shadow-amber-500/30 transition-all"
              >
                Apply Baseline to Universal Calculator &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Coach Doctrines & ATP Recovery */}
        {activeTab === "coach" && (
          <div className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
            {/* ATP-CP Battery Science */}
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5 uppercase">
                  <Activity className="w-4 h-4" />
                  ATP-CP Neuromuscular Resynthesis Curve
                </span>
                <span className="text-[10px] font-mono text-zinc-400">95–98% Full Recharge</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Phosphocreatine is your muscle&apos;s high-voltage fuel for maximal motor unit recruitment. Cutting rest below 180s depletes the central nervous battery and transforms strength into metabolic endurance.
              </p>
              <div className="grid grid-cols-4 gap-2 pt-2">
                <div className="p-2 rounded bg-zinc-950 border border-zinc-800 text-center">
                  <span className="block font-mono text-[10px] text-red-400 font-bold">30s</span>
                  <span className="block text-[9px] text-zinc-500">50% ATP</span>
                </div>
                <div className="p-2 rounded bg-zinc-950 border border-zinc-800 text-center">
                  <span className="block font-mono text-[10px] text-amber-400 font-bold">90s</span>
                  <span className="block text-[9px] text-zinc-500">85% ATP</span>
                </div>
                <div className="p-2 rounded bg-zinc-950 border border-zinc-800 text-center">
                  <span className="block font-mono text-[10px] text-emerald-400 font-bold">180s</span>
                  <span className="block text-[9px] text-zinc-500">95% ATP</span>
                </div>
                <div className="p-2 rounded bg-zinc-950 border border-zinc-800 text-center">
                  <span className="block font-mono text-[10px] text-cyan-400 font-bold">300s</span>
                  <span className="block text-[9px] text-zinc-500">99% ATP</span>
                </div>
              </div>
            </div>

            {/* Universal Biomechanical Doctrines */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                <div className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>1. Compensatory Acceleration Training (CAT)</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Never move the bar slowly on purpose. Accelerate with 100% velocity intent through the entire concentric range. Force = Mass &times; Acceleration. High intent recruits High-Threshold Type IIx motor units without metabolic burnout.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                <div className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>2. 360-Degree Pneumatic Bracing</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Inhale deep into the pelvic floor and lower ribs, expanding the torso 360 degrees. Lock the abdominal wall to generate Intra-Abdominal Pressure (IAP), creating an immovable hydraulic column that shields the spine.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                <div className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>3. Joint Stacking & Grip Irradiation</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Squeeze the bar or machine handles with maximum white-knuckle tension. Sherrington&apos;s Law of Neural Irradiation dictates that strong grip tension radiates neural drive to forearms, shoulders, and core.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                <div className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  <span>4. The 20% Bar Speed Drop Rule</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  If any rep takes noticeably longer to complete than your first rep (velocity drop &gt;20%), rack the weight. Grinding reps past this threshold delays neurological recovery by days for virtually zero strength gain.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Periodization Roadmap */}
        {activeTab === "roadmap" && (
          <div className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
            <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/30 space-y-1">
              <span className="text-xs font-mono font-bold text-violet-300 uppercase flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-violet-400" />
                4-Week Wave Periodization Curve
              </span>
              <p className="text-xs text-zinc-300">
                Neuromuscular adaptation requires wave loading. Progressive step-loading followed by a mandatory deload prevents neurological stagnation and strengthens collagen bonds.
              </p>
            </div>

            <div className="space-y-2.5">
              {progressionWeeks.map((week, idx) => {
                const weekLoad = roundWeight(workingMax * 0.82 * week.mult, unit);
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-zinc-200">{week.label}</span>
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${week.colorClass}`}>
                          {week.tag}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-500">
                        {idx === 3 ? "Tendon recovery & nervous system healing" : "Step load progression"}
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
              💡 <strong>Advancement Criteria:</strong> If Week 3 effective sets were completed with crisp speed and zero form breakdown, add <strong>2.5% to 5%</strong> to your working baseline for the next cycle.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
