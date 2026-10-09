"use client";

import { useState, useEffect } from "react";
import {
  Dumbbell,
  Crown,
  History,
  Timer,
  Play,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Zap,
  CheckCircle2,
  Flame,
} from "lucide-react";
import { computeOneRm } from "@/lib/workoutStrategies";
import { findSavedPr } from "@/lib/sessionExercise";
import { getExerciseHistory, type ExerciseHistoryEntry } from "@/lib/exerciseHistoryStorage";
import {
  POWERLIFTING_ABSOLUTE_DAYS,
  FIGHTER_MOORZ_DAYS,
  type PowerRoutineDay,
  type PowerExercisePlan,
} from "@/lib/powerliftingRoutine";

function formatKg(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

export function SessionExerciseGate({
  onConfirm,
  onOpenVideo,
}: {
  onConfirm: (name: string, pr: number) => void;
  onOpenVideo?: (videoName: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"free" | "routine" | "history">("free");
  const [routineType, setRoutineType] = useState<"powerlifting" | "moorz">("powerlifting");
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // Formulario libre
  const [name, setName] = useState("");
  const [prText, setPrText] = useState("");
  const [helperOpen, setHelperOpen] = useState(false);
  const [weightText, setWeightText] = useState("");
  const [repsText, setRepsText] = useState("");

  // Historial de ejercicios
  const [historyList, setHistoryList] = useState<ExerciseHistoryEntry[]>([]);

  useEffect(() => {
    setHistoryList(getExerciseHistory());
  }, []);

  const saved = findSavedPr(name);
  const pr = Number(prText);
  const helperWeight = Number(weightText);
  const helperReps = Number(repsText);
  const estimateReady = helperWeight > 0 && helperReps >= 1;
  const canConfirm = name.trim().length > 0 && pr > 0;

  const handleNameChange = (value: string) => {
    setName(value);
    const hit = findSavedPr(value);
    if (hit) setPrText(formatKg(hit.pr));
  };

  const applyEstimate = () => {
    if (!estimateReady) return;
    setPrText(formatKg(computeOneRm(helperWeight, helperReps)));
  };

  const handleResumeExercise = (entry: ExerciseHistoryEntry) => {
    onConfirm(entry.exerciseName, entry.oneRepMax);
  };

  const handleSelectFromRoutine = (exercise: PowerExercisePlan) => {
    const hit = findSavedPr(exercise.name);
    const resolvedPr = hit ? hit.pr : 100; // Si no tiene PR registrado, asigna base calibrable
    onConfirm(exercise.name, resolvedPr);
  };

  const currentRoutineDays: PowerRoutineDay[] =
    routineType === "powerlifting" ? POWERLIFTING_ABSOLUTE_DAYS : FIGHTER_MOORZ_DAYS;
  const activeDay = currentRoutineDays[selectedDayIndex] || currentRoutineDays[0];

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl space-y-5 animate-in fade-in duration-300">
      {/* 1. Selector Superior de Modo */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
        <div>
          <p className="text-[10px] font-mono tracking-widest text-amber-400 uppercase">
            CONFIGURACIÓN DE ENTRADA
          </p>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-50 mt-0.5">
            ¿Cómo vas a entrenar hoy?
          </h2>
        </div>

        {/* Tabs de Modo */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab("free")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "free"
                ? "bg-amber-400 text-black shadow-md shadow-amber-400/20"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Cualquier Ejercicio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("routine")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "routine"
                ? "bg-amber-400 text-black shadow-md shadow-amber-400/20"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>Rutina Fuerza Máxima</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setHistoryList(getExerciseHistory());
              setActiveTab("history");
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "history"
                ? "bg-amber-400 text-black shadow-md shadow-amber-400/20"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Ejercicios / Historial ({historyList.length})</span>
          </button>
        </div>
      </div>

      {/* --- TAB 1: CUALQUIER EJERCICIO LIBRE (DISEÑO EXACTO ORIGINAL) --- */}
      {activeTab === "free" && (
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (!canConfirm) return;
            onConfirm(name, pr);
          }}
        >
          <div className="space-y-2">
            <h3 className="text-lg font-semibold tracking-tight text-zinc-100">
              Ingresa el ejercicio que vas a realizar y tu PR.
            </h3>
            <p className="text-sm leading-relaxed text-zinc-400">
              El estándar son los más fuertes que vivieron: Eddie Hall, Brian Shaw, Žydrūnas Savickas,
              Hafþór Björnsson, Mark Felix, Louis Cyr y los demás.
            </p>
          </div>

          {/* Chips rápidos de ejercicios previos si existen */}
          {historyList.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs text-zinc-400 block font-medium">
                Tus ejercicios recientes (un toque para cargar):
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {historyList.slice(0, 5).map((h) => (
                  <button
                    key={h.exerciseName}
                    type="button"
                    onClick={() => {
                      setName(h.exerciseName);
                      setPrText(formatKg(h.oneRepMax));
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-400/60 text-xs text-zinc-200 whitespace-nowrap cursor-pointer transition-all hover:scale-102"
                  >
                    <span>{h.exerciseName}</span>
                    <span className="text-amber-400 font-mono font-bold">
                      {formatKg(h.oneRepMax)}kg
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="session-exercise" className="text-sm font-medium text-zinc-300 block">
              Ejercicio
            </label>
            <input
              id="session-exercise"
              name="ejercicio"
              type="text"
              value={name}
              onChange={(event) => handleNameChange(event.target.value)}
              autoComplete="off"
              placeholder="Cualquier ejercicio"
              className="w-full min-h-11 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-base text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500"
            />
          </div>

          {saved ? (
            <p className="text-sm text-zinc-300 leading-relaxed">
              Ya tenés un PR de {formatKg(saved.pr)} kg en este dispositivo. Podés cambiarlo.
            </p>
          ) : null}

          <div className="space-y-1.5">
            <label htmlFor="session-pr" className="text-sm font-medium text-zinc-300 block">
              Tu PR (kg)
            </label>
            <input
              id="session-pr"
              name="pr"
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              value={prText}
              onChange={(event) => setPrText(event.target.value)}
              placeholder="0"
              className="w-full min-h-11 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 font-mono text-xl font-semibold text-amber-300 tabular-nums focus:border-amber-500"
            />
          </div>

          <button
            type="button"
            aria-expanded={helperOpen}
            onClick={() => setHelperOpen((open) => !open)}
            className="w-full min-h-11 rounded-xl border border-zinc-700 bg-zinc-900 text-sm font-semibold text-zinc-100 cursor-pointer"
          >
            Ayudar a sacar el PR
          </button>

          {helperOpen ? (
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="pr-helper-weight" className="text-sm font-medium text-zinc-300 block">
                    Peso (kg)
                  </label>
                  <input
                    id="pr-helper-weight"
                    name="peso"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="any"
                    value={weightText}
                    onChange={(event) => setWeightText(event.target.value)}
                    className="w-full min-h-11 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 font-mono text-base text-zinc-100 focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="pr-helper-reps" className="text-sm font-medium text-zinc-300 block">
                    Repeticiones
                  </label>
                  <input
                    id="pr-helper-reps"
                    name="repeticiones"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    value={repsText}
                    onChange={(event) => setRepsText(event.target.value)}
                    className="w-full min-h-11 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 font-mono text-base text-zinc-100 focus:border-amber-500"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={applyEstimate}
                disabled={!estimateReady}
                className="w-full min-h-11 rounded-xl bg-zinc-100 text-zinc-950 text-sm font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Poner este PR
              </button>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={!canConfirm}
            className="w-full min-h-11 h-14 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-semibold text-base cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all transform active:scale-98"
          >
            Confirmar e Iniciar
          </button>
        </form>
      )}

      {/* --- TAB 2: RUTINA DE FUERZA MÁXIMA ESPECÍFICA (POWERLIFTING & STRONGMAN) --- */}
      {activeTab === "routine" && (
        <div className="space-y-5">
          {/* Sub-selector de Rutina */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-zinc-200">
                Seleccionar Metodología de Fuerza:
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setRoutineType("powerlifting");
                  setSelectedDayIndex(0);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                  routineType === "powerlifting"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Fuerza Máxima (4 Días Powerlifting)
              </button>
              <button
                type="button"
                onClick={() => {
                  setRoutineType("moorz");
                  setSelectedDayIndex(0);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                  routineType === "moorz"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Protocolo del Peleador (Moorz)
              </button>
            </div>
          </div>

          {/* Banner de Fisiología del ATP-PCr */}
          <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold font-mono">
              <Timer className="w-4 h-4" />
              <span>CIENCIA DEL DESCANSO ATP-PCr (3 A 5 MINUTOS OBLIGATORIOS)</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              En cargas de fuerza máxima (85-100% 1RM), el sistema de fosfágenos requiere{" "}
              <strong>3 minutos para regenerar el 95-98% del ATP celular</strong> y{" "}
              <strong>5 minutos para la recuperación del 100% del Sistema Nervioso Central (SNC)</strong>.
              Descansar menos de 3 min degrada la técnica y aumenta el riesgo de lesión.
            </p>
          </div>

          {/* Selector de Días de la Rutina */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {currentRoutineDays.map((d, index) => {
              const isSelected = index === selectedDayIndex;
              return (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => setSelectedDayIndex(index)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-amber-400/15 border-amber-400 text-amber-200 shadow-md shadow-amber-400/10"
                      : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  <span className="text-[10px] font-mono tracking-wider font-bold block text-amber-400">
                    {d.dayLabel}
                  </span>
                  <span className="text-xs font-semibold block text-zinc-100 truncate mt-0.5">
                    {d.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Detalle del Día Seleccionado */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h4 className="text-base font-bold text-zinc-100">{activeDay.title}</h4>
              </div>
              <p className="text-xs text-amber-300 font-mono mt-0.5">{activeDay.subtitle}</p>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{activeDay.focus}</p>
            </div>

            {/* Ejercicios del Día */}
            <div className="space-y-3">
              {activeDay.exercises.map((ex) => {
                const savedRecord = findSavedPr(ex.name);
                const currentPr = savedRecord ? savedRecord.pr : null;
                const targetKg = currentPr ? Math.round(currentPr * (ex.targetPercentage / 100)) : null;

                return (
                  <div
                    key={ex.id}
                    className="p-3.5 sm:p-4 rounded-xl bg-zinc-950 border border-zinc-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-zinc-700 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-zinc-100">{ex.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {ex.sets} series × {ex.reps}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          @{ex.targetPercentage}% 1RM
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-zinc-400">
                        <span className="flex items-center gap-1 text-amber-400/90 font-mono">
                          <Timer className="w-3.5 h-3.5" />
                          Descanso: {Math.round(ex.restSeconds / 60)} min
                        </span>
                        {targetKg ? (
                          <span className="font-mono text-zinc-200">
                            Carga estimada: <strong>{targetKg} kg</strong> (PR: {currentPr}kg)
                          </span>
                        ) : (
                          <span className="text-zinc-500 italic">Sin PR guardado</span>
                        )}
                      </div>

                      <p className="text-[11px] text-zinc-400 leading-tight">
                        {ex.atpRecoveryMessage}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {onOpenVideo && (
                        <button
                          type="button"
                          onClick={() => onOpenVideo(ex.videoSearchName)}
                          className="px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900 text-xs text-zinc-300 hover:text-amber-300 inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 text-amber-400" />
                          <span className="hidden sm:inline">Técnica</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleSelectFromRoutine(ex)}
                        className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-400/10 active:scale-95 transition-all"
                      >
                        <span>Entrenar Este</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: HISTORIAL & CONTINUIDAD DE EJERCICIOS --- */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Historial de Fuerza y Continuidad</span>
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Todos los ejercicios que has ejecutado en el sistema con sus marcas y progresiones.
              Toca <strong>Retomar</strong> para cargar de inmediato el ejercicio donde lo dejaste.
            </p>
          </div>

          {historyList.length === 0 ? (
            <div className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center space-y-2">
              <Dumbbell className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-sm font-semibold text-zinc-300">
                Aún no has registrado ejercicios en esta sesión.
              </p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Realiza una sesión en modo libre o en rutina para que tus series, cargas y descansos se
                registren automáticamente aquí para tus próximas sesiones.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {historyList.map((entry) => {
                const dateStr = new Date(entry.lastTrainedAt).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });

                return (
                  <div
                    key={entry.exerciseName}
                    className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-zinc-100">
                          {entry.exerciseName}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {formatKg(entry.oneRepMax)} kg PR
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-mono">
                        <span>Último uso: {dateStr}</span>
                        {entry.totalSetsCompleted > 0 && (
                          <span>{entry.totalSetsCompleted} series registradas</span>
                        )}
                        {entry.suggestedNextWeight && (
                          <span className="text-emerald-400 font-semibold">
                            Meta siguiente: {entry.suggestedNextWeight} kg (+2.5kg)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {onOpenVideo && (
                        <button
                          type="button"
                          onClick={() => onOpenVideo(entry.exerciseName)}
                          className="px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900 text-xs text-zinc-300 hover:text-amber-300 inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 text-amber-400" />
                          <span className="hidden sm:inline">Técnica</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleResumeExercise(entry)}
                        className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-400/10 active:scale-95 transition-all"
                      >
                        <Zap className="w-3.5 h-3.5 fill-black" />
                        <span>Retomar Ejercicio</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
