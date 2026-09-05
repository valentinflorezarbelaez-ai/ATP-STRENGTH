/**
 * Pure ATP timer engine — SPEC-0001 (REQ-EARS-TIME-01..04).
 * Target-timestamp drift protection; no incremental tick counters.
 * L0: Node builtins only. Testable without React.
 */

/** @typedef {'IDLE'|'WORK'|'REST'|'ATP_CHARGE'|'PAUSED'|'COMPLETE'} TimerPhase */

/**
 * @param {number} durationMs
 * @throws {Error} ERR-FUE-INVALID-TIMER-DURATION
 */
export function assertValidDurationMs(durationMs) {
  if (typeof durationMs !== 'number' || !Number.isFinite(durationMs) || durationMs <= 0) {
    const err = new Error('ERR-FUE-INVALID-TIMER-DURATION');
    err.code = 'ERR-FUE-INVALID-TIMER-DURATION';
    throw err;
  }
}

/**
 * @param {{ durationMs: number, phase?: TimerPhase, now?: number }} input
 */
export function startAbsoluteTimer({ durationMs, phase = 'ATP_CHARGE', now = Date.now() }) {
  assertValidDurationMs(durationMs);
  return {
    phase,
    durationMs,
    targetTimestamp: now + durationMs,
    pausedRemainingMs: null,
    status: 'RUNNING',
    isHardwareVibrationTriggered: false,
  };
}

/**
 * Remaining ms from absolute target (background-resilient).
 * @param {{ targetTimestamp: number|null, pausedRemainingMs?: number|null, status?: string }} session
 * @param {number} [now]
 */
export function deriveRemainingMs(session, now = Date.now()) {
  if (session.status === 'PAUSED' && typeof session.pausedRemainingMs === 'number') {
    return Math.max(0, session.pausedRemainingMs);
  }
  if (session.targetTimestamp == null) return 0;
  return Math.max(0, session.targetTimestamp - now);
}

/**
 * One control tick: deduce wall-clock delta against targetTimestamp.
 * @param {ReturnType<typeof startAbsoluteTimer> & { status?: string, pausedRemainingMs?: number|null }} session
 * @param {number} [now]
 */
export function tickAbsoluteTimer(session, now = Date.now()) {
  if (session.status === 'PAUSED') {
    return {
      ...session,
      timeRemainingMs: Math.max(0, session.pausedRemainingMs ?? 0),
      isHardwareVibrationTriggered: false,
    };
  }
  if (session.status === 'COMPLETE' || session.targetTimestamp == null) {
    return {
      ...session,
      timeRemainingMs: 0,
      isHardwareVibrationTriggered: false,
    };
  }

  const timeRemainingMs = deriveRemainingMs(session, now);
  if (timeRemainingMs <= 0) {
    return {
      ...session,
      targetTimestamp: null,
      status: 'COMPLETE',
      phase: session.phase,
      timeRemainingMs: 0,
      isHardwareVibrationTriggered: true,
    };
  }

  return {
    ...session,
    timeRemainingMs,
    isHardwareVibrationTriggered: false,
  };
}

/**
 * @param {ReturnType<typeof startAbsoluteTimer>} session
 * @param {number} [now]
 */
export function pauseAbsoluteTimer(session, now = Date.now()) {
  if (session.status !== 'RUNNING') return session;
  return {
    ...session,
    status: 'PAUSED',
    pausedRemainingMs: deriveRemainingMs(session, now),
    targetTimestamp: null,
    isHardwareVibrationTriggered: false,
  };
}

/**
 * @param {ReturnType<typeof startAbsoluteTimer> & { pausedRemainingMs?: number|null }} session
 * @param {number} [now]
 */
export function resumeAbsoluteTimer(session, now = Date.now()) {
  const remaining = Math.max(0, session.pausedRemainingMs ?? 0);
  if (remaining <= 0) {
    return {
      ...session,
      status: 'COMPLETE',
      targetTimestamp: null,
      pausedRemainingMs: 0,
      timeRemainingMs: 0,
      isHardwareVibrationTriggered: true,
    };
  }
  assertValidDurationMs(remaining);
  return {
    ...session,
    status: 'RUNNING',
    durationMs: remaining,
    targetTimestamp: now + remaining,
    pausedRemainingMs: null,
    isHardwareVibrationTriggered: false,
  };
}

/** Haptic pattern for phase completion (REQ-EARS-TIME-03). */
export const PHASE_COMPLETE_VIBRATE_PATTERN = Object.freeze([200, 100, 200]);

/**
 * @param {{ vibrate?: (p: number|number[]) => boolean }} [nav]
 */
export function triggerPhaseCompleteHaptic(nav = globalThis.navigator) {
  if (nav && typeof nav.vibrate === 'function') {
    return nav.vibrate(PHASE_COMPLETE_VIBRATE_PATTERN);
  }
  return false;
}
