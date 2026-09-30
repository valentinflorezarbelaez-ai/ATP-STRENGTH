/**
 * Exercise Media Catalog & Biomechanical Cues (SSOT)
 * Official Rogue Fitness Movement Demonstrations (@roguefitness).
 * All 25 trackable exercises have verified, unique Rogue Fitness YouTube demos.
 */

import {
  EXERCISE_MEDIA_CATALOG as CORE_CATALOG,
  getExerciseMedia as coreGetExerciseMedia,
} from "./exerciseMediaCatalogCore.mjs";

export interface ExerciseMedia {
  id: string;
  name: string;
  category: string;
  targetMuscles: string[];
  videoUrl: string;
  youtubeId?: string;
  posterUrl: string;
  formCues: string[];
  commonMistakes: string[];
  tempo: string;
}

export const EXERCISE_MEDIA_CATALOG = CORE_CATALOG as unknown as Record<string, ExerciseMedia>;

export function getExerciseMedia(rawName: string): ExerciseMedia {
  return coreGetExerciseMedia(rawName) as ExerciseMedia;
}
