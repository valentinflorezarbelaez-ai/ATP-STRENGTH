"use client";

import React, { useState, useMemo } from "react";
import {
  Calculator,
  ShieldCheck,
  Zap,
  Flame,
  X,
  Dumbbell,
  Clock,
  ChevronRight,
  Sparkles,
  Info,
  Check,
} from "lucide-react";
import { BarbellPlateVisualizer } from "./BarbellPlateVisualizer";

export interface WarmupCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseName: string;
  defaultWorkWeightKg?: number;
  onApplyWeightToLogger?: (weightKg: number, reps: number, phaseKey?: string) => void;
  onStartTimer?: (seconds: number, title: string) => void;
}

export type WarmupStrategyType = "standard_4" | "joint_protection_5";

interface WarmupStepCalculation {
  key: string;
  title: string;
  objective: string;
  percent: number;
  weightKg: number;
  reps: number;
  repsLabel: string;
  restSeconds: number;
  isPap?: boolean;
}

export function WarmupCalculatorModal({
  isOpen,
  onClose,
  exerciseName,
  defaultWorkWeightKg = 100,
  onApplyWeightToLogger,
  onStartTimer,
}: WarmupCalculatorModalProps) {
  const [workWeight, setWorkWeight] = useState<number>(
    defaultWorkWeightKg > 0 ? defaultWorkWeightKg : 100
  );
  const [barWeight, setBarWeight] = useState<number>(20);
  const [strategy, setStrategy] = useState<WarmupStrategyType>("standard_4");
  const [selectedPhaseKey, setSelectedPhaseKey] = useState<string>("F1");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Rounding utility for barbell increments (2.5 kg minimum plate jump)
  const round25 = (val: number) => Math.max(barWeight, Math.round(val / 2.5) * 2.5);

  const steps: WarmupStepCalculation[] = useMemo(() => {
    if (strategy === "joint_protection_5") {
      // 5-Phase Progressive Joint Protection Strategy (for heavy loads or tendon sensitive lifters)
      return [
        {
          key: "F1",
          title: "F1: Flujo Sinovial & Activación",
          objective: "Lubricación capsular articular y sincronización de motoneuronas alfa con barra vacía.",
          percent: Math.round((barWeight / workWeight) * 100),
          weightKg: barWeight,
          reps: 10,
          repsLabel: "10 reps lentas",
          restSeconds: 60,
        },
        {
          key: "F2",
          title: "F2: Aclimatación Inicial",
          objective: "Despertar del huso neuromuscular sin acúmulo de metabolitos.",
          percent: 40,
          weightKg: round25(workWeight * 0.4),
          reps: 6,
          repsLabel: "6 reps controladas",
          restSeconds: 60,
        },
        {
          key: "F3",
          title: "F3: Tensión Tendinosa Media",
          objective: "Sensibilización de los órganos tendinosos de Golgi y alineación de la barra.",
          percent: 60,
          weightKg: round25(workWeight * 0.6),
          reps: 4,
          repsLabel: "4 reps explosivas",
          restSeconds: 90,
        },
        {
          key: "F4",
          title: "F4: Transición Pre-Carga",
          objective: "Aumento de la tasa de desarrollo de la fuerza (RFD) con cero fatiga glucolítica.",
          percent: 75,
          weightKg: round25(workWeight * 0.75),
          reps: 2,
          repsLabel: "2 reps sólidas",
          restSeconds: 90,
        },
        {
          key: "F5",
          title: "F5: Potenciación PAP Élite",
          objective: "Máxima Potenciación Post-Activación (PAP) para que la serie efectiva se sienta liviana.",
          percent: 88,
          weightKg: round25(workWeight * 0.88),
          reps: 1,
          repsLabel: "1 rep hiper-rápida",
          restSeconds: 120,
          isPap: true,
        },
      ];
    }

    // Standard 4-Phase Strategy (Optimal for most compound barbell movements)
    return [
      {
        key: "F1",
        title: "F1: Activación Dinámica",
        objective: "Barra vacía para lubricación articular y memorización del surco técnico.",
        percent: Math.round((barWeight / workWeight) * 100),
        weightKg: barWeight,
        reps: 10,
        repsLabel: "10 reps fluidas",
        restSeconds: 60,
      },
      {
        key: "F2",
        title: "F2: Aproximación Ligera",
        objective: "Reclutamiento de unidades motoras rápidas con baja tensión de cizalla articular.",
        percent: 50,
        weightKg: round25(workWeight * 0.5),
        reps: 5,
        repsLabel: "5 reps",
        restSeconds: 75,
      },
      {
        key: "F3",
        title: "F3: Tensión Barométrica",
        objective: "Aclimatación de la presión intra-abdominal y tensión en tendones rotulianos/codo.",
        percent: 70,
        weightKg: round25(workWeight * 0.7),
        reps: 3,
        repsLabel: "3 reps",
        restSeconds: 90,
      },
      {
        key: "F4",
        title: "F4: Potenciación PAP (Último Salto)",
        objective: "Desensibilización de la carga y preparación del SNC para la serie efectiva.",
        percent: 85,
        weightKg: round25(workWeight * 0.85),
        reps: 1,
        repsLabel: "1 rep pesada",
        restSeconds: 150,
        isPap: true,
      },
    ];
  }, [workWeight, barWeight, strategy]);

  if (!isOpen) return null;

  const handleApplyPhase = (step: WarmupStepCalculation) => {
    if (onApplyWeightToLogger) {
      onApplyWeightToLogger(step.weightKg, step.reps, step.key);
    }
    if (onStartTimer) {
      onStartTimer(step.restSeconds, `${step.key}: ${step.title}`);
    }
    setCopiedKey(step.key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-2xl w-full rounded-3xl bg-[#090910] border border-zinc-800 p-5 sm:p-7 shadow-[0_0_80px_rgba(245,158,11,0.15)] text-left flex flex-col max-h-[92vh] overflow-y-auto font-sans"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center text-sm cursor-pointer transition-all hover:bg-zinc-800"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Hero */}
        <div className="flex items-center gap-3 mb-5 pr-8">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[9px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3" />
              <span>Protección Articular & SNC</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black font-mono text-white tracking-wide mt-1">
              CALCULADOR DE APROXIMACIÓN
            </h2>
            <p className="text-xs text-zinc-400 font-mono">
              {exerciseName ? exerciseName.toUpperCase() : "LEVANTAMIENTO DE FUERZA"}
            </p>
          </div>
        </div>

        {/* Carga Objetivo & Ajustes */}
        <div className="p-4 rounded-2xl bg-zinc-950/90 border border-zinc-800/90 space-y-4 mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold block">
                Tu Carga de Trabajo Efectiva (100%):
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl sm:text-4xl font-black font-mono text-amber-400">
                  {workWeight}
                </span>
                <span className="text-sm font-mono text-zinc-500 font-bold">kg</span>
              </div>
            </div>

            {/* Selector de incrementos */}
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <button
                type="button"
                onClick={() => setWorkWeight((prev) => Math.max(barWeight, prev - 10))}
                className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer font-bold"
              >
                -10
              </button>
              <button
                type="button"
                onClick={() => setWorkWeight((prev) => Math.max(barWeight, prev - 2.5))}
                className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer font-bold"
              >
                -2.5
              </button>
              <button
                type="button"
                onClick={() => setWorkWeight((prev) => prev + 2.5)}
                className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer font-bold"
              >
                +2.5
              </button>
              <button
                type="button"
                onClick={() => setWorkWeight((prev) => prev + 10)}
                className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer font-bold"
              >
                +10
              </button>
            </div>
          </div>

          {/* Opciones: Barra & Estrategia */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-zinc-900 text-xs font-mono">
            {/* Tipo de Barra */}
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1.5 font-bold">
                Peso de la Barra:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { w: 20, label: "20 kg (Olímpica)" },
                  { w: 15, label: "15 kg (Técnica)" },
                  { w: 10, label: "10 kg (EZ)" },
                ].map((b) => (
                  <button
                    key={b.w}
                    type="button"
                    onClick={() => setBarWeight(b.w)}
                    className={`py-1.5 px-2 rounded-xl text-center text-[11px] border transition-all cursor-pointer ${
                      barWeight === b.w
                        ? "bg-amber-500/20 border-amber-500/70 text-amber-300 font-bold"
                        : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {b.w} kg
                  </button>
                ))}
              </div>
            </div>

            {/* Estrategia de Ramp-up */}
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1.5 font-bold">
                Protocolo Articular:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setStrategy("standard_4")}
                  className={`py-1.5 px-2 rounded-xl text-center text-[11px] border transition-all cursor-pointer ${
                    strategy === "standard_4"
                      ? "bg-emerald-500/20 border-emerald-500/70 text-emerald-300 font-bold"
                      : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Estándar (4 Fases)
                </button>
                <button
                  type="button"
                  onClick={() => setStrategy("joint_protection_5")}
                  className={`py-1.5 px-2 rounded-xl text-center text-[11px] border transition-all cursor-pointer ${
                    strategy === "joint_protection_5"
                      ? "bg-emerald-500/20 border-emerald-500/70 text-emerald-300 font-bold"
                      : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Protección Pro (5 Fases)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Fases de Aproximación Calculadas */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Series de Aproximación Calculadas:</span>
            </span>
            <span className="text-[10px] text-zinc-500">Toca para cargar en barra</span>
          </div>

          <div className="space-y-2.5">
            {steps.map((step) => {
              const isSelected = selectedPhaseKey === step.key;
              const isCopied = copiedKey === step.key;

              return (
                <div
                  key={step.key}
                  onClick={() => setSelectedPhaseKey(step.key)}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                    step.isPap
                      ? "bg-gradient-to-r from-amber-500/10 via-zinc-950 to-zinc-950 border-amber-500/50 shadow-md shadow-amber-500/5"
                      : isSelected
                      ? "bg-zinc-900/90 border-zinc-700"
                      : "bg-zinc-950/60 border-zinc-900 hover:border-zinc-800"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase border ${
                          step.isPap
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : "bg-zinc-900 text-zinc-300 border-zinc-800"
                        }`}
                      >
                        {step.key}
                      </span>
                      <span className="font-mono text-xs font-bold text-white">
                        {step.title}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        ({step.percent}%)
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        <span>{step.restSeconds}s rest</span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyPhase(step);
                        }}
                        className={`px-3 py-1 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          isCopied
                            ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                            : "bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 active:scale-95"
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>¡CARGADO!</span>
                          </>
                        ) : (
                          <>
                            <span>Cargar</span>
                            <ChevronRight className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Kilos + Reps + Detalle de Discos */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-zinc-900/80">
                    <div className="flex items-baseline gap-3">
                      <div className="text-xl sm:text-2xl font-black font-mono text-amber-400">
                        {step.weightKg} <span className="text-xs text-amber-400/70 font-normal">kg</span>
                      </div>
                      <div className="text-xs font-mono font-bold text-zinc-200">
                        {step.repsLabel}
                      </div>
                    </div>

                    {/* Discos a cada lado */}
                    <div className="sm:max-w-xs w-full">
                      <BarbellPlateVisualizer
                        targetWeightKg={step.weightKg}
                        exerciseName={exerciseName}
                      />
                    </div>
                  </div>

                  {/* Objetivo fisiológico */}
                  <p className="text-[11px] text-zinc-400 font-mono leading-relaxed">
                    {step.objective}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Serie Efectiva (El Destino 100%) */}
        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider">
              <Zap className="w-3 h-3" />
              <span>SERIE EFECTIVA (TRABAJO PRINCIPAL)</span>
            </div>
            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-2xl font-black text-white">{workWeight} kg</span>
              <span className="text-xs text-zinc-400">× 3 a 5 reps según programa</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">
              Aquí es donde ocurre la adaptación de fuerza pura con descanso ATP de 3 a 5 minutos.
            </p>
          </div>

          <div className="sm:max-w-xs w-full">
            <BarbellPlateVisualizer
              targetWeightKg={workWeight}
              exerciseName={exerciseName}
            />
          </div>
        </div>

        {/* Principios de Protección Articular */}
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs font-mono space-y-2">
          <div className="flex items-center gap-2 text-zinc-300 font-bold text-[11px] uppercase tracking-wider">
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span>Las 4 Reglas de Oro para Proteger tus Articulaciones:</span>
          </div>
          <ul className="space-y-1 text-[11px] text-zinc-400 list-disc list-inside leading-relaxed">
            <li>
              <strong className="text-zinc-200">Cero Fatiga Metabólica:</strong> Las series de aproximación sirven para activar nervios y bombear líquido sinovial, nunca para llegar al fallo.
            </li>
            <li>
              <strong className="text-zinc-200">Regla del Salto Seguro:</strong> Nunca aumentes más del 20% de golpe en cargas pesadas para evitar choque tendinoso repentino.
            </li>
            <li>
              <strong className="text-zinc-200">La Serie PAP (Potenciación):</strong> Hacer 1 repetición al 85-88% antes de tu serie efectiva despierta el SNC sin agotar el glucógeno.
            </li>
            <li>
              <strong className="text-zinc-200">Descansos Breves:</strong> 60 a 90 segundos son suficientes entre aproximaciones para mantener la temperatura articular óptima.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
