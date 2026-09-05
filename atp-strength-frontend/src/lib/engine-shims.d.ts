declare module '@/lib/atpTimerEngine.mjs' {
  export function assertValidDurationMs(durationMs: number): void;
  export function startAbsoluteTimer(input: {
    durationMs: number;
    phase?: string;
    now?: number;
  }): {
    phase: string;
    durationMs: number;
    targetTimestamp: number;
    pausedRemainingMs: null;
    status: string;
    isHardwareVibrationTriggered: boolean;
  };
  export function deriveRemainingMs(
    session: { targetTimestamp: number | null; pausedRemainingMs?: number | null; status?: string },
    now?: number
  ): number;
  export function tickAbsoluteTimer(session: object, now?: number): {
    status: string;
    timeRemainingMs: number;
    isHardwareVibrationTriggered: boolean;
    targetTimestamp: number | null;
    phase: string;
    durationMs: number;
    pausedRemainingMs: number | null;
  };
  export function pauseAbsoluteTimer(session: object, now?: number): object;
  export function resumeAbsoluteTimer(session: object, now?: number): object;
  export const PHASE_COMPLETE_VIBRATE_PATTERN: readonly number[];
  export function triggerPhaseCompleteHaptic(nav?: { vibrate?: (p: number | number[]) => boolean }): boolean;
}

declare module '@/lib/walEngine.mjs' {
  export const WAL_STORAGE_KEY: string;
  export const LEGACY_WAL_STORAGE_KEY: string;
  export const MAX_COMMITTED_HISTORY: number;
  export function calculateChecksum(payload: unknown): string;
  export function createMemoryStorage(seed?: Record<string, string>): {
    getItem(k: string): string | null;
    setItem(k: string, v: string): void;
    removeItem?(k: string): void;
  };
  export function readWalQueue(storage: {
    getItem(k: string): string | null;
    setItem(k: string, v: string): void;
  }): unknown[];
  export function writeWalQueue(
    storage: { setItem(k: string, v: string): void },
    queue: unknown[]
  ): void;
  export function enqueueWalEntry(
    storage: { getItem(k: string): string | null; setItem(k: string, v: string): void },
    endpoint: string,
    payload: unknown,
    method?: 'POST' | 'PUT',
    opts?: { now?: () => number; idFactory?: () => string }
  ): Record<string, unknown>;
  export function getPendingWalCount(storage: {
    getItem(k: string): string | null;
    setItem(k: string, v: string): void;
  }): number;
  export function flushWalQueue(
    storage: { getItem(k: string): string | null; setItem(k: string, v: string): void },
    apiUrl: string,
    fetchImpl?: typeof fetch
  ): Promise<{ synced: number; failed: number; quarantined: number; pending: number }>;
}

declare module './atpTimerEngine.mjs' {
  export * from '@/lib/atpTimerEngine.mjs';
}

declare module './walEngine.mjs' {
  export * from '@/lib/walEngine.mjs';
}
