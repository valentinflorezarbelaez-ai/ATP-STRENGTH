import { describe, it, expect } from 'vitest';
import {
  estimateEpley1RM,
  estimateBrzycki1RM,
  estimate1RM,
  roundLoad,
  calculateTrainingMax,
  prescribeLoad,
  generateAllPhasePrescriptions,
  DEFAULT_TRAINING_MAX_PERCENT,
  DEFAULT_ROUNDING_KG
} from '../domain/strength-engine';

describe('Strength Engine - Epley 1RM Formula', () => {
  it('calcula correctamente 80 kg × 5 reps dando ~93.33 kg', () => {
    // 80 * (1 + 5/30) = 80 * (1.166667) = 93.3333...
    const rm = estimateEpley1RM(80, 5);
    expect(rm).toBeCloseTo(93.333, 2);
  });

  it('devuelve el peso exacto si reps es 1 (1RM directo)', () => {
    expect(estimateEpley1RM(100, 1)).toBe(100);
  });

  it('lanza error con valores no válidos (peso <= 0 o reps <= 0)', () => {
    expect(() => estimateEpley1RM(0, 5)).toThrow();
    expect(() => estimateEpley1RM(-50, 5)).toThrow();
    expect(() => estimateEpley1RM(80, 0)).toThrow();
    expect(() => estimateEpley1RM(80, -2)).toThrow();
  });

  it('lanza error si las repeticiones superan 15 para evitar distorsiones', () => {
    expect(() => estimateEpley1RM(50, 16)).toThrow(/15 repeticiones/);
  });
});

describe('Strength Engine - Brzycki 1RM Formula', () => {
  it('calcula correctamente con fórmula Brzycki: peso * (36 / (37 - reps))', () => {
    // 80 * (36 / (37 - 5)) = 80 * (36 / 32) = 80 * 1.125 = 90 kg
    const rm = estimateBrzycki1RM(80, 5);
    expect(rm).toBe(90);
  });

  it('devuelve el peso exacto si reps es 1', () => {
    expect(estimateBrzycki1RM(100, 1)).toBe(100);
  });
});

describe('Strength Engine - estimate1RM selector', () => {
  it('permite seleccionar epley, brzycki o direct', () => {
    expect(estimate1RM(80, 5, 'epley')).toBeCloseTo(93.33, 2);
    expect(estimate1RM(80, 5, 'brzycki')).toBe(90);
    expect(estimate1RM(80, 5, 'direct')).toBe(80);
  });
});

describe('Strength Engine - Rounding Loads', () => {
  it('redondea con incremento de 2.5 kg por defecto', () => {
    expect(roundLoad(67.2, 2.5)).toBe(67.5);
    expect(roundLoad(66.1, 2.5)).toBe(65.0);
    expect(roundLoad(68.8, 2.5)).toBe(70.0);
  });

  it('redondea con incremento de 1.25 kg', () => {
    expect(roundLoad(67.2, 1.25)).toBe(67.5);
    expect(roundLoad(66.0, 1.25)).toBe(66.25);
  });

  it('redondea con incremento de 5.0 kg', () => {
    expect(roundLoad(67.2, 5.0)).toBe(65.0);
    expect(roundLoad(68.0, 5.0)).toBe(70.0);
  });
});

describe('Strength Engine - Training Max & Phase Prescriptions', () => {
  it('calcula Training Max al 90%', () => {
    const tm = calculateTrainingMax(93.3333, 0.90);
    expect(tm).toBeCloseTo(84.0, 1);
  });

  it('calcula las prescripciones para un 1RM de 93.33 kg (TM 84 kg) con redondeo a 2.5 kg', () => {
    const rm = 93.3333; // Sentadilla 80x5
    const tmPct = 0.90; // TM = ~84.0 kg

    // Fase 1: 20% TM = 16.8 kg -> 17.5 kg
    const f1 = prescribeLoad(rm, tmPct, 0.20, 2.5);
    expect(f1.targetWeightKg).toBe(17.5);
    expect(f1.rawWeightKg).toBeCloseTo(16.8, 1);

    // Fase 2: 40% TM = 33.6 kg -> 32.5 / 35.0 kg (33.6 / 2.5 = 13.44 -> 13 * 2.5 = 32.5 or 35.0? 33.6 is closer to 32.5 => 32.5)
    const f2 = prescribeLoad(rm, tmPct, 0.40, 2.5);
    expect(f2.targetWeightKg).toBe(32.5);

    // Fase 3: 60% TM = 50.4 kg -> 50.0 kg
    const f3 = prescribeLoad(rm, tmPct, 0.60, 2.5);
    expect(f3.targetWeightKg).toBe(50.0);

    // Fase 4: 80% TM = 67.2 kg -> 67.5 kg
    const f4 = prescribeLoad(rm, tmPct, 0.80, 2.5);
    expect(f4.targetWeightKg).toBe(67.5);

    // Fase 5: 85% TM = 71.4 kg -> 72.5 kg
    const f5 = prescribeLoad(rm, tmPct, 0.85, 2.5);
    expect(f5.targetWeightKg).toBe(72.5);
  });

  it('genera prescripciones para todas las fases (0 a 5)', () => {
    const all = generateAllPhasePrescriptions(93.3333, DEFAULT_TRAINING_MAX_PERCENT, DEFAULT_ROUNDING_KG);
    expect(all[0].targetWeightKg).toBe(0);
    expect(all[1].targetWeightKg).toBe(17.5);
    expect(all[2].targetWeightKg).toBe(32.5);
    expect(all[3].targetWeightKg).toBe(50.0);
    expect(all[4].targetWeightKg).toBe(67.5);
    expect(all[5].targetWeightKg).toBe(72.5);
  });

  it('calcula lastre para ejercicios con peso corporal', () => {
    // Atleta 75 kg, 1RM de lastre en dominadas = 25 kg. Total 1RM = 100 kg.
    // TM 90% = 90 kg total.
    // Fase 5 (85%): Total = 76.5 kg -> Lastre = 76.5 - 75 = 1.5 kg -> Redondeado a 2.5 kg = 2.5 kg.
    const bodyweight = 75;
    const added1RM = 25;
    const f5 = prescribeLoad(added1RM, 0.90, 0.85, 2.5, true, bodyweight);
    expect(f5.isBodyweight).toBe(true);
    expect(f5.targetWeightKg).toBe(2.5);
  });
});
