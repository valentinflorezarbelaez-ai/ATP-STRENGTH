/**
 * SPEC-0006 — Anatoly Fit Video Demo Catalog & Form Guidance Suite.
 * Verifies exercise media catalog integrity, biomechanical cues, video URLs, and fallback resilience.
 * Run: node --test tests/anatolyVideoCatalog.test.mjs
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  EXERCISE_MEDIA_CATALOG,
  getExerciseMedia,
} from '../src/lib/exerciseMediaCatalogCore.mjs';
import { ALL_TRACKABLE_EXERCISES } from '../src/lib/workoutStrategiesCore.mjs';

describe('SPEC-0006 Anatoly Fit Video & Form Guidance Engine', () => {
  describe('REQ-EARS-ANATOLY-01: Core Compound Exercise Catalog Integrity', () => {
    const requiredExercises = [
      'sentadilla trasera',
      'press de banca',
      'peso muerto convencional',
      'press militar',
      'dominadas lastradas',
      'fondos en paralelas',
      'remo pendlay',
      'peso muerto rumano',
      'paseo del granjero pesado',
      'planchas isométricas pesadas',
    ];

    it('contains all essential compound movements in the static catalog', () => {
      for (const exKey of requiredExercises) {
        assert.ok(
          EXERCISE_MEDIA_CATALOG[exKey],
          `Expected exercise '${exKey}' to exist in EXERCISE_MEDIA_CATALOG`
        );
      }
    });

    it('ensures each catalog exercise has valid video, poster, cues, and muscle targets', () => {
      for (const [key, item] of Object.entries(EXERCISE_MEDIA_CATALOG)) {
        assert.ok(item.id, `Exercise ${key} missing id`);
        assert.ok(item.name, `Exercise ${key} missing name`);
        assert.ok(item.category, `Exercise ${key} missing category`);
        assert.match(item.videoUrl, /^https?:\/\//, `Exercise ${key} videoUrl must be a valid URL`);
        assert.match(item.posterUrl, /^https?:\/\//, `Exercise ${key} posterUrl must be a valid URL`);
        assert.ok(Array.isArray(item.targetMuscles) && item.targetMuscles.length >= 2, `Exercise ${key} must have >= 2 target muscles`);
        assert.ok(Array.isArray(item.formCues) && item.formCues.length >= 3, `Exercise ${key} must have >= 3 form cues`);
        assert.ok(Array.isArray(item.commonMistakes) && item.commonMistakes.length >= 2, `Exercise ${key} must have >= 2 common mistakes`);
        assert.ok(typeof item.tempo === 'string' && item.tempo.length > 0, `Exercise ${key} must specify tempo`);
      }
    });
  });

  describe('REQ-EARS-ANATOLY-02: Fuzzy Matching and Search Normalization', () => {
    it('matches exact name case-insensitively with trimming', () => {
      const media = getExerciseMedia('  Sentadilla Trasera  ');
      assert.equal(media.id, 'squat_back');
      assert.equal(media.name, 'Sentadilla Trasera');
    });

    it('matches partial query for sentadilla', () => {
      const media = getExerciseMedia('Sentadilla');
      assert.equal(media.id, 'squat_back');
    });

    it('matches partial query for banca', () => {
      const media = getExerciseMedia('Press de Banca');
      assert.equal(media.id, 'bench_press');
    });

    it('matches partial query for peso muerto', () => {
      const media = getExerciseMedia('Peso Muerto');
      assert.equal(media.id, 'deadlift_conv');
    });

    it('matches partial query for dominadas', () => {
      const media = getExerciseMedia('Dominadas');
      assert.equal(media.id, 'pullups_weighted');
    });

    it('matches partial query for fondos', () => {
      const media = getExerciseMedia('Fondos');
      assert.equal(media.id, 'dips_weighted');
    });

    it('matches partial query for press militar', () => {
      const media = getExerciseMedia('Militar');
      assert.equal(media.id, 'overhead_press');
    });
  });

  describe('REQ-EARS-ANATOLY-03: Resilient Fallback for Unknown Exercises', () => {
    it('returns valid fallback media without throwing for uncataloged movements', () => {
      const fallback = getExerciseMedia('Movimiento Exótico Desconocido 99');
      assert.ok(fallback);
      assert.equal(fallback.id, 'fallback_exercise');
      assert.equal(fallback.name, 'Movimiento Exótico Desconocido 99');
      assert.match(fallback.videoUrl, /^https?:\/\//);
      assert.match(fallback.posterUrl, /^https?:\/\//);
      assert.ok(fallback.formCues.length >= 3);
      assert.ok(fallback.commonMistakes.length >= 2);
    });

    it('handles empty or null input gracefully', () => {
      const fallback = getExerciseMedia('');
      assert.ok(fallback);
      assert.equal(fallback.id, 'fallback_exercise');
      assert.ok(fallback.name.length > 0);
    });
  });

  describe('REQ-EARS-ANATOLY-04: Full 25-Exercise Unique YouTube Video Guarantee', () => {
    it('covers all 25 trackable exercises with non-fallback verified media', () => {
      assert.equal(ALL_TRACKABLE_EXERCISES.length, 25, 'Expected exactly 25 trackable exercises');
      for (const exName of ALL_TRACKABLE_EXERCISES) {
        const media = getExerciseMedia(exName);
        assert.ok(media, `Expected media for '${exName}'`);
        assert.notEqual(media.id, 'fallback_exercise', `Exercise '${exName}' returned fallback instead of cataloged media`);
        assert.ok(typeof media.youtubeId === 'string' && media.youtubeId.length > 0, `Exercise '${exName}' missing youtubeId`);
        assert.match(media.videoUrl, new RegExp(media.youtubeId), `Exercise '${exName}' videoUrl must embed youtubeId`);
      }
    });

    it('guarantees that every exercise has a 100% UNIQUE video (zero duplicate YouTube IDs)', () => {
      const youtubeIds = ALL_TRACKABLE_EXERCISES.map(exName => {
        const media = getExerciseMedia(exName);
        return media.youtubeId;
      });

      const uniqueSet = new Set(youtubeIds);
      assert.equal(
        uniqueSet.size,
        25,
        `Expected 25 unique YouTube videos across all 25 exercises, but found ${uniqueSet.size}`
      );
    });
  });
});
