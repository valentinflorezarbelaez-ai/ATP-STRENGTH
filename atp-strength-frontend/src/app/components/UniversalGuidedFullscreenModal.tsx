"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  CheckCircle2,
  Play,
  Pause,
  Volume2,
  Sparkles,
  Trophy,
  ArrowRight,
  Heart,
  Coffee,
} from "lucide-react";
import { AtpEnergyRing } from "@/app/components/AtpEnergyRing";
import { BarbellPlateVisualizer } from "@/app/components/BarbellPlateVisualizer";
import {
  speakText,
  formatBarbellPlatesSpoken,
} from "@/lib/acousticFeedback";
import { playTactileClick, playChime } from "@/lib/zenAudio";
import { TrainingVoicePicker } from "@/app/components/TrainingVoicePicker";

export interface UniversalGuidedFullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseName: string;
  prWeight: number;
  selectedBarWeight: number;
  protocolPhases: Array<{
    id: string;
    name: string;
    pct: string;
    badge: string;
    colorClass: string;
    desc: string;
    sets: Array<{
      id: string;
      label: string;
      weight: number;
      reps: string;
      targetRepsNum?: number;
      tempo: string;
      rest: number;
      targetRpe: number;
    }>;
  }>;
  completedSets: Record<string, boolean>;
  onToggleSetComplete: (setId: string, phaseName: string, restSec: number) => void;
  onResetAllSets: () => void;
}

interface FlatSet {
  id: string;
  label: string;
  weight: number;
  reps: string;
  tempo: string;
  rest: number;
  targetRpe: number;
  phaseId: string;
  phaseName: string;
  phaseBadge: string;
  phaseColorClass: string;
}

export function UniversalGuidedFullscreenModal({
  isOpen,
  onClose,
  exerciseName,
  selectedBarWeight,
  protocolPhases,
  completedSets,
  onToggleSetComplete,
  onResetAllSets,
}: UniversalGuidedFullscreenModalProps) {
  // Aplanamos todas las series en orden cronológico
  const allSets = useMemo<FlatSet[]>(() => {
    return protocolPhases.flatMap((phase) =>
      phase.sets.map((set) => ({
        ...set,
        phaseId: phase.id,
        phaseName: phase.name,
        phaseBadge: phase.badge,
        phaseColorClass: phase.colorClass,
      }))
    );
  }, [protocolPhases]);

  // Próxima serie que falta por hacer
  const activeSet = useMemo(() => {
    return allSets.find((s) => !completedSets[s.id]) || null;
  }, [allSets, completedSets]);

  const activeIndex = useMemo(() => {
    if (!activeSet) return allSets.length;
    return allSets.findIndex((s) => s.id === activeSet.id);
  }, [allSets, activeSet]);

  const completedCount = useMemo(() => {
    return allSets.filter((s) => completedSets[s.id]).length;
  }, [allSets, completedSets]);

  const progressPercent = useMemo(() => {
    if (allSets.length === 0) return 0;
    return Math.round((completedCount / allSets.length) * 100);
  }, [completedCount, allSets.length]);

  // Estado del temporizador interno del modo inmersivo
  const [isResting, setIsResting] = useState<boolean>(false);
  const [restDuration, setRestDuration] = useState<number>(60);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(60);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);
  const hasSpokenInitial = useRef<boolean>(false);
  const lastSpokenSetId = useRef<string | null>(null);

  // Mensaje ameno del coach para la serie actual
  const coachWarmMessage = useMemo(() => {
    if (!activeSet) return "¡Entrenamiento completado! Sos un crack.";
    if (activeSet.phaseId === "p1") {
      return `¡Vamos con todo! Empezamos con una activación suave. Sentí la barra ligera y lubricá bien las articulaciones con ${activeSet.reps} repeticiones fluidas.`;
    }
    if (activeSet.phaseId === "p2") {
      return `Excelente. Ahora vamos subiendo la tensión con ritmo. Acelerá la barra con intención explosiva en cada una de las ${activeSet.reps} repeticiones.`;
    }
    if (activeSet.phaseId === "p3") {
      return `¡Acá se despiertan las fibras de potencia! Acomodate bien, respirá hondo y hacé ${activeSet.reps} repeticiones con máxima determinación.`;
    }
    if (activeSet.phaseId === "p4") {
      return `¡Esta es la serie reina de fuerza pura! Concentración total, core apretado y atacá la barra con confianza. Hacé ${activeSet.reps} repeticiones impecables.`;
    }
    if (activeSet.phaseId === "p5") {
      return `Fase pico opcional. Si sentís la velocidad limpia, dale con todo. Si sentís fatiga, escuchá a tu cuerpo y mantené la técnica perfecta.`;
    }
    return `Descarga regenerativa. Respiración profunda y control motor para volver a la calma con ${activeSet.reps} repeticiones lentas.`;
  }, [activeSet]);

  // Cálculo del porcentaje de saturación de ATP durante el descanso
  const atpSaturationPercent = useMemo(() => {
    if (restDuration <= 0) return 100;
    const elapsed = restDuration - remainingSeconds;
    return Math.min(100, Math.round((elapsed / restDuration) * 100));
  }, [restDuration, remainingSeconds]);

  // Al abrir el modal o pasar a la siguiente serie, dar la bienvenida amena (solo cuando no está descansando)
  useEffect(() => {
    if (isOpen && activeSet && !isResting && (!hasSpokenInitial.current || lastSpokenSetId.current !== activeSet.id)) {
      hasSpokenInitial.current = true;
      lastSpokenSetId.current = activeSet.id;
      const platesText = formatBarbellPlatesSpoken(activeSet.weight, selectedBarWeight);
      const spokenText = `¡Hola! Empezamos con ${exerciseName}. ${activeSet.phaseName}, ${activeSet.label}. Cargale ${activeSet.weight} kilos a la barra para ${activeSet.reps} repeticiones. ${platesText}. Cuando termines, tocá Completar Serie y descansamos juntos.`;
      speakText(spokenText);
    }
  }, [isOpen, activeSet, isResting, exerciseName, selectedBarWeight]);

  const remainingRef = useRef(remainingSeconds);
  const restCueRef = useRef({
    restDuration,
    activeSet,
    exerciseName,
    selectedBarWeight,
  });

  useEffect(() => {
    remainingRef.current = remainingSeconds;
  }, [remainingSeconds]);

  useEffect(() => {
    restCueRef.current = {
      restDuration,
      activeSet,
      exerciseName,
      selectedBarWeight,
    };
  }, [restDuration, activeSet, exerciseName, selectedBarWeight]);

  // Countdown timer para el descanso inmersivo.
  // El tick vive en el callback del intervalo para no llamar setState en el cuerpo del efecto.
  useEffect(() => {
    if (!isResting || isTimerPaused) return;

    const interval = setInterval(() => {
      const snap = restCueRef.current;
      const next = remainingRef.current - 1;

      if (next <= 0) {
        remainingRef.current = 0;
        setRemainingSeconds(0);
        setIsResting(false);
        playChime(true);
        if (snap.activeSet) {
          const nextPlates = formatBarbellPlatesSpoken(snap.activeSet.weight, snap.selectedBarWeight);
          speakText(
            `¡Tiempo cumplido! Se siente esa energía. Ahora tocan ${snap.activeSet.weight} kilos en ${snap.activeSet.label} para ${snap.activeSet.reps} repeticiones. ${nextPlates}. ¡A disfrutar la serie!`
          );
        } else {
          speakText(
            `¡Increíble entrenamiento! Completaste todas las series de ${snap.exerciseName}. Gran esfuerzo hoy, felicitaciones.`
          );
        }
        return;
      }

      remainingRef.current = next;
      setRemainingSeconds(next);

      if (next === 15) {
        speakText("Nos quedan 15 segunditos, ya casi listos. Acercate a la barra con calma.");
      } else if (next === Math.floor(snap.restDuration / 2) && snap.restDuration >= 40) {
        speakText("Mitad del descanso. Respirá hondo por la nariz y oxigená bien los músculos.");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isResting, isTimerPaused]);

  if (!isOpen || typeof document === "undefined") return null;

  // Handler para marcar la serie completada
  const handleCompleteCurrentSet = () => {
    if (!activeSet) return;
    playTactileClick();
    playChime(false);

    const currentRest = activeSet.rest || 60;
    onToggleSetComplete(activeSet.id, activeSet.phaseName, currentRest);

    // Entrar en modo descanso inmersivo si rest > 0
    if (currentRest > 0) {
      remainingRef.current = currentRest;
      setRestDuration(currentRest);
      setRemainingSeconds(currentRest);
      setIsResting(true);
      setIsTimerPaused(false);
      speakText(
        `¡Bien hecho! Excelente esfuerzo. Ahora tomate ${currentRest} segundos de descanso, respirá profundo y recuperá energía mientras se resintetiza el ATP.`
      );
    }
  };

  // Saltar descanso y volver a la serie
  const handleSkipRest = () => {
    playTactileClick();
    remainingRef.current = 0;
    setIsResting(false);
    setRemainingSeconds(0);
    if (activeSet) {
      speakText(`¡Listo antes de tiempo! Vamos a la barra con ${activeSet.weight} kilos.`);
    }
  };

  // Añadir +30s de descanso
  const handleAdd30s = () => {
    playTactileClick();
    remainingRef.current += 30;
    setRemainingSeconds((prev) => prev + 30);
    setRestDuration((prev) => prev + 30);
  };

  return createPortal(
    <div className="atp-fullscreen-chamber fixed inset-0 z-[999999] flex flex-col justify-between overflow-y-auto selection:bg-amber-500 selection:text-black animate-in fade-in duration-300">
      {/* Luces de Fondo Inmersivas */}
      <div className="ambient-mesh-light pointer-events-none" aria-hidden="true">
        <div className="ambient-orb-1 opacity-40" />
        <div className="ambient-orb-2 opacity-40" />
        <div className="ambient-orb-3 opacity-30" />
      </div>

      {/* 1. Barra Superior Inmersiva */}
      <header className="atp-chamber-header w-full max-w-4xl mx-auto p-4 sm:p-6 pb-2 flex flex-col gap-3 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
                  COACH PERSONAL EN VIVO
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-900 border border-zinc-800 text-zinc-300">
                  INMERSIVO
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                {exerciseName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TrainingVoicePicker />

            <button
              type="button"
              onClick={() => {
                playTactileClick();
                if (activeSet) {
                  const platesText = formatBarbellPlatesSpoken(activeSet.weight, selectedBarWeight);
                  speakText(`${coachWarmMessage} Carga recomendada: ${activeSet.weight} kilos. ${platesText}`);
                }
              }}
              className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-400/40 text-amber-400 transition-all cursor-pointer"
              title="Escuchar consejo ameno del coach"
            >
              <Volume2 className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => {
                playTactileClick();
                onClose();
              }}
              className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer"
              title="Minimizar / Salir de pantalla completa"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Progreso del Ejercicio Completo */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>
              {activeSet ? `Serie ${activeIndex + 1} de ${allSets.length}` : "Todas las series completadas"}
            </span>
            <span className="text-amber-400 font-bold">{progressPercent}% completado</span>
          </div>
          <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      {/* 2. Escenario Central Inmersivo */}
      <main className="w-full max-w-3xl mx-auto flex-1 flex flex-col justify-center px-4 sm:px-6 py-6 relative z-10">
        {isResting ? (
          /* ========================================================= */
          /* MODO DESCANSO ACTIVO (ZEN ATP ENERGY RING)                */
          /* ========================================================= */
          <div className="atp-chamber-card w-full p-6 sm:p-10 rounded-3xl bg-zinc-950/95 border border-amber-500/40 text-center space-y-6 shadow-2xl backdrop-blur-2xl relative animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coffee className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                  Resíntesis de ATP &middot; Recuperación Activa
                </span>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                Paso {activeIndex} completado
              </span>
            </div>

            {/* Anillo Radial de Energía de Apple Fitness */}
            <AtpEnergyRing
              remainingSeconds={remainingSeconds}
              atpSaturationPercent={atpSaturationPercent}
              timerTitle={`Descanso en ${exerciseName}`}
            />

            {/* Guía de respiración relajante */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 max-w-md mx-auto space-y-1">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-zinc-200">
                <Heart className="w-4 h-4 text-rose-400 animate-pulse" />
                <span>Respiración guiada del Coach</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Inhalá profundo en 4 segundos, sostené 4 y exhalá despacio. Bajá los hombros y relajá la mente.
              </p>
            </div>

            {/* Acciones del Descanso */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleSkipRest}
                className="w-full h-16 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-lg uppercase tracking-wider shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <span>¡Listo, a la barra!</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsTimerPaused(!isTimerPaused)}
                  className="flex-1 py-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-mono font-medium text-zinc-300 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isTimerPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  <span>{isTimerPaused ? "Reanudar" : "Pausar"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleAdd30s}
                  className="py-3 px-5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-mono font-medium text-amber-400 cursor-pointer"
                >
                  +30s descanso
                </button>
              </div>
            </div>
          </div>
        ) : activeSet ? (
          /* ========================================================= */
          /* MODO SERIE ACTIVA (A LA BARRA CON CARGA Y DISCOS)         */
          /* ========================================================= */
          <div className="atp-chamber-card w-full p-6 sm:p-10 rounded-3xl bg-zinc-950/95 border border-amber-500/40 text-center space-y-6 shadow-2xl backdrop-blur-2xl relative animate-in fade-in duration-300">
            {/* Cabecera de la Fase */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-900">
              <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border self-center sm:self-auto ${activeSet.phaseColorClass}`}>
                {activeSet.phaseBadge}
              </span>
              <span className="text-xs font-mono text-zinc-400">
                {activeSet.phaseName} &middot; {activeSet.label}
              </span>
            </div>

            {/* Kilos Gigantes en Pantalla Completa */}
            <div className="py-2">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest block mb-1">
                Carga de la serie
              </span>
              <div className="text-6xl sm:text-7xl md:text-8xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-100 to-amber-400 drop-shadow-[0_0_35px_rgba(245,158,11,0.3)]">
                {activeSet.weight}
                <span className="text-2xl sm:text-3xl text-zinc-500 font-normal ml-2">KG</span>
              </div>

              {/* Repeticiones & Tempo */}
              <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
                <span className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs sm:text-sm font-mono font-bold text-zinc-200">
                  🎯 {activeSet.reps} REPETICIONES
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs sm:text-sm font-mono font-bold text-cyan-300">
                  ⏱️ TEMPO {activeSet.tempo}
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs sm:text-sm font-mono font-bold text-amber-300">
                  🔥 RPE {activeSet.targetRpe}
                </span>
              </div>
            </div>

            {/* Visualizador de Discos en la Barra */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2 text-left">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                Discos por lado ({selectedBarWeight}kg barra):
              </span>
              <BarbellPlateVisualizer
                targetWeightKg={activeSet.weight}
                exerciseName={exerciseName}
                barWeightKg={selectedBarWeight}
              />
              <p className="text-xs text-amber-400/90 font-mono pt-1">
                {formatBarbellPlatesSpoken(activeSet.weight, selectedBarWeight)}
              </p>
            </div>

            {/* Mensaje Ameno y Cercano del Coach */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-left">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 flex-shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-1 flex-1">
                <span className="text-[11px] font-mono font-bold text-amber-300 uppercase tracking-wider block">
                  Tu Coach Dice:
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                  {coachWarmMessage}
                </p>
              </div>
            </div>

            {/* Botón Principal Gigante: Serie Completada */}
            <button
              type="button"
              onClick={handleCompleteCurrentSet}
              className="w-full h-16 sm:h-20 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-black text-lg sm:text-xl uppercase tracking-wider shadow-2xl shadow-amber-500/30 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <CheckCircle2 className="w-6 h-6 text-black fill-black/20" />
              <span>SERIE COMPLETADA &middot; DESCANSAR ({activeSet.rest}s)</span>
            </button>
          </div>
        ) : (
          /* ========================================================= */
          /* MODO VICTORIA: TODAS LAS SERIES LIQUIDADAS                */
          /* ========================================================= */
          <div className="atp-chamber-card w-full p-8 sm:p-12 rounded-3xl bg-zinc-950/95 border border-emerald-500/40 text-center space-y-6 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-300">
            <div className="p-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 w-20 h-20 mx-auto flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10">
              <Trophy className="w-10 h-10 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white font-mono uppercase tracking-wide">
                ¡EJERCICIO COMPLETADO!
              </h2>
              <p className="text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
                ¡Excelente trabajo! Has completado todas las fases prescritas para <span className="text-amber-400 font-bold">{exerciseName}</span>.
                Tu sistema neuromuscular y supercompensación han quedado registrados en la base de datos.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono text-sm uppercase tracking-wider transition-all cursor-pointer"
              >
                Volver al Cockpit
              </button>
              <button
                type="button"
                onClick={onResetAllSets}
                className="px-6 py-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-mono text-sm transition-all cursor-pointer"
              >
                Reiniciar Ejercicio
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 3. Footer Sencillo de Navegación */}
      <footer className="w-full max-w-4xl mx-auto p-4 text-center text-xs font-mono text-zinc-500 relative z-10">
        Modo Acompañamiento Inmersivo &middot; Toca ✕ o la tecla Esc para volver
      </footer>
    </div>,
    document.body
  );
}
