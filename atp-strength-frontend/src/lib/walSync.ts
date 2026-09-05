/**
 * Browser adapter for SPEC-0002 WAL — delegates to pure walEngine.mjs.
 * Preserves public API used by hooks (enqueueWalEntry, flushWalQueue, getPendingWalCount).
 * Canonical key: atp_wal_v1 (migrates ATP_WAL_SYNC_QUEUE_V1).
 */

import {
  calculateChecksum,
  enqueueWalEntry as enqueuePure,
  flushWalQueue as flushPure,
  getPendingWalCount as getPendingPure,
  readWalQueue,
  WAL_STORAGE_KEY,
  LEGACY_WAL_STORAGE_KEY,
} from './walEngine.mjs';

export type WalEntryStatus = 'PENDING_SYNC' | 'SYNCING' | 'COMMITTED' | 'FAILED';

export interface WalLogEntry<T = unknown> {
  entryId: string;
  timestamp: string;
  status: WalEntryStatus;
  endpoint: string;
  method: 'POST' | 'PUT';
  payload: T;
  checksum: string;
  retryCount: number;
  error?: string;
}

export { calculateChecksum, WAL_STORAGE_KEY, LEGACY_WAL_STORAGE_KEY };

function browserStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

export function getWalQueue(): WalLogEntry[] {
  const storage = browserStorage();
  if (!storage) return [];
  return readWalQueue(storage) as unknown as WalLogEntry[];
}

export function enqueueWalEntry<T>(
  endpoint: string,
  payload: T,
  method: 'POST' | 'PUT' = 'POST'
): WalLogEntry<T> {
  const storage = browserStorage();
  if (!storage) {
    return {
      entryId: `WAL-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'PENDING_SYNC',
      endpoint,
      method,
      payload,
      checksum: calculateChecksum(payload),
      retryCount: 0,
    };
  }
  return enqueuePure(storage, endpoint, payload, method) as WalLogEntry<T>;
}

export function getPendingWalCount(): number {
  const storage = browserStorage();
  if (!storage) return 0;
  return getPendingPure(storage);
}

export async function flushWalQueue(
  apiUrl: string
): Promise<{ synced: number; failed: number; quarantined?: number; pending?: number }> {
  const storage = browserStorage();
  if (!storage) return { synced: 0, failed: 0 };
  return flushPure(storage, apiUrl, fetch);
}
