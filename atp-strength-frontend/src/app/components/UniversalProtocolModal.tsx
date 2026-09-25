"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Zap,
  Dumbbell,
  Clock,
  Check,
  RotateCcw,
  Sparkles,
  Info,
  X,
  Play,
  Pause,
  ChevronRight,
  ShieldAlert,
  Flame,
  Activity,
  Layers,
  Save,
  Copy
} from "lucide-react";
import { BarbellPlateVisualizer } from "./BarbellPlateVisualizer";
import { ALL_TRACKABLE_EXERCISES } from "@/lib/workoutStrategies";
import { playChime, playTactileClick } from "@/lib/zenAudio";

export interface UniversalProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTimer?: (seconds: number, title: string) => void;
}

type EquipmentType = "barbell" | "dumbbell" | "machine";
type GoalType = "strength" | "hypertrophy" | "volume";

interface ProtocolStep {
  id: string;
  phase: "warmup" | "activation" | "effective";
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  percent: number;
  weightKg: number;
  reps: number;
  repsLabel: string;
  restSeconds: number;
  isEffective?: boolean;
}

const COMMON_QUICK_EXERCISES = [
  "Sentadilla Trasera",
  "Press de Banca",
  "Peso Muerto",
  "Press Militar",
  "Prensa 45°",
  "Hack Squat",
  "Jalón al Pecho",
  "Remo con Barra",
  "Fondos Lastrados",
  "Dominadas Lastradas",
  "Curl de Bíceps",
  "Elevaciones Laterales"
];

export function UniversalProtocolModal({
  isOpen,
  onClose,
  onStartTimer,
}: UniversalProtocolModalProps) {
  const [exerciseName, setExerciseName] = useState<string>("Sentadilla Trasera");
  const [prWeight, setPrWeight] = useState<number>(100);
  const [equipment, setEquipment] = useState<EquipmentType>("barbell");
  const [goal, setGoal] = useState<GoalType>("strength");
  const [barWeight, setBarWeight] = useState<number>(20);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const [savedNotification, setSavedNotification] = useState<boolean>(false);

  // Local rest timer state
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [timerRemaining, setTimerRemaining] = useState<number>(0);
  const [timerTotal, setTimerTotal] = useState<number>(0);
  const [timerLabel, setTimerLabel] = useState<string>("");

  // Look up saved PR from localStorage if available
  useEffect(() => {
    if (typeof window === "undefined" || !exerciseName) return;
    try {
      const savedMaxes = localStorage.getItem("neuro_strength_maxes");
      if (savedMaxes) {
        const parsed = JSON.parse(savedMaxes);
        if (parsed[exerciseName]?.one_rep_max) {
          setPrWeight(parsed[exerciseName].one_rep_max);
        }
      }
    } catch {}
  }, [exerciseName]);

  // Timer countdown effect
  useEffect(() => {
    if (!timerRunning || timerRemaining <= 0) return;
    const interval = setInterval(() => {
      setTimerRemaining((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          playChime(true);
          if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate([300, 150, 300, 150, 400]);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, timerRemaining]);

  // Rounding helper
  const roundWeight = (rawWeight: number): number => {
    if (equipment === "barbell") {
      const clamped = Math.max(barWeight, rawWeight);
      return Math.round(clamped / 2.5) * 2.5;
    }
    if (equipment === "dumbbell") {
      const clamped = Math.max(2, rawWeight);
      return Math.round(clamped / 2.5) * 2.5;
    }
    // machine: usually 5kg increments
    const clamped = Math.max(5, rawWeight);
    return Math.round(clamped / 5) * 5;
  };

  // Build the protocol calculations dynamically
  const protocol = useMemo(() => {
    const pr = Math.max(10, prWeight);
    const steps: ProtocolStep[] = [];

    // FASE 1: CALENTAMIENTO Y FLUJO SINOVIAL (3 Sets)
    steps.push({
      id: "w1",
      phase: "warmup",
      title: "Calentamiento 1: Flujo Sinovial",
      badge: "CALENTAMIENTO",
      badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      description: equipment === "barbell" ? "Barra vacía para engrasar bisagra articular y memorizar técnica." : "35% de la carga para activar circulación articular sin fatiga.",
      percent: Math.round(((equipment === "barbell" ? barWeight : roundWeight(pr * 0.35)) / pr) * 100),
      weightKg: equipment === "barbell" ? barWeight : roundWeight(pr * 0.35),
      reps: 12,
      repsLabel: "12 reps controladas",
      restSeconds: 60,
    });

    steps.push({
      id: "w2",
      phase: "warmup",
      title: "Calentamiento 2: Reclutamiento Progresivo",
      badge: "CALENTAMIENTO",
      badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      description: "50% de la carga. Reclutamiento de unidades motoras intermedias con velocidad sostenida.",
      percent: 50,
      weightKg: roundWeight(pr * 0.5),
      reps: 8,
      repsLabel: "8 reps fluidas",
      restSeconds: 60,
    });

    steps.push({
      id: "w3",
      phase: "warmup",
      title: "Calentamiento 3: Carga Barométrica",
      badge: "CALENTAMIENTO",
      badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      description: "65% de la carga. Activación de presión intra-abdominal y tensión en tendones.",
      percent: 65,
      weightKg: roundWeight(pr * 0.65),
      reps: 4,
      repsLabel: "4 reps con intención",
      restSeconds: 75,
    });

    // FASE 2: ACTIVACIÓN NEUROMUSCULAR (PAP) (2 Sets)
    steps.push({
      id: "a1",
      phase: "activation",
      title: "Activación 1: Transición Neuronal",
      badge: "ACTIVACIÓN",
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      description: "75% de la carga. Preparación de motoneuronas rápidas tipo IIb con fatiga nula.",
      percent: 75,
      weightKg: roundWeight(pr * 0.75),
      reps: 2,
      repsLabel: "2 reps explosivas",
      restSeconds: 90,
    });

    steps.push({
      id: "a2",
      phase: "activation",
      title: "Activación 2: Potenciación PAP (Último Salto)",
      badge: "PAP ÉLITE",
      badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      description: "85% de la carga. 1 rep única para desensibilizar el peso; hace que la serie efectiva se sienta liviana.",
      percent: 85,
      weightKg: roundWeight(pr * 0.85),
      reps: 1,
      repsLabel: "1 rep sólida y veloz",
      restSeconds: 120,
    });

    // FASE 3: SERIES EFECTIVAS DE TRABAJO
    if (goal === "strength") {
      const effectiveWeight = roundWeight(pr * 0.85);
      for (let i = 1; i <= 3; i++) {
        steps.push({
          id: `eff_${i}`,
          phase: "effective",
          title: `Serie Efectiva ${i} de 3: Fuerza Máxima`,
          badge: "EFECTIVA",
          badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
          description: "85% 1RM. Máxima tasa de desarrollo de fuerza (RFD). Descanso amplio para resíntesis total de ATP-PCr.",
          percent: 85,
          weightKg: effectiveWeight,
          reps: 5,
          repsLabel: "5 reps RPE 8.5",
          restSeconds: 180,
          isEffective: true,
        });
      }
    } else if (goal === "hypertrophy") {
      const effectiveWeight = roundWeight(pr * 0.76);
      for (let i = 1; i <= 3; i++) {
        steps.push({
          id: `eff_${i}`,
          phase: "effective",
          title: `Serie Efectiva ${i} de 3: Tensión Mecánica`,
          badge: "EFECTIVA",
          badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
          description: "76% 1RM. Hipertrofia miofibrilar óptima con alto reclutamiento y volumen denso.",
          percent: 76,
          weightKg: effectiveWeight,
          reps: 8,
          repsLabel: "8 reps RPE 8-9",
          restSeconds: 150,
          isEffective: true,
        });
      }
    } else {
      const effectiveWeight = roundWeight(pr * 0.65);
      for (let i = 1; i <= 3; i++) {
        steps.push({
          id: `eff_${i}`,
          phase: "effective",
          title: `Serie Efectiva ${i} de 3: Volumen & Bombeo`,
          badge: "EFECTIVA",
          badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
          description: "65% 1RM. Estrés metabólico y acumulación de metabolitos sin degradación técnica.",
          percent: 65,
          weightKg: effectiveWeight,
          reps: 12,
          repsLabel: "12 reps controladas",
          restSeconds: 90,
          isEffective: true,
        });
      }
    }

    return steps;
  }, [prWeight, equipment, goal, barWeight]);

  if (!isOpen) return null;

  const handleStartRest = (step: ProtocolStep) => {
    playTactileClick();
    if (onStartTimer) {
      onStartTimer(step.restSeconds, `${exerciseName} - ${step.title}`);
    }
    // Also run modal internal timer
    setTimerTotal(step.restSeconds);
    setTimerRemaining(step.restSeconds);
    setTimerLabel(step.title);
    setTimerRunning(true);
    setActiveStepId(step.id);
  };

  const toggleSetComplete = (id: string) => {
    playTactileClick();
    setCompletedSteps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSavePrToStorage = () => {
    playTactileClick();
    try {
      const current = localStorage.getItem("neuro_strength_maxes");
      const parsed = current ? JSON.parse(current) : {};
      parsed[exerciseName] = {
        ...(parsed[exerciseName] || {}),
        one_rep_max: prWeight,
        training_max: Math.round(prWeight * 0.9 * 10) / 10,
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem("neuro_strength_maxes", JSON.stringify(parsed));
      setSavedNotification(true);
      setTimeout(() => setSavedNotification(false), 2000);
    } catch {}
  };

  const handleCopySummary = () => {
    playTactileClick();
    const summary = [
      `🏋️ PROTOCOLO UNIVERSAL: ${exerciseName.toUpperCase()}`,
      `🎯 PR / 1RM: ${prWeight} kg | Equipo: ${equipment} | Enfoque: ${goal}`,
      `--------------------------------------------------`,
      ...protocol.map(
        (s) => `[${s.badge}] ${s.title}: ${s.weightKg}kg x ${s.repsLabel} (Descanso: ${s.restSeconds}s)`
      ),
      `--------------------------------------------------`,
      `Generado con ATP STRENGTH // NEURO-STRENGTH`
    ].join("\n");

    if (navigator?.clipboard) {
      navigator.clipboard.writeText(summary);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2000);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-3xl w-full rounded-3xl bg-[#07070b] border border-zinc-800 p-4 sm:p-7 shadow-[0_0_80px_rgba(245,158,11,0.2)] text-left flex flex-col max-h-[94vh] overflow-y-auto font-sans"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center text-sm cursor-pointer transition-all hover:bg-zinc-800 z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Hero Header */}
        <div className="flex items-start gap-3 sm:gap-4 border-b border-zinc-900 pb-5 mb-5">
          <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/10">
            <Zap className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="flex-1 pr-8">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black tracking-wider text-white uppercase">
                PROTOCOLO UNIVERSAL DE FUERZA
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                1RM / PR
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 font-mono mt-1">
              Ingresá cualquier ejercicio o máquina y tu PR. La app calcula fases de calentamiento, activación y series efectivas exactas.
            </p>
          </div>
        </div>

        {/* CONTROLES DE ENTRADA: Ejercicio, PR, Equipamiento y Objetivo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 mb-5 shadow-inner">
          {/* Campo Ejercicio */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-zinc-400 flex items-center justify-between">
              <span>EJERCICIO O MÁQUINA</span>
              <span className="text-[10px] text-zinc-500">Texto libre o selector</span>
            </label>
            <input
              type="text"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              placeholder="Ej: Sentadilla Trasera, Prensa, Hack, Remo..."
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-zinc-100 focus:outline-none focus:border-amber-400 transition-all placeholder:text-zinc-600"
            />
            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {COMMON_QUICK_EXERCISES.slice(0, 6).map((ex) => (
                <button
                  key={ex}
                  onClick={() => setExerciseName(ex)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
                    exerciseName === ex
                      ? "bg-amber-500/30 text-amber-300 border border-amber-500/50"
                      : "bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                  }`}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* Campo PR / 1RM */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-zinc-400 flex items-center justify-between">
              <span>¿CUÁL ES TU PR / 1RM? (KG)</span>
              <button
                onClick={handleSavePrToStorage}
                className="text-[10px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                title="Guardar este PR en la memoria de la aplicación"
              >
                <Save className="w-3 h-3" />
                <span>{savedNotification ? "¡GUARDADO!" : "GUARDAR PR"}</span>
              </button>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="10"
                max="500"
                step="2.5"
                value={prWeight}
                onChange={(e) => setPrWeight(parseFloat(e.target.value) || 0)}
                className="flex-1 bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-lg font-black text-amber-400 text-center focus:outline-none focus:border-amber-400 transition-all font-mono"
              />
              <div className="flex gap-1">
                <button
                  onClick={() => setPrWeight((w) => Math.max(10, w - 5))}
                  className="px-2.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-xs hover:border-zinc-700 active:scale-95"
                >
                  -5
                </button>
                <button
                  onClick={() => setPrWeight((w) => w + 5)}
                  className="px-2.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-xs hover:border-zinc-700 active:scale-95"
                >
                  +5
                </button>
              </div>
            </div>

            {/* Quick offset chips */}
            <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-zinc-500">
              <span>Ajustes rápidos:</span>
              <div className="flex gap-1.5">
                {[50, 80, 100, 120, 140, 160].map((val) => (
                  <button
                    key={val}
                    onClick={() => setPrWeight(val)}
                    className="px-1.5 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-[10px]"
                  >
                    {val}k
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Selector de Implemento / Máquina */}
          <div className="space-y-1.5">
            <span className="text-xs font-mono font-bold text-zinc-400">TIPO DE IMPLEMENTO</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setEquipment("barbell")}
                className={`py-2 px-2.5 rounded-xl text-xs font-mono font-bold border transition-all text-center cursor-pointer ${
                  equipment === "barbell"
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                🏋️ Barra (20k)
              </button>
              <button
                onClick={() => setEquipment("dumbbell")}
                className={`py-2 px-2.5 rounded-xl text-xs font-mono font-bold border transition-all text-center cursor-pointer ${
                  equipment === "dumbbell"
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                💪 Mancuerna
              </button>
              <button
                onClick={() => setEquipment("machine")}
                className={`py-2 px-2.5 rounded-xl text-xs font-mono font-bold border transition-all text-center cursor-pointer ${
                  equipment === "machine"
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                ⚙️ Máquina/Polea
              </button>
            </div>
          </div>

          {/* Selector de Objetivo de Sesión */}
          <div className="space-y-1.5">
            <span className="text-xs font-mono font-bold text-zinc-400">ENFOQUE DE LA SESIÓN</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setGoal("strength")}
                className={`py-2 px-2.5 rounded-xl text-xs font-mono font-bold border transition-all text-center cursor-pointer ${
                  goal === "strength"
                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                ⚡ Fuerza (85%)
              </button>
              <button
                onClick={() => setGoal("hypertrophy")}
                className={`py-2 px-2.5 rounded-xl text-xs font-mono font-bold border transition-all text-center cursor-pointer ${
                  goal === "hypertrophy"
                    ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                🧬 Hipertrofia (76%)
              </button>
              <button
                onClick={() => setGoal("volume")}
                className={`py-2 px-2.5 rounded-xl text-xs font-mono font-bold border transition-all text-center cursor-pointer ${
                  goal === "volume"
                    ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                🩸 Volumen (65%)
              </button>
            </div>
          </div>
        </div>

        {/* TEMPORIZADOR DE DESCANSO EN VIVO (Si está activo) */}
        {timerRunning && (
          <div className="mb-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold animate-pulse">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-mono text-zinc-400">DESCANSO EN CURSO</div>
                <div className="text-sm font-bold text-zinc-100">{timerLabel || "Resíntesis de Fosfocreatina"}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-2xl sm:text-3xl font-mono font-black text-amber-400 tracking-wider">
                {formatSeconds(timerRemaining)}
              </div>
              <button
                onClick={() => setTimerRunning(false)}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400 hover:text-white cursor-pointer"
              >
                SALTAR
              </button>
            </div>
          </div>
        )}

        {/* TABLA VISUAL DE PROTOCOLO: Warmup -> Activación -> Efectivas */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-zinc-400 tracking-wider uppercase flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>PASO A PASO DE LA SESIÓN ({protocol.length} SERIES)</span>
            </h3>
            <button
              onClick={handleCopySummary}
              className="text-xs font-mono text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 cursor-pointer bg-zinc-900/60 border border-zinc-800 px-2.5 py-1 rounded-lg"
            >
              <Copy className="w-3.5 h-3.5 text-amber-400" />
              <span>{copiedNotification ? "¡COPIADO!" : "COPIAR PROTOCOLO"}</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {protocol.map((step, idx) => {
              const isCompleted = !!completedSteps[step.id];
              const isTargetingBarbell = equipment === "barbell" && step.weightKg >= barWeight;

              return (
                <div
                  key={step.id}
                  className={`rounded-2xl border p-3.5 sm:p-4 transition-all ${
                    step.isEffective
                      ? "bg-gradient-to-r from-emerald-950/20 via-zinc-950 to-zinc-950 border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.05)]"
                      : step.phase === "activation"
                      ? "bg-gradient-to-r from-purple-950/20 via-zinc-950 to-zinc-950 border-purple-500/30"
                      : "bg-zinc-950/70 border-zinc-800/80"
                  } ${isCompleted ? "opacity-60" : ""}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left details */}
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleSetComplete(step.id)}
                        className={`w-6 h-6 rounded-lg border mt-0.5 flex items-center justify-center transition-all cursor-pointer ${
                          isCompleted
                            ? "bg-emerald-500 border-emerald-400 text-black"
                            : "border-zinc-700 bg-zinc-900 hover:border-zinc-500 text-transparent"
                        }`}
                        title="Marcar serie completada"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${step.badgeColor}`}>
                            {step.badge}
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-zinc-100">
                            {step.title}
                          </span>
                          <span className="text-[11px] font-mono text-zinc-500">
                            ({step.percent}% PR)
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 font-mono mt-1">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {/* Right payload: Weight, Reps, Action */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pl-9 sm:pl-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-900">
                      <div className="text-right">
                        <div className="text-base sm:text-lg font-black font-mono text-amber-400 tracking-tight">
                          {step.weightKg} kg
                        </div>
                        <div className="text-xs font-mono text-zinc-300 font-semibold">
                          {step.repsLabel}
                        </div>
                      </div>

                      <button
                        onClick={() => handleStartRest(step)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-mono font-bold text-zinc-200 active:scale-95 transition-all cursor-pointer"
                        title="Iniciar descanso para esta serie"
                      >
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{step.restSeconds}s</span>
                      </button>
                    </div>
                  </div>

                  {/* Discos de barra si es Barra Olímpica */}
                  {isTargetingBarbell && (
                    <div className="mt-2.5 pt-2.5 border-t border-zinc-900/80 pl-9">
                      <BarbellPlateVisualizer
                        targetWeightKg={step.weightKg}
                        exerciseName={exerciseName}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info box */}
        <div className="mt-auto pt-3 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-zinc-500">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Resíntesis de ATP completa: 95% a los 3 minutos de pausa pasiva.</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs active:scale-95 transition-all cursor-pointer"
          >
            LISTO // VOLVER
          </button>
        </div>
      </div>
    </div>
  );
}
