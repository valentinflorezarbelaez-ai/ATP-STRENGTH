/**
 * Gnostic, Stoic, and Initiated Warrior Wisdom (SPEC-0008)
 * Curated aphorisms of physical and spiritual fortitude:
 * Musashi, Leonidas, Perseus, Hercules, Hermes Trismegisto, David Goggins, Marco Aurelio.
 */

export interface WarriorAphorism {
  id: string;
  author: string;
  tradition: string;
  quote: string;
  symbol: string;
  focus: string;
  bgGradient: string;
}

export const WARRIOR_APHORISMS: WarriorAphorism[] = [
  {
    id: "musashi",
    author: "Miyamoto Musashi",
    tradition: "Bushido • Dokkodo",
    quote: "Bajo la espada levantada está el infierno que te hace vacilar; pero da un paso adelante y conquistarás la tierra de la victoria.",
    symbol: "⚔️",
    focus: "Determinación implacable",
    bgGradient: "from-amber-500/10 via-zinc-950 to-black",
  },
  {
    id: "leonidas",
    author: "Rey Leónidas de Esparta",
    tradition: "Esparta • Batalla de las Termópilas",
    quote: "La fuerza de un guerrero no reside en su escudo, sino en la calma inquebrantable de su espíritu frente a la adversidad.",
    symbol: "🛡️",
    focus: "Temple y coraje indomable",
    bgGradient: "from-red-500/10 via-zinc-950 to-black",
  },
  {
    id: "perseus",
    author: "Perseo y Atenea",
    tradition: "Mitología Clásica • Iniciación",
    quote: "Para decapitar a la Medusa de la debilidad mental no debes mirarla a los ojos; debes actuar con el escudo pulido de la razón y el acero de la voluntad.",
    symbol: "⚡",
    focus: "Dominio de la mente inferior",
    bgGradient: "from-sky-500/10 via-zinc-950 to-black",
  },
  {
    id: "hercules",
    author: "Hércules (Heracles)",
    tradition: "Doce Trabajos • La Vía del Héroe",
    quote: "No hay gloria en los caminos llanos. Los doce trabajos se conquistaron serie a serie, transmutando el sufrimiento en poder divino.",
    symbol: "🦁",
    focus: "Resistencia física sobrehumana",
    bgGradient: "from-amber-500/15 via-zinc-950 to-black",
  },
  {
    id: "hermes",
    author: "Hermes Trismegisto",
    tradition: "Hermetismo • Tabla Esmeralda",
    quote: "Como es adentro, es afuera. La barra de acero es el espejo donde tu alma mide su verdadero peso y disciplina.",
    symbol: "☤",
    focus: "Transmutación de la energía",
    bgGradient: "from-emerald-500/10 via-zinc-950 to-black",
  },
  {
    id: "goggins",
    author: "David Goggins",
    tradition: "Mentalidad de Hierro Militar",
    quote: "Cuando tu mente te suplica que te detengas, apenas has consumido el 40% de tu potencial real. Quebrá la pereza, respirá y empujá.",
    symbol: "🔥",
    focus: "Superación del umbral mental",
    bgGradient: "from-rose-500/10 via-zinc-950 to-black",
  },
  {
    id: "samael",
    author: "Samael Aun Weor",
    tradition: "Gnosis • Teurgia",
    quote: "A las cumbres sagradas de la conciencia y la maestría física solo se asciende con sacrificio supremo, fuego interior y disciplina consciente.",
    symbol: "☀️",
    focus: "Fuego y voluntad espiritual",
    bgGradient: "from-purple-500/10 via-zinc-950 to-black",
  },
  {
    id: "marcus",
    author: "Marco Aurelio",
    tradition: "Estoicismo Imperial Romano",
    quote: "El impedimento a la acción avanza la acción. Lo que se interpone en el camino se convierte en el camino.",
    symbol: "🏛️",
    focus: "Serenidad ante la carga",
    bgGradient: "from-zinc-500/10 via-zinc-950 to-black",
  },
];

export function getDailyAphorism(seedIndex?: number): WarriorAphorism {
  if (typeof seedIndex === "number" && seedIndex >= 0) {
    return WARRIOR_APHORISMS[seedIndex % WARRIOR_APHORISMS.length];
  }
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return WARRIOR_APHORISMS[dayOfYear % WARRIOR_APHORISMS.length];
}
