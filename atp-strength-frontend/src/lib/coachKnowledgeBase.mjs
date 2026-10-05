/**
 * Coach de fuerza (SPEC-0011).
 * Responde en español sobre técnica, músculos, programación, equipo y descanso.
 * Las demos se enlazan a YouTube y roguefitness.com: no se descargan ni se copian.
 * Criterio público: Be Best Beast (YouTube e Instagram) y Rogue Fitness.
 */

import { EXERCISE_MEDIA_CATALOG, getExerciseMedia } from "./exerciseMediaCatalogCore.mjs";
import { getOptimalRecoveryHours } from "./recoveryLockoutCore.mjs";

export const COACH_TOPICS = Object.freeze([
  "RECOVERY_LOCKOUT",
  "REST_INTER_SESSION",
  "REST_INTRA_SET",
  "TECHNIQUE",
  "MUSCLES",
  "EQUIPMENT",
  "MISTAKES",
  "TEMPO",
  "SUBSTITUTION",
  "PROGRAMMING",
  "PHASE_GUIDANCE",
  "WARMUP",
  "BREATHING",
  "EXPLAIN",
  "PAIN_SAFETY",
  "GENERAL_COACHING",
]);

const SOURCE_LINKS = Object.freeze([
  { label: "Be Best Beast en YouTube", url: "https://www.youtube.com/@BeBestBeast" },
  { label: "Be Best Beast en Instagram", url: "https://www.instagram.com/bebestbeast/?hl=es" },
  { label: "Rogue Fitness en YouTube", url: "https://www.youtube.com/@roguefitness" },
  { label: "Biblioteca de movimientos Rogue", url: "https://www.roguefitness.com/theindex/movement-library" },
]);

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

/**
 * Clips verificados por oEmbed como videos del canal Rogue Fitness.
 * match "related" se muestra con una aclaración: no se presenta otro ejercicio como si fuera el pedido.
 */
const ROGUE_DEMOS = Object.freeze({
  squat_back: demo("exact", "x0tjZRfF3Wg", "Movement Demo - The Squat", "Demo oficial de Rogue Fitness de la sentadilla."),
  bench_press: demo(
    "exact",
    "wzq57DB5Ppg",
    "Movement Demo - The Bench Press",
    "Demo oficial de Rogue Fitness del press de banca.",
    "https://www.roguefitness.com/theindex/video/movement-demo-the-bench-press",
  ),
  deadlift_conv: demo(
    "exact",
    "1nvAUJVmFZY",
    "Movement Demo - The Conventional Deadlift",
    "Demo oficial de Rogue Fitness del peso muerto convencional.",
    "https://www.roguefitness.com/theindex/movement/movement-demo-the-conventional-deadlift",
  ),
  pullups_weighted: demo(
    "related",
    "7jyKGpHW9XQ",
    "Movement Demo - Chest To Bar Pull Up",
    "Demo oficial de Rogue de la dominada al pecho. Sumá lastre recién cuando el peso corporal sube sin balanceo.",
  ),
  dips_weighted: demo(
    "exact",
    "UZ_kEpmACZ4",
    "Movement Demo - Weighted Dips",
    "Demo oficial de Rogue Fitness de los fondos con lastre.",
    "https://www.roguefitness.com/theindex/movement-library/movement-demo-weighted-dips",
  ),
  pendlay_row: demo(
    "related",
    "pyBHPoC8Nzo",
    "Movement Demo - The Bent Over Row",
    "Demo oficial de Rogue del remo con barra. En el Pendlay, cada repetición sale del suelo con el torso paralelo.",
  ),
  romanian_deadlift: demo(
    "exact",
    "GZAKFRNtxLY",
    "Movement Demo - The Romanian Deadlift",
    "Demo oficial de Rogue Fitness del peso muerto rumano.",
  ),
  pause_squat: demo(
    "related",
    "x0tjZRfF3Wg",
    "Movement Demo - The Squat",
    "Demo oficial de la sentadilla. En la variante con pausa, frená uno o dos segundos abajo sin aflojar el bracing.",
  ),
  power_clean: demo("exact", "KjGvwQl8tis", "Movement Demo - The Power Clean", "Demo oficial de Rogue Fitness de la cargada de potencia."),
  hang_power_clean: demo("exact", "22XonEeuRjk", "Movement Demo - Hang Power Clean", "Demo oficial de Rogue Fitness de la cargada colgada."),
  power_snatch: demo("exact", "rhF0cbRjxRo", "Movement Demo - The Power Snatch", "Demo oficial de Rogue Fitness de la arrancada de potencia."),
  hang_power_snatch: demo("exact", "YlDzqi9imjc", "Movement Demo - Hang Power Snatch", "Demo oficial de Rogue Fitness de la arrancada colgada."),
  push_press: demo("exact", "i0mElJo73EE", "Movement Demo - The Racked Push Press", "Demo oficial de Rogue Fitness del push press."),
  power_jerk: demo("exact", "KY2q95iRfO4", "Movement Demo - The Racked Push Jerk", "Demo oficial de Rogue Fitness del envión de potencia."),
  clean_high_pull: demo("exact", "qC3T3LF-ed0", "Movement Demo - Clean Pull", "Demo oficial de Rogue Fitness del tirón de cargada."),
  snatch_high_pull: demo("exact", "ZtjSf7Y0-w4", "Movement Demo - Snatch Pull", "Demo oficial de Rogue Fitness del tirón de arrancada."),
  barbell_jump_squat: demo("exact", "6_8E9e3Dgcc", "Movement Demo - Jump Squat", "Demo oficial de Rogue Fitness de la sentadilla con salto."),
  trap_bar_jump: demo("exact", "YhiSmpoQujA", "Movement Demo - Trap Bar Power Jumps", "Demo oficial de Rogue Fitness del salto con trap bar."),
  deficit_deadlift: demo("exact", "CpWsUsqBtN8", "Movement Demo - The Deficit Deadlift", "Demo oficial de Rogue Fitness del peso muerto con déficit."),
  overhead_press: demo(
    "related",
    "i0mElJo73EE",
    "Movement Demo - The Racked Push Press",
    "Rogue no publica en este catálogo un clip de press militar estricto. Este es el push press oficial: la barra va sobre la cabeza, pero en el militar las piernas no empujan.",
  ),
  snatch_grip_deadlift: demo(
    "related",
    "1nvAUJVmFZY",
    "Movement Demo - The Conventional Deadlift",
    "El agarre de arrancada comparte el despegue del peso muerto convencional. La diferencia es el agarre ancho, cerca de los discos.",
    "https://www.roguefitness.com/theindex/movement/movement-demo-the-conventional-deadlift",
  ),
  toes_to_bar: demo(
    "related",
    "HO_0C8Qd728",
    "Movement Demo - Toes To Rings",
    "Demo oficial de Rogue de toes-to-rings, la variante en anillas de llevar los pies hacia las manos.",
  ),
});

const EXERCISE_ALIASES = [
  { id: "snatch_grip_deadlift", phrases: ["peso muerto agarre arrancada", "snatch grip deadlift", "snatch grip", "agarre de arrancada", "agarre arrancada"] },
  { id: "deficit_deadlift", phrases: ["peso muerto con deficit", "deficit deadlift", "deadlift con deficit"] },
  { id: "romanian_deadlift", phrases: ["peso muerto rumano", "romanian deadlift", "rdl"] },
  { id: "deadlift_conv", phrases: ["peso muerto convencional", "peso muerto", "conventional deadlift", "deadlift"] },
  { id: "pause_squat", phrases: ["sentadilla con pausa", "sentadilla tecnica", "pause squat", "box squat"] },
  { id: "barbell_jump_squat", phrases: ["sentadilla con salto", "jump squat"] },
  { id: "squat_back", phrases: ["sentadilla trasera", "sentadilla", "back squat", "squat"] },
  { id: "bench_press", phrases: ["press de banca", "banca plana", "bench press", "banca", "bench"] },
  { id: "overhead_press", phrases: ["press militar", "militar estricto", "overhead press", "strict press", "ohp", "press estricto"] },
  { id: "push_press", phrases: ["push press", "press de empuje"] },
  { id: "power_jerk", phrases: ["power jerk", "envion de potencia", "envion", "jerk"] },
  { id: "hang_power_clean", phrases: ["hang power clean", "cargada colgada"] },
  { id: "power_clean", phrases: ["power clean", "cargada de potencia", "cargada"] },
  { id: "hang_power_snatch", phrases: ["hang power snatch", "arrancada colgada"] },
  { id: "power_snatch", phrases: ["power snatch", "arrancada de potencia", "arrancada"] },
  { id: "clean_high_pull", phrases: ["clean high pull", "clean pull", "tiron de cargada", "tiron alto de cargada"] },
  { id: "snatch_high_pull", phrases: ["snatch high pull", "snatch pull", "tiron de arrancada", "tiron alto de arrancada"] },
  { id: "trap_bar_jump", phrases: ["salto con trap bar", "trap bar jump", "trap bar", "barra hexagonal"] },
  { id: "pullups_weighted", phrases: ["dominadas lastradas", "dominadas", "dominada", "pull-up", "pull up", "pullup", "chin-up"] },
  { id: "dips_weighted", phrases: ["fondos en paralelas", "fondos", "dips", "paralelas"] },
  { id: "pendlay_row", phrases: ["remo pendlay", "pendlay", "remo con barra", "remo", "bent over row"] },
  { id: "farmers_walk", phrases: ["paseo del granjero", "granjero", "farmer carry", "farmers walk", "farmer"] },
  { id: "heavy_plank", phrases: ["plancha isometrica", "plancha", "plank"] },
  { id: "ez_bar_curl", phrases: ["curl de biceps", "curl biceps", "barra z", "curl"] },
  { id: "toes_to_bar", phrases: ["toes to bar", "pies a la barra", "elevaciones de piernas", "piernas a la barra"] },
];

const ALIAS_INDEX = EXERCISE_ALIASES
  .flatMap((entry) => entry.phrases.map((phrase) => ({ id: entry.id, phrase: fold(phrase) })))
  .sort((a, b) => b.phrase.length - a.phrase.length);

const ALTERNATIVES = Object.freeze({
  squat_back: ["pause_squat", "barbell_jump_squat"],
  pause_squat: ["squat_back", "barbell_jump_squat"],
  bench_press: ["dips_weighted", "push_press"],
  deadlift_conv: ["romanian_deadlift", "deficit_deadlift"],
  romanian_deadlift: ["deadlift_conv", "deficit_deadlift"],
  deficit_deadlift: ["deadlift_conv", "romanian_deadlift"],
  snatch_grip_deadlift: ["deadlift_conv", "romanian_deadlift"],
  overhead_press: ["push_press", "power_jerk"],
  push_press: ["overhead_press", "power_jerk"],
  power_jerk: ["push_press", "overhead_press"],
  pullups_weighted: ["pendlay_row", "toes_to_bar"],
  dips_weighted: ["bench_press", "overhead_press"],
  pendlay_row: ["pullups_weighted", "deadlift_conv"],
  farmers_walk: ["trap_bar_jump", "deadlift_conv"],
  heavy_plank: ["toes_to_bar", "farmers_walk"],
  ez_bar_curl: ["pendlay_row", "pullups_weighted"],
  toes_to_bar: ["heavy_plank", "pullups_weighted"],
  power_clean: ["hang_power_clean", "clean_high_pull"],
  hang_power_clean: ["power_clean", "clean_high_pull"],
  power_snatch: ["hang_power_snatch", "snatch_high_pull"],
  hang_power_snatch: ["power_snatch", "snatch_high_pull"],
  clean_high_pull: ["power_clean", "deadlift_conv"],
  snatch_high_pull: ["power_snatch", "snatch_grip_deadlift"],
  barbell_jump_squat: ["squat_back", "trap_bar_jump"],
  trap_bar_jump: ["barbell_jump_squat", "deadlift_conv"],
});

const GENERIC_NAMES = new Set([
  "este ejercicio",
  "el ejercicio",
  "esto",
  "esta serie",
  "ese ejercicio",
  "aqui",
  "aca",
  "eso",
]);

function demo(match, youtubeId, title, caption, pageUrl) {
  return Object.freeze({
    match,
    youtubeId,
    title,
    caption,
    pageUrl: pageUrl ?? null,
  });
}

function fold(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function includesPhrase(haystack, phrase) {
  if (phrase.length <= 3) {
    return new RegExp(`(?:^|[^a-z0-9])${phrase}(?:[^a-z0-9]|$)`).test(haystack);
  }
  return haystack.includes(phrase);
}

function joinEs(items) {
  const list = items.filter(Boolean);
  if (list.length === 0) return "los músculos del patrón";
  if (list.length === 1) return list[0];
  return `${list.slice(0, -1).join(", ")} y ${list[list.length - 1]}`;
}

function mediaById(id) {
  for (const media of Object.values(EXERCISE_MEDIA_CATALOG)) {
    if (media.id === id) return media;
  }
  return null;
}

function matchAliases(foldedQuery) {
  const hits = ALIAS_INDEX.filter((alias) => includesPhrase(foldedQuery, alias.phrase));
  const kept = hits.filter((hit) => !hits.some((other) => (
    other.phrase.length > hit.phrase.length && other.phrase.includes(hit.phrase)
  )));
  const ids = [];
  for (const hit of kept) {
    if (!ids.includes(hit.id)) ids.push(hit.id);
  }
  return ids;
}

function readContext(context = {}) {
  const weight = Number(context.currentWeight);
  const rpe = Number(context.currentRpe);
  const hours = Number(context.remainingHours);
  const minutes = Number(context.remainingMinutes);
  const exercise = typeof context.currentExercise === "string" ? context.currentExercise.trim() : "";
  return {
    currentExercise: exercise || "Sentadilla Trasera",
    currentWeight: Number.isFinite(weight) ? weight : 100,
    currentReps: context.currentReps == null || context.currentReps === "" ? "5" : String(context.currentReps),
    currentRpe: Number.isFinite(rpe) ? rpe : 8,
    isLocked: Boolean(context.isLocked),
    remainingHours: Number.isFinite(hours) ? hours : 48,
    remainingMinutes: Number.isFinite(minutes) ? minutes : 0,
  };
}

function currentMedia(context) {
  const media = getExerciseMedia(context.currentExercise);
  if (media.id === "fallback_exercise") {
    return {
      ...media,
      name: context.currentExercise,
    };
  }
  return media;
}

function buildDemo(media) {
  if (!media || media.id === "fallback_exercise") return null;
  const entry = ROGUE_DEMOS[media.id];
  if (!entry || entry.match !== "exact" || !YOUTUBE_ID.test(entry.youtubeId)) return null;
  return {
    exerciseName: media.name,
    youtubeId: entry.youtubeId,
    videoUrl: `https://www.youtube.com/watch?v=${entry.youtubeId}`,
    title: entry.title,
    caption: entry.caption,
    pageUrl: entry.pageUrl,
    match: entry.match,
    channelUrl: "https://www.youtube.com/@roguefitness",
  };
}

function withSources(extra = []) {
  const merged = [...extra, ...SOURCE_LINKS];
  const seen = new Set();
  return merged.filter((source) => {
    if (!source?.url || seen.has(source.url)) return false;
    seen.add(source.url);
    return true;
  });
}

function reply(topic, text, followUps, media, { includeDemo = false, extraSources = [] } = {}) {
  const demoClip = includeDemo ? buildDemo(media) : null;
  const sources = withSources(extraSources);
  if (demoClip?.pageUrl) {
    sources.unshift({
      label: `Ficha Rogue · ${demoClip.title}`,
      url: demoClip.pageUrl,
    });
  }
  if (demoClip?.videoUrl) {
    sources.unshift({
      label: `YouTube Rogue · ${demoClip.title}`,
      url: demoClip.videoUrl,
    });
  }
  return {
    topic,
    text,
    followUps,
    sources: withSources(sources),
    demo: demoClip,
    exerciseId: media?.id && media.id !== "fallback_exercise" ? media.id : null,
    exerciseName: media?.name ?? null,
  };
}

function explainTempo(tempo) {
  const parts = String(tempo || "").split("-");
  if (parts.length < 3) return "bajá con control y subí con intención";
  const [eccentric, pause, concentric, top] = parts;
  const up = concentric === "X" ? "subí tan rápido como puedas sin perder la postura" : `subí en ${concentric} segundos`;
  const topText = top ? ` y sostené ${top} segundo arriba` : "";
  return `${eccentric} segundos al bajar, ${pause} de pausa, ${up}${topText}`;
}

function getIntraRestAnswer(rpe = 8) {
  if (Number(rpe) >= 8.5) {
    return "Para esfuerzos máximos (RPE 8.5 a 10), tus reservas intramusculares de ATP y fosfocreatina (PCr) requieren entre 3 y 5 minutos para regenerarse al 98% a nivel neural. No apures la serie: la fatiga acumulada reduce la velocidad de la barra y el reclutamiento de unidades motoras de alto umbral.";
  }
  return "En series de aproximación y potencia submáxima (RPE 6 a 8), descansá entre 90 y 120 segundos. Esto mantiene el calor articular y la activación neuromuscular sin perder el ritmo metabólico.";
}

function getInterSessionAnswer(exerciseName = "este ejercicio") {
  const hours = getOptimalRecoveryHours(exerciseName);
  if (hours === 72) {
    return `Para ${exerciseName}, el descanso óptimo entre sesiones es de 72 horas. Al ser un ejercicio con carga axial y alta demanda del sistema nervioso central, las miofibrillas tipo IIx y los estabilizadores vertebrales necesitan 3 días completos para alcanzar la cresta de la supercompensación.`;
  }
  if (hours === 36) {
    return `Para ${exerciseName}, el descanso óptimo entre sesiones pesadas es de 36 horas. Al ser un accesorio, el músculo resintetiza antes que en una sentadilla o un peso muerto, pero igual necesitás dormir y comer para que la serie siguiente salga mejor.`;
  }
  return `Para ${exerciseName}, el descanso óptimo entre sesiones es de 48 horas. Ese tiempo garantiza la resíntesis completa de glucógeno y la síntesis proteica miofibrilar antes de volver a aplicar sobrecarga progresiva.`;
}

function getLockoutExplanation(exerciseName, remainingHours, remainingMinutes) {
  const timeStr = remainingMinutes > 0
    ? `${remainingHours} horas y ${remainingMinutes} minutos`
    : `${remainingHours} horas`;
  return `El ejercicio ${exerciseName} está protegido por el protocolo biológico de recuperación. El crecimiento muscular y la consolidación de fuerza ocurren durante el descanso, no en el gimnasio. Si entrenás con micro-desgarros activos y fatiga central acumulada, entrás en sobreentrenamiento y aumentás el riesgo de tendinopatías. Respetá las ${timeStr} restantes para volver más fuerte.`;
}

function rirFromRpe(rpe) {
  const parsed = Number(rpe);
  if (!Number.isFinite(parsed)) return 2;
  const rir = Math.round((10 - parsed) * 10) / 10;
  return Math.min(6, Math.max(0, rir));
}

function getPhaseGuidance(params) {
  const { exerciseName = "el ejercicio", weight = 0, reps = "5", rpe = 8 } = params;
  const rir = rirFromRpe(rpe);
  return `En esta serie de ${exerciseName}: Cargá ${weight > 0 ? `${weight} kilos` : "tu peso programado"} para ${reps} repeticiones a RPE ${rpe}. RPE ${rpe} significa que al terminar la última repetición debés sentir que te quedaban exactamente ${rir} repeticiones en el tanque (RIR ${rir}). Si la barra sube lenta o con temblor, bajá un 5% para proteger el SNC.`;
}

function techniqueBody(media) {
  switch (media.id) {
    case "squat_back":
    case "pause_squat":
      return "Puntos clave en Sentadilla: 1) Barra apoyada firme en trapecios con codos alineados al torso. 2) Respiración diafragmática (Maniobra de Valsalva): inflá el abdomen y cerrá el core antes de descender. 3) Abrí rodillas hacia afuera en la misma línea de la punta de tus pies. 4) Rompé el paralelo manteniendo el talón clavado y empujá el piso con el mediopié.";
    case "bench_press":
      return "Puntos clave en Press de Banca: 1) Retracción y depresión escapular: clavá los omóplatos en el banco. 2) Leg drive activo: apoyá los pies firmes y empujá hacia atrás para tensar cuádriceps y glúteos. 3) Trayectoria en 'J' inversa: la barra baja al esternón bajo y sube vertical hacia la línea de los ojos. 4) Codos a 45-60 grados respecto al torso, nunca abiertos a 90°.";
    case "deadlift_conv":
    case "deficit_deadlift":
    case "snatch_grip_deadlift":
      return "Puntos clave en Peso Muerto: 1) Barra pegada a las tibias sobre el mediopié. 2) Dorsales activados: 'quebrá la barra' para trabar los hombros. 3) Cuña inicial: bajá caderas hasta sentir tensión en isquiotibiales sin encorvar la zona lumbar. 4) Empuje simultáneo de piso y extensión de cadera: no tirés con los brazos, empujá el suelo.";
    case "overhead_press":
      return "Puntos clave en Press Militar: 1) Glúteos y abdomen como roca: cero hiperextensión lumbar. 2) Antebrazos perpendiculares al suelo debajo de la barra. 3) Sin impulso de piernas: si las rodillas se flexionan, ya es un push press. 4) Retraé la cabeza al inicio para que pase la barra y meté la cabeza al bloquear arriba.";
    case "push_press":
      return "Puntos clave en Push Press: 1) La barra sale del frente de los hombros con un dip corto y vertical de piernas. 2) El impulso termina antes de que los brazos empujen. 3) Bloqueá arriba con la barra sobre la coronilla, glúteos apretados y costillas abajo. 4) No lo conviertas en un envión: los pies no se despegan.";
    default: {
      const steps = (media.formCues || []).map((cue, index) => `${index + 1}) ${cue}`).join(" ");
      return steps
        ? `Puntos clave en ${media.name}: ${steps}`
        : `Para ${media.name}: base firme, aire en el diafragma, bajada de 2 a 3 segundos y subida con intención.`;
    }
  }
}

function variantNote(media) {
  switch (media.id) {
    case "pause_squat":
      return "En la sentadilla con pausa, el patrón es el mismo y además frenás abajo sin rebotar.";
    case "deficit_deadlift":
      return "En el déficit, el despegue es más largo: usá un realce bajo, de 2 a 5 cm, y no arquees la lumbar para alcanzar la barra.";
    case "snatch_grip_deadlift":
      return "En el agarre de arrancada, las manos van anchas. La cadera baja un poco más y la espalda alta trabaja el doble. Correas si el agarre se rinde antes que la cadena posterior.";
    case "overhead_press":
      return "El press militar estricto no usa dip de piernas.";
    default:
      return "";
  }
}

function equipmentText(media) {
  switch (media.id) {
    case "squat_back":
    case "pause_squat":
    case "barbell_jump_squat":
      return `Para ${media.name} necesitás una barra olímpica, discos y una jaula con seguros a la altura del pecho o apenas debajo. El calzado tiene que dejar el talón estable. El cinturón, si lo usás, va sobre el abdomen en las series pesadas y no reemplaza el bracing.`;
    case "bench_press":
      return "Para el press de banca necesitás un banco plano que no se mueva, una barra, discos y seguros en el rack. Si vas cerca del fallo, que haya un compañero o que los seguros estén puestos. Las muñequeras ayudan a mantener la muñeca neutra; no corrigen un agarre flojo.";
    case "deadlift_conv":
    case "romanian_deadlift":
    case "deficit_deadlift":
    case "snatch_grip_deadlift":
      return `Para ${media.name} alcanza una barra y discos, idealmente bumpers si vas a apoyar la barra. El piso tiene que tolerar la bajada. Las correas sirven cuando querés que la espalda trabaje y el agarre ya no da; si el objetivo es el agarre, no las uses.`;
    case "overhead_press":
    case "push_press":
    case "power_jerk":
      return `Para ${media.name} usá una barra que puedas bloquear sobre la cabeza sin pegarle al techo ni al rack. Jaula con seguros si vas pesado. Un cinturón puede ayudar en la serie pesada; las piernas y el abdomen siguen siendo la base.`;
    case "pullups_weighted":
      return "Para dominadas necesitás una barra fija que no gire. El lastre va en un cinturón, no entre los pies si eso te hace balancear. Bandas solo para aprender el rango, no para maquillar media repetición.";
    case "dips_weighted":
      return "Para fondos necesitás paralelas estables, un poco más anchas que los hombros. El lastre cuelga de un cinturón. Si los hombros protestan en el fondo, subí el rango antes de agregar kilos.";
    case "pendlay_row":
      return "Para el remo Pendlay necesitás una barra y discos que te dejen apoyar cada repetición en el piso, o tacos si el disco es chico. El torso queda paralelo. No hace falta banco.";
    case "farmers_walk":
      return "Para el paseo del granjero usá farmer handles, dos maletas pesadas o una trap bar si no hay handles. El piso tiene que estar despejado. No lo reemplaces por una zancada con mancuernas si querés entrenar el acarreo.";
    case "heavy_plank":
      return "Para la plancha pesada alcanza el piso y, si ya es fácil, un disco apoyado arriba de la espalda, no sobre la lumbar suelta. No hace falta barra.";
    case "ez_bar_curl":
      return "Para el curl usá una barra Z o una barra recta si no hay Z. Los codos quietos al costado del torso valen más que el disco extra. Un banco predicador es opcional, no obligatorio.";
    case "toes_to_bar":
      return "Para llevar los pies a la barra necesitás una barra de dominadas con espacio adelante y atrás. Las anillas sirven para la variante toes-to-rings que muestra Rogue.";
    case "trap_bar_jump":
      return "Para el salto con trap bar necesitás una barra hexagonal y discos que te dejen aterrizar quieto. El techo tiene que estar libre.";
    case "power_clean":
    case "hang_power_clean":
    case "power_snatch":
    case "hang_power_snatch":
    case "clean_high_pull":
    case "snatch_high_pull":
      return `Para ${media.name} conviene una barra con giro (la de halterofilia gira mejor que una barra de potencia) y bumpers. El espacio alrededor tiene que estar vacío: si soltás la barra, cae.`;
    default:
      return `Para ${media.name} usá un implemento que te deje completar el rango sin que el equipo te obligue a compensar. Barra, discos y topes si hay carga axial. Si no estás seguro del set-up, mirá la biblioteca de movimientos de Rogue antes de cargar.`;
  }
}

function schemeFor(media) {
  switch (media.id) {
    case "barbell_jump_squat":
    case "trap_bar_jump":
      return "3 a 5 series de 3 a 5 saltos, lejos del fallo, con descanso completo. Si el salto se achica, se terminó la serie.";
    case "power_clean":
    case "hang_power_clean":
    case "power_snatch":
    case "hang_power_snatch":
    case "clean_high_pull":
    case "snatch_high_pull":
    case "power_jerk":
      return "6 a 8 series de 1 a 3 repeticiones rápidas, RPE 6 a 8, con descanso completo. En los olímpicos la técnica manda sobre el peso.";
    case "ez_bar_curl":
    case "heavy_plank":
    case "toes_to_bar":
    case "farmers_walk":
      return "3 a 4 series de 8 a 15 repeticiones (o 20 a 40 metros en el acarreo), RPE 7 a 8, con 60 a 90 segundos de descanso.";
    default:
      return "Para fuerza: 3 a 5 series de 3 a 5 repeticiones, RPE 7 a 9, descanso de 3 a 5 minutos. Es el criterio de Prilepin: pocas repeticiones de calidad, sin ir al fallo. Para hipertrofia, en otro día, 3 a 4 series de 6 a 10 con 2 minutos.";
  }
}

function programmingText(media, context) {
  const hours = getOptimalRecoveryHours(media.name);
  const sameSession = fold(media.name) === fold(context.currentExercise) || fold(context.currentExercise).includes(fold(media.name));
  const sessionLine = sameSession
    ? ` En la serie que tenés ahora, el cockpit marca ${context.currentWeight > 0 ? `${context.currentWeight} kg` : "tu carga"} x ${context.currentReps} a RPE ${context.currentRpe}.`
    : "";
  return `Para programar ${media.name}: ${schemeFor(media)} Dejá ${hours} horas entre sesiones pesadas de este patrón. Si todas las series salen nítidas al RPE previsto, la próxima vez sumá la microcarga más chica. Si la barra se frena o se cae la postura, repetí la carga.${sessionLine}`;
}

function musclesText(media) {
  const muscles = joinEs(media.targetMuscles || []);
  return `${media.name} carga principalmente ${muscles}. Los músculos primarios mueven la carga y el core la sostiene para que la columna no negocie la postura. Si sentís el trabajo en otro lado y la técnica se deforma, bajá el peso antes de buscar más activación.`;
}

function mistakesText(media) {
  const mistakes = (media.commonMistakes || []).map((item) => `• ${item}`).join("\n");
  return mistakes
    ? `Errores que más se cuelan en ${media.name}:\n${mistakes}\n\nSi aparece uno, cortá la serie. Una repetición linda construye más fuerza que tres con la postura rota.`
    : `En ${media.name}, el error grande es subir el peso cuando el rango o la línea ya se fueron. Filmate de costado y compará con la demo oficial.`;
}

function substitutionText(media) {
  const ids = ALTERNATIVES[media.id] || [];
  const names = ids.map((id) => mediaById(id)?.name).filter(Boolean);
  if (names.length === 0) {
    return `Si hoy no podés hacer ${media.name}, elegí otro patrón que trabaje ${joinEs(media.targetMuscles || [])} sin dolor y con un rango que controles. No hace falta inventar una variante rara.`;
  }
  return `Si no podés hacer ${media.name} hoy, alternativas del mismo tipo de fuerza: ${joinEs(names)}. Mantené el mismo RPE, no el mismo kilo: el implemento cambia la palanca.`;
}

function warmupText(media) {
  return `Entrada en calor de ${media.name}: 3 a 5 minutos de mover la articulación que va a trabajar, después barra sola o una carga liviana por 5 a 8 repeticiones lentas, y dos tandas de aproximación (cerca del 50% y del 75% de la serie de trabajo) con menos repeticiones. Recién ahí cargá la serie. El aire diafragmático se practica en la última aproximación, no en la primera.`;
}

function breathingText(media) {
  return `En ${media.name}, tomá aire por la nariz hacia el abdomen y los costados (360°) antes de la repetición pesada y sostenelo en la maniobra de Valsalva durante la bajada y el pasaje más duro. Soltá al pasar el punto difícil, no antes. En series largas de accesorio no hace falta aguantar el aire en cada repetición: exhalá en el esfuerzo. Si un médico te indicó que no aguantes la respiración, seguí esa indicación.`;
}

function patternForFreeName(name) {
  const folded = fold(name);
  if (/sentadilla|squat|zancada|lunge|bulgara|estocada/.test(folded)) {
    return "Es un patrón de sentadilla: rodillas y cadera se flexionan juntas, talón apoyado, rodillas siguen la punta del pie y el torso se mantiene lo más alto que tu movilidad permita.";
  }
  if (/muerto|rdl|hinge|hip thrust|puente|peso muerto|buenos dias|good morning/.test(folded)) {
    return "Es un patrón de bisagra de cadera: la cadera va hacia atrás, la barra o la carga queda cerca de las piernas, la lumbar neutra y las rodillas solo se doblan lo necesario.";
  }
  if (/banca|press|fondo|lagartija|flexion|push|empuje|hombro/.test(folded)) {
    return "Es un empuje: escápulas estables, la carga sale en línea con el antebrazo y el rango termina en un bloqueo que no tire del hombro hacia adelante.";
  }
  if (/remo|dominada|jalon|pulldown|face pull|row|traccion/.test(folded)) {
    return "Es una tracción: el codo viaja hacia la cadera o la axila, el hombro no se encoge hacia la oreja al inicio y el torso no se hamaca para completar la repetición.";
  }
  if (/plancha|carry|granjero|paseo|maleta|core/.test(folded)) {
    return "Es un trabajo de rigidez: costillas abajo, glúteos activos y la columna quieta mientras caminás o sostenés. Si la pelvis se cae o la carga te dobla, está pesado.";
  }
  if (/curl|extension|patada|elevacion lateral|gemelo|pantorrilla/.test(folded)) {
    return "Es un accesorio de aislamiento: la articulación que querés entrenar se mueve y el resto del cuerpo queda quieto. Si te hamacás, el peso ya es de más.";
  }
  return "Tratalo como un patrón básico: postura antes que carga, rango que puedas repetir igual y velocidad controlada en la bajada.";
}

function freeExerciseMedia(name) {
  return {
    id: "fallback_exercise",
    name,
    category: "Libre",
    targetMuscles: ["el patrón principal", "estabilizadores"],
    formCues: [patternForFreeName(name)],
    commonMistakes: ["Subir el peso cuando la repetición ya no se parece a la primera."],
    tempo: "2-0-X-1",
  };
}

function extractFreeName(foldedQuery) {
  const match = foldedQuery.match(/(?:como (?:se )?(?:el |la |los |las |lo )?(?:hago|hace)|tecnica de(?:l| la)?|musculos de(?:l| la)?|equipo para(?: el| la)?|errores de(?:l| la)?)\s+(.+)$/);
  if (!match) return "";
  const name = match[1].replace(/[?.!].*$/, "").trim();
  if (!name || GENERIC_NAMES.has(name) || name.length < 3) return "";
  return name;
}

function detectTopic(folded, isLocked) {
  const lockout = /bloquead|bloqueo|candado|no me deja|por que no me deja|no puedo (hacerlo|repetir)|por que esta (rojo|bloqueado)/.test(folded);
  if (isLocked && lockout) return "RECOVERY_LOCKOUT";
  if (/dolor|lesion|pinchazo|me duele|molestia aguda|me lesion/.test(folded)) return "PAIN_SAFETY";
  if (/como (?:se )?(?:lo |la |el |los |las )?hago|como se hace|como (?:lo |la )?ejecut|tecnica|postura|biomecanica|ensenam|demostr|forma correcta|paso a paso|\bvideo\b|mostrame/.test(folded)) {
    return "TECHNIQUE";
  }
  if (/musculo|que trabaja|que activ|gluteo|cuadriceps|pectoral|dorsal|isquio|triceps|biceps|abdominal|deltoide/.test(folded)) {
    return "MUSCLES";
  }
  if (/que equipo|que material|que necesito|implemento|con que (?:se hace|entreno|barra)|rack|jaula|disco|cinturon|rodillera|munequera|correa|straps|banco plano/.test(folded)) {
    return "EQUIPMENT";
  }
  if (/error comun|errores|que evitar|equivoc|mala tecnica|que no (?:tengo que|debo) hacer|mistake/.test(folded)) return "MISTAKES";
  if (/tempo|cadencia|excentrica|concentrica/.test(folded)) return "TEMPO";
  if (/sustitu|reemplaz|alternativa|en vez de|en lugar de|otro ejercicio/.test(folded)) return "SUBSTITUTION";
  if (/diferencia| vs | versus |mejor entre|que es mejor/.test(folded)) return "EXPLAIN";
  if (/program|cuantas series|cuantas repetic|frecuencia|prilepin|progres|microcarga|mesociclo|hipertrof|principiante|cuantas veces|por semana|deload|descarga|como lo organizo/.test(folded)) {
    return "PROGRAMMING";
  }
  if (/descans|recuper|cuanto esperar|entre series|entre dias|entre sesiones|minutos entre|segundos entre|72 horas|48 horas/.test(folded)) {
    if (/dias|sesion|semana|entre entren|72|48|volver a (hacerlo|entrenar)|cada cuanto/.test(folded)) {
      return "REST_INTER_SESSION";
    }
    return "REST_INTRA_SET";
  }
  if (/que hago|que sigue|que significa|rpe|rir|esta serie|cuanto cargo|que peso debo|autoregul|como regul/.test(folded)) {
    return "PHASE_GUIDANCE";
  }
  if (/calentamiento|entrada en calor|aproximacion|series de entrada/.test(folded)) return "WARMUP";
  if (/respir|valsalva|bracing|diafragm/.test(folded)) return "BREATHING";
  if (/que es|para que sirve|explicame/.test(folded)) return "EXPLAIN";
  return "GENERAL_COACHING";
}

function sourceLine(demoClip) {
  const video = demoClip
    ? "El video de abajo se reproduce desde el canal oficial de Rogue Fitness: no se descarga ni se copia."
    : "Cuando no hay un clip que coincida con el ejercicio, el canal de Rogue Fitness y su biblioteca de movimientos son la referencia visual.";
  return `${video} Para criterio de fuerza en español, Be Best Beast publica en YouTube y en Instagram.`;
}

function techniqueAnswer(media) {
  const clip = buildDemo(media);
  const extra = variantNote(media);
  const mistakes = (media.commonMistakes || []).slice(0, 2).join(" ");
  const text = [
    techniqueBody(media),
    extra,
    `Tempo de referencia: ${media.tempo} (${explainTempo(media.tempo)}).`,
    mistakes ? `Errores frecuentes: ${mistakes}` : "",
    clip ? "" : "No tengo un clip oficial de Rogue que sea exactamente este movimiento, así que no incrusto otro video.",
    sourceLine(clip),
  ].filter(Boolean).join("\n\n");
  return reply("TECHNIQUE", text, [
    "¿Qué músculos trabaja?",
    "¿Qué equipo necesito?",
    "¿Cuáles son los errores comunes?",
  ], media, { includeDemo: true });
}

function explainTwo(left, right) {
  return `${left.name} enfatiza ${joinEs(left.targetMuscles || [])}. ${right.name} enfatiza ${joinEs(right.targetMuscles || [])}. No son intercambiables al mismo kilo: elegí el que coincida con el patrón que querés mejorar y mantené la técnica de cada uno. ${sourceLine(null)}`;
}

function generalAnswer(folded, media, context) {
  if (/rpe/.test(folded)) {
    return reply("EXPLAIN", getPhaseGuidance({
      exerciseName: media.name,
      weight: context.currentWeight,
      reps: context.currentReps,
      rpe: context.currentRpe,
    }), ["¿Cómo autoregulo si me siento cansado?", "¿Cuánto debo descansar?", "¿Cómo hago este ejercicio?"], media);
  }
  if (/1rm|una repeticion maxima|repeticion maxima/.test(folded)) {
    return reply(
      "EXPLAIN",
      `El 1RM es la carga que podés mover una sola vez con buena técnica. No hace falta testearlo al fallo todas las semanas: podés estimarlo desde una serie de 3 a 5 dejando 1 o 2 repeticiones en recámara. En ${media.name}, si la última repetición ya se deforma, esa serie no sirve para estimar.`,
      ["¿Cómo hago este ejercicio?", "¿Cuántas series programo?", "¿Cuánto debo descansar?"],
      media,
    );
  }
  if (/agarre|mixto|gancho|hook|pronacion|supino/.test(folded)) {
    return reply(
      "EXPLAIN",
      `En ${media.name}, el agarre tiene que quedar parejo de ambos lados. El doble prono es el punto de partida. El gancho (hook) suma seguridad en pesos muertos y olímpicos. El mixto puede torcer la barra: si lo usás, alterná la mano supina entre series. Las correas son una herramienta, no la técnica.`,
      ["¿Cómo hago este ejercicio?", "¿Qué equipo necesito?", "¿Cuáles son los errores comunes?"],
      media,
    );
  }
  if (/cinturon|belt/.test(folded)) {
    return reply(
      "EQUIPMENT",
      "El cinturón es una pared para empujar el abdomen hacia afuera, no un corsé que levanta por vos. Abrochalo en las series pesadas de sentadilla, peso muerto o press, después de haber calentado sin él. Tiene que dejarte tomar aire. Si una serie liviana solo sale con cinturón, el bracing todavía no está.",
      ["¿Cómo respiro en la serie pesada?", "¿Cómo hago este ejercicio?", "¿Cuánto debo descansar?"],
      media,
    );
  }
  if (/principiante|recien empiezo|nunca hice/.test(folded)) {
    return reply(
      "PROGRAMMING",
      `Si recién empezás con ${media.name}, pasá dos o tres semanas con una carga que te deje 4 repeticiones de reserva, 3 series de 5, dos veces por semana si la recuperación de ${getOptimalRecoveryHours(media.name)} horas te lo permite. Filmate. El peso sube cuando las cinco repeticiones se parecen entre sí.`,
      ["¿Cómo hago este ejercicio?", "¿Qué equipo necesito?", "¿Cómo es la entrada en calor?"],
      media,
    );
  }
  if (/ayuno|nutricion|proteina|comer/.test(folded)) {
    return reply(
      "GENERAL_COACHING",
      "La fuerza de la sesión se sostiene con sueño y con proteína repartida en el día. Entrenar en ayunas puede sentirse bien en una serie liviana y pesado en un trabajo neural alto: si la barra se cae o te mareás, comé antes. Esto no reemplaza un plan con un profesional de la nutrición.",
      ["¿Cuánto descanso entre días?", "¿Cómo hago este ejercicio?", "¿Cuántas series programo?"],
      media,
    );
  }
  if (/mujer|hombre|genero/.test(folded)) {
    return reply(
      "GENERAL_COACHING",
      `La técnica de ${media.name} no cambia por el género: cambian las palancas y la carga absoluta. Programá por RPE y por recuperación, no por una tabla genérica. El rango, el bracing y la línea de la barra son los mismos criterios.`,
      ["¿Cómo hago este ejercicio?", "¿Qué músculos trabaja?", "¿Cuántas series programo?"],
      media,
    );
  }
  const clipNote = buildDemo(media)
    ? "Si querés ver el movimiento, pedime la técnica y te dejo la demo oficial de Rogue."
    : "Si querés ver demos oficiales, el canal de Rogue Fitness y su biblioteca tienen los clips; Be Best Beast los acompaña con criterio en español.";
  return reply(
    "GENERAL_COACHING",
    `${media.name} es un ejercicio de ${media.category || "fuerza"}. Trabaja ${joinEs(media.targetMuscles || [])}. ${patternForFreeName(media.name)} Tempo de referencia: ${media.tempo}. ${clipNote}`,
    [
      "¿Cómo hago la técnica correcta?",
      "¿Qué músculos trabaja?",
      "¿Cuántas series programo?",
    ],
    media,
  );
}

function asksInterSession(folded) {
  return /dias|sesion|semana|entre entren|72|48|volver a (hacerlo|entrenar)|cada cuanto/.test(folded);
}

export const COACH_KNOWLEDGE_TOPICS = Object.freeze({
  REST: {
    getIntraRestAnswer,
    getInterSessionAnswer,
  },
  TECHNIQUE: {
    getExerciseCues: (exerciseName = "") => techniqueBody(getExerciseMedia(exerciseName)),
  },
  PHASE_GUIDANCE: {
    getGuidance: getPhaseGuidance,
  },
  RECOVERY_LOCKOUT: {
    getExplanation: getLockoutExplanation,
  },
});

export function queryCoachKnowledge(userQuery = "", context = {}) {
  const query = String(userQuery ?? "").trim();
  const folded = fold(query);
  const ctx = readContext(context);

  if (!folded) {
    return reply(
      "GENERAL_COACHING",
      "Escribí la pregunta. Puedo explicarte la técnica, los músculos, el equipo, la programación o el descanso de cualquier ejercicio.",
      ["¿Cómo hago este ejercicio?", "¿Qué músculos trabaja?", "¿Cuánto debo descansar?"],
      currentMedia(ctx),
    );
  }

  const topic = detectTopic(folded, ctx.isLocked);
  const namedIds = matchAliases(folded);
  const freeName = namedIds.length === 0 ? extractFreeName(folded) : "";
  const media = namedIds.length > 0
    ? (mediaById(namedIds[0]) || currentMedia(ctx))
    : (freeName ? freeExerciseMedia(freeName) : currentMedia(ctx));

  if (topic === "RECOVERY_LOCKOUT") {
    return reply(
      "RECOVERY_LOCKOUT",
      getLockoutExplanation(ctx.currentExercise, ctx.remainingHours, ctx.remainingMinutes),
      ["¿Qué ejercicio puedo hacer hoy?", "¿Cuánto descanso entre series?", "¿Cómo acelero la recuperación sin saltear el descanso?"],
      currentMedia(ctx),
    );
  }

  if (topic === "PAIN_SAFETY") {
    return reply(
      "PAIN_SAFETY",
      `Si sentís un dolor agudo, un pinchazo o el dolor te cambia la técnica de ${media.name}, cortá la serie. Desde acá no diagnostico lesiones: eso lo tiene que ver un kinesiólogo o un médico del deporte. Mientras tanto, entrená patrones que no reproduzcan ese dolor y no fuerces el rango.`,
      ["¿Qué ejercicio puedo hacer en su lugar?", "¿Cómo es la entrada en calor?", "¿Cuánto descanso entre días?"],
      media,
    );
  }

  if (topic === "TECHNIQUE") {
    if (freeName) {
      const text = [
        `${freeName}: ${patternForFreeName(freeName)}`,
        "No tengo una demo oficial de Rogue que coincida exactamente con ese nombre, así que no incrusto otro video para no mostrarte un movimiento distinto.",
        sourceLine(null),
      ].join("\n\n");
      return reply("TECHNIQUE", text, [
        "¿Qué equipo necesito?",
        "¿Cuántas series programo?",
        "¿Cuáles son los errores comunes?",
      ], media);
    }
    return techniqueAnswer(media);
  }

  if (topic === "MUSCLES") {
    return reply("MUSCLES", musclesText(media), [
      "¿Cómo hago este ejercicio?",
      "¿Qué ejercicio lo reemplaza?",
      "¿Cuántas series programo?",
    ], media);
  }

  if (topic === "EQUIPMENT") {
    return reply("EQUIPMENT", `${equipmentText(media)}\n\n${sourceLine(buildDemo(media))}`, [
      "¿Cómo hago este ejercicio?",
      "¿Sirve usar cinturón?",
      "¿Cuáles son los errores comunes?",
    ], media, { includeDemo: true });
  }

  if (topic === "MISTAKES") {
    return reply("MISTAKES", mistakesText(media), [
      "¿Cómo hago la técnica correcta?",
      "¿Qué equipo necesito?",
      "¿Cuánto debo descansar?",
    ], media, { includeDemo: true });
  }

  if (topic === "TEMPO") {
    return reply(
      "TEMPO",
      `El tempo de ${media.name} es ${media.tempo}: ${explainTempo(media.tempo)}. La X no es un rebote: es subir con intención mientras la postura sigue igual. Si para cumplir el tempo tenés que achicar el rango, bajá el peso.`,
      ["¿Cómo hago este ejercicio?", "¿Qué significa RPE en mi entrenamiento?", "¿Cuánto debo descansar?"],
      media,
    );
  }

  if (topic === "SUBSTITUTION") {
    return reply("SUBSTITUTION", substitutionText(media), [
      "¿Cómo hago la alternativa?",
      "¿Qué músculos trabajo igual?",
      "¿Qué equipo necesito?",
    ], media);
  }

  if (topic === "PROGRAMMING") {
    return reply("PROGRAMMING", `${programmingText(media, ctx)}\n\n${sourceLine(null)}`, [
      "¿Cómo hago este ejercicio?",
      "¿Cuánto descanso entre días?",
      "¿Cómo autoregulo si me siento cansado?",
    ], media);
  }

  if (topic === "REST_INTER_SESSION" || (topic === "REST_INTRA_SET" && asksInterSession(folded))) {
    return reply(
      "REST_INTER_SESSION",
      getInterSessionAnswer(media.name),
      ["¿Cuánto descanso entre series?", "¿Cómo hago este ejercicio?", "¿Qué significa RPE en mi entrenamiento?"],
      media,
    );
  }

  if (topic === "REST_INTRA_SET") {
    return reply(
      "REST_INTRA_SET",
      `${getIntraRestAnswer(ctx.currentRpe)} ${getInterSessionAnswer(media.name)}`,
      ["¿Cómo hago este ejercicio?", "¿Qué peso debo cargar ahora?", "¿Cuánto descanso entre días?"],
      media,
    );
  }

  if (topic === "PHASE_GUIDANCE") {
    const phaseMedia = namedIds.length > 0 ? media : currentMedia(ctx);
    return reply(
      "PHASE_GUIDANCE",
      getPhaseGuidance({
        exerciseName: phaseMedia.name,
        weight: contextWeightFor(namedIds, ctx),
        reps: ctx.currentReps,
        rpe: ctx.currentRpe,
      }),
      ["¿Cómo hago este ejercicio?", "¿Cuánto descanso entre series?", "¿Cómo autoregulo si me siento cansado?"],
      phaseMedia,
    );
  }

  if (topic === "WARMUP") {
    return reply("WARMUP", warmupText(media), [
      "¿Cómo hago este ejercicio?",
      "¿Cuánto debo descansar?",
      "¿Qué equipo necesito?",
    ], media);
  }

  if (topic === "BREATHING") {
    return reply("BREATHING", breathingText(media), [
      "¿Cómo hago este ejercicio?",
      "¿Sirve usar cinturón?",
      "¿Qué hago en esta serie?",
    ], media);
  }

  if (topic === "EXPLAIN" && namedIds.length >= 2) {
    const left = mediaById(namedIds[0]);
    const right = mediaById(namedIds[1]);
    if (left && right) {
      return reply("EXPLAIN", explainTwo(left, right), [
        `¿Cómo hago ${left.name}?`,
        `¿Cómo hago ${right.name}?`,
        "¿Cuál programo primero?",
      ], left);
    }
  }

  if (!ctx.isLocked && /no me deja|bloquead|candado/.test(folded)) {
    return reply(
      "GENERAL_COACHING",
      `${ctx.currentExercise} no está bloqueado ahora. Podés hacerlo. ${getInterSessionAnswer(media.name)}`,
      ["¿Cómo hago este ejercicio?", "¿Cuánto descanso entre series?", "¿Qué hago en esta serie?"],
      media,
    );
  }

  return generalAnswer(folded, media, ctx);
}

function contextWeightFor(namedIds, ctx) {
  if (namedIds.length > 0) {
    const named = mediaById(namedIds[0]);
    const current = currentMedia(ctx);
    if (named && named.id !== current.id && named.id !== "fallback_exercise") return 0;
  }
  return ctx.currentWeight;
}

export function formatCoachClock(date = new Date()) {
  const value = date instanceof Date ? date : new Date(date);
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(value);
  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
  return `${hour}:${minute}`;
}

export function resolveCoachSubject(userQuery = "", session = {}) {
  const folded = fold(userQuery);
  const named = matchAliases(folded);
  if (named.length > 0) {
    const media = mediaById(named[0]);
    if (media) return { exerciseId: media.id, exerciseName: media.name, remembered: false };
  }
  const freeName = extractFreeName(folded);
  if (freeName) return { exerciseId: null, exerciseName: freeName, remembered: false };
  if (typeof session.discussedExerciseId === "string") {
    const remembered = mediaById(session.discussedExerciseId);
    if (remembered) return { exerciseId: remembered.id, exerciseName: remembered.name, remembered: true };
  }
  if (typeof session.discussedExerciseName === "string" && session.discussedExerciseName.trim()) {
    return { exerciseId: null, exerciseName: session.discussedExerciseName.trim(), remembered: true };
  }
  const cockpit = currentMedia(readContext({ currentExercise: session.currentExercise }));
  return {
    exerciseId: cockpit.id === "fallback_exercise" ? null : cockpit.id,
    exerciseName: cockpit.name,
    remembered: false,
  };
}

function normalizeTranscript(value) {
  if (!Array.isArray(value)) return [];
  const turns = [];
  for (const item of value) {
    if (!item || (item.role !== "user" && item.role !== "assistant")) continue;
    if (typeof item.content !== "string") continue;
    const content = item.content.trim().slice(0, 2000);
    if (!content) continue;
    turns.push({ role: item.role, content });
  }
  return turns.slice(-12);
}

function subjectMedia(subject) {
  if (subject.exerciseId) {
    return mediaById(subject.exerciseId) || freeExerciseMedia(subject.exerciseName);
  }
  return freeExerciseMedia(subject.exerciseName);
}

function followUpsFor(topic) {
  switch (topic) {
    case "TECHNIQUE":
      return ["¿Qué músculos trabaja?", "¿Qué equipo necesito?", "¿Cuáles son los errores comunes?"];
    case "MUSCLES":
      return ["¿Cómo hago este ejercicio?", "¿Qué ejercicio lo reemplaza?", "¿Cuántas series programo?"];
    case "EQUIPMENT":
      return ["¿Cómo hago este ejercicio?", "¿Sirve usar cinturón?", "¿Cuáles son los errores comunes?"];
    case "MISTAKES":
      return ["¿Cómo hago la técnica correcta?", "¿Qué equipo necesito?", "¿Cuánto debo descansar?"];
    case "PAIN_SAFETY":
      return ["¿Qué ejercicio puedo hacer en su lugar?", "¿Cómo es la entrada en calor?", "¿Cuánto descanso entre días?"];
    case "PROGRAMMING":
      return ["¿Cómo hago este ejercicio?", "¿Cuánto descanso entre días?", "¿Cómo autoregulo si me siento cansado?"];
    case "REST_INTRA_SET":
    case "REST_INTER_SESSION":
      return ["¿Cómo hago este ejercicio?", "¿Cuánto descanso entre días?", "¿Qué hago en esta serie?"];
    case "RECOVERY_LOCKOUT":
      return ["¿Qué ejercicio puedo hacer hoy?", "¿Cuánto descanso entre series?", "¿Cómo hago este ejercicio?"];
    case "PHASE_GUIDANCE":
    case "WARMUP":
    case "BREATHING":
    case "TEMPO":
    case "SUBSTITUTION":
    case "EXPLAIN":
    case "GENERAL_COACHING":
      return ["¿Cómo hago este ejercicio?", "¿Qué músculos trabaja?", "¿Cuántas series programo?"];
    default: {
      const exhaustive = topic;
      return exhaustive ? ["¿Cómo hago este ejercicio?", "¿Qué músculos trabaja?", "¿Cuánto debo descansar?"] : [];
    }
  }
}

function liveSystem(media, subject, ctx, topic) {
  const exactDemo = buildDemo(media);
  const demoNote = exactDemo
    ? "Hay una demo oficial de Rogue de este mismo movimiento. No repitas el pie del video ni pegues un ID de YouTube."
    : "No hay un clip oficial verificado de este movimiento. Decilo en una frase y no inventes un video ni describas otro ejercicio como si fuera este.";
  return [
    "Sos el coach de fuerza de ATP Strength. Respondé en español rioplatense, con voseo.",
    "Dos a cuatro párrafos cortos. Sin links: la interfaz los agrega.",
    "Usá la ficha de la app. Si el movimiento no está en la ficha, explicá el patrón sin inventar una demo.",
    "No des tratamientos, diagnósticos ni dosis. El dolor agudo se corta y se deriva.",
    `El ejercicio de esta conversación es ${subject.exerciseName}. Una pregunta de seguimiento sigue siendo sobre ese movimiento, salvo que nombren otro.`,
    demoNote,
    "Criterio público, sin copiarlo en la respuesta: YouTube de Be Best Beast, Instagram de Be Best Beast y YouTube de Rogue Fitness.",
    [
      `Ficha: ${media.name}.`,
      `Categoría: ${media.category || "fuerza"}.`,
      `Músculos: ${joinEs(media.targetMuscles || [])}.`,
      `Tempo: ${media.tempo}. ${explainTempo(media.tempo)}.`,
      `Claves: ${(media.formCues || []).join(" | ") || "postura antes que carga."}`,
      `Errores: ${(media.commonMistakes || []).join(" | ") || "subir el peso cuando el rango se deforma."}`,
      equipmentText(media),
      `Horas entre sesiones pesadas: ${getOptimalRecoveryHours(media.name)}.`,
      `Cockpit: ${ctx.currentExercise}, ${ctx.currentWeight} kg x ${ctx.currentReps}, RPE ${ctx.currentRpe}.`,
      ctx.isLocked
        ? `Ese ejercicio del cockpit está en recuperación: ${ctx.remainingHours} horas y ${ctx.remainingMinutes} minutos.`
        : "El ejercicio del cockpit no está bloqueado.",
      `Tema: ${topic}.`,
    ].join("\n"),
  ].join("\n\n");
}

function withoutCaption(text, caption) {
  if (!caption) return text.trim();
  return text
    .split("\n")
    .filter((line) => line.trim() !== caption.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function prepareLiveCoach(payload = {}) {
  const messages = normalizeTranscript(payload.messages);
  const latest = [...messages].reverse().find((turn) => turn.role === "user");
  if (!latest) return { kind: "empty" };
  const ctx = readContext(payload.context);
  const subject = resolveCoachSubject(latest.content, {
    discussedExerciseId: payload.discussedExerciseId,
    discussedExerciseName: payload.discussedExerciseName,
    currentExercise: ctx.currentExercise,
  });
  const media = subjectMedia(subject);
  const topic = detectTopic(fold(latest.content), ctx.isLocked && subject.exerciseName === ctx.currentExercise);
  if (topic === "PAIN_SAFETY") {
    return {
      kind: "pain",
      answer: reply(
        "PAIN_SAFETY",
        `Si sentís un dolor agudo, un pinchazo o el dolor te cambia la técnica de ${media.name}, cortá la serie. Desde acá no diagnostico lesiones: eso lo tiene que ver un kinesiólogo o un médico del deporte. Mientras tanto, entrená patrones que no reproduzcan ese dolor y no fuerces el rango.`,
        followUpsFor("PAIN_SAFETY"),
        media,
      ),
    };
  }
  return {
    kind: "model",
    topic,
    subject,
    media,
    messages,
    system: liveSystem(media, subject, ctx, topic),
  };
}

export function finalizeLiveCoach(prepared, modelText) {
  if (!prepared || prepared.kind !== "model") {
    throw new Error("invalid-turn");
  }
  const raw = String(modelText ?? "").trim();
  if (!raw) throw new Error("empty-model");
  const demo = buildDemo(prepared.media);
  const text = withoutCaption(raw, demo?.caption);
  if (!text) throw new Error("empty-model");
  const includeDemo = prepared.topic === "TECHNIQUE" || prepared.topic === "EQUIPMENT" || prepared.topic === "MISTAKES";
  return reply(prepared.topic, text, followUpsFor(prepared.topic), prepared.media, { includeDemo });
}
