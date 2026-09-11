/**
 * SPEC-0005 — Neuro-Acoustic Biofeedback & Speech Coaching Engine Unit Tests
 * Run: node --test tests/acousticFeedback.test.mjs
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  COACH_CUES,
  DEFAULT_PREFS,
  getRandomCue,
  formatTelemetryCue,
  formatBarbellPlatesSpoken,
  formatPreSetBriefing,
  formatRestCompletedCue,
  formatAutoregulationCue,
  validateAudioPreferences,
} from "../src/lib/acousticFeedbackCore.mjs";

describe("SPEC-0005 Neuro-Acoustic Biofeedback Engine", () => {
  describe("REQ-EARS-AUDIO-01: Cue Banks & Deterministic Selection", () => {
    it("ensures all event categories exist and are populated", () => {
      const categories = [
        "SET_COMPLETED",
        "EXERCISE_COMPLETED",
        "REST_HALFWAY",
        "REST_15S_WARNING",
        "REST_10S_WARNING",
        "REST_COMPLETED",
        "SESSION_VICTORY",
      ];
      for (const cat of categories) {
        assert.ok(Array.isArray(COACH_CUES[cat]), `Missing category ${cat}`);
        assert.ok(COACH_CUES[cat].length > 0, `Empty category ${cat}`);
        for (const cue of COACH_CUES[cat]) {
          assert.equal(typeof cue, "string");
          assert.ok(cue.length > 5, "Cue is too short");
        }
      }
    });

    it("returns exact first cue when rng returns 0", () => {
      const cue = getRandomCue("SET_COMPLETED", () => 0);
      assert.equal(cue, COACH_CUES.SET_COMPLETED[0]);
    });

    it("returns exact last cue when rng approaches 1", () => {
      const cue = getRandomCue("SET_COMPLETED", () => 0.999);
      const bank = COACH_CUES.SET_COMPLETED;
      assert.equal(cue, bank[bank.length - 1]);
    });

    it("returns empty string for invalid category", () => {
      assert.equal(getRandomCue("NON_EXISTENT_CATEGORY"), "");
    });
  });

  describe("REQ-EARS-AUDIO-02: Telemetry Narration String Formatting", () => {
    it("formats full telemetry with weight, reps and RPE", () => {
      const text = formatTelemetryCue({
        weightKg: 100,
        reps: 5,
        rpe: 8.5,
      });
      assert.equal(
        text,
        "¡Serie de 5 repeticiones con 100 kilos a RPE 8.5 completada! A recuperar."
      );
    });

    it("formats telemetry without RPE cleanly", () => {
      const text = formatTelemetryCue({
        weightKg: 80,
        reps: 8,
      });
      assert.equal(
        text,
        "¡Serie de 8 repeticiones con 80 kilos completada! Buen trabajo."
      );
    });

    it("falls back to random cue when params are empty or zeroed", () => {
      const text = formatTelemetryCue({}, () => 0);
      assert.equal(text, COACH_CUES.SET_COMPLETED[0]);
    });
  });

  describe("REQ-EARS-AUDIO-03: Pre-Set Briefing & Plate Solver Speech", () => {
    it("formats plate spoken breakdown for standard weights", () => {
      assert.equal(formatBarbellPlatesSpoken(20), "Barra olímpica sola, 20 kilos");
      assert.equal(formatBarbellPlatesSpoken(100), "Carga por lado: un disco de 25 y un disco de 15");
      assert.equal(formatBarbellPlatesSpoken(70), "Carga por lado: un disco de 25");
      assert.equal(formatBarbellPlatesSpoken(140), "Carga por lado: 2 discos de 25 y un disco de 10");
    });

    it("formats bodyweight exercise plate speech", () => {
      assert.equal(formatBarbellPlatesSpoken(0, 20, true), "Carga con peso corporal sin lastre");
      assert.equal(formatBarbellPlatesSpoken(15, 20, true), "Peso corporal con 15 kilos de lastre en cinturón");
    });

    it("formats full pre-set briefing with technique cues", () => {
      const text = formatPreSetBriefing({
        exerciseName: "Sentadilla Trasera",
        phaseLabel: "Serie 2 de 4",
        weightKg: 100,
        reps: 5,
        rpe: 8,
        cues: "Pecho inflado y empuja el piso",
        platesSpoken: "Carga por lado: un disco de 25 y un disco de 15",
      });
      assert.equal(
        text,
        "Sentadilla Trasera, Serie 2 de 4. Cargar 100 kilos para 5 repeticiones a RPE 8. Carga por lado: un disco de 25 y un disco de 15. Clave: Pecho inflado y empuja el piso."
      );
    });

    it("formats rest completed spoken callout with next load", () => {
      const text = formatRestCompletedCue({
        exerciseName: "Press de Banca",
        weightKg: 85,
        reps: 5,
        platesSpoken: "un disco de 20 y uno de 10 por lado",
      });
      assert.equal(
        text,
        "¡Tiempo de descanso cumplido! A la barra en Press de Banca con 85 kilos para 5 repeticiones. un disco de 20 y uno de 10 por lado."
      );
    });

    it("formats autoregulation speech on fatigue overshoot and strength undershoot", () => {
      const down = formatAutoregulationCue({
        direction: "DOWN",
        deltaKg: 5,
        nextWeightKg: 95,
        rpe: 9.5,
      });
      assert.ok(down.includes("Fatiga neuromuscular detectada con RPE 9.5"));
      assert.ok(down.includes("95 kilos"));

      const up = formatAutoregulationCue({
        direction: "UP",
        deltaKg: 2.5,
        nextWeightKg: 102.5,
        rpe: 6.5,
      });
      assert.ok(up.includes("Velocidad óptima"));
      assert.ok(up.includes("102.5 kilos"));
    });
  });

  describe("REQ-EARS-AUDIO-06: Preference Validation & Clamping", () => {
    it("returns defaults for empty input", () => {
      const prefs = validateAudioPreferences({});
      assert.deepEqual(prefs, DEFAULT_PREFS);
    });

    it("clamps volume within [0, 1]", () => {
      assert.equal(validateAudioPreferences({ voiceVolume: 2.5 }).voiceVolume, 1.0);
      assert.equal(validateAudioPreferences({ voiceVolume: -0.5 }).voiceVolume, 0.0);
      assert.equal(validateAudioPreferences({ voiceVolume: 0.7 }).voiceVolume, 0.7);
    });

    it("clamps speech rate within [0.5, 2.0]", () => {
      assert.equal(validateAudioPreferences({ voiceRate: 5.0 }).voiceRate, 2.0);
      assert.equal(validateAudioPreferences({ voiceRate: 0.1 }).voiceRate, 0.5);
      assert.equal(validateAudioPreferences({ voiceRate: 1.1 }).voiceRate, 1.1);
    });

    it("preserves boolean toggles", () => {
      assert.equal(validateAudioPreferences({ soundEnabled: false }).soundEnabled, false);
      assert.equal(validateAudioPreferences({ voiceEnabled: false }).voiceEnabled, false);
    });
  });
});
