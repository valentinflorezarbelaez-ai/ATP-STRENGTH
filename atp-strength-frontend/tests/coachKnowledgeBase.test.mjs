/**
 * SPEC-0011 — Athlete AI Coach Knowledge Engine Unit Tests
 * Run: node --test tests/coachKnowledgeBase.test.mjs
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { queryCoachKnowledge } from "../src/lib/coachKnowledgeBase.mjs";

describe("SPEC-0011 Athlete AI Coach Knowledge Engine", () => {
  it("answers technique questions with specific exercise biomechanics cues", () => {
    const res = queryCoachKnowledge("¿Cómo hago este ejercicio?", { currentExercise: "Sentadilla Trasera" });
    assert.equal(res.topic, "TECHNIQUE");
    assert.ok(res.text.includes("Valsalva"));
    assert.ok(res.text.includes("rodillas"));
    assert.ok(res.followUps.length > 0);
  });

  it("answers rest interval questions with intra-set and inter-session science", () => {
    const res = queryCoachKnowledge("¿Cuánto debo descansar?", { currentExercise: "Press de Banca Plano", currentRpe: 9 });
    assert.equal(res.topic, "REST_INTRA_SET");
    assert.ok(res.text.includes("ATP y fosfocreatina"));
    assert.ok(res.text.includes("48 horas"));
  });

  it("explains why an exercise is locked after completion", () => {
    const res = queryCoachKnowledge("¿Por qué no me deja hacerlo?", {
      currentExercise: "Sentadilla Trasera",
      isLocked: true,
      remainingHours: 46
    });
    assert.equal(res.topic, "RECOVERY_LOCKOUT");
    assert.ok(res.text.includes("protocolo biológico de recuperación"));
    assert.ok(res.text.includes("46 horas"));
  });

  it("guides athlete on current phase, weights and RPE", () => {
    const res = queryCoachKnowledge("¿Qué hago aquí?", {
      currentExercise: "Peso Muerto Convencional",
      currentWeight: 140,
      currentReps: "5",
      currentRpe: 8
    });
    assert.equal(res.topic, "PHASE_GUIDANCE");
    assert.ok(res.text.includes("140 kilos"));
    assert.ok(res.text.includes("RIR 2"));
  });
});
