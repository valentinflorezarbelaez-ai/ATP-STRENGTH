/**
 * SPEC-0001 — High-precision background-resilient timer engine tests.
 * Run: node --test tests/timers.test.mjs
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  assertValidDurationMs,
  startAbsoluteTimer,
  deriveRemainingMs,
  tickAbsoluteTimer,
  pauseAbsoluteTimer,
  resumeAbsoluteTimer,
  triggerPhaseCompleteHaptic,
  PHASE_COMPLETE_VIBRATE_PATTERN,
} from '../src/lib/atpTimerEngine.mjs';

describe('SPEC-0001 ATP absolute timer engine', () => {
  it('REQ-EARS-TIME-04 rejects non-positive durations', () => {
    assert.throws(() => assertValidDurationMs(0), /ERR-FUE-INVALID-TIMER-DURATION/);
    assert.throws(() => assertValidDurationMs(-100), /ERR-FUE-INVALID-TIMER-DURATION/);
    assert.throws(() => startAbsoluteTimer({ durationMs: 0 }), /ERR-FUE-INVALID-TIMER-DURATION/);
  });

  it('REQ-EARS-TIME-01 sets absolute targetTimestamp = now + durationMs', () => {
    const now = 1_700_000_000_000;
    const session = startAbsoluteTimer({ durationMs: 40_000, phase: 'WORK', now });
    assert.equal(session.targetTimestamp, now + 40_000);
    assert.equal(session.status, 'RUNNING');
    assert.equal(session.phase, 'WORK');
  });

  it('REQ-EARS-TIME-01 deducts background sleep delta instantly (no tick lag)', () => {
    const now = 1_700_000_000_000;
    const session = startAbsoluteTimer({ durationMs: 10_000, phase: 'REST', now });
    // Simulate 5s browser throttle / background freeze
    const afterWake = tickAbsoluteTimer(session, now + 5_000);
    assert.equal(afterWake.timeRemainingMs, 5_000);
    assert.equal(afterWake.status, 'RUNNING');
    assert.equal(afterWake.isHardwareVibrationTriggered, false);
  });

  it('REQ-EARS-TIME-01 remaining is wall-clock based, not decrement-by-one', () => {
    const now = 1_000;
    const session = startAbsoluteTimer({ durationMs: 3_000, phase: 'ATP_CHARGE', now });
    // Jump 2500ms in one tick (would lose accuracy with time-1 counters)
    const t = tickAbsoluteTimer(session, now + 2_500);
    assert.equal(t.timeRemainingMs, 500);
    assert.equal(deriveRemainingMs(session, now + 2_500), 500);
  });

  it('REQ-EARS-TIME-03 completes phase and flags haptic when remaining hits 0', () => {
    const now = 5_000;
    const session = startAbsoluteTimer({ durationMs: 2_000, phase: 'ATP_CHARGE', now });
    const done = tickAbsoluteTimer(session, now + 2_000);
    assert.equal(done.timeRemainingMs, 0);
    assert.equal(done.status, 'COMPLETE');
    assert.equal(done.isHardwareVibrationTriggered, true);
  });

  it('REQ-EARS-TIME-03 vibrate pattern is [200, 100, 200]', () => {
    assert.deepEqual(PHASE_COMPLETE_VIBRATE_PATTERN, [200, 100, 200]);
    const calls = [];
    const ok = triggerPhaseCompleteHaptic({
      vibrate: (p) => {
        calls.push(p);
        return true;
      },
    });
    assert.equal(ok, true);
    assert.deepEqual(calls[0], [200, 100, 200]);
  });

  it('pause/resume preserves remaining against a new absolute target', () => {
    const t0 = 10_000;
    let session = startAbsoluteTimer({ durationMs: 8_000, phase: 'WORK', now: t0 });
    session = pauseAbsoluteTimer(session, t0 + 3_000);
    assert.equal(session.status, 'PAUSED');
    assert.equal(session.pausedRemainingMs, 5_000);
    assert.equal(session.targetTimestamp, null);

    const resumed = resumeAbsoluteTimer(session, t0 + 20_000);
    assert.equal(resumed.status, 'RUNNING');
    assert.equal(resumed.targetTimestamp, t0 + 20_000 + 5_000);
    const after = tickAbsoluteTimer(resumed, t0 + 20_000 + 2_000);
    assert.equal(after.timeRemainingMs, 3_000);
  });
});
