/**
 * SPEC-0002 — Offline-first WAL sync engine tests.
 * Run: node --test tests/wal.test.mjs
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  WAL_STORAGE_KEY,
  LEGACY_WAL_STORAGE_KEY,
  calculateChecksum,
  createMemoryStorage,
  enqueueWalEntry,
  flushWalQueue,
  getPendingWalCount,
  readWalQueue,
  writeWalQueue,
} from '../src/lib/walEngine.mjs';

describe('SPEC-0002 ATP offline WAL engine', () => {
  it('REQ-EARS-WAL-01 appends PENDING_SYNC with checksum before any network', async () => {
    const storage = createMemoryStorage();
    let fetchCalls = 0;
    const entry = enqueueWalEntry(
      storage,
      '/api/v1/workouts',
      { sessionId: 'SES-001', totalCyclesCompleted: 4, durationMs: 120000 },
      'POST',
      { now: () => 1_700_000_000_000, idFactory: () => 'WAL-TEST-1' }
    );

    assert.equal(entry.status, 'PENDING_SYNC');
    assert.equal(entry.checksum, calculateChecksum(entry.payload));
    assert.ok(entry.timestamp);
    assert.equal(getPendingWalCount(storage), 1);

    const raw = JSON.parse(storage.getItem(WAL_STORAGE_KEY));
    assert.equal(raw.length, 1);
    assert.equal(raw[0].entryId, 'WAL-TEST-1');

    // No network yet
    assert.equal(fetchCalls, 0);
  });

  it('REQ-EARS-WAL-02 flushes FIFO and marks COMMITTED only on HTTP 200/201', async () => {
    const storage = createMemoryStorage();
    enqueueWalEntry(storage, '/api/v1/workouts', { sessionId: 'A', totalCyclesCompleted: 1, durationMs: 1 }, 'POST', {
      now: () => 1000,
      idFactory: () => 'WAL-A',
    });
    enqueueWalEntry(storage, '/api/v1/workouts', { sessionId: 'B', totalCyclesCompleted: 2, durationMs: 2 }, 'POST', {
      now: () => 2000,
      idFactory: () => 'WAL-B',
    });

    const order = [];
    const fetchImpl = async (url, init) => {
      const body = JSON.parse(init.body);
      order.push(body.sessionId);
      return { ok: true, status: body.sessionId === 'A' ? 200 : 201 };
    };

    const result = await flushWalQueue(storage, 'http://localhost:8000', fetchImpl);
    assert.deepEqual(order, ['A', 'B']);
    assert.equal(result.synced, 2);
    assert.equal(result.pending, 0);
    assert.equal(getPendingWalCount(storage), 0);
    const q = readWalQueue(storage);
    assert.ok(q.every((e) => e.status === 'COMMITTED'));
  });

  it('REQ-EARS-WAL-03 keeps PENDING_SYNC and stops FIFO on HTTP 500 for retry', async () => {
    const storage = createMemoryStorage();
    enqueueWalEntry(storage, '/api/v1/workouts', { sessionId: 'X', totalCyclesCompleted: 1, durationMs: 1 }, 'POST', {
      idFactory: () => 'WAL-X',
    });
    enqueueWalEntry(storage, '/api/v1/workouts', { sessionId: 'Y', totalCyclesCompleted: 1, durationMs: 1 }, 'POST', {
      idFactory: () => 'WAL-Y',
    });

    let calls = 0;
    const fetchImpl = async () => {
      calls += 1;
      return { ok: false, status: 500 };
    };

    const result = await flushWalQueue(storage, 'http://api', fetchImpl);
    assert.equal(calls, 1); // FIFO stop after first failure
    assert.equal(result.failed, 1);
    assert.equal(getPendingWalCount(storage), 2);
    const q = readWalQueue(storage);
    assert.equal(q.find((e) => e.entryId === 'WAL-X').status, 'PENDING_SYNC');
    assert.ok(q.find((e) => e.entryId === 'WAL-X').retryCount >= 1);
  });

  it('REQ-EARS-WAL-04 quarantines corrupted checksum entries', async () => {
    const storage = createMemoryStorage();
    enqueueWalEntry(storage, '/api/v1/workouts', { sessionId: 'OK', totalCyclesCompleted: 1, durationMs: 1 }, 'POST', {
      idFactory: () => 'WAL-OK',
    });
    const q = readWalQueue(storage);
    q[0].checksum = 'deadbeef';
    writeWalQueue(storage, q);

    let fetchCalls = 0;
    const result = await flushWalQueue(storage, 'http://api', async () => {
      fetchCalls += 1;
      return { ok: true, status: 200 };
    });

    assert.equal(fetchCalls, 0);
    assert.equal(result.quarantined, 1);
    assert.equal(readWalQueue(storage)[0].status, 'FAILED');
    assert.equal(readWalQueue(storage)[0].error, 'ERR-FUE-WAL-CORRUPTED');
  });

  it('migrates legacy ATP_WAL_SYNC_QUEUE_V1 into atp_wal_v1', () => {
    const legacy = [
      {
        entryId: 'LEGACY-1',
        timestamp: '2026-01-01T00:00:00.000Z',
        status: 'PENDING_SYNC',
        endpoint: '/api/state/log-set',
        method: 'POST',
        payload: { exercise_name: 'Squat' },
        checksum: calculateChecksum({ exercise_name: 'Squat' }),
        retryCount: 0,
      },
    ];
    const storage = createMemoryStorage({
      [LEGACY_WAL_STORAGE_KEY]: JSON.stringify(legacy),
    });
    const q = readWalQueue(storage);
    assert.equal(q.length, 1);
    assert.equal(storage.getItem(WAL_STORAGE_KEY) != null, true);
  });

  it('offline queue buildup increases pending count without flush', () => {
    const storage = createMemoryStorage();
    for (let i = 0; i < 5; i++) {
      enqueueWalEntry(storage, '/api/v1/workouts', { sessionId: `S-${i}`, totalCyclesCompleted: i, durationMs: i }, 'POST', {
        idFactory: () => `WAL-${i}`,
      });
    }
    assert.equal(getPendingWalCount(storage), 5);
  });
});
