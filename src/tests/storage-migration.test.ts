import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageRepository, STORAGE_KEY_V2, STORAGE_KEY_V3 } from '../storage/storage-repository';
import { createInitialAppState } from '../storage/default-state';

// Create a mock localStorage for node testing environment
const createLocalStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
};

describe('StorageRepository - Migración y Persistencia V2 -> V3', () => {
  let mockStorage: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    mockStorage = createLocalStorageMock();
    vi.stubGlobal('localStorage', mockStorage);
  });

  it('inicializa un estado V3 limpio si no hay nada guardado', () => {
    const state = StorageRepository.loadState();
    expect(state.version).toBe(3);
    expect(state.progress).toBeDefined();
    expect(state.progress['sentadilla-trasera']).toBeDefined();
    expect(state.progress['sentadilla-trasera'].trainingMaxPercent).toBe(0.90);
  });

  it('migra de forma transparente un estado V2 a V3 preservando el historial de series', () => {
    // Simular un estado V2 en localStorage
    const legacyV2State = {
      activeDayId: 'martes',
      activeExerciseId: 'peso-muerto-convencional',
      exerciseStates: {
        'peso-muerto-convencional': {
          exerciseId: 'peso-muerto-convencional',
          completedSetsCount: 2,
          history: [
            {
              id: 'pm-1',
              exerciseId: 'peso-muerto-convencional',
              dayId: 'martes',
              setIndex: 1,
              targetRepsText: '3 Repeticiones',
              timestamp: 1690000000000
            }
          ],
          lastUpdated: 1690000000000
        }
      },
      completedPrepPhases: {
        'peso-muerto-convencional': [0, 1, 2, 3, 4]
      },
      activeAtpTimer: null
    };

    mockStorage.setItem(STORAGE_KEY_V2, JSON.stringify(legacyV2State));

    // Cargar estado debe detectar V2, transformarlo a V3 y guardarlo en V3
    const loaded = StorageRepository.loadState();
    expect(loaded.version).toBe(3);
    expect(loaded.activeDayId).toBe('martes');
    expect(loaded.activeExerciseId).toBe('peso-muerto-convencional');
    expect(loaded.exerciseStates['peso-muerto-convencional'].completedSetsCount).toBe(2);
    expect(loaded.exerciseStates['peso-muerto-convencional'].history.length).toBe(1);
    expect(loaded.completedPrepPhases['peso-muerto-convencional']).toEqual([0, 1, 2, 3, 4]);

    // Debe haber generado el mapa de progreso con valores por defecto
    expect(loaded.progress).toBeDefined();
    expect(loaded.progress['peso-muerto-convencional']).toBeDefined();
    expect(loaded.progress['peso-muerto-convencional'].trainingMaxPercent).toBe(0.90);

    // Debe haberlo persistido en V3
    expect(mockStorage.getItem(STORAGE_KEY_V3)).not.toBeNull();
  });

  it('exporta e importa correctamente una sesión en JSON conservando marcas y progreso', () => {
    const state = createInitialAppState();
    state.progress['sentadilla-trasera'].currentOneRepMaxKg = 93.33;
    state.progress['sentadilla-trasera'].records = [
      {
        id: 'rec-1',
        exerciseId: 'sentadilla-trasera',
        date: '2026-09-01',
        timestamp: Date.now(),
        weightKg: 80,
        reps: 5,
        estimatedOneRepMaxKg: 93.33,
        source: 'epley'
      }
    ];

    const json = StorageRepository.exportJSON(state);
    expect(json).toContain('sentadilla-trasera');
    expect(json).toContain('93.33');

    const imported = StorageRepository.importJSON(json);
    expect(imported).not.toBeNull();
    expect(imported?.progress['sentadilla-trasera'].currentOneRepMaxKg).toBe(93.33);
    expect(imported?.progress['sentadilla-trasera'].records.length).toBe(1);
  });
});
