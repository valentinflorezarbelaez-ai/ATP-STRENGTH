"use client";

import React, { useState, useEffect } from "react";
import {
  Flame,
  Zap,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Server,
  Calendar,
  Activity,
  ShieldCheck,
  Volume2,
  Lock,
  Maximize2,
  Minimize2,
  Layers,
  Sparkles,
  ChevronRight,
  TrendingUp,
  X,
  Save,
  Dumbbell,
  History,
  Calculator
} from "lucide-react";

// --- Interfaces de Tipado ---
interface Exercise {
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  cue: string;
}

interface RoutineDay {
  key: string;
  name: string;
  focus: string;
  isRest: boolean;
  restMessage?: string;
  exercises: Exercise[];
}

interface NeuromuscularPhase {
  phase: number;
  name: string;
  durationSeconds: number;
  repsCue: string;
  objective: string;
  percentage: number;
}

interface PhasePrescriptions {
  phase_1_activation: number;
  phase_2_light: number;
  phase_3_medium: number;
  phase_4_pap: number;
  phase_5_work: number;
}

interface ExerciseMaxData {
  id: number;
  exercise_name: string;
  one_rep_max: number;
  training_max: number;
  formula: string;
  lifted_weight: number;
  reps_performed: number;
  notes?: string;
  prescriptions: PhasePrescriptions;
}

interface HistoryItem {
  id: number;
  exercise_name: string;
  set_number: number;
  prescribed_reps: number;
  completed_reps?: number;
  load_kg: number;
  rest_seconds: number;
  notes?: string;
  completed: boolean;
}

// --- Protocolo de Preparación Neuromuscular (Fases 0 a 4) ---
const NEUROMUSCULAR_PHASES: NeuromuscularPhase[] = [
  {
    phase: 0,
    name: "Fase 0: Movilidad & Flujo Sinovial",
    durationSeconds: 90,
    repsCue: "90s continuos",
    objective: "Descompresión capsular articular y lubricación con líquido sinovial.",
    percentage: 0,
  },
  {
    phase: 1,
    name: "Fase 1: Activación Dinámica del SNC",
    durationSeconds: 60,
    repsCue: "20% TM × 10 reps (Barra vacía)",
    objective: "Reclutamiento de motoneuronas alfa y unidades motoras tipo IIb.",
    percentage: 20,
  },
  {
    phase: 2,
    name: "Fase 2: Aproximación Ligera",
    durationSeconds: 90,
    repsCue: "40% TM × 5 reps",
    objective: "Fijación del patrón motor sin fatiga metabólica acumulada.",
    percentage: 40,
  },
  {
    phase: 3,
    name: "Fase 3: Aproximación Media",
    durationSeconds: 120,
    repsCue: "60% TM × 3 reps",
    objective: "Sensibilización barométrica y aclimatación de la tensión tendinosa.",
    percentage: 60,
  },
  {
    phase: 4,
    name: "Fase 4: Potenciación Pesada (PAP)",
    durationSeconds: 180,
    repsCue: "80% TM × 1 rep",
    objective: "Máxima Potenciación Post-Activación (PAP) previa a series efectivas.",
    percentage: 80,
  },
];

// --- Itinerario Élite de 4 Días Fijos + Días de Descanso Absoluto ---
const SCHEDULE_DAYS: RoutineDay[] = [
  {
    key: "DAY_A",
    name: "Lunes - Día A",
    focus: "Empuje & Dominancia Cuádriceps",
    isRest: false,
    exercises: [
      { name: "Sentadilla Trasera", sets: 5, reps: "3 reps", restSeconds: 240, cue: "Apoyo trípode, empuje contra el suelo con cadencia explosiva concéntrica." },
      { name: "Press de Banca", sets: 5, reps: "3 reps", restSeconds: 240, cue: "Retracción escapular máxima, arco lumbar biomecánico estable." },
      { name: "Press Militar", sets: 4, reps: "3 reps", restSeconds: 180, cue: "Bloqueo glúteo y core activo, trayectoria vertical limpia." },
      { name: "Fondos en Paralelas", sets: 3, reps: "5 reps", restSeconds: 180, cue: "Codos en 45°, torso con ligera inclinación hacia adelante." },
    ],
  },
  {
    key: "DAY_B",
    name: "Martes - Día B",
    focus: "Tracción & Cadena Posterior",
    isRest: false,
    exercises: [
      { name: "Peso Muerto Convencional", sets: 2, reps: "3 reps", restSeconds: 300, cue: "Tensión de dorsales, tracción de la barra pegada a las tibias." },
      { name: "Dominadas Lastradas", sets: 4, reps: "4 reps", restSeconds: 180, cue: "Rango articular completo, depresión escapular antes de traccionar." },
      { name: "Remo Pendlay", sets: 3, reps: "5 reps", restSeconds: 180, cue: "Torso paralelo al suelo, inicio inerte desde cada repetición." },
      { name: "Peso Muerto Rumano", sets: 3, reps: "5 reps", restSeconds: 180, cue: "Bisagra de cadera profunda, estiramiento isquiosural controlado." },
      { name: "Paseo del Granjero Pesado", sets: 3, reps: "40 metros", restSeconds: 180, cue: "Fuerza de agarre crushing, columna vertebral en extensión neutra." },
    ],
  },
  {
    key: "DAY_REST_WED",
    name: "Miércoles",
    focus: "Descanso Absoluto",
    isRest: true,
    restMessage: "Supercompensación Central Obligatoria: Regeneración del Sistema Nervioso Central (SNC) y resíntesis glucogénica sin carga.",
    exercises: [],
  },
  {
    key: "DAY_C",
    name: "Jueves - Día C",
    focus: "Empuje Supremo & Densidad",
    isRest: false,
    exercises: [
      { name: "Press de Banca", sets: 6, reps: "2 reps", restSeconds: 240, cue: "Potencia elástica y aceleración máxima en fase de ascenso." },
      { name: "Press Militar", sets: 4, reps: "3 reps", restSeconds: 180, cue: "Control excéntrico de 2s, pausa clavicular mínima." },
      { name: "Fondos en Paralelas", sets: 3, reps: "5 reps", restSeconds: 180, cue: "Lastre progresivo preservando rango articular sin dolor acromial." },
      { name: "Planchas Isométricas Pesadas", sets: 4, reps: "30 seg", restSeconds: 120, cue: "Retroversión pélvica, co-contracción máxima abdominal con lastre." },
    ],
  },
  {
    key: "DAY_D",
    name: "Viernes - Día D",
    focus: "Tracción Técnica & Brazos",
    isRest: false,
    exercises: [
      { name: "Sentadilla Trasera Técnica", sets: 3, reps: "3 reps", restSeconds: 180, cue: "Velocidad de ejecución perfecta a 75% 1RM con pausa en paralelo." },
      { name: "Dominadas Lastradas", sets: 4, reps: "4 reps", restSeconds: 180, cue: "Pectoral tocando la barra, descenso de 3 segundos." },
      { name: "Remo Pendlay", sets: 3, reps: "5 reps", restSeconds: 180, cue: "Potencia neuromuscular de la espalda media sin impulso lumbar." },
      { name: "Curl Bíceps Barra Z", sets: 4, reps: "5 reps", restSeconds: 120, cue: "Codos anclados a la caja torácica, supinación sostenida." },
      { name: "Elevaciones Piernas a la Barra", sets: 3, reps: "8 reps", restSeconds: 120, cue: "Flexión espinal activa, sin balanceo de inercia." },
    ],
  },
  {
    key: "DAY_REST_WEEKEND",
    name: "Sábado y Domingo",
    focus: "Descanso Absoluto",
    isRest: true,
    restMessage: "Ventana Anabólica de Recuperación Sistémica: Cero estímulo de carga. Optimización del sueño profundo y resíntesis biológica total.",
    exercises: [],
  },
];

// Lista consolidada de ejercicios para el cálculo de 1RM
const ALL_TRACKABLE_EXERCISES = [
  "Sentadilla Trasera",
  "Press de Banca",
  "Press Militar",
  "Fondos en Paralelas",
  "Peso Muerto Convencional",
  "Dominadas Lastradas",
  "Remo Pendlay",
  "Peso Muerto Rumano",
  "Paseo del Granjero Pesado",
  "Sentadilla Trasera Técnica",
  "Curl Bíceps Barra Z",
];

export default function ZenDashboard() {
  const [selectedDayKey, setSelectedDayKey] = useState<string>("DAY_A");
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number>(0);
  const [currentSet, setCurrentSet] = useState<number>(1);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  // Modal y Paneles
  const [zenFocusMode, setZenFocusMode] = useState<boolean>(false);
  const [showPrepProtocol, setShowPrepProtocol] = useState<boolean>(false);
  const [showProgressModal, setShowProgressModal] = useState<boolean>(false);

  // Timer State
  const [timerDuration, setTimerDuration] = useState<number>(180);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(180);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timerTitle, setTimerTitle] = useState<string>("Resíntesis de ATP-PCr");

  // Telemetría de Cargas y 1RM
  const [maxesMap, setMaxesMap] = useState<{ [key: string]: ExerciseMaxData }>({});
  const [selectedProgressEx, setSelectedProgressEx] = useState<string>("Sentadilla Trasera");
  const [inputWeight, setInputWeight] = useState<string>("100");
  const [inputReps, setInputReps] = useState<string>("3");
  const [inputRpe, setInputRpe] = useState<string>("8.5");

  // Formulario de Nueva Marca 1RM
  const [formFormula, setFormFormula] = useState<string>("epley");
  const [formWeight, setFormWeight] = useState<string>("100");
  const [formReps, setFormReps] = useState<string>("5");
  const [formNotes, setFormNotes] = useState<string>("");
  const [isSavingMax, setIsSavingMax] = useState<boolean>(false);

  // Historial del ejercicio en modal
  const [exerciseHistory, setExerciseHistory] = useState<HistoryItem[]>([]);

  const activeDay = SCHEDULE_DAYS.find((d) => d.key === selectedDayKey) || SCHEDULE_DAYS[0];
  const activeExercise = activeDay.exercises[activeExerciseIndex] || activeDay.exercises[0];

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Cargar Maxes desde el Backend FastAPI
  const fetchMaxes = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/strength/maxes`);
      if (res.ok) {
        const data: ExerciseMaxData[] = await res.json();
        const map: { [key: string]: ExerciseMaxData } = {};
        data.forEach((item) => {
          map[item.exercise_name] = item;
        });
        setMaxesMap(map);
      }
    } catch {
      // Manejo silencioso en desconexión
    }
  };

  // Cargar Historial para el modal
  const fetchHistory = async (exName: string) => {
    try {
      const res = await fetch(`${apiUrl}/api/strength/history?exercise_name=${encodeURIComponent(exName)}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setExerciseHistory(data);
      }
    } catch {
      setExerciseHistory([]);
    }
  };

  // Sincronizar carga objetivo sugerida al cambiar de ejercicio
  useEffect(() => {
    if (activeExercise && maxesMap[activeExercise.name]) {
      const suggestedLoad = maxesMap[activeExercise.name].prescriptions.phase_5_work;
      if (suggestedLoad > 0) {
        setInputWeight(suggestedLoad.toString());
      }
    }
  }, [activeExerciseIndex, selectedDayKey, maxesMap]);

  useEffect(() => {
    fetchMaxes();
  }, [apiUrl]);

  useEffect(() => {
    if (showProgressModal) {
      fetchHistory(selectedProgressEx);
    }
  }, [selectedProgressEx, showProgressModal]);

  // Verificación periódica del Backend Python FastAPI
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch(`${apiUrl}/health`, { method: "GET" });
        if (res.ok) {
          setBackendOnline(true);
        } else {
          setBackendOnline(false);
        }
      } catch {
        setBackendOnline(false);
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 12000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  // Campana Zen de 440 Hz con armónico usando Web Audio API
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();

      // Fundamental 440 Hz
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(440, audioCtx.currentTime);
      gain1.gain.setValueAtTime(0.35, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 3.0);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);

      // Armónico cálido 880 Hz
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain2.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 2.0);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(audioCtx.currentTime + 3.0);
      osc2.stop(audioCtx.currentTime + 2.0);
    } catch (err) {
      console.warn("AudioContext bloqueado:", err);
    }
  };

  // Cronómetro regresivo
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && remainingSeconds > 0) {
      timer = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            playChime();
            if (typeof navigator !== "undefined" && navigator.vibrate) {
              navigator.vibrate([100, 100, 200]);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, remainingSeconds]);

  const handleStartTimer = (duration: number, title: string = "Resíntesis de ATP-PCr") => {
    setTimerTitle(title);
    setTimerDuration(duration);
    setRemainingSeconds(duration);
    setIsRunning(true);
  };

  const togglePlayPause = () => {
    setIsRunning(!isRunning);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setRemainingSeconds(timerDuration);
  };

  // Botón Bio-Ergonómico 3D: Completar Serie con Carga Real
  const handleCompleteSet = async () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([40, 60, 40]);
    }

    const restTime = activeExercise.restSeconds || 180;
    handleStartTimer(restTime, `Descanso ATP: ${activeExercise.name}`);
    setZenFocusMode(true);

    const numericWeight = parseFloat(inputWeight) || 0.0;
    const numericReps = parseInt(inputReps) || 3;

    if (currentSet < activeExercise.sets) {
      setCurrentSet(currentSet + 1);
    } else {
      if (activeExerciseIndex < activeDay.exercises.length - 1) {
        setActiveExerciseIndex(activeExerciseIndex + 1);
        setCurrentSet(1);
      }
    }

    // Persistir ejecución en Backend Python FastAPI -> PostgreSQL
    if (backendOnline) {
      try {
        await fetch(`${apiUrl}/api/state/log-set`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exercise_name: activeExercise.name,
            set_number: currentSet,
            prescribed_reps: parseInt(activeExercise.reps) || 3,
            completed_reps: numericReps,
            load_kg: numericWeight,
            rest_seconds: restTime,
            notes: `RPE ${inputRpe}`,
          }),
        });
      } catch (err) {
        console.warn("Backend error al registrar serie:", err);
      }
    }
  };

  // Guardar Marca de 1RM en Backend
  const handleSaveMax = async () => {
    const w = parseFloat(formWeight);
    const r = parseInt(formReps);
    if (!w || w <= 0 || !r || r <= 0) return;

    setIsSavingMax(true);
    try {
      const res = await fetch(`${apiUrl}/api/strength/maxes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise_name: selectedProgressEx,
          lifted_weight: w,
          reps_performed: r,
          formula: formFormula,
          notes: formNotes,
        }),
      });
      if (res.ok) {
        await fetchMaxes();
        await fetchHistory(selectedProgressEx);
      }
    } catch (err) {
      console.warn("Error guardando 1RM:", err);
    } finally {
      setIsSavingMax(false);
    }
  };

  // Cálculo en vivo dentro del formulario
  const calculateLive1RM = () => {
    const w = parseFloat(formWeight) || 0;
    const r = parseInt(formReps) || 1;
    if (w <= 0 || r <= 0) return { oneRm: 0, tm: 0, phase5: 0 };

    let oneRm = w;
    if (r > 1 && formFormula === "epley") {
      oneRm = w * (1 + r / 30);
    } else if (r > 1 && formFormula === "brzycki") {
      const denom = 1.0278 - 0.0278 * r;
      oneRm = denom > 0 ? w / denom : w;
    }
    const tm = Math.round(oneRm * 0.9 * 10) / 10;
    const phase5 = Math.round(Math.round((tm * 0.85) / 2.5) * 2.5 * 10) / 10;
    return {
      oneRm: Math.round(oneRm * 10) / 10,
      tm,
      phase5,
    };
  };

  const liveCalc = calculateLive1RM();
  const currentExMax = maxesMap[selectedProgressEx];
  const activeExMax = activeExercise ? maxesMap[activeExercise.name] : null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  const progressPercent =
    timerDuration > 0 ? ((timerDuration - remainingSeconds) / timerDuration) * 100 : 0;
  const strokeDashoffset = 565.48 - (565.48 * progressPercent) / 100;

  const atpSaturationPercent = Math.min(
    100,
    Math.round(((timerDuration - remainingSeconds) / timerDuration) * 100)
  );

  return (
    <main className="min-h-screen bg-black text-zinc-100 flex flex-col items-center justify-between p-4 md:p-8 font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Header */}
      <header className="w-full max-w-6xl flex items-center justify-between border-b border-zinc-900 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 glow-zen-gold">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black tracking-widest text-zinc-100 uppercase">
                NEURO//<span className="text-amber-400">STRENGTH</span>
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                PRO-V1
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono tracking-tight mt-0.5">
              MOTOR ZEN DE RESÍNTESIS DE ATP & FUERZA MÁXIMA
            </p>
          </div>
        </div>

        {/* Acciones de Cabecera */}
        <div className="flex items-center gap-3">
          {/* Botón FUERZA / PROGRESO */}
          <button
            onClick={() => {
              if (activeExercise) setSelectedProgressEx(activeExercise.name);
              setShowProgressModal(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 hover:from-amber-500/30 hover:to-amber-600/20 border border-amber-500/40 text-xs font-mono font-bold text-amber-300 shadow-lg shadow-amber-500/5 transition-all transform active:scale-95 cursor-pointer"
          >
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span>FUERZA / PROGRESO</span>
          </button>

          {/* Botón Aislamiento Zen */}
          <button
            onClick={() => setZenFocusMode(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 text-xs font-mono text-zinc-300 hover:text-amber-400 transition-all"
            title="Aislamiento Visual True Black"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Aislamiento Zen</span>
          </button>

          {/* Backend Connectivity Status */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono">
            <Server className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-400">FastAPI (5433):</span>
            {backendOnline === null ? (
              <span className="text-zinc-500">Conectando...</span>
            ) : backendOnline ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                En Línea
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-zinc-600"></span>
                Desconectado
              </span>
            )}
          </div>
        </div>
      </header>

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
                      setCurrentSet(1);
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
              {/* Tarjeta de Ejercicio en Curso */}
              <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-900 shadow-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-zinc-400 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-amber-400" /> EJERCICIO EN EJECUCIÓN
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">
                    {activeExerciseIndex + 1} de {activeDay.exercises.length}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-2xl font-black text-white tracking-tight">
                    {activeExercise.name}
                  </h3>
                  {activeExMax && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-400 font-bold">
                      1RM: {activeExMax.one_rep_max} kg
                    </span>
                  )}
                </div>
                <p className="text-xs text-amber-400/90 font-mono mb-3">{activeDay.focus}</p>
                <p className="text-xs text-zinc-400 italic bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-800/60 mb-5">
                  &ldquo;{activeExercise.cue}&rdquo;
                </p>

                {/* Métricas de Series y Carga */}
                <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 mb-5 text-center">
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">
                      Serie Actual
                    </div>
                    <div className="text-xl font-black text-amber-400 font-mono mt-0.5">
                      {currentSet} / {activeExercise.sets}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">
                      Prescripción
                    </div>
                    <div className="text-xl font-black text-white font-mono mt-0.5">
                      {activeExercise.reps}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">
                      Descanso ATP
                    </div>
                    <div className="text-xl font-black text-white font-mono mt-0.5">
                      {Math.floor(activeExercise.restSeconds / 60)} min
                    </div>
                  </div>
                </div>

                {/* Panel de Carga Real para la Serie (Peso levantado y Reps) */}
                <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 mb-5">
                  <div className="flex items-center justify-between mb-3 text-xs font-mono">
                    <span className="text-zinc-300 font-bold flex items-center gap-1.5">
                      <Dumbbell className="w-3.5 h-3.5 text-amber-400" /> CARGA DE LA SERIE ACTUAL:
                    </span>
                    {activeExMax && (
                      <span className="text-[11px] text-amber-400/90">
                        Sugerido (Fase 5): <strong className="text-white">{activeExMax.prescriptions.phase_5_work} kg</strong>
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-zinc-400 font-mono uppercase block mb-1">
                        Peso (kg)
                      </label>
                      <input
                        type="number"
                        step="2.5"
                        value={inputWeight}
                        onChange={(e) => setInputWeight(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-black border border-zinc-700 text-amber-300 font-mono font-bold text-sm focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400 font-mono uppercase block mb-1">
                        Reps Logradas
                      </label>
                      <input
                        type="number"
                        value={inputReps}
                        onChange={(e) => setInputReps(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-black border border-zinc-700 text-white font-mono font-bold text-sm focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400 font-mono uppercase block mb-1">
                        RPE (Esfuerzo)
                      </label>
                      <input
                        type="text"
                        value={inputRpe}
                        onChange={(e) => setInputRpe(e.target.value)}
                        placeholder="ej: 8.5"
                        className="w-full px-3 py-2 rounded-lg bg-black border border-zinc-700 text-white font-mono text-sm focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Botón de Fases de Preparación Neuromuscular (PAP) */}
                <div className="mb-5">
                  <button
                    onClick={() => setShowPrepProtocol(!showPrepProtocol)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-900/70 hover:bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-amber-400 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-400" />
                      <span>Protocolo Neuromuscular (Fases 0 a 4 PAP)</span>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        showPrepProtocol ? "rotate-90" : ""
                      }`}
                    />
                  </button>

                  {/* Detalle Desplegable de Fases Neuromusculares con cálculo de peso */}
                  {showPrepProtocol && (
                    <div className="mt-3 p-3.5 rounded-xl bg-black border border-zinc-800 space-y-2.5">
                      <p className="text-[11px] text-zinc-400 leading-relaxed font-mono">
                        Ejecuta antes de tus series efectivas para reclutar el 100% de tus unidades motoras:
                      </p>
                      <div className="space-y-2">
                        {NEUROMUSCULAR_PHASES.map((phase) => {
                          const phasePresc =
                            activeExMax && phase.percentage > 0
                              ? phase.percentage === 20
                                ? activeExMax.prescriptions.phase_1_activation
                                : phase.percentage === 40
                                ? activeExMax.prescriptions.phase_2_light
                                : phase.percentage === 60
                                ? activeExMax.prescriptions.phase_3_medium
                                : activeExMax.prescriptions.phase_4_pap
                              : null;

                          return (
                            <div
                              key={phase.phase}
                              className="p-2.5 rounded-lg bg-zinc-900/70 border border-zinc-800/80 flex items-center justify-between gap-3 text-xs"
                            >
                              <div>
                                <div className="font-bold text-zinc-200">{phase.name}</div>
                                <div className="text-[11px] text-amber-400/90 font-mono">
                                  {phase.repsCue}{" "}
                                  {phasePresc !== null && (
                                    <span className="text-white font-bold ml-1">
                                      → {phasePresc} kg
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-zinc-400 mt-0.5">{phase.objective}</div>
                              </div>
                              <button
                                onClick={() =>
                                  handleStartTimer(phase.durationSeconds, phase.name)
                                }
                                className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono text-[10px] whitespace-nowrap transition-colors cursor-pointer"
                              >
                                Timer {phase.durationSeconds}s
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* BOTÓN BIO-ERGONÓMICO TRIDIMENSIONAL CON PULSO DORADO */}
                <button
                  onClick={handleCompleteSet}
                  className="w-full py-5 px-6 rounded-2xl bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-black uppercase tracking-widest text-sm transition-all transform active:translate-y-1 active:border-b-0 border-b-4 border-amber-700 shadow-[0_12px_30px_rgba(245,158,11,0.25)] flex items-center justify-center gap-3 cursor-pointer select-none glow-zen-gold"
                >
                  <CheckCircle2 className="w-6 h-6 text-black stroke-[2.5]" />
                  <span>COMPLETAR SERIE Y ENTRAR EN RESÍNTESIS ATP ({activeExercise.restSeconds}s)</span>
                </button>
              </div>

              {/* Lista de Ejercicios del Día */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-900">
                <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-3">
                  Matriz de Ejercicios del Día
                </div>
                <div className="space-y-1.5">
                  {activeDay.exercises.map((ex, idx) => {
                    const isCurrent = idx === activeExerciseIndex;
                    const exMax = maxesMap[ex.name];
                    return (
                      <button
                        key={ex.name}
                        onClick={() => {
                          setActiveExerciseIndex(idx);
                          setCurrentSet(1);
                        }}
                        className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs transition-colors border ${
                          isCurrent
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-300 font-bold"
                            : "bg-zinc-900/30 border-transparent text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="font-mono text-zinc-400 text-[11px]">{idx + 1}.</span>
                          <span className="truncate">{ex.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {exMax && (
                            <span className="text-[10px] font-mono text-amber-400/80 bg-amber-500/10 px-1.5 py-0.5 rounded">
                              TM: {exMax.training_max}k
                            </span>
                          )}
                          <span className="font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                            {ex.sets} × {ex.reps} ({Math.floor(ex.restSeconds / 60)}m)
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </section>

        {/* Right Column: Zen ATP Resynthesis Module */}
        <section className="lg:col-span-6 flex flex-col items-center justify-center p-6 md:p-8 rounded-3xl bg-zinc-950 border border-zinc-900 relative overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between w-full mb-4">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Zap className="w-4 h-4 text-amber-400" /> {timerTitle}
            </div>
            <button
              onClick={() => setZenFocusMode(true)}
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
              title="Pantalla Completa Zen True Black"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Reloj SVG Circular de Resíntesis de ATP */}
          <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center my-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="90"
                stroke="#18181b"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="100"
                cy="100"
                r="90"
                stroke="#f59e0b"
                strokeWidth="7"
                strokeDasharray="565.48"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>

            {/* Digits Display */}
            <div className="absolute flex flex-col items-center justify-center text-center px-4">
              <span className="text-5xl md:text-6xl font-black font-mono text-white tracking-tight">
                {formatTime(remainingSeconds)}
              </span>
              <div className="mt-2 flex flex-col items-center">
                <span className="text-xs font-mono text-amber-400 font-bold">
                  ATP Saturado: {atpSaturationPercent}%
                </span>
                <span className="text-[11px] font-mono text-zinc-400 mt-0.5 uppercase tracking-wider">
                  {isRunning
                    ? "Resíntesis Bioquímica en Curso"
                    : remainingSeconds === 0
                    ? "Saturación Completada (100%)"
                    : "En Pausa"}
                </span>
              </div>
            </div>
          </div>

          {/* Presets de Descanso Mandatorio (3 a 6 minutos) */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {[180, 240, 300, 360].map((duration) => (
              <button
                key={duration}
                onClick={() => handleStartTimer(duration, "Resíntesis de ATP-PCr")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
                  timerDuration === duration
                    ? "bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                {duration / 60}m Mandatorio
              </button>
            ))}
          </div>

          {/* Barra de Controles */}
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlayPause}
              className="p-4 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white transition-all transform active:scale-95 shadow-lg shadow-black cursor-pointer"
              aria-label={isRunning ? "Pausar" : "Reanudar"}
            >
              {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-white" />}
            </button>
            <button
              onClick={handleResetTimer}
              className="p-4 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white transition-all transform active:scale-95 shadow-lg shadow-black cursor-pointer"
              aria-label="Reiniciar"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
            <button
              onClick={playChime}
              className="p-4 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-amber-400 transition-all transform active:scale-95 shadow-lg shadow-black cursor-pointer"
              title="Probar Campana Zen (440Hz)"
              aria-label="Probar sonido"
            >
              <Volume2 className="w-6 h-6" />
            </button>
          </div>
        </section>
      </div>

      {/* --- MODAL MAESTRO DE FUERZA Y PROGRESO (MOTOR 1RM / TM) --- */}
      {showProgressModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-col overflow-hidden shadow-2xl">
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
                      <div className="text-[10px] text-zinc-500">F0 (0%)</div>
                      <div className="font-bold text-zinc-300 mt-1">Movilidad</div>
                      <div className="text-[11px] text-zinc-400 mt-1">0 kg (Libre)</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
                      <div className="text-[10px] text-zinc-500">F1 (20% TM)</div>
                      <div className="font-bold text-zinc-300 mt-1">Activación</div>
                      <div className="text-sm font-bold text-amber-400 mt-1">
                        {currentExMax.prescriptions.phase_1_activation} kg
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
                      <div className="text-[10px] text-zinc-500">F2 (40% TM)</div>
                      <div className="font-bold text-zinc-300 mt-1">Aprox Ligera</div>
                      <div className="text-sm font-bold text-amber-400 mt-1">
                        {currentExMax.prescriptions.phase_2_light} kg
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
                      <div className="text-[10px] text-zinc-500">F3 (60% TM)</div>
                      <div className="font-bold text-zinc-300 mt-1">Aprox Media</div>
                      <div className="text-sm font-bold text-amber-400 mt-1">
                        {currentExMax.prescriptions.phase_3_medium} kg
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
                      <div className="text-[10px] text-zinc-500">F4 (80% TM)</div>
                      <div className="font-bold text-zinc-300 mt-1">Pesada PAP</div>
                      <div className="text-sm font-bold text-amber-400 mt-1">
                        {currentExMax.prescriptions.phase_4_pap} kg
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/40">
                      <div className="text-[10px] text-amber-400 font-bold">F5 (85% TM)</div>
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

      {/* --- MÓDULO ZEN DE AISLAMIENTO VISUAL TRUE BLACK (#000000) --- */}
      {zenFocusMode && (
        <div className="fixed inset-0 z-50 bg-[#000000] flex flex-col items-center justify-between p-6 md:p-12 animate-in fade-in duration-300">
          {/* Barra Superior Minimalista */}
          <div className="w-full max-w-4xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AISLAMIENTO VISUAL NEURO//ZEN</span>
            </div>
            <button
              onClick={() => setZenFocusMode(false)}
              className="px-4 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Minimize2 className="w-4 h-4" />
              <span>Salir del Aislamiento</span>
            </button>
          </div>

          {/* Reloj Masivo Central */}
          <div className="flex flex-col items-center justify-center my-auto">
            <div className="relative w-80 h-80 md:w-96 md:h-96 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  stroke="#121214"
                  strokeWidth="5"
                  fill="transparent"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  stroke="#f59e0b"
                  strokeWidth="5"
                  strokeDasharray="565.48"
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-linear shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-7xl md:text-8xl font-black font-mono text-white tracking-tighter">
                  {formatTime(remainingSeconds)}
                </span>
                <span className="text-sm font-mono text-amber-400 font-bold mt-3">
                  Saturación de ATP: {atpSaturationPercent}%
                </span>
                <span className="text-xs font-mono text-zinc-400 mt-1 uppercase tracking-widest">
                  {isRunning ? "Resíntesis en Silencio" : "Pausa"}
                </span>
              </div>
            </div>

            {/* Controles Zen Flotantes */}
            <div className="flex items-center gap-5 mt-8">
              <button
                onClick={togglePlayPause}
                className="p-4 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 text-white transition-all transform active:scale-95 cursor-pointer"
              >
                {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-white" />}
              </button>
              <button
                onClick={handleResetTimer}
                className="p-4 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white transition-all transform active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-6 h-6" />
              </button>
              <button
                onClick={playChime}
                className="p-4 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-amber-400 transition-all transform active:scale-95 cursor-pointer"
                title="Campana 440Hz"
              >
                <Volume2 className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Recordatorio Fisiológico Inferior */}
          <div className="text-center text-xs font-mono text-zinc-400 max-w-md">
            El sistema fosfágeno requiere entre 3 y 5 minutos para restaurar el 98% del ATP intracelular. Respira y mantén el foco.
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full max-w-6xl border-t border-zinc-900 pt-5 mt-8 flex flex-col md:flex-row items-center justify-between text-xs text-zinc-400 font-mono gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Arquitectura limpia: Frontend desacoplado HTTP + FastAPI Core</span>
        </div>
        <div>NEURO//STRENGTH // High Performance Framework</div>
      </footer>
    </main>
  );
}
