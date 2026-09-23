/**
 * Exercise Media Catalog & Biomechanical Cues (SSOT)
 * Inspired by Anatoly Fit's structured video demos & form guidance.
 */

import {
  EXERCISE_MEDIA_CATALOG as CORE_CATALOG,
  getExerciseMedia as coreGetExerciseMedia,
} from "./exerciseMediaCatalogCore.mjs";

export interface ExerciseMedia {
  id: string;
  name: string;
  category: "Sentadilla" | "Banca" | "Peso Muerto" | "Militar" | "Tracción" | "Calistenia" | "Accesorios";
  targetMuscles: string[];
  videoUrl: string;
  youtubeId?: string;
  posterUrl: string;
  formCues: string[];
  commonMistakes: string[];
  tempo: string;
}

export const EXERCISE_MEDIA_CATALOG: Record<string, ExerciseMedia> = CORE_CATALOG as Record<string, ExerciseMedia>;

export function getExerciseMedia(rawName: string): ExerciseMedia {
  return coreGetExerciseMedia(rawName) as ExerciseMedia;
}
