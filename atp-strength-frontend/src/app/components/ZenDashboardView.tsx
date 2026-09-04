"use client";

import React from "react";
import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";
import { TelemetrySyncBadge } from "@/app/components/TelemetrySyncBadge";
import { TimerDisplay } from "@/app/components/TimerDisplay";
import { WorkoutLogger } from "@/app/components/WorkoutLogger";
import {
  Flame, Zap, RotateCcw, CheckCircle2, Calendar, Activity,
  ShieldCheck, Lock, Maximize2, Layers, Sparkles,
  TrendingUp, X, Save, Dumbbell, History, Calculator,
  AlertTriangle, Trophy,
} from "lucide-react";
import { computeMetrics } from "@/lib/workoutStrategies";
import type { useZenDashboard } from "@/app/hooks/useZenDashboard";

type Dash = ReturnType<typeof useZenDashboard>;

export function ZenDashboardView({ d }: { d: Dash }) {
  const {
    selectedDayKey, setSelectedDayKey,
    activeExerciseIndex, setActiveExerciseIndex,
    currentSet, setCurrentSet,
    activePhaseStep, setActivePhaseStep,
    completedSetsMap, completedWarmupMap,
    persistSessionProgress,
    backendOnline, pendingWalCount,
    zenFocusMode, setZenFocusMode,
    showPrepProtocol, setShowPrepProtocol,
    showProgressModal, setShowProgressModal,
    showResetModal, setShowResetModal,
    showVictoryModal, setShowVictoryModal,
    timerDuration, remainingSeconds, isRunning, timerTitle,
    maxesMap, selectedProgressEx, setSelectedProgressEx,
    formFormula, setFormFormula, formWeight, setFormWeight,
    formReps, setFormReps, formNotes, setFormNotes,
    isSavingMax, exerciseHistory,
    activeDay, activeExercise, activeExMax,
    liveCalc, currentExMax,
    atpSaturationPercent,
    totalDaySets, completedDaySets, dayProgressPercent, isDayFinished,
    handleStartTimer, togglePlayPause, handleResetTimer, skipRest,
    handleResetExercise, handleResetDay,
    handleSaveMax,
    formatTime, playChime, calculateSessionStats,
    SCHEDULE_DAYS, ALL_TRACKABLE_EXERCISES,
  } = d;

  const sessionStats = calculateSessionStats();

  return (
    <main className="min-h-screen bg-black text-zinc-100 flex flex-col items-center justify-between p-4 md:p-8 pb-24 md:pb-8 font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Header */}
      <header className="w-full max-w-6xl flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-5 mb-6">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 glow-zen-gold">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl md:text-2xl font-black tracking-widest text-zinc-100 uppercase">
                  NEURO//<span className="text-amber-400">STRENGTH</span>
                </h1>
                <span className="px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  PRO-V1
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-400 font-mono tracking-tight mt-0.5">
                MOTOR ZEN DE RESÍNTESIS DE ATP & FUERZA MÁXIMA
              </p>
            </div>
          </div>

          <button
            onClick={() => setZenFocusMode(true)}
            className="md:hidden p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-amber-400 cursor-pointer"
            title="Aislamiento Visual True Black"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Acciones de Cabecera (Totalmente visibles y adaptativas en móvil) */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Botón FUERZA / PROGRESO */}
          <button
            onClick={() => {
              if (activeExercise) setSelectedProgressEx(activeExercise.name);
              setShowProgressModal(true);
            }}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 hover:from-amber-500/30 hover:to-amber-600/20 border border-amber-500/40 text-xs font-mono font-bold text-amber-300 shadow-lg shadow-amber-500/5 transition-all transform active:scale-95 cursor-pointer"
          >
            <TrendingUp className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="tracking-wide">FUERZA / PROGRESO</span>
          </button>

          {/* Botón REINICIAR / RESET en Cabecera */}
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 hover:border-amber-500/50 text-xs font-mono text-zinc-300 hover:text-amber-400 transition-all active:scale-95 cursor-pointer"
            title="Reiniciar progreso de entrenamiento"
          >
            <RotateCcw className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="font-bold">RESET</span>
          </button>

          {/* Botón Aislamiento Zen Desktop */}
          <button
            onClick={() => setZenFocusMode(true)}
            className="hidden md:flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 text-xs font-mono text-zinc-300 hover:text-amber-400 transition-all cursor-pointer"
            title="Aislamiento Visual True Black"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Aislamiento Zen</span>
          </button>

          <TelemetrySyncBadge pendingWalCount={pendingWalCount} backendOnline={backendOnline} />
        </div>
      </header>

      {/* PWA In-App Install Prompt Banner */}
      <PwaInstallPrompt />

      {/* Main Grid Layout */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
        {/* Left Column: Itinerario Élite de 4 Días + Ejercicio Activo */}
        <section className="lg:col-span-6 flex flex-col gap-5">
          {/* Selector de Itinerario */}
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-900 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono text-zinc-400 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" /> ITINERARIO ÉLITE FIJO
              </span>
              <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                4 DÍAS + 3 DESCANSO
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SCHEDULE_DAYS.map((day) => {
                const isSelected = day.key === selectedDayKey;
                return (
                  <button
                    key={day.key}
                    onClick={() => {
                      setSelectedDayKey(day.key);
                      setActiveExerciseIndex(0);
                      const dayObj = SCHEDULE_DAYS.find((d) => d.key === day.key);
                      const firstEx = dayObj?.exercises[0];
                      const done = firstEx ? (completedSetsMap[firstEx.name]?.length || 0) : 0;
                      const nextSet = done > 0 && done < (firstEx?.sets || 1) ? done + 1 : 1;
                      setCurrentSet(nextSet);
                      setActivePhaseStep(done === 0 ? "F1" : nextSet.toString());
                      persistSessionProgress(completedSetsMap, completedWarmupMap, day.key, 0, nextSet, done === 0 ? "F1" : nextSet.toString());
                    }}
                    className={`p-3 rounded-xl text-left transition-all border relative overflow-hidden ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500/50 text-white shadow-lg shadow-amber-500/5"
                        : day.isRest
                        ? "bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:border-zinc-800"
                        : "bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold truncate">{day.name}</span>
                      {day.isRest && <Lock className="w-3 h-3 text-zinc-400" />}
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate">
                      {day.isRest ? "Descanso Absoluto" : day.focus}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Barra de Progreso de la Sesión + Botón de Reset */}
          {!activeDay.isRest && (
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-zinc-900 shadow-xl space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <span>PROGRESO DE HOY</span>
                      {isDayFinished && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                          COMPLETADO ✓
                        </span>
                      )}
                    </div>
                    <div className="text-zinc-400 text-[11px] font-mono mt-0.5">
                      {completedDaySets} de {totalDaySets} series efectivas ({dayProgressPercent}%)
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isDayFinished && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowVictoryModal(true);
                        playChime(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 hover:from-amber-500/30 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-md shadow-amber-500/10"
                      title="Ver resumen y tonelaje de la sesión"
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span>Resumen</span>
                    </button>
                  )}

                  {/* Botón de Reset de Sesión */}
                  <button
                    type="button"
                    onClick={() => setShowResetModal(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 hover:border-amber-500/40 text-xs font-mono text-zinc-300 hover:text-amber-400 transition-all active:scale-95 cursor-pointer shadow-sm"
                    title="Reiniciar progreso de sesión o ejercicio"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Barra de Progreso Visual */}
              <div className="w-full h-2.5 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800/80">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                  style={{ width: `${dayProgressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Si el día actual es de Descanso Absoluto */}
          {activeDay.isRest ? (
            <div className="p-8 rounded-2xl bg-zinc-950 border border-zinc-900 text-center flex flex-col items-center justify-center gap-4 shadow-2xl">
              <div className="p-4 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                <Lock className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2">
                  Día de Descanso Absoluto
                </h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                  {activeDay.restMessage}
                </p>
              </div>
              <div className="px-4 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800 text-[11px] font-mono text-amber-400/90">
                ⚡ El crecimiento muscular y la regeneración del SNC ocurren en ausencia de carga.
              </div>
            </div>
          ) : (
            <>
              <WorkoutLogger d={d} />
            </>
          )}
        </section>

        {/* Right Column: Sesión del Día + Estado del Descanso ATP + Guía Neuromuscular */}
        <section className="lg:col-span-5 flex flex-col gap-5">
          {/* Tarjeta de Resíntesis de ATP Activa (Aparece si el temporizador está corriendo) */}
          {(isRunning || remainingSeconds < timerDuration) && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 via-zinc-950 to-black border border-amber-500/40 shadow-2xl shadow-amber-950/30 animate-pulse">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" /> Resíntesis de ATP en Curso
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  {isRunning ? "Recuperando" : "En Pausa"}
                </span>
              </div>

              <div className="flex items-center justify-between my-3">
                <div>
                  <div className="text-4xl font-black font-mono text-white tracking-tight">
                    {formatTime(remainingSeconds)}
                  </div>
                  <div className="text-xs font-mono text-amber-400 mt-1">
                    Saturación Fosfágeno: {atpSaturationPercent}%
                  </div>
                </div>

                <button
                  onClick={() => setZenFocusMode(true)}
                  className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-400/20 active:scale-95 cursor-pointer"
                >
                  Ver Reloj Zen
                </button>
              </div>

              <div className="text-[11px] text-zinc-400 font-mono">
                El sistema fosfágeno restaura el 98% de ATP intracelular. Respira con calma.
              </div>
            </div>
          )}

          {/* Matriz Completa del Día con Cargas de Todos los Ejercicios */}
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-900 shadow-2xl">
            <div className="flex items-center justify-between mb-3 text-xs font-mono">
              <span className="text-zinc-300 font-bold uppercase flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" /> RUTINA COMPLETA DE HOY
              </span>
              <span className="text-[11px] text-amber-400/90 font-mono">
                {activeDay.exercises.length} Ejercicios
              </span>
            </div>

            <div className="space-y-2">
              {activeDay.exercises.map((ex, idx) => {
                const isCurrent = idx === activeExerciseIndex;
                const exMax = maxesMap[ex.name] || computeMetrics(ex.name, 80, 5);
                const doneCount = completedSetsMap[ex.name]?.length || 0;

                return (
                  <button
                    key={ex.name}
                    onClick={() => {
                      setActiveExerciseIndex(idx);
                      setCurrentSet(1);
                    }}
                    className={`w-full p-3.5 rounded-xl text-left flex items-center justify-between text-xs transition-all border cursor-pointer ${
                      isCurrent
                        ? "bg-amber-500/10 border-amber-500/40 text-white shadow-md shadow-amber-500/5"
                        : "bg-zinc-900/30 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-zinc-500 text-[11px]">{idx + 1}.</span>
                        <span className="font-bold text-zinc-200 text-sm">{ex.name}</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono mt-1">
                        {ex.sets} series de {ex.reps} • Descanso: {Math.floor(ex.restSeconds / 60)} min
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black font-mono text-amber-400">
                        {exMax.prescriptions.phase_5_work} kg
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
                        {doneCount} / {ex.sets} series
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Guía Fisiológica de las Fases ATP con Kilos Exactos Adaptados */}
          <div id="guia-fases-atp" className="p-5 rounded-2xl bg-zinc-950 border border-zinc-900 shadow-2xl space-y-3 scroll-mt-6">
            <div className="flex items-center justify-between mb-1 text-xs font-mono">
              <span className="text-zinc-300 font-bold uppercase flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" /> GUÍA DE ACLIMATACIÓN SNC • {activeExercise.name.toUpperCase()}
              </span>
              <button
                onClick={() => setShowPrepProtocol(!showPrepProtocol)}
                className="text-[11px] text-amber-400 hover:underline cursor-pointer"
              >
                {showPrepProtocol ? "Plegar" : "Expandir"}
              </button>
            </div>

            <p className="text-xs text-zinc-400 font-mono leading-relaxed">
              Cargas exactas calculadas para tu capacidad registrada en <strong className="text-white">{activeExercise.name}</strong> para aclimatar motoneuronas alfa sin fatiga antes de las series efectivas.
            </p>

            {showPrepProtocol && (
              <div className="space-y-2.5 font-mono pt-1">
                {[
                  {
                    phase: 0,
                    key: "F0",
                    name: "Fase 0: Movilidad & Flujo Sinovial",
                    cue: "90s continuos",
                    objective: "Descompresión capsular articular y lubricación con líquido sinovial.",
                    duration: 90,
                  },
                  {
                    phase: 1,
                    key: "F1",
                    name: "Fase 1: Activación Dinámica del SNC",
                    cue: `${activeExMax?.prescriptions.phase_1_activation ?? 20} kg × 10 reps (Barra vacía)`,
                    objective: "Reclutamiento de motoneuronas alfa y unidades motoras tipo IIb.",
                    duration: 60,
                  },
                  {
                    phase: 2,
                    key: "F2",
                    name: "Fase 2: Aproximación Ligera",
                    cue: `${activeExMax?.prescriptions.phase_2_light ?? 0} kg × 5 reps`,
                    objective: "Fijación del patrón motor sin fatiga metabólica acumulada.",
                    duration: 90,
                  },
                  {
                    phase: 3,
                    key: "F3",
                    name: "Fase 3: Aproximación Media",
                    cue: `${activeExMax?.prescriptions.phase_3_medium ?? 0} kg × 3 reps`,
                    objective: "Sensibilización barométrica y aclimatación de la tensión tendinosa.",
                    duration: 120,
                  },
                  {
                    phase: 4,
                    key: "F4",
                    name: "Fase 4: Potenciación Pesada (PAP)",
                    cue: `${activeExMax?.prescriptions.phase_4_pap ?? 0} kg × 1 rep`,
                    objective: "Máxima Potenciación Post-Activación (PAP) previa a series efectivas.",
                    duration: 180,
                  },
                ].map((p) => (
                  <div
                    key={p.phase}
                    className="p-3.5 rounded-xl bg-black border border-zinc-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-zinc-700 transition-colors"
                  >
                    <div>
                      <div className="font-bold text-zinc-100 text-xs sm:text-sm">
                        {p.name}
                      </div>
                      <div className="text-amber-400 font-bold text-xs mt-0.5">
                        {p.cue}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                        {p.objective}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (p.key.startsWith("F") && p.phase > 0) {
                          setActivePhaseStep(p.key);
                        }
                        handleStartTimer(p.duration, p.name);
                        setZenFocusMode(true);
                      }}
                      className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/40 font-mono text-xs font-bold whitespace-nowrap transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                      Timer {p.duration}s
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* --- MODAL MAESTRO DE FUERZA Y PROGRESO (MOTOR 1RM / TM) --- */}
      {showProgressModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl max-h-[92dvh] sm:max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 flex flex-col overflow-hidden shadow-2xl">
            {/* Header del Modal */}
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-wider uppercase">
                    PROGRESO & CARGAS OBJETIVO
                  </h2>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono text-amber-400 font-bold">
                    MOTOR 1RM / TM
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  Cálculo fisiológico de cargas para el protocolo secuencial ATP
                </p>
              </div>
              <button
                onClick={() => setShowProgressModal(false)}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido Scrollable */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              {/* Selector Horizontal de Ejercicios */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {ALL_TRACKABLE_EXERCISES.map((ex) => {
                  const isSelected = ex === selectedProgressEx;
                  const hasRecord = !!maxesMap[ex];
                  return (
                    <button
                      key={ex}
                      onClick={() => setSelectedProgressEx(ex)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border cursor-pointer ${
                        isSelected
                          ? "bg-amber-400 text-black border-amber-400 shadow-md shadow-amber-400/20"
                          : hasRecord
                          ? "bg-zinc-900 border-zinc-700 text-white hover:border-amber-400/60"
                          : "bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {ex} {hasRecord && "✓"}
                    </button>
                  );
                })}
              </div>

              {/* 3 Tarjetas de Resumen Biomecánico */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                  <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                    1RM Actual (Máximo)
                  </div>
                  <div className="text-2xl font-black font-mono text-amber-400">
                    {currentExMax ? `${currentExMax.one_rep_max} kg` : "Sin registro"}
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono mt-1">
                    {currentExMax
                      ? `Marca: ${currentExMax.lifted_weight} kg × ${currentExMax.reps_performed} reps (${currentExMax.formula})`
                      : "Ingresá una marca abajo para calcular"}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                    <span>Training Max (TM)</span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold">
                      90% de 1RM
                    </span>
                  </div>
                  <div className="text-2xl font-black font-mono text-white">
                    {currentExMax ? `${currentExMax.training_max} kg` : "—"}
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono mt-1">
                    Margen para evitar sobretensión del SNC
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                    <span>Objetivo Fase 5 (Fuerza)</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                      85% de TM
                    </span>
                  </div>
                  <div className="text-2xl font-black font-mono text-emerald-400">
                    {currentExMax ? `${currentExMax.prescriptions.phase_5_work} kg` : "—"}
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono mt-1">
                    Redondeo activo a incrementos de 2.5 kg
                  </div>
                </div>
              </div>

              {/* Prescripción de Cargas por Fase */}
              {currentExMax && (
                <div className="p-4 sm:p-5 rounded-2xl bg-black border border-zinc-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                      <Calculator className="w-4 h-4" /> 01// PRESCRIPCIÓN DE CARGAS POR FASE PARA {selectedProgressEx.toUpperCase()}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500">Redondeo: 2.5 kg</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
                      <div className="text-[10px] text-zinc-500">F0 • Libre</div>
                      <div className="font-bold text-zinc-300 mt-1">Movilidad</div>
                      <div className="text-[11px] text-zinc-400 mt-1">0 kg (Libre)</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
                      <div className="text-[10px] text-zinc-500">F1 • {currentExMax.prescriptions.phase_1_activation} kg</div>
                      <div className="font-bold text-zinc-300 mt-1">Activación</div>
                      <div className="text-sm font-bold text-amber-400 mt-1">
                        {currentExMax.prescriptions.phase_1_activation} kg
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
                      <div className="text-[10px] text-zinc-500">F2 • {currentExMax.prescriptions.phase_2_light} kg</div>
                      <div className="font-bold text-zinc-300 mt-1">Aprox Ligera</div>
                      <div className="text-sm font-bold text-amber-400 mt-1">
                        {currentExMax.prescriptions.phase_2_light} kg
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
                      <div className="text-[10px] text-zinc-500">F3 • {currentExMax.prescriptions.phase_3_medium} kg</div>
                      <div className="font-bold text-zinc-300 mt-1">Aprox Media</div>
                      <div className="text-sm font-bold text-amber-400 mt-1">
                        {currentExMax.prescriptions.phase_3_medium} kg
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
                      <div className="text-[10px] text-zinc-500">F4 • {currentExMax.prescriptions.phase_4_pap} kg</div>
                      <div className="font-bold text-zinc-300 mt-1">Pesada PAP</div>
                      <div className="text-sm font-bold text-amber-400 mt-1">
                        {currentExMax.prescriptions.phase_4_pap} kg
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/40">
                      <div className="text-[10px] text-amber-400 font-bold">F5 • {currentExMax.prescriptions.phase_5_work} kg</div>
                      <div className="font-bold text-white mt-1">Fuerza Real</div>
                      <div className="text-sm font-black text-amber-300 mt-1">
                        {currentExMax.prescriptions.phase_5_work} kg
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Formulario para Registrar Marca / Actualizar 1RM */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                <div className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-amber-400" />
                  02// REGISTRAR MARCA / ACTUALIZAR 1RM PARA {selectedProgressEx.toUpperCase()}
                </div>

                {/* Métodos de Origen */}
                <div>
                  <div className="text-[11px] font-mono text-zinc-400 uppercase mb-2">
                    Método de cálculo:
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "epley", label: "⚡ Estimación Epley", sub: "P × (1 + R/30)" },
                      { id: "brzycki", label: "📐 Brzycki", sub: "P / (1.0278 - 0.0278×R)" },
                      { id: "direct", label: "🎯 1RM Directo", sub: "1 repetición máxima" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setFormFormula(m.id)}
                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                          formFormula === m.id
                            ? "bg-amber-500/10 border-amber-500/50 text-white"
                            : "bg-black/60 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                        }`}
                      >
                        <div className="text-xs font-bold">{m.label}</div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{m.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Inputs de Peso y Repeticiones */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono text-zinc-300 block mb-1">
                      PESO LEVANTADO (KG):
                    </label>
                    <input
                      type="number"
                      step="2.5"
                      value={formWeight}
                      onChange={(e) => setFormWeight(e.target.value)}
                      placeholder="ej: 120"
                      className="w-full px-3 py-2.5 rounded-xl bg-black border border-zinc-700 text-white font-mono font-bold focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-zinc-300 block mb-1">
                      REPETICIONES COMPLETADAS:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={formReps}
                      onChange={(e) => setFormReps(e.target.value)}
                      placeholder="ej: 5"
                      className="w-full px-3 py-2.5 rounded-xl bg-black border border-zinc-700 text-white font-mono font-bold focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1">
                    OBSERVACIONES / SENSACIONES (OPCIONAL):
                  </label>
                  <input
                    type="text"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="ej: RPE 8.5 con cinto, velocidad concéntrica sólida"
                    className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-700 text-zinc-200 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Preview del Cálculo en Vivo */}
                <div className="p-3 rounded-xl bg-black/80 border border-zinc-800 flex items-center justify-between text-xs font-mono">
                  <div className="text-zinc-400">
                    ⚡ 1RM Estimado: <strong className="text-amber-400">{liveCalc.oneRm} kg</strong>
                  </div>
                  <div className="text-zinc-400">
                    TM (90%): <strong className="text-white">{liveCalc.tm} kg</strong>
                  </div>
                  <div className="text-zinc-400">
                    Fase 5 (85%): <strong className="text-emerald-400">{liveCalc.phase5} kg</strong>
                  </div>
                </div>

                {/* Botón de Guardado */}
                <button
                  type="button"
                  onClick={handleSaveMax}
                  disabled={isSavingMax}
                  className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black uppercase tracking-wider text-xs transition-all transform active:scale-[0.98] shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4 text-black" />
                  <span>
                    {isSavingMax
                      ? "Guardando en PostgreSQL..."
                      : "💾 GUARDAR MARCA Y RECALCULAR CARGAS"}
                  </span>
                </button>
              </div>

              {/* Historial Reciente de Series */}
              {exerciseHistory.length > 0 && (
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <History className="w-4 h-4 text-amber-400" />
                    Historial de Series Registradas en PostgreSQL
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {exerciseHistory.map((item) => (
                      <div
                        key={item.id}
                        className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between text-xs font-mono"
                      >
                        <span className="text-zinc-300">
                          Serie {item.set_number}: <strong>{item.load_kg} kg</strong> × {item.completed_reps || item.prescribed_reps} reps
                        </span>
                        <span className="text-zinc-500 text-[10px]">
                          {item.notes || "Completada"} • Descanso {item.rest_seconds}s
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE CONFIRMACIÓN DE RESET DE SESIÓN / EJERCICIO --- */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                  Reiniciar Progreso
                </h3>
                <p className="text-xs text-zinc-400 font-mono">
                  Control de reinicio de series de entrenamiento
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-zinc-300 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>¿Deseas reiniciar las series registradas?</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Esta acción desmarcará las series completadas para que puedas volver a ejecutarlas desde cero. Tus marcas 1RM no se perderán.
              </p>
            </div>

            <div className="space-y-2.5">
              {/* Opción 1: Reiniciar solo ejercicio actual */}
              <button
                type="button"
                onClick={handleResetExercise}
                className="w-full p-4 rounded-2xl border border-zinc-800 bg-zinc-900/90 hover:bg-zinc-800 hover:border-amber-500/50 text-left transition-all active:scale-[0.98] cursor-pointer group"
              >
                <div className="text-xs font-bold text-white group-hover:text-amber-300 flex items-center justify-between">
                  <span>Reiniciar solo {activeExercise.name}</span>
                  <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                    Este ejercicio
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 font-mono mt-1">
                  Vuelve a la Fase 1 o Serie 1 y desmarca sus series realizadas.
                </div>
              </button>

              {/* Opción 2: Reiniciar sesión de todo el día */}
              <button
                type="button"
                onClick={handleResetDay}
                className="w-full p-4 rounded-2xl border border-red-500/30 bg-red-950/20 hover:bg-red-950/40 hover:border-red-500/60 text-left transition-all active:scale-[0.98] cursor-pointer group"
              >
                <div className="text-xs font-bold text-red-300 group-hover:text-red-200 flex items-center justify-between">
                  <span>Reiniciar toda la sesión ({activeDay.name})</span>
                  <span className="text-[10px] font-mono bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30">
                    Día completo
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 font-mono mt-1">
                  Pone a cero las series de los {activeDay.exercises.length} ejercicios de hoy.
                </div>
              </button>
            </div>

            {/* Botón Cancelar */}
            <button
              type="button"
              onClick={() => setShowResetModal(false)}
              className="w-full py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              Cancelar y continuar entrenando
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL DE VICTORIA Y RESUMEN DE SESIÓN --- */}
      {showVictoryModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-zinc-950 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/10 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header de Celebración */}
            <div className="text-center space-y-2">
              <div className="inline-flex p-4 rounded-3xl bg-gradient-to-b from-amber-500/20 to-amber-500/5 border border-amber-500/40 text-amber-400 shadow-xl shadow-amber-500/10 animate-bounce">
                <Trophy className="w-10 h-10 text-amber-400" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                ¡Sesión Completada!
              </h3>
              <p className="text-xs font-mono text-amber-400 font-bold uppercase tracking-widest">
                NEURO//SUPERCOMPENSACIÓN ACTIVADA • {activeDay.name}
              </p>
            </div>

            {/* Tarjeta de Tonelaje Total Levantado */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-500/15 via-zinc-900/80 to-black border border-amber-500/30 text-center shadow-lg">
              <div className="text-[10px] sm:text-xs font-mono text-zinc-400 uppercase tracking-wider font-bold">
                TONELAJE TOTAL LEVANTADO HOY
              </div>
              <div className="text-4xl sm:text-6xl font-black font-mono text-amber-400 tracking-tight mt-1 flex items-baseline justify-center gap-1.5">
                <span>{sessionStats.tonnageKg.toLocaleString()}</span>
                <span className="text-lg sm:text-2xl text-amber-400/80 font-bold">kg</span>
              </div>
              <div className="text-[11px] font-mono text-zinc-400 mt-2 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Carga bruta total movilizada contra la gravedad</span>
              </div>
            </div>

            {/* Grid de Métricas Secundarias */}
            <div className="grid grid-cols-3 gap-2.5 text-center font-mono">
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div className="text-[10px] uppercase text-zinc-400 font-bold">Series</div>
                <div className="text-base sm:text-lg font-black text-white mt-0.5">
                  {sessionStats.totalEffectiveSets} / {totalDaySets}
                </div>
                <div className="text-[9px] text-zinc-500 mt-0.5">Efectivas</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div className="text-[10px] uppercase text-zinc-400 font-bold">Reps</div>
                <div className="text-base sm:text-lg font-black text-emerald-400 mt-0.5">
                  {sessionStats.totalReps}
                </div>
                <div className="text-[9px] text-zinc-500 mt-0.5">Completas</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div className="text-[10px] uppercase text-zinc-400 font-bold">Ejercicios</div>
                <div className="text-base sm:text-lg font-black text-amber-400 mt-0.5">
                  {activeDay.exercises.length} / {activeDay.exercises.length}
                </div>
                <div className="text-[9px] text-zinc-500 mt-0.5">Realizados</div>
              </div>
            </div>

            {/* Desglose de Ejercicios Realizados */}
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
              <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Resumen de Ejercicios</span>
                <span className="text-emerald-400 text-[10px]">100% CUMPLIDO ✓</span>
              </div>
              <div className="space-y-1.5">
                {activeDay.exercises.map((ex) => {
                  const done = completedSetsMap[ex.name]?.length || 0;
                  const exMax = maxesMap[ex.name];
                  const workKg = exMax?.prescriptions.phase_5_work ?? (exMax?.one_rep_max ? Math.round(exMax.one_rep_max * 0.85) : 80);
                  return (
                    <div
                      key={ex.name}
                      className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/70 flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span className="text-zinc-200 font-bold">{ex.name}</span>
                      </div>
                      <div className="text-right text-zinc-400">
                        <span className="text-amber-400 font-bold">{workKg} kg</span> × {done} series
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mensaje de Supercompensación Fisiológica */}
            <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-zinc-400 font-mono leading-relaxed">
              ⚡ <strong>Supercompensación SNC:</strong> El estímulo de alta tensión mecánica ha sido completado. Tu sistema nervioso central entra en fase de resíntesis y adaptación neuromuscular. Descansá y nutrí tus reservas.
            </div>

            {/* Botones de Acción */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowVictoryModal(false)}
                className="w-full py-4 rounded-2xl bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-mono font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-xl shadow-amber-500/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-black stroke-[3]" />
                <span>CERRAR Y GUARDAR TRIUNFO</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowVictoryModal(false);
                  setShowResetModal(true);
                }}
                className="w-full py-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-mono transition-colors cursor-pointer"
              >
                Reiniciar sesión de hoy si deseás repetirla
              </button>
            </div>
          </div>
        </div>
      )}

      {zenFocusMode && activeExercise && (
        <TimerDisplay
          variant="zen-fullscreen"
          title={timerTitle}
          remainingSeconds={remainingSeconds}
          durationSeconds={timerDuration}
          isRunning={isRunning}
          atpSaturationPercent={atpSaturationPercent}
          exerciseName={activeExercise.name}
          currentSet={currentSet}
          activePhaseStep={activePhaseStep}
          prescriptions={activeExMax?.prescriptions}
          exerciseReps={activeExercise.reps}
          onTogglePlayPause={togglePlayPause}
          onReset={handleResetTimer}
          onSkip={skipRest}
          onPlayChime={() => playChime(false)}
          onCloseZen={() => setZenFocusMode(false)}
        />
      )}

      {/* Footer */}
      <footer className="w-full max-w-6xl border-t border-zinc-900 pt-5 mt-8 flex flex-col md:flex-row items-center justify-between text-xs text-zinc-400 font-mono gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Arquitectura limpia: Frontend desacoplado HTTP + FastAPI Core</span>
        </div>
        <div>NEURO//STRENGTH // High Performance Framework</div>
      </footer>

      {/* Barra Móvil Inferior Fija: acceso 100% permanente a Progreso de Fuerza y Reset */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 border-t border-zinc-800/80 backdrop-blur-xl px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-2xl flex items-center justify-between gap-2">
        <button
          onClick={() => {
            if (activeExercise) setSelectedProgressEx(activeExercise.name);
            setShowProgressModal(true);
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold active:scale-95 transition-all shadow-md shadow-amber-500/10 cursor-pointer"
        >
          <TrendingUp className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>PROGRESO 1RM</span>
          {activeExMax && (
            <span className="ml-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-[10px] text-amber-300 font-bold">
              {activeExMax.one_rep_max}kg
            </span>
          )}
        </button>

        <button
          onClick={() => setShowResetModal(true)}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-amber-400 text-xs font-mono active:scale-95 transition-all cursor-pointer"
          title="Reiniciar progreso"
        >
          <RotateCcw className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>RESET</span>
        </button>

        <button
          onClick={() => setZenFocusMode(true)}
          className="p-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 active:scale-95 transition-all cursor-pointer"
          title="Aislamiento Visual True Black"
        >
          <Maximize2 className="w-4 h-4 text-amber-400" />
        </button>
      </div>
    </main>
  );


}
