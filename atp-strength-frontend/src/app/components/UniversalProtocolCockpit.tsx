"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Zap,
  Target,
  Flame,
  Activity,
  Shield,
  Clock,
  TrendingUp,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Award,
  Play,
  Plus,
  Minus,
  ShieldCheck,
  AlertTriangle,
  Info,
  Check,
} from "lucide-react";
import { playTactileClick, playChime } from "@/lib/zenAudio";
import { getExerciseMedia } from "@/lib/exerciseMediaCatalog";
import { BarbellPlateVisualizer } from "@/app/components/BarbellPlateVisualizer";

export interface UniversalProtocolCockpitProps {
  onStartTimer: (seconds: number, title: string) => void;
  onOpenVideo?: (exerciseName: string) => void;
}

const COMMON_EXERCISES = [
  { name: "Press de Banca Plano", defaultPr: 100, category: "Empuje" },
  { name: "Sentadilla Trasera", defaultPr: 130, category: "Piernas" },
  { name: "Peso Muerto Convencional", defaultPr: 160, category: "Cadena Posterior" },
  { name: "Press Militar Estricto", defaultPr: 65, category: "Empuje Vertical" },
  { name: "Dominadas Lastradas", defaultPr: 90, category: "Tracción" },
  { name: "Prensa 45° Pesada", defaultPr: 240, category: "Máquinas" },
  { name: "Hip Thrust con Barra", defaultPr: 170, category: "Cadena Posterior" },
  { name: "Remo con Barra 45°", defaultPr: 90, category: "Tracción" },
];

function roundWeight(weight: number): number {
  return Math.max(5, Math.round(weight / 0.5) * 0.5);
}

export function UniversalProtocolCockpit({
  onStartTimer,
  onOpenVideo,
}: UniversalProtocolCockpitProps) {
  const [exerciseName, setExerciseName] = useState<string>("Press de Banca Plano");
  const [customExercise, setCustomExercise] = useState<string>("");
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [prWeight, setPrWeight] = useState<number>(100);
  const [useTrainingMax, setUseTrainingMax] = useState<boolean>(true);
  const [completedSets, setCompletedSets] = useState<Record<string, boolean>>({});
  const [showInlineDemo, setShowInlineDemo] = useState<boolean>(false);

  // Submax Calculator helper
  const [showSubmaxCalc, setShowSubmaxCalc] = useState<boolean>(false);
  const [subWeight, setSubWeight] = useState<number>(80);
  const [subReps, setSubReps] = useState<number>(5);
  const [subRir, setSubRir] = useState<number>(2);

  // Load saved state
  useEffect(() => {
    try {
      const saved = localStorage.getItem("atp_universal_cockpit_state");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.exerciseName) setExerciseName(parsed.exerciseName);
        if (parsed.prWeight) setPrWeight(parsed.prWeight);
        if (parsed.useTrainingMax !== undefined) setUseTrainingMax(parsed.useTrainingMax);
      }
    } catch {}
  }, []);

  // Save state
  useEffect(() => {
    try {
      localStorage.setItem(
        "atp_universal_cockpit_state",
        JSON.stringify({
          exerciseName: isCustom ? customExercise : exerciseName,
          prWeight,
          useTrainingMax,
        })
      );
    } catch {}
  }, [exerciseName, customExercise, isCustom, prWeight, useTrainingMax]);

  const activeName = isCustom ? customExercise || "Ejercicio Personalizado" : exerciseName;

  // Retrieve media profile for active exercise
  const exerciseMedia = useMemo(() => getExerciseMedia(activeName), [activeName]);

  // Working max based on 90% TM or 100% 1RM
  const effectiveMax = useMemo(() => {
    const raw = prWeight > 0 ? prWeight : 100;
    return useTrainingMax ? raw * 0.9 : raw;
  }, [prWeight, useTrainingMax]);

  // Quick weight adjustment helpers for mobile
  const adjustPr = (delta: number) => {
    playTactileClick();
    setPrWeight((prev) => Math.max(5, Math.round((prev + delta) * 2) / 2));
  };

  // Submaximal calculation apply
  const applySubmax = () => {
    const totalReps = subReps + subRir;
    const brzycki = subWeight * (36 / (37 - totalReps));
    const epley = subWeight * (1 + totalReps / 30);
    const est1RM = Math.round((brzycki * 0.5 + epley * 0.5) * 10) / 10;
    setPrWeight(est1RM);
    setShowSubmaxCalc(false);
    playChime(true);
  };

  const toggleSetComplete = (id: string, phaseName: string, restSec: number) => {
    playTactileClick();
    const next = !completedSets[id];
    setCompletedSets((prev) => ({ ...prev, [id]: next }));
    if (next) {
      onStartTimer(restSec, `${activeName} · ${phaseName}`);
    }
  };

  const resetAllSets = () => {
    playTactileClick();
    setCompletedSets({});
  };

  // The 6 Neuromuscular Phases
  const protocolPhases = useMemo(() => {
    return [
      {
        id: "p1",
        name: "Fase 1 · Activación Articular & Movilidad",
        pct: "22–30%",
        badge: "ACTIVACIÓN",
        colorClass: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
        desc: "Lubricación de cápsulas articulares con líquido sinovial. Abre el canal neuromuscular sin fatiga metabólica.",
        sets: [
          {
            id: "p1_s1",
            label: "Serie 1",
            weight: roundWeight(effectiveMax * 0.22),
            reps: "10–12",
            tempo: "2-0-2-0",
            rest: 45,
          },
          {
            id: "p1_s2",
            label: "Serie 2",
            weight: roundWeight(effectiveMax * 0.3),
            reps: "8–10",
            tempo: "2-0-2-0",
            rest: 60,
          },
        ],
      },
      {
        id: "p2",
        name: "Fase 2 · Rampa Progresiva de Tensión",
        pct: "42–58%",
        badge: "RAMPA NEURAL",
        colorClass: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
        desc: "Aclimatación de colágeno y tendones. Intención concéntrica explosiva (CAT) en cada repetición.",
        sets: [
          {
            id: "p2_s1",
            label: "Serie 1",
            weight: roundWeight(effectiveMax * 0.42),
            reps: "6–8",
            tempo: "2-1-1-0",
            rest: 60,
          },
          {
            id: "p2_s2",
            label: "Serie 2",
            weight: roundWeight(effectiveMax * 0.5),
            reps: "5–6",
            tempo: "2-1-X-0",
            rest: 90,
          },
          {
            id: "p2_s3",
            label: "Serie 3",
            weight: roundWeight(effectiveMax * 0.58),
            reps: "4–5",
            tempo: "2-1-X-0",
            rest: 90,
          },
        ],
      },
      {
        id: "p3",
        name: "Fase 3 · Potenciación Post-Activación (PAP)",
        pct: "68–76%",
        badge: "PAP EXPLOSIVO",
        colorClass: "text-amber-400 border-amber-500/30 bg-amber-500/10",
        desc: "Despierta las motoneuronas de alto umbral (Fibras Tipo IIx). Aceleración máxima sin decelerar la carga.",
        sets: [
          {
            id: "p3_s1",
            label: "Serie 1",
            weight: roundWeight(effectiveMax * 0.68),
            reps: "3–4",
            tempo: "2-1-X-1",
            rest: 120,
          },
          {
            id: "p3_s2",
            label: "Serie 2",
            weight: roundWeight(effectiveMax * 0.76),
            reps: "2–3",
            tempo: "2-1-X-1",
            rest: 150,
          },
        ],
      },
      {
        id: "p4",
        name: "Fase 4 · Series Efectivas de Fuerza Máxima",
        pct: "80–85%",
        badge: "ZONA DIANA DE FUERZA",
        colorClass: "text-orange-400 border-orange-500/30 bg-orange-500/10",
        desc: "Núcleo de máxima tensión mecánica miofibrilar. Descenso excéntrico controlado (3s), pausa isométrica y explosión concéntrica. Cero fallo.",
        sets: [
          {
            id: "p4_s1",
            label: "Serie 1",
            weight: roundWeight(effectiveMax * 0.8),
            reps: "4–5",
            tempo: "3-1-X-1",
            rest: 180,
          },
          {
            id: "p4_s2",
            label: "Serie 2",
            weight: roundWeight(effectiveMax * 0.82),
            reps: "3–4",
            tempo: "3-1-X-1",
            rest: 180,
          },
          {
            id: "p4_s3",
            label: "Serie 3",
            weight: roundWeight(effectiveMax * 0.85),
            reps: "3–4",
            tempo: "3-1-X-1",
            rest: 210,
          },
          {
            id: "p4_s4",
            label: "Serie 4",
            weight: roundWeight(effectiveMax * 0.85),
            reps: "2–3",
            tempo: "3-1-X-1",
            rest: 210,
          },
        ],
      },
      {
        id: "p5",
        name: "Fase 5 · Intensidad Pico / Umbral Neural",
        pct: "88–92%",
        badge: "PICO MÁXIMO (OPCIONAL)",
        colorClass: "text-red-400 border-red-500/30 bg-red-500/10",
        desc: "Intentar SOLO si la velocidad en Fase 4 se mantuvo nítida. Si la velocidad concéntrica cae >20%, terminar la sesión de inmediato.",
        sets: [
          {
            id: "p5_s1",
            label: "Serie 1",
            weight: roundWeight(effectiveMax * 0.88),
            reps: "2–3",
            tempo: "3-2-X-1",
            rest: 240,
          },
          {
            id: "p5_s2",
            label: "Serie 2",
            weight: roundWeight(effectiveMax * 0.92),
            reps: "1–2",
            tempo: "3-2-X-1",
            rest: 270,
          },
        ],
      },
      {
        id: "p6",
        name: "Fase 6 · Descarga Parasimpática & Vía Vagal",
        pct: "38–48%",
        badge: "REGENERACIÓN",
        colorClass: "text-violet-400 border-violet-500/30 bg-violet-500/10",
        desc: "Repeticiones lentas con respiración nasal profunda para activar el nervio vago y acelerar la recuperación celular.",
        sets: [
          {
            id: "p6_s1",
            label: "Serie 1",
            weight: roundWeight(effectiveMax * 0.48),
            reps: "8–10",
            tempo: "3-1-2-0",
            rest: 60,
          },
          {
            id: "p6_s2",
            label: "Serie 2",
            weight: roundWeight(effectiveMax * 0.38),
            reps: "10–12",
            tempo: "3-1-2-0",
            rest: 45,
          },
        ],
      },
    ];
  }, [effectiveMax]);

  // 4-Week Wave Progression
  const waveProgression = useMemo(() => {
    return [
      {
        week: "Semana 1",
        focus: "Acumulación",
        mult: 1.0,
        load: roundWeight(effectiveMax * 0.82),
        note: "Consolidación de técnica y adaptación neural",
      },
      {
        week: "Semana 2",
        focus: "Sobrecarga +2.5%",
        mult: 1.025,
        load: roundWeight(effectiveMax * 0.82 * 1.025),
        note: "Incremento controlado de carga",
      },
      {
        week: "Semana 3",
        focus: "Pico de Fuerza +5.0%",
        mult: 1.05,
        load: roundWeight(effectiveMax * 0.82 * 1.05),
        note: "Máxima tensión miofibrilar del microciclo",
      },
      {
        week: "Semana 4",
        focus: "Descarga (-40%)",
        mult: 0.6,
        load: roundWeight(effectiveMax * 0.82 * 0.6),
        note: "Regeneración de tendones, colágeno y mielina",
      },
    ];
  }, [effectiveMax]);

  // Calculated primary working weight for Plate breakdown
  const primaryWorkWeight = roundWeight(effectiveMax * 0.85);

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-300">
      {/* Selector de Ejercicio & Configuración del PR */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl space-y-4">
        {/* Cabecera del Motor */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-900">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Dumbbell className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider">
                MOTOR UNIVERSAL DE PR &middot; CUALQUIER EJERCICIO
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Agnóstico al movimiento: calculá el protocolo exacto de 6 fases y la sobrecarga ondulada para cualquier ejercicio.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Botón Ver Demo & Técnica */}
            <button
              type="button"
              onClick={() => {
                playTactileClick();
                if (onOpenVideo) {
                  onOpenVideo(activeName);
                } else {
                  setShowInlineDemo(!showInlineDemo);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-xs font-mono font-bold text-amber-300 transition-all active:scale-95 cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.15)]"
              title="Ver video técnico y biomecánica del ejercicio"
            >
              <Play className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>DEMO & TÉCNICA</span>
            </button>

            <button
              type="button"
              onClick={resetAllSets}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:border-amber-500/40 text-xs font-mono text-zinc-400 hover:text-amber-400 transition-all cursor-pointer"
              title="Reiniciar casillas de series completadas"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Limpiar</span>
            </button>
          </div>
        </div>

        {/* DEMO TÉCNICA INLINE (DESPLEGABLE) */}
        {showInlineDemo && (
          <div className="p-4 rounded-2xl bg-black border border-amber-500/40 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 fill-amber-400 text-amber-400" />
                <h4 className="text-xs font-mono font-bold text-white uppercase">
                  DEMO TÉCNICA BIOMECÁNICA &middot; {exerciseMedia.name}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowInlineDemo(false)}
                className="text-xs font-mono text-zinc-400 hover:text-white px-2 py-1"
              >
                ✕ Cerrar
              </button>
            </div>

            {/* Video Player */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
              <video
                src={exerciseMedia.videoUrl}
                poster={exerciseMedia.posterUrl}
                autoPlay
                loop
                muted
                playsInline
                controls
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/70 text-amber-400 border border-amber-400/30 backdrop-blur-sm">
                Tempo {exerciseMedia.tempo}
              </div>
            </div>

            {/* Form Cues & Mistakes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Claves de Ejecución (Form Cues)</span>
                </div>
                <ul className="space-y-1 text-zinc-300 text-[11px]">
                  {exerciseMedia.formCues.map((cue, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{cue}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Errores a Evitar</span>
                </div>
                <ul className="space-y-1 text-zinc-400 text-[11px]">
                  {exerciseMedia.commonMistakes.map((mistake, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Chips de Ejercicios Frecuentes */}
        <div className="space-y-2">
          <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">
            1. SELECCIONÁ UN EJERCICIO O ESCRIBÍ EL TUYO
          </label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {COMMON_EXERCISES.map((ex) => {
              const isSelected = !isCustom && exerciseName === ex.name;
              return (
                <button
                  key={ex.name}
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    setIsCustom(false);
                    setExerciseName(ex.name);
                    setPrWeight(ex.defaultPr);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer min-h-[38px] flex items-center justify-center ${
                    isSelected
                      ? "bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20 scale-[1.02]"
                      : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 active:scale-95"
                  }`}
                >
                  {ex.name}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setIsCustom(true);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer min-h-[38px] flex items-center justify-center ${
                isCustom
                  ? "bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20 scale-[1.02]"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 active:scale-95"
              }`}
            >
              ✍️ Otro Ejercicio...
            </button>
          </div>

          {/* Campo para ejercicio personalizado */}
          {isCustom && (
            <div className="pt-2">
              <input
                type="text"
                value={customExercise}
                onChange={(e) => setCustomExercise(e.target.value)}
                placeholder="Escribí cualquier ejercicio (ej. Prensa Inclinada 45°, Press Arnold, Hip Thrust...)"
                className="w-full bg-zinc-900 border border-amber-500/40 rounded-xl px-4 py-2.5 text-xs font-mono text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-amber-500 shadow-inner"
              />
            </div>
          )}
        </div>

        {/* Configuración de PR / 1RM con Steppers Móviles */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end pt-2 border-t border-zinc-900">
          <div className="sm:col-span-6 space-y-1.5">
            <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">
              2. TU PR / 1-REP MAX ACTUAL (KG)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={prWeight || ""}
                onChange={(e) => setPrWeight(parseFloat(e.target.value) || 0)}
                placeholder="100"
                min={5}
                max={999}
                step={0.5}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 font-mono text-xl font-bold text-center text-amber-400 outline-none focus:border-amber-500"
              />
              <span className="text-xs font-mono font-bold text-zinc-400">KG</span>
            </div>

            {/* Steppers táctiles de ajuste rápido (+/- kg) */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => adjustPr(-5)}
                className="py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-mono text-zinc-300 font-bold active:scale-95 transition-all"
                title="Restar 5 kg"
              >
                -5 kg
              </button>
              <button
                type="button"
                onClick={() => adjustPr(-2.5)}
                className="py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-mono text-zinc-300 font-bold active:scale-95 transition-all"
                title="Restar 2.5 kg"
              >
                -2.5 kg
              </button>
              <button
                type="button"
                onClick={() => adjustPr(2.5)}
                className="py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[11px] font-mono text-amber-300 font-bold active:scale-95 transition-all"
                title="Sumar 2.5 kg"
              >
                +2.5 kg
              </button>
              <button
                type="button"
                onClick={() => adjustPr(5)}
                className="py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[11px] font-mono text-amber-300 font-bold active:scale-95 transition-all"
                title="Sumar 5 kg"
              >
                +5 kg
              </button>
            </div>
          </div>

          <div className="sm:col-span-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Botón calcular submáximo */}
            <button
              type="button"
              onClick={() => setShowSubmaxCalc(!showSubmaxCalc)}
              className="flex-1 px-3 py-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 min-h-[46px]"
            >
              <Target className="w-4 h-4 text-cyan-400" />
              <span>{showSubmaxCalc ? "Ocultar Calculador" : "¿No sabes tu PR? Calcular"}</span>
            </button>

            {/* Toggle Escudo 90% TM */}
            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setUseTrainingMax(!useTrainingMax);
              }}
              className={`px-3 py-3 rounded-xl border text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 min-h-[46px] ${
                useTrainingMax
                  ? "bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-md shadow-amber-500/10"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400"
              }`}
              title="Calcula las series efectivas sobre el 90% del 1RM para proteger articulaciones y tendones"
            >
              <Shield className="w-4 h-4 text-amber-400" />
              <span>{useTrainingMax ? "Escudo 90% TM (ON)" : "100% 1RM (OFF)"}</span>
            </button>
          </div>
        </div>

        {/* Panel Desplegable: Calculador Submáximo RIR */}
        {showSubmaxCalc && (
          <div className="p-4 rounded-xl bg-zinc-900/90 border border-cyan-500/40 space-y-3 animate-in fade-in duration-200">
            <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Cálculo Seguro de 1RM con Serie Submáxima (Brzycki + Epley)
            </span>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Ingresá una serie que hayas movido cómodo. El motor calculará tu 1RM estimado sin exponerte al fallo.
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[9px] font-mono text-zinc-500 block mb-1">Carga (kg)</label>
                <input
                  type="number"
                  value={subWeight}
                  onChange={(e) => setSubWeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 font-mono text-center text-xs font-bold text-zinc-100"
                />
              </div>
              <div>
                <label className="text-[9px] font-mono text-zinc-500 block mb-1">Reps Logradas</label>
                <input
                  type="number"
                  value={subReps}
                  onChange={(e) => setSubReps(parseInt(e.target.value, 10) || 1)}
                  min={1}
                  max={12}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 font-mono text-center text-xs font-bold text-zinc-100"
                />
              </div>
              <div>
                <label className="text-[9px] font-mono text-zinc-500 block mb-1">RIR (Reserva)</label>
                <select
                  value={subRir}
                  onChange={(e) => setSubRir(parseInt(e.target.value, 10))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 font-mono text-xs text-zinc-100 h-[34px]"
                >
                  <option value={2}>2 RIR (Seguro)</option>
                  <option value={1}>1 RIR (Casi Tope)</option>
                  <option value={0}>0 RIR (Fallo)</option>
                  <option value={3}>3 RIR (Holgado)</option>
                </select>
              </div>
            </div>
            <button
              type="button"
              onClick={applySubmax}
              className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95"
            >
              Calcular y Aplicar al Protocolo &rarr;
            </button>
          </div>
        )}
      </div>

      {/* Resumen del Balance de Trabajo & INOL Óptimo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-center font-mono">
        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-900">
          <span className="text-[10px] text-zinc-500 block uppercase">1RM Real</span>
          <span className="text-lg sm:text-xl font-black text-zinc-200">{prWeight} kg</span>
        </div>
        <div className="p-3 rounded-xl bg-zinc-950 border border-amber-500/30">
          <span className="text-[10px] text-amber-400 block uppercase">Base Trabajo (TM)</span>
          <span className="text-lg sm:text-xl font-black text-amber-400">{roundWeight(effectiveMax)} kg</span>
        </div>
        <div className="p-3 rounded-xl bg-zinc-950 border border-orange-500/30">
          <span className="text-[10px] text-orange-400 block uppercase">Carga 85% Diana</span>
          <span className="text-lg sm:text-xl font-black text-orange-400">{primaryWorkWeight} kg</span>
        </div>
        <div className="p-3 rounded-xl bg-zinc-950 border border-cyan-500/30">
          <span className="text-[10px] text-cyan-400 block uppercase">Descanso ATP</span>
          <span className="text-lg sm:text-xl font-black text-cyan-400">3–4 min</span>
        </div>
      </div>

      {/* PROTOCOLO EXACTO PASO A PASO (LAS 6 FASES) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <span className="text-xs font-mono font-bold text-zinc-300 uppercase flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>EL PROTOCOLO EXACTO PARA:</span>
            <span className="text-amber-400 font-black">{activeName}</span>
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            Tocá el reloj de cada serie para iniciar el descanso de ATP
          </span>
        </div>

        <div className="space-y-3">
          {protocolPhases.map((phase) => {
            const isFase4 = phase.id === "p4";
            const isFase5 = phase.id === "p5";

            return (
              <div
                key={phase.id}
                className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-zinc-900 hover:border-zinc-800 transition-all space-y-3 shadow-xl"
              >
                {/* Encabezado de la fase */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-zinc-900">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${phase.colorClass}`}>
                        {phase.badge} &middot; {phase.pct}
                      </span>
                      <h4 className="text-xs sm:text-sm font-mono font-bold text-zinc-200">
                        {phase.name}
                      </h4>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                      {phase.desc}
                    </p>
                  </div>
                </div>

                {/* Si es Fase 4 (Fuerza Máxima), mostrar visualizador de discos para cargar la barra */}
                {isFase4 && (
                  <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-amber-400 uppercase block">
                      Discos sugeridos por lado para la carga principal ({primaryWorkWeight} kg):
                    </span>
                    <BarbellPlateVisualizer
                      targetWeightKg={primaryWorkWeight}
                      exerciseName={activeName}
                    />
                  </div>
                )}

                {/* Series de la fase */}
                <div className="space-y-2">
                  {phase.sets.map((set) => {
                    const isDone = completedSets[set.id] || false;
                    return (
                      <div
                        key={set.id}
                        onClick={() => toggleSetComplete(set.id, phase.name, set.rest)}
                        className={`p-3 sm:p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer select-none active:scale-[0.99] min-h-[56px] ${
                          isDone
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 shadow-sm"
                            : "bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all flex-shrink-0 ${
                              isDone
                                ? "bg-emerald-500 border-emerald-400 text-zinc-950"
                                : "border-zinc-700 bg-zinc-800 text-transparent"
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 font-mono text-xs sm:text-sm">
                              <span className="font-bold text-zinc-300">{set.label}:</span>
                              <span className="text-sm sm:text-base font-black text-amber-400">{set.weight} kg</span>
                              <span className="text-zinc-500">&times;</span>
                              <span className="font-bold text-zinc-100">{set.reps} reps</span>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-500 block">
                              Tempo {set.tempo} &middot; Descanso {set.rest}s
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            playTactileClick();
                            onStartTimer(set.rest, `${activeName} · ${phase.name}`);
                          }}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-zinc-950 text-xs font-mono font-bold transition-all shadow-sm active:scale-95"
                          title={`Iniciar descanso de ${set.rest} segundos`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>{set.rest}s</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PROGRESIÓN POR ONDAS (4 SEMANAS PARA ESTE EJERCICIO) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-4 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <TrendingUp className="w-4 h-4" />
          </span>
          <h4 className="text-xs sm:text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider">
            PLAN DE SOBRECARGA ONDULADA (4 SEMANAS)
          </h4>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Progresión calculada específicamente para <strong className="text-amber-400">{activeName}</strong> partiendo de tu 1RM de {prWeight} kg:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {waveProgression.map((wp) => (
            <div
              key={wp.week}
              className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5 font-mono"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-200">{wp.week}</span>
                <span className="text-[10px] text-amber-400 font-bold">{wp.focus}</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-300">
                {wp.load} kg
              </div>
              <p className="text-[10px] text-zinc-500 leading-tight">
                {wp.note}
              </p>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800 text-[11px] font-mono text-zinc-400 flex items-start gap-2">
          <span className="text-amber-400 font-bold text-sm">💡</span>
          <span>
            <strong>Regla de Aumento de Carga:</strong> Si en la Semana 3 completás todas las series efectivas con velocidad de barra fluida, sumá entre un <strong>2.5% y 5%</strong> a tu 1RM para el siguiente microciclo.
          </span>
        </div>
      </div>

      {/* CLAVES BIOMECÁNICAS PARA MÁXIMOS RESULTADOS */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-3">
        <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
          <Award className="w-4 h-4" /> REGLAS DE ORO PARA EL MÁXIMO RENDIMIENTO & FUERZA
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-400">
          <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-1">
            <strong className="text-zinc-200 block">1. Aceleración Compensatoria (CAT)</strong>
            <span>Acelerá cada repetición concéntrica con 100% de intención. Recluta unidades motoras de alto umbral sin degradar la técnica.</span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-1">
            <strong className="text-zinc-200 block">2. Corte al 20% de Caída de Velocidad</strong>
            <span>Si una repetición sube claramente más lenta que la primera, dejá la barra. Luchar repeticiones agónicas solo degrada el SNC.</span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-1">
            <strong className="text-zinc-200 block">3. Bracing Neumático 360°</strong>
            <span>Inhalá expandiendo el torso hacia el suelo pélvico para blindar la columna lumbar con presión intraabdominal rígida.</span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-1">
            <strong className="text-zinc-200 block">4. Resíntesis de ATP Completa (3–5 min)</strong>
            <span>No apures el descanso en las series de Fase 4. La fosfocreatina necesita mínimo 180 a 240 segundos para recargar al 95–98%.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
