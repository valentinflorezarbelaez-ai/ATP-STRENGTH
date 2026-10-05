/**
 * SPEC-0011 — Athlete AI Coach Knowledge Engine Unit Tests
 * Run: node --test tests/coachKnowledgeBase.test.mjs
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  finalizeLiveCoach,
  formatCoachClock,
  prepareLiveCoach,
  queryCoachKnowledge,
  resolveCoachSubject,
} from "../src/lib/coachKnowledgeBase.mjs";

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

  it("treats rest between days as inter-session recovery, including días", () => {
    const res = queryCoachKnowledge("¿Cuánto descanso entre días?", { currentExercise: "Sentadilla Trasera" });
    assert.equal(res.topic, "REST_INTER_SESSION");
    assert.ok(res.text.includes("72 horas"));
    assert.equal(res.demo, null);
  });

  it("answers muscles, programming and equipment for the named exercise", () => {
    const muscles = queryCoachKnowledge("¿Qué músculos trabaja el peso muerto?", { currentExercise: "Press de Banca Plano" });
    assert.equal(muscles.topic, "MUSCLES");
    assert.match(muscles.text, /isquio|glúteo|dorsal/i);

    const programming = queryCoachKnowledge("¿Cuántas series programo de sentadilla?", { currentExercise: "Press de Banca Plano" });
    assert.equal(programming.topic, "PROGRAMMING");
    assert.match(programming.text, /sentadilla/i);
    assert.match(programming.text, /72 horas/);

    const gear = queryCoachKnowledge("¿Qué equipo necesito para fondos?", { currentExercise: "Sentadilla Trasera" });
    assert.equal(gear.topic, "EQUIPMENT");
    assert.match(gear.text, /paralelas/i);
  });

  it("attaches the official Rogue squat demo when explaining how to perform it", () => {
    const res = queryCoachKnowledge("¿Cómo hago la sentadilla?", { currentExercise: "Press de Banca Plano" });
    assert.equal(res.topic, "TECHNIQUE");
    assert.equal(res.demo?.youtubeId, "x0tjZRfF3Wg");
    assert.equal(res.demo?.match, "exact");
    assert.match(res.demo?.videoUrl ?? "", /youtube\.com\/watch\?v=x0tjZRfF3Wg/);
    assert.ok(res.sources.some((source) => source.url === "https://www.youtube.com/@roguefitness"));
    assert.ok(res.sources.some((source) => source.url === "https://www.youtube.com/@BeBestBeast"));
    assert.ok(res.sources.some((source) => source.url === "https://www.instagram.com/bebestbeast/?hl=es"));
  });

  it("does not embed a mismatched or non-Rogue video", () => {
    const plank = queryCoachKnowledge("¿Cómo hago la plancha?", { currentExercise: "Sentadilla Trasera" });
    assert.equal(plank.demo, null);
    assert.equal(JSON.stringify(plank).includes("_ATX_OLs1qY"), false);
    assert.equal(JSON.stringify(plank).includes("ultWZbUMPL8"), false);

    const military = queryCoachKnowledge("¿Cómo hago el press militar?", { currentExercise: "Sentadilla Trasera" });
    assert.equal(military.demo, null);
    assert.notEqual(military.demo?.youtubeId, "VdeHikSTxQ8");
    assert.match(military.text, /piernas no empujan|sin impulso de piernas/i);

    const hipThrust = queryCoachKnowledge("¿Cómo hago hip thrust?", { currentExercise: "Sentadilla Trasera" });
    assert.equal(hipThrust.demo, null);
    assert.match(hipThrust.text, /cadera/i);
    assert.equal(JSON.stringify(hipThrust).includes("ultWZbUMPL8"), false);
  });

  it("answers an open exercise question instead of a generic deflection", () => {
    const res = queryCoachKnowledge("¿Para qué me sirve el tempo en dominadas?", { currentExercise: "Sentadilla Trasera" });
    assert.equal(res.topic, "TEMPO");
    assert.match(res.text, /dominadas/i);
    assert.ok(res.followUps.length > 0);
  });

  it("keeps the squat for a follow-up and does not repeat the Rogue caption", () => {
    const squat = queryCoachKnowledge("¿Cómo hago la sentadilla?", { currentExercise: "Press de Banca Plano" });
    assert.equal(squat.text.includes(squat.demo.caption), false);
    assert.equal(squat.exerciseId, "squat_back");
    assert.match(squat.exerciseName, /sentadilla/i);

    const followUp = resolveCoachSubject("¿y las rodillas?", {
      currentExercise: "Press de Banca Plano",
      discussedExerciseId: squat.exerciseId,
    });
    assert.equal(followUp.exerciseId, "squat_back");
    assert.equal(followUp.remembered, true);

    const prepared = prepareLiveCoach({
      messages: [
        { role: "user", content: "¿Cómo hago la sentadilla?" },
        { role: "assistant", content: "Bajá con las rodillas afuera." },
        { role: "user", content: "¿y las rodillas?" },
      ],
      discussedExerciseId: "squat_back",
      context: { currentExercise: "Press de Banca Plano" },
    });
    assert.equal(prepared.kind, "model");
    assert.equal(prepared.subject.exerciseId, "squat_back");
    assert.match(prepared.system, /sentadilla/i);

    const technique = prepareLiveCoach({
      messages: [{ role: "user", content: "¿Cómo hago la sentadilla?" }],
      context: { currentExercise: "Press de Banca Plano" },
    });
    const echoed = finalizeLiveCoach(technique, `Seguí empujando las rodillas hacia afuera.\n\n${squat.demo.caption}`);
    assert.equal(echoed.demo.youtubeId, "x0tjZRfF3Wg");
    assert.equal(echoed.text.includes(squat.demo.caption), false);
    assert.match(echoed.exerciseName, /sentadilla/i);
  });

  it("formats the clock as 24 hours without a broken day period", () => {
    assert.equal(formatCoachClock(new Date(2026, 9, 5, 21, 7, 0)), "21:07");
    assert.equal(formatCoachClock(new Date(2026, 9, 5, 9, 4, 0)), "09:04");
    assert.equal(formatCoachClock(new Date(2026, 9, 5, 15, 4, 0)).includes("."), false);
  });

  it("stops a live pain question before calling a model", () => {
    const pain = prepareLiveCoach({
      messages: [{ role: "user", content: "Me duele la rodilla en la sentadilla" }],
      context: { currentExercise: "Press de Banca Plano" },
    });
    assert.equal(pain.kind, "pain");
    assert.match(pain.answer.text, /cortá la serie/i);
    assert.match(pain.answer.text, /no diagnostico/i);
    assert.equal(/ibuprofeno|hielo|antiinflamatorio/i.test(pain.answer.text), false);
    assert.match(pain.answer.exerciseName, /sentadilla/i);
  });

  it("stops at pain without prescribing a treatment", () => {
    const res = queryCoachKnowledge("Me duele la rodilla en la sentadilla", { currentExercise: "Sentadilla Trasera" });
    assert.equal(res.topic, "PAIN_SAFETY");
    assert.match(res.text, /cortá la serie/i);
    assert.match(res.text, /no diagnostico/i);
  });
});
