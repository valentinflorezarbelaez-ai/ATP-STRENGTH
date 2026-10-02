/**
 * Athlete AI Coach Knowledge Engine (SPEC-0011)
 * Pure L0 Domain Logic answering questions on biomechanics, technique, rest,
 * Soviet Prilepin ramping, RPE autoregulation, and optimal 48h/72h recovery.
 */

import { getOptimalRecoveryHours } from "./recoveryLockoutCore.mjs";

export const COACH_KNOWLEDGE_TOPICS = Object.freeze({
  REST: {
    patterns: [/descans/i, /recuper/i, /tiempo/i, /cu[aá]nto esperar/i, /pausa/i, /segundos/i, /minutos/i, /horas/i],
    getIntraRestAnswer: (rpe = 8) => {
      if (rpe >= 8.5) {
        return "Para esfuerzos máximos (RPE 8.5 a 10), tus reservas intramusculares de ATP y fosfocreatina (PCr) requieren entre 3 y 5 minutos para regenerarse al 98% a nivel neural. No apures la serie: la fatiga acumulada reduce la velocidad de la barra y el reclutamiento de unidades motoras de alto umbral.";
      }
      return "En series de aproximación y potencia submáxima (RPE 6 a 8), descansá entre 90 y 120 segundos. Esto mantiene el calor articular y la activación neuromuscular sin perder el ritmo metabólico.";
    },
    getInterSessionAnswer: (exerciseName = "este ejercicio") => {
      const hours = getOptimalRecoveryHours(exerciseName);
      if (hours === 72) {
        return `Para ${exerciseName}, el descanso óptimo entre sesiones es de 72 horas. Al ser un ejercicio con carga axial y alta demanda del sistema nervioso central, las miofibrillas tipo IIx y los estabilizadores vertebrales necesitan 3 días completos para alcanzar la cresta de la supercompensación.`;
      }
      return `Para ${exerciseName}, el descanso óptimo entre sesiones es de 48 horas. Ese tiempo garantiza la resíntesis completa de glucógeno y la síntesis proteica miofibrilar antes de volver a aplicar sobrecarga progresiva.`;
    }
  },

  TECHNIQUE: {
    patterns: [/c[oó]mo (lo )?hago/i, /t[eé]cnica/i, /postura/i, /agarre/i, /forma/i, /posici[oó]n/i, /cues/i, /consejo/i, /biomec[aá]nica/i],
    getExerciseCues: (exerciseName = "") => {
      const lower = exerciseName.toLowerCase();
      if (lower.includes("sentadilla")) {
        return "Puntos clave en Sentadilla: 1) Barra apoyada firme en trapecios con codos alineados al torso. 2) Respiración diafragmática (Maniobra de Valsalva): inflá el abdomen y cerrá el core antes de descender. 3) Abrí rodillas hacia afuera en la misma línea de la punta de tus pies. 4) Rompé el paralelo manteniendo el talón clavado y empujá el piso con el mediopié.";
      }
      if (lower.includes("banca")) {
        return "Puntos clave en Press de Banca: 1) Retracción y depresión escapular: clavá los omóplatos en el banco. 2) Leg drive activo: apoyá los pies firmes y empujá hacia atrás para tensar cuádriceps y glúteos. 3) Trayectoria en 'J' inversa: la barra baja al esternón bajo y sube vertical hacia la línea de los ojos. 4) Codos a 45-60 grados respecto al torso, nunca abiertos a 90°.";
      }
      if (lower.includes("muerto")) {
        return "Puntos clave en Peso Muerto: 1) Barra pegada a las tibias sobre el mediopié. 2) Dorsales activados: 'quebrá la barra' para trabar los hombros. 3) Cuña inicial: bajá caderas hasta sentir tensión en isquiotibiales sin encorvar la zona lumbar. 4) Empuje simultáneo de piso y extensión violenta de cadera: no tirés con los brazos, empujá el suelo como en una prensa.";
      }
      if (lower.includes("militar") || lower.includes("press")) {
        return "Puntos clave en Press Militar: 1) Glúteos y abdomen como roca: cero hiperextensión lumbar. 2) Antebrazos estrictamente perpendiculares al suelo debajo de la barra. 3) Retraé la cabeza al inicio para que pase la barra y 'meté la cabeza' al bloquear arriba con los hombros activos.";
      }
      return `Para ${exerciseName}: Asegurá una base sólida, inhalá aire al diafragma para presurizar el core, controlá la fase excéntrica en 2 a 3 segundos y aplicá máxima intención de aceleración en la fase concéntrica.`;
    }
  },

  PHASE_GUIDANCE: {
    patterns: [/qu[eé] hago/i, /qu[eé] significa/i, /rpe/i, /serie/i, /peso/i, /carga/i, /qu[eé] sigue/i],
    getGuidance: (params = {}) => {
      const { exerciseName = "el ejercicio", weight = 0, reps = "5", rpe = 8 } = params;
      return `En esta serie de ${exerciseName}: Cargá ${weight > 0 ? weight + " kilos" : "tu peso programado"} para ${reps} repeticiones a RPE ${rpe}. RPE ${rpe} significa que al terminar la última repetición debés sentir que te quedaban exactamente 2 repeticiones en el tanque (RIR 2). Si la barra sube lenta o con temblor, bajá un 5% para proteger el SNC.`;
    }
  },

  RECOVERY_LOCKOUT: {
    patterns: [/bloque/i, /por qu[eé] no me deja/i, /repetir/i, /volver a hacer/i, /rojo/i, /candado/i],
    getExplanation: (exerciseName = "el ejercicio", remainingHours = 48) => {
      return `El ejercicio ${exerciseName} está protegido por el protocolo biológico de recuperación. El crecimiento muscular y la consolidación de fuerza ocurren durante el descanso, no en el gimnasio. Si entrenás con micro-desgarros activos y fatiga central acumulada, entrás en sobreentrenamiento y aumentás el riesgo de tendinopatías. Respetá las ${remainingHours} horas restantes para volver más fuerte.`;
    }
  }
});

export function queryCoachKnowledge(userQuery = "", context = {}) {
  const query = userQuery.trim();
  const lower = query.toLowerCase();

  const {
    currentExercise = "Sentadilla Trasera",
    currentWeight = 100,
    currentReps = "5",
    currentRpe = 8,
    isLocked = false,
    remainingHours = 48,
    remainingMinutes = 0,
  } = context;

  // 1. Detection: Recovery / Lockout
  if (isLocked && (lower.includes("bloque") || lower.includes("candado") || lower.includes("puedo hacer") || lower.includes("repetir") || lower.includes("por qu"))) {
    return {
      topic: "RECOVERY_LOCKOUT",
      text: COACH_KNOWLEDGE_TOPICS.RECOVERY_LOCKOUT.getExplanation(currentExercise, remainingHours),
      followUps: [
        "¿Qué ejercicio puedo hacer hoy?",
        "¿Cómo acelero mi recuperación?",
        "¿Cuánto debo descansar entre series?"
      ]
    };
  }

  // 2. Detection: Rest & Recovery
  for (const pattern of COACH_KNOWLEDGE_TOPICS.REST.patterns) {
    if (pattern.test(lower)) {
      if (lower.includes("d[ií]as") || lower.includes("sesion") || lower.includes("volver") || lower.includes("semana") || lower.includes("72") || lower.includes("48")) {
        return {
          topic: "REST_INTER_SESSION",
          text: COACH_KNOWLEDGE_TOPICS.REST.getInterSessionAnswer(currentExercise),
          followUps: [
            "¿Cuánto descanso entre series?",
            "¿Cómo ejecuto la técnica correcta?",
            "¿Qué significa RPE en mi entrenamiento?"
          ]
        };
      }
      return {
        topic: "REST_INTRA_SET",
        text: `${COACH_KNOWLEDGE_TOPICS.REST.getIntraRestAnswer(currentRpe)} ${COACH_KNOWLEDGE_TOPICS.REST.getInterSessionAnswer(currentExercise)}`,
        followUps: [
          "¿Cómo hago este ejercicio?",
          "¿Qué peso debo cargar ahora?",
          "¿Por qué 72 horas para sentadilla?"
        ]
      };
    }
  }

  // 3. Detection: Technique & Biomechanics
  for (const pattern of COACH_KNOWLEDGE_TOPICS.TECHNIQUE.patterns) {
    if (pattern.test(lower)) {
      return {
        topic: "TECHNIQUE",
        text: COACH_KNOWLEDGE_TOPICS.TECHNIQUE.getExerciseCues(currentExercise),
        followUps: [
          "¿Cuánto debo descansar?",
          "¿Qué hago en esta serie?",
          "¿Qué significa cadencia de tempo?"
        ]
      };
    }
  }

  // 4. Detection: What do I do here / Current Phase / RPE
  for (const pattern of COACH_KNOWLEDGE_TOPICS.PHASE_GUIDANCE.patterns) {
    if (pattern.test(lower)) {
      return {
        topic: "PHASE_GUIDANCE",
        text: COACH_KNOWLEDGE_TOPICS.PHASE_GUIDANCE.getGuidance({
          exerciseName: currentExercise,
          weight: currentWeight,
          reps: currentReps,
          rpe: currentRpe
        }),
        followUps: [
          "¿Cómo hago este ejercicio?",
          "¿Cuánto descanso entre series?",
          "¿Cómo autoregulo si me siento cansado?"
        ]
      };
    }
  }

  // Default Fallback
  return {
    topic: "GENERAL_COACHING",
    text: `Para ${currentExercise}: Mantené el foco mental en cada repetición. La fuerza se construye con técnica milimétrica, respiración diafragmática y respeto estricto por los descansos biológicos. Podés preguntarme sobre la técnica exacta, cuánto descansar o qué hacer en tu serie actual.`,
    followUps: [
      "¿Cómo hago la técnica correcta?",
      "¿Cuánto debo descansar?",
      "¿Qué hago en esta serie?"
    ]
  };
}
