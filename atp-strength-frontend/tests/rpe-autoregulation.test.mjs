/**
 * SPEC-0003 — Neuromuscular Autoregulation Engine (RPE/RIR & Dynamic e1RM)
 * Mike Tuchscherer / Reactive Training Systems Standard Matrix
 * Run: node --test tests/rpe-autoregulation.test.mjs
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  TUCHSCHERER_RPE_MATRIX,
  getPercentage1Rm,
  computeEstimated1Rm,
  calculateTargetLoad,
  computeAutoregulatedAdjustment,
  rpeToRir,
  rirToRpe,
} from '../src/lib/rpeEngine.mjs';

describe('SPEC-0003 Neuromuscular Autoregulation Engine', () => {
  describe('REQ-EARS-AUTO-01: Tuchscherer %1RM Matrix Lookup', () => {
    it('ensures TUCHSCHERER_RPE_MATRIX is frozen and immutable', () => {
      assert.equal(Object.isFrozen(TUCHSCHERER_RPE_MATRIX), true);
      assert.equal(TUCHSCHERER_RPE_MATRIX[1][10.0], 1.0);
    });

    it('returns exact 100% for 1 rep @ RPE 10', () => {
      assert.equal(getPercentage1Rm(1, 10.0), 1.0);
    });

    it('returns expected percentages across representative rep/rpe anchors', () => {
      assert.equal(getPercentage1Rm(1, 9.0), 0.955);
      assert.equal(getPercentage1Rm(1, 8.0), 0.922);
      assert.equal(getPercentage1Rm(3, 8.0), 0.863);
      assert.equal(getPercentage1Rm(5, 8.0), 0.807);
      assert.equal(getPercentage1Rm(5, 10.0), 0.863);
      assert.equal(getPercentage1Rm(10, 10.0), 0.723);
      assert.equal(getPercentage1Rm(10, 6.5), 0.626);
    });

    it('calculates correct RIR from RPE and vice-versa', () => {
      assert.equal(rpeToRir(10.0), 0);
      assert.equal(rpeToRir(9.0), 1);
      assert.equal(rpeToRir(8.0), 2);
      assert.equal(rpeToRir(7.5), 2.5);
      assert.equal(rirToRpe(0), 10.0);
      assert.equal(rirToRpe(2), 8.0);
    });
  });

  describe('REQ-EARS-AUTO-04: Bounds and Error Validation', () => {
    it('throws ERR-FUE-INVALID-RPE-PARAMETERS for out of bounds reps', () => {
      assert.throws(() => getPercentage1Rm(0, 8.0), /ERR-FUE-INVALID-RPE-PARAMETERS/);
      assert.throws(() => getPercentage1Rm(11, 8.0), /ERR-FUE-INVALID-RPE-PARAMETERS/);
      assert.throws(() => getPercentage1Rm(-2, 8.0), /ERR-FUE-INVALID-RPE-PARAMETERS/);
    });

    it('throws ERR-FUE-INVALID-RPE-PARAMETERS for out of bounds RPE', () => {
      assert.throws(() => getPercentage1Rm(5, 6.0), /ERR-FUE-INVALID-RPE-PARAMETERS/);
      assert.throws(() => getPercentage1Rm(5, 10.5), /ERR-FUE-INVALID-RPE-PARAMETERS/);
      assert.throws(() => getPercentage1Rm(5, 8.3), /ERR-FUE-INVALID-RPE-PARAMETERS/);
    });

    it('throws ERR-FUE-INVALID-RPE-PARAMETERS for non-positive weight in e1RM', () => {
      assert.throws(() => computeEstimated1Rm(0, 5, 8.0), /ERR-FUE-INVALID-RPE-PARAMETERS/);
      assert.throws(() => computeEstimated1Rm(-50, 5, 8.0), /ERR-FUE-INVALID-RPE-PARAMETERS/);
    });
  });

  describe('REQ-EARS-AUTO-02: Dynamic e1RM Computation', () => {
    it('calculates 100 kg 1 rep @ RPE 10 to exact 100 kg e1RM', () => {
      const e1rm = computeEstimated1Rm(100, 1, 10.0);
      assert.equal(e1rm, 100.0);
    });

    it('calculates 140 kg 3 reps @ RPE 8.0 to 162.2 kg e1RM', () => {
      // 140 / 0.863 = 162.2248 -> 162.2
      const e1rm = computeEstimated1Rm(140, 3, 8.0);
      assert.equal(e1rm, 162.2);
    });

    it('calculates 100 kg 5 reps @ RPE 10.0 to 115.9 kg e1RM', () => {
      // 100 / 0.863 = 115.8748 -> 115.9
      const e1rm = computeEstimated1Rm(100, 5, 10.0);
      assert.equal(e1rm, 115.9);
    });
  });

  describe('REQ-EARS-AUTO-03: Next-Set Autoregulation and Load Prescription', () => {
    it('prescribes rounded target load based on implement step', () => {
      // e1RM = 162.2 kg. Target 3 reps @ RPE 8.0 (86.3%) = 139.97 kg -> 140.0 kg (step 2.5)
      const target = calculateTargetLoad(162.2, 3, 8.0, 2.5);
      assert.equal(target, 140.0);
    });

    it('Scenario 02: Adjusts load down on unexpected RPE overshoot (fatigue detected)', () => {
      // Prescribed 3 reps @ RPE 8.0. Lifter does 140 kg but hits RPE 9.5 (overshoot +1.5)
      const result = computeAutoregulatedAdjustment({
        weightKg: 140,
        reps: 3,
        rpe: 9.5,
        targetReps: 3,
        targetRpe: 8.0,
        implementStepKg: 2.5,
      });

      // e1RM = 140 / 0.907 = 154.355 -> 154.4 kg
      assert.equal(result.e1rm, 154.4);
      // Next target load = 154.355 * 0.863 = 133.2 -> rounded to nearest 2.5 = 132.5 kg
      assert.equal(result.nextTargetWeight, 132.5);
      assert.equal(result.deltaKg, -7.5);
      assert.equal(result.rpeOvershoot, 1.5);
      assert.equal(result.fatigueDetected, true);
    });

    it('Scenario 03: Adjusts load up on unexpected RPE undershoot (supercompensation)', () => {
      // Prescribed 3 reps @ RPE 8.0. Lifter does 140 kg but hits RPE 6.5 (undershoot -1.5)
      const result = computeAutoregulatedAdjustment({
        weightKg: 140,
        reps: 3,
        rpe: 6.5,
        targetReps: 3,
        targetRpe: 8.0,
        implementStepKg: 2.5,
      });

      // e1RM = 140 / 0.821 = 170.523 -> 170.5 kg
      assert.equal(result.e1rm, 170.5);
      // Next target load = 170.523 * 0.863 = 147.16 -> rounded to nearest 2.5 = 147.5 kg
      assert.equal(result.nextTargetWeight, 147.5);
      assert.equal(result.deltaKg, 7.5);
      assert.equal(result.rpeOvershoot, -1.5);
      assert.equal(result.fatigueDetected, false);
    });

    it('preserves load when actual RPE matches target exactly', () => {
      const result = computeAutoregulatedAdjustment({
        weightKg: 140,
        reps: 3,
        rpe: 8.0,
        targetReps: 3,
        targetRpe: 8.0,
        implementStepKg: 2.5,
      });

      assert.equal(result.nextTargetWeight, 140.0);
      assert.equal(result.deltaKg, 0.0);
      assert.equal(result.rpeOvershoot, 0.0);
      assert.equal(result.fatigueDetected, false);
    });
  });
});
