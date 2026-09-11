"use client";

import React, { useState } from "react";
import {
  Flame, Sparkles, CheckCircle2, ChevronLeft, ChevronRight,
  Play, Pause, RotateCcw, Volume2, Trophy,
  Minus, Plus, Activity, Heart, ArrowRight, Coffee, Eye, Sun, Moon, Laptop, User, Download, Upload, Database, Zap
} from "lucide-react";
import {
  computeEstimated1Rm,
  rpeToRir,
  VALID_RPE_VALUES,
  type WarmupPhaseKey,
} from "@/lib/workoutStrategies";
import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";
import { AtpEnergyRing } from "@/app/components/AtpEnergyRing";
import { BarbellPlateVisualizer } from "@/app/components/BarbellPlateVisualizer";
import { LiveSetCoachModal } from "@/app/components/LiveSetCoachModal";
import { getPrilepinPrescription, SOVIET_WARMUP_PROTOCOL } from "@/lib/prilepinEngine.mjs";
import { playTactileClick } from "@/lib/zenAudio";
import { useWakeLock } from "@/app/hooks/useWakeLock";
import { getAthleteProfile, setAthleteName, type AthleteProfile } from "@/lib/athleteProfile";
import { exportBackupJson, exportHistoryCsv, importBackupJsonFile } from "@/lib/dataPortability";
import type { useZenDashboard } from "@/app/hooks/useZenDashboard";
import {
  acousticEngine,
  getAudioPreferences,
  saveAudioPreferences,
  formatBarbellPlatesSpoken,
  type CoachAudioPreferences,
} from "@/lib/acousticFeedback";

type Dash = ReturnType<typeof useZenDashboard>;

export function CoachGuidedView({ d }: { d: Dash }) {
  useWakeLock(d.isRunning || !d.isDayFinished);

  const {
    activeDay,
    activeExercise,
    activeExerciseIndex,
    currentSet,
    activePhaseStep,
    completedSetsMap,
    remainingSeconds,
    isRunning,
    timerTitle,
    atpSaturationPercent,
    inputWeight,
    inputReps,
    inputRpe,
    setInputWeight,
    setInputReps,
    setInputRpe,
    activeExMax,
    totalDaySets,
    completedDaySets,
    dayProgressPercent,
    isDayFinished,
    handleStartTimer,
    togglePlayPause,
    skipRest,
    handlePreviousExercise,
    handleNextExercise,
    handleCompleteWarmupPhase,
    handleCompleteSet,
    handleResetDay,
    handleResetExercise,
    toggleCoachMode,
    playChime,
    SCHEDULE_DAYS,
    setSelectedDayKey,
    selectedDayKey,
    setActivePhaseStep,
  } = d;

  const [showDayMenu, setShowDayMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isLiveSetOpen, setIsLiveSetOpen] = useState(false);
  const hasSpokenHalfway = React.useRef(false);
  const hasSpoken15s = React.useRef(false);
  const wasRunning = React.useRef(false);
  const [athlete, setAthlete] = useState<AthleteProfile>(() => getAthleteProfile());
  const [athleteNameInput, setAthleteNameInput] = useState(() => getAthleteProfile().name);
  const [backupMsg, setBackupMsg] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [audioPrefs, setAudioPrefs] = useState<CoachAudioPreferences>(() => getAudioPreferences());
  const hasSpoken10sWarning = React.useRef(false);
  const hasSpokenVictory = React.useRef(false);

  React.useEffect(() => {
    if (isRunning) {
      wasRunning.current = true;
      // 15 seconds warning
      if (remainingSeconds === 15 && !hasSpoken15s.current) {
        hasSpoken15s.current = true;
        acousticEngine.playRest15sWarningCue();
      }
      // 10 seconds warning
      if (remainingSeconds === 10 && !hasSpoken10sWarning.current) {
        hasSpoken10sWarning.current = true;
        acousticEngine.playRestWarningCue();
      }
      // Halfway recovery reminder
      const duration = d.timerDuration || 180;
      const halfway = Math.floor(duration / 2);
      if (remainingSeconds === halfway && !hasSpokenHalfway.current && duration >= 30) {
        hasSpokenHalfway.current = true;
        acousticEngine.playRestHalfwayCue();
      }
    } else {
      hasSpokenHalfway.current = false;
      hasSpoken15s.current = false;
      hasSpoken10sWarning.current = false;

      // When timer hits zero from active countdown, announce next set instructions
      if (wasRunning.current && remainingSeconds === 0) {
        wasRunning.current = false;
        const weightKg = parseFloat(inputWeight) || 80;
        const reps = parseInt(inputReps, 10) || 5;
        const isBodyweight = activeExercise.name.toLowerCase().includes("dominada") || activeExercise.name.toLowerCase().includes("fondo");
        const platesSpoken = formatBarbellPlatesSpoken(weightKg, 20, isBodyweight);

        acousticEngine.playRestCompleteCue({
          exerciseName: activeExercise.name,
          weightKg,
          reps,
          platesSpoken,
        });
      }
    }
  }, [isRunning, remainingSeconds, d.timerDuration, inputWeight, inputReps, activeExercise.name]);

  React.useEffect(() => {
    if (isDayFinished && !hasSpokenVictory.current) {
      hasSpokenVictory.current = true;
      acousticEngine.playSessionVictoryCue();
    }
    if (!isDayFinished) {
      hasSpokenVictory.current = false;
    }
  }, [isDayFinished]);

  const toggleVoiceCoach = () => {
    const next = saveAudioPreferences({ voiceEnabled: !audioPrefs.voiceEnabled });
    setAudioPrefs(next);
    if (next.voiceEnabled) {
      acousticEngine.playSetCompleteCue({
        weightKg: parseFloat(inputWeight) || 80,
        reps: parseInt(inputReps, 10) || 5,
      });
    }
  };

  // Execution: logs set with adaptive autoregulation
  const onExecuteSetComplete = (params?: { weightKg: number; reps: number; rpe: number }) => {
    const weight = params?.weightKg ?? (parseFloat(inputWeight) || 80);
    const reps = params?.reps ?? (parseInt(inputReps, 10) || 5);
    const rpe = params?.rpe ?? (parseFloat(inputRpe) || 8);

    if (rpe >= 9.5 && !isWarmupPhase && currentSet < activeExercise.sets) {
      const nextWeight = Math.max(20, Math.round((weight - 5) * 10) / 10);
      setInputWeight(String(nextWeight));
      acousticEngine.playAutoregulationCue({
        direction: "DOWN",
        deltaKg: 5,
        nextWeightKg: nextWeight,
        rpe,
      });
    } else if (rpe <= 6.5 && !isWarmupPhase && currentSet < activeExercise.sets) {
      const nextWeight = Math.round((weight + 2.5) * 10) / 10;
      setInputWeight(String(nextWeight));
      acousticEngine.playAutoregulationCue({
        direction: "UP",
        deltaKg: 2.5,
        nextWeightKg: nextWeight,
        rpe,
      });
    } else {
      acousticEngine.playSetCompleteCue({ weightKg: weight, reps, rpe });
    }

    handleCompleteSet();
  };

  // Helper: adjust weight by delta with tactile click
  const adjustWeight = (delta: number) => {
    playTactileClick();
    const current = parseFloat(inputWeight) || 80;
    const next = Math.max(0, current + delta);
    setInputWeight(String(next));
  };

  // Helper: adjust reps by delta with tactile click
  const adjustReps = (delta: number) => {
    playTactileClick();
    const current = parseInt(inputReps, 10) || 3;
    const next = Math.max(1, current + delta);
    setInputReps(String(next));
  };

  const currentWeightNum = parseFloat(inputWeight) || 0;
  const current1RmNum = activeExMax?.one_rep_max || 0;
  const prilepin = getPrilepinPrescription(currentWeightNum, current1RmNum);

  const isWarmupPhase = ["F0", "F1", "F2", "F3", "F4"].includes(activePhaseStep);
  const currentSetsList = (activeExercise && completedSetsMap[activeExercise.name]) || [];

  // Descriptive text for warmup phases (Soviet Deterministic Protocol)
  const getWarmupPhaseInfo = (phase: string) => {
    switch (phase) {
      case "F0":
        return {
          title: SOVIET_WARMUP_PROTOCOL.F0.title,
          load: "Sin peso",
          reps: SOVIET_WARMUP_PROTOCOL.F0.repsLabel,
          cue: SOVIET_WARMUP_PROTOCOL.F0.cue,
        };
      case "F1":
        return {
          title: SOVIET_WARMUP_PROTOCOL.F1.title,
          load: activeExercise.name.toLowerCase().includes("dominada") ? "Peso corporal" : "Barra sola (20 kg)",
          reps: SOVIET_WARMUP_PROTOCOL.F1.repsLabel,
          cue: SOVIET_WARMUP_PROTOCOL.F1.cue,
        };
      case "F2":
        return {
          title: SOVIET_WARMUP_PROTOCOL.F2.title,
          load: activeExMax?.prescriptions.phase_2_light ? `${activeExMax.prescriptions.phase_2_light} kg` : "40-50 kg (~50%)",
          reps: SOVIET_WARMUP_PROTOCOL.F2.repsLabel,
          cue: SOVIET_WARMUP_PROTOCOL.F2.cue,
        };
      case "F3":
        return {
          title: SOVIET_WARMUP_PROTOCOL.F3.title,
          load: activeExMax?.prescriptions.phase_3_medium ? `${activeExMax.prescriptions.phase_3_medium} kg` : "65-75 kg (~70%)",
          reps: SOVIET_WARMUP_PROTOCOL.F3.repsLabel,
          cue: SOVIET_WARMUP_PROTOCOL.F3.cue,
        };
      case "F4":
        return {
          title: SOVIET_WARMUP_PROTOCOL.F4.title,
          load: activeExMax?.prescriptions.phase_4_pap ? `${activeExMax.prescriptions.phase_4_pap} kg` : "80-85 kg (~85%)",
          reps: SOVIET_WARMUP_PROTOCOL.F4.repsLabel,
          cue: SOVIET_WARMUP_PROTOCOL.F4.cue,
        };
      default:
        return {
          title: "Aproximación Técnica",
          load: "Carga progresiva",
          reps: "3 reps exactas",
          cue: "Calentamiento específico controlado.",
        };
    }
  };

  // Audio Briefing: tells the athlete exactly what, how much and how to lift
  const handlePlayPreSetBriefing = () => {
    playTactileClick();
    const isWarmup = isWarmupPhase;
    let weightKg = 0;
    let reps = 0;
    let phaseLabel = "";
    let cueText = activeExercise.cue || "Postura firme y empuje explosivo";

    if (isWarmup) {
      const phaseKey = activePhaseStep as WarmupPhaseKey;
      phaseLabel = `Calentamiento ${phaseKey}`;
      const warmInfo = getWarmupPhaseInfo(phaseKey);
      weightKg = parseFloat(warmInfo.load) || 20;
      reps = parseInt(warmInfo.reps, 10) || 5;
      cueText = warmInfo.cue;
    } else {
      phaseLabel = `Serie ${currentSet} de ${activeExercise.sets}`;
      weightKg = parseFloat(inputWeight) || 80;
      reps = parseInt(inputReps, 10) || 5;
    }

    const isBodyweight = activeExercise.name.toLowerCase().includes("dominada") || activeExercise.name.toLowerCase().includes("fondo");
    const platesSpoken = formatBarbellPlatesSpoken(weightKg, 20, isBodyweight);

    acousticEngine.playPreSetBriefing({
      exerciseName: activeExercise.name,
      phaseLabel,
      weightKg,
      reps,
      rpe: isWarmup ? 0 : (parseFloat(inputRpe) || 8),
      cues: cueText,
      platesSpoken,
    });
  };

  return (
    <main className="min-h-screen relative overflow-x-hidden flex flex-col items-center justify-between p-4 md:p-6 pb-20 font-sans selection:bg-pink-500 selection:text-white">
      {/* Ambient Radial Mesh Backgrounds (Apple Music + Tidal Luxury Style) */}
      <div className="ambient-mesh-light" aria-hidden="true">
        <div className="ambient-orb-1" />
        <div className="ambient-orb-2" />
        <div className="ambient-orb-3" />
      </div>
      {/* 1. Top Coach Header */}
      <header className="w-full max-w-2xl flex items-center justify-between gap-3 border-b border-zinc-900/80 pb-4 mb-4">
        {/* Brand & Coach Status */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black tracking-wide text-white uppercase">
                ATP <span className="text-amber-400">COACH</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                GUIADO
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans">
              Tu asistente de fuerza y descanso paso a paso
            </p>
          </div>
        </div>

        {/* Header Actions: Mode Toggle & Reset */}
        <div className="flex items-center gap-2">
          {/* Athlete Profile & Data Backup */}
          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setShowProfileModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-white/5 backdrop-blur-xl hover:bg-black/5 dark:hover:bg-white/10 text-xs font-mono font-medium transition-all active:scale-95 cursor-pointer shadow-sm"
            title="Perfil de Atleta y Copias de Seguridad"
          >
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline text-zinc-200">{athlete.name}</span>
          </button>

          {/* Qobuz / Apple Music Tri-Mode Aspect Toggle */}
          <button
            type="button"
            onClick={d.toggleTheme}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-white/5 backdrop-blur-xl hover:bg-black/5 dark:hover:bg-white/10 text-xs font-mono font-medium transition-all active:scale-95 cursor-pointer shadow-sm"
            title={
              d.themeMode === 'dark'
                ? "Modo Oscuro (Qobuz Obsidian). Clic para Modo Sistema"
                : d.themeMode === 'light'
                ? "Modo Claro (Apple Porcelain). Clic para Modo Oscuro"
                : "Modo Sistema (Automático). Clic para Modo Claro"
            }
          >
            {d.themeMode === 'dark' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline text-zinc-200">DARK</span>
              </>
            ) : d.themeMode === 'light' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline text-zinc-800">LIGHT</span>
              </>
            ) : (
              <>
                <Laptop className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline text-zinc-300">AUTO</span>
              </>
            )}
          </button>

          {/* Voice Coach Toggle Pill */}
          <button
            type="button"
            onClick={toggleVoiceCoach}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-mono font-medium transition-all active:scale-95 cursor-pointer ${
              audioPrefs.voiceEnabled
                ? "bg-amber-500/10 border-amber-500/40 text-amber-400 shadow-sm"
                : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
            }`}
            title={audioPrefs.voiceEnabled ? "Voz Coach activada (clic para silenciar)" : "Voz Coach silenciada (clic para activar)"}
          >
            <Volume2 className={`w-3.5 h-3.5 ${audioPrefs.voiceEnabled ? "text-amber-400 animate-pulse" : "text-zinc-500"}`} />
            <span className="hidden sm:inline">VOZ:</span> {audioPrefs.voiceEnabled ? "ON" : "OFF"}
          </button>

          {/* Switch to Pro Analytics Mode */}
          <button
            type="button"
            onClick={toggleCoachMode}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 text-xs font-mono font-medium text-zinc-300 hover:text-amber-400 transition-all active:scale-95 cursor-pointer"
            title="Cambiar a Modo Pro (Dashboard Analítico)"
          >
            <Eye className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">MODO</span> PRO
          </button>

          {/* Reset Action */}
          <button
            type="button"
            onClick={() => setShowResetConfirm(!showResetConfirm)}
            className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-amber-400 transition-all cursor-pointer"
            title="Reiniciar sesión o ejercicio"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* PWA Standalone Install Banner */}
      <PwaInstallPrompt />

      {/* Reset Popover Menu */}
      {showResetConfirm && (
        <div className="w-full max-w-2xl mb-4 p-4 rounded-2xl bg-zinc-950 border border-red-500/30 text-xs space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-red-400 uppercase tracking-wide">¿Reiniciar progreso?</span>
            <button
              type="button"
              onClick={() => setShowResetConfirm(false)}
              className="text-zinc-500 hover:text-zinc-300 font-mono text-sm cursor-pointer"
            >
              Cerrar
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                handleResetExercise();
                setShowResetConfirm(false);
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-400 font-mono cursor-pointer"
            >
              Reiniciar Ejercicio Actual
            </button>
            <button
              type="button"
              onClick={() => {
                handleResetDay();
                setShowResetConfirm(false);
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 hover:bg-red-900/50 font-mono cursor-pointer"
            >
              Reiniciar Día Completo
            </button>
          </div>
        </div>
      )}

      {/* 2. Day Selector & Overall Session Progress */}
      <section className="w-full max-w-2xl space-y-3 mb-4">
        <div className="flex items-center justify-between gap-2">
          {/* Day Selector Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDayMenu(!showDayMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs font-semibold text-zinc-200 hover:border-amber-500/40 transition-all cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>{activeDay.name}</span>
              <span className="text-zinc-500 text-[10px]">▼</span>
            </button>

            {showDayMenu && (
              <div className="absolute top-full left-0 mt-1 z-30 w-56 p-1.5 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl space-y-1">
                {SCHEDULE_DAYS.map((dItem) => (
                  <button
                    key={dItem.key}
                    type="button"
                    onClick={() => {
                      setSelectedDayKey(dItem.key);
                      setShowDayMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                      dItem.key === selectedDayKey
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                    }`}
                  >
                    <span>{dItem.name}</span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {dItem.exercises.length} ejer.
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Day Completion Stats */}
          <div className="text-right">
            <span className="text-xs font-mono text-amber-400 font-bold">
              {completedDaySets} / {totalDaySets} series
            </span>
            <span className="text-[10px] font-mono text-zinc-500 block">
              {dayProgressPercent}% del día
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
            style={{ width: `${dayProgressPercent}%` }}
          />
        </div>

        {/* Live Soviet INOL Fatigue Gauge */}
        {(() => {
          const stats = d.calculateSessionStats();
          if (!stats?.sessionInol) return null;
          return (
            <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-xs font-mono">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-zinc-400 text-[11px] font-bold uppercase">Fatiga SNC (INOL):</span>
                <span className="font-bold text-white text-sm">{stats.sessionInol.totalInol}</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${stats.sessionInol.badgeColor}`}>
                {stats.sessionInol.label}
              </span>
            </div>
          );
        })()}
      </section>

      {/* 3. Main Guided Card Area */}
      <section className="w-full max-w-2xl flex-1 flex flex-col justify-center my-2">
        {/* CASE A: DAY FINISHED (VICTORY SCREEN) */}
        {isDayFinished ? (
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-amber-500/40 text-center space-y-5 glow-zen-gold animate-in zoom-in-95">
            <div className="inline-flex p-4 rounded-full bg-amber-500/20 text-amber-400 mb-1">
              <Trophy className="w-12 h-12 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                ¡Entrenamiento Completado!
              </h2>
              <p className="text-sm text-zinc-300 max-w-md mx-auto">
                Excelente trabajo de fuerza hoy. Respetaste los tiempos de resíntesis y la sobrecarga progresiva.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto pt-2">
              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] font-mono text-zinc-500 block uppercase">Series Hechas</span>
                <span className="text-2xl font-black font-mono text-amber-400">{completedDaySets}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] font-mono text-zinc-500 block uppercase">Completado</span>
                <span className="text-2xl font-black font-mono text-emerald-400">100%</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={toggleCoachMode}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-sm tracking-wide shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                Ver Resumen Detallado en Modo Pro
              </button>
              <button
                type="button"
                onClick={handleResetDay}
                className="py-3.5 px-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-sm font-medium transition-all cursor-pointer"
              >
                Reiniciar Día
              </button>
            </div>
          </div>
        ) : isRunning ? (
          /* CASE B: ACTIVE ZEN REST TIMER */
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-amber-500/30 text-center space-y-6 shadow-2xl relative overflow-hidden">
            {/* Top Rest Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coffee className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                  Descanso &amp; Resíntesis ATP
                </span>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                {activeExercise.name}
              </span>
            </div>

            {/* Apple Fitness-grade Radial ATP Energy Ring */}
              <AtpEnergyRing
                remainingSeconds={remainingSeconds}
                atpSaturationPercent={atpSaturationPercent}
                timerTitle={timerTitle}
              />

              {/* Mindful Breathing Guide */}
            <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 space-y-1.5 max-w-md mx-auto">
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-zinc-300">
                <Heart className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>Respiración de recuperación</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Inhalá profundo por la nariz en 4s, sostené 4s y exhalá lento. Relajá hombros y mandíbula para optimizar el flujo de oxígeno.
              </p>
            </div>

            {/* What's next preview */}
            <div className="text-xs text-zinc-400 font-mono">
              Próximo paso:{" "}
              <span className="text-white font-bold">
                {isWarmupPhase
                  ? `Siguiente rampa (${activePhaseStep})`
                  : `Serie ${currentSet} de ${activeExercise.sets} con ${inputWeight} kg`}
              </span>
            </div>

            {/* Primary Rest Actions */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={skipRest}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-base uppercase tracking-wider shadow-xl shadow-amber-500/10 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>¡Listo, a la barra!</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={togglePlayPause}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-mono font-medium text-zinc-300 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isRunning ? "Pausar" : "Reanudar"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleStartTimer(remainingSeconds + 30, timerTitle)}
                  className="py-2.5 px-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-mono font-medium text-zinc-300 cursor-pointer"
                >
                  +30s
                </button>
                <button
                  type="button"
                  onClick={() => playChime(false)}
                  className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 cursor-pointer"
                  title="Probar sonido 528 Hz"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* CASE C: ACTIVE STEP (WARMUP OR WORKING SET) */
          <div className="p-5 sm:p-7 rounded-3xl bg-zinc-950 border border-zinc-900 shadow-2xl space-y-6">
            {/* Exercise Header & Progress Indicator */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] sm:text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                  EJERCICIO {activeExerciseIndex + 1} DE {activeDay.exercises.length}
                </span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: activeExercise.sets }).map((_, idx) => {
                    const setNum = idx + 1;
                    const isDone = currentSetsList.includes(setNum);
                    const isCurrent = !isDone && currentSet === setNum;
                    return (
                      <div
                        key={setNum}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          isDone
                            ? "bg-emerald-400"
                            : isCurrent
                            ? "bg-amber-400 ring-4 ring-amber-400/20"
                            : "bg-zinc-800"
                        }`}
                        title={`Serie ${setNum}`}
                      />
                    );
                  })}
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {activeExercise.name}
              </h2>
            </div>

            {/* Audiophile Segmented Progression Rail (F0 -> F4 -> Series) */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 overflow-x-auto">
              {(["F0", "F1", "F2", "F3", "F4"] as const).map((stepKey, idx) => {
                const isCurrent = activePhaseStep === stepKey;
                const isPast = !isWarmupPhase || (["F0", "F1", "F2", "F3", "F4"].indexOf(activePhaseStep) > idx);
                return (
                  <button
                    key={stepKey}
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      setActivePhaseStep(stepKey);
                    }}
                    className={`flex-1 min-w-[50px] py-1.5 px-2 rounded-xl text-[10px] font-mono font-bold transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                      isCurrent
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                        : isPast
                        ? "text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20"
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 border border-transparent"
                    }`}
                  >
                    <span>{stepKey}</span>
                    {isPast && <span className="text-[8px]">✔</span>}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  playTactileClick();
                  setActivePhaseStep("1");
                }}
                className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-xl text-[10px] font-mono font-bold transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                  !isWarmupPhase
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 border border-transparent"
                }`}
              >
                <span>SERIES ({currentSet}/{activeExercise.sets})</span>
              </button>
            </div>

            {/* Conditional: Warmup Phase vs Working Set */}
            {isWarmupPhase ? (
              /* WARMUP PHASE CARD */
              <div className="space-y-4">
                {(() => {
                  const info = getWarmupPhaseInfo(activePhaseStep);
                  return (
                    <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {info.title}
                        </span>
                        <span className="text-xs font-mono text-zinc-400">
                          Rampa preparatoria
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 py-1">
                        <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80">
                          <span className="text-[10px] font-mono text-zinc-500 block uppercase">Carga sugerida</span>
                          <span className="text-xl sm:text-2xl font-black font-mono text-white">{info.load}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80">
                          <span className="text-[10px] font-mono text-zinc-500 block uppercase">Repeticiones</span>
                          <span className="text-xl sm:text-2xl font-black font-mono text-amber-400">{info.reps}</span>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed italic">
                        &ldquo;{info.cue}&rdquo;
                      </p>
                    </div>
                  );
                })()}

                {/* Spoken Coach Briefing for Warmup */}
                <button
                  type="button"
                  onClick={handlePlayPreSetBriefing}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-zinc-900 to-amber-500/10 border border-amber-500/30 hover:border-amber-500/60 text-amber-300 flex items-center justify-between gap-2 text-xs font-mono font-bold transition-all shadow-sm active:scale-[0.99] cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>ESCUCHAR GUÍA DE CALENTAMIENTO (VOZ)</span>
                  </div>
                  <span className="text-[10px] text-zinc-400">Paso a paso ♫</span>
                </button>

                {/* Primary Big Action Button: Complete Warmup Phase */}
                <button
                  type="button"
                  onClick={() => {
                    acousticEngine.playSetCompleteCue();
                    handleCompleteWarmupPhase(activePhaseStep as WarmupPhaseKey);
                  }}
                  className="w-full h-16 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-base uppercase tracking-wider shadow-xl shadow-amber-500/10 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>¡Hecho, a descansar!</span>
                </button>

                {/* Skip Warmup Shortcut */}
                <button
                  type="button"
                  onClick={() => setActivePhaseStep("1")}
                  className="w-full text-center text-xs font-mono text-zinc-500 hover:text-zinc-300 py-1 transition-colors cursor-pointer"
                >
                  Ir directo a las series de trabajo →
                </button>
              </div>
            ) : (
              /* WORKING SET CARD */
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    SERIE EFECTIVA {currentSet} DE {activeExercise.sets}
                  </span>
                  <span className="text-xs font-mono text-zinc-400">
                    Descanso programado: {activeExercise.restSeconds || 180}s
                  </span>
                </div>

                  {/* Soviet Prilepin Exact Target Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                        <span className="text-xs font-mono font-black text-amber-300 uppercase tracking-wider">
                          OBJETIVO DETERMINISTA (SNC PROTEGIDO)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-amber-400 text-black text-xs font-black font-mono shadow-sm">
                          {prilepin.exactTargetReps} REPS EXACTAS
                        </span>
                        {prilepin.setInol > 0 && (
                          <span className="px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400 text-[10px] font-mono font-bold">
                            INOL: +{prilepin.setInol}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                      {prilepin.intensityPercent > 0 ? (
                        <span className="font-mono text-amber-400 font-bold mr-1">
                          {prilepin.intensityPercent}% 1RM ({prilepin.zoneName}):
                        </span>
                      ) : null}
                      {prilepin.rationale}
                    </p>
                  </div>

                {/* Spoken Coach Briefing for Working Set */}
                <button
                  type="button"
                  onClick={handlePlayPreSetBriefing}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-zinc-900 to-amber-500/10 border border-amber-500/30 hover:border-amber-500/60 text-amber-300 flex items-center justify-between gap-2 text-xs font-mono font-bold transition-all shadow-sm active:scale-[0.99] cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>ESCUCHAR GUÍA DEL COACH (VOZ)</span>
                  </div>
                  <span className="text-[10px] text-zinc-400">Paso a paso ♫</span>
                </button>

                {/* Weight & Reps Controllers (Big Ergonomic Touch Targets) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Weight Box */}
                  <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                      Peso para esta serie
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => adjustWeight(-2.5)}
                        className="h-11 w-11 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <div className="text-center flex-1">
                        <span className="text-3xl font-black font-mono text-white">
                          {inputWeight}
                        </span>
                        <span className="text-xs font-mono text-zinc-400 ml-1">kg</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => adjustWeight(2.5)}
                        className="h-11 w-11 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quick Step Weight Chips */}
                    <div className="flex items-center justify-between gap-1 pt-0.5">
                      {[-5, -2.5, 2.5, 5].map((delta) => (
                        <button
                          key={delta}
                          type="button"
                          onClick={() => adjustWeight(delta)}
                          className="flex-1 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[10px] font-mono font-bold active:scale-95 transition-all cursor-pointer"
                        >
                          {delta > 0 ? `+${delta}` : delta}
                        </button>
                      ))}
                    </div>

                    {/* Olympic Barbell Plate Visualizer */}
                    <BarbellPlateVisualizer
                      targetWeightKg={parseFloat(inputWeight) || 0}
                      exerciseName={activeExercise.name}
                    />
                  </div>

                  {/* Reps Box (Soviet Deterministic Exact Target) */}
                  <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                        Repeticiones exactas
                      </span>
                      <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        DETERMINISTA
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => adjustReps(-1)}
                        className="h-11 w-11 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <div className="text-center flex-1">
                        <span className="text-3xl font-black font-mono text-amber-400">
                          {inputReps}
                        </span>
                        <span className="text-xs font-mono text-zinc-400 ml-1">reps</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => adjustReps(1)}
                        className="h-11 w-11 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quick Step Rep Chips */}
                    <div className="flex items-center justify-between gap-1 pt-0.5">
                      {[-1, 1].map((delta) => (
                        <button
                          key={delta}
                          type="button"
                          onClick={() => adjustReps(delta)}
                          className="flex-1 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[10px] font-mono font-bold active:scale-95 transition-all cursor-pointer"
                        >
                          {delta > 0 ? `+${delta} rep` : `${delta} rep`}
                        </button>
                      ))}
                    </div>
                    {parseInt(inputReps, 10) !== prilepin.exactTargetReps && (
                      <button
                        type="button"
                        onClick={() => {
                          playTactileClick();
                          setInputReps(String(prilepin.exactTargetReps));
                        }}
                        className="w-full mt-1.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span>Fijar meta exacta: {prilepin.exactTargetReps} reps (Prilepin)</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Motivational Gym Cue */}
                <div className="p-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 text-xs text-zinc-300 flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>
                    Foco total en la técnica. Respirá profundo antes de sacar la barra y empujá con intención explosiva.
                  </span>
                </div>

                {/* RPE Effort Selector with Live Telemetry */}
                <div className="flex flex-col sm:flex-row items-center justify-between text-xs font-mono px-4 py-2.5 text-zinc-400 bg-zinc-900/60 rounded-2xl border border-zinc-800/80 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 text-[11px] font-bold">RPE ESFUERZO:</span>
                    <div className="flex items-center gap-1 flex-wrap">
                      {VALID_RPE_VALUES.map((rpeVal) => {
                        const isSelected = parseFloat(inputRpe) === rpeVal;
                        return (
                          <button
                            key={rpeVal}
                            type="button"
                            onClick={() => { playTactileClick(); setInputRpe(String(rpeVal)); }}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                              isSelected
                                ? "bg-amber-400 text-black shadow-sm"
                                : "bg-black border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                            }`}
                          >
                            {rpeVal}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {(() => {
                    const parsedRpe = parseFloat(inputRpe);
                    if (VALID_RPE_VALUES.includes(parsedRpe)) {
                      const rir = rpeToRir(parsedRpe);
                      const parsedWeight = parseFloat(inputWeight) || 0;
                      const parsedReps = parseInt(inputReps, 10) || 1;
                      const e1rm =
                        parsedWeight > 0 && parsedReps <= 10
                          ? computeEstimated1Rm(parsedWeight, parsedReps, parsedRpe)
                          : null;
                      return (
                        <span className="text-[10px] text-amber-400/90 font-mono bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 whitespace-nowrap">
                          {rir} RIR {e1rm ? `• e1RM: ${e1rm} kg` : ""}
                        </span>
                      );
                    }
                    return null;
                  })()}
                </div>

                {/* Dual Action Buttons: Live Set Mode & Instant Complete */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      setIsLiveSetOpen(true);
                    }}
                    className="h-16 rounded-2xl bg-zinc-900/90 border border-amber-500/40 hover:bg-zinc-800 text-amber-300 font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer"
                  >
                    <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <span>⚡ Modo Serie en Vivo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const weightKg = parseFloat(inputWeight) || 80;
                      const reps = parseInt(inputReps, 10) || 5;
                      const rpe = parseFloat(inputRpe) || 8;
                      onExecuteSetComplete({ weightKg, reps, rpe });
                    }}
                    className="h-16 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-black font-black text-base sm:text-lg uppercase tracking-wider shadow-2xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                    <span>¡Serie Completada!</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 4. Bottom Exercise Navigation Bar */}
      <footer className="w-full max-w-2xl flex items-center justify-between gap-3 pt-4 border-t border-zinc-900/80 safe-area-bottom-bar">
        <button
          type="button"
          onClick={handlePreviousExercise}
          disabled={activeExerciseIndex === 0}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-mono font-medium transition-all cursor-pointer ${
            activeExerciseIndex === 0
              ? "border-zinc-900 bg-zinc-950 text-zinc-700 cursor-not-allowed"
              : "border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        <span className="text-xs font-mono text-zinc-400 font-semibold truncate max-w-[180px] sm:max-w-none">
          {activeExercise.name}
        </span>

        <button
          type="button"
          onClick={handleNextExercise}
          disabled={activeExerciseIndex === activeDay.exercises.length - 1}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-mono font-medium transition-all cursor-pointer ${
            activeExerciseIndex === activeDay.exercises.length - 1
              ? "border-zinc-900 bg-zinc-950 text-zinc-700 cursor-not-allowed"
              : "border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white"
          }`}
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </footer>
    
      {/* 5. Athlete Profile & Data Portability Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Perfil de Atleta</h3>
                  <span className="text-[10px] font-mono text-zinc-500">ID: {athlete.id}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  playTactileClick();
                  setShowProfileModal(false);
                }}
                className="text-zinc-500 hover:text-zinc-300 font-mono text-xs cursor-pointer p-1"
              >
                Cerrar ✕
              </button>
            </div>

            {/* Qobuz-Style Aspecto / Theme Selector */}
            <div className="space-y-2 pb-3 border-b border-zinc-900">
              <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-zinc-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Aspecto</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    d.setThemeMode('light');
                  }}
                  className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl border text-xs font-medium transition-all cursor-pointer ${
                    d.themeMode === 'light'
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-400 shadow-sm font-bold'
                      : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span>Claro</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    d.setThemeMode('dark');
                  }}
                  className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl border text-xs font-medium transition-all cursor-pointer ${
                    d.themeMode === 'dark'
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-400 shadow-sm font-bold'
                      : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span>Oscuro</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    d.setThemeMode('system');
                  }}
                  className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl border text-xs font-medium transition-all cursor-pointer ${
                    d.themeMode === 'system'
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-400 shadow-sm font-bold'
                      : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <Laptop className="w-4 h-4" />
                  <span>Sistema</span>
                </button>
              </div>
            </div>

            {/* Audio & Biofeedback Coach Panel */}
            <div className="space-y-2 pb-3 border-b border-zinc-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-zinc-300">
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Biofeedback Sonoro & Voz Coach</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    acousticEngine.playSetCompleteCue({
                      weightKg: parseFloat(inputWeight) || 80,
                      reps: parseInt(inputReps, 10) || 5,
                    });
                  }}
                  className="text-[10px] font-mono text-amber-400 hover:underline cursor-pointer"
                >
                  Probar audio ♫
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    const next = saveAudioPreferences({ voiceEnabled: !audioPrefs.voiceEnabled });
                    setAudioPrefs(next);
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-mono font-medium flex items-center justify-between cursor-pointer transition-all ${
                    audioPrefs.voiceEnabled
                      ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                      : "bg-zinc-900 border-zinc-800 text-zinc-500"
                  }`}
                >
                  <span>Voz Coach:</span>
                  <span className="font-bold">{audioPrefs.voiceEnabled ? "ACTIVA" : "MUTED"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    const next = saveAudioPreferences({ soundEnabled: !audioPrefs.soundEnabled });
                    setAudioPrefs(next);
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-mono font-medium flex items-center justify-between cursor-pointer transition-all ${
                    audioPrefs.soundEnabled
                      ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                      : "bg-zinc-900 border-zinc-800 text-zinc-500"
                  }`}
                >
                  <span>Campanas 528Hz:</span>
                  <span className="font-bold">{audioPrefs.soundEnabled ? "ON" : "OFF"}</span>
                </button>
              </div>
            </div>

            {/* Athlete Name Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                Nombre del Atleta
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={athleteNameInput}
                  onChange={(e) => setAthleteNameInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white font-medium focus:outline-none focus:border-amber-500/50"
                  placeholder="Tu nombre o alias"
                />
                <button
                  type="button"
                  onClick={() => {
                    try {
                      playTactileClick();
                      const updated = setAthleteName(athleteNameInput);
                      setAthlete(updated);
                      setBackupMsg("¡Nombre guardado con éxito!");
                    } catch (err: unknown) {
                      setBackupMsg(err instanceof Error ? err.message : "Error al guardar");
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold active:scale-95 transition-all cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </div>

            {/* Data Portability Section */}
            <div className="space-y-2 pt-2 border-t border-zinc-900">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                Portabilidad de Datos y Seguridad
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    exportBackupJson();
                    setBackupMsg("Copia de seguridad (.json) descargada");
                  }}
                  className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-mono font-medium flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Backup JSON</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    exportHistoryCsv(d.exerciseHistory);
                    setBackupMsg("Historial (.csv) descargado");
                  }}
                  className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-mono font-medium flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Historial CSV</span>
                </button>
              </div>

              {/* Restore JSON */}
              <label className="w-full py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-dashed border-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-mono font-medium flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer block text-center">
                <Upload className="w-3.5 h-3.5 text-emerald-400 inline mr-1" />
                <span>Restaurar Copia JSON</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      playTactileClick();
                      const res = await importBackupJsonFile(file);
                      if (res.success) {
                        setBackupMsg("¡Copia restaurada! Recargando datos...");
                        setTimeout(() => window.location.reload(), 1200);
                      }
                    } catch (err: unknown) {
                      setBackupMsg(err instanceof Error ? err.message : "Error de restauración");
                    }
                  }}
                />
              </label>
            </div>

            {backupMsg && (
              <div className="p-2.5 rounded-xl bg-zinc-900 border border-amber-500/30 text-[11px] font-mono text-amber-300 text-center animate-in fade-in">
                {backupMsg}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Live Set & Cadence Coach Modal */}
      <LiveSetCoachModal
        isOpen={isLiveSetOpen}
        onClose={() => setIsLiveSetOpen(false)}
        exerciseName={activeExercise.name}
        setNumber={currentSet}
        totalSets={activeExercise.sets}
        targetWeightKg={parseFloat(inputWeight) || 80}
        targetReps={parseInt(inputReps, 10) || 5}
        targetRpe={parseFloat(inputRpe) || 8}
        cueSummary={activeExercise.cue || "Postura firme, aire al abdomen y empuje explosivo"}
        onCompleteSet={onExecuteSetComplete}
      />
    </main>

  );
}
