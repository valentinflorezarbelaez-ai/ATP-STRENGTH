/**
 * SPEC-0008 — Workout Domain Strategies & Olympic Power Suite Tests.
 * Run: node --test tests/workoutStrategies.test.mjs
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  SCHEDULE_DAYS,
  ALL_TRACKABLE_EXERCISES,
  DEFAULT_BASE_MAXES,
  getExerciseCategory,
  computeNeuromuscularRamp,
  computeOneRm,
  computeMetrics,
  getBaselineMaxes,
  calculateSessionStats,
  resolvePhaseInstruction,
  getWarmupRestConfig,
} from '../src/lib/workoutStrategiesCore.mjs';

describe('SPEC-0008 Workout Strategies & Olympic Power Suite', () => {
  describe('Exercise Catalog & Category Classification', () => {
    it('contains all 23 trackable exercises including elite Olympic & ballistic lifts', () => {
      assert.equal(ALL_TRACKABLE_EXERCISES.length, 23);
      const requiredOlympic = [
        'Power Clean (Cargada de Potencia)',
        'Hang Power Clean (Cargada Colgada)',
        'Power Snatch (Arrancada de Potencia)',
        'Hang Power Snatch (Arrancada Colgada)',
        'Push Press (Press de Empuje)',
        'Power Jerk (Envión de Potencia)',
        'Clean High Pull (Tirón Alto de Cargada)',
        'Snatch High Pull (Tirón Alto de Arrancada)',
        'Sentadilla con Salto con Barra (Barbell Jump Squat)',
        'Salto con Trap Bar (Trap Bar Jump)',
        'Peso Muerto con Déficit (Deficit Deadlift)',
        'Peso Muerto Agarre Arrancada (Snatch Grip Deadlift)',
      ];
      for (const ex of requiredOlympic) {
        assert.ok(ALL_TRACKABLE_EXERCISES.includes(ex), `Missing exercise: ${ex}`);
      }
    });

    it('classifies Olympic and ballistic lifts as olympic_bar category', () => {
      assert.equal(getExerciseCategory('Power Clean (Cargada de Potencia)'), 'olympic_bar');
      assert.equal(getExerciseCategory('Push Press (Press de Empuje)'), 'olympic_bar');
      assert.equal(getExerciseCategory('Sentadilla con Salto con Barra (Barbell Jump Squat)'), 'olympic_bar');
      assert.equal(getExerciseCategory('Salto con Trap Bar (Trap Bar Jump)'), 'olympic_bar');
      assert.equal(getExerciseCategory('Peso Muerto con Déficit (Deficit Deadlift)'), 'olympic_bar');
      assert.equal(getExerciseCategory('Dominadas Lastradas'), 'bodyweight_weighted');
      assert.equal(getExerciseCategory('Curl Bíceps Barra Z'), 'ez_bar');
      assert.equal(getExerciseCategory('Paseo del Granjero Pesado'), 'dumbbells');
    });

    it('has calibrated base maxes and baseline generation for all 23 exercises', () => {
      const baselines = getBaselineMaxes();
      for (const ex of ALL_TRACKABLE_EXERCISES) {
        assert.ok(DEFAULT_BASE_MAXES[ex], `Missing DEFAULT_BASE_MAXES entry for ${ex}`);
        assert.ok(baselines[ex], `Missing baseline for ${ex}`);
        assert.ok(baselines[ex].one_rep_max > 0, `1RM must be > 0 for ${ex}`);
        assert.ok(baselines[ex].training_max > 0, `TM must be > 0 for ${ex}`);
        assert.ok(baselines[ex].prescriptions.phase_5_work > 0, `Phase 5 work load must be > 0 for ${ex}`);
      }
    });
  });

  describe('Neuromuscular Ramping & Mechanical Safety', () => {
    it('enforces strictly ascending ramp for Olympic lifts (F1 <= F2 <= F3 <= F4 <= F5)', () => {
      const baselines = getBaselineMaxes();
      const olympicExercises = [
        'Power Clean (Cargada de Potencia)',
        'Power Snatch (Arrancada de Potencia)',
        'Push Press (Press de Empuje)',
        'Clean High Pull (Tirón Alto de Cargada)',
      ];

      for (const name of olympicExercises) {
        const p = baselines[name].prescriptions;
        assert.equal(p.phase_1_activation, 20, `${name} F1 must be empty 20kg bar`);
        assert.ok(p.phase_1_activation <= p.phase_2_light, `${name}: F1 (${p.phase_1_activation}) must be <= F2 (${p.phase_2_light})`);
        assert.ok(p.phase_2_light <= p.phase_3_medium, `${name}: F2 (${p.phase_2_light}) must be <= F3 (${p.phase_3_medium})`);
        assert.ok(p.phase_3_medium <= p.phase_4_pap, `${name}: F3 (${p.phase_3_medium}) must be <= F4 (${p.phase_4_pap})`);
        assert.ok(p.phase_4_pap <= p.phase_5_work, `${name}: F4 (${p.phase_4_pap}) must be <= F5 (${p.phase_5_work})`);
      }
    });

    it('handles ballistic jump squats with safe light ramp', () => {
      const ramp = computeNeuromuscularRamp('Sentadilla con Salto con Barra (Barbell Jump Squat)', 35);
      assert.equal(ramp.f1, 20);
      assert.ok(ramp.f5 >= 20);
    });
  });

  describe('Día E (Potencia Olímpica) & Weekly Schedule Structure', () => {
    it('schedules exactly 7 days: 5 training days and 2 central recovery rest days', () => {
      assert.equal(SCHEDULE_DAYS.length, 7);
      const activeDays = SCHEDULE_DAYS.filter((d) => !d.isRest);
      const restDays = SCHEDULE_DAYS.filter((d) => d.isRest);
      assert.equal(activeDays.length, 5);
      assert.equal(restDays.length, 2);
    });

    it('configures Día E with 5 high-power explosive exercises and >= 180s ATP-PC rest', () => {
      const dayE = SCHEDULE_DAYS.find((d) => d.key === 'DAY_E');
      assert.ok(dayE, 'Día E must exist');
      assert.equal(dayE.name, 'Sábado - Día E');
      assert.equal(dayE.focus, 'Potencia Olímpica & RFD Explosiva');
      assert.equal(dayE.exercises.length, 5);

      for (const ex of dayE.exercises) {
        assert.ok(ex.restSeconds >= 180, `Rest for ${ex.name} must be >= 180s to allow complete ATP-PC resynthesis`);
        assert.ok(ex.cue.length > 20, `Cue for ${ex.name} must provide rich biomechanical instructions`);
      }
    });

    it('provides Sunday as absolute central nervous system supercompensation', () => {
      const daySun = SCHEDULE_DAYS.find((d) => d.key === 'DAY_REST_SUN');
      assert.ok(daySun, 'DAY_REST_SUN must exist');
      assert.ok(daySun.isRest);
      assert.ok(daySun.restMessage?.includes('Supercompensación Central Obligatoria'));
    });
  });

  describe('Session Calculation & Fatigue Tonnage on Día E', () => {
    it('calculates session stats and INOL for Día E workout execution', () => {
      const dayE = SCHEDULE_DAYS.find((d) => d.key === 'DAY_E');
      const baselines = getBaselineMaxes();

      // Simulate athlete completing 3 sets of Power Clean and all warmups
      const completedSetsMap = {
        'Power Clean (Cargada de Potencia)': [1, 2, 3],
      };
      const completedWarmupMap = {
        'Power Clean (Cargada de Potencia)': ['F1', 'F2', 'F3', 'F4'],
      };

      const stats = calculateSessionStats(dayE, completedSetsMap, completedWarmupMap, baselines);
      assert.ok(stats.tonnageKg > 0, 'Tonnage must be positive');
      assert.ok(stats.totalReps > 0, 'Reps must be positive');
      assert.equal(stats.totalEffectiveSets, 3);
      assert.ok(stats.sessionInol.totalInol > 0, 'Session INOL must be calculated');
    });

    it('resolves phase instruction and warmup rest config cleanly', () => {
      const cfgF4 = getWarmupRestConfig('F4');
      assert.equal(cfgF4.time, 180);
      assert.equal(cfgF4.next, '1');

      const dayE = SCHEDULE_DAYS.find((d) => d.key === 'DAY_E');
      const powerClean = dayE.exercises[0];
      const baselines = getBaselineMaxes();
      const p = baselines[powerClean.name].prescriptions;

      const f1Inst = resolvePhaseInstruction('F1', p, powerClean, 1, false);
      assert.equal(f1Inst.isWarmup, true);
      assert.equal(f1Inst.weight, 20);

      const s1Inst = resolvePhaseInstruction('1', p, powerClean, 1, false);
      assert.equal(s1Inst.isWarmup, false);
      assert.equal(s1Inst.weight, p.phase_5_work);
    });
  });
});
