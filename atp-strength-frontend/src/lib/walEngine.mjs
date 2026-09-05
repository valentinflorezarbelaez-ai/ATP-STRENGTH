/**
 * Pure Offline WAL engine — SPEC-0002 (REQ-EARS-WAL-01..04).
 * Append-only local-first, FIFO flush, checksum quarantine.
 * Injectable storage + fetch for Node unit tests.
 */

export const WAL_STORAGE_KEY = 'atp_wal_v1';
export const LEGACY_WAL_STORAGE_KEY = 'ATP_WAL_SYNC_QUEUE_V1';
export const MAX_COMMITTED_HISTORY = 50;

/**
 * Deterministic FNV-1a 32-bit hex checksum (corruption detection).
 * @param {unknown} payload
 */
export function calculateChecksum(payload) {
  const str = JSON.stringify(payload) ?? '';
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * @returns {{ getItem(k: string): string|null, setItem(k: string, v: string): void, removeItem?(k: string): void }}
 */
export function createMemoryStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
    removeItem(key) {
      map.delete(key);
    },
  };
}

/**
 * @param {{ getItem(k: string): string|null, setItem(k: string, v: string): void }} storage
 * @returns {Array<Record<string, unknown>>}
 */
export function readWalQueue(storage) {
  try {
    let raw = storage.getItem(WAL_STORAGE_KEY);
    if (!raw) {
      const legacy = storage.getItem(LEGACY_WAL_STORAGE_KEY);
      if (legacy) {
        storage.setItem(WAL_STORAGE_KEY, legacy);
        raw = legacy;
      }
    }
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading ATP WAL:', err);
    return [];
  }
}

/**
 * @param {{ setItem(k: string, v: string): void }} storage
 * @param {unknown[]} queue
 */
export function writeWalQueue(storage, queue) {
  storage.setItem(WAL_STORAGE_KEY, JSON.stringify(queue));
}

/**
 * [REQ-EARS-WAL-01] Append-only before any network attempt.
 * @param {{ getItem(k: string): string|null, setItem(k: string, v: string): void }} storage
 * @param {string} endpoint
 * @param {unknown} payload
 * @param {'POST'|'PUT'} [method]
 * @param {{ now?: () => number, idFactory?: () => string }} [opts]
 */
export function enqueueWalEntry(storage, endpoint, payload, method = 'POST', opts = {}) {
  const now = opts.now ?? (() => Date.now());
  const idFactory =
    opts.idFactory ??
    (() => `WAL-${now()}-${Math.random().toString(36).slice(2, 7)}`);

  const entry = {
    entryId: idFactory(),
    timestamp: new Date(now()).toISOString(),
    status: 'PENDING_SYNC',
    endpoint,
    method,
    payload,
    checksum: calculateChecksum(payload),
    retryCount: 0,
  };

  const queue = readWalQueue(storage);
  queue.push(entry);
  writeWalQueue(storage, queue);
  return entry;
}

/**
 * @param {{ getItem(k: string): string|null, setItem(k: string, v: string): void }} storage
 */
export function getPendingWalCount(storage) {
  return readWalQueue(storage).filter(
    (item) => item.status === 'PENDING_SYNC' || item.status === 'SYNCING'
  ).length;
}

/**
 * [REQ-EARS-WAL-02/03/04] FIFO flush with checksum quarantine and 5xx retry.
 * @param {{ getItem(k: string): string|null, setItem(k: string, v: string): void }} storage
 * @param {string} apiUrl
 * @param {typeof fetch} [fetchImpl]
 */
export async function flushWalQueue(storage, apiUrl, fetchImpl = globalThis.fetch) {
  const queue = readWalQueue(storage);
  let synced = 0;
  let failed = 0;
  let quarantined = 0;

  for (let i = 0; i < queue.length; i++) {
    const entry = queue[i];
    if (entry.status !== 'PENDING_SYNC' && entry.status !== 'SYNCING') continue;

    const expected = calculateChecksum(entry.payload);
    if (entry.checksum !== expected) {
      console.error(`[ERR-FUE-WAL-CORRUPTED] Checksum mismatch on ${entry.entryId}`);
      entry.status = 'FAILED';
      entry.error = 'ERR-FUE-WAL-CORRUPTED';
      quarantined++;
      failed++;
      writeWalQueue(storage, queue);
      continue;
    }

    entry.status = 'SYNCING';
    writeWalQueue(storage, queue);

    try {
      const response = await fetchImpl(`${apiUrl}${entry.endpoint}`, {
        method: entry.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry.payload),
      });

      if (response.ok) {
        entry.status = 'COMMITTED';
        synced++;
      } else if (response.status >= 500) {
        entry.retryCount = (entry.retryCount || 0) + 1;
        entry.status = 'PENDING_SYNC';
        failed++;
        writeWalQueue(storage, queue);
        break;
      } else if (response.status >= 400) {
        entry.retryCount = (entry.retryCount || 0) + 1;
        entry.status = 'FAILED';
        failed++;
        writeWalQueue(storage, queue);
        break;
      } else {
        entry.status = 'PENDING_SYNC';
        failed++;
        writeWalQueue(storage, queue);
        break;
      }
    } catch {
      entry.status = 'PENDING_SYNC';
      entry.retryCount = (entry.retryCount || 0) + 1;
      failed++;
      writeWalQueue(storage, queue);
      break;
    }
  }

  const committed = queue.filter((e) => e.status === 'COMMITTED');
  const pendingOrFailed = queue.filter((e) => e.status !== 'COMMITTED');
  const prunedCommitted = committed.slice(-MAX_COMMITTED_HISTORY);
  writeWalQueue(storage, [...prunedCommitted, ...pendingOrFailed]);

  return { synced, failed, quarantined, pending: getPendingWalCount(storage) };
}
