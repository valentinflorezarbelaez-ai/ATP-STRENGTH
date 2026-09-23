/**
 * Exercise Media Catalog & Biomechanical Cues (SSOT)
 * Features high-definition specific YouTube technical demonstrations from world-class strength coaches.
 */

export const EXERCISE_MEDIA_CATALOG = {
  "sentadilla trasera": {
    id: "squat_back",
    name: "Sentadilla Trasera",
    category: "Sentadilla",
    targetMuscles: ["Cuádriceps", "Glúteo Mayor", "Erector Espinal", "Core"],
    videoUrl: "https://www.youtube.com/watch?v=vmNPOjaGrVE",
    youtubeId: "vmNPOjaGrVE",
    posterUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop",
    formCues: [
      "Apoyo trípode firme con los pies al ancho de hombros y puntas ligeramente abiertas.",
      "Inspiración diafragmática profunda 360° y maniobra de Valsalva antes de iniciar el descenso.",
      "Control excéntrico bajando hasta que la cadera rompa el paralelo de las rodillas.",
      "Empuje concéntrico explosivo manteniendo el pecho orgulloso y rodillas alineadas con los pies."
    ],
    commonMistakes: [
      "Colapso de rodillas en valgo durante la fase concéntrica.",
      "Pérdida de rigidez en la columna lumbar (butt-wink excesivo) en el punto más profundo."
    ],
    tempo: "3-1-X-1"
  },

  "press de banca": {
    id: "bench_press",
    name: "Press de Banca Plano",
    category: "Banca",
    targetMuscles: ["Pectoral Mayor", "Tríceps Braquial", "Deltoides Anterior", "Dorsal Ancho"],
    videoUrl: "https://www.youtube.com/watch?v=vUa1TzR5h9w",
    youtubeId: "vUa1TzR5h9w",
    posterUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop",
    formCues: [
      "Retracción y depresión escapular estricta clavando los omóplatos en el banco.",
      "Leg drive constante con las plantas de los pies bien pegadas al suelo.",
      "Descenso controlado llevando la barra a la línea media del esternón (ángulo de codos ~45-75°).",
      "Pausa sólida sin rebote en el pecho y extensión concéntrica potente."
    ],
    commonMistakes: [
      "Codos excesivamente abiertos a 90° generando estrés nocivo en el manguito rotador.",
      "Despegar los glúteos del banco para forzar repeticiones."
    ],
    tempo: "2-1-X-1"
  },

  "peso muerto convencional": {
    id: "deadlift_conv",
    name: "Peso Muerto Convencional",
    category: "Peso Muerto",
    targetMuscles: ["Isquiosurales", "Glúteo Mayor", "Dorsales", "Erectores Espinales", "Antebrazo"],
    videoUrl: "https://www.youtube.com/watch?v=FprOAIe498c",
    youtubeId: "FprOAIe498c",
    posterUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop",
    formCues: [
      "Barra pegada a la mitad del pie (1 pulgada de la espinilla) con agarre por fuera de las piernas.",
      "Bisagra de cadera hasta sujetar la barra sin moverla de su posición.",
      "Espalda neutra apretando los dorsales como si exprimieras naranjas en las axilas.",
      "Extensión simultánea de rodilla y cadera empujando el suelo con los talones."
    ],
    commonMistakes: [
      "Redondear la columna lumbar al despegar la barra del suelo.",
      "Alejar la barra del cuerpo aumentando la palanca sobre la espalda baja."
    ],
    tempo: "1-1-X-1"
  },

  "press militar": {
    id: "overhead_press",
    name: "Press Militar de Pie",
    category: "Militar",
    targetMuscles: ["Deltoides", "Tríceps", "Trapecio Superior", "Core y Glúteos"],
    videoUrl: "https://www.youtube.com/watch?v=wol7Hko8RhY",
    youtubeId: "wol7Hko8RhY",
    posterUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop",
    formCues: [
      "Agarre apenas por fuera de los hombros con muñecas rectas sobre los antebrazos.",
      "Glúteos y cuádriceps apretados al 100% creando una base de soporte rígida como una columna de concreto.",
      "Trayectoria vertical recta de la barra, esquivando la cabeza hacia atrás brevemente.",
      "Bloqueo firme con la barra centrada directamente sobre la coronilla y escápulas encogidas arriba."
    ],
    commonMistakes: [
      "Hiperextensión lumbar excesiva inclinando el torso hacia atrás.",
      "Flexionar las rodillas para rebotar en un movimiento estricto."
    ],
    tempo: "2-0-X-1"
  },

  "dominadas lastradas": {
    id: "pullups_weighted",
    name: "Dominadas con Lastre / Estrictas",
    category: "Tracción",
    targetMuscles: ["Dorsal Ancho", "Bíceps Braquial", "Braquiorradial", "Redondo Mayor"],
    videoUrl: "https://www.youtube.com/watch?v=JQuhpouR-DQ",
    youtubeId: "JQuhpouR-DQ",
    posterUrl: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=800&auto=format&fit=crop",
    formCues: [
      "Comenzar desde suspensión muerta con codos bloqueados y escápulas activas.",
      "Traccionar llevando el pecho hacia la barra en lugar de simplemente pasar la barbilla.",
      "Codos apuntando hacia los bolsillos laterales en un tirón continuo sin balanceo (kipping).",
      "Descenso controlado resistiendo la gravedad en todo el rango articular."
    ],
    commonMistakes: [
      "Usar impulso con patadas de piernas perdiendo la tensión pura del dorsal.",
      "Rango de movimiento incompleto sin descender hasta la elongación completa."
    ],
    tempo: "2-0-X-1"
  },

  "fondos en paralelas": {
    id: "dips_weighted",
    name: "Fondos en Paralelas",
    category: "Calistenia",
    targetMuscles: ["Tríceps", "Pectoral Menor y Mayor", "Deltoides Anterior"],
    videoUrl: "https://www.youtube.com/watch?v=2z8JmcrW-As",
    youtubeId: "2z8JmcrW-As",
    posterUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=800&auto=format&fit=crop",
    formCues: [
      "Bloqueo inicial con escápulas deprimidas y hombros alejados de las orejas.",
      "Ligera inclinación del torso hacia adelante para cargar el pectoral o erguido para tríceps.",
      "Descender hasta que el hombro alcance al menos la profundidad del codo (90° o más según movilidad).",
      "Empuje concéntrico limpio con bloqueo estable."
    ],
    commonMistakes: [
      "Hombros encogidos hacia arriba sometiendo a compresión la cápsula anterior.",
      "Rebote elástico brusco en la parte inferior."
    ],
    tempo: "3-1-X-1"
  },

  "remo pendlay": {
    id: "pendlay_row",
    name: "Remo Pendlay con Barra",
    category: "Tracción",
    targetMuscles: ["Dorsales", "Romboides", "Trapecio Medio e Inferior", "Erectores"],
    videoUrl: "https://www.youtube.com/watch?v=RQU8wZPbioA",
    youtubeId: "RQU8wZPbioA",
    posterUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop",
    formCues: [
      "Torso 100% paralelo al suelo con la barra apoyada en el suelo en cada repetición.",
      "Espalda recta e inmóvil, sin utilizar impulso de cadera o piernas para despegar.",
      "Tracción explosiva llevando la barra al ombligo/esternón inferior con codos hacia atrás.",
      "Retorno controlado dejando reposar el peso en el piso para reiniciar la inercia (dead-stop)."
    ],
    commonMistakes: [
      "Elevar el torso a 45° convirtiéndolo en un remo de trampa.",
      "Rebotar los discos contra el suelo."
    ],
    tempo: "1-1-X-1"
  },

  "peso muerto rumano": {
    id: "rdl_barbell",
    name: "Peso Muerto Rumano (RDL)",
    category: "Peso Muerto",
    targetMuscles: ["Cadena Posterior", "Isquiosurales", "Glúteo Mayor", "Core"],
    videoUrl: "https://www.youtube.com/watch?v=cTcUyyq7um8",
    youtubeId: "cTcUyyq7um8",
    posterUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop",
    formCues: [
      "Comenzar de pie con la barra en las manos y rodillas con un desbloqueo muy ligero (15°).",
      "Empujar la cadera hacia atrás hacia la pared detrás de ti (hip hinge puro).",
      "Mantener la barra rozando las piernas para mantener el centro de gravedad cercano.",
      "Descender hasta sentir la tensión elástica máxima en los isquios y contraer glúteos al subir."
    ],
    commonMistakes: [
      "Flexionar las rodillas como si fuera una sentadilla.",
      "Doblar la espalda baja intentando tocar el suelo en lugar de respetar la flexibilidad de los isquios."
    ],
    tempo: "3-1-1-1"
  },

  "paseo del granjero pesado": {
    id: "farmers_walk",
    name: "Paseo del Granjero Pesado",
    category: "Accesorios",
    targetMuscles: ["Fuerza de Agarre", "Trapecios", "Core Antilateral", "Antebrazos"],
    videoUrl: "https://www.youtube.com/watch?v=wtHHiJecbQg",
    youtubeId: "wtHHiJecbQg",
    posterUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop",
    formCues: [
      "Despegue seguro de la carga (mancuernas, trap bar o maletas) con espalda recta.",
      "Pecho inflado, hombros en posición neutra y mirada al frente.",
      "Pasos cortos, rápidos y calculados evitando oscilaciones laterales de cadera.",
      "Tensión máxima de la pared abdominal durante todo el recorrido prescrito."
    ],
    commonMistakes: [
      "Dejar que los hombros se desprendan hacia adelante (postura de cifosis).",
      "Dar zancadas demasiado largas perdiendo la estabilidad."
    ],
    tempo: "Continuo"
  },

  "planchas isométricas pesadas": {
    id: "plank_weighted",
    name: "Planchas Isométricas Pesadas",
    category: "Accesorios",
    targetMuscles: ["Recto Abdominal", "Transverso del Abdomen", "Glúteos", "Serrato"],
    videoUrl: "https://www.youtube.com/watch?v=M0u5sm9Xcv4",
    youtubeId: "M0u5sm9Xcv4",
    posterUrl: "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?q=80&w=800&auto=format&fit=crop",
    formCues: [
      "Apoyo de antebrazos al ancho de hombros con codos directamente debajo de ellos.",
      "Retroversión pélvica activa (apretar glúteos fuerte para aplanar la lordosis lumbar).",
      "Empujar activamente el suelo con los codos para protraer las escápulas.",
      "Mantener una línea recta indestructible desde los talones hasta la cabeza."
    ],
    commonMistakes: [
      "Dejar caer la cadera hacia el suelo tensionando la columna lumbar.",
      "Elevar los glúteos en forma de carpa para descansar la pared abdominal."
    ],
    tempo: "Isométrico"
  }
};

export function getExerciseMedia(rawName) {
  if (!rawName) return getFallbackMedia("Ejercicio de Fuerza");

  const clean = rawName.toLowerCase().trim();

  // 1. Direct match
  if (EXERCISE_MEDIA_CATALOG[clean]) {
    return EXERCISE_MEDIA_CATALOG[clean];
  }

  // 2. Fuzzy match
  for (const [key, media] of Object.entries(EXERCISE_MEDIA_CATALOG)) {
    if (clean.includes(key) || key.includes(clean)) {
      return media;
    }
  }

  if (clean.includes("sentadilla")) return EXERCISE_MEDIA_CATALOG["sentadilla trasera"];
  if (clean.includes("banca") || clean.includes("pecho")) return EXERCISE_MEDIA_CATALOG["press de banca"];
  if (clean.includes("muerto") && clean.includes("rumano")) return EXERCISE_MEDIA_CATALOG["peso muerto rumano"];
  if (clean.includes("muerto")) return EXERCISE_MEDIA_CATALOG["peso muerto convencional"];
  if (clean.includes("militar") || clean.includes("hombro") || clean.includes("overhead")) return EXERCISE_MEDIA_CATALOG["press militar"];
  if (clean.includes("dominada") || clean.includes("pullup")) return EXERCISE_MEDIA_CATALOG["dominadas lastradas"];
  if (clean.includes("fondo") || clean.includes("dip")) return EXERCISE_MEDIA_CATALOG["fondos en paralelas"];
  if (clean.includes("remo")) return EXERCISE_MEDIA_CATALOG["remo pendlay"];
  if (clean.includes("granjero") || clean.includes("farmer")) return EXERCISE_MEDIA_CATALOG["paseo del granjero pesado"];
  if (clean.includes("plancha") || clean.includes("core") || clean.includes("abs")) return EXERCISE_MEDIA_CATALOG["planchas isométricas pesadas"];

  return getFallbackMedia(rawName);
}

function getFallbackMedia(name) {
  return {
    id: "fallback_exercise",
    name,
    category: "Accesorios",
    targetMuscles: ["Músculos Primarios", "Estabilizadores del Core"],
    videoUrl: "https://www.youtube.com/watch?v=vmNPOjaGrVE",
    youtubeId: "vmNPOjaGrVE",
    posterUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop",
    formCues: [
      "Alineación postural estricta antes de aplicar tensión neuromuscular.",
      "Control excéntrico deliberado sin perder compactación articular.",
      "Cadencia concéntrica con máximo esfuerzo de intención explosiva.",
      "Respiración diafragmática coordinada con la fase del movimiento."
    ],
    commonMistakes: [
      "Sacrificar el rango de movimiento por cargar peso excesivo.",
      "Perder la estabilidad del core durante las repeticiones finales."
    ],
    tempo: "2-0-X-1"
  };
}
