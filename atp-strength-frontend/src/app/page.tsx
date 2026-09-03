"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";
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
  TrendingUp,
  X,
  Save,
  Dumbbell,
  History,
  Calculator,
  Minus,
  Plus,
  ChevronDown,
  ChevronUp,
  Settings2
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

// --- Motor de Cálculo Fisiológico Puro (1RM, TM y Prescripciones por Fase) ---
function computeMetrics(
  exerciseName: string,
  weight: number,
  reps: number,
  formula: string = "epley",
  notes: string = ""
): ExerciseMaxData {
  const w = Math.max(0, weight);
  const r = Math.max(1, reps);
  let oneRm = w;
  if (r > 1) {
    if (formula === "brzycki") {
      oneRm = r < 37 ? w * (36 / (37 - r)) : w;
    } else {
      oneRm = w * (1 + r / 30);
    }
  }
  oneRm = Math.round(oneRm * 10) / 10;
  const trainingMax = Math.round(oneRm * 0.9 * 10) / 10; // 90% TM
  const round25 = (val: number) => Math.max(0, Math.round(val / 2.5) * 2.5);

  return {
    id: Date.now(),
    exercise_name: exerciseName,
    one_rep_max: oneRm,
    training_max: trainingMax,
    formula,
    lifted_weight: w,
    reps_performed: r,
    notes,
    prescriptions: {
      phase_1_activation: Math.max(20, round25(trainingMax * 0.2)),
      phase_2_light: round25(trainingMax * 0.4),
      phase_3_medium: round25(trainingMax * 0.6),
      phase_4_pap: round25(trainingMax * 0.8),
      phase_5_work: round25(trainingMax * 0.85),
    },
  };
}

const DEFAULT_BASE_MAXES: { [key: string]: { weight: number; reps: number } } = {
  "Sentadilla Trasera": { weight: 100, reps: 5 },
  "Press de Banca": { weight: 80, reps: 5 },
  "Press Militar": { weight: 50, reps: 5 },
  "Fondos en Paralelas": { weight: 80, reps: 5 },
  "Peso Muerto Convencional": { weight: 130, reps: 3 },
  "Dominadas Lastradas": { weight: 80, reps: 5 },
  "Remo Pendlay": { weight: 70, reps: 5 },
  "Peso Muerto Rumano": { weight: 90, reps: 5 },
  "Paseo del Granjero Pesado": { weight: 60, reps: 5 },
  "Sentadilla Trasera Técnica": { weight: 90, reps: 3 },
  "Curl Bíceps Barra Z": { weight: 35, reps: 5 },
  "Elevaciones Piernas a la Barra": { weight: 0, reps: 8 },
};

function getBaselineMaxes(): { [key: string]: ExerciseMaxData } {
  const base: { [key: string]: ExerciseMaxData } = {};
  Object.entries(DEFAULT_BASE_MAXES).forEach(([name, def]) => {
    base[name] = computeMetrics(name, def.weight, def.reps);
  });
  return base;
}

export default function ZenDashboard() {
  const [selectedDayKey, setSelectedDayKey] = useState<string>("DAY_A");
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number>(0);
  const [currentSet, setCurrentSet] = useState<number>(1);
  const [completedSetsMap, setCompletedSetsMap] = useState<{ [exerciseName: string]: number[] }>({});
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

  // Telemetría de Cargas y 1RM (con inicialización garantizada y offline-first)
  const [maxesMap, setMaxesMap] = useState<{ [key: string]: ExerciseMaxData }>(getBaselineMaxes);
  const [selectedProgressEx, setSelectedProgressEx] = useState<string>("Sentadilla Trasera");
  const [inputWeight, setInputWeight] = useState<string>("90");
  const [inputReps, setInputReps] = useState<string>("3");
  const [inputRpe, setInputRpe] = useState<string>("8.5");

  // Calibración Rápida en Vivo en la tarjeta del ejercicio
  const [quickWeight, setQuickWeight] = useState<string>("100");
  const [quickReps, setQuickReps] = useState<string>("5");
  const [showQuickCalibration, setShowQuickCalibration] = useState<boolean>(false);

  // Formulario de Nueva Marca 1RM en Modal
  const [formFormula, setFormFormula] = useState<string>("epley");
  const [formWeight, setFormWeight] = useState<string>("100");
  const [formReps, setFormReps] = useState<string>("5");
  const [formNotes, setFormNotes] = useState<string>("");
  const [isSavingMax, setIsSavingMax] = useState<boolean>(false);

  // Historial del ejercicio en modal
  const [exerciseHistory, setExerciseHistory] = useState<HistoryItem[]>([]);

  const activeDay = SCHEDULE_DAYS.find((d) => d.key === selectedDayKey) || SCHEDULE_DAYS[0];
  const activeExercise = activeDay.exercises[activeExerciseIndex] || activeDay.exercises[0];
  const activeExMax = activeExercise ? (maxesMap[activeExercise.name] || computeMetrics(activeExercise.name, 80, 5)) : null;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Cargar caché local en el cliente
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("neuro_strength_maxes");
        if (saved) {
          const parsed = JSON.parse(saved);
          setMaxesMap((prev) => ({ ...prev, ...parsed }));
        }
      } catch (err) {
        console.warn("Error leyendo localStorage de maxes:", err);
      }
    }
  }, []);

  // Cargar Maxes desde el Backend FastAPI
  const fetchMaxes = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/api/strength/maxes`);
      if (res.ok) {
        const data: ExerciseMaxData[] = await res.json();
        const map: { [key: string]: ExerciseMaxData } = {};
        data.forEach((item) => {
          map[item.exercise_name] = item;
        });
        setMaxesMap((prev) => {
          const merged = { ...prev, ...map };
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("neuro_strength_maxes", JSON.stringify(merged));
            } catch {}
          }
          return merged;
        });
      }
    } catch {
      // Offline silencioso
    }
  }, [apiUrl]);

  // Cargar Historial para el modal
  const fetchHistory = useCallback(async (exName: string) => {
    try {
      const res = await fetch(`${apiUrl}/api/strength/history?exercise_name=${encodeURIComponent(exName)}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setExerciseHistory(data);
      }
    } catch {
      setExerciseHistory([]);
    }
  }, [apiUrl]);

  // Sincronizar calibrador en vivo y carga sugerida al cambiar de ejercicio
  useEffect(() => {
    if (activeExercise) {
      const exMax = maxesMap[activeExercise.name] || computeMetrics(activeExercise.name, 80, 5);
      setQuickWeight(exMax.lifted_weight ? exMax.lifted_weight.toString() : "80");
      setQuickReps(exMax.reps_performed ? exMax.reps_performed.toString() : "5");
      if (exMax.prescriptions.phase_5_work > 0) {
        setInputWeight(exMax.prescriptions.phase_5_work.toString());
      }
      const parsedReps = parseInt(activeExercise.reps) || 3;
      setInputReps(parsedReps.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeExerciseIndex, selectedDayKey]);

  // Calibración Rápida Inmediata: recalcula al instante y sincroniza
  const handleUpdateQuickMax = (wStr: string, rStr: string) => {
    const w = parseFloat(wStr) || 0;
    const r = parseInt(rStr) || 1;
    if (w <= 0 || !activeExercise) return;

    const updated = computeMetrics(activeExercise.name, w, r, "epley");
    setMaxesMap((prev) => {
      const next = { ...prev, [activeExercise.name]: updated };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("neuro_strength_maxes", JSON.stringify(next));
        } catch {}
      }
      return next;
    });

    setInputWeight(updated.prescriptions.phase_5_work.toString());

    if (backendOnline) {
      fetch(`${apiUrl}/api/strength/maxes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise_name: activeExercise.name,
          lifted_weight: w,
          reps_performed: r,
          formula: "epley",
          notes: "Calibración en vivo",
        }),
      }).catch((err) => console.warn("Sync err:", err));
    }
  };

  useEffect(() => {
    fetchMaxes();
  }, [fetchMaxes]);

  useEffect(() => {
    if (showProgressModal) {
      fetchHistory(selectedProgressEx);
    }
  }, [selectedProgressEx, showProgressModal, fetchHistory]);

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

  // Botón Bio-Ergonómico 3D: Completar Serie con Carga Real y Lanzar Resíntesis Zen
  const handleCompleteSet = async (targetSet?: number) => {
    const setToFinish = targetSet !== undefined ? targetSet : currentSet;

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([40, 60, 40]);
    }

    // Registrar serie completada en mapa de sesión
    setCompletedSetsMap((prev) => {
      const list = prev[activeExercise.name] || [];
      if (!list.includes(setToFinish)) {
        return { ...prev, [activeExercise.name]: [...list, setToFinish] };
      }
      return prev;
    });

    const restTime = activeExercise.restSeconds || 180;
    handleStartTimer(restTime, `Descanso ATP: ${activeExercise.name}`);
    
    // Abrir automáticamente la pantalla de resíntesis Zen al entrar en el paso
    setZenFocusMode(true);

    const numericWeight = parseFloat(inputWeight) || (activeExMax?.prescriptions.phase_5_work ?? 0);
    const numericReps = parseInt(inputReps) || parseInt(activeExercise.reps) || 3;

    if (setToFinish < activeExercise.sets) {
      setCurrentSet(setToFinish + 1);
    } else {
      if (activeExerciseIndex < activeDay.exercises.length - 1) {
        setActiveExerciseIndex(activeExerciseIndex + 1);
        setCurrentSet(1);
      }
    }

    // Persistir ejecución en Backend Python FastAPI -> PostgreSQL si está online
    if (backendOnline) {
      try {
        await fetch(`${apiUrl}/api/state/log-set`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exercise_name: activeExercise.name,
            set_number: setToFinish,
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

  // Guardar Marca de 1RM (instantáneo local + sincro backend)
  const handleSaveMax = async () => {
    const w = parseFloat(formWeight);
    const r = parseInt(formReps);
    if (!w || w <= 0 || !r || r <= 0) return;

    setIsSavingMax(true);
    const updated = computeMetrics(selectedProgressEx, w, r, formFormula, formNotes);
    setMaxesMap((prev) => {
      const next = { ...prev, [selectedProgressEx]: updated };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("neuro_strength_maxes", JSON.stringify(next));
        } catch {}
      }
      return next;
    });

    if (activeExercise && activeExercise.name === selectedProgressEx) {
      setInputWeight(updated.prescriptions.phase_5_work.toString());
      setQuickWeight(w.toString());
      setQuickReps(r.toString());
    }

    try {
      if (backendOnline) {
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
          await fetchHistory(selectedProgressEx);
        }
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

          {/* Botón Aislamiento Zen Desktop */}
          <button
            onClick={() => setZenFocusMode(true)}
            className="hidden md:flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 text-xs font-mono text-zinc-300 hover:text-amber-400 transition-all cursor-pointer"
            title="Aislamiento Visual True Black"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Aislamiento Zen</span>
          </button>

          {/* Backend Connectivity Status */}
          <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono flex-shrink-0">
            <Server className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-400 hidden sm:inline">FastAPI:</span>
            {backendOnline === null ? (
              <span className="text-zinc-500">...</span>
            ) : backendOnline ? (
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                En Línea
              </span>
            ) : (
              <span className="flex items-center gap-1 text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span>
                Off
              </span>
            )}
          </div>
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
              {/* Tarjeta del Ejercicio con Sistema Guiado Paso a Paso */}
              <div className="p-5 sm:p-6 rounded-3xl bg-zinc-950 border border-zinc-900 shadow-2xl space-y-5">
                {/* Header del Ejercicio Activo */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-zinc-400 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-amber-400" /> EJERCICIO EN EJECUCIÓN
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">
                      {activeExerciseIndex + 1} de {activeDay.exercises.length}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-1">
                    <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      {activeExercise.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowQuickCalibration(!showQuickCalibration)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-xs font-mono text-zinc-300 hover:text-white transition-all cursor-pointer"
                        title="Ajustar peso base o repeticiones de test"
                      >
                        <Settings2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Ajustar 1RM</span>
                        {showQuickCalibration ? (
                          <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProgressEx(activeExercise.name);
                          setShowProgressModal(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-mono font-bold text-amber-300 transition-all active:scale-95 cursor-pointer"
                        title="Ver historial de fuerza y motor completo"
                      >
                        <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                        <span>1RM: {activeExMax?.one_rep_max ?? 0} kg</span>
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

                {/* 🎯 HERO DE INSTRUCCIÓN EXACTA (LO QUE TIENES QUE HACER AHORA MISMO) */}
                {(() => {
                  const targetWeight = parseFloat(inputWeight) || (activeExMax?.prescriptions.phase_5_work ?? 0);
                  const targetReps = parseInt(inputReps) || (parseInt(activeExercise.reps) || 3);
                  const platePerSide = Math.max(0, Math.round(((targetWeight - 20) / 2) * 10) / 10);

                  return (
                    <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border-2 border-amber-500/60 shadow-[0_0_40px_rgba(245,158,11,0.2)] relative overflow-hidden">
                      {/* Estado del Paso */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
                          </span>
                          <span className="font-mono text-xs font-black uppercase tracking-wider text-amber-400">
                            PASO ACTUAL: SERIE {currentSet} DE {activeExercise.sets}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900/90 px-3 py-1 rounded-full border border-zinc-800">
                          ⏱️ Descanso: {Math.floor(activeExercise.restSeconds / 60)} min
                        </span>
                      </div>

                      {/* INSTRUCCIÓN EXACTA: PESO Y REPETICIONES */}
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 my-2 p-4 sm:p-5 rounded-2xl bg-black/90 border border-zinc-800 text-center">
                        <div>
                          <div className="text-[10px] sm:text-xs font-mono text-zinc-400 uppercase tracking-wider font-bold">
                            TIENES QUE LEVANTAR:
                          </div>
                          <div className="text-3xl sm:text-5xl font-black font-mono text-amber-400 tracking-tight mt-1 flex items-baseline justify-center gap-1">
                            <span>{targetWeight}</span>
                            <span className="text-sm sm:text-base text-amber-400/70 font-bold">kg</span>
                          </div>

                          {/* Ajuste Rápido de Kilos */}
                          <div className="flex items-center justify-center gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => {
                                const newVal = Math.max(0, targetWeight - 2.5);
                                setInputWeight(newVal.toString());
                              }}
                              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                              title="Bajar 2.5 kg"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[10px] font-mono text-zinc-400">2.5 kg</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newVal = targetWeight + 2.5;
                                setInputWeight(newVal.toString());
                              }}
                              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                              title="Subir 2.5 kg"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] sm:text-xs font-mono text-zinc-400 uppercase tracking-wider font-bold">
                            REPETICIONES A HACER:
                          </div>
                          <div className="text-3xl sm:text-5xl font-black font-mono text-white tracking-tight mt-1 flex items-baseline justify-center gap-1">
                            <span>{targetReps}</span>
                            <span className="text-sm sm:text-base text-zinc-400 font-bold">reps</span>
                          </div>

                          {/* Ajuste Rápido de Reps */}
                          <div className="flex items-center justify-center gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => {
                                const newVal = Math.max(1, targetReps - 1);
                                setInputReps(newVal.toString());
                              }}
                              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                              title="Menos 1 rep"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[10px] font-mono text-zinc-400">1 rep</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newVal = targetReps + 1;
                                setInputReps(newVal.toString());
                              }}
                              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                              title="Más 1 rep"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Montaje de la Barra y RPE */}
                      <div className="flex flex-col sm:flex-row items-center justify-between text-xs font-mono px-3 py-2 text-zinc-400 bg-zinc-900/60 rounded-xl border border-zinc-800/80 gap-2 mt-3">
                        <span className="flex items-center gap-1.5">
                          <Dumbbell className="w-4 h-4 text-amber-400 flex-shrink-0" />
                          <span>
                            Montaje: Barra olímpica (20 kg) + <strong className="text-white">{platePerSide} kg</strong> a cada lado
                          </span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500">RPE Esfuerzo:</span>
                          <input
                            type="text"
                            value={inputRpe}
                            onChange={(e) => setInputRpe(e.target.value)}
                            placeholder="8.5"
                            className="w-14 px-2 py-0.5 rounded bg-black border border-zinc-700 text-amber-400 text-center font-mono text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      {/* Botón Principal Bio-Ergonómico: Completar Serie & Abrir Descanso Zen */}
                      <button
                        onClick={() => handleCompleteSet()}
                        className="w-full mt-4 py-4 sm:py-5 px-6 rounded-2xl bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-black uppercase tracking-wider text-xs sm:text-sm transition-all transform active:translate-y-0.5 border-b-4 border-amber-700 shadow-[0_12px_28px_rgba(245,158,11,0.3)] flex items-center justify-center gap-3 cursor-pointer select-none glow-zen-gold"
                      >
                        <CheckCircle2 className="w-5 h-5 text-black stroke-[3] flex-shrink-0" />
                        <span>¡SERIE {currentSet} REALIZADA! → ENTRAR EN DESCANSO ATP</span>
                      </button>
                    </div>
                  );
                })()}

                {/* 📋 HOJA DE RUTA COMPLETA: GUÍA PASO A PASO DEL EJERCICIO */}
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-white uppercase flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-amber-400" /> HOJA DE RUTA: TODAS LAS SERIES Y PESOS
                    </span>
                    <span className="text-[10px] text-zinc-500">Guía secuencial completa</span>
                  </div>

                  {/* 1. Fases de Calentamiento / Aclimatación SNC (F1 a F4) */}
                  <div>
                    <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-2">
                      Fases Previas de Aclimatación SNC (Calentamiento neuromuscular):
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono text-xs">
                      <div className="p-2.5 rounded-xl bg-black border border-zinc-800">
                        <div className="text-[10px] text-zinc-500">F1 (20% TM)</div>
                        <div className="text-[11px] text-zinc-300">10 reps</div>
                        <div className="text-sm font-black text-amber-400 mt-0.5">
                          {activeExMax?.prescriptions.phase_1_activation ?? 20} kg
                        </div>
                        <div className="text-[9px] text-zinc-500 mt-0.5">Barra vacía</div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-black border border-zinc-800">
                        <div className="text-[10px] text-zinc-500">F2 (40% TM)</div>
                        <div className="text-[11px] text-zinc-300">5 reps</div>
                        <div className="text-sm font-black text-amber-400 mt-0.5">
                          {activeExMax?.prescriptions.phase_2_light ?? 0} kg
                        </div>
                        <div className="text-[9px] text-zinc-500 mt-0.5">Aproximación</div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-black border border-zinc-800">
                        <div className="text-[10px] text-zinc-500">F3 (60% TM)</div>
                        <div className="text-[11px] text-zinc-300">3 reps</div>
                        <div className="text-sm font-black text-amber-400 mt-0.5">
                          {activeExMax?.prescriptions.phase_3_medium ?? 0} kg
                        </div>
                        <div className="text-[9px] text-zinc-500 mt-0.5">Aproximación</div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-black border border-zinc-800">
                        <div className="text-[10px] text-amber-400 font-bold">F4 (80% PAP)</div>
                        <div className="text-[11px] text-zinc-300">1 rep pesada</div>
                        <div className="text-sm font-black text-amber-300 mt-0.5">
                          {activeExMax?.prescriptions.phase_4_pap ?? 0} kg
                        </div>
                        <div className="text-[9px] text-amber-400/80 mt-0.5">Potenciación</div>
                      </div>
                    </div>
                  </div>

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
                        const isCurrent = currentSet === sNum && !isDone;
                        const targetKg = activeExMax?.prescriptions.phase_5_work ?? 0;

                        return (
                          <div
                            key={sNum}
                            className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                              isDone
                                ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-300"
                                : isCurrent
                                ? "bg-amber-500/10 border-amber-500 text-white shadow-lg shadow-amber-500/10"
                                : "bg-black/60 border-zinc-800/80 text-zinc-400"
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
                                  onClick={() => handleCompleteSet(sNum)}
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

          {/* Guía Fisiológica de las Fases ATP */}
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-900 shadow-2xl">
            <div className="flex items-center justify-between mb-3 text-xs font-mono">
              <span className="text-zinc-300 font-bold uppercase flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" /> GUÍA DE ACLIMATACIÓN SNC
              </span>
              <button
                onClick={() => setShowPrepProtocol(!showPrepProtocol)}
                className="text-[11px] text-amber-400 hover:underline cursor-pointer"
              >
                {showPrepProtocol ? "Ocultar" : "Ver Detalle"}
              </button>
            </div>

            <p className="text-xs text-zinc-400 font-mono leading-relaxed mb-3">
              Las fases F1 a F4 aclimantan las motoneuronas alfa y la tensión tendinosa sin fatiga metabólica, preparando al SNC para la carga efectiva (F5).
            </p>

            {showPrepProtocol && (
              <div className="space-y-2 text-xs font-mono">
                {NEUROMUSCULAR_PHASES.map((p) => (
                  <div key={p.phase} className="p-2.5 rounded-lg bg-black border border-zinc-800">
                    <div className="font-bold text-zinc-300">{p.name}</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">{p.objective}</div>
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
              <span>
                {timerTitle.toUpperCase()} • {activeExercise.name.toUpperCase()} (SERIE {currentSet > 1 ? currentSet - 1 : 1} COMPLETADA)
              </span>
            </div>
            <button
              onClick={() => setZenFocusMode(false)}
              className="px-4 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Minimize2 className="w-4 h-4" />
              <span>Cerrar</span>
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
                  {isRunning ? "Resíntesis en Silencio" : remainingSeconds === 0 ? "¡ATP 100% Recuperado!" : "Pausa"}
                </span>
              </div>
            </div>

            {/* Botón de Salida Rápida para Levantar */}
            <button
              onClick={() => setZenFocusMode(false)}
              className="mt-6 px-8 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-mono font-black text-xs sm:text-sm tracking-wider uppercase transition-all shadow-xl shadow-amber-400/20 active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>
                LISTO PARA LEVANTAR → PASAR A SERIE {currentSet} ({activeExMax?.prescriptions.phase_5_work ?? 0} kg × {activeExercise.reps})
              </span>
            </button>

            {/* Controles Zen Flotantes */}
            <div className="flex items-center gap-5 mt-6">
              <button
                onClick={togglePlayPause}
                className="p-4 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 text-white transition-all transform active:scale-95 cursor-pointer"
                title={isRunning ? "Pausar" : "Reanudar"}
              >
                {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-white" />}
              </button>
              <button
                onClick={handleResetTimer}
                className="p-4 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white transition-all transform active:scale-95 cursor-pointer"
                title="Reiniciar descanso"
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

      {/* Barra Móvil Inferior Fija: acceso 100% permanente a Progreso de Fuerza */}
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
          onClick={() => setShowPrepProtocol(true)}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-mono active:scale-95 transition-all cursor-pointer"
          title="Fases de Preparación Neuromuscular"
        >
          <Layers className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>F0-F4</span>
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
