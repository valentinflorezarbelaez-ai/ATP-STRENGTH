/**
 * SPEC-0007 — Soviet Strength & Prilepin Progression Engine Tests.
 * Run: node --test tests/prilepinEngine.test.mjs
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateInol,
  getPrilepinZone,
  getPrilepinPrescription,
  evaluateSessionInol,
  PRILEPIN_ZONES,
} from '../src/lib/prilepinEngine.mjs';

describe('SPEC-0007 Soviet Prilepin Progression Engine', () => {
  describe('INOL (Intensity Number of Lifts) Calculation', () => {
    it('calculates exact INOL for given reps and intensity %', () => {
      // 3 reps @ 85% -> 3 / (100 - 85) = 3 / 15 = 0.20
      const inol = calculateInol(3, 85);
      assert.equal(inol, 0.2);

      // 5 reps @ 70% -> 5 / 30 = 0.17
      assert.equal(calculateInol(5, 70), 0.17);

      // 1 rep @ 95% -> 1 / 5 = 0.20
      assert.equal(calculateInol(1, 95), 0.2);
    });

    it('clamps or handles boundaries safely', () => {
      assert.equal(calculateInol(0, 80), 0);
      assert.ok(calculateInol(1, 99) > 0);
    });
  });

  describe('Prilepin Table Zones & Exact Rep Prescriptions', () => {
    it('identifies Zone 1 (<70%): Dynamic Effort / Warmup', () => {
      const zone = getPrilepinZone(65);
      assert.equal(zone.key, 'ZONE_55_65');
      assert.ok(PRILEPIN_ZONES.ZONE_55_65);
      assert.equal(zone.optimalReps, 4);
    });

    it('identifies Zone 2 (70-79%): Moderate Power', () => {
      const zone = getPrilepinZone(75);
      assert.equal(zone.key, 'ZONE_70_79');
      assert.equal(zone.optimalReps, 3);
    });

    it('identifies Zone 3 (80-89%): Russian Absolute Strength', () => {
      const zone = getPrilepinZone(85);
      assert.equal(zone.key, 'ZONE_80_89');
      assert.equal(zone.optimalReps, 3);
      assert.deepEqual(zone.repRange, [2, 4]);
    });

    it('identifies Zone 4 (90%+): Peak Neural Force', () => {
      const zone = getPrilepinZone(92);
      assert.equal(zone.key, 'ZONE_90_PLUS');
      assert.equal(zone.optimalReps, 1);
      assert.deepEqual(zone.repRange, [1, 2]);
    });
  });

  describe('Prilepin Full Prescription', () => {
    it('prescribes exact reps and rationale given weight and 1RM', () => {
      // 140 kg with 1RM of 165 kg -> 84.8% -> Zone 80-89% -> exact 3 reps
      const presc = getPrilepinPrescription(140, 165);
      assert.equal(presc.exactTargetReps, 3);
      assert.equal(presc.intensityPercent, 84.8);
      assert.equal(presc.zoneKey, 'ZONE_80_89');
      assert.ok(presc.rationale.includes('Fuerza Absoluta'));
      assert.equal(presc.setInol, 0.2);
    });

    it('falls back cleanly when 1RM is 0 or unavailable', () => {
      const presc = getPrilepinPrescription(100, 0);
      assert.equal(presc.exactTargetReps, 3); // Default standard strength
      assert.equal(presc.intensityPercent, 0);
    });
  });

  describe('Session Accumulated INOL Evaluation', () => {
    it('evaluates fatigue level across multiple sets', () => {
      // 5 sets of 3 reps @ 85% -> 5 * 0.20 = 1.00 INOL
      const sets = [
        { reps: 3, intensity: 85 },
        { reps: 3, intensity: 85 },
        { reps: 3, intensity: 85 },
        { reps: 3, intensity: 85 },
        { reps: 3, intensity: 85 },
      ];
      const evaluation = evaluateSessionInol(sets);
      assert.equal(evaluation.totalInol, 1.0);
      assert.equal(evaluation.status, 'OPTIMAL_STIMULUS');
      assert.ok(evaluation.guidance.includes('Óptimo soviético'));
    });
  });
});
