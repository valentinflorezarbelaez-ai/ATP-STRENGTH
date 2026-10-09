/**
 * SPEC-0011 — Athlete Tenancy & Multi-User Partitioning Tests.
 * Verifies strict data isolation between Valentín and Jacobo (Zero Vibe Coding).
 * Run: node --test tests/athleteTenancy.test.mjs
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ATHLETE_PROFILES,
  ACTIVE_ATHLETE_KEY,
  getActiveAthleteId,
  setActiveAthleteId,
  readAthleteScopedItem,
  writeAthleteScopedItem,
} from '../src/lib/athleteProfileCore.mjs';
import {
  recordSetHistory,
  getBestHistoricalE1rm,
  getAllHistoryRecords,
} from '../src/lib/prHistoryCore.mjs';

function createMemoryStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
  };
}

describe('SPEC-0011 Multi-Athlete Tenancy (Valentín vs Jacobo)', () => {
  it('exposes exactly two canonical athlete profiles', () => {
    assert.equal(ATHLETE_PROFILES.length, 2);
    const ids = ATHLETE_PROFILES.map((p) => p.id);
    assert.deepEqual(ids, ['valentin', 'jacobo']);
    assert.equal(ATHLETE_PROFILES[0].name, 'Valentín');
    assert.equal(ATHLETE_PROFILES[1].name, 'Jacobo');
  });

  it('manages active athlete selection and validates IDs', () => {
    const storage = createMemoryStorage();
    assert.equal(getActiveAthleteId(storage), null);

    setActiveAthleteId(storage, 'jacobo');
    assert.equal(getActiveAthleteId(storage), 'jacobo');
    assert.equal(storage.getItem(ACTIVE_ATHLETE_KEY), 'jacobo');

    setActiveAthleteId(storage, 'valentin');
    assert.equal(getActiveAthleteId(storage), 'valentin');
    assert.equal(storage.getItem(ACTIVE_ATHLETE_KEY), 'valentin');
  });

  it('guarantees complete isolation of storage keys between athletes', () => {
    const storage = createMemoryStorage();

    // Jacobo writes custom maxes
    writeAthleteScopedItem(storage, 'neuro_strength_maxes', JSON.stringify({ Squat: 140 }), 'jacobo');
    // Valentín writes custom maxes
    writeAthleteScopedItem(storage, 'neuro_strength_maxes', JSON.stringify({ Squat: 200 }), 'valentin');

    const jacoboMaxes = JSON.parse(readAthleteScopedItem(storage, 'neuro_strength_maxes', 'jacobo'));
    const valentinMaxes = JSON.parse(readAthleteScopedItem(storage, 'neuro_strength_maxes', 'valentin'));

    assert.equal(jacoboMaxes.Squat, 140);
    assert.equal(valentinMaxes.Squat, 200);
  });

  it('provides seamless fallback for Valentín on legacy un-prefixed keys', () => {
    const storage = createMemoryStorage({
      neuro_strength_maxes: JSON.stringify({ Bench: 120 }),
    });

    // Valentín reading before migration returns legacy data
    const valentinData = JSON.parse(readAthleteScopedItem(storage, 'neuro_strength_maxes', 'valentin'));
    assert.equal(valentinData.Bench, 120);

    // Jacobo reading does NOT see Valentín legacy data
    const jacoboData = readAthleteScopedItem(storage, 'neuro_strength_maxes', 'jacobo');
    assert.equal(jacoboData, null);
  });

  it('isolates PR records, sets and e1RMs without cross-pollination', () => {
    const storage = createMemoryStorage();

    // Jacobo records Power Clean PR
    recordSetHistory(
      storage,
      {
        exercise_name: 'Power Clean',
        load_kg: 100,
        completed_reps: 2,
        rpe: 9.0,
      },
      'jacobo'
    );

    // Valentín records Power Clean PR
    recordSetHistory(
      storage,
      {
        exercise_name: 'Power Clean',
        load_kg: 130,
        completed_reps: 1,
        rpe: 10.0,
      },
      'valentin'
    );

    const jacoboHistory = getAllHistoryRecords(storage, 'jacobo');
    const valentinHistory = getAllHistoryRecords(storage, 'valentin');

    assert.equal(jacoboHistory.length, 1);
    assert.equal(valentinHistory.length, 1);
    assert.equal(jacoboHistory[0].load_kg, 100);
    assert.equal(valentinHistory[0].load_kg, 130);

    assert.equal(getBestHistoricalE1rm(storage, 'Power Clean', 'jacobo') < 120, true);
    assert.equal(getBestHistoricalE1rm(storage, 'Power Clean', 'valentin') >= 130, true);
  });
});
