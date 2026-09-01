import { PreparationPhaseStep, LoadPrescription } from './types';

/**
 * Guía de Preparación Neuromuscular Secuencial (Fases 0 a 5)
 */
export class PreparationGuide {
  public static generatePhases(
    completedPhases: number[] = [],
    prescriptions?: Record<number, LoadPrescription>
  ): PreparationPhaseStep[] {
    const isDone = (p: number) => completedPhases.includes(p);

    const getPhaseTargetText = (phase: number, defaultReps: string): string => {
      const presc = prescriptions?.[phase];
      if (presc && presc.targetWeightKg > 0) {
        const pctText = `${Math.round(presc.percentageOfTrainingMax * 100)}% TM`;
        if (presc.isBodyweight) {
          return `${defaultReps} · +${presc.targetWeightKg} kg lastre (${pctText})`;
        }
        return `${defaultReps} · ${presc.targetWeightKg} kg objetivo (${pctText})`;
      }
      return defaultReps;
    };

    return [
      {
        phase: 0,
        name: 'Fase 0: Movilidad Articular Dinámica',
        repsText: '120s Continuos',
        restSeconds: 120,
        description: 'Movilidad articular completa: caderas, tobillos, escápulas y hombros sin fatiga.',
        isCompleted: isDone(0),
        loadPrescription: prescriptions?.[0]
      },
      {
        phase: 1,
        name: 'Fase 1: Activación Neuromuscular',
        repsText: getPhaseTargetText(1, '10 Repeticiones'),
        restSeconds: 60,
        description: 'Ejecución libre con Barra Vacía o Peso Corporal. Calibración del patrón motor concéntrico explosivo.',
        isCompleted: isDone(1),
        loadPrescription: prescriptions?.[1]
      },
      {
        phase: 2,
        name: 'Fase 2: Aproximación Ligera',
        repsText: getPhaseTargetText(2, '5 Repeticiones'),
        restSeconds: 90,
        description: '5 repeticiones de control técnico estricto. Despertar propiocepción y tensión de core.',
        isCompleted: isDone(2),
        loadPrescription: prescriptions?.[2]
      },
      {
        phase: 3,
        name: 'Fase 3: Aproximación Media',
        repsText: getPhaseTargetText(3, '3 Repeticiones'),
        restSeconds: 120,
        description: '3 repeticiones de estricta aceleración y velocidad. Ajuste de brace abdominal profundo.',
        isCompleted: isDone(3),
        loadPrescription: prescriptions?.[3]
      },
      {
        phase: 4,
        name: 'Fase 4: Aproximación Pesada',
        repsText: getPhaseTargetText(4, '1 Repetición'),
        restSeconds: 180,
        description: '1 sola repetición de máxima potencia (PAP). Encendido de unidades motoras de alto umbral.',
        isCompleted: isDone(4),
        loadPrescription: prescriptions?.[4]
      },
      {
        phase: 5,
        name: 'Fase 5: Series de Fuerza Real',
        repsText: getPhaseTargetText(5, 'Series Pautadas'),
        restSeconds: 0,
        description: 'Series efectivas con descanso estricto de resíntesis de fosfocreatina.',
        isCompleted: isDone(5),
        loadPrescription: prescriptions?.[5]
      }
    ];
  }
}
