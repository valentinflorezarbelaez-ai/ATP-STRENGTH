import { LoadPrescription } from './types';

/**
 * Pure calculation engine for 1RM estimation, Training Max and Phase Load Prescription.
 */

export const DEFAULT_TRAINING_MAX_PERCENT = 0.90; // 90% of 1RM
export const DEFAULT_ROUNDING_KG = 2.5; // Round to nearest 2.5 kg

/**
 * Default percentage of Training Max per preparation / work phase
 */
export const DEFAULT_PHASE_PERCENTAGES: Record<number, number> = {
  0: 0,    // Fase 0: Movilidad (sin carga)
  1: 0.20, // Fase 1: Activación (20% TM o barra vacía)
  2: 0.40, // Fase 2: Aproximación ligera (40% TM)
  3: 0.60, // Fase 3: Aproximación media (60% TM)
  4: 0.80, // Fase 4: Aproximación pesada / PAP (80% TM)
  5: 0.85  // Fase 5: Series de Fuerza Real (80-85% TM, por defecto 85%)
};

/**
 * Estimates 1RM using the Epley formula: 1RM = Weight * (1 + Reps / 30)
 * Valid for reps 1 to 15. If reps is 1, returns weight directly.
 */
export function estimateEpley1RM(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) {
    throw new Error('El peso y las repeticiones deben ser mayores a 0.');
  }
  if (reps > 15) {
    throw new Error('Las fórmulas de estimación de 1RM pierden validez con más de 15 repeticiones.');
  }
  if (reps === 1) {
    return weightKg;
  }
  return weightKg * (1 + reps / 30);
}

/**
 * Estimates 1RM using the Brzycki formula: 1RM = Weight * (36 / (37 - Reps))
 * Valid for reps 1 to 15.
 */
export function estimateBrzycki1RM(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) {
    throw new Error('El peso y las repeticiones deben ser mayores a 0.');
  }
  if (reps > 15) {
    throw new Error('Las fórmulas de estimación de 1RM pierden validez con más de 15 repeticiones.');
  }
  if (reps === 1) {
    return weightKg;
  }
  return weightKg * (36 / (37 - reps));
}

/**
 * Estimates 1RM based on chosen method ('epley' | 'brzycki' | 'direct')
 */
export function estimate1RM(
  weightKg: number,
  reps: number,
  method: 'epley' | 'brzycki' | 'direct' = 'epley'
): number {
  if (method === 'direct' || reps === 1) {
    if (weightKg <= 0) throw new Error('El peso debe ser mayor a 0.');
    return weightKg;
  }
  if (method === 'brzycki') {
    return estimateBrzycki1RM(weightKg, reps);
  }
  return estimateEpley1RM(weightKg, reps);
}

/**
 * Rounds a load to the specified minimal plate increment (e.g. 1.25, 2.5, 5 kg).
 */
export function roundLoad(weightKg: number, incrementKg: number = DEFAULT_ROUNDING_KG): number {
  if (incrementKg <= 0) return weightKg;
  return Math.round(weightKg / incrementKg) * incrementKg;
}

/**
 * Calculates the Training Max (TM) from a 1RM and percentage (e.g., 90%).
 */
export function calculateTrainingMax(
  oneRepMaxKg: number,
  trainingMaxPercent: number = DEFAULT_TRAINING_MAX_PERCENT
): number {
  if (oneRepMaxKg <= 0 || trainingMaxPercent <= 0) return 0;
  return oneRepMaxKg * trainingMaxPercent;
}

/**
 * Prescribes load for a specific phase (0-5) based on 1RM, TM percentage, phase percentage and rounding increment.
 * Handles both standard barbell exercises and bodyweight exercises with added external load.
 */
export function prescribeLoad(
  oneRepMaxKg: number,
  trainingMaxPercent: number = DEFAULT_TRAINING_MAX_PERCENT,
  phasePercent: number,
  incrementKg: number = DEFAULT_ROUNDING_KG,
  isBodyweight: boolean = false,
  bodyweightKg: number = 75
): LoadPrescription {
  if (phasePercent <= 0 || oneRepMaxKg <= 0) {
    return {
      phase: 0,
      percentageOfTrainingMax: phasePercent,
      targetWeightKg: 0,
      rawWeightKg: 0,
      isBodyweight
    };
  }

  if (isBodyweight) {
    // For bodyweight exercises (e.g. dips / pullups):
    // Total system mass at 1RM = bodyweight + added1RM
    const total1RM = bodyweightKg + oneRepMaxKg;
    const totalTM = total1RM * trainingMaxPercent;
    const rawTargetTotal = totalTM * phasePercent;
    const rawAddedWeight = Math.max(0, rawTargetTotal - bodyweightKg);
    const targetAddedWeight = roundLoad(rawAddedWeight, incrementKg);

    return {
      phase: 0,
      percentageOfTrainingMax: phasePercent,
      targetWeightKg: targetAddedWeight,
      rawWeightKg: Math.round(rawAddedWeight * 100) / 100,
      isBodyweight: true
    };
  }

  const trainingMaxKg = calculateTrainingMax(oneRepMaxKg, trainingMaxPercent);
  const rawTargetKg = trainingMaxKg * phasePercent;
  const targetWeightKg = roundLoad(rawTargetKg, incrementKg);

  return {
    phase: 0,
    percentageOfTrainingMax: phasePercent,
    targetWeightKg,
    rawWeightKg: Math.round(rawTargetKg * 100) / 100,
    isBodyweight: false
  };
}

/**
 * Generates load prescriptions for all phases (0 to 5) for an exercise.
 */
export function generateAllPhasePrescriptions(
  oneRepMaxKg?: number,
  trainingMaxPercent: number = DEFAULT_TRAINING_MAX_PERCENT,
  roundingKg: number = DEFAULT_ROUNDING_KG,
  customPhasePercentages?: Record<number, number>,
  isBodyweight: boolean = false,
  bodyweightKg: number = 75
): Record<number, LoadPrescription> {
  const result: Record<number, LoadPrescription> = {};
  const phasePercentages = { ...DEFAULT_PHASE_PERCENTAGES, ...customPhasePercentages };

  for (let phase = 0; phase <= 5; phase++) {
    const pct = phasePercentages[phase] ?? 0;
    if (!oneRepMaxKg || oneRepMaxKg <= 0) {
      result[phase] = {
        phase,
        percentageOfTrainingMax: pct,
        targetWeightKg: 0,
        rawWeightKg: 0,
        isBodyweight
      };
    } else {
      const p = prescribeLoad(
        oneRepMaxKg,
        trainingMaxPercent,
        pct,
        roundingKg,
        isBodyweight,
        bodyweightKg
      );
      p.phase = phase;
      result[phase] = p;
    }
  }

  return result;
}
