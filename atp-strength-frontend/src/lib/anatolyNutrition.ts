/**
 * Anatoly Power System (APS) — Nutrition Engine TypeScript Bridge (SPEC-0006)
 */

import {
  ANATOLY_GOALS as CORE_GOALS,
  ACTIVITY_MULTIPLIERS as CORE_ACTIVITY,
  calculateBmr as coreCalculateBmr,
  calculateTdee as coreCalculateTdee,
  calculateApsNutrition as coreCalculateApsNutrition,
  ANATOLY_SUPPLEMENT_STACK as CORE_SUPPLEMENTS,
} from "./anatolyNutritionCore.mjs";

export type AnatolyGoalKey = "POWER_BULK" | "ANATOLY_SHRED" | "RECOMPOSITION";
export type ActivityLevelKey = "sedentary" | "light" | "moderate" | "heavy" | "elite";

export interface AthleteNutritionParams {
  weightKg: number;
  heightCm?: number;
  age?: number;
  bodyFatPercent?: number | null;
  activityLevel?: ActivityLevelKey;
  goal?: AnatolyGoalKey;
}

export interface MealBreakdownItem {
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface ApsNutritionResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  waterLiters: number;
  goalInfo: {
    id: string;
    name: string;
    multiplier: number;
    proteinPerKg: number;
    fatPerKg: number;
    description: string;
  };
  mealBreakdown: MealBreakdownItem[];
}

export interface SupplementItem {
  name: string;
  dose: string;
  timing: string;
  purpose: string;
  tag: string;
}

export const ANATOLY_GOALS = CORE_GOALS;
export const ACTIVITY_MULTIPLIERS = CORE_ACTIVITY;
export const ANATOLY_SUPPLEMENT_STACK: SupplementItem[] = CORE_SUPPLEMENTS as SupplementItem[];

export function calculateBmr(params: AthleteNutritionParams): number {
  return (coreCalculateBmr as (p: AthleteNutritionParams) => number)(params);
}

export function calculateTdee(params: AthleteNutritionParams): number {
  return (coreCalculateTdee as (p: AthleteNutritionParams) => number)(params);
}

export function calculateApsNutrition(params: AthleteNutritionParams): ApsNutritionResult {
  return (coreCalculateApsNutrition as (p: AthleteNutritionParams) => ApsNutritionResult)(params);
}
