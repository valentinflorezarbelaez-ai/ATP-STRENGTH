/**
 * SPEC-0006 — Athlete Profile & Data Portability Engine Tests.
 * Run: node --test tests/dataPortability.test.mjs
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getOrCreateAthleteProfile,
  updateAthleteName,
  ATHLETE_STORAGE_KEY,
} from '../src/lib/athleteProfileCore.mjs';
import {
  generateBackupData,
  restoreBackupData,
  generateHistoryCsv,
} from '../src/lib/dataPortabilityCore.mjs';

function createMemoryStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
  };
}

describe('SPEC-0006 Athlete Profile & Data Portability', () => {
  describe('Athlete Profile Core', () => {
    it('creates default athlete profile with uuid on first access', () => {
      const storage = createMemoryStorage();
      const profile = getOrCreateAthleteProfile(storage);
      assert.ok(profile.id, 'profile must have an id');
      assert.equal(profile.name, 'Atleta Zen');
      assert.ok(profile.createdAt);
      assert.ok(storage.getItem(ATHLETE_STORAGE_KEY));
    });

    it('updates athlete name with trimming and bounds validation', () => {
      const storage = createMemoryStorage();
      getOrCreateAthleteProfile(storage);
      const updated = updateAthleteName(storage, '  Valentín Flórez  ');
      assert.equal(updated.name, 'Valentín Flórez');

      // Rejects empty or overly long names
      assert.throws(() => updateAthleteName(storage, '   '), /ERR_INVALID_ATHLETE_NAME/);
      assert.throws(() => updateAthleteName(storage, 'a'.repeat(60)), /ERR_INVALID_ATHLETE_NAME/);
    });
  });

  describe('Data Portability & Backup', () => {
    it('generates complete backup bundle from storage keys', () => {
      const storage = createMemoryStorage({
        atp_athlete_profile_v1: JSON.stringify({ id: 'ATH-1', name: 'Titan' }),
        atp_exercise_maxes_v1: JSON.stringify({ Squat: { one_rep_max: 200 } }),
      });

      const backup = generateBackupData(storage);
      assert.equal(backup.version, '1.0');
      assert.ok(backup.exportedAt);
      assert.equal(backup.athlete.name, 'Titan');
      assert.equal(backup.maxes.Squat.one_rep_max, 200);
    });

    it('restores backup safely and rejects malformed payloads', () => {
      const storage = createMemoryStorage();
      const validPayload = JSON.stringify({
        version: '1.0',
        athlete: { id: 'ATH-99', name: 'Iron Lifter' },
        maxes: { Bench: { one_rep_max: 140 } },
      });

      const res = restoreBackupData(storage, validPayload);
      assert.equal(res.success, true);
      assert.equal(JSON.parse(storage.getItem('atp_athlete_profile_v1')).name, 'Iron Lifter');
      assert.equal(JSON.parse(storage.getItem('atp_exercise_maxes_v1')).Bench.one_rep_max, 140);

      // Malformed json
      assert.throws(() => restoreBackupData(storage, '{bad_json}'), /ERR_INVALID_BACKUP_PAYLOAD/);
      // Missing version
      assert.throws(() => restoreBackupData(storage, JSON.stringify({ foo: 'bar' })), /ERR_INVALID_BACKUP_PAYLOAD/);
    });

    it('generates standard CSV for workout history export', () => {
      const records = [
        {
          timestamp: '2026-09-10T12:00:00Z',
          exercise_name: 'Sentadilla Trasera',
          set_number: 1,
          load_kg: 140,
          completed_reps: 3,
          rpe: 8.5,
          rir: 1.5,
          e1rm: 154.4,
        },
      ];

      const csv = generateHistoryCsv(records);
      assert.ok(csv.startsWith('Timestamp,Exercise,Set,Weight_kg,Reps,RPE,RIR,e1RM'));
      assert.ok(csv.includes('Sentadilla Trasera'));
      assert.ok(csv.includes('140,3,8.5,1.5,154.4'));
    });
  });
});
