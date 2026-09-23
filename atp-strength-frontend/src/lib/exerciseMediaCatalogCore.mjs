/**
 * Exercise Media Catalog & Biomechanical Cues (SSOT)
 * Inspired by Anatoly Fit's structured video demos & form guidance.
 */


export const EXERCISE_MEDIA_CATALOG = {
  "sentadilla trasera": {
    id: "squat_back",
    name: "Sentadilla Trasera",
    category: "Sentadilla",
    targetMuscles: ["Cuádriceps", "Glúteo Mayor", "Erector Espinal", "Core"],
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-working-out-with-weights-in-a-gym-44026-large.mp4",
    posterUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop",
    formCues: [
      "Apoyo trípode firme con los pies al ancho de hombros.",
      "Inspiración profunda y maniobra de Valsalva para compactar el core.",
      "Desciende controlando rodillas hacia afuera y cadera abajo.",
      "Empuje violento contra el piso con cadencia concéntrica explosiva."
    ],
    commonMistakes: [
      "Colapso de rodillas hacia adentro (valgo de rodilla).",
      "Perder la tensión en la espalda baja en el punto de máxima flexión."
    ],
    tempo: "3-0-X-1"
  },
  "press de banca": {
    id: "bench_press",
    name: "Press de Banca",
    category: "Banca",
    targetMuscles: ["Pectoral Mayor", "Tríceps Braquial", "Deltoides Anterior"],
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-athlete-working-out-with-barbell-on-a-bench-44018-large.mp4",
    posterUrl: "https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?q=80&w=800&auto=format&fit=crop",
    formCues: [
      "Retracción y depresión escapular completa antes de sacar la barra.",
      "Pies plantados ejerciendo leg drive continuo contra el suelo.",
      "Codos a unos 45-60 grados respecto al torso.",
      "Toca con control la zona esternal media y explota hacia arriba."
    ],
    commonMistakes: [
      "Despegar los glúteos del banco en el esfuerzo.",
      "Rebotar la barra en el esternón perdiendo control excéntrico."
    ],
    tempo: "2-1-X-1"
  },
  "peso muerto convencional": {
    id: "deadlift_conv",
    name: "Peso Muerto Convencional",
    category: "Peso Muerto",
    targetMuscles: ["Isquiosurales", "Glúteo Mayor", "Dorsales", "Trapecios", "Core"],
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-deadlifting-heavy-weights-in-a-gym-44024-large.mp4",
    posterUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop",
    formCues: [
      "Tibia a 2-3 cm de la barra, bisagra de cadera profunda.",
      "Dorsales en máxima tensión cerrando las axilas como exprimiendo limones.",
      "Empuje el piso con las piernas en lugar de tirar con los brazos.",
      "Bloqueo firme con glúteos sin hiperextender la zona lumbar."
    ],
    commonMistakes: [
      "Curvar la espalda lumbar al despegar el peso del suelo.",
      "Alejar la barra de las piernas durante el ascenso."
    ],
    tempo: "X-0-1-0"
  },
  "press militar": {
    id: "overhead_press",
    name: "Press Militar",
    category: "Militar",
    targetMuscles: ["Deltoides Anterior & Lateral", "Tríceps", "Trapecio Superior", "Core"],
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-lifting-a-barbell-in-a-gym-44022-large.mp4",
    posterUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop",
    formCues: [
      "Glúteos y abdomen en contracción de piedra antes de iniciar.",
      "Codos ligeramente por delante de la barra en la posición de salida.",
      "Mueve la cabeza ligeramente hacia atrás al iniciar y métete debajo al bloquear.",
      "Bloqueo firme en la cima encogiendo los trapecios activamente."
    ],
    commonMistakes: [
      "Arquear excesivamente la espalda baja para compensar falta de fuerza.",
      "Impulsarse con las piernas en una repetición estricta."
    ],
    tempo: "2-0-X-1"
  },
  "dominadas lastradas": {
    id: "pullups_weighted",
    name: "Dominadas Lastradas",
    category: "Tracción",
    targetMuscles: ["Dorsal Ancho", "Bíceps Braquial", "Redondo Mayor", "Romboides"],
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-doing-pull-ups-in-a-gym-44031-large.mp4",
    posterUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=800&auto=format&fit=crop",
    formCues: [
      "Agarre prono ligeramente más ancho que los hombros.",
      "Comienza desde suspensión completa deprimiendo escápulas activamente.",
      "Tracciona llevando los codos hacia los bolsillos traseros.",
      "Supera la barra con la barbilla con control total y pausa mínima."
    ],
    commonMistakes: [
      "Hacer kipping o balanceo pélvico en series de fuerza estricta.",
      "No descender hasta la extensión completa de brazos."
    ],
    tempo: "2-1-X-1"
  },
  "fondos en paralelas": {
    id: "dips_weighted",
    name: "Fondos en Paralelas",
    category: "Calistenia",
    targetMuscles: ["Pectoral Inferior", "Tríceps Braquial", "Deltoides Anterior"],
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-doing-dips-exercise-on-parallel-bars-44028-large.mp4",
    posterUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop",
    formCues: [
      "Agarre neutral firme, torso con ligera inclinación de 15 grados hacia adelante.",
      "Descenso controlado hasta que los hombros lleguen a la altura del codo (90°).",
      "Empuje concéntrico extendiendo codos sin bloquear agresivamente.",
      "Preserva hombros deprimidos sin encogerlos hacia el cuello."
    ],
    commonMistakes: [
      "Descender demasiado profundo generando pinzamiento acromial.",
      "Aletear los codos excesivamente hacia afuera."
    ],
    tempo: "3-0-X-1"
  },
  "remo pendlay": {
    id: "pendlay_row",
    name: "Remo Pendlay",
    category: "Tracción",
    targetMuscles: ["Espalda Media", "Dorsales", "Romboides", "Deltoides Posterior"],
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-working-out-with-weights-in-a-gym-44026-large.mp4",
    posterUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop",
    formCues: [
      "Torso estrictamente paralelo al piso durante todo el movimiento.",
      "Cada repetición inicia inerte desde el suelo (dead stop).",
      "Tracción violenta de la barra hacia la base del esternón.",
      "Pausa breve en contacto con el cuerpo y descenso controlado."
    ],
    commonMistakes: [
      "Incorporar el torso con impulso lumbar al levantar la barra.",
      "No apoyar la barra en el piso entre repeticiones."
    ],
    tempo: "X-0-1-0"
  },
  "peso muerto rumano": {
    id: "rdl",
    name: "Peso Muerto Rumano",
    category: "Peso Muerto",
    targetMuscles: ["Isquiosurales", "Glúteo Mayor", "Erectores Espinales"],
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-deadlifting-heavy-weights-in-a-gym-44024-large.mp4",
    posterUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop",
    formCues: [
      "Rodillas con microflexión fija de 15 grados sin cambiar el ángulo.",
      "Empuje de la cadera hacia la pared trasera sintiendo el estiramiento en isquios.",
      "Barra en contacto permanente rozando los muslos y tibias.",
      "Contracción explosiva de glúteos al regresar a la vertical."
    ],
    commonMistakes: [
      "Doblar las rodillas como en una sentadilla.",
      "Redondear la espalda al buscar tocar el piso innecesariamente."
    ],
    tempo: "3-1-X-0"
  },
  "paseo del granjero pesado": {
    id: "farmers_walk",
    name: "Paseo del Granjero Pesado",
    category: "Accesorios",
    targetMuscles: ["Antebrazos (Agarre)", "Trapecios", "Core Lateral (Oblicuos)", "Glúteos"],
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-lifting-a-barbell-in-a-gym-44022-large.mp4",
    posterUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop",
    formCues: [
      "Agarre en pinza trituradora ('crushing grip') en el centro de las mancuernas o barras.",
      "Torso erecto, pecho abierto y mirada al horizonte.",
      "Pasos cortos, controlados y rápidos sin bamboleo lateral.",
      "Respiración rítmica manteniendo la rigidez abdominal intacta."
    ],
    commonMistakes: [
      "Inclinarse hacia un lado o dejar caer los hombros hacia adelante.",
      "Dar zancadas excesivamente largas perdiendo estabilidad."
    ],
    tempo: "Constante"
  },
  "planchas isométricas pesadas": {
    id: "plank_weighted",
    name: "Planchas Isométricas Pesadas",
    category: "Accesorios",
    targetMuscles: ["Recto Abdominal", "Transverso del Abdomen", "Serratos", "Glúteos"],
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-working-out-with-weights-in-a-gym-44026-large.mp4",
    posterUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop",
    formCues: [
      "Codos debajo de los hombros, antebrazos paralelos.",
      "Retroversión pélvica activa (hueso púbico hacia el ombligo).",
      "Glúteos y cuádriceps en máxima co-contracción isométrica.",
      "Presión activa de los codos hacia las rodillas como si quisieras unirlos."
    ],
    commonMistakes: [
      "Dejar colgar la cadera arqueando la columna lumbar.",
      "Elevar los glúteos en pirámide para reducir la tensión abdominal."
    ],
    tempo: "Isométrico"
  }
};

/**
 * Normalizes an exercise name and retrieves its media profile.
 */
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
  if (clean.includes("banca") || clean.includes("bench")) return EXERCISE_MEDIA_CATALOG["press de banca"];
  if (clean.includes("muerto") || clean.includes("deadlift")) return EXERCISE_MEDIA_CATALOG["peso muerto convencional"];
  if (clean.includes("militar") || clean.includes("overhead")) return EXERCISE_MEDIA_CATALOG["press militar"];
  if (clean.includes("dominada") || clean.includes("pullup")) return EXERCISE_MEDIA_CATALOG["dominadas lastradas"];
  if (clean.includes("fondo") || clean.includes("dip")) return EXERCISE_MEDIA_CATALOG["fondos en paralelas"];
  if (clean.includes("remo") || clean.includes("row")) return EXERCISE_MEDIA_CATALOG["remo pendlay"];
  if (clean.includes("granjero") || clean.includes("farmer")) return EXERCISE_MEDIA_CATALOG["paseo del granjero pesado"];
  if (clean.includes("plancha") || clean.includes("plank")) return EXERCISE_MEDIA_CATALOG["planchas isométricas pesadas"];

  return getFallbackMedia(rawName);
}

function getFallbackMedia(name) {
  return {
    id: "fallback_exercise",
    name,
    category: "Accesorios",
    targetMuscles: ["Músculos Primarios", "Estabilizadores del Core"],
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-athlete-working-out-with-barbell-on-a-bench-44018-large.mp4",
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
