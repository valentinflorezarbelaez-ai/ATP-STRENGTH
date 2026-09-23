/**
 * SPEC-0006 — Anatoly Power System (APS) Nutrition Engine Test Suite.
 * Validates BMR, TDEE, macronutrient distribution, hydration, and goal presets.
 * Run: node --test tests/anatolyNutrition.test.mjs
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBmr,
  calculateTdee,
  calculateApsNutrition,
  ANATOLY_GOALS,
  ACTIVITY_MULTIPLIERS,
  ANATOLY_SUPPLEMENT_STACK,
} from '../src/lib/anatolyNutritionCore.mjs';

describe('SPEC-0006 Anatoly Power System (APS) Nutrition Engine', () => {
  describe('REQ-EARS-NUTR-01: BMR and TDEE Computation', () => {
    it('calculates baseline BMR for standard athlete via Mifflin-St Jeor', () => {
      // 80kg, 180cm, 25yo male: 10*80 + 6.25*180 - 5*25 + 5 = 800 + 1125 - 125 + 5 = 1805
      const bmr = calculateBmr({ weightKg: 80, heightCm: 180, age: 25 });
      assert.equal(bmr, 1805);
    });

    it('calculates BMR via Katch-McArdle when body fat % is provided', () => {
      // 80kg @ 15% BF -> LBM = 68kg -> 370 + 21.6*68 = 370 + 1468.8 = 1839
      const bmr = calculateBmr({ weightKg: 80, bodyFatPercent: 15 });
      assert.equal(bmr, 1839);
    });

    it('calculates TDEE using activity multipliers', () => {
      const bmr = 1805;
      const tdeeModerate = calculateTdee({ weightKg: 80, heightCm: 180, age: 25, activityLevel: 'moderate' });
      assert.equal(tdeeModerate, Math.round(bmr * ACTIVITY_MULTIPLIERS.moderate));

      const tdeeHeavy = calculateTdee({ weightKg: 80, heightCm: 180, age: 25, activityLevel: 'heavy' });
      assert.equal(tdeeHeavy, Math.round(bmr * ACTIVITY_MULTIPLIERS.heavy));
    });
  });

  describe('REQ-EARS-NUTR-02: Anatoly Goal Macro Distributions', () => {
    it('calculates Power Bulk with +15% caloric surplus and 2.2g/kg protein', () => {
      const res = calculateApsNutrition({
        weightKg: 80,
        heightCm: 180,
        age: 25,
        activityLevel: 'moderate',
        goal: 'POWER_BULK',
      });

      assert.equal(res.targetCalories, Math.round(res.tdee * 1.15));
      assert.equal(res.proteinGrams, Math.round(80 * 2.2)); // 176g
      assert.equal(res.fatGrams, Math.round(80 * 0.9));     // 72g
      assert.ok(res.carbsGrams > 200, 'Carbohydrates must be substantial for power bulk');
      assert.equal(res.goalInfo.id, 'POWER_BULK');
    });

    it('calculates Anatoly Shred with -18% deficit and 2.4g/kg protein', () => {
      const res = calculateApsNutrition({
        weightKg: 80,
        heightCm: 180,
        age: 25,
        activityLevel: 'moderate',
        goal: 'ANATOLY_SHRED',
      });

      assert.equal(res.targetCalories, Math.round(res.tdee * 0.82));
      assert.equal(res.proteinGrams, Math.round(80 * 2.4)); // 192g
      assert.equal(res.fatGrams, Math.round(80 * 0.7));     // 56g
      assert.equal(res.goalInfo.id, 'ANATOLY_SHRED');
    });

    it('calculates Recomposition with maintenance calories and 2.2g/kg protein', () => {
      const res = calculateApsNutrition({
        weightKg: 80,
        heightCm: 180,
        age: 25,
        activityLevel: 'moderate',
        goal: 'RECOMPOSITION',
      });

      assert.equal(res.targetCalories, res.tdee);
      assert.equal(res.proteinGrams, Math.round(80 * 2.2));
      assert.equal(res.fatGrams, Math.round(80 * 0.8));
    });
  });

  describe('REQ-EARS-NUTR-03: Hydration and Meal Breakdown Structure', () => {
    it('calculates minimum daily water in liters with training compensation', () => {
      const res = calculateApsNutrition({ weightKg: 80 });
      assert.ok(Math.abs(res.waterLiters - 3.55) <= 0.1);
    });

    it('splits calories across 4 structured meals totaling 100%', () => {
      const res = calculateApsNutrition({ weightKg: 80 });
      assert.equal(res.mealBreakdown.length, 4);

      const totalMealCals = res.mealBreakdown.reduce((sum, m) => sum + m.calories, 0);
      assert.ok(
        Math.abs(totalMealCals - res.targetCalories) <= 5,
        'Total meal calories should match target calories'
      );
    });
  });

  describe('REQ-EARS-NUTR-04: Bounds Clamping and Supplements SSOT', () => {
    it('clamps unreasonable weight safely within [30, 250] kg', () => {
      const tooLight = calculateApsNutrition({ weightKg: 10 });
      assert.ok(tooLight.proteinGrams >= 30 * 2.2);

      const tooHeavy = calculateApsNutrition({ weightKg: 999 });
      assert.ok(tooHeavy.proteinGrams <= 250 * 2.5);
    });

    it('includes Anatoly full supplement stack with 5 core items including Creatine', () => {
      assert.equal(ANATOLY_SUPPLEMENT_STACK.length, 5);
      const creatine = ANATOLY_SUPPLEMENT_STACK.find(s => s.name.includes('Creatina'));
      assert.ok(creatine, 'Creatina Monohidrato must be in supplement stack');
      assert.equal(creatine.dose, '5g diarios');
    });
  });
});
