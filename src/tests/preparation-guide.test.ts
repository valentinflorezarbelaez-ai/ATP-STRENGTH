import { describe, it, expect } from 'vitest';
import { PreparationGuide } from '../domain/preparation-guide';
import { ELITE_SCHEDULE } from '../domain/schedule-data';

describe('PreparationGuide - Mapa Fijo de Preparación y Repeticiones', () => {
  it('debe generar exactamente las 6 fases (0 a 5)', () => {
    const phases = PreparationGuide.generatePhases([]);
    expect(phases.length).toBe(6);
    expect(phases.map(p => p.phase)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('Fase 0: Movilidad Articular Dinámica con temporizador de 120s', () => {
    const phases = PreparationGuide.generatePhases([]);
    const p0 = phases[0];
    expect(p0.phase).toBe(0);
    expect(p0.restSeconds).toBe(120);
    expect(p0.name).toContain('Movilidad Articular Dinámica');
  });

  it('Fase 1: Activación Neuromuscular con 10 repeticiones y 60s de descanso', () => {
    const phases = PreparationGuide.generatePhases([]);
    const p1 = phases[1];
    expect(p1.phase).toBe(1);
    expect(p1.repsText).toBe('10 Repeticiones');
    expect(p1.restSeconds).toBe(60);
  });

  it('Fase 2: Aproximación Ligera con 5 repeticiones y 90s de descanso', () => {
    const phases = PreparationGuide.generatePhases([]);
    const p2 = phases[2];
    expect(p2.phase).toBe(2);
    expect(p2.repsText).toBe('5 Repeticiones');
    expect(p2.restSeconds).toBe(90);
  });

  it('Fase 3: Aproximación Media con 3 repeticiones y 120s de descanso', () => {
    const phases = PreparationGuide.generatePhases([]);
    const p3 = phases[3];
    expect(p3.phase).toBe(3);
    expect(p3.repsText).toBe('3 Repeticiones');
    expect(p3.restSeconds).toBe(120);
  });

  it('Fase 4: Aproximación Pesada con 1 repetición y 180s de descanso', () => {
    const phases = PreparationGuide.generatePhases([]);
    const p4 = phases[4];
    expect(p4.phase).toBe(4);
    expect(p4.repsText).toBe('1 Repetición');
    expect(p4.restSeconds).toBe(180);
  });

  it('Fase 5: Series de Fuerza Real', () => {
    const phases = PreparationGuide.generatePhases([]);
    const p5 = phases[5];
    expect(p5.phase).toBe(5);
    expect(p5.name).toContain('Series de Fuerza Real');
  });

  it('marca correctamente las fases completadas', () => {
    const phases = PreparationGuide.generatePhases([0, 1, 2]);
    expect(phases[0].isCompleted).toBe(true);
    expect(phases[1].isCompleted).toBe(true);
    expect(phases[2].isCompleted).toBe(true);
    expect(phases[3].isCompleted).toBe(false);
    expect(phases[4].isCompleted).toBe(false);
  });
});

describe('ELITE_SCHEDULE - Itinerario Fijo de 4 Días', () => {
  it('contiene 7 días con 4 días de entrenamiento y 3 de descanso', () => {
    expect(ELITE_SCHEDULE.length).toBe(7);
    const trainingDays = ELITE_SCHEDULE.filter(d => !d.isRestDay);
    const restDays = ELITE_SCHEDULE.filter(d => d.isRestDay);
    expect(trainingDays.length).toBe(4);
    expect(restDays.length).toBe(3);
  });

  it('Lunes (Día A) tiene 4 ejercicios: Sentadilla (5x3), Banca (5x3), Militar (4x3), Fondos (3x5)', () => {
    const lunes = ELITE_SCHEDULE.find(d => d.id === 'lunes');
    expect(lunes).toBeDefined();
    expect(lunes?.exercises.length).toBe(4);
    expect(lunes?.exercises[0].name).toBe('Sentadilla Trasera');
    expect(lunes?.exercises[0].targetSets).toBe(5);
  });

  it('Miércoles, Sábado y Domingo están marcados como descanso', () => {
    const miercoles = ELITE_SCHEDULE.find(d => d.id === 'miercoles');
    const sabado = ELITE_SCHEDULE.find(d => d.id === 'sabado');
    const domingo = ELITE_SCHEDULE.find(d => d.id === 'domingo');

    expect(miercoles?.isRestDay).toBe(true);
    expect(sabado?.isRestDay).toBe(true);
    expect(domingo?.isRestDay).toBe(true);
  });
});
