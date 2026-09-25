"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Zap,
  Dumbbell,
  Clock,
  Check,
  RotateCcw,
  Sparkles,
  Info,
  X,
  Play,
  Pause,
  ChevronRight,
  Flame,
  Activity,
  Layers,
  Save,
  Copy,
  Search,
  Filter,
  Shield
} from "lucide-react";
import { BarbellPlateVisualizer } from "./BarbellPlateVisualizer";
import { playChime, playTactileClick } from "@/lib/zenAudio";

export interface UniversalProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTimer?: (seconds: number, title: string) => void;
}

type EquipmentType = "barbell" | "dumbbell" | "machine";
type GoalType = "strength" | "hypertrophy" | "volume";

interface ProtocolStep {
  id: string;
  phase: "warmup" | "activation" | "effective";
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  percent: number;
  weightKg: number;
  reps: number;
  repsLabel: string;
  restSeconds: number;
  isEffective?: boolean;
}

interface ExerciseItem {
  name: string;
  shortName: string;
  defaultPr: number;
  equipment: EquipmentType;
  isOlympic?: boolean;
  description?: string;
}

interface ExerciseCategoryGroup {
  id: "all" | "banca" | "potencia" | "fuerza" | "maquinas";
  name: string;
  icon: string;
  badgeColor: string;
  exercises: ExerciseItem[];
}

const CATEGORIZED_EXERCISES: ExerciseCategoryGroup[] = [
  {
    id: "banca",
    name: "ARSENAL DE BANCA",
    icon: "🛡️",
    badgeColor: "border-red-500/40 bg-red-500/10 text-red-300",
    exercises: [
      { name: "Press de Banca Plano", shortName: "Banca Plano", defaultPr: 100, equipment: "barbell", description: "El estándar absoluto de fuerza horizontal de empuje." },
      { name: "Press de Banca con Agarre Estrecho", shortName: "Banca Estrecha", defaultPr: 85, equipment: "barbell", description: "Máxima sobrecarga en tríceps y fuerza terminal de bloqueo." },
      { name: "Spoto Press (Pausa en el Aire 2cm)", shortName: "Spoto Press", defaultPr: 90, equipment: "barbell", description: "Pausa isométrica estricta sin tocar el pecho. Tensión barométrica pura." },
      { name: "Floor Press con Barra (Press de Piso)", shortName: "Floor Press", defaultPr: 95, equipment: "barbell", description: "Elimina el rebote de piernas (leg drive); aísla empuje puro de tríceps y pectoral." },
      { name: "Pin Press en Jaula (Anderson Press)", shortName: "Pin Press", defaultPr: 105, equipment: "barbell", description: "Salida concéntrica muerta desde los soportes; anula ciclo estiramiento-acortamiento." },
      { name: "Larsen Press (Banca sin Leg Drive)", shortName: "Larsen Press", defaultPr: 90, equipment: "barbell", description: "Piernas extendidas en el aire; erradica el leg drive y maximiza estabilización torácica." },
      { name: "Board Press (Press con Tabla 2-Board)", shortName: "Board Press", defaultPr: 110, equipment: "barbell", description: "Sobrecarga supra-máxima en el rango terminal de bloqueo de tríceps." },
      { name: "Slingshot Bench Press (Sobrecarga)", shortName: "Slingshot Bench", defaultPr: 115, equipment: "barbell", description: "Asistencia elástica en el pecho que permite mover 10-15% más de carga real." },
      { name: "Press de Banca con Pausa Larga (3 Segundos)", shortName: "Banca Pausa 3s", defaultPr: 92.5, equipment: "barbell", description: "3 segundos inmóviles sobre el esternón; erradica el reflejo elástico miotático." },
      { name: "JM Press con Barra (Fuerza de Tríceps)", shortName: "JM Press", defaultPr: 70, equipment: "barbell", description: "Híbrido legendario press/extensión de Westside Barbell para fuerza bruta de tríceps." },
      { name: "Press de Banca Dinámico / Speed Bench", shortName: "Speed Bench", defaultPr: 60, equipment: "barbell", isOlympic: true, description: "Velocidad explosiva sub-máxima con máxima aceleración compensatoria." },
      { name: "Press de Banca Inclinado con Barra", shortName: "Banca Inclinada", defaultPr: 80, equipment: "barbell", description: "Énfasis masivo en haz clavicular y deltoides anterior." },
      { name: "Press de Banca con Agarre Ancho", shortName: "Banca Ancha", defaultPr: 95, equipment: "barbell", description: "ROM acortado con máximo estiramiento y reclutamiento pectoral." },
      { name: "Press de Banca Declinado con Barra", shortName: "Banca Declinada", defaultPr: 105, equipment: "barbell", description: "Vector descendente que permite máxima carga en pectoral inferior." },
      { name: "Press de Banca con Agarre Invertido", shortName: "Banca Invertida", defaultPr: 75, equipment: "barbell", description: "Menor estrés glenohumeral con brutal activación clavicular." },
      { name: "Press con Barra Camber / Arqueada", shortName: "Cambered Bench", defaultPr: 85, equipment: "barbell", description: "Rango de recorrido extendido por debajo del plano torácico." },
      { name: "Swiss Bar / Multi-Grip Bar Press", shortName: "Swiss Bar Bench", defaultPr: 90, equipment: "barbell", description: "Agarre neutro ergonómico para sobrecarga en tríceps y protección del manguito." },
      { name: "Press Plano con Mancuernas Pesadas", shortName: "Banca Mancuernas", defaultPr: 40, equipment: "dumbbell", description: "Convergencia natural y activación estabilizadora de hombro." },
      { name: "Press Inclinado con Mancuernas", shortName: "Inc. Mancuernas", defaultPr: 36, equipment: "dumbbell", description: "Recorrido libre de muñeca con alta tensión clavicular." },
      { name: "Press Declinado con Mancuernas", shortName: "Dec. Mancuernas", defaultPr: 38, equipment: "dumbbell", description: "Aislamiento denso del haz costal sin bloqueo axial." },
    ]
  },
  {
    id: "potencia",
    name: "POTENCIA & OLÍMPICO",
    icon: "⚡",
    badgeColor: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    exercises: [
      { name: "Power Clean (Cargada de Potencia)", shortName: "Power Clean", defaultPr: 85, equipment: "barbell", isOlympic: true, description: "Potencia triple extensión y velocidad de recepción." },
      { name: "Hang Power Clean (Cargada Colgada)", shortName: "Hang Clean", defaultPr: 80, equipment: "barbell", isOlympic: true, description: "Explosión desde rodillas con aceleración violenta." },
      { name: "Muscle Clean (Cargada de Fuerza Estricta)", shortName: "Muscle Clean", defaultPr: 70, equipment: "barbell", isOlympic: true, description: "Tirón vertical puro sin flexión articular de amortiguación." },
      { name: "Clean & Jerk Completo (Dos Tiempos)", shortName: "Clean & Jerk", defaultPr: 95, equipment: "barbell", isOlympic: true, description: "El levantamiento rey de la potencia olímpica global." },
      { name: "Power Snatch (Arrancada de Potencia)", shortName: "Power Snatch", defaultPr: 65, equipment: "barbell", isOlympic: true, description: "Tasa máxima de desarrollo de fuerza (RFD)." },
      { name: "Hang Power Snatch (Arrancada Colgada)", shortName: "Hang Snatch", defaultPr: 60, equipment: "barbell", isOlympic: true, description: "Velocidad pura y posicionamiento articular óptimo." },
      { name: "Muscle Snatch (Arrancada de Fuerza)", shortName: "Muscle Snatch", defaultPr: 50, equipment: "barbell", isOlympic: true, description: "Aceleración vertical estricta sin meterse debajo de la barra." },
      { name: "Snatch Completo (Arrancada Olímpica)", shortName: "Snatch Completo", defaultPr: 70, equipment: "barbell", isOlympic: true, description: "La máxima expresión de velocidad, movilidad y fuerza vertical." },
      { name: "Push Press (Press de Empuje)", shortName: "Push Press", defaultPr: 80, equipment: "barbell", isOlympic: true, description: "Transferencia de piernas a tren superior en 0.4s." },
      { name: "Power Jerk (Envión de Potencia)", shortName: "Power Jerk", defaultPr: 85, equipment: "barbell", isOlympic: true, description: "Bloqueo cenital violento con resíntesis anaeróbica." },
      { name: "Split Jerk (Envión en Tijera)", shortName: "Split Jerk", defaultPr: 90, equipment: "barbell", isOlympic: true, description: "Recepción olímpica profunda bajo la barra con estabilidad." },
      { name: "Push Jerk / Squat Jerk", shortName: "Squat Jerk", defaultPr: 85, equipment: "barbell", isOlympic: true, description: "Recepción de envión en flexión profunda de rodillas." },
      { name: "Clean High Pull (Tirón Alto de Cargada)", shortName: "Clean High Pull", defaultPr: 105, equipment: "barbell", isOlympic: true, description: "Sobrecarga supra-máxima de potencia en cadena posterior." },
      { name: "Snatch High Pull (Tirón Alto de Arrancada)", shortName: "Snatch High Pull", defaultPr: 85, equipment: "barbell", isOlympic: true, description: "Tirón vertical agresivo sin recepción articular." },
      { name: "Clean Pull desde Bloques", shortName: "Clean Pull Bloques", defaultPr: 115, equipment: "barbell", isOlympic: true, description: "Sobrecarga de triple extensión concéntrica desde altura de rodilla." },
      { name: "Snatch Pull desde Bloques", shortName: "Snatch Pull Bloques", defaultPr: 95, equipment: "barbell", isOlympic: true, description: "Aceleración terminal del tirón de arrancada." },
      { name: "Sentadilla con Salto con Barra (Barbell Jump)", shortName: "Jump Squat Barra", defaultPr: 45, equipment: "barbell", isOlympic: true, description: "Balística pura con aceleración continua en fase de despegue." },
      { name: "Salto con Trap Bar (Trap Bar Jump)", shortName: "Trap Bar Jump", defaultPr: 55, equipment: "barbell", isOlympic: true, description: "Pico de vatios (watts) en despegue vertical neutro." },
      { name: "Kettlebell Swing Pesado de Potencia", shortName: "KB Swing Pesado", defaultPr: 40, equipment: "dumbbell", isOlympic: true, description: "Bisagra balística de cadera con máxima contracción glútea." },
      { name: "Slam Ball Balístico con Balón Medicinal", shortName: "Slam Ball", defaultPr: 25, equipment: "dumbbell", isOlympic: true, description: "Fuerza explosiva de flexión de tronco sin deceleración terminal." },
    ]
  },
  {
    id: "fuerza",
    name: "FUERZA PURA & BÁSICOS",
    icon: "🏋️",
    badgeColor: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    exercises: [
      { name: "Sentadilla Trasera", shortName: "Sentadilla Trasera", defaultPr: 130, equipment: "barbell", description: "El rey indiscutible de la fuerza absoluta de piernas." },
      { name: "Sentadilla con Pausa (3s en el Pozo)", shortName: "Sentadilla Pausa", defaultPr: 115, equipment: "barbell", description: "Anula el reflejo miotático; genera fuerza concéntrica pura desde la inmovilidad." },
      { name: "Sentadilla Frontal (Front Squat)", shortName: "Sentadilla Frontal", defaultPr: 100, equipment: "barbell", description: "Torso vertical estricto con brutal reclutamiento de cuádriceps y core." },
      { name: "Box Squat (Sentadilla a Cajón)", shortName: "Box Squat", defaultPr: 125, equipment: "barbell", description: "Rotura de la energía elástica miotática; arranque concéntrico puro de cadera." },
      { name: "Pin Squat (Anderson Squat desde Soportes)", shortName: "Pin Squat", defaultPr: 115, equipment: "barbell", description: "Salida concéntrica sin rebote excéntrico desde el punto más bajo." },
      { name: "Sentadilla Zercher (En el Pliegue del Codo)", shortName: "Sentadilla Zercher", defaultPr: 95, equipment: "barbell", description: "Fuerza salvaje de pared abdominal, romboides y flexores de cadera." },
      { name: "Safety Squat Bar (Barra SSB)", shortName: "SSB Squat", defaultPr: 120, equipment: "barbell", description: "Sobrecarga en extensores torácicos protegiendo hombros y codos." },
      { name: "Peso Muerto Convencional", shortName: "Peso Muerto", defaultPr: 160, equipment: "barbell", description: "Reclutamiento total del sistema nervioso central." },
      { name: "Peso Muerto Sumo", shortName: "Deadlift Sumo", defaultPr: 155, equipment: "barbell", description: "Postura ancha, menor brazo de momento lumbar y alto empuje de cadera." },
      { name: "Trap Bar Deadlift Pesado (Hex Bar)", shortName: "Trap Bar Deadlift", defaultPr: 170, equipment: "barbell", description: "Vector neutro de empuje con máxima capacidad de carga y menor estrés de cizalla." },
      { name: "Rack Pulls / Block Pulls (Desde Bloques)", shortName: "Rack Pulls", defaultPr: 180, equipment: "barbell", description: "Sobrecarga supra-máxima en la fase final de bloqueo y espalda alta." },
      { name: "Peso Muerto con Déficit (Deficit Deadlift)", shortName: "Deadlift Déficit", defaultPr: 140, equipment: "barbell", description: "Rango extendido para erradicar puntos de estancamiento en el despegue." },
      { name: "Peso Muerto Snatch Grip (Agarre Ancho)", shortName: "Deadlift Snatch Grip", defaultPr: 135, equipment: "barbell", description: "Recorrido colosal con activación masiva de trapecios, romboides e isquios." },
      { name: "Peso Muerto Rumano Pesado", shortName: "Peso Muerto Rumano", defaultPr: 115, equipment: "barbell", description: "Tensión excéntrica profunda en isquios y glúteos." },
      { name: "Good Mornings Pesados con Barra", shortName: "Good Mornings", defaultPr: 80, equipment: "barbell", description: "Fuerza isométrica y dinámica de los erectores espinales y cadena posterior." },
      { name: "Press Militar Estricto (OHP)", shortName: "Press Militar", defaultPr: 65, equipment: "barbell", description: "Fuerza vertical estricta sin impulso de cadera." },
      { name: "Z-Press con Barra en Suelo", shortName: "Z-Press Barra", defaultPr: 55, equipment: "barbell", description: "Sentado en el suelo sin respaldo; estabilidad de core a prueba de balas." },
      { name: "Remo Pendlay", shortName: "Remo Pendlay", defaultPr: 85, equipment: "barbell", description: "Desde el piso en cada repetición con torso paralelo al piso." },
      { name: "Remo con Barra Pesado (45 Grados)", shortName: "Remo Barra 45°", defaultPr: 95, equipment: "barbell", description: "Sobrecarga de tracción horizontal para densidad dorsal y estabilidad lumbar." },
      { name: "Fondos en Paralelas Lastrados", shortName: "Fondos Lastrados", defaultPr: 90, equipment: "barbell", description: "Potente empuje declinado con peso corporal más disco lastrado." },
      { name: "Dominadas Lastradas", shortName: "Dominadas Lastradas", defaultPr: 90, equipment: "barbell", description: "Tracción vertical con reclutamiento dorsal absoluto." },
      { name: "Hip Thrust Pesado con Barra", shortName: "Hip Thrust", defaultPr: 170, equipment: "barbell", description: "Extensión terminal de cadera con carga masiva de glúteos." },
      { name: "Paseo del Granjero Pesado (Farmer's Walk)", shortName: "Farmer's Walk", defaultPr: 80, equipment: "dumbbell", description: "Fuerza de agarre descomunal, trapecios e integridad postural dinámica." },
    ]
  },
  {
    id: "maquinas",
    name: "MÁQUINAS & GIMNASIO",
    icon: "⚙️",
    badgeColor: "border-purple-500/40 bg-purple-500/10 text-purple-300",
    exercises: [
      { name: "Prensa 45° Pesada", shortName: "Prensa 45°", defaultPr: 240, equipment: "machine", description: "Sobrecarga masiva de cuádriceps sin fatiga axial en columna." },
      { name: "Hack Squat Pesada", shortName: "Hack Squat", defaultPr: 150, equipment: "machine", description: "Flexión profunda de rodilla con estabilidad guiada." },
      { name: "Press de Pecho en Máquina Convergente", shortName: "Press Máquina", defaultPr: 100, equipment: "machine", description: "Tensión mecánica pura en pectoral sin demanda estabilizadora." },
      { name: "Jalón al Pecho Pesado", shortName: "Jalón al Pecho", defaultPr: 85, equipment: "machine", description: "Tracción en polea con vector regulado y bloqueo de fémur." },
      { name: "Remo en Polea Baja", shortName: "Remo Polea Baja", defaultPr: 85, equipment: "machine", description: "Retracción escapular sostenida con tensión constante." },
      { name: "Extensiones de Cuádriceps Pesadas", shortName: "Ext. Cuádriceps", defaultPr: 80, equipment: "machine", description: "Tensión en el punto de máximo acortamiento del recto femoral." },
      { name: "Curl Femoral Tumbado", shortName: "Curl Femoral", defaultPr: 70, equipment: "machine", description: "Flexión activa de rodilla con aislamiento puro de isquiosurales." },
      { name: "Curl Bíceps Barra Z Pesado", shortName: "Curl Barra Z", defaultPr: 42.5, equipment: "barbell", description: "Sobrecarga progresiva en flexores de codo con muñeca protegida." },
      { name: "Elevaciones Laterales Pesadas", shortName: "Elev. Laterales", defaultPr: 16, equipment: "dumbbell", description: "Aislamiento del deltoides medial con sobrecarga progresiva." },
    ]
  }
];

export function UniversalProtocolModal({
  isOpen,
  onClose,
  onStartTimer,
}: UniversalProtocolModalProps) {
  const [exerciseName, setExerciseName] = useState<string>("Press de Banca Plano");
  const [prWeight, setPrWeight] = useState<number>(100);
  const [equipment, setEquipment] = useState<EquipmentType>("barbell");
  const [goal, setGoal] = useState<GoalType>("strength");
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<"all" | "banca" | "potencia" | "fuerza" | "maquinas">("banca");
  const [barWeight, setBarWeight] = useState<number>(20);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const [savedNotification, setSavedNotification] = useState<boolean>(false);

  // Local rest timer state
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [timerRemaining, setTimerRemaining] = useState<number>(0);
  const [timerTotal, setTimerTotal] = useState<number>(0);
  const [timerLabel, setTimerLabel] = useState<string>("");

  // Flattened list for suggestions and search
  const allExercises = useMemo(() => {
    return CATEGORIZED_EXERCISES.flatMap((cat) => cat.exercises);
  }, []);

  // Filtered exercises for the chips
  const visibleExercises = useMemo(() => {
    if (selectedCategoryTab === "all") return allExercises;
    const cat = CATEGORIZED_EXERCISES.find((c) => c.id === selectedCategoryTab);
    return cat ? cat.exercises : allExercises;
  }, [selectedCategoryTab, allExercises]);

  // Is current exercise an Olympic / Explosive lift?
  const isCurrentOlympic = useMemo(() => {
    const found = allExercises.find(
      (ex) => ex.name.toLowerCase() === exerciseName.toLowerCase() || ex.shortName.toLowerCase() === exerciseName.toLowerCase()
    );
    if (found?.isOlympic) return true;
    const lower = exerciseName.toLowerCase();
    return (
      lower.includes("clean") ||
      lower.includes("snatch") ||
      lower.includes("jerk") ||
      lower.includes("cargada") ||
      lower.includes("arrancada") ||
      lower.includes("salto") ||
      lower.includes("swing") ||
      lower.includes("high pull") ||
      lower.includes("slam") ||
      lower.includes("speed") ||
      lower.includes("dinámico") ||
      lower.includes("push press")
    );
  }, [exerciseName, allExercises]);

  // Look up saved PR from localStorage if available
  useEffect(() => {
    if (typeof window === "undefined" || !exerciseName) return;
    try {
      const savedMaxes = localStorage.getItem("neuro_strength_maxes");
      if (savedMaxes) {
        const parsed = JSON.parse(savedMaxes);
        if (parsed[exerciseName]?.one_rep_max) {
          setPrWeight(parsed[exerciseName].one_rep_max);
        }
      }
    } catch {}
  }, [exerciseName]);

  // Timer countdown effect
  useEffect(() => {
    if (!timerRunning || timerRemaining <= 0) return;
    const interval = setInterval(() => {
      setTimerRemaining((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          playChime(true);
          if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate([300, 150, 300, 150, 400]);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, timerRemaining]);

  // Handle clicking an exercise chip
  const handleSelectExercise = (item: ExerciseItem) => {
    playTactileClick();
    setExerciseName(item.name);
    setEquipment(item.equipment);
    if (item.isOlympic) {
      setGoal("strength");
    }

    // Check if user already has a saved 1RM for this exercise
    let foundPr = item.defaultPr;
    if (typeof window !== "undefined") {
      try {
        const savedMaxes = localStorage.getItem("neuro_strength_maxes");
        if (savedMaxes) {
          const parsed = JSON.parse(savedMaxes);
          if (parsed[item.name]?.one_rep_max) {
            foundPr = parsed[item.name].one_rep_max;
          }
        }
      } catch {}
    }
    setPrWeight(foundPr);
  };

  // Rounding helper
  const roundWeight = (rawWeight: number): number => {
    if (equipment === "barbell") {
      const clamped = Math.max(barWeight, rawWeight);
      return Math.round(clamped / 2.5) * 2.5;
    }
    if (equipment === "dumbbell") {
      const clamped = Math.max(2, rawWeight);
      return Math.round(clamped / 2.5) * 2.5;
    }
    // machine: 5kg increments
    const clamped = Math.max(5, rawWeight);
    return Math.round(clamped / 5) * 5;
  };

  // Build the neuro-activation and loading protocol steps
  const protocol = useMemo<ProtocolStep[]>(() => {
    const pr = Math.max(10, prWeight);
    const steps: ProtocolStep[] = [];

    // FASE 1: CALENTAMIENTO GENERAL & PROGRESIVO (3 Sets)
    steps.push({
      id: "w1",
      phase: "warmup",
      title: equipment === "barbell" ? "Calentamiento 1: Barra Sola (Flow & Articular)" : "Calentamiento 1: Carga Mínima de Activación",
      badge: "CALENTAMIENTO",
      badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      description: equipment === "barbell"
        ? "Barra sin discos (20kg). Calibración del arco torácico, escápulas y velocidad de codos."
        : "Peso mínimo. Lubricación del líquido sinovial y fijación de la trayectoria.",
      percent: Math.round((barWeight / pr) * 100),
      weightKg: equipment === "barbell" ? barWeight : roundWeight(pr * 0.3),
      reps: isCurrentOlympic ? 5 : 8,
      repsLabel: isCurrentOlympic ? "5 reps técnicas lentas" : "8 reps controladas",
      restSeconds: 45,
    });

    steps.push({
      id: "w2",
      phase: "warmup",
      title: "Calentamiento 2: Reclutamiento Fásico",
      badge: "CALENTAMIENTO",
      badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      description: "50% de tu PR. Despertar coordinativo sin fatiga periférica.",
      percent: 50,
      weightKg: roundWeight(pr * 0.5),
      reps: isCurrentOlympic ? 3 : 5,
      repsLabel: isCurrentOlympic ? "3 reps aceleradas" : "5 reps dinámicas",
      restSeconds: 60,
    });

    steps.push({
      id: "w3",
      phase: "warmup",
      title: "Calentamiento 3: Carga Barométrica",
      badge: "CALENTAMIENTO",
      badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      description: "65% de la carga. Activación de presión intra-abdominal y tensión en tendones.",
      percent: 65,
      weightKg: roundWeight(pr * 0.65),
      reps: isCurrentOlympic ? 2 : 4,
      repsLabel: isCurrentOlympic ? "2 reps con intención veloz" : "4 reps con intención",
      restSeconds: 75,
    });

    // FASE 2: ACTIVACIÓN NEUROMUSCULAR (PAP) (2 Sets)
    steps.push({
      id: "a1",
      phase: "activation",
      title: "Activación 1: Transición Neuronal",
      badge: "ACTIVACIÓN",
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      description: "75% de la carga. Preparación de motoneuronas rápidas tipo IIb con fatiga glucolítica nula.",
      percent: 75,
      weightKg: roundWeight(pr * 0.75),
      reps: isCurrentOlympic ? 2 : 2,
      repsLabel: "2 reps explosivas",
      restSeconds: 90,
    });

    steps.push({
      id: "a2",
      phase: "activation",
      title: "Activación 2: Potenciación PAP (Último Salto)",
      badge: "PAP ÉLITE",
      badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      description: "85% de la carga. 1 rep única para desensibilizar el peso; hace que la serie efectiva se sienta liviana.",
      percent: 85,
      weightKg: roundWeight(pr * 0.85),
      reps: 1,
      repsLabel: "1 rep sólida y veloz",
      restSeconds: 120,
    });

    // FASE 3: SERIES EFECTIVAS DE TRABAJO
    if (isCurrentOlympic || goal === "strength") {
      const effectiveWeight = roundWeight(pr * (isCurrentOlympic ? 0.82 : 0.85));
      const targetReps = isCurrentOlympic ? 3 : 5;
      const repsDesc = isCurrentOlympic ? "3 reps (Potencia máxima Prilepin)" : "5 reps RPE 8.5 (Fuerza Pura)";
      const restSec = isCurrentOlympic ? 180 : 180;

      for (let i = 1; i <= 3; i++) {
        steps.push({
          id: `eff_${i}`,
          phase: "effective",
          title: `Serie Efectiva ${i} de 3: ${isCurrentOlympic ? "Potencia RFD" : "Fuerza Máxima"}`,
          badge: isCurrentOlympic ? "POTENCIA" : "EFECTIVA",
          badgeColor: isCurrentOlympic ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
          description: isCurrentOlympic
            ? "82% 1RM. Máxima velocidad concéntrica sin degradación técnica ni acúmulo de lactato."
            : "85% 1RM. Máxima tasa de desarrollo de fuerza (RFD). Descanso amplio para resíntesis total de ATP-PCr.",
          percent: isCurrentOlympic ? 82 : 85,
          weightKg: effectiveWeight,
          reps: targetReps,
          repsLabel: repsDesc,
          restSeconds: restSec,
          isEffective: true,
        });
      }
    } else if (goal === "hypertrophy") {
      const effectiveWeight = roundWeight(pr * 0.76);
      for (let i = 1; i <= 3; i++) {
        steps.push({
          id: `eff_${i}`,
          phase: "effective",
          title: `Serie Efectiva ${i} de 3: Tensión Mecánica`,
          badge: "EFECTIVA",
          badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
          description: "76% 1RM. Hipertrofia miofibrilar óptima con alto reclutamiento y volumen denso.",
          percent: 76,
          weightKg: effectiveWeight,
          reps: 8,
          repsLabel: "8 reps RPE 8-9",
          restSeconds: 150,
          isEffective: true,
        });
      }
    } else {
      const effectiveWeight = roundWeight(pr * 0.65);
      for (let i = 1; i <= 3; i++) {
        steps.push({
          id: `eff_${i}`,
          phase: "effective",
          title: `Serie Efectiva ${i} de 3: Volumen & Bombeo`,
          badge: "EFECTIVA",
          badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
          description: "65% 1RM. Estrés metabólico y acumulación de metabolitos sin degradación técnica.",
          percent: 65,
          weightKg: effectiveWeight,
          reps: 12,
          repsLabel: "12 reps controladas",
          restSeconds: 90,
          isEffective: true,
        });
      }
    }

    return steps;
  }, [prWeight, equipment, goal, barWeight, isCurrentOlympic]);

  if (!isOpen) return null;

  const handleStartRest = (step: ProtocolStep) => {
    playTactileClick();
    if (onStartTimer) {
      onStartTimer(step.restSeconds, `${exerciseName} - ${step.title}`);
    }
    setTimerTotal(step.restSeconds);
    setTimerRemaining(step.restSeconds);
    setTimerLabel(step.title);
    setTimerRunning(true);
    setActiveStepId(step.id);
  };

  const toggleSetComplete = (id: string) => {
    playTactileClick();
    setCompletedSteps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSavePrToStorage = () => {
    playTactileClick();
    try {
      const current = localStorage.getItem("neuro_strength_maxes");
      const parsed = current ? JSON.parse(current) : {};
      parsed[exerciseName] = {
        ...(parsed[exerciseName] || {}),
        one_rep_max: prWeight,
        training_max: Math.round(prWeight * 0.9 * 10) / 10,
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem("neuro_strength_maxes", JSON.stringify(parsed));
      setSavedNotification(true);
      setTimeout(() => setSavedNotification(false), 2000);
    } catch {}
  };

  const handleCopySummary = () => {
    playTactileClick();
    const summary = [
      `🏋️ PROTOCOLO UNIVERSAL: ${exerciseName.toUpperCase()}`,
      `🎯 PR / 1RM: ${prWeight} kg | Equipo: ${equipment} | Enfoque: ${isCurrentOlympic ? "POTENCIA OLÍMPICA" : goal.toUpperCase()}`,
      `--------------------------------------------------`,
      ...protocol.map(
        (s) => `[${s.badge}] ${s.title}: ${s.weightKg}kg x ${s.repsLabel} (Descanso: ${s.restSeconds}s)`
      ),
      `--------------------------------------------------`,
      `Generado con ATP STRENGTH // NEURO-STRENGTH`
    ].join("\n");

    if (navigator?.clipboard) {
      navigator.clipboard.writeText(summary);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2000);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
    >
      {/* Suggestions datalist */}
      <datalist id="all-exercises-suggestions">
        {allExercises.map((ex) => (
          <option key={ex.name} value={ex.name} />
        ))}
      </datalist>

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-3xl w-full rounded-3xl bg-[#07070b] border border-zinc-800 p-4 sm:p-7 shadow-[0_0_80px_rgba(245,158,11,0.2)] text-left flex flex-col max-h-[94vh] overflow-y-auto font-sans"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center text-sm cursor-pointer transition-all hover:bg-zinc-800 z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Hero Header */}
        <div className="flex items-start gap-3 sm:gap-4 border-b border-zinc-900 pb-4 mb-4">
          <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/10">
            <Zap className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="flex-1 pr-8">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black tracking-wider text-white uppercase">
                PROTOCOLO UNIVERSAL DE FUERZA & POTENCIA
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                1RM / PR
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 font-mono mt-1">
              Arsenal ampliado de Press de Banca, Fuerza Máxima y Potencia Balística/Olímpica. Elegí el movimiento, ingresá tu PR y obtené de inmediato tus series de aproximación, potenciación PAP y series efectivas.
            </p>
          </div>
        </div>

        {/* CONTROLES DE ENTRADA: Ejercicio, PR, Equipamiento y Objetivo */}
        <div className="space-y-4 bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 mb-5 shadow-inner">
          {/* Fila 1: Input Ejercicio + Input PR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Campo Ejercicio con Autocomplete */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-zinc-400 flex items-center justify-between">
                <span>EJERCICIO SELECCIONADO</span>
                <span className="text-[10px] text-zinc-500">Búsqueda libre o catálogo</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  list="all-exercises-suggestions"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  placeholder="Buscá o escribí cualquier ejercicio..."
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-zinc-100 focus:outline-none focus:border-amber-400 transition-all placeholder:text-zinc-600 font-sans"
                />
              </div>
            </div>

            {/* Campo PR / 1RM */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-zinc-400 flex items-center justify-between">
                <span>¿CUÁL ES TU PR / 1RM? (KG)</span>
                <button
                  onClick={handleSavePrToStorage}
                  className="text-[10px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  title="Guardar este PR en la memoria de la aplicación"
                >
                  <Save className="w-3 h-3" />
                  <span>{savedNotification ? "¡GUARDADO!" : "GUARDAR PR"}</span>
                </button>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="10"
                  max="500"
                  step="2.5"
                  value={prWeight}
                  onChange={(e) => setPrWeight(parseFloat(e.target.value) || 0)}
                  className="flex-1 bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-lg font-black text-amber-400 text-center focus:outline-none focus:border-amber-400 transition-all font-mono"
                />
                <div className="flex gap-1">
                  <button
                    onClick={() => setPrWeight((w) => Math.max(10, w - 5))}
                    className="px-2.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-xs hover:border-zinc-700 active:scale-95 cursor-pointer"
                  >
                    -5
                  </button>
                  <button
                    onClick={() => setPrWeight((w) => w + 5)}
                    className="px-2.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-xs hover:border-zinc-700 active:scale-95 cursor-pointer"
                  >
                    +5
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Fila 2: CATÁLOGO CATEGORIZADO DE EJERCICIOS */}
          <div className="space-y-2 pt-2 border-t border-zinc-900">
            {/* Pestañas de Categoría */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-mono font-bold text-zinc-400 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-amber-400" />
                <span>CATÁLOGO DE MOVIMIENTOS ({allExercises.length})</span>
              </span>
              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => setSelectedCategoryTab("banca")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedCategoryTab === "banca"
                      ? "bg-red-500/20 text-red-300 border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                      : "bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                  }`}
                >
                  🛡️ Variantes de Banca ({CATEGORIZED_EXERCISES[0].exercises.length})
                </button>
                <button
                  onClick={() => setSelectedCategoryTab("potencia")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedCategoryTab === "potencia"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                      : "bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                  }`}
                >
                  ⚡ Potencia & Balística ({CATEGORIZED_EXERCISES[1].exercises.length})
                </button>
                <button
                  onClick={() => setSelectedCategoryTab("fuerza")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedCategoryTab === "fuerza"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                      : "bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                  }`}
                >
                  🏋️ Fuerza Máxima ({CATEGORIZED_EXERCISES[2].exercises.length})
                </button>
                <button
                  onClick={() => setSelectedCategoryTab("maquinas")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedCategoryTab === "maquinas"
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                      : "bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                  }`}
                >
                  ⚙️ Máquinas ({CATEGORIZED_EXERCISES[3].exercises.length})
                </button>
                <button
                  onClick={() => setSelectedCategoryTab("all")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    selectedCategoryTab === "all"
                      ? "bg-zinc-700 text-white border border-zinc-500"
                      : "bg-zinc-900/80 text-zinc-500 hover:text-zinc-300 border border-zinc-800"
                  }`}
                >
                  Todos ({allExercises.length})
                </button>
              </div>
            </div>

            {/* Chips de la categoría activa */}
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1.5 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
              {visibleExercises.map((ex) => {
                const isSelected = exerciseName === ex.name || exerciseName === ex.shortName;
                return (
                  <button
                    key={ex.name}
                    onClick={() => handleSelectExercise(ex)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all text-left flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-gradient-to-r from-amber-500/30 to-orange-500/20 text-amber-300 border border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.25)] scale-[1.02]"
                        : "bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800"
                    }`}
                  >
                    <span>{ex.isOlympic ? "⚡" : ex.equipment === "machine" ? "⚙️" : ex.name.includes("Banca") || ex.name.includes("Press") ? "🛡️" : "🏋️"}</span>
                    <span>{ex.shortName}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">({ex.defaultPr}k)</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fila 3: Selector de Implemento + Enfoque */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-zinc-900">
            {/* Implemento */}
            <div className="space-y-1.5">
              <span className="text-xs font-mono font-bold text-zinc-400">TIPO DE IMPLEMENTO</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setEquipment("barbell")}
                  className={`py-2 px-2 rounded-xl text-xs font-mono font-bold border transition-all text-center cursor-pointer ${
                    equipment === "barbell"
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                  }`}
                >
                  🏋️ Barra (20k)
                </button>
                <button
                  onClick={() => setEquipment("dumbbell")}
                  className={`py-2 px-2 rounded-xl text-xs font-mono font-bold border transition-all text-center cursor-pointer ${
                    equipment === "dumbbell"
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                  }`}
                >
                  💪 Mancuerna
                </button>
                <button
                  onClick={() => setEquipment("machine")}
                  className={`py-2 px-2 rounded-xl text-xs font-mono font-bold border transition-all text-center cursor-pointer ${
                    equipment === "machine"
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                  }`}
                >
                  ⚙️ Máquina/Polea
                </button>
              </div>
            </div>

            {/* Objetivo / Enfoque */}
            <div className="space-y-1.5">
              <span className="text-xs font-mono font-bold text-zinc-400">ENFOQUE DE LA SESIÓN</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setGoal("strength")}
                  className={`py-2 px-2 rounded-xl text-xs font-mono font-bold border transition-all text-center cursor-pointer ${
                    goal === "strength"
                      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                  }`}
                >
                  ⚡ {isCurrentOlympic ? "Potencia (82%)" : "Fuerza (85%)"}
                </button>
                <button
                  onClick={() => setGoal("hypertrophy")}
                  className={`py-2 px-2 rounded-xl text-xs font-mono font-bold border transition-all text-center cursor-pointer ${
                    goal === "hypertrophy"
                      ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                  }`}
                >
                  🧬 Hipertrofia (76%)
                </button>
                <button
                  onClick={() => setGoal("volume")}
                  className={`py-2 px-2 rounded-xl text-xs font-mono font-bold border transition-all text-center cursor-pointer ${
                    goal === "volume"
                      ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                  }`}
                >
                  🩸 Volumen (65%)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* TEMPORIZADOR DE DESCANSO EN VIVO (Si está activo) */}
        {timerRunning && (
          <div className="mb-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold animate-pulse">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-mono text-zinc-400">DESCANSO EN CURSO</div>
                <div className="text-sm font-bold text-zinc-100">{timerLabel || "Resíntesis de Fosfocreatina"}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-2xl sm:text-3xl font-mono font-black text-amber-400 tracking-wider">
                {formatSeconds(timerRemaining)}
              </div>
              <button
                onClick={() => setTimerRunning(false)}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400 hover:text-white cursor-pointer"
              >
                SALTAR
              </button>
            </div>
          </div>
        )}

        {/* TABLA VISUAL DE PROTOCOLO: Warmup -> Activación -> Efectivas */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-zinc-400 tracking-wider uppercase flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>PASO A PASO DE LA SESIÓN ({protocol.length} SERIES)</span>
            </h3>
            <button
              onClick={handleCopySummary}
              className="text-xs font-mono text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 cursor-pointer bg-zinc-900/60 border border-zinc-800 px-2.5 py-1 rounded-lg"
            >
              <Copy className="w-3.5 h-3.5 text-amber-400" />
              <span>{copiedNotification ? "¡COPIADO!" : "COPIAR PROTOCOLO"}</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {protocol.map((step) => {
              const isCompleted = !!completedSteps[step.id];
              const isTargetingBarbell = equipment === "barbell" && step.weightKg >= barWeight;

              return (
                <div
                  key={step.id}
                  className={`rounded-2xl border p-3.5 sm:p-4 transition-all ${
                    step.isEffective
                      ? isCurrentOlympic
                        ? "bg-gradient-to-r from-amber-950/20 via-zinc-950 to-zinc-950 border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.08)]"
                        : "bg-gradient-to-r from-emerald-950/20 via-zinc-950 to-zinc-950 border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.05)]"
                      : step.phase === "activation"
                      ? "bg-gradient-to-r from-purple-950/20 via-zinc-950 to-zinc-950 border-purple-500/30"
                      : "bg-zinc-950/70 border-zinc-800/80"
                  } ${isCompleted ? "opacity-60" : ""}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left details */}
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleSetComplete(step.id)}
                        className={`w-6 h-6 rounded-lg border mt-0.5 flex items-center justify-center transition-all cursor-pointer ${
                          isCompleted
                            ? "bg-emerald-500 border-emerald-400 text-black"
                            : "border-zinc-700 bg-zinc-900 hover:border-zinc-500 text-transparent"
                        }`}
                        title="Marcar serie completada"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${step.badgeColor}`}>
                            {step.badge}
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-zinc-100">
                            {step.title}
                          </span>
                          <span className="text-[11px] font-mono text-zinc-500">
                            ({step.percent}% PR)
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 font-mono mt-1">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {/* Right payload: Weight, Reps, Action */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pl-9 sm:pl-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-900">
                      <div className="text-right">
                        <div className="text-base sm:text-lg font-black font-mono text-amber-400 tracking-tight">
                          {step.weightKg} kg
                        </div>
                        <div className="text-xs font-mono text-zinc-300 font-semibold">
                          {step.repsLabel}
                        </div>
                      </div>

                      <button
                        onClick={() => handleStartRest(step)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-mono font-bold text-zinc-200 active:scale-95 transition-all cursor-pointer"
                        title="Iniciar descanso para esta serie"
                      >
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{step.restSeconds}s</span>
                      </button>
                    </div>
                  </div>

                  {/* Discos de barra si es Barra Olímpica */}
                  {isTargetingBarbell && (
                    <div className="mt-2.5 pt-2.5 border-t border-zinc-900/80 pl-9">
                      <BarbellPlateVisualizer
                        targetWeightKg={step.weightKg}
                        exerciseName={exerciseName}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info box */}
        <div className="mt-auto pt-3 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-zinc-500">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Fuerza & Potencia RFD: Protocolo calibrado con doctrina soviética Prilepin y resíntesis ATP-PCr.</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs active:scale-95 transition-all cursor-pointer"
          >
            LISTO // VOLVER
          </button>
        </div>
      </div>
    </div>
  );
}
