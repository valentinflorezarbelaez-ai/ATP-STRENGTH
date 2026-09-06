/**
 * SPEC-0005 — Neuro-Acoustic Biofeedback & Speech Coaching Engine Unit Tests
 * Run: node --test tests/acousticFeedback.test.mjs
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  COACH_CUES,
  DEFAULT_PREFS,
  getRandomCue,
  formatTelemetryCue,
  validateAudioPreferences,
} from '../src/lib/acousticFeedbackCore.mjs';

describe('SPEC-0005 Neuro-Acoustic Biofeedback Engine', () => {
  describe('REQ-EARS-AUDIO-01: Cue Banks & Deterministic Selection', () => {
    it('ensures all event categories exist and are populated', () => {
      const categories = [
        'SET_COMPLETED',
        'EXERCISE_COMPLETED',
        'REST_HALFWAY',
        'REST_10S_WARNING',
        'SESSION_VICTORY',
      ];
      for (const cat of categories) {
        assert.ok(Array.isArray(COACH_CUES[cat]), `Missing category ${cat}`);
        assert.ok(COACH_CUES[cat].length > 0, `Empty category ${cat}`);
        for (const cue of COACH_CUES[cat]) {
          assert.equal(typeof cue, 'string');
          assert.ok(cue.length > 5, 'Cue is too short');
        }
      }
    });

    it('returns exact first cue when rng returns 0', () => {
      const cue = getRandomCue('SET_COMPLETED', () => 0);
      assert.equal(cue, COACH_CUES.SET_COMPLETED[0]);
    });

    it('returns exact last cue when rng approaches 1', () => {
      const cue = getRandomCue('SET_COMPLETED', () => 0.999);
      const bank = COACH_CUES.SET_COMPLETED;
      assert.equal(cue, bank[bank.length - 1]);
    });

    it('returns empty string for invalid category', () => {
      assert.equal(getRandomCue('NON_EXISTENT_CATEGORY'), '');
    });
  });

  describe('REQ-EARS-AUDIO-02: Telemetry Narration String Formatting', () => {
    it('formats full telemetry with weight, reps and RPE', () => {
      const text = formatTelemetryCue({
        weightKg: 100,
        reps: 5,
        rpe: 8.5,
      });
      assert.equal(
        text,
        '¡Serie de 5 repeticiones con 100 kilos a RPE 8.5 completada! A recuperar.'
      );
    });

    it('formats telemetry without RPE cleanly', () => {
      const text = formatTelemetryCue({
        weightKg: 80,
        reps: 8,
      });
      assert.equal(
        text,
        '¡Serie de 8 repeticiones con 80 kilos completada! Buen trabajo.'
      );
    });

    it('falls back to random cue when params are empty or zeroed', () => {
      const text = formatTelemetryCue({}, () => 0);
      assert.equal(text, COACH_CUES.SET_COMPLETED[0]);
    });
  });

  describe('REQ-EARS-AUDIO-06: Preference Validation & Clamping', () => {
    it('returns defaults for empty input', () => {
      const prefs = validateAudioPreferences({});
      assert.deepEqual(prefs, DEFAULT_PREFS);
    });

    it('clamps volume within [0, 1]', () => {
      assert.equal(validateAudioPreferences({ voiceVolume: 2.5 }).voiceVolume, 1.0);
      assert.equal(validateAudioPreferences({ voiceVolume: -0.5 }).voiceVolume, 0.0);
      assert.equal(validateAudioPreferences({ voiceVolume: 0.7 }).voiceVolume, 0.7);
    });

    it('clamps speech rate within [0.5, 2.0]', () => {
      assert.equal(validateAudioPreferences({ voiceRate: 5.0 }).voiceRate, 2.0);
      assert.equal(validateAudioPreferences({ voiceRate: 0.1 }).voiceRate, 0.5);
      assert.equal(validateAudioPreferences({ voiceRate: 1.1 }).voiceRate, 1.1);
    });

    it('preserves boolean toggles', () => {
      assert.equal(validateAudioPreferences({ soundEnabled: false }).soundEnabled, false);
      assert.equal(validateAudioPreferences({ voiceEnabled: false }).voiceEnabled, false);
    });
  });
});
