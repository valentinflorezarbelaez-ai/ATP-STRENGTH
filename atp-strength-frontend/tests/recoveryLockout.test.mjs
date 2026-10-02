/**
 * SPEC-0010 — Biomechanical Muscle Recovery & Optimal Lockout Unit Tests
 * Run: node --test tests/recoveryLockout.test.mjs
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getOptimalRecoveryHours,
  getExerciseRecoveryStatus,
  formatRecoverySpokenNotice,
} from "../src/lib/recoveryLockoutCore.mjs";

describe("SPEC-0010 Biomechanical Recovery & Lockout Engine", () => {
  describe("REQ-EARS-RECOV-01: Optimal Recovery Period Categorization (48h vs 72h)", () => {
    it("assigns 72 hours to axial/major CNS compound lifts", () => {
      assert.equal(getOptimalRecoveryHours("Sentadilla Trasera"), 72);
      assert.equal(getOptimalRecoveryHours("Peso Muerto Convencional"), 72);
      assert.equal(getOptimalRecoveryHours("Clean & Jerk"), 72);
      assert.equal(getOptimalRecoveryHours("Sentadilla Frontal"), 72);
    });

    it("assigns 48 hours to upper body compound lifts", () => {
      assert.equal(getOptimalRecoveryHours("Press de Banca Plano"), 48);
      assert.equal(getOptimalRecoveryHours("Press Militar Estricto"), 48);
      assert.equal(getOptimalRecoveryHours("Remo con Barra"), 48);
      assert.equal(getOptimalRecoveryHours("Dominadas con Lastre"), 48);
    });

    it("assigns 36 hours to accessory movements", () => {
      assert.equal(getOptimalRecoveryHours("Curl de Bíceps con Barra"), 36);
      assert.equal(getOptimalRecoveryHours("Elevaciones Laterales"), 36);
    });
  });

  describe("REQ-EARS-RECOV-02: Lockout Computation & State Validation", () => {
    const ONE_HOUR = 3600 * 1000;

    it("is unlocked when exercise has never been performed", () => {
      const status = getExerciseRecoveryStatus("Press de Banca Plano", 0);
      assert.equal(status.isLocked, false);
      assert.equal(status.recoveryPercent, 100);
      assert.equal(status.remainingHours, 0);
    });

    it("locks exercise immediately after completion with exact hours remaining", () => {
      const now = 1000000000;
      const status = getExerciseRecoveryStatus("Sentadilla Trasera", now, now);
      assert.equal(status.isLocked, true);
      assert.equal(status.recoveryHoursTotal, 72);
      assert.equal(status.remainingHours, 72);
      assert.equal(status.recoveryPercent, 0);
    });

    it("correctly tracks elapsed time and partial recovery percentage", () => {
      const now = 1000000000;
      const completed = now - 24 * ONE_HOUR; // 24 hours ago
      const status = getExerciseRecoveryStatus("Press de Banca Plano", completed, now); // 48h total
      assert.equal(status.isLocked, true);
      assert.equal(status.elapsedHours, 24);
      assert.equal(status.remainingHours, 24);
      assert.equal(status.recoveryPercent, 50);
      assert.ok(status.suggestedAlternativeMuscles.length > 0);
    });

    it("unlocks cleanly once the full 48h/72h recovery period elapses", () => {
      const now = 1000000000;
      const completed = now - 73 * ONE_HOUR; // 73 hours ago
      const status = getExerciseRecoveryStatus("Sentadilla Trasera", completed, now); // 72h total
      assert.equal(status.isLocked, false);
      assert.equal(status.remainingHours, 0);
      assert.equal(status.recoveryPercent, 100);
    });
  });

  describe("REQ-EARS-RECOV-03: Spoken Recovery Notice Generation", () => {
    it("generates a natural spoken notice with exact remaining recovery time", () => {
      const cue = formatRecoverySpokenNotice("Sentadilla Trasera", 46, 15);
      assert.ok(cue.includes("Sentadilla Trasera"));
      assert.ok(cue.includes("46 horas y 15 minutos"));
      assert.ok(cue.includes("supercompensación"));
      assert.ok(cue.includes("descanso biológico óptimo"));
    });
  });
});
