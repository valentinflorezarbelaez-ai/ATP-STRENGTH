/**
 * SPEC-0009 — PR Historical Persistence & Neuromuscular Supercompensation Engine Tests.
 * Run: node --test tests/prHistory.test.mjs
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  HISTORY_STORAGE_KEY,
  MAX_HISTORY_RECORDS,
  getAllHistoryRecords,
  getExerciseHistory,
  getBestHistoricalE1rm,
  recordSetHistory,
  getE1rmProgressionCurve,
  calculateSupercompensationTrend,
} from '../src/lib/prHistoryCore.mjs';
import {
  generateBackupData,
  restoreBackupData,
} from '../src/lib/dataPortabilityCore.mjs';

function createMemoryStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
  };
}

describe('SPEC-0009 PR Historical Persistence & Progression', () => {
  describe('Input Validation & Safeguards', () => {
    it('throws when storage interface is invalid', () => {
      assert.throws(() => recordSetHistory(null, { exercise_name: 'Sentadilla', load_kg: 100, completed_reps: 3 }), /ERR_STORAGE_UNAVAILABLE/);
    });

    it('rejects empty or missing exercise name', () => {
      const storage = createMemoryStorage();
      assert.throws(() => recordSetHistory(storage, { exercise_name: '   ', load_kg: 100, completed_reps: 3 }), /ERR_INVALID_EXERCISE_NAME/);
    });

    it('rejects non-positive load or reps', () => {
      const storage = createMemoryStorage();
      assert.throws(() => recordSetHistory(storage, { exercise_name: 'Sentadilla', load_kg: 0, completed_reps: 3 }), /ERR_INVALID_LOAD/);
      assert.throws(() => recordSetHistory(storage, { exercise_name: 'Sentadilla', load_kg: 100, completed_reps: 0 }), /ERR_INVALID_REPS/);
    });

    it('verifies storage key, capacity limits, and safe empty retrieval', () => {
      assert.equal(typeof HISTORY_STORAGE_KEY, 'string');
      assert.equal(HISTORY_STORAGE_KEY, 'atp_history_records_v1');
      assert.equal(MAX_HISTORY_RECORDS, 2000);
      assert.deepEqual(getAllHistoryRecords(null), []);
      const storage = createMemoryStorage();
      assert.deepEqual(getAllHistoryRecords(storage), []);
    });
  });

  describe('PR Detection & e1RM Calculation', () => {
    it('establishes baseline PR on first recorded set', () => {
      const storage = createMemoryStorage();
      const res = recordSetHistory(storage, {
        exercise_name: 'Sentadilla Trasera',
        set_number: 1,
        load_kg: 140,
        completed_reps: 3,
        rpe: 8.0,
      });

      assert.equal(res.isNewPr, true);
      assert.equal(res.previousBestE1rm, 0);
      assert.equal(res.newBestE1rm, 162.2); // 140 / 0.863 = 162.2
      assert.equal(res.gainKg, 0); // No prior baseline to compare delta
      assert.equal(res.record.is_pr, true);
      assert.equal(res.record.e1rm, 162.2);
    });

    it('detects a new PR when e1RM increases and calculates progression gain', () => {
      const storage = createMemoryStorage();

      // Session 1: 140 kg x 3 @ RPE 8.0 -> e1RM 162.2 kg
      recordSetHistory(storage, {
        exercise_name: 'Sentadilla Trasera',
        set_number: 1,
        load_kg: 140,
        completed_reps: 3,
        rpe: 8.0,
        timestamp: '2026-09-01T10:00:00Z',
      });

      // Session 2: 145 kg x 3 @ RPE 8.0 -> e1RM 168.0 kg (NEW PR)
      const res2 = recordSetHistory(storage, {
        exercise_name: 'Sentadilla Trasera',
        set_number: 1,
        load_kg: 145,
        completed_reps: 3,
        rpe: 8.0,
        timestamp: '2026-09-08T10:00:00Z',
      });

      assert.equal(res2.isNewPr, true);
      assert.equal(res2.previousBestE1rm, 162.2);
      assert.equal(res2.newBestE1rm, 168.0);
      assert.equal(res2.gainKg, 5.8);
      assert.equal(res2.gainPct, 3.6);
      assert.equal(res2.record.is_pr, true);
    });

    it('flags isNewPr=false for submaximal or backoff sets', () => {
      const storage = createMemoryStorage();

      // Heavy top set
      recordSetHistory(storage, {
        exercise_name: 'Press de Banca Plano',
        load_kg: 120,
        completed_reps: 1,
        rpe: 10.0,
      });

      // Backoff set: 100 kg x 5 @ RPE 8.0 -> e1RM ~123.3 kg wait, 100/0.811 = 123.3 is higher, so let's do 90 kg x 5 @ RPE 8.0
      // 90 / 0.811 = 111.0 kg
      const backoff = recordSetHistory(storage, {
        exercise_name: 'Press de Banca Plano',
        load_kg: 90,
        completed_reps: 5,
        rpe: 8.0,
      });

      assert.equal(backoff.isNewPr, false);
      assert.equal(backoff.previousBestE1rm, 120);
      assert.equal(backoff.newBestE1rm, 120);
      assert.equal(backoff.gainKg, 0);
      assert.equal(backoff.record.is_pr, false);
    });
  });

  describe('Exercise Filtering & Chronological Order', () => {
    it('filters records by exercise case-insensitively and sorts chronologically', () => {
      const storage = createMemoryStorage();

      recordSetHistory(storage, {
        exercise_name: 'Sentadilla Trasera',
        load_kg: 140,
        completed_reps: 3,
        timestamp: '2026-09-10T10:00:00Z',
      });
      recordSetHistory(storage, {
        exercise_name: 'Peso Muerto Convencional',
        load_kg: 180,
        completed_reps: 2,
        timestamp: '2026-09-11T10:00:00Z',
      });
      recordSetHistory(storage, {
        exercise_name: 'sentadilla trasera ',
        load_kg: 145,
        completed_reps: 3,
        timestamp: '2026-09-15T10:00:00Z',
      });

      const squatHistory = getExerciseHistory(storage, 'SENTADILLA TRASERA');
      assert.equal(squatHistory.length, 2);
      assert.equal(squatHistory[0].load_kg, 140);
      assert.equal(squatHistory[1].load_kg, 145);

      const bestSquat = getBestHistoricalE1rm(storage, 'sentadilla trasera');
      assert.equal(bestSquat, 168.0);
    });
  });

  describe('Progression Curve Generation', () => {
    it('builds progression curve points with running best and dates', () => {
      const storage = createMemoryStorage();

      recordSetHistory(storage, {
        exercise_name: 'Press Militar de Pie',
        load_kg: 60,
        completed_reps: 5,
        rpe: 8.0,
        timestamp: '2026-09-01T12:00:00Z',
      });
      recordSetHistory(storage, {
        exercise_name: 'Press Militar de Pie',
        load_kg: 65,
        completed_reps: 5,
        rpe: 8.0,
        timestamp: '2026-09-08T12:00:00Z',
      });
      recordSetHistory(storage, {
        exercise_name: 'Press Militar de Pie',
        load_kg: 62.5,
        completed_reps: 5,
        rpe: 8.0,
        timestamp: '2026-09-15T12:00:00Z',
      });

      const curve = getE1rmProgressionCurve(storage, 'Press Militar de Pie');
      assert.equal(curve.length, 3);
      assert.equal(curve[0].isPr, true);
      assert.equal(curve[1].isPr, true);
      assert.equal(curve[2].isPr, false);
      assert.equal(curve[0].dateFormatted, '01/09');
      assert.equal(curve[1].dateFormatted, '08/09');
      assert.equal(curve[2].dateFormatted, '15/09');
    });
  });

  describe('Supercompensation Trend Classification', () => {
    it('classifies baseline and supercompensation states', () => {
      const storage = createMemoryStorage();
      const ex = 'Dominadas Lastradas';

      // 0 sets
      const t0 = calculateSupercompensationTrend(storage, ex);
      assert.equal(t0.status, 'INSUFFICIENT_DATA');

      // 1 set -> Baseline
      recordSetHistory(storage, {
        exercise_name: ex,
        load_kg: 30,
        completed_reps: 5,
        rpe: 8.0,
        timestamp: '2026-09-01T10:00:00Z',
      });
      const t1 = calculateSupercompensationTrend(storage, ex);
      assert.equal(t1.status, 'BASELINE_ESTABLISHED');

      // 2nd set higher -> Supercompensation peak
      recordSetHistory(storage, {
        exercise_name: ex,
        load_kg: 35,
        completed_reps: 5,
        rpe: 8.0,
        timestamp: '2026-09-08T10:00:00Z',
      });
      const t2 = calculateSupercompensationTrend(storage, ex);
      assert.equal(t2.status, 'SUPERCOMPENSATION_PEAK');
      assert.ok(t2.netProgressionKg > 0);
    });
  });

  describe('Data Portability Integration (Backup & Restore)', () => {
    it('includes history in backup bundle and restores it intact', () => {
      const storage = createMemoryStorage();
      recordSetHistory(storage, {
        exercise_name: 'Sentadilla Trasera',
        load_kg: 150,
        completed_reps: 3,
        rpe: 8.5,
      });

      const backup = generateBackupData(storage);
      assert.ok(Array.isArray(backup.history));
      assert.equal(backup.history.length, 1);
      assert.equal(backup.history[0].exercise_name, 'Sentadilla Trasera');

      // Restore to a fresh storage instance
      const freshStorage = createMemoryStorage();
      const res = restoreBackupData(freshStorage, JSON.stringify(backup));
      assert.equal(res.success, true);
      assert.ok(res.restoredKeys.includes('history'));

      const restoredHistory = getExerciseHistory(freshStorage, 'Sentadilla Trasera');
      assert.equal(restoredHistory.length, 1);
      assert.equal(restoredHistory[0].load_kg, 150);
    });
  });
});
