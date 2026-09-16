/**
 * SPEC-0008 — Workout Domain Strategies, Training Programs & Olympic Power Suite Tests.
 * Run: node --test tests/workoutStrategies.test.mjs
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  SCHEDULE_DAYS,
  CLASSIC_DAYS,
  OLYMPIC_DAYS,
  HYBRID_DAYS,
  TRAINING_PROGRAMS,
  getTrainingProgram,
  getProgramDays,
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

describe('SPEC-0008 Workout Strategies & Multi-Program Power Suite', () => {
  describe('Exercise Catalog & Category Classification', () => {
    it('contains all 25 trackable exercises including elite Olympic & ballistic lifts', () => {
      assert.equal(ALL_TRACKABLE_EXERCISES.length, 25);
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

    it('has calibrated base maxes and baseline generation for all 25 exercises', () => {
      const baselines = getBaselineMaxes();
      for (const ex of ALL_TRACKABLE_EXERCISES) {
        assert.ok(DEFAULT_BASE_MAXES[ex], `Missing DEFAULT_BASE_MAXES entry for ${ex}`);
        assert.ok(baselines[ex], `Missing baseline for ${ex}`);
        assert.ok(baselines[ex].one_rep_max >= 0, `1RM must be >= 0 for ${ex}`);
        assert.ok(baselines[ex].training_max >= 0, `TM must be >= 0 for ${ex}`);
        if (ex !== 'Elevaciones Piernas a la Barra') {
          assert.ok(baselines[ex].one_rep_max > 0, `1RM must be > 0 for ${ex}`);
          assert.ok(baselines[ex].prescriptions.phase_5_work > 0, `Phase 5 work load must be > 0 for ${ex}`);
        }
      }
    });
  });

  describe('Multi-Program Architecture (Warrior, Classic, Olympic, Hybrid)', () => {
    it('defines exactly 4 training programs with full metadata', () => {
      assert.equal(TRAINING_PROGRAMS.length, 4);
      const programIds = TRAINING_PROGRAMS.map((p) => p.id);
      assert.deepEqual(programIds, ['warrior', 'hybrid', 'olympic', 'classic']);
    });

    it('validates Program 4: Sistema Híbrido 4 Días: Forja del Guerrero (4 Activos + 3 Descanso)', () => {
      const warrior = getTrainingProgram('warrior');
      assert.equal(warrior.id, 'warrior');
      assert.equal(warrior.days.length, 7);
      const activeDays = warrior.days.filter((d) => !d.isRest);
      const restDays = warrior.days.filter((d) => d.isRest);
      assert.equal(activeDays.length, 4);
      assert.equal(restDays.length, 3);

      // Verify rest days contain Gnostic Motor Center & Vital Capital messages
      for (const restDay of restDays) {
        assert.ok(restDay.restMessage, 'Rest day must have a pedagogical message');
      }

      // Verify Coan Top sets exist in active days
      const dayA = warrior.days.find((d) => d.key === 'DAY_WARRIOR_A');
      assert.equal(dayA.exercises[0].name, 'Press de Banca');
      assert.equal(dayA.exercises[0].restSeconds, 360);

      const dayB = warrior.days.find((d) => d.key === 'DAY_WARRIOR_B');
      assert.equal(dayB.exercises[0].name, 'Sentadilla Trasera');
      assert.equal(dayB.exercises[1].name, 'Peso Muerto Convencional');
      assert.equal(dayB.exercises[1].restSeconds, 420);
    });

    it('validates Program 1: Ciclo Clásico (4 Días de Fuerza Pura + 2 Descanso)', () => {
      const classic = getTrainingProgram('classic');
      assert.equal(classic.id, 'classic');
      assert.equal(classic.days.length, 6);
      const activeDays = classic.days.filter((d) => !d.isRest);
      const restDays = classic.days.filter((d) => d.isRest);
      assert.equal(activeDays.length, 4);
      assert.equal(restDays.length, 2);
    });

    it('validates Program 2: Ciclo Olímpico (4 Días de Potencia & RFD + 2 Descanso)', () => {
      const oly = getTrainingProgram('olympic');
      assert.equal(oly.id, 'olympic');
      assert.equal(oly.days.length, 6);
      const activeDays = oly.days.filter((d) => !d.isRest);
      const restDays = oly.days.filter((d) => d.isRest);
      assert.equal(activeDays.length, 4);
      assert.equal(restDays.length, 2);

      // Verify Olympic program exercises
      const allOlyExercises = activeDays.flatMap((d) => d.exercises.map((e) => e.name));
      assert.ok(allOlyExercises.includes('Power Clean (Cargada de Potencia)'));
      assert.ok(allOlyExercises.includes('Power Snatch (Arrancada de Potencia)'));
      assert.ok(allOlyExercises.includes('Push Press (Press de Empuje)'));
      assert.ok(allOlyExercises.includes('Hang Power Clean (Cargada Colgada)'));
      assert.ok(allOlyExercises.includes('Hang Power Snatch (Arrancada Colgada)'));
    });

    it('validates Program 3: Ciclo Híbrido (5 Días de Fuerza + Potencia Sumadas + 2 Descanso)', () => {
      const hybrid = getTrainingProgram('hybrid');
      assert.equal(hybrid.id, 'hybrid');
      assert.equal(hybrid.days.length, 7);
      const activeDays = hybrid.days.filter((d) => !d.isRest);
      const restDays = hybrid.days.filter((d) => d.isRest);
      assert.equal(activeDays.length, 5);
      assert.equal(restDays.length, 2);

      // Verify Olympic primers in Day A and Day B
      const dayA = hybrid.days.find((d) => d.key === 'DAY_A');
      assert.equal(dayA.exercises[0].name, 'Power Clean (Cargada de Potencia)', 'Day A starts with Power Clean primer');
      assert.equal(dayA.exercises[1].name, 'Sentadilla Trasera', 'Day A follows with heavy Back Squat');

      const dayB = hybrid.days.find((d) => d.key === 'DAY_B');
      assert.equal(dayB.exercises[0].name, 'Power Snatch (Arrancada de Potencia)', 'Day B starts with Power Snatch primer');
      assert.equal(dayB.exercises[1].name, 'Peso Muerto Convencional', 'Day B follows with heavy Deadlift');
    });

    it('guarantees 100% catalog integrity: all exercises across all programs exist in ALL_TRACKABLE_EXERCISES', () => {
      for (const prog of TRAINING_PROGRAMS) {
        for (const day of prog.days) {
          for (const ex of day.exercises) {
            assert.ok(
              ALL_TRACKABLE_EXERCISES.includes(ex.name),
              `Exercise "${ex.name}" in program "${prog.id}" day "${day.name}" is missing from ALL_TRACKABLE_EXERCISES`
            );
          }
        }
      }
    });

    it('falls back safely to default warrior program for unknown programId', () => {
      const fallback = getTrainingProgram('unknown_program_id');
      assert.equal(fallback.id, 'warrior');
      const fallbackDays = getProgramDays('unknown_program_id');
      assert.equal(fallbackDays.length, 7);
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

  describe('Session Calculation & Fatigue Tonnage', () => {
    it('calculates session stats and INOL for workout execution', () => {
      const hybrid = getTrainingProgram('hybrid');
      const dayA = hybrid.days[0];
      const baselines = getBaselineMaxes();

      const completedSetsMap = {
        'Power Clean (Cargada de Potencia)': [1, 2, 3],
        'Sentadilla Trasera': [1, 2, 3, 4, 5],
      };
      const completedWarmupMap = {
        'Power Clean (Cargada de Potencia)': ['F1', 'F2', 'F3', 'F4'],
        'Sentadilla Trasera': ['F1', 'F2', 'F3', 'F4'],
      };

      const stats = calculateSessionStats(dayA, completedSetsMap, completedWarmupMap, baselines);
      assert.ok(stats.tonnageKg > 0, 'Tonnage must be positive');
      assert.ok(stats.totalReps > 0, 'Reps must be positive');
      assert.equal(stats.totalEffectiveSets, 8);
      assert.ok(stats.sessionInol.totalInol > 0, 'Session INOL must be calculated');
    });

    it('resolves phase instruction and warmup rest config cleanly', () => {
      const cfgF4 = getWarmupRestConfig('F4');
      assert.equal(cfgF4.time, 180);
      assert.equal(cfgF4.next, '1');

      const oly = getTrainingProgram('olympic');
      const day1 = oly.days[0];
      const powerClean = day1.exercises[0];
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
