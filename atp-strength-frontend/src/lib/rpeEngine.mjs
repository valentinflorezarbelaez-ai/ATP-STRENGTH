/**
 * SPEC-0003: Pure Neuromuscular Autoregulation Engine
 * Implementation of Mike Tuchscherer / Reactive Training Systems %1RM Matrix
 * Zero runtime dependencies (L0 pure module).
 */

export const VALID_RPE_VALUES = Object.freeze([6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0]);

/**
 * Tuchscherer RTS Table: Reps (1..10) x RPE (6.5..10.0) -> %1RM (0..1)
 */
export const TUCHSCHERER_RPE_MATRIX = Object.freeze({
  1: { 10.0: 1.0, 9.5: 0.978, 9.0: 0.955, 8.5: 0.939, 8.0: 0.922, 7.5: 0.907, 7.0: 0.892, 6.5: 0.878 },
  2: { 10.0: 0.955, 9.5: 0.939, 9.0: 0.922, 8.5: 0.907, 8.0: 0.892, 7.5: 0.878, 7.0: 0.863, 6.5: 0.849 },
  3: { 10.0: 0.922, 9.5: 0.907, 9.0: 0.892, 8.5: 0.878, 8.0: 0.863, 7.5: 0.849, 7.0: 0.837, 6.5: 0.821 },
  4: { 10.0: 0.892, 9.5: 0.878, 9.0: 0.863, 8.5: 0.849, 8.0: 0.837, 7.5: 0.821, 7.0: 0.807, 6.5: 0.794 },
  5: { 10.0: 0.863, 9.5: 0.849, 9.0: 0.837, 8.5: 0.821, 8.0: 0.807, 7.5: 0.794, 7.0: 0.782, 6.5: 0.768 },
  6: { 10.0: 0.837, 9.5: 0.821, 9.0: 0.807, 8.5: 0.794, 8.0: 0.782, 7.5: 0.768, 7.0: 0.753, 6.5: 0.739 },
  7: { 10.0: 0.807, 9.5: 0.794, 9.0: 0.782, 8.5: 0.768, 8.0: 0.753, 7.5: 0.739, 7.0: 0.723, 6.5: 0.707 },
  8: { 10.0: 0.782, 9.5: 0.768, 9.0: 0.753, 8.5: 0.739, 8.0: 0.723, 7.5: 0.707, 7.0: 0.694, 6.5: 0.680 },
  9: { 10.0: 0.753, 9.5: 0.739, 9.0: 0.723, 8.5: 0.707, 8.0: 0.694, 7.5: 0.680, 7.0: 0.667, 6.5: 0.653 },
  10: { 10.0: 0.723, 9.5: 0.707, 9.0: 0.694, 8.5: 0.680, 8.0: 0.667, 7.5: 0.653, 7.0: 0.640, 6.5: 0.626 },
});

/**
 * Validates rep count and RPE input values according to SPEC-0003.
 */
function assertValidRpeParameters(reps, rpe) {
  if (!Number.isInteger(reps) || reps < 1 || reps > 10) {
    throw new Error(`ERR-FUE-INVALID-RPE-PARAMETERS: Reps must be an integer between 1 and 10. Received: ${reps}`);
  }
  const formattedRpe = Number(rpe);
  if (!VALID_RPE_VALUES.includes(formattedRpe)) {
    throw new Error(`ERR-FUE-INVALID-RPE-PARAMETERS: RPE must be one of [${VALID_RPE_VALUES.join(', ')}]. Received: ${rpe}`);
  }
}

/**
 * Returns the %1RM decimal coefficient (e.g. 0.863 for 86.3%) from the matrix.
 */
export function getPercentage1Rm(reps, rpe) {
  assertValidRpeParameters(reps, rpe);
  const repRow = TUCHSCHERER_RPE_MATRIX[reps];
  return repRow[Number(rpe)];
}

/**
 * Converts RPE (Rate of Perceived Exertion) to RIR (Reps in Reserve).
 * RPE 10 = 0 RIR, RPE 9 = 1 RIR, RPE 8 = 2 RIR, etc.
 */
export function rpeToRir(rpe) {
  const val = Number(rpe);
  if (!VALID_RPE_VALUES.includes(val)) {
    throw new Error(`ERR-FUE-INVALID-RPE-PARAMETERS: Invalid RPE: ${rpe}`);
  }
  return Math.round((10 - val) * 10) / 10;
}

/**
 * Converts RIR (Reps in Reserve) to RPE.
 */
export function rirToRpe(rir) {
  const rpe = Math.round((10 - rir) * 10) / 10;
  if (!VALID_RPE_VALUES.includes(rpe)) {
    throw new Error(`ERR-FUE-INVALID-RPE-PARAMETERS: Invalid RIR resulting in non-standard RPE: ${rir} -> ${rpe}`);
  }
  return rpe;
}

/**
 * Calculates estimated 1RM using Tuchscherer matrix.
 * e1RM = weight / %1RM(reps, rpe), rounded to 1 decimal place (0.1 kg).
 */
export function computeEstimated1Rm(weight, reps, rpe) {
  if (typeof weight !== 'number' || weight <= 0 || !Number.isFinite(weight)) {
    throw new Error(`ERR-FUE-INVALID-RPE-PARAMETERS: Weight must be a positive number. Received: ${weight}`);
  }
  const percentage = getPercentage1Rm(reps, rpe);
  const rawE1rm = weight / percentage;
  return Math.round(rawE1rm * 10) / 10;
}

/**
 * Rounds a target load to the nearest implement increment (e.g. 2.5 kg).
 */
export function roundToImplementStep(weight, step = 2.5) {
  if (step <= 0) return weight;
  return Math.round(weight / step) * step;
}

/**
 * Calculates target load for prescribed reps and target RPE based on an e1RM.
 */
export function calculateTargetLoad(e1rm, targetReps, targetRpe, implementStepKg = 2.5) {
  if (e1rm <= 0) return 0;
  const percentage = getPercentage1Rm(targetReps, targetRpe);
  const rawTarget = e1rm * percentage;
  return roundToImplementStep(rawTarget, implementStepKg);
}

/**
 * Computes autoregulated adjustment for the subsequent set based on actual performance.
 *
 * @param {Object} input
 * @param {number} input.weightKg - Load lifted in current set
 * @param {number} input.reps - Reps performed
 * @param {number} input.rpe - RPE experienced
 * @param {number} input.targetReps - Prescribed reps for the next set
 * @param {number} input.targetRpe - Target RPE for the next set
 * @param {number} [input.implementStepKg=2.5] - Plate rounding step
 * @returns {Object} Autoregulation result
 */
export function computeAutoregulatedAdjustment({
  weightKg,
  reps,
  rpe,
  targetReps,
  targetRpe,
  implementStepKg = 2.5,
}) {
  const e1rm = computeEstimated1Rm(weightKg, reps, rpe);
  const intensityPercent = Math.round(getPercentage1Rm(reps, rpe) * 1000) / 10;
  const nextTargetWeight = calculateTargetLoad(e1rm, targetReps, targetRpe, implementStepKg);
  const deltaKg = Math.round((nextTargetWeight - weightKg) * 10) / 10;
  const rpeOvershoot = Math.round((rpe - targetRpe) * 10) / 10;
  const fatigueDetected = rpeOvershoot > 0;

  return {
    e1rm,
    intensityPercent,
    nextTargetWeight,
    deltaKg,
    rpeOvershoot,
    fatigueDetected,
  };
}
