import { WorkoutDayDefinition } from './types';

export const ELITE_SCHEDULE: WorkoutDayDefinition[] = [
  {
    id: 'lunes',
    code: 'Día A',
    title: 'Empuje & Cuádriceps',
    subtitle: 'Fuerza Máxima y Reclutamiento Neural Primario',
    isRestDay: false,
    exercises: [
      {
        id: 'sentadilla-trasera',
        name: 'Sentadilla Trasera',
        targetSets: 5,
        targetRepsText: '3 Repeticiones (5x3)',
        defaultRestSeconds: 300, // 5 min
        isMainCompound: true,
        intensityNote: '5 series x 3 repeticiones. Descanso estricto de 5 min entre series.'
      },
      {
        id: 'press-banca',
        name: 'Press de Banca',
        targetSets: 5,
        targetRepsText: '3 Repeticiones (5x3)',
        defaultRestSeconds: 300, // 5 min
        isMainCompound: true,
        intensityNote: '5 series x 3 repeticiones. Pausa de 1s en esternón y empuje explosivo.'
      },
      {
        id: 'press-militar',
        name: 'Press Militar de Pie',
        targetSets: 4,
        targetRepsText: '3 Repeticiones (4x3)',
        defaultRestSeconds: 240, // 4 min
        isMainCompound: true,
        intensityNote: '4 series x 3 repeticiones. Bloqueo estricto sobre la cabeza.'
      },
      {
        id: 'fondos-paralelas',
        name: 'Fondos en Paralelas',
        targetSets: 3,
        targetRepsText: '5 Repeticiones (3x5)',
        defaultRestSeconds: 180, // 3 min
        isMainCompound: false,
        intensityNote: '3 series x 5 repeticiones. Recorrido completo y control excéntrico.'
      }
    ]
  },
  {
    id: 'martes',
    code: 'Día B',
    title: 'Tracción & Cadena Posterior',
    subtitle: 'Tensión Mecánica Pura y Potencia de Agarre',
    isRestDay: false,
    exercises: [
      {
        id: 'peso-muerto-convencional',
        name: 'Peso Muerto Convencional',
        targetSets: 2,
        targetRepsText: '3 Repeticiones (2x3)',
        defaultRestSeconds: 360, // 6 min
        isMainCompound: true,
        intensityNote: '2 series x 3 repeticiones. Máxima tensión y velocidad concéntrica.'
      },
      {
        id: 'dominadas-lastradas',
        name: 'Dominadas Lastradas',
        targetSets: 4,
        targetRepsText: '4 Repeticiones (4x4)',
        defaultRestSeconds: 180, // 3 min
        isMainCompound: false,
        intensityNote: '4 series x 4 repeticiones. Barbilla sobre la barra sólidamente.'
      },
      {
        id: 'remo-pendlay',
        name: 'Remo Pendlay',
        targetSets: 3,
        targetRepsText: '5 Repeticiones (3x5)',
        defaultRestSeconds: 180, // 3 min
        isMainCompound: true,
        intensityNote: '3 series x 5 repeticiones. Cada repetición sale muerta del piso.'
      },
      {
        id: 'peso-muerto-rumano',
        name: 'Peso Muerto Rumano',
        targetSets: 3,
        targetRepsText: '5 Repeticiones (3x5)',
        defaultRestSeconds: 180, // 3 min
        isMainCompound: true,
        intensityNote: '3 series x 5 repeticiones. Estiramiento isquiosural estricto.'
      },
      {
        id: 'paseo-granjero',
        name: 'Paseo del Granjero',
        targetSets: 4,
        targetRepsText: '20 Metros (4 series)',
        defaultRestSeconds: 240, // 4 min
        isMainCompound: false,
        intensityNote: '4 series x 20 metros al límite de agarre.'
      }
    ]
  },
  {
    id: 'miercoles',
    code: 'Descanso',
    title: 'Descanso Absoluto Neuromuscular',
    subtitle: 'Regeneración Central y Resíntesis de Neurotransmisores',
    isRestDay: true,
    restMessage: 'EL SISTEMA NERVIOSO CENTRAL REQUIERE 48H PARA RESTAURAR LA VELOCIDAD DE CONDUCCIÓN AXONAL. ACCESO BLOQUEADO.',
    exercises: []
  },
  {
    id: 'jueves',
    code: 'Día C',
    title: 'Empuje Supremo',
    subtitle: 'Sobrecarga de Alta Intensidad y Potencia Pura',
    isRestDay: false,
    exercises: [
      {
        id: 'press-banca-c',
        name: 'Press de Banca',
        targetSets: 6,
        targetRepsText: '2 Repeticiones (6x2)',
        defaultRestSeconds: 300, // 5 min
        isMainCompound: true,
        intensityNote: '6 series x 2 repeticiones. Altísima concentración neuromuscular.'
      },
      {
        id: 'press-militar-c',
        name: 'Press Militar de Pie',
        targetSets: 4,
        targetRepsText: '3 Repeticiones (4x3)',
        defaultRestSeconds: 240, // 4 min
        isMainCompound: true,
        intensityNote: '4 series x 3 repeticiones. Estabilidad máxima de glúteos y core.'
      },
      {
        id: 'fondos-paralelas-c',
        name: 'Fondos en Paralelas',
        targetSets: 3,
        targetRepsText: '5 Repeticiones (3x5)',
        defaultRestSeconds: 180, // 3 min
        isMainCompound: false,
        intensityNote: '3 series x 5 repeticiones con ejecución estricta.'
      },
      {
        id: 'planchas-pesadas',
        name: 'Planchas Pesadas',
        targetSets: 4,
        targetRepsText: '30 Segundos (3-4 series)',
        defaultRestSeconds: 180, // 3 min
        isMainCompound: false,
        intensityNote: '3 a 4 series de 30 segundos. Rigidez isométrica total.'
      }
    ]
  },
  {
    id: 'viernes',
    code: 'Día D',
    title: 'Tracción & Brazos',
    subtitle: 'Potencia Técnica, Densidad y Tracción Explosiva',
    isRestDay: false,
    exercises: [
      {
        id: 'sentadilla-tecnica',
        name: 'Sentadilla Trasera Técnica',
        targetSets: 3,
        targetRepsText: '3 Repeticiones (3x3)',
        defaultRestSeconds: 240, // 4 min
        isMainCompound: true,
        intensityNote: '3 series x 3 repeticiones. Máxima aceleración y pulcritud técnica.'
      },
      {
        id: 'dominadas-lastradas-d',
        name: 'Dominadas Lastradas',
        targetSets: 4,
        targetRepsText: '4 Repeticiones (4x4)',
        defaultRestSeconds: 180, // 3 min
        isMainCompound: false,
        intensityNote: '4 series x 4 repeticiones. Agarre firme sin balanceo.'
      },
      {
        id: 'remo-pendlay-d',
        name: 'Remo Pendlay',
        targetSets: 3,
        targetRepsText: '5 Repeticiones (3x5)',
        defaultRestSeconds: 180, // 3 min
        isMainCompound: true,
        intensityNote: '3 series x 5 repeticiones. Potencia dorsal desde el suelo.'
      },
      {
        id: 'curl-biceps-barra-z',
        name: 'Curl de Bíceps con Barra Z',
        targetSets: 4,
        targetRepsText: '5 Repeticiones (4x5)',
        defaultRestSeconds: 180, // 3 min
        isMainCompound: false,
        intensityNote: '4 series x 5 repeticiones estrictas, sin balanceo de cadera ni core.'
      },
      {
        id: 'abdominales-en-barra',
        name: 'Abdominales en Barra',
        targetSets: 3,
        targetRepsText: '8 Repeticiones (3x8)',
        defaultRestSeconds: 150, // 2.5 min
        isMainCompound: false,
        intensityNote: '3 series x 8 repeticiones lentas y controladas.'
      }
    ]
  },
  {
    id: 'sabado',
    code: 'Descanso',
    title: 'Descanso Absoluto Neuromuscular',
    subtitle: 'Consolidación de Adaptaciones Sinápticas',
    isRestDay: true,
    restMessage: 'REGENERACIÓN EN CURSO. LAS UNIDADES MOTORAS DE UMBRAL ALTO SE RECONSTRUYEN EN REPOSO.',
    exercises: []
  },
  {
    id: 'domingo',
    code: 'Descanso',
    title: 'Descanso Absoluto Neuromuscular',
    subtitle: 'Preparación para el Ciclo Semanal A',
    isRestDay: true,
    restMessage: 'REPOSO TOTAL. SISTEMA CARDIOVASCULAR Y NEUROLÓGICO EN MODO HOMEOSTASIS.',
    exercises: []
  }
];
