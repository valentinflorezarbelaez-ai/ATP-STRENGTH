/**
 * SPEC-0007: Soviet Strength & Prilepin Progression Engine (L0 pure module)
 * Implements A.S. Prilepin's Table (1974) and INOL (Intensity Number of Lifts)
 * from Soviet Olympic and Powerlifting Science (Zatsiorsky, Sheiko, Verkhoshansky).
 * Zero runtime dependencies.
 */

export const PRILEPIN_ZONES = Object.freeze({
  ZONE_55_65: Object.freeze({
    key: 'ZONE_55_65',
    name: 'Potencia Dinámica & Velocidad',
    minIntensity: 55,
    maxIntensity: 69.9,
    optimalReps: 4,
    repRange: Object.freeze([3, 6]),
    optimalTotalVolume: 24,
    rationale: 'Fase de aceleración máxima: 3-6 repeticiones optimizan el reclutamiento motriz explosivo con fatiga insignificante.',
  }),
  ZONE_70_79: Object.freeze({
    key: 'ZONE_70_79',
    name: 'Fuerza Base & Reclutamiento',
    minIntensity: 70,
    maxIntensity: 79.9,
    optimalReps: 3,
    repRange: Object.freeze([3, 6]),
    optimalTotalVolume: 18,
    rationale: 'Fuerza técnica base: 3 repeticiones exactas consolidan el patrón motriz sin degradación de velocidad de barra.',
  }),
  ZONE_80_89: Object.freeze({
    key: 'ZONE_80_89',
    name: 'Fuerza Absoluta Rusa (Heavy)',
    minIntensity: 80,
    maxIntensity: 89.9,
    optimalReps: 3,
    repRange: Object.freeze([2, 4]),
    optimalTotalVolume: 15,
    rationale: 'Zona Prilepin de Fuerza Absoluta: 2-4 repeticiones (óptimo 3) reclutan el 100% de motoneuronas rápidas tipo IIb.',
  }),
  ZONE_90_PLUS: Object.freeze({
    key: 'ZONE_90_PLUS',
    name: 'Pico de Fuerza Neural (Máximo)',
    minIntensity: 90,
    maxIntensity: 100,
    optimalReps: 1,
    repRange: Object.freeze([1, 2]),
    optimalTotalVolume: 7,
    rationale: 'Intensidad neural máxima: 1-2 repeticiones exigen sincronización intermuscular extrema sin inducir fallo metabólico.',
  }),
});

/**
 * Calculates INOL (Intensity Number of Lifts) for a set:
 * INOL = Reps / (100 - %1RM)
 */
export function calculateInol(reps, intensityPercent) {
  if (!reps || reps <= 0) return 0;
  const clampedIntensity = Math.min(99, Math.max(1, intensityPercent));
  const denom = 100 - clampedIntensity;
  return Math.round((reps / denom) * 100) / 100;
}

/**
 * Returns the matching Prilepin Table zone object based on intensity %1RM.
 */
export function getPrilepinZone(intensityPercent) {
  if (intensityPercent >= 90) return PRILEPIN_ZONES.ZONE_90_PLUS;
  if (intensityPercent >= 80) return PRILEPIN_ZONES.ZONE_80_89;
  if (intensityPercent >= 70) return PRILEPIN_ZONES.ZONE_70_79;
  return PRILEPIN_ZONES.ZONE_55_65;
}

/**
 * Generates an exact Soviet prescription based on lifted weight and 1RM.
 */
export function getPrilepinPrescription(weightKg, oneRepMaxKg) {
  if (!oneRepMaxKg || oneRepMaxKg <= 0 || !weightKg || weightKg <= 0) {
    return {
      exactTargetReps: 3,
      intensityPercent: 0,
      zoneKey: 'ZONE_80_89',
      zoneName: 'Fuerza Absoluta Estándar',
      repRange: [3, 5],
      rationale: 'Protocolo de fuerza absoluta: 3 repeticiones exactas recomendadas para máxima potencia.',
      setInol: 0.2,
    };
  }

  const intensityPercent = Math.round((weightKg / oneRepMaxKg) * 1000) / 10;
  const zone = getPrilepinZone(intensityPercent);
  const setInol = calculateInol(zone.optimalReps, intensityPercent);

  return {
    exactTargetReps: zone.optimalReps,
    intensityPercent,
    zoneKey: zone.key,
    zoneName: zone.name,
    repRange: zone.repRange,
    rationale: zone.rationale,
    setInol,
  };
}

/**
 * Evaluates the accumulated session INOL and returns fatigue/stimulus status.
 * - INOL < 0.4: Estímulo bajo / recuperación
 * - INOL 0.4 - 1.0: Óptimo soviético para progreso de fuerza
 * - INOL 1.0 - 1.2: Carga dura pero tolerable
 * - INOL > 1.2: Fatiga extrema / riesgo de sobreentrenamiento SNC
 */
export function evaluateSessionInol(sets = []) {
  let totalInol = 0;
  for (const s of sets) {
    totalInol += calculateInol(s.reps, s.intensity);
  }
  totalInol = Math.round(totalInol * 100) / 100;

  if (totalInol < 0.4) {
    return {
      totalInol,
      status: 'RECOVERY_VOLUME',
      label: 'Volumen Ligero',
      guidance: 'Estímulo de descarga o recuperación. Permite sumar más series si el SNC está fresco.',
    };
  }
  if (totalInol <= 1.0) {
    return {
      totalInol,
      status: 'OPTIMAL_STIMULUS',
      label: 'Óptimo Soviético',
      guidance: 'Óptimo soviético: máximo reclutamiento neural y adaptación sin sobreentrenamiento del SNC.',
    };
  }
  if (totalInol <= 1.2) {
    return {
      totalInol,
      status: 'HIGH_VOLUME',
      label: 'Carga Alta',
      guidance: 'Volumen demandante. Asegurá 4 minutos completos de descanso ATP entre series.',
    };
  }
  return {
    totalInol,
    status: 'OVERREACHING',
    label: 'Sobrecarga Máxima',
    guidance: 'Límite de fatiga alcanzado. No superar este volumen para evitar degradación de la velocidad de barra.',
  };
}
