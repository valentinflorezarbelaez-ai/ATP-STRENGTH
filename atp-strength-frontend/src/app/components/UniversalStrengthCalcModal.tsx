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
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// UNIVERSAL STRENGTH PHASE CALCULATOR
// No exercise-specific data — works with any movement pattern
// ═══════════════════════════════════════════════════════════════

export interface UniversalStrengthCalcModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTimer?: (seconds: number, title: string) => void;
}

type ExperienceLevel = "beginner" | "intermediate" | "advanced";
type WeightUnit = "kg" | "lb";

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

// Experience level configuration
const LEVEL_CONFIG: Record<
  ExperienceLevel,
  { baselineRatio: number; progressionRate: number; restMultiplier: number; label: string; desc: string }
> = {
  beginner: {
    baselineRatio: 0.65,
    progressionRate: 0.025,
    restMultiplier: 1.1,
    label: "Beginner",
    desc: "< 1 year",
  },
  intermediate: {
    baselineRatio: 0.72,
    progressionRate: 0.02,
    restMultiplier: 1.0,
    label: "Intermediate",
    desc: "1–3 years",
  },
  advanced: {
    baselineRatio: 0.77,
    progressionRate: 0.015,
    restMultiplier: 0.95,
    label: "Advanced",
    desc: "3+ years",
  },
};

function roundWeight(weight: number, unit: WeightUnit): number {
  const increment = unit === "kg" ? 0.5 : 2.5;
  const minWeight = unit === "kg" ? 10 : 22.5;
  const rounded = Math.round(weight / increment) * increment;
  return Math.max(rounded, minWeight);
}

function formatRest(seconds: number): string {
  if (seconds >= 60) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${String(sec).padStart(2, "0")}`;
  }
  return `${seconds}s`;
}

function getPhases(estimated1RM: number, level: ExperienceLevel): TrainingPhase[] {
  const restMul = LEVEL_CONFIG[level].restMultiplier;

  return [
    {
      name: "NEURAL ACTIVATION",
      purpose: "Activate motor units, stabilizers & proprioceptors",
      colorClass: "text-cyan-400",
      bgClass: "bg-cyan-500/10",
      borderClass: "border-cyan-500/30",
      pctRange: [0.2, 0.3],
      rpe: "4–5",
      icon: <Zap className="w-4 h-4" />,
      sets: [
        { label: "Set 1", pct: 0.2, reps: "12–15", rest: Math.round(30 * restMul), tempo: "2-0-2-0" },
        { label: "Set 2", pct: 0.3, reps: "10–12", rest: Math.round(45 * restMul), tempo: "2-0-2-0" },
      ],
      instruction:
        "Light, controlled movements. Full range of motion. Mind-muscle connection. Primes the neuromuscular junction for heavy loading.",
    },
    {
      name: "PROGRESSIVE WARM-UP",
      purpose: "Gradually increase load, prepare connective tissue & joints",
      colorClass: "text-emerald-400",
      bgClass: "bg-emerald-500/10",
      borderClass: "border-emerald-500/30",
      pctRange: [0.4, 0.55],
      rpe: "5–6",
      icon: <Activity className="w-4 h-4" />,
      sets: [
        { label: "Set 1", pct: 0.4, reps: "8–10", rest: Math.round(60 * restMul), tempo: "2-1-1-0" },
        { label: "Set 2", pct: 0.5, reps: "6–8", rest: Math.round(75 * restMul), tempo: "2-1-1-0" },
        { label: "Set 3", pct: 0.55, reps: "5–6", rest: Math.round(90 * restMul), tempo: "2-1-X-0" },
      ],
      instruction:
        "Progressive weight increase. Explosive concentric, controlled eccentric. Joints and tendons loading up for peak performance.",
    },
    {
      name: "NEURAL POTENTIATION",
      purpose: "Prime CNS for maximal force production",
      colorClass: "text-amber-400",
      bgClass: "bg-amber-500/10",
      borderClass: "border-amber-500/30",
      pctRange: [0.65, 0.75],
      rpe: "7–8",
      icon: <Flame className="w-4 h-4" />,
      sets: [
        { label: "Set 1", pct: 0.65, reps: "4–5", rest: Math.round(120 * restMul), tempo: "2-1-X-1" },
        { label: "Set 2", pct: 0.75, reps: "3–4", rest: Math.round(150 * restMul), tempo: "2-1-X-1" },
      ],
      instruction:
        "MAXIMAL INTENT on every rep. Accelerate the concentric phase as fast as possible. The CNS is priming rate coding and motor unit synchronization.",
    },
    {
      name: "EFFECTIVE WORK — STRENGTH",
      purpose: "Primary strength stimulus zone",
      colorClass: "text-orange-400",
      bgClass: "bg-orange-500/10",
      borderClass: "border-orange-500/30",
      pctRange: [0.8, 0.85],
      rpe: "8–9",
      icon: <Target className="w-4 h-4" />,
      sets: [
        { label: "Set 1", pct: 0.8, reps: "4–6", rest: Math.round(180 * restMul), tempo: "3-1-X-1" },
        { label: "Set 2", pct: 0.82, reps: "4–5", rest: Math.round(180 * restMul), tempo: "3-1-X-1" },
        { label: "Set 3", pct: 0.85, reps: "3–5", rest: Math.round(210 * restMul), tempo: "3-1-X-1" },
        { label: "Set 4", pct: 0.85, reps: "3–5", rest: Math.round(210 * restMul), tempo: "3-1-X-1" },
      ],
      instruction:
        "THIS IS WHERE STRENGTH IS BUILT. Control eccentric (3s), brief pause, EXPLODE. If you cannot complete minimum reps, reduce 5%. Full rest is MANDATORY.",
    },
    {
      name: "PEAK INTENSITY",
      purpose: "Maximal neural recruitment & 1RM approach",
      colorClass: "text-red-400",
      bgClass: "bg-red-500/10",
      borderClass: "border-red-500/30",
      pctRange: [0.88, 0.95],
      rpe: "9–10",
      icon: <TrendingUp className="w-4 h-4" />,
      sets: [
        { label: "Set 1", pct: 0.88, reps: "2–3", rest: Math.round(240 * restMul), tempo: "3-2-X-1" },
        {
          label: "Set 2",
          pct: level === "advanced" ? 0.92 : 0.9,
          reps: "1–2",
          rest: Math.round(300 * restMul),
          tempo: "3-2-X-1",
        },
      ],
      instruction:
        "MAXIMUM EFFORT. Use spotter or safety equipment. Recruits highest-threshold motor units. Skip if previous phases felt unstable. Beginners: limit to 1 set at 88%.",
    },
    {
      name: "NEURAL COOLDOWN",
      purpose: "Controlled deload, restore parasympathetic balance",
      colorClass: "text-violet-400",
      bgClass: "bg-violet-500/10",
      borderClass: "border-violet-500/30",
      pctRange: [0.4, 0.5],
      rpe: "5–6",
      icon: <Shield className="w-4 h-4" />,
      sets: [
        { label: "Set 1", pct: 0.5, reps: "8–10", rest: Math.round(60 * restMul), tempo: "3-1-2-0" },
        { label: "Set 2", pct: 0.4, reps: "10–12", rest: Math.round(45 * restMul), tempo: "3-1-2-0" },
      ],
      instruction:
        "Slow, controlled reps. Focus on blood flow. Flush metabolic waste, reduce DOMS, transition from sympathetic to parasympathetic state.",
    },
  ];
}

export function UniversalStrengthCalcModal({
  isOpen,
  onClose,
  onStartTimer,
}: UniversalStrengthCalcModalProps) {
  const [baselineWeight, setBaselineWeight] = useState<number>(0);
  const [unit, setUnit] = useState<WeightUnit>("kg");
  const [level, setLevel] = useState<ExperienceLevel>("beginner");
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);

  const estimated1RM = useMemo(() => {
    if (!baselineWeight || baselineWeight <= 0) return 0;
    return baselineWeight / LEVEL_CONFIG[level].baselineRatio;
  }, [baselineWeight, level]);

  const phases = useMemo(() => {
    if (estimated1RM <= 0) return [];
    return getPhases(estimated1RM, level);
  }, [estimated1RM, level]);

  const totalSets = useMemo(() => phases.reduce((sum, p) => sum + p.sets.length, 0), [phases]);

  const estimatedDuration = useMemo(() => {
    let totalSeconds = 0;
    phases.forEach((phase) => {
      phase.sets.forEach((set) => {
        const avgReps = parseInt(set.reps) || 5;
        const tempoSec = set.tempo
          .split("-")
          .reduce((a: number, b: string) => a + (b === "X" ? 1 : parseInt(b)), 0);
        totalSeconds += avgReps * tempoSec + set.rest;
      });
    });
    return Math.ceil(totalSeconds / 60);
  }, [phases]);

  const progressionWeeks = useMemo(() => {
    if (estimated1RM <= 0) return [];
    const rate = LEVEL_CONFIG[level].progressionRate;
    return [
      { label: "Week 1", tag: "BASE", multiplier: 1.0, colorClass: "bg-emerald-400" },
      { label: "Week 2", tag: `+${Math.round(rate * 100)}%`, multiplier: 1.0 + rate, colorClass: "bg-amber-400" },
      { label: "Week 3", tag: `+${Math.round(rate * 2 * 100)}%`, multiplier: 1.0 + rate * 2, colorClass: "bg-orange-400" },
      { label: "Week 4", tag: "DELOAD", multiplier: 0.6, colorClass: "bg-violet-400" },
    ];
  }, [estimated1RM, level]);

  const handleCalculate = useCallback(() => {
    if (!baselineWeight || baselineWeight <= 0) return;
    setHasCalculated(true);
    setExpandedPhase(null);
  }, [baselineWeight]);

  const handleStartRest = useCallback(
    (seconds: number, phaseName: string) => {
      if (onStartTimer) {
        onStartTimer(seconds, `REST — ${phaseName}`);
      }
    },
    [onStartTimer]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl mx-auto my-4 md:my-8 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl shadow-amber-500/5 overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
              <BarChart3 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold tracking-widest text-zinc-100 uppercase">
                Universal <span className="text-amber-400">Phase</span> Calc
              </h2>
              <p className="text-[10px] font-mono text-zinc-500 tracking-wide">
                ANY EXERCISE • FULL PROTOCOL
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

        <div className="p-5 space-y-5">
          {/* Input Section */}
          <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-5 space-y-4">
            <div>
              <label className="block text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-zinc-500 mb-1">
                Working Baseline
              </label>
              <p className="text-xs text-zinc-400 mb-3">
                Weight you can comfortably lift for{" "}
                <span className="text-amber-400 font-semibold">8–10 reps</span> with good form.
                Works for any exercise — barbell, dumbbell, machine, or bodyweight.
              </p>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={baselineWeight || ""}
                    onChange={(e) => setBaselineWeight(parseFloat(e.target.value) || 0)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCalculate();
                    }}
                    placeholder="0"
                    min={1}
                    max={999}
                    step={0.5}
                    inputMode="decimal"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 font-mono text-2xl font-bold text-center text-zinc-100 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all placeholder:text-zinc-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    aria-label="Baseline weight"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-500 uppercase pointer-events-none">
                    {unit}
                  </span>
                </div>
                <div className="flex rounded-xl border border-zinc-700 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      if (unit === "lb" && baselineWeight) {
                        setBaselineWeight(Math.round((baselineWeight / 2.20462) * 2) / 2);
                      }
                      setUnit("kg");
                    }}
                    className={`px-3 py-2 text-xs font-mono font-bold transition-all cursor-pointer ${
                      unit === "kg"
                        ? "bg-amber-500 text-zinc-900"
                        : "bg-zinc-800 text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    KG
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (unit === "kg" && baselineWeight) {
                        setBaselineWeight(Math.round(baselineWeight * 2.20462 * 2) / 2);
                      }
                      setUnit("lb");
                    }}
                    className={`px-3 py-2 text-xs font-mono font-bold transition-all cursor-pointer ${
                      unit === "lb"
                        ? "bg-amber-500 text-zinc-900"
                        : "bg-zinc-800 text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    LB
                  </button>
                </div>
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-zinc-500 mb-2">
                Training Level
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

            {/* Calculate Button */}
            <button
              type="button"
              onClick={handleCalculate}
              disabled={!baselineWeight || baselineWeight <= 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-900 font-mono font-bold text-sm tracking-wider uppercase shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              Calculate Training Phases
            </button>
          </div>

          {/* Results */}
          {hasCalculated && estimated1RM > 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Estimated 1RM */}
              <div className="rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/30 p-4 text-center">
                <span className="block text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-amber-400 mb-1">
                  Estimated 1RM
                </span>
                <span className="block font-mono text-3xl font-black text-amber-300">
                  {roundWeight(estimated1RM, unit)}{" "}
                  <span className="text-sm text-amber-500">{unit}</span>
                </span>
                <span className="block text-[10px] text-zinc-500 mt-1">
                  Derived from working baseline • Experience-adjusted
                </span>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-2">
                <div className="rounded-lg bg-zinc-900/60 border border-zinc-800 p-2.5 text-center">
                  <span className="block text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
                    Phases
                  </span>
                  <span className="block font-mono text-sm font-bold text-zinc-200">6</span>
                </div>
                <div className="rounded-lg bg-zinc-900/60 border border-zinc-800 p-2.5 text-center">
                  <span className="block text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
                    Sets
                  </span>
                  <span className="block font-mono text-sm font-bold text-zinc-200">{totalSets}</span>
                </div>
                <div className="rounded-lg bg-zinc-900/60 border border-zinc-800 p-2.5 text-center">
                  <span className="block text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
                    Duration
                  </span>
                  <span className="block font-mono text-sm font-bold text-zinc-200">
                    ~{estimatedDuration}m
                  </span>
                </div>
                <div className="rounded-lg bg-zinc-900/60 border border-zinc-800 p-2.5 text-center">
                  <span className="block text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
                    Peak
                  </span>
                  <span className="block font-mono text-sm font-bold text-zinc-200">
                    {roundWeight(estimated1RM * 0.92, unit)}
                  </span>
                </div>
              </div>

              {/* Phase Cards */}
              <div className="space-y-2">
                {phases.map((phase, i) => {
                  const isExpanded = expandedPhase === i;
                  const avgPct = (phase.pctRange[0] + phase.pctRange[1]) / 2;
                  const mainWeight = roundWeight(estimated1RM * avgPct, unit);
                  const pctLabel = `${Math.round(phase.pctRange[0] * 100)}–${Math.round(
                    phase.pctRange[1] * 100
                  )}%`;

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
                        className="w-full flex items-center gap-3 p-4 cursor-pointer"
                        aria-expanded={isExpanded}
                      >
                        <div
                          className={`w-1 h-10 rounded-full flex-shrink-0 ${phase.bgClass}`}
                          style={{
                            background: `var(--tw-gradient-stops)`,
                          }}
                        />
                        <div
                          className={`p-1.5 rounded-lg ${phase.bgClass} ${phase.colorClass} flex-shrink-0`}
                        >
                          {phase.icon}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <span className="block text-[9px] font-mono text-zinc-500 tracking-wider">
                            PHASE {i + 1} OF 6
                          </span>
                          <span className={`block text-xs font-mono font-bold tracking-wide ${phase.colorClass}`}>
                            {phase.name}
                          </span>
                          <span className="block text-[10px] text-zinc-500">{phase.purpose}</span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className={`block font-mono text-lg font-black ${phase.colorClass}`}>
                            {mainWeight}
                          </span>
                          <span className="block text-[9px] font-mono text-zinc-500">
                            {pctLabel} 1RM
                          </span>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 text-zinc-600 transition-transform duration-300 flex-shrink-0 ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        />
                      </button>

                      {/* Phase Body */}
                      <div
                        className={`overflow-hidden transition-all duration-500 ${
                          isExpanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="px-4 pb-4 pt-2 border-t border-zinc-800 space-y-3">
                          {/* Sets Table */}
                          <div className="space-y-1.5">
                            <div className="grid grid-cols-5 gap-2 text-[9px] font-mono text-zinc-500 uppercase tracking-wider px-2">
                              <span />
                              <span className="text-center">Weight</span>
                              <span className="text-center">Reps</span>
                              <span className="text-center">Rest</span>
                              <span className="text-center">Tempo</span>
                            </div>
                            {phase.sets.map((set, si) => {
                              const setWeight = roundWeight(estimated1RM * set.pct, unit);
                              return (
                                <div
                                  key={si}
                                  className="grid grid-cols-5 gap-2 items-center bg-zinc-800/50 rounded-lg py-2 px-2 text-xs font-mono"
                                >
                                  <span className="text-zinc-500 text-[10px] tracking-wider">
                                    {set.label}
                                  </span>
                                  <span
                                    className={`text-center font-bold ${phase.colorClass}`}
                                  >
                                    {setWeight} {unit}
                                  </span>
                                  <span className="text-center text-zinc-300">{set.reps}</span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStartRest(set.rest, phase.name);
                                    }}
                                    className="text-center text-zinc-300 hover:text-amber-400 transition-colors cursor-pointer flex items-center justify-center gap-1"
                                    title="Start rest timer"
                                  >
                                    <Clock className="w-3 h-3" />
                                    {formatRest(set.rest)}
                                  </button>
                                  <span className="text-center text-zinc-500">{set.tempo}</span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Phase Details */}
                          <div className="grid grid-cols-4 gap-2">
                            <div className="rounded-lg bg-zinc-800/40 p-2 text-center">
                              <span className="block text-[8px] font-mono text-zinc-500 uppercase tracking-wider">
                                Sets
                              </span>
                              <span className="block font-mono text-xs font-bold text-zinc-300">
                                {phase.sets.length}
                              </span>
                            </div>
                            <div className="rounded-lg bg-zinc-800/40 p-2 text-center">
                              <span className="block text-[8px] font-mono text-zinc-500 uppercase tracking-wider">
                                Intensity
                              </span>
                              <span className="block font-mono text-xs font-bold text-zinc-300">
                                {pctLabel}
                              </span>
                            </div>
                            <div className="rounded-lg bg-zinc-800/40 p-2 text-center">
                              <span className="block text-[8px] font-mono text-zinc-500 uppercase tracking-wider">
                                RPE
                              </span>
                              <span className="block font-mono text-xs font-bold text-zinc-300">
                                {phase.rpe}
                              </span>
                            </div>
                            <div className="rounded-lg bg-zinc-800/40 p-2 text-center">
                              <span className="block text-[8px] font-mono text-zinc-500 uppercase tracking-wider">
                                Est. Time
                              </span>
                              <span className="block font-mono text-xs font-bold text-zinc-300">
                                ~
                                {Math.ceil(
                                  phase.sets.reduce((sum, s) => {
                                    const r = parseInt(s.reps) || 4;
                                    const t = s.tempo
                                      .split("-")
                                      .reduce(
                                        (a: number, b: string) => a + (b === "X" ? 1 : parseInt(b)),
                                        0
                                      );
                                    return sum + r * t + s.rest;
                                  }, 0) / 60
                                )}
                                m
                              </span>
                            </div>
                          </div>

                          {/* Instruction */}
                          <div className="rounded-lg bg-amber-500/5 border-l-2 border-amber-500/30 p-3 text-xs text-zinc-400 leading-relaxed">
                            <span className="text-amber-400 font-semibold">Execution: </span>
                            {phase.instruction}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 4-Week Progression */}
              <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4 space-y-3">
                <h3 className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-amber-400">
                  ▸ 4-Week Micro-cycle Progression
                </h3>
                <div className="space-y-2">
                  {progressionWeeks.map((week, i) => {
                    const weekWeight = roundWeight(estimated1RM * 0.82 * week.multiplier, unit);
                    const maxMul = Math.max(...progressionWeeks.map((w) => w.multiplier));
                    const barWidth = (week.multiplier / maxMul) * 100;

                    return (
                      <div
                        key={i}
                        className="grid grid-cols-[80px_1fr_auto] gap-3 items-center bg-zinc-800/30 rounded-lg p-3"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                            {week.label}
                          </span>
                        </div>
                        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${week.colorClass} transition-all duration-700`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-zinc-200 min-w-[60px] text-right">
                            {weekWeight} {unit}
                          </span>
                          <span
                            className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full border ${
                              week.tag === "DELOAD"
                                ? "border-violet-500/40 bg-violet-500/10 text-violet-400"
                                : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                            }`}
                          >
                            {week.tag}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Neural Optimization Notes */}
              <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4 space-y-2">
                <h3 className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-cyan-400">
                  ▸ Neural Optimization Principles
                </h3>
                <ul className="space-y-1.5">
                  {[
                    "Rest between sets is CRITICAL. Shorter rest = endurance. Longer rest = strength & power.",
                    "Move with INTENT. Even warm-up sets should be lifted with maximal acceleration intent.",
                    "If form breaks, REDUCE weight. Perfect movement patterns are non-negotiable.",
                    "Activation phase wakes stabilizers and proprioceptors. Never skip it.",
                    "Increase baseline by 2.5% every 2–4 weeks when all effective sets complete with good form.",
                    "Deload every 4th–5th week: reduce effective weight by 40% for neural recovery.",
                    "Tempo: Eccentric–Pause–Concentric–Lock (e.g. 3-1-X-1 = 3s down, 1s pause, explosive up, 1s hold).",
                  ].map((note, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] text-zinc-400 leading-relaxed">
                      <span className="text-amber-500 mt-0.5 flex-shrink-0">▸</span>
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
