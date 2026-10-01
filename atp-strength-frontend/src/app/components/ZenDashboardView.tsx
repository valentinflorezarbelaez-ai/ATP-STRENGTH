"use client";

import React from "react";
import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";
import { TelemetrySyncBadge } from "@/app/components/TelemetrySyncBadge";
import { TimerDisplay } from "@/app/components/TimerDisplay";
import { WarmupCalculatorModal } from "@/app/components/WarmupCalculatorModal";
import { UniversalProtocolModal } from "@/app/components/UniversalProtocolModal";
import { UniversalStrengthCalcModal } from "@/app/components/UniversalStrengthCalcModal";
import { ExerciseVideoModal } from "@/app/components/ExerciseVideoModal";
import { ExerciseCatalogModal } from "@/app/components/ExerciseCatalogModal";
import { UniversalProtocolCockpit } from "@/app/components/UniversalProtocolCockpit";
import { getExerciseMedia } from "@/lib/exerciseMediaCatalog";
import { NeuromuscularRadarChart } from "@/app/components/NeuromuscularRadarChart";
import { NeuromuscularProgressionChart } from "@/app/components/NeuromuscularProgressionChart";
import { ExerciseStrengthCoachCard } from "@/app/components/ExerciseStrengthCoachCard";
import { exportBackupJson, exportHistoryCsv, importBackupJsonFile } from "@/lib/dataPortability";
import { playTactileClick } from "@/lib/zenAudio";
import {
  Play,
  Flame, Zap, RotateCcw, CheckCircle2,
  ShieldCheck, Maximize2, Layers, Sparkles,
  TrendingUp, X, Save, Dumbbell, Plus, Search, Scale, History, Calculator,
  AlertTriangle, Trophy, Sun, Moon, Laptop,
  Download, Upload, Database, HardDrive, Timer,
} from "lucide-react";
import type { useZenDashboard } from "@/app/hooks/useZenDashboard";

type Dash = ReturnType<typeof useZenDashboard>;

export function ZenDashboardView({ d }: { d: Dash; onShowSpotify?: () => void }) {
  const [showWarmupModal, setShowWarmupModal] = React.useState(false);
  const [showUniversalProtocol, setShowUniversalProtocol] = React.useState(false);
  const [selectedVideoExercise, setSelectedVideoExercise] = React.useState<string | null>(null);
  const [showCatalogModal, setShowCatalogModal] = React.useState(false);
  const [showUniversalCalc, setShowUniversalCalc] = React.useState(false);
  const [backupStatusMsg, setBackupStatusMsg] = React.useState<string | null>(null);
  const [exerciseSearchQuery, setExerciseSearchQuery] = React.useState("");
  const [showNewExerciseModal, setShowNewExerciseModal] = React.useState(false);
  const [newExName, setNewExName] = React.useState("");
  const [newExWeight, setNewExWeight] = React.useState("100");
  const [newExReps, setNewExReps] = React.useState("5");
  const [newExNotes, setNewExNotes] = React.useState("");
  const [isRegisteringEx, setIsRegisteringEx] = React.useState(false);

  const filteredTrackableExercises = React.useMemo(() => {
    const list: string[] = Array.from(d.allTrackableExercises || ALL_TRACKABLE_EXERCISES);
    if (!exerciseSearchQuery.trim()) return list;
    const q = exerciseSearchQuery.toLowerCase().trim();
    return list.filter((ex: string) => ex.toLowerCase().includes(q));
  }, [d.allTrackableExercises, exerciseSearchQuery]);

  const handleRegisterNewExerciseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName.trim()) return;
    setIsRegisteringEx(true);
    try {
      await d.handleAddNewExercise(
        newExName.trim(),
        parseFloat(newExWeight) || 0,
        parseInt(newExReps, 10) || 5,
        "epley",
        newExNotes.trim() || "Registro inicial de ejercicio"
      );
      setShowNewExerciseModal(false);
      setNewExName("");
      setNewExNotes("");
    } catch (err) {
      console.error("Error creating new exercise:", err);
    } finally {
      setIsRegisteringEx(false);
    }
  };
  const {
    currentSet,
    activePhaseStep, setActivePhaseStep,
    completedSetsMap,
    backendOnline, pendingWalCount,
    zenFocusMode, setZenFocusMode,
    showProgressModal, setShowProgressModal,
    showResetModal, setShowResetModal,
    showVictoryModal, setShowVictoryModal,
    timerDuration, remainingSeconds, isRunning, timerTitle,
    maxesMap, selectedProgressEx, setSelectedProgressEx,
    formFormula, setFormFormula, formWeight, setFormWeight,
    formReps, setFormReps, formNotes, setFormNotes,
    isSavingMax, exerciseHistory,
    progressionCurve, supercompensationTrend,
    activeDay, activeExercise, activeExMax,
    liveCalc, currentExMax,
    atpSaturationPercent,
    totalDaySets,
    handleStartTimer, togglePlayPause, handleResetTimer, skipRest,
    handleResetExercise, handleResetDay,
    handleSaveMax,
    formatTime, playChime, calculateSessionStats,
    ALL_TRACKABLE_EXERCISES,
  } = d;

  const sessionStats = React.useMemo(() => calculateSessionStats(), [calculateSessionStats]);

  return (
    <main className="min-h-screen relative overflow-x-hidden flex flex-col items-center justify-between p-4 md:p-8 pb-32 md:pb-8 font-sans selection:bg-pink-500 selection:text-white">
      {/* Ambient Radial Mesh Backgrounds (Apple Music + Tidal Luxury Style) */}
      <div className="ambient-mesh-light" aria-hidden="true">
        <div className="ambient-orb-1" />
        <div className="ambient-orb-2" />
        <div className="ambient-orb-3" />
      </div>

      {/* Floating Toast Pill (Dynamic Island Style) */}
      {backupStatusMsg && (
        <div className="fixed top-5 z-50 px-4 py-2 rounded-2xl bg-zinc-950/95 border border-emerald-500/50 text-emerald-300 font-mono text-xs font-bold shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{backupStatusMsg}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="w-full max-w-6xl flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-5 mb-6">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 glow-zen-gold">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl md:text-2xl font-black tracking-widest text-zinc-100 uppercase">
                  NEURO//<span className="text-amber-400">STRENGTH</span>
                </h1>
                <span className="px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  PRO-V1
                </span>
              </div>
              {/* Responsive Chip Action Bar — Smooth Horizontal Scroll on Mobile */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1 sm:mx-0 sm:px-0 flex-nowrap sm:flex-wrap">
                <a
                  href="https://open.spotify.com/intl-es"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    try { window.location.href = "spotify:"; } catch {}
                  }}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 hover:border-emerald-400/50 transition-all flex items-center gap-1 shadow-[0_0_12px_rgba(16,185,129,0.15)] flex-shrink-0 cursor-pointer"
                  title="Abrir Spotify directamente"
                >
                  🎵 SPOTIFY
                </a>
                <div
                  className="px-3 py-1 rounded-lg text-[10px] font-mono font-bold border border-amber-400 bg-amber-500 text-black flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.3)] flex-shrink-0"
                  title="Protocolo Universal PR activo para cualquier ejercicio libre"
                >
                  <Sparkles className="w-3 h-3 text-black fill-black" />
                  <span>⚡ PROTOCOLO PR (CUALQUIER EJERCICIO)</span>
                </div>
                <a
                  href="/calc"
                  className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-amber-400 hover:border-amber-500/50 transition-all flex items-center gap-1 flex-shrink-0"
                  title="Calculadora Universal y Progresiones en Pantalla Completa"
                >
                  CALC COMPLETO
                </a>
                <a
                  href="/forge"
                  className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25 hover:bg-amber-500/25 transition-all flex items-center gap-1 flex-shrink-0"
                  title="La Forja de los Guerreros"
                >
                  ⚔️ FORJA
                </a>
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

        {/* Acciones de Cabecera (Totalmente visibles y adaptativas en móvil sin quiebres) */}
        <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto no-scrollbar py-1 flex-nowrap">
          {/* Qobuz / Apple Music Tri-Mode Aspect Toggle */}
          <button
            type="button"
            onClick={d.toggleTheme}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full border border-black/10 dark:border-white/15 bg-white/80 dark:bg-white/5 backdrop-blur-xl hover:bg-black/5 dark:hover:bg-white/10 text-xs font-mono font-bold transition-all transform active:scale-95 cursor-pointer shadow-sm"
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
                <Moon className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="hidden sm:inline text-zinc-200">DARK</span>
              </>
            ) : d.themeMode === 'light' ? (
              <>
                <Sun className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span className="hidden sm:inline text-zinc-800">LIGHT</span>
              </>
            ) : (
              <>
                <Laptop className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="hidden sm:inline text-zinc-300">AUTO</span>
              </>
            )}
          </button>

          {/* Botón Cambiar a MODO COACH GUIADO */}
          <button
            type="button"
            onClick={d.toggleCoachMode}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/40 text-xs font-mono font-bold text-amber-300 shadow-lg shadow-amber-500/5 transition-all transform active:scale-95 cursor-pointer"
            title="Cambiar a Modo Coach Guiado (Paso a Paso)"
          >
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="tracking-wide">MODO COACH</span>
          </button>

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
        {/* Left Column: Protocolo Universal PR para Cualquier Ejercicio */}
        <section className="flex flex-col gap-5 lg:col-span-7">
          {/* Directiva de Oro del Protocolo Universal PR */}
          <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-b from-amber-500/10 via-zinc-950 to-zinc-950 p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">
                  Directiva de Oro · Protocolo Universal PR
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">SSOT OFICIAL</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1 font-mono">
                  <Dumbbell className="w-3 h-3" /> 1. ¿Cuántos hacer?
                </span>
                <p className="text-[10px] text-zinc-300 leading-tight">
                  <strong className="text-white">3 ejercicios clave</strong> por día (1 Principal pesado + 1 Secundario angular + 1 Blindaje).
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1 font-mono">
                  <Timer className="w-3 h-3" /> 2. ¿Cuánto descansar?
                </span>
                <p className="text-[10px] text-zinc-300 leading-tight">
                  <strong className="text-amber-300">4-5 min</strong> en series pesadas (ATP-PCr 99%), <strong className="text-zinc-200">2-3 min</strong> en aproximación, <strong className="text-zinc-200">2 min</strong> accesorios.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1 font-mono">
                  <Zap className="w-3 h-3" /> 3. ¿Y demás?
                </span>
                <p className="text-[10px] text-zinc-300 leading-tight">
                  <strong className="text-amber-300">RIR 1-2</strong> (cero fallo concéntrico), tempo <strong className="text-zinc-200">3-1-X-1</strong> y +2.5 kg cuando RPE ≤ 7.
                </p>
              </div>
            </div>
          </div>

          <UniversalProtocolCockpit
            onStartTimer={handleStartTimer}
            onOpenVideo={(name) => setSelectedVideoExercise(name)}
          />
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

          {/* Card de Accesos Rápidos & Dominio Universal */}
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-900 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> MOTOR UNIVERSAL · ACCESOS RÁPIDOS
              </span>
              <span className="text-[10px] font-mono text-zinc-500">DOMINIO TOTAL</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-mono">
              El entrenamiento no se ata a rutinas cerradas ni divisiones rígidas. Elegí o escribí cualquier ejercicio en el panel principal, ingresá tu PR y ejecutá la sobrecarga con tiempos de recuperación ATP precisos.
            </p>
            <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
              <a
                href="/calc"
                className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-amber-400 transition-all font-bold"
              >
                ⚡ Pantalla Completa (/calc)
              </a>
              <button
                type="button"
                onClick={() => setShowUniversalCalc(true)}
                className="p-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold transition-all cursor-pointer"
              >
                📊 Abrir Modal Fases
              </button>
            </div>
          </div>

          {/* Card Guía Fisiológica de las 6 Fases Neuromusculares */}
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-900 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <span className="text-xs font-mono font-bold text-zinc-200 uppercase flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" /> FISIOLOGÍA DE LAS 6 FASES
              </span>
              <button
                type="button"
                onClick={() => setShowUniversalProtocol(true)}
                className="text-[11px] font-mono text-amber-400 hover:underline cursor-pointer"
              >
                Ver Guía Completa
              </button>
            </div>

            <p className="text-xs text-zinc-400 font-mono leading-relaxed">
              Cada ejercicio seleccionado sigue la secuencia neuromuscular óptima para reclutar unidades motoras de alto umbral sin fatiga metabólica prematura:
            </p>

            <div className="space-y-2 font-mono text-xs">
              <div className="p-2.5 rounded-xl bg-black border border-zinc-800/80 flex items-center justify-between">
                <span className="text-zinc-300 font-bold">F1: Activación SNC</span>
                <span className="text-amber-400 font-bold">20% PR · 10 reps (Barra)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black border border-zinc-800/80 flex items-center justify-between">
                <span className="text-zinc-300 font-bold">F2: Aproximación Ligera</span>
                <span className="text-amber-400 font-bold">45% PR · 5 reps</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black border border-zinc-800/80 flex items-center justify-between">
                <span className="text-zinc-300 font-bold">F3: Aproximación Media</span>
                <span className="text-amber-400 font-bold">65% PR · 3 reps</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black border border-zinc-800/80 flex items-center justify-between">
                <span className="text-zinc-300 font-bold">F4: Potenciación PAP</span>
                <span className="text-amber-400 font-bold">85% PR · 1 rep</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <span className="text-white font-bold">F5: Efectivas de Fuerza</span>
                <span className="text-amber-300 font-bold">3×3-5 @ RPE 8-9 (4-5 min)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black border border-zinc-800/80 flex items-center justify-between">
                <span className="text-zinc-300 font-bold">F6: Back-Off Hipertrofia</span>
                <span className="text-amber-400 font-bold">70% PR · 8-10 reps (2 min)</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowUniversalProtocol(true)}
                className="w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-xs font-bold transition-all text-center cursor-pointer shadow-sm"
              >
                ⚡ LEER PROTOCOLO UNIVERSAL DETALLADO
              </button>
            </div>
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

              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <div className="text-xs font-mono text-zinc-400">
                  Ejercicio: <span className="font-bold text-amber-400">{selectedProgressEx}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedVideoExercise(selectedProgressEx)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-mono font-bold text-amber-300 transition-all active:scale-95 cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.15)]"
                  title="Ver video técnico"
                >
                  <Play className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>VER TÉCNICA</span>
                </button>
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

              {/* Pentágono de Simetría Neuromuscular Pure SVG */}
              <NeuromuscularRadarChart
                maxesMap={d.maxesMap}
                currentWorkingWeight={activeExMax?.one_rep_max || 100}
                currentExerciseName={selectedProgressEx}
              />

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
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-zinc-400 uppercase">
                      Método de cálculo del 1RM:
                    </span>
                    <span className="text-[10px] font-mono text-amber-400 font-bold">
                      MODELO SUBMÁXIMO SOVIÉTICO
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      {
                        id: "epley",
                        label: "⚡ Estimación Submáxima",
                        sub: "P × (1 + R/30) • 2 a 5 reps a RIR 1-2",
                        badge: "⭐ RECOMENDADO SNC",
                        badgeClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
                      },
                      {
                        id: "brzycki",
                        label: "📐 Brzycki Conservador",
                        sub: "P / (1.0278 - 0.0278×R) • 6 a 10 reps",
                        badge: "SERIES MEDIAS",
                        badgeClass: "text-sky-400 bg-sky-500/10 border-sky-500/30",
                      },
                      {
                        id: "direct",
                        label: "🎯 1RM Directo",
                        sub: "1 repetición máxima real (fallo técnico)",
                        badge: "⚠️ ALTO ESTRÉS SNC",
                        badgeClass: "text-rose-400 bg-rose-500/10 border-rose-500/30",
                      },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setFormFormula(m.id)}
                        className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                          formFormula === m.id
                            ? "bg-amber-500/15 border-amber-500/60 text-white shadow-md shadow-amber-500/10"
                            : "bg-zinc-900/90 border-zinc-700/80 text-zinc-300 hover:border-zinc-500 hover:text-white"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-xs font-bold text-white">{m.label}</span>
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${m.badgeClass}`}>
                              {m.badge}
                            </span>
                          </div>
                          <div className="text-[10px] text-zinc-400 font-mono leading-tight">{m.sub}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans leading-relaxed pt-1">
                    💡 <strong className="text-amber-300">Criterio Ruso Submáximo:</strong> Para proteger tu Sistema Nervioso Central y progresar sin quemarte, testeá tus marcas en series pesadas de <strong>2 a 5 reps limpias (RIR 1-2)</strong> usando la estimación submáxima. Evitá probar 1RM directo al fallo todas las semanas.
                  </p>
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

              {/* Curva de Supercompensación Neuromuscular (SPEC-0009) */}
              <NeuromuscularProgressionChart
                exerciseName={selectedProgressEx}
                curvePoints={progressionCurve}
                trend={supercompensationTrend}
                current1Rm={currentExMax?.one_rep_max}
              />

              {/* Historial Reciente de Series */}
              {exerciseHistory.length > 0 && (
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-amber-400" />
                      <span>Historial de Series & Calibraciones ({exerciseHistory.length})</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      Soberanía Local + WAL
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {exerciseHistory.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between text-xs font-mono"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-300">
                            Serie {item.set_number}: <strong className="text-white">{item.load_kg} kg</strong> × {item.completed_reps || item.prescribed_reps} reps
                          </span>
                          {item.e1rm && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold">
                              e1RM: {item.e1rm} kg
                            </span>
                          )}
                          {item.is_pr && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase">
                              ★ PR
                            </span>
                          )}
                        </div>
                        <span className="text-zinc-500 text-[10px]">
                          {item.notes || "Completada"} {item.rest_seconds ? `• ${item.rest_seconds}s` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Soberanía de Datos y Copias de Seguridad (Pillar 4) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      SOBERANÍA DE DATOS // RESPALDO & RESTAURACIÓN
                    </span>
                  </div>
                  {backupStatusMsg && (
                    <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                      {backupStatusMsg}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400">
                  Tus marcas, progresiones y series te pertenecen. Descargá copias criptográficas locales o restaurá tu perfil completo en 1 clic.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      exportBackupJson();
                      setBackupStatusMsg("Copia JSON descargada ✓");
                      setTimeout(() => setBackupStatusMsg(null), 4000);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>Backup JSON</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      exportHistoryCsv(exerciseHistory);
                      setBackupStatusMsg("Historial CSV descargado ✓");
                      setTimeout(() => setBackupStatusMsg(null), 4000);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <Database className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Exportar CSV</span>
                  </button>
                  <label className="py-2.5 px-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-dashed border-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 text-center">
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Restaurar JSON</span>
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const res = await importBackupJsonFile(file);
                          setBackupStatusMsg(`Restaurado (${res.restoredKeys.length} registros) ✓`);
                          window.location.reload();
                        } catch {
                          setBackupStatusMsg("Error al restaurar archivo ⚠️");
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
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
                  <span>Reiniciar solo {activeExercise?.name || "este ejercicio"}</span>
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

      {/* Floating Sticky Mini-Timer on Mobile when active */}
      {isRunning && remainingSeconds > 0 && (
        <div
          onClick={() => setZenFocusMode(true)}
          className="md:hidden fixed bottom-[72px] left-3 right-3 z-40 p-3 rounded-2xl bg-zinc-950/95 border border-amber-500/50 shadow-2xl shadow-amber-500/20 backdrop-blur-xl flex items-center justify-between cursor-pointer animate-in slide-in-from-bottom-2"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
            </span>
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-zinc-400 block uppercase">Resíntesis ATP Activa</span>
              <span className="text-xs font-mono font-bold text-amber-300 truncate block">
                {timerTitle || "Recuperación Neural"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-base font-mono font-black text-amber-400">
              {formatTime(remainingSeconds)}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                skipRest();
              }}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-mono font-bold text-zinc-300 hover:text-white active:scale-95 transition-all"
            >
              Saltar
            </button>
          </div>
        </div>
      )}

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
          {/* Modal de Video Técnico Biomecánico HD */}
      {selectedVideoExercise && (
        <ExerciseVideoModal
          isOpen={!!selectedVideoExercise}
          onClose={() => setSelectedVideoExercise(null)}
          media={getExerciseMedia(selectedVideoExercise)}
        />
      )}

      {/* Modal de Calculador de Aproximación & Cuidado Articular */}
      <WarmupCalculatorModal
        isOpen={showWarmupModal}
        onClose={() => setShowWarmupModal(false)}
        exerciseName={activeExercise.name}
        defaultWorkWeightKg={
          activeExMax?.prescriptions.phase_5_work || 100
        }
        onApplyWeightToLogger={(w, r, key) => {
          if (key) setActivePhaseStep(key);
        }}
        onStartTimer={(seconds, title) => {
          handleStartTimer(seconds, title);
        }}
      />
          {showCatalogModal && (
        <ExerciseCatalogModal
          isOpen={showCatalogModal}
          onClose={() => setShowCatalogModal(false)}
          initialExerciseName={activeExercise?.name}
        />
      )}
      <UniversalProtocolModal
        isOpen={showUniversalProtocol}
        onClose={() => setShowUniversalProtocol(false)}
        onStartTimer={(seconds, title) => {
          handleStartTimer(seconds, title);
        }}
      />
      <UniversalStrengthCalcModal
        isOpen={showUniversalCalc}
        onClose={() => setShowUniversalCalc(false)}
        onStartTimer={(seconds, title) => {
          handleStartTimer(seconds, title);
        }}
      />
    </main>
  );


}
