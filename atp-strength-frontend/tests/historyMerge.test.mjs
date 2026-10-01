/**
 * Local-first exercise history merge.
 * Run: node --test tests/historyMerge.test.mjs
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  HISTORY_MATCH_WINDOW_MS,
  mergeExerciseHistory,
} from "../src/lib/historyMerge.mjs";

const LOCAL_NEW = {
  id: "set_200_abc",
  timestamp: "2026-10-01T18:05:00.000Z",
  exercise_name: "Sentadilla Trasera",
  set_number: 3,
  load_kg: 150,
  completed_reps: 3,
  prescribed_reps: 3,
  rpe: 8.5,
  rir: 1.5,
  e1rm: 174.2,
  notes: "RPE 8.5",
  is_pr: true,
};

const SERVER_OLD = {
  id: 11,
  timestamp: "2026-09-20T16:00:00.000Z",
  exercise_name: "Sentadilla Trasera",
  set_number: 1,
  prescribed_reps: 3,
  completed_reps: 3,
  load_kg: 140,
  rest_seconds: 240,
  notes: "RPE 8",
  completed: true,
  e1rm: 162.2,
  rpe: 8,
  client_sync_id: "WAL-old",
};

describe("mergeExerciseHistory", () => {
  it("returns local sets when the server has nothing", () => {
    const merged = mergeExerciseHistory([LOCAL_NEW], []);
    assert.equal(merged.length, 1);
    assert.equal(merged[0].id, "set_200_abc");
    assert.equal(merged[0].is_pr, true);
    assert.equal(merged[0].rest_seconds, 180);
    assert.equal(merged[0].completed, true);
  });

  it("returns server sets when the device has nothing", () => {
    const merged = mergeExerciseHistory([], [SERVER_OLD]);
    assert.equal(merged.length, 1);
    assert.equal(merged[0].id, 11);
    assert.equal(merged[0].rest_seconds, 240);
    assert.equal(merged[0].client_sync_id, "WAL-old");
  });

  it("keeps a local set that the server has not stored yet", () => {
    const merged = mergeExerciseHistory([LOCAL_NEW], [SERVER_OLD]);
    assert.equal(merged.length, 2);
    assert.equal(merged[0].id, "set_200_abc");
    assert.equal(merged[0].is_pr, true);
    assert.equal(merged[1].id, 11);
  });

  it("collapses a synced set and keeps the local PR flag and lift time", () => {
    const serverCopy = {
      id: 42,
      timestamp: "2026-10-01T18:07:30.000Z",
      exercise_name: "sentadilla trasera",
      set_number: 3,
      prescribed_reps: 3,
      completed_reps: 3,
      load_kg: 150,
      rest_seconds: 240,
      notes: "RPE 8.5",
      completed: true,
      e1rm: 174.2,
      rpe: 8.5,
      client_sync_id: "WAL-42",
    };

    const merged = mergeExerciseHistory([LOCAL_NEW], [serverCopy, SERVER_OLD]);
    assert.equal(merged.length, 2);
    const fresh = merged.find((item) => item.load_kg === 150);
    assert.equal(fresh.id, "set_200_abc");
    assert.equal(fresh.is_pr, true);
    assert.equal(fresh.timestamp, LOCAL_NEW.timestamp);
    assert.equal(fresh.rest_seconds, 240);
    assert.equal(fresh.client_sync_id, "WAL-42");
    assert.equal(fresh.notes, "RPE 8.5");
  });

  it("does not collapse the same prescription logged on a later week", () => {
    const nextWeek = {
      ...LOCAL_NEW,
      id: "set_next_week",
      timestamp: "2026-10-09T18:05:00.000Z",
      is_pr: false,
    };
    const serverCopy = {
      id: 42,
      timestamp: LOCAL_NEW.timestamp,
      exercise_name: "Sentadilla Trasera",
      set_number: 3,
      prescribed_reps: 3,
      completed_reps: 3,
      load_kg: 150,
      rest_seconds: 240,
      notes: "RPE 8.5",
      completed: true,
    };

    const merged = mergeExerciseHistory([LOCAL_NEW, nextWeek], [serverCopy]);
    assert.equal(merged.length, 2);
    assert.ok(merged.some((item) => item.id === "set_next_week"));
    assert.ok(HISTORY_MATCH_WINDOW_MS < 8 * 24 * 60 * 60 * 1000);
  });

  it("matches on shared id even when timestamps are far apart", () => {
    const local = { ...LOCAL_NEW, id: 42, timestamp: "2026-01-01T00:00:00.000Z" };
    const server = { ...SERVER_OLD, id: 42, timestamp: "2026-10-01T00:00:00.000Z", load_kg: 999 };
    const merged = mergeExerciseHistory([local], [server]);
    assert.equal(merged.length, 1);
    assert.equal(merged[0].id, 42);
    assert.equal(merged[0].load_kg, 999);
    assert.equal(merged[0].timestamp, local.timestamp);
    assert.equal(merged[0].is_pr, true);
  });

  it("matches a server row to the local id stored as client_sync_id", () => {
    const server = {
      ...SERVER_OLD,
      id: 77,
      load_kg: 20,
      set_number: 9,
      client_sync_id: LOCAL_NEW.id,
      timestamp: "2025-01-01T00:00:00.000Z",
    };
    const merged = mergeExerciseHistory([LOCAL_NEW], [server]);
    assert.equal(merged.length, 1);
    assert.equal(merged[0].id, LOCAL_NEW.id);
    assert.equal(merged[0].client_sync_id, LOCAL_NEW.id);
  });

  it("treats missing lists as empty", () => {
    assert.deepEqual(mergeExerciseHistory(null, undefined), []);
  });
});
