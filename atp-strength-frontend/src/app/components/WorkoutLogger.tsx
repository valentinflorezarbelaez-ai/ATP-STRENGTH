"use client";

import {
  Calculator, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp,
  Dumbbell, Layers, Maximize2, Minus, Plus, Settings2, TrendingUp, Zap,
} from "lucide-react";
import { RampingIndicator } from "@/app/components/RampingIndicator";
import { getExerciseCategory, computeEstimated1Rm, rpeToRir, VALID_RPE_VALUES } from "@/lib/workoutStrategies";
import type { useZenDashboard } from "@/app/hooks/useZenDashboard";

type Dash = ReturnType<typeof useZenDashboard>;

/** Exercise selection, set/rep counter, 1RM auto-regulation, and phase logging. */
export function WorkoutLogger({ d }: { d: Dash }) {
  const {
    activeExerciseIndex,
    currentSet, setCurrentSet,
    activePhaseStep, setActivePhaseStep,
    completedSetsMap, completedWarmupMap,
    showQuickCalibration, setShowQuickCalibration,
    setSelectedProgressEx, setShowProgressModal,
    timerDuration, remainingSeconds, isRunning,
    setIsRunning, setRemainingSeconds,
    activeDay, activeExercise, activeExMax,
    quickWeight, quickReps, inputWeight, inputReps,
    inputRpe, setInputRpe,
    atpSaturationPercent, setZenFocusMode,
    setQuickWeight, setQuickReps, setInputWeight, setInputReps,
    handleUpdateQuickMax, handlePreviousExercise, handleNextExercise,
    handleCompleteWarmupPhase, handleCompleteSet,
    formatTime,
  } = d;

  return (
    <>
              {/* Tarjeta del Ejercicio con Sistema Guiado Paso a Paso */}
              <div className="p-5 sm:p-6 rounded-3xl bg-zinc-950 border border-zinc-900 shadow-2xl space-y-5">
                {/* Header del Ejercicio Activo con Navegación Guiada */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={handlePreviousExercise}
                        disabled={activeExerciseIndex === 0}
                        className={`p-2 rounded-xl border transition-all ${
                          activeExerciseIndex === 0
                            ? "border-zinc-900/60 bg-zinc-950 text-zinc-700 cursor-not-allowed"
                            : "border-zinc-800 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 cursor-pointer active:scale-95"
                        }`}
                        title="Ejercicio anterior"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <div className="leading-tight">
                        <span className="text-[10px] sm:text-xs font-mono text-zinc-500 uppercase tracking-wider block">
                          EJERCICIO {activeExerciseIndex + 1} DE {activeDay.exercises.length}
                        </span>
                        <h3 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                          {activeExercise.name}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={handleNextExercise}
                        disabled={activeExerciseIndex === activeDay.exercises.length - 1}
                        className={`p-2 rounded-xl border transition-all ${
                          activeExerciseIndex === activeDay.exercises.length - 1
                            ? "border-zinc-900/60 bg-zinc-950 text-zinc-700 cursor-not-allowed"
                            : "border-zinc-800 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 cursor-pointer active:scale-95"
                        }`}
                        title="Siguiente ejercicio"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowQuickCalibration(!showQuickCalibration)}
                        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-xs font-mono text-zinc-300 hover:text-white transition-all cursor-pointer"
                        title="Ajustar peso base o repeticiones de test"
                      >
                        <Settings2 className="w-3.5 h-3.5 text-amber-400" />
                        <span className="hidden sm:inline">1RM</span>
                        {showQuickCalibration ? (
                          <ChevronUp className="w-3 h-3 text-zinc-400" />
                        ) : (
                          <ChevronDown className="w-3 h-3 text-zinc-400" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProgressEx(activeExercise.name);
                          setShowProgressModal(true);
                        }}
                        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-mono font-bold text-amber-300 transition-all active:scale-95 cursor-pointer"
                        title="Ver historial de fuerza y motor completo"
                      >
                        <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                        <span>{activeExMax?.one_rep_max ?? 0} kg</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-amber-400/90 font-mono mb-2">{activeDay.focus}</p>
                  <p className="text-xs text-zinc-400 italic bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-800/60">
                    &ldquo;{activeExercise.cue}&rdquo;
                  </p>
                </div>

                {/* Panel Plegable de Calibración Rápida (sólo si el usuario desea calibrar) */}
                {showQuickCalibration && (
                  <div className="p-4 rounded-2xl bg-black border border-amber-500/30 animate-in fade-in slide-in-from-top-2 duration-200 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-amber-400 flex items-center gap-1.5 uppercase">
                        <Calculator className="w-3.5 h-3.5" /> CALIBRACIÓN DE FUERZA BASE
                      </span>
                      <span className="text-[10px] text-zinc-500">Recalcula todas las cargas</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
                          Peso de Referencia (kg)
                        </label>
                        <input
                          type="number"
                          step="2.5"
                          value={quickWeight}
                          onChange={(e) => {
                            setQuickWeight(e.target.value);
                            handleUpdateQuickMax(e.target.value, quickReps);
                          }}
                          className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-amber-300 font-mono font-bold text-sm focus:border-amber-400 focus:outline-none"
                          placeholder="ej: 100"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
                          Repeticiones Realizadas
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={quickReps}
                          onChange={(e) => {
                            setQuickReps(e.target.value);
                            handleUpdateQuickMax(quickWeight, e.target.value);
                          }}
                          className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono font-bold text-sm focus:border-amber-400 focus:outline-none"
                          placeholder="ej: 5"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center p-2 rounded-lg bg-zinc-900/60 border border-zinc-800 font-mono text-xs">
                      <div>
                        <div className="text-[9px] uppercase text-zinc-500">1RM</div>
                        <div className="font-bold text-amber-400">{activeExMax?.one_rep_max ?? 0} kg</div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase text-zinc-500">TM (90%)</div>
                        <div className="font-bold text-zinc-200">{activeExMax?.training_max ?? 0} kg</div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase text-emerald-400">Trabajo (85%)</div>
                        <div className="font-bold text-emerald-400">{activeExMax?.prescriptions.phase_5_work ?? 0} kg</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 🎯 HERO DE INSTRUCCIÓN EXACTA (ADAPTADO A FASES Y SERIES) */}
                {(() => {
                  const isWarmup = activePhaseStep.startsWith("F");
                  const cat = getExerciseCategory(activeExercise.name);
                  const isResting = isRunning || (remainingSeconds < timerDuration && remainingSeconds > 0);

                  let stepTitle = "";
                  let stepSubtitle = "";
                  let stepWeight = 0;
                  let stepReps = "";
                  let stepRestSeconds = 180;
                  let buttonAction = () => {};
                  let buttonLabel = "";

                  const isLastSetOfExercise = currentSet >= activeExercise.sets;
                  const isLastExerciseOfDay = activeExerciseIndex >= activeDay.exercises.length - 1;

                  if (activePhaseStep === "F1") {
                    stepWeight = activeExMax?.prescriptions.phase_1_activation ?? 20;
                    stepTitle = `FASE 1 // ACTIVACIÓN DINÁMICA • ${stepWeight} KG`;
                    stepSubtitle = "Barra vacía / Activación de motoneuronas alfa y unidades motoras rápidas.";
                    stepReps = "10 reps";
                    stepRestSeconds = 60;
                    buttonAction = () => handleCompleteWarmupPhase("F1");
                    buttonLabel = "¡FASE 1 REALIZADA! → PASAR A FASE 2";
                  } else if (activePhaseStep === "F2") {
                    stepWeight = activeExMax?.prescriptions.phase_2_light ?? 0;
                    stepTitle = `FASE 2 // APROXIMACIÓN LIGERA • ${stepWeight} KG`;
                    stepSubtitle = "Fijación técnica del patrón motor sin fatiga metabólica acumulada.";
                    stepReps = "5 reps";
                    stepRestSeconds = 90;
                    buttonAction = () => handleCompleteWarmupPhase("F2");
                    buttonLabel = "¡FASE 2 REALIZADA! → PASAR A FASE 3";
                  } else if (activePhaseStep === "F3") {
                    stepWeight = activeExMax?.prescriptions.phase_3_medium ?? 0;
                    stepTitle = `FASE 3 // APROXIMACIÓN MEDIA • ${stepWeight} KG`;
                    stepSubtitle = "Sensibilización barométrica y aclimatación de la tensión tendinosa.";
                    stepReps = "3 reps";
                    stepRestSeconds = 120;
                    buttonAction = () => handleCompleteWarmupPhase("F3");
                    buttonLabel = "¡FASE 3 REALIZADA! → PASAR A FASE 4 (PAP)";
                  } else if (activePhaseStep === "F4") {
                    stepWeight = activeExMax?.prescriptions.phase_4_pap ?? 0;
                    stepTitle = `FASE 4 // POTENCIACIÓN PAP • ${stepWeight} KG`;
                    stepSubtitle = "Potenciación Post-Activación (PAP) máxima previa a las series efectivas.";
                    stepReps = "1 rep pesada";
                    stepRestSeconds = 180;
                    buttonAction = () => handleCompleteWarmupPhase("F4");
                    buttonLabel = "¡FASE 4 PAP REALIZADA! → ENTRAR A SERIES EFECTIVAS";
                  } else {
                    stepWeight = parseFloat(inputWeight) || (activeExMax?.prescriptions.phase_5_work ?? 0);
                    stepTitle = `SERIE ${currentSet} DE ${activeExercise.sets} // TRABAJO EFECTIVO • ${stepWeight} KG`;
                    stepSubtitle = "Máxima expresión de fuerza neural con recuperación bioquímica completa.";
                    stepReps = `${parseInt(inputReps) || (parseInt(activeExercise.reps) || 3)} reps`;
                    stepRestSeconds = activeExercise.restSeconds || 180;
                    buttonAction = () => handleCompleteSet();

                    if (isLastSetOfExercise && isLastExerciseOfDay) {
                      buttonLabel = `¡SERIE ${currentSet} REALIZADA! → COMPLETAR SESIÓN DE HOY`;
                    } else if (isLastSetOfExercise) {
                      buttonLabel = `¡SERIE ${currentSet} REALIZADA! → SIGUIENTE EJERCICIO`;
                    } else {
                      buttonLabel = `¡SERIE ${currentSet} REALIZADA! → ENTRAR EN DESCANSO ATP`;
                    }
                  }

                  // Si el descanso está activo, el botón principal permite saltarlo y prepararse de inmediato
                  const finalButtonAction = isResting
                    ? () => {
                        setIsRunning(false);
                        setRemainingSeconds(0);
                      }
                    : buttonAction;

                  const finalButtonLabel = isResting
                    ? `⏱️ DESCANSO ACTIVO (${formatTime(remainingSeconds)}) • SALTAR Y LEVANTAR YA`
                    : buttonLabel;

                  // Montaje exacto de implemento
                  let assemblyCue = "";
                  if (cat === "bodyweight_weighted") {
                    assemblyCue = stepWeight === 0 ? "Peso corporal propio (sin lastre adicional)" : `Cinturón de lastre + ${stepWeight} kg`;
                  } else if (cat === "ez_bar") {
                    const perSide = Math.max(0, Math.round(((stepWeight - 10) / 2) * 10) / 10);
                    assemblyCue = `Barra Z (10 kg) + ${perSide} kg por lado`;
                  } else if (cat === "dumbbells") {
                    assemblyCue = `${stepWeight} kg por mano`;
                  } else {
                    const perSide = Math.max(0, Math.round(((stepWeight - 20) / 2) * 10) / 10);
                    assemblyCue = stepWeight <= 20 ? "Barra olímpica vacía (20 kg)" : `Barra olímpica (20 kg) + ${perSide} kg por lado`;
                  }

                  return (
                    <div className={`p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border-2 transition-all relative overflow-hidden ${
                      isWarmup
                        ? "border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.1)]"
                        : "border-amber-500/70 shadow-[0_0_45px_rgba(245,158,11,0.22)]"
                    }`}>
                      {/* Widget Integrado de Descanso de ATP si está en curso */}
                      {isResting && (
                        <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-zinc-900 to-black border border-amber-500/50 shadow-lg shadow-amber-500/10 animate-in fade-in duration-300 space-y-3">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="font-bold text-amber-400 uppercase flex items-center gap-1.5">
                              <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                              <span>{isRunning ? "Descanso de Resíntesis ATP en Curso" : "Descanso en Pausa"}</span>
                            </span>
                            <span className="text-amber-300 font-bold">
                              Saturación ATP: {atpSaturationPercent}%
                            </span>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-baseline gap-2">
                              <span className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight">
                                {formatTime(remainingSeconds)}
                              </span>
                              <span className="text-[11px] font-mono text-zinc-400">
                                {remainingSeconds === 0 ? "¡Recuperación completa!" : "min restantes"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsRunning(false);
                                  setRemainingSeconds(0);
                                }}
                                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-md shadow-amber-400/20"
                              >
                                Saltar Descanso →
                              </button>
                              <button
                                type="button"
                                onClick={() => setZenFocusMode(true)}
                                className="p-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-amber-400 text-zinc-300 hover:text-white transition-all cursor-pointer"
                                title="Aislamiento visual en pantalla completa"
                              >
                                <Maximize2 className="w-4 h-4 text-amber-400" />
                              </button>
                            </div>
                          </div>

                          {/* Barra de progreso de saturación de ATP */}
                          <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-1000 rounded-full"
                              style={{ width: `${atpSaturationPercent}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Estado y Barra de Paso */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
                          </span>
                          <span className="font-mono text-xs font-black uppercase tracking-wider text-amber-400">
                            {stepTitle}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isWarmup && (
                            <button
                              type="button"
                              onClick={() => setActivePhaseStep("1")}
                              className="text-[11px] font-mono text-amber-400/80 hover:text-amber-300 underline cursor-pointer"
                            >
                              Saltar a Series Efectivas →
                            </button>
                          )}
                          <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900/90 px-3 py-1 rounded-full border border-zinc-800">
                            ⏱️ Descanso: {Math.floor(stepRestSeconds / 60)}:{stepRestSeconds % 60 === 0 ? "00" : (stepRestSeconds % 60).toString().padStart(2, "0")} min
                          </span>
                        </div>
                      </div>

                      {/* Subtítulo Fisiológico */}
                      <p className="text-xs text-zinc-400 font-mono mb-3 leading-relaxed">
                        {stepSubtitle}
                      </p>

                      {/* INSTRUCCIÓN EXACTA: PESO Y REPETICIONES */}
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 my-2 p-4 sm:p-5 rounded-2xl bg-black/90 border border-zinc-800 text-center">
                        <div>
                          <div className="text-[10px] sm:text-xs font-mono text-zinc-400 uppercase tracking-wider font-bold">
                            TIENES QUE LEVANTAR:
                          </div>
                          <div className="text-3xl sm:text-5xl font-black font-mono text-amber-400 tracking-tight mt-1 flex items-baseline justify-center gap-1">
                            <span>{stepWeight}</span>
                            <span className="text-sm sm:text-base text-amber-400/70 font-bold">kg</span>
                          </div>

                          {/* Ajuste Rápido de Kilos Ergonómico */}
                          {!isWarmup && (
                            <div className="flex items-center justify-center gap-2 mt-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const newVal = Math.max(0, stepWeight - 2.5);
                                  setInputWeight(newVal.toString());
                                }}
                                className="p-2.5 sm:p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
                                title="Bajar 2.5 kg"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="text-[11px] font-mono text-zinc-400 font-bold">2.5 kg</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const newVal = stepWeight + 2.5;
                                  setInputWeight(newVal.toString());
                                }}
                                className="p-2.5 sm:p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
                                title="Subir 2.5 kg"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="text-[10px] sm:text-xs font-mono text-zinc-400 uppercase tracking-wider font-bold">
                            REPETICIONES A HACER:
                          </div>
                          <div className="text-3xl sm:text-5xl font-black font-mono text-white tracking-tight mt-1 flex items-baseline justify-center gap-1">
                            <span>{stepReps}</span>
                          </div>

                          {/* Ajuste Rápido de Reps en Series Efectivas */}
                          {!isWarmup && (
                            <div className="flex items-center justify-center gap-2 mt-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const currentVal = parseInt(inputReps) || 3;
                                  const newVal = Math.max(1, currentVal - 1);
                                  setInputReps(newVal.toString());
                                }}
                                className="p-2.5 sm:p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
                                title="Menos 1 rep"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="text-[11px] font-mono text-zinc-400 font-bold">1 rep</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const currentVal = parseInt(inputReps) || 3;
                                  const newVal = currentVal + 1;
                                  setInputReps(newVal.toString());
                                }}
                                className="p-2.5 sm:p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
                                title="Más 1 rep"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Montaje de la Barra y RPE */}
                      <div className="flex flex-col sm:flex-row items-center justify-between text-xs font-mono px-3 py-2 text-zinc-400 bg-zinc-900/60 rounded-xl border border-zinc-800/80 gap-2 mt-3">
                        <span className="flex items-center gap-1.5">
                          <Dumbbell className="w-4 h-4 text-amber-400 flex-shrink-0" />
                          <span>
                            Montaje: <strong className="text-white">{assemblyCue}</strong>
                          </span>
                        </span>
                        {!isWarmup && (
                          <div className="flex flex-col sm:flex-row items-center gap-2">
                            <span className="text-zinc-500 text-[11px]">RPE:</span>
                            <div className="flex items-center gap-1 flex-wrap">
                              {VALID_RPE_VALUES.map((rpeVal) => {
                                const isSelected = parseFloat(inputRpe) === rpeVal;
                                return (
                                  <button
                                    key={rpeVal}
                                    type="button"
                                    onClick={() => setInputRpe(String(rpeVal))}
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
                                  <span className="text-[10px] text-amber-400/90 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 whitespace-nowrap">
                                    {rir} RIR {e1rm ? `• e1RM: ${e1rm} kg` : ""}
                                  </span>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        )}
                      </div>

                      {/* Botón Principal Bio-Ergonómico: Completar Serie & Abrir Descanso */}
                      <button
                        onClick={finalButtonAction}
                        className={`w-full mt-4 py-4 sm:py-5 px-6 rounded-2xl font-black uppercase tracking-wider text-xs sm:text-sm transition-all transform active:translate-y-0.5 flex items-center justify-center gap-3 cursor-pointer select-none ${
                          isResting
                            ? "bg-gradient-to-b from-zinc-900 to-black border-2 border-amber-500 text-amber-300 hover:bg-amber-500/10 shadow-[0_0_25px_rgba(245,158,11,0.25)]"
                            : "bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black border-b-4 border-amber-700 shadow-[0_12px_28px_rgba(245,158,11,0.3)] glow-zen-gold"
                        }`}
                      >
                        {isResting ? (
                          <Zap className="w-5 h-5 text-amber-400 flex-shrink-0 animate-pulse" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-black stroke-[3] flex-shrink-0" />
                        )}
                        <span>{finalButtonLabel}</span>
                      </button>
                    </div>
                  );
                })()}

                {/* 📋 HOJA DE RUTA COMPLETA: GUÍA PASO A PASO INTERACTIVA */}
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-white uppercase flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-amber-400" /> HOJA DE RUTA: CALENTAMIENTO Y SERIES DE FUERZA
                    </span>
                    <span className="text-[10px] text-zinc-500">Toca cualquier fase para ejecutarla</span>
                  </div>

                  {/* 1. Fases de Calentamiento / Aclimatación SNC (F1 a F4) */}
                  <RampingIndicator
                    variant="badge-grid"
                    exerciseName={activeExercise.name}
                    prescriptions={activeExMax?.prescriptions}
                    activePhaseStep={activePhaseStep}
                    completedWarmupKeys={completedWarmupMap[activeExercise.name] || []}
                    onSelectPhase={(key) => setActivePhaseStep(key)}
                  />

                  {/* 2. Series Efectivas de Trabajo (Fase 5) */}
                  <div>
                    <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Series Efectivas de Trabajo (Fase 5 - Fuerza Máxima):</span>
                      <span className="text-zinc-400">
                        {activeExercise.sets} series de {activeExercise.reps} con {activeExMax?.prescriptions.phase_5_work ?? 0} kg
                      </span>
                    </div>

                    <div className="space-y-2 font-mono text-xs">
                      {Array.from({ length: activeExercise.sets }, (_, i) => i + 1).map((sNum) => {
                        const isDone = completedSetsMap[activeExercise.name]?.includes(sNum);
                        const isCurrent = activePhaseStep === sNum.toString();
                        const targetKg = activeExMax?.prescriptions.phase_5_work ?? 0;

                        return (
                          <div
                            key={sNum}
                            onClick={() => {
                              setCurrentSet(sNum);
                              setActivePhaseStep(sNum.toString());
                            }}
                            className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                              isDone
                                ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-300"
                                : isCurrent
                                ? "bg-amber-500/10 border-amber-500 text-white shadow-lg shadow-amber-500/10"
                                : "bg-black/60 border-zinc-800/80 text-zinc-400 hover:border-zinc-700"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  isDone
                                    ? "bg-emerald-500 text-black"
                                    : isCurrent
                                    ? "bg-amber-400 text-black font-black"
                                    : "bg-zinc-800 text-zinc-400"
                                }`}
                              >
                                {isDone ? "✓" : sNum}
                              </span>
                              <span className="font-bold tracking-wide">
                                Serie {sNum}
                              </span>
                              {isCurrent && (
                                <span className="px-2 py-0.5 rounded bg-amber-400 text-black font-mono font-bold text-[10px] uppercase">
                                  En Curso
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="text-xs text-zinc-400 font-mono">
                                  {activeExercise.reps}
                                </div>
                                <div className="text-sm font-black text-amber-400 font-mono">
                                  {targetKg} kg
                                </div>
                              </div>

                              {isCurrent ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCompleteSet(sNum);
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-bold text-[11px] tracking-wider uppercase transition-all shadow-md shadow-amber-400/20 active:scale-95 cursor-pointer"
                                >
                                  Hecho
                                </button>
                              ) : isDone ? (
                                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded">
                                  Completada
                                </span>
                              ) : (
                                <span className="text-[11px] text-zinc-500 font-mono">
                                  Pendiente
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
    </>
  );
}
