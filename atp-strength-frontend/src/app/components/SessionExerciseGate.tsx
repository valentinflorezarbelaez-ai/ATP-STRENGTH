"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
  Search,
  PlusCircle,
  Download,
  Upload,
  BookOpen,
  ShieldCheck,
  AlertTriangle,
  Calculator,
} from "lucide-react";
import { computeOneRm } from "@/lib/workoutStrategies";
import { findSavedPr } from "@/lib/sessionExercise";
import {
  getExerciseHistory,
  registerOrUpdateExerciseInHistory,
  getBiomechanicalCues,
  calculateMultiFormula1Rm,
  exportHistoryAsJson,
  importHistoryFromJson,
  type ExerciseHistoryEntry,
  type BiomechanicalCue,
} from "@/lib/exerciseHistoryStorage";
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
  const [historySearch, setHistorySearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExName, setNewExName] = useState("");
  const [newExPr, setNewExPr] = useState("");

  // Modal de técnica biomecánica offline
  const [offlineCueExercise, setOfflineCueExercise] = useState<string | null>(null);

  // Feedback de importación / exportación
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reloadHistory = () => {
    setHistoryList(getExerciseHistory());
  };

  useEffect(() => {
    reloadHistory();
  }, []);

  const saved = findSavedPr(name);
  const pr = Number(prText);
  const helperWeight = Number(weightText);
  const helperReps = Number(repsText);
  const estimateReady = helperWeight > 0 && helperReps >= 1;
  const canConfirm = name.trim().length > 0 && pr > 0;

  // Cálculo algorítmico comparativo de 1RM (Epley vs Brzycki)
  const multi1Rm = useMemo(() => {
    if (!estimateReady) return null;
    return calculateMultiFormula1Rm(helperWeight, helperReps);
  }, [estimateReady, helperWeight, helperReps]);

  const handleNameChange = (value: string) => {
    setName(value);
    const hit = findSavedPr(value);
    if (hit) setPrText(formatKg(hit.pr));
  };

  const applyEstimate = (calculatedValue?: number) => {
    if (!estimateReady) return;
    const value = calculatedValue ?? computeOneRm(helperWeight, helperReps);
    setPrText(formatKg(value));
  };

  const handleConfirmFree = () => {
    if (!canConfirm) return;
    const finalName = name.trim();
    // Guardar inmediatamente en el historial para garantizar continuidad
    registerOrUpdateExerciseInHistory({
      exerciseName: finalName,
      oneRepMax: pr,
    });
    reloadHistory();
    onConfirm(finalName, pr);
  };

  const handleResumeExercise = (entry: ExerciseHistoryEntry) => {
    // Asegurar que el ejercicio esté registrado y actualizado
    registerOrUpdateExerciseInHistory({
      exerciseName: entry.exerciseName,
      oneRepMax: entry.oneRepMax,
    });
    reloadHistory();
    onConfirm(entry.exerciseName, entry.oneRepMax);
  };

  const handleSelectFromRoutine = (exercise: PowerExercisePlan) => {
    const hit = findSavedPr(exercise.name);
    const resolvedPr = hit ? hit.pr : 100;
    registerOrUpdateExerciseInHistory({
      exerciseName: exercise.name,
      oneRepMax: resolvedPr,
      category: "Fuerza Máxima",
    });
    reloadHistory();
    onConfirm(exercise.name, resolvedPr);
  };

  const handleCreateNewCustomExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName.trim() || Number(newExPr) <= 0) return;
    registerOrUpdateExerciseInHistory({
      exerciseName: newExName.trim(),
      oneRepMax: Number(newExPr),
    });
    setNewExName("");
    setNewExPr("");
    setShowAddForm(false);
    reloadHistory();
    setBackupMessage("¡Ejercicio añadido al historial de continuidad!");
    setTimeout(() => setBackupMessage(null), 3000);
  };

  const handleExportBackup = () => {
    const jsonStr = exportHistoryAsJson();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `atp-strength-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setBackupMessage("Backup JSON descargado correctamente.");
    setTimeout(() => setBackupMessage(null), 3000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = importHistoryFromJson(content);
        if (res.success) {
          reloadHistory();
          setBackupMessage(`¡Se importaron ${res.count} ejercicios con éxito!`);
        } else {
          setBackupMessage("Error al leer el archivo JSON de respaldo.");
        }
        setTimeout(() => setBackupMessage(null), 3500);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const currentRoutineDays: PowerRoutineDay[] =
    routineType === "powerlifting" ? POWERLIFTING_ABSOLUTE_DAYS : FIGHTER_MOORZ_DAYS;
  const activeDay = currentRoutineDays[selectedDayIndex] || currentRoutineDays[0];

  // Filtrado de historial
  const filteredHistory = useMemo(() => {
    if (!historySearch.trim()) return historyList;
    const term = historySearch.toLowerCase().trim();
    return historyList.filter((item) => item.exerciseName.toLowerCase().includes(term));
  }, [historyList, historySearch]);

  const activeCues: BiomechanicalCue | null = useMemo(() => {
    if (!offlineCueExercise) return null;
    return getBiomechanicalCues(offlineCueExercise);
  }, [offlineCueExercise]);

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl space-y-5 animate-in fade-in duration-300">
      {/* 1. Selector Superior de Modo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-mono tracking-widest text-amber-400 uppercase">
              CONFIGURACIÓN DE ENTRADA
            </p>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-50 mt-0.5">
            ¿Cómo vas a entrenar hoy?
          </h2>
        </div>

        {/* Tabs de Modo */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("free")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
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
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
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
              reloadHistory();
              setActiveTab("history");
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
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

      {/* Notificación de feedback de backup */}
      {backupMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{backupMessage}</span>
        </div>
      )}

      {/* --- TAB 1: CUALQUIER EJERCICIO LIBRE (DISEÑO EXACTO ORIGINAL) --- */}
      {activeTab === "free" && (
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            handleConfirmFree();
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
                {historyList.slice(0, 6).map((h) => (
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
              placeholder="Cualquier ejercicio (ej. Press de Banca, Peso Muerto, Sentadilla...)"
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

          <div className="flex gap-2">
            <button
              type="button"
              aria-expanded={helperOpen}
              onClick={() => setHelperOpen((open) => !open)}
              className="flex-1 min-h-11 rounded-xl border border-zinc-700 bg-zinc-900 text-sm font-semibold text-zinc-100 cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <Calculator className="w-4 h-4 text-amber-400" />
              <span>Ayudar a sacar el PR (Algoritmo 1RM)</span>
            </button>

            {name.trim() && (
              <button
                type="button"
                onClick={() => setOfflineCueExercise(name.trim())}
                className="px-3.5 min-h-11 rounded-xl border border-zinc-700 bg-zinc-900 text-xs font-semibold text-amber-300 hover:text-amber-200 cursor-pointer inline-flex items-center gap-1.5"
                title="Ver claves técnicas biomecánicas offline"
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Técnica Offline</span>
              </button>
            )}
          </div>

          {helperOpen ? (
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="pr-helper-weight" className="text-sm font-medium text-zinc-300 block">
                    Peso levantado (kg)
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
                    Repeticiones logradas
                  </label>
                  <input
                    id="pr-helper-reps"
                    name="reps"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={repsText}
                    onChange={(event) => setRepsText(event.target.value)}
                    className="w-full min-h-11 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 font-mono text-base text-zinc-100 focus:border-amber-500"
                  />
                </div>
              </div>

              {multi1Rm ? (
                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2">
                  <p className="text-xs font-mono text-zinc-400">
                    Estimación Algorítmica Científica:
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                      <span className="text-[10px] text-zinc-400 block">Epley (Fuerza)</span>
                      <strong className="text-amber-400 text-sm font-mono">{multi1Rm.epley} kg</strong>
                    </div>
                    <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                      <span className="text-[10px] text-zinc-400 block">Brzycki (Power)</span>
                      <strong className="text-amber-400 text-sm font-mono">{multi1Rm.brzycki} kg</strong>
                    </div>
                    <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30">
                      <span className="text-[10px] text-amber-300 block">Promedio Seguro</span>
                      <strong className="text-amber-300 text-sm font-mono">{multi1Rm.average} kg</strong>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => applyEstimate(multi1Rm.average)}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition-all cursor-pointer"
                    >
                      Usar Promedio ({multi1Rm.average} kg)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyEstimate(multi1Rm.brzycki)}
                      className="py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-all cursor-pointer"
                    >
                      Brzycki ({multi1Rm.brzycki} kg)
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={!canConfirm}
            className={`w-full min-h-12 rounded-xl text-base font-bold transition-all ${
              canConfirm
                ? "bg-amber-400 text-zinc-950 hover:bg-amber-300 cursor-pointer shadow-lg shadow-amber-400/20"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            }`}
          >
            CONFIRMAR EJERCICIO Y ENTRAR
          </button>
        </form>
      )}

      {/* --- TAB 2: RUTINA DE FUERZA MÁXIMA --- */}
      {activeTab === "routine" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <span>Programación de Fuerza Absoluta</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Metodología pura: Ed Coan, John Haack, Colton Engelbrecht y atletas de élite.
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-zinc-900 border border-zinc-800 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setRoutineType("powerlifting");
                  setSelectedDayIndex(0);
                }}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  routineType === "powerlifting"
                    ? "bg-amber-400 text-black shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Powerlifting Puro
              </button>
              <button
                type="button"
                onClick={() => {
                  setRoutineType("moorz");
                  setSelectedDayIndex(0);
                }}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  routineType === "moorz"
                    ? "bg-amber-400 text-black shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Peleador (Moorz)
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <Timer className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed text-zinc-300">
              <strong className="text-amber-300 font-semibold block">
                Protocolo Biológico de Descanso (ATP-PCr):
              </strong>
              Para cargas ≥85% 1RM, descansar <strong>3 a 5 minutos</strong> entre series es obligatorio.
              A los 3 min se restaura el 95-98% del fosfágeno muscular; a los 5 min se logra el 100% de
              recuperación neuromuscular para evitar fallos técnicos y proteger la columna.
            </div>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {currentRoutineDays.map((day, idx) => (
              <button
                key={day.key}
                type="button"
                onClick={() => setSelectedDayIndex(idx)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedDayIndex === idx
                    ? "bg-zinc-900 border-amber-400 text-white shadow-md shadow-amber-400/10 ring-1 ring-amber-400/50"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <span className="text-[10px] font-mono tracking-wider text-amber-400 block uppercase">
                  {day.dayLabel}
                </span>
                <span className="text-xs font-bold text-zinc-200 block truncate mt-0.5">
                  {day.title}
                </span>
                <span className="text-[10px] text-zinc-500 block mt-1">
                  {day.exercises.length} movimientos
                </span>
              </button>
            ))}
          </div>

          {/* Detalle del día seleccionado */}
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div>
                <h4 className="text-sm font-bold text-zinc-100">
                  {activeDay.dayLabel}: {activeDay.title}
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">{activeDay.subtitle}</p>
              </div>
            </div>

            <div className="space-y-2.5">
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
                      <button
                        type="button"
                        onClick={() => setOfflineCueExercise(ex.name)}
                        className="px-2.5 py-2 rounded-xl border border-zinc-800 bg-zinc-900 text-xs text-amber-300 hover:text-amber-200 inline-flex items-center gap-1 cursor-pointer"
                        title="Ver claves técnicas biomecánicas offline"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                        <span className="hidden sm:inline">Cues</span>
                      </button>

                      {onOpenVideo && (
                        <button
                          type="button"
                          onClick={() => onOpenVideo(ex.videoSearchName)}
                          className="px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900 text-xs text-zinc-300 hover:text-amber-300 inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 text-amber-400" />
                          <span className="hidden sm:inline">Video</span>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>Historial de Fuerza y Continuidad</span>
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Cada ejercicio nuevo o realizado se almacena aquí. Tocá <strong>Retomar</strong> para cargarlo directamente.
              </p>
            </div>

            {/* Acciones de gestión rápida */}
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{showAddForm ? "Cerrar" : "Añadir Ejercicio"}</span>
              </button>

              <button
                type="button"
                onClick={handleExportBackup}
                className="px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                title="Descargar copia de seguridad en archivo JSON"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Exportar</span>
              </button>

              <label className="px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white text-xs font-medium inline-flex items-center gap-1 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>Importar</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Formulario rápido para añadir ejercicio manual al historial */}
          {showAddForm && (
            <form
              onSubmit={handleCreateNewCustomExercise}
              className="p-4 rounded-xl bg-zinc-900 border border-amber-500/40 space-y-3 animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
                <span className="text-xs font-mono font-bold text-amber-300 uppercase">
                  Registrar Nuevo Ejercicio al Historial
                </span>
                <span className="text-[10px] text-zinc-400">Guarda en memoria local persistente</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-300 block">Nombre del Ejercicio</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Press Inclinado con Mancuernas, Sentadilla Hack..."
                    value={newExName}
                    onChange={(e) => setNewExName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-300 block">PR Actual (kg)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    step="any"
                    placeholder="Ej. 120"
                    value={newExPr}
                    onChange={(e) => setNewExPr(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm font-mono text-amber-300 placeholder:text-zinc-600 focus:border-amber-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition-all cursor-pointer"
              >
                Guardar en el Historial de Continuidad
              </button>
            </form>
          )}

          {/* Barra de búsqueda de ejercicios */}
          {historyList.length > 0 && (
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar ejercicio en tu historial..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder:text-zinc-500 focus:border-amber-500"
              />
            </div>
          )}

          {filteredHistory.length === 0 ? (
            <div className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center space-y-2">
              <Dumbbell className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-sm font-semibold text-zinc-300">
                {historyList.length === 0
                  ? "Aún no has registrado ejercicios en esta sesión."
                  : "No se encontraron ejercicios con ese nombre."}
              </p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                {historyList.length === 0
                  ? "Realiza una sesión en modo libre o toca 'Añadir Ejercicio' arriba para registrar tus marcas."
                  : "Probá con otro término o limpiá la barra de búsqueda."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((entry) => {
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
                        <span>Último: {dateStr}</span>
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

                    <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                      <button
                        type="button"
                        onClick={() => setOfflineCueExercise(entry.exerciseName)}
                        className="px-2.5 py-2 rounded-xl border border-zinc-800 bg-zinc-900 text-xs text-amber-300 hover:text-amber-200 inline-flex items-center gap-1 cursor-pointer"
                        title="Ver claves técnicas biomecánicas offline"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                        <span className="hidden sm:inline">Técnica</span>
                      </button>

                      {onOpenVideo && (
                        <button
                          type="button"
                          onClick={() => onOpenVideo(entry.exerciseName)}
                          className="px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900 text-xs text-zinc-300 hover:text-amber-300 inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 text-amber-400" />
                          <span className="hidden sm:inline">Video</span>
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

      {/* --- MODAL DE CLAVES TÉCNICAS BIOMECÁNICAS OFFLINE --- */}
      {offlineCueExercise && activeCues && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-950 border border-amber-500/50 p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-bold text-zinc-100 uppercase tracking-wide">
                  Técnica Biomecánica: {offlineCueExercise}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOfflineCueExercise(null)}
                className="text-xs font-mono text-zinc-400 hover:text-white px-2 py-1 rounded"
              >
                ✕ Cerrar
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Setup */}
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>1. Posición Inicial y Setup</span>
                </div>
                <ul className="space-y-1 text-zinc-300 pl-1">
                  {activeCues.setup.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Execution */}
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>2. Trayectoria y Ejecución</span>
                </div>
                <ul className="space-y-1 text-zinc-300 pl-1">
                  {activeCues.execution.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Breathing */}
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="text-sky-300 font-bold block">3. Respiración y Maniobra de Valsalva:</span>
                <p className="text-zinc-300 leading-relaxed">{activeCues.breathing}</p>
              </div>

              {/* Common Mistakes */}
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1">
                <div className="flex items-center gap-1.5 text-rose-300 font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Error Crítico a Evitar</span>
                </div>
                <p className="text-zinc-300 leading-relaxed">{activeCues.commonMistake}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOfflineCueExercise(null)}
              className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 transition-all cursor-pointer"
            >
              Entendido, volver a la sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
