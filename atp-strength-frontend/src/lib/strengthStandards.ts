/**
 * SPEC-0010 — Scientific Strength Standards & Professional Coach Evaluation Engine.
 * Clean Architecture Domain / Service Layer (L0).
 *
 * Implements:
 * 1. Evidence-based strength standards (Novice, Intermediate, Advanced, Elite).
 * 2. Bodyweight-relative strength ratios based on powerlifting & weightlifting standards.
 * 3. Professional Strength Coach pedagogical evaluation, microloading progression, and technical cues.
 */

import type { HistoryRecord } from './prHistory';

export type StrengthTier = 'NOVICE' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE';

export interface StrengthTierThresholds {
  novice: number;
  intermediate: number;
  advanced: number;
  elite: number;
}

export interface StrengthLevelResult {
  exerciseName: string;
  oneRepMax: number;
  bodyweightKg: number;
  ratio: number;
  ratioFormatted: string;
  tier: StrengthTier;
  tierLabel: string;
  tierIndex: number; // 0: Novice, 1: Intermediate, 2: Advanced, 3: Elite
  badge: string;
  color: string;
  bgColor: string;
  borderColor: string;
  thresholds: StrengthTierThresholds;
  progressToNextTierPct: number;
  kgToNextTier: number;
  nextTierLabel: string | null;
  categoryPattern: string;
  standardQuote: string;
}

export interface CoachEvaluationResult {
  exerciseName: string;
  sessionsLogged: number;
  baseline1Rm: number;
  current1Rm: number;
  netProgressionKg: number;
  netProgressionPct: number;
  status:
    | 'NEW_BENCHMARK'
    | 'SUPERCOMPENSATION_PEAK'
    | 'STEADY_PROGRESSION'
    | 'CONSOLIDATING'
    | 'FATIGUE_OVERREACHING'
    | 'PLATEAU';
  statusLabel: string;
  statusBadgeColor: string;
  coachHeadline: string;
  coachDiagnosis: string;
  nextTargetLoadKg: number;
  nextTargetRepsStr: string;
  recommendedRestSeconds: number;
  biomechanicalCue: string;
  strengthPillarRating: string;
}

// Multipliers relative to Bodyweight (BW) for a standard male/female continuum
// References: Lon Kilgore & Mark Rippetoe (Practical Programming for Strength Training),
// Greg Nuckols, and International Powerlifting Federation competitive data.
interface MovementPatternRatios {
  pattern: string;
  novice: number;
  intermediate: number;
  advanced: number;
  elite: number;
  cue: string;
  standardQuote: string;
}

const MOVEMENT_STANDARDS: Record<string, MovementPatternRatios> = {
  squat: {
    pattern: 'Sentadilla / Dominio Rodilla',
    novice: 1.15,
    intermediate: 1.55,
    advanced: 1.95,
    elite: 2.4,
    cue: 'Pies atornillados al piso, rodillas rastreando la punta de los pies y torso rígido con maniobra Valsalva.',
    standardQuote: '1.5x BW es la base de fuerza funcional; 2.0x BW es nivel avanzado de potencia atlética.',
  },
  bench: {
    pattern: 'Empuje Horizontal / Pectoral',
    novice: 0.85,
    intermediate: 1.15,
    advanced: 1.5,
    elite: 1.85,
    cue: 'Retracción y depresión escapular constante, arco fisiológico y pausa de 1s tocando el esternón.',
    standardQuote: 'Levantar el propio peso corporal (1.0x BW) en banca es el hito del atleta intermedio.',
  },
  deadlift: {
    pattern: 'Bisagra de Cadera / Tracción Cadena Posterior',
    novice: 1.35,
    intermediate: 1.8,
    advanced: 2.3,
    elite: 2.8,
    cue: 'Barra pegada a tibias, dorsales empacados y empuje del suelo como si hicieras una prensa con los pies.',
    standardQuote: 'El despegue puro del suelo: 2.0x BW representa una espalda y cadera de acero templado.',
  },
  overhead: {
    pattern: 'Empuje Vertical / Deltoides & Core',
    novice: 0.55,
    intermediate: 0.75,
    advanced: 1.0,
    elite: 1.25,
    cue: 'Glúteos y abdomen de piedra, cabeza adelante en el bloqueo con codos apuntando al frente.',
    standardQuote: 'Presionar tu propio peso corporal sobre la cabeza (1.0x BW) es la marca de un maestro de la fuerza.',
  },
  pullup: {
    pattern: 'Tracción Vertical / Dorsal',
    novice: 1.0, // Peso corporal sin lastre
    intermediate: 1.2, // +15 kg lastre a 75 kg
    advanced: 1.5, // +37.5 kg lastre
    elite: 1.8, // +60 kg lastre
    cue: 'Rango de movimiento completo: extensión total en el fondo y barbilla claramente sobre la barra sin impulso.',
    standardQuote: 'Dominadas con lastre del 50% de tu peso corporal es nivel élite de calistenia pesada.',
  },
  dips: {
    pattern: 'Empuje Inclinado / Fondos',
    novice: 1.05,
    intermediate: 1.3,
    advanced: 1.65,
    elite: 2.0,
    cue: 'Leve inclinación anterior, codos a 90° o más abajo sin hiperextensión cervical.',
    standardQuote: 'Los fondos pesados desarrollan potencia terminal en tríceps y pectoral inferior.',
  },
  row: {
    pattern: 'Tracción Horizontal / Remo con Barra',
    novice: 0.7,
    intermediate: 0.95,
    advanced: 1.25,
    elite: 1.55,
    cue: 'Torso paralelo al suelo o a 45°, tirar con los codos y apretar la espalda alta en el tope.',
    standardQuote: 'Un remo fuerte equilibra el pectoral y protege la articulación glenohumeral.',
  },
  olympic: {
    pattern: 'Levantamiento Olímpico / Potencia Explosiva',
    novice: 0.75,
    intermediate: 1.05,
    advanced: 1.35,
    elite: 1.65,
    cue: 'Triple extensión violenta (tobillo, rodilla, cadera) y metida ultrarrápida bajo la barra.',
    standardQuote: 'La máxima expresión del reclutamiento neuromuscular y la tasa de desarrollo de fuerza (RFD).',
  },
  isolation: {
    pattern: 'Accesorio / Brazo / Aislamiento',
    novice: 0.35,
    intermediate: 0.55,
    advanced: 0.75,
    elite: 0.95,
    cue: 'Codos fijos, tensión constante en la fase excéntrica y cero balanceo compensatorio.',
    standardQuote: 'El trabajo accesorio fortalece tendones y refuerza los puntos débiles de los básicos.',
  },
};

/**
 * Matches an exercise name to its biomechanical pattern.
 */
export function detectMovementPattern(exerciseName: string): MovementPatternRatios {
  const norm = exerciseName.toLowerCase();

  if (norm.includes('sentadilla') || norm.includes('squat') || norm.includes('prensa') || norm.includes('hack')) {
    return MOVEMENT_STANDARDS.squat;
  }
  if (norm.includes('banca') || norm.includes('bench') || norm.includes('pecho')) {
    return MOVEMENT_STANDARDS.bench;
  }
  if (norm.includes('peso muerto') || norm.includes('deadlift') || norm.includes('rumano') || norm.includes('rdl') || norm.includes('hip thrust')) {
    return MOVEMENT_STANDARDS.deadlift;
  }
  if (norm.includes('militar') || norm.includes('overhead') || norm.includes('push press') || norm.includes('z-press') || norm.includes('press hombros')) {
    return MOVEMENT_STANDARDS.overhead;
  }
  if (norm.includes('dominada') || norm.includes('pull-up') || norm.includes('chin-up') || norm.includes('jalón') || norm.includes('lat pulldown')) {
    return MOVEMENT_STANDARDS.pullup;
  }
  if (norm.includes('fondo') || norm.includes('dip')) {
    return MOVEMENT_STANDARDS.dips;
  }
  if (norm.includes('remo') || norm.includes('row') || norm.includes('pendlay')) {
    return MOVEMENT_STANDARDS.row;
  }
  if (norm.includes('clean') || norm.includes('cargada') || norm.includes('snatch') || norm.includes('arrancada') || norm.includes('jerk') || norm.includes('envión')) {
    return MOVEMENT_STANDARDS.olympic;
  }
  if (norm.includes('curl') || norm.includes('tríceps') || norm.includes('biceps') || norm.includes('extension') || norm.includes('elevacion') || norm.includes('plancha') || norm.includes('granjero')) {
    return MOVEMENT_STANDARDS.isolation;
  }

  // Default fallback to general compound
  return MOVEMENT_STANDARDS.bench;
}

/**
 * Computes the official Strength Level (Principiante -> Intermedio -> Avanzado -> Élite).
 */
export function calculateStrengthLevel(
  exerciseName: string,
  oneRepMax: number,
  bodyweightKg: number = 75
): StrengthLevelResult {
  const bw = Math.max(40, Number(bodyweightKg) || 75);
  const e1rm = Math.max(0, Number(oneRepMax) || 0);
  const ratio = Math.round((e1rm / bw) * 100) / 100;
  const pattern = detectMovementPattern(exerciseName);

  const thresholds: StrengthTierThresholds = {
    novice: Math.round(bw * pattern.novice * 10) / 10,
    intermediate: Math.round(bw * pattern.intermediate * 10) / 10,
    advanced: Math.round(bw * pattern.advanced * 10) / 10,
    elite: Math.round(bw * pattern.elite * 10) / 10,
  };

  let tier: StrengthTier = 'NOVICE';
  let tierLabel = 'Principiante';
  let tierIndex = 0;
  let badge = '🥉';
  let color = 'text-amber-400';
  let bgColor = 'bg-amber-500/10';
  let borderColor = 'border-amber-500/30';
  let nextTierLabel: string | null = 'Intermedio';
  let progressToNextTierPct = 0;
  let kgToNextTier = 0;

  if (e1rm >= thresholds.elite) {
    tier = 'ELITE';
    tierLabel = 'Élite / Maestro de Fuerza';
    tierIndex = 3;
    badge = '💎';
    color = 'text-purple-400';
    bgColor = 'bg-purple-500/15';
    borderColor = 'border-purple-500/40';
    nextTierLabel = null;
    progressToNextTierPct = 100;
    kgToNextTier = 0;
  } else if (e1rm >= thresholds.advanced) {
    tier = 'ADVANCED';
    tierLabel = 'Avanzado';
    tierIndex = 2;
    badge = '🥇';
    color = 'text-emerald-400';
    bgColor = 'bg-emerald-500/15';
    borderColor = 'border-emerald-500/40';
    nextTierLabel = 'Élite';
    const range = thresholds.elite - thresholds.advanced;
    progressToNextTierPct = Math.min(100, Math.max(0, Math.round(((e1rm - thresholds.advanced) / range) * 100)));
    kgToNextTier = Math.max(0, Math.round((thresholds.elite - e1rm) * 10) / 10);
  } else if (e1rm >= thresholds.intermediate) {
    tier = 'INTERMEDIATE';
    tierLabel = 'Intermedio';
    tierIndex = 1;
    badge = '🥈';
    color = 'text-sky-400';
    bgColor = 'bg-sky-500/15';
    borderColor = 'border-sky-500/40';
    nextTierLabel = 'Avanzado';
    const range = thresholds.advanced - thresholds.intermediate;
    progressToNextTierPct = Math.min(100, Math.max(0, Math.round(((e1rm - thresholds.intermediate) / range) * 100)));
    kgToNextTier = Math.max(0, Math.round((thresholds.advanced - e1rm) * 10) / 10);
  } else {
    tier = 'NOVICE';
    tierLabel = 'Principiante';
    tierIndex = 0;
    badge = '🥉';
    color = 'text-amber-400';
    bgColor = 'bg-amber-500/10';
    borderColor = 'border-amber-500/30';
    nextTierLabel = 'Intermedio';
    const range = thresholds.intermediate;
    progressToNextTierPct = Math.min(100, Math.max(0, Math.round((e1rm / range) * 100)));
    kgToNextTier = Math.max(0, Math.round((thresholds.intermediate - e1rm) * 10) / 10);
  }

  return {
    exerciseName,
    oneRepMax: e1rm,
    bodyweightKg: bw,
    ratio,
    ratioFormatted: `${ratio.toFixed(2)}× Peso Corporal`,
    tier,
    tierLabel,
    tierIndex,
    badge,
    color,
    bgColor,
    borderColor,
    thresholds,
    progressToNextTierPct,
    kgToNextTier,
    nextTierLabel,
    categoryPattern: pattern.pattern,
    standardQuote: pattern.standardQuote,
  };
}

/**
 * Professional Strength Coach Pedagogical Evaluation Engine.
 * Evaluates exercise trajectory, fatigue, and prescribes concrete microloaded targets.
 */
export function evaluateStrengthCoach(
  exerciseName: string,
  history: HistoryRecord[],
  current1Rm: number = 0,
  standards: StrengthLevelResult
): CoachEvaluationResult {
  const pattern = detectMovementPattern(exerciseName);
  const count = history.length;

  if (count === 0 || current1Rm <= 0) {
    return {
      exerciseName,
      sessionsLogged: 0,
      baseline1Rm: 0,
      current1Rm: 0,
      netProgressionKg: 0,
      netProgressionPct: 0,
      status: 'NEW_BENCHMARK',
      statusLabel: 'Punto de Partida por Calibrar',
      statusBadgeColor: 'bg-zinc-800 text-zinc-400 border-zinc-700',
      coachHeadline: 'Registro Inicial Necesario',
      coachDiagnosis:
        'Aún no hay series registradas en el historial de este ejercicio. Ingresá tu primer test o serie de trabajo abajo para que el Coach calcule tu 1RM, tu nivel de fuerza y la progresión secuencial de cargas.',
      nextTargetLoadKg: 20,
      nextTargetRepsStr: '3 a 5 reps limpias (RIR 2)',
      recommendedRestSeconds: 180,
      biomechanicalCue: pattern.cue,
      strengthPillarRating: 'Fase de Calibración',
    };
  }

  // Sort history chronologically
  const sorted = [...history].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const baseline1Rm = sorted[0].e1rm || sorted[0].load_kg || current1Rm;
  const bestHistorical = sorted.reduce((max, h) => Math.max(max, h.e1rm || 0), current1Rm);
  const recentEntry = sorted[sorted.length - 1];
  const recent1Rm = recentEntry.e1rm || recentEntry.load_kg || current1Rm;

  const netProgressionKg = Math.round((current1Rm - baseline1Rm) * 10) / 10;
  const netProgressionPct =
    baseline1Rm > 0 ? Math.round(((current1Rm - baseline1Rm) / baseline1Rm) * 1000) / 10 : 0;

  // Determine microload increment: +2.5kg for lower body/deadlift, +1.25kg for upper body
  const isHeavyCompound =
    pattern.pattern.includes('Sentadilla') ||
    pattern.pattern.includes('Cadena Posterior') ||
    pattern.pattern.includes('Olímpico');
  const microIncrement = isHeavyCompound ? 2.5 : 1.25;

  let status: CoachEvaluationResult['status'] = 'STEADY_PROGRESSION';
  let statusLabel = 'Progresión Constante';
  let statusBadgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
  let coachHeadline = 'Adaptación Neuromuscular Positiva';
  let coachDiagnosis = '';
  let nextTargetLoadKg = Math.round((current1Rm + microIncrement) * 10) / 10;
  let nextTargetRepsStr = '3 a 5 reps a RIR 1-2';
  let recommendedRestSeconds = 180;
  let strengthPillarRating = 'Alta Eficiencia';

  const isRecentPr = recent1Rm >= bestHistorical && count > 1;
  const isFatigued = bestHistorical - recent1Rm > bestHistorical * 0.08 && count >= 3;
  const isPlateau = count >= 4 && Math.abs(current1Rm - baseline1Rm) < 1.0;

  if (count === 1) {
    status = 'NEW_BENCHMARK';
    statusLabel = 'Marca Base Establecida';
    statusBadgeColor = 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    coachHeadline = 'Punto de Partida Fisiológico Calibrado';
    coachDiagnosis = `Tu 1RM inicial es de ${current1Rm} kg (${standards.tierLabel} • ${standards.ratioFormatted}). En la próxima sesión, aplicá sobrecarga progresiva conservadora sumando +${microIncrement} kg a tus series de Fase 5 (Fuerza Real). Mantené estricta la técnica biomecánica.`;
    nextTargetLoadKg = Math.round((current1Rm * 0.85 + microIncrement) * 2) / 2;
    recommendedRestSeconds = 180;
    strengthPillarRating = 'Línea Base Registrada';
  } else if (isRecentPr) {
    status = 'SUPERCOMPENSATION_PEAK';
    statusLabel = 'Pico de Supercompensación (Nuevo PR)';
    statusBadgeColor = 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    coachHeadline = '¡Supercompensación Activa y Nuevo Récord!';
    coachDiagnosis = `¡Felicidades! Rompiste tu marca personal con ${recent1Rm} kg. Tu avance neto acumulado es de +${netProgressionKg} kg (+${netProgressionPct}%). Estás en plena ventana de supercompensación neuromuscular. Tu sistema nervioso central ha asimilado la carga. Para consolidar este hito, en la siguiente sesión no te apresures al fallo: trabajá a ${Math.round((recent1Rm * 0.85) * 2) / 2} kg con 3 minutos completos de descanso ATP para afianzar el engrama motor.`;
    nextTargetLoadKg = Math.round((current1Rm + microIncrement) * 2) / 2;
    recommendedRestSeconds = 210;
    strengthPillarRating = 'Pico Neuromuscular Máximo';
  } else if (isFatigued) {
    status = 'FATIGUE_OVERREACHING';
    statusLabel = 'Fatiga Neural / Sobretensión';
    statusBadgeColor = 'bg-rose-500/20 text-rose-400 border-rose-500/40';
    coachHeadline = 'Señales de Fatiga Acumulada del SNC';
    coachDiagnosis = `Tu rendimiento reciente (${recent1Rm} kg) muestra una caída respecto a tu mejor marca (${bestHistorical} kg). Esto no es pérdida de masa muscular, sino saturación del Sistema Nervioso Central y acumulación de fatiga en la unión neuromuscular. **Prescripción del Coach:** Realizá una sesión de descarga técnica reduciendo el peso un 10% (${Math.round(bestHistorical * 0.75)} kg) y descansá 4 minutos completos entre series.`;
    nextTargetLoadKg = Math.round(bestHistorical * 0.75 * 2) / 2;
    nextTargetRepsStr = '3 reps con RIR 3-4 (Descarga Activa)';
    recommendedRestSeconds = 240;
    strengthPillarRating = 'Fase de Descarga Requerida';
  } else if (isPlateau) {
    status = 'PLATEAU';
    statusLabel = 'Meseta / Estancamiento Temporal';
    statusBadgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    coachHeadline = 'Meseta de Adaptación Detectada';
    coachDiagnosis = `Llevás varias sesiones estabilizado en ${current1Rm} kg sin variación significativa. Para romper este estancamiento según la escuela soviética de Prilepin, cambiá el estímulo: utilizá series tipo PAP (Potenciación Post-Activación) o agregá una serie de trabajo a menor repetición con mayor aceleración concéntrica.`;
    nextTargetLoadKg = Math.round((current1Rm + microIncrement) * 2) / 2;
    nextTargetRepsStr = '2 a 3 reps a máxima velocidad concéntrica';
    recommendedRestSeconds = 240;
    strengthPillarRating = 'Demanda de Variación Estímulo';
  } else {
    status = 'STEADY_PROGRESSION';
    statusLabel = 'Progresión Ascendente';
    statusBadgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    coachHeadline = 'Consistencia y Adaptación Sólida';
    coachDiagnosis = `Tu progresión en ${exerciseName} marcha de forma impecable: +${netProgressionKg} kg (+${netProgressionPct}%) desde tu inicio. Estás a ${standards.kgToNextTier > 0 ? `${standards.kgToNextTier} kg de subir a nivel ${standards.nextTierLabel}` : 'la cúspide de la categoría Élite'}. El objetivo para tu próximo bloque es sumar +${microIncrement} kg a tu serie principal manteniendo la técnica pulida.`;
    nextTargetLoadKg = Math.round((current1Rm + microIncrement) * 2) / 2;
    nextTargetRepsStr = '4 a 5 reps a RIR 1-2';
    recommendedRestSeconds = 180;
    strengthPillarRating = 'Alta Consistencia';
  }

  return {
    exerciseName,
    sessionsLogged: count,
    baseline1Rm,
    current1Rm,
    netProgressionKg,
    netProgressionPct,
    status,
    statusLabel,
    statusBadgeColor,
    coachHeadline,
    coachDiagnosis,
    nextTargetLoadKg,
    nextTargetRepsStr,
    recommendedRestSeconds,
    biomechanicalCue: pattern.cue,
    strengthPillarRating,
  };
}
