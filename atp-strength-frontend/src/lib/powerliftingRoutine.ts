/**
 * Elite Powerlifting & Absolute Strength Routine (SSOT)
 * Designed for maximal pound-for-pound power (Colton Engelbrecht / John Haack / Ed Coan methodology).
 * Strictly zero junk-volume accessories: 100% pure neuromuscular force, absolute strength, and ATP-PCr recovery.
 * Also includes the combat-ready Fighter's Protocol (Moorz Combat Conditioning).
 */

export interface PowerExercisePlan {
  id: string;
  name: string;
  category: "powerlifting" | "strongman" | "combat";
  targetPercentage: number;
  sets: number;
  reps: string;
  restSeconds: number; // 180s - 300s (3 to 5 minutes)
  atpRecoveryMessage: string;
  cues: string[];
  videoSearchName: string;
}

export interface PowerRoutineDay {
  key: string;
  dayLabel: string;
  title: string;
  subtitle: string;
  focus: string;
  philosophy: string;
  exercises: PowerExercisePlan[];
}

export const POWERLIFTING_ABSOLUTE_DAYS: PowerRoutineDay[] = [
  {
    key: "POWER_DAY_1_BENCH",
    dayLabel: "LUNES",
    title: "Press de Banca Pesado",
    subtitle: "Fuerza Horizontal de Élite · Estilo John Haack / Colton Engelbrecht",
    focus: "Poder de empuje máximo libra por libra, estabilidad escapular extrema y leg drive brutal.",
    philosophy: "Cero accesorios inútiles. Toda la energía del sistema nervioso central concentrada en mover la máxima carga horizontal sin disipar energía.",
    exercises: [
      {
        id: "bench-competition",
        name: "Press de Banca",
        category: "powerlifting",
        targetPercentage: 90,
        sets: 4,
        reps: "2-3 reps",
        restSeconds: 240, // 4 minutos
        atpRecoveryMessage: "Descanso de 4 min: 98% de ATP y fosfocreatina celular regenerados para mantener reclutamiento de unidades motoras tipo IIx.",
        cues: [
          "Retracción y depresión escapular máxima clavando las escápulas en el banco.",
          "Leg drive constante con talones firmes contra el suelo transmitiendo fuerza desde el piso.",
          "Trayectoria en 'J' inversa y bloqueo explosivo de tríceps sin aflojar la tensión dorsal."
        ],
        videoSearchName: "press de banca",
      },
    ],
  },
  {
    key: "POWER_DAY_2_SQUAT",
    dayLabel: "MIÉRCOLES",
    title: "Sentadilla Pesada",
    subtitle: "Poder Absoluto y Base de Piernas · Estilo Ed Coan",
    focus: "Fuerza pura concéntrica desde el pozo, tensión intra-abdominal y solidez estructural.",
    philosophy: "La sentadilla profunda rompiendo el paralelo construye el pilar sobre el que descansa toda la fuerza del cuerpo.",
    exercises: [
      {
        id: "squat-competition",
        name: "Sentadilla Trasera",
        category: "powerlifting",
        targetPercentage: 88,
        sets: 4,
        reps: "3 reps",
        restSeconds: 240, // 4 minutos
        atpRecoveryMessage: "Descanso de 4 min: Restauración del sistema neuromuscular para soportar carga compresión espinal con técnica intachable.",
        cues: [
          "Presión intra-abdominal profunda (maniobra de Valsalva) expandiendo el core en 360 grados.",
          "Romper el paralelo de forma controlada sin perder la verticalidad del torso.",
          "Explosión concéntrica clavando los talones contra la plataforma."
        ],
        videoSearchName: "sentadilla trasera",
      },
    ],
  },
  {
    key: "POWER_DAY_3_DEADLIFT",
    dayLabel: "VIERNES",
    title: "Peso Muerto Pesado",
    subtitle: "Cadena Posterior Absoluta · Periodización Lineal de Ed Coan",
    focus: "Extensión de cadera máxima, fuerza de agarre indestructible y erección espinal blindada.",
    philosophy: "El peso muerto separa el verdadero poder del gimnasio cosmético. Sin rebote, desde parada inerte, cada repetición es una batalla técnica absoluta.",
    exercises: [
      {
        id: "deadlift-competition",
        name: "Peso Muerto Convencional",
        category: "powerlifting",
        targetPercentage: 92,
        sets: 4,
        reps: "2 reps",
        restSeconds: 300, // 5 minutos completos
        atpRecoveryMessage: "Descanso de 5 min: 100% de recuperación del SNC y resíntesis de fosfógenos tras el mayor estrés neural del entrenamiento.",
        cues: [
          "Barra literalmente pegada a las tibias antes de despegar.",
          "Dorsales activados 'partiendo la barra a la mitad' para fijar la columna torácica.",
          "Empuje contra el piso hasta pasar las rodillas y bloqueo contundente de glúteos."
        ],
        videoSearchName: "peso muerto convencional",
      },
    ],
  },
  {
    key: "POWER_DAY_4_OVERHEAD",
    dayLabel: "DOMINGO",
    title: "Press Militar Pesado & Cargas Strongman",
    focus: "Fuerza funcional por encima de la cabeza y acarreo de cargas incómodas (Shaw / Thor).",
    subtitle: "Poder de Hombros y Agarre de Acero · World's Strongest Man",
    philosophy: "Para replicar a los hombres más fuertes de la historia, debes levantar sobre tu cabeza y mover objetos pesados caminando.",
    exercises: [
      {
        id: "overhead-military",
        name: "Press Militar",
        category: "powerlifting",
        targetPercentage: 85,
        sets: 4,
        reps: "3-4 reps",
        restSeconds: 180, // 3 minutos
        atpRecoveryMessage: "Descanso de 3 min: 95-98% de ATP restaurado para máxima estabilidad del cinturón escapular.",
        cues: [
          "Glúteos y cuádriceps en contracción máxima para crear una plataforma rígida como una roca.",
          "Trayectoria de barra vertical esquivando el mentón y metiendo la cabeza bajo la barra en el bloqueo.",
          "Codos ligeramente adelantados en la base."
        ],
        videoSearchName: "press militar",
      },
      {
        id: "strongman-farmers",
        name: "Paseo del Granjero Pesado",
        category: "strongman",
        targetPercentage: 85,
        sets: 3,
        reps: "40 metros",
        restSeconds: 240, // 4 minutos
        atpRecoveryMessage: "Descanso de 4 min: Permite oxigenar los antebrazos y estabilizadores espinales antes del siguiente paseo.",
        cues: [
          "Agarre de pinza absoluto sin encoger los hombros hacia las orejas.",
          "Pasos cortos, rápidos y precisos manteniendo la pelvis neutra.",
          "Mirada al frente, costillas cerradas y core acorazado."
        ],
        videoSearchName: "paseo del granjero pesado",
      },
    ],
  },
];

export const FIGHTER_MOORZ_DAYS: PowerRoutineDay[] = [
  {
    key: "MOORZ_BLOQUE_1",
    dayLabel: "BLOQUE 1",
    title: "Fuerza Base del Peleador",
    subtitle: "La base sin la que nada más funciona · Protocolo Moorz",
    focus: "Construcción neuromuscular de cadena posterior y tronco inferior con alta velocidad de intención.",
    philosophy: "Sin fuerza máxima de cadena posterior no hay transferencia al golpe ni al derribo.",
    exercises: [
      {
        id: "moorz-dl",
        name: "Peso Muerto Convencional",
        category: "combat",
        targetPercentage: 85,
        sets: 4,
        reps: "3-5 reps",
        restSeconds: 210, // 3.5 min
        atpRecoveryMessage: "Descanso de 3-4 min: La velocidad de intención activa el sistema nervioso, no el peso.",
        cues: ["Velocidad de intención máxima.", "Sin fallo muscular. Si se ralentiza la barra, parar."],
        videoSearchName: "peso muerto convencional",
      },
      {
        id: "moorz-sq",
        name: "Sentadilla Trasera",
        category: "combat",
        targetPercentage: 80,
        sets: 4,
        reps: "4-6 reps",
        restSeconds: 180, // 3 min
        atpRecoveryMessage: "Descanso de 3 min: Rango completo para activar el patrón sin acumular fatiga innecesaria.",
        cues: ["Muslo paralelo al suelo o por debajo.", "Explosión concéntrica."],
        videoSearchName: "sentadilla trasera",
      },
      {
        id: "moorz-pullup",
        name: "Dominadas Lastradas",
        category: "combat",
        targetPercentage: 80,
        sets: 4,
        reps: "6-10 reps",
        restSeconds: 120, // 2 min
        atpRecoveryMessage: "Descanso de 2 min: Tracción pesada para control de clinch y agarre en suelo.",
        cues: ["Depresión escapular antes de traccionar.", "Rango articular completo."],
        videoSearchName: "dominadas lastradas",
      },
    ],
  },
  {
    key: "MOORZ_BLOQUE_2",
    dayLabel: "BLOQUE 2",
    title: "Potencia y Explosividad",
    subtitle: "Transferencia directa al golpeo y derribo · Sistema ATP-PCr",
    focus: "Esfuerzos máximos de menos de 10 segundos, rotación explosiva y triple extensión.",
    philosophy: "Todo golpe potente empieza abajo y rota en el torso. El descanso completo no es opcional: sin recuperación neural se convierte en cardio inútil.",
    exercises: [
      {
        id: "moorz-boxjump",
        name: "Salto al Cajón",
        category: "combat",
        targetPercentage: 100,
        sets: 4,
        reps: "4-6 saltos",
        restSeconds: 150, // 2.5 min
        atpRecoveryMessage: "Descanso completo 2-3 min: La velocidad es el objetivo, no la fatiga.",
        cues: ["Triple extensión explosiva (tobillos, rodillas, cadera).", "Aterrizaje suave."],
        videoSearchName: "salto con trap bar",
      },
      {
        id: "moorz-bench-exp",
        name: "Press de Banca",
        category: "combat",
        targetPercentage: 75,
        sets: 4,
        reps: "4-5 reps",
        restSeconds: 150, // 2.5 min
        atpRecoveryMessage: "Descanso 2-3 min: Baja controlado, sube lo más rápido posible para reclutar fibras rápidas.",
        cues: ["Máxima velocidad concéntrica.", "Transferencia al jab y cross."],
        videoSearchName: "press de banca",
      },
      {
        id: "moorz-powerclean",
        name: "Power Clean (Cargada de Potencia)",
        category: "combat",
        targetPercentage: 80,
        sets: 4,
        reps: "3 reps",
        restSeconds: 180,
        atpRecoveryMessage: "Descanso de 3 min: Potencia del suelo a los hombros en una sola aceleración violenta.",
        cues: ["Aceleración explosiva en el segundo tirón.", "Recepción sólida sobre clavículas."],
        videoSearchName: "power clean (cargada de potencia)",
      },
    ],
  },
];
