"use client";

import React, { useState } from "react";
import {
  Flame, Apple, Beef, Wheat, Droplets, Pill, ChevronDown, ChevronUp,
  Leaf, Heart, Zap, ArrowLeft, Sun, Moon, Coffee, UtensilsCrossed,
  ShoppingCart, DollarSign, Sparkles, Shield,
} from "lucide-react";

/* ─────────────────── DATA ─────────────────── */

interface FoodItem {
  name: string;
  amount: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  cost: string; // relative $/$$/$$$
  tip?: string;
}

interface MealBlock {
  label: string;
  icon: React.ReactNode;
  time: string;
  items: FoodItem[];
}

const MEAL_PLAN: MealBlock[] = [
  {
    label: "Desayuno del Guerrero",
    icon: <Sun className="w-4 h-4" />,
    time: "6:00 – 7:30 AM",
    items: [
      { name: "Avena en hojuelas", amount: "80g", calories: 300, protein: 10, carbs: 54, fat: 5, cost: "$", tip: "Comprar en bulk — la avena más barata es la mejor" },
      { name: "Huevos enteros", amount: "3 unidades", calories: 210, protein: 18, carbs: 1, fat: 15, cost: "$", tip: "La proteína más completa y económica que existe" },
      { name: "Banano maduro", amount: "1 grande", calories: 105, protein: 1, carbs: 27, fat: 0, cost: "$" },
      { name: "Leche entera", amount: "250ml", calories: 150, protein: 8, carbs: 12, fat: 8, cost: "$" },
    ],
  },
  {
    label: "Almuerzo de Batalla",
    icon: <Flame className="w-4 h-4" />,
    time: "12:00 – 1:30 PM",
    items: [
      { name: "Arroz blanco", amount: "200g cocido", calories: 260, protein: 5, carbs: 58, fat: 0, cost: "$", tip: "Fuente de energía barata y eficiente" },
      { name: "Pechuga/muslos de pollo", amount: "200g", calories: 330, protein: 50, carbs: 0, fat: 14, cost: "$$", tip: "Los muslos son más baratos y tienen más sabor" },
      { name: "Lentejas cocidas", amount: "150g", calories: 170, protein: 13, carbs: 28, fat: 1, cost: "$", tip: "Proteína vegetal + hierro + fibra" },
      { name: "Ensalada (tomate, cebolla, zanahoria)", amount: "200g", calories: 45, protein: 2, carbs: 10, fat: 0, cost: "$" },
      { name: "Aceite de oliva", amount: "1 cda", calories: 120, protein: 0, carbs: 0, fat: 14, cost: "$$" },
    ],
  },
  {
    label: "Merienda Pre-Entrenamiento",
    icon: <Zap className="w-4 h-4" />,
    time: "3:00 – 4:00 PM",
    items: [
      { name: "Pan integral", amount: "2 rebanadas", calories: 160, protein: 8, carbs: 28, fat: 2, cost: "$" },
      { name: "Mantequilla de maní", amount: "2 cdas", calories: 190, protein: 7, carbs: 7, fat: 16, cost: "$", tip: "Grasa saludable + proteína — buy natural sin azúcar" },
      { name: "Creatina monohidrato", amount: "5g", calories: 0, protein: 0, carbs: 0, fat: 0, cost: "$", tip: "ÚNICO suplemento necesario — el más estudiado y efectivo" },
    ],
  },
  {
    label: "Cena de Restauración",
    icon: <Moon className="w-4 h-4" />,
    time: "7:00 – 8:30 PM",
    items: [
      { name: "Papa/batata", amount: "250g", calories: 215, protein: 5, carbs: 50, fat: 0, cost: "$", tip: "Tubérculos: la energía más barata del mercado" },
      { name: "Atún/sardinas en lata", amount: "1 lata (170g)", calories: 200, protein: 30, carbs: 0, fat: 8, cost: "$", tip: "Omega-3 + proteína de alta calidad" },
      { name: "Espinaca/acelga", amount: "150g", calories: 35, protein: 4, carbs: 5, fat: 0, cost: "$" },
      { name: "Aguacate", amount: "½ unidad", calories: 120, protein: 1, carbs: 6, fat: 11, cost: "$$", tip: "Cuando esté en temporada, es barato y nutritivo" },
    ],
  },
  {
    label: "Snack Nocturno",
    icon: <Coffee className="w-4 h-4" />,
    time: "9:00 – 10:00 PM",
    items: [
      { name: "Yogurt natural", amount: "200g", calories: 120, protein: 10, carbs: 8, fat: 5, cost: "$", tip: "Probióticos naturales — evitar yogurt azucarado" },
      { name: "Maní/cacahuate", amount: "30g", calories: 170, protein: 7, carbs: 5, fat: 14, cost: "$", tip: "Snack perfecto: barato, denso en calorías y proteína" },
    ],
  },
];

const FOODS_AVOID = [
  { name: "Carnes procesadas (embutidos, salchichas)", reason: "Conservantes, nitratos, baja calidad proteica" },
  { name: "Bebidas azucaradas y gaseosas", reason: "Calorías vacías, inflamación, pico de insulina" },
  { name: "Alcohol", reason: "Destruye la síntesis proteica y el rendimiento hormonal" },
  { name: "Comida ultra-procesada (snacks, frituras)", reason: "Grasas trans, aditivos, cero valor nutricional" },
  { name: "Exceso de cafeína (>3 tazas/día)", reason: "Sobreestimulación adrenal, insomnio, ansiedad" },
  { name: "Azúcar refinada", reason: "Picos de glucosa, inflamación crónica, fatiga" },
  { name: "Harinas ultra-refinadas", reason: "Índice glucémico alto, poca fibra, cero micronutrientes" },
];

const FOODS_CHAMPION = [
  { name: "Huevos", benefit: "La proteína más completa y biodisponible", icon: "🥚" },
  { name: "Avena", benefit: "Energía sostenida, fibra, beta-glucanos", icon: "🌾" },
  { name: "Lentejas y frijoles", benefit: "Proteína vegetal + hierro + fibra a bajo costo", icon: "🫘" },
  { name: "Arroz", benefit: "Carbohidrato limpio y económico para recuperación", icon: "🍚" },
  { name: "Pollo (muslos)", benefit: "Proteína de alta calidad, más barato que pechuga", icon: "🍗" },
  { name: "Atún/sardinas en lata", benefit: "Omega-3, proteína, vitamina D — ultra económico", icon: "🐟" },
  { name: "Banano", benefit: "Potasio, energía rápida, anti-calambres", icon: "🍌" },
  { name: "Papa y batata", benefit: "Energía densa, potasio, vitamina C", icon: "🥔" },
  { name: "Espinaca", benefit: "Hierro, magnesio, vitamina K — verdura del guerrero", icon: "🥬" },
  { name: "Maní/cacahuate", benefit: "Grasa saludable + proteína al menor costo", icon: "🥜" },
  { name: "Leche entera", benefit: "Proteína + calcio + calorías a bajo precio", icon: "🥛" },
  { name: "Aceite de oliva", benefit: "Grasas monoinsaturadas, antiinflamatorio", icon: "🫒" },
];

const GNOSTIC_WISDOM = [
  "«El cuerpo físico es el templo del Espíritu Santo. Debemos cuidarlo con sabiduría y respeto.» — V.M. Samael Aun Weor",
  "«La alimentación consciente es parte fundamental del trabajo esotérico. Lo que comemos afecta nuestros centros y nuestra capacidad de despertar.» — V.M. Samael Aun Weor",
  "«El exceso de carne embrutece la Conciencia. La moderación en todo es la clave del equilibrio.» — V.M. Samael Aun Weor",
  "«El cuerpo es el instrumento del Alma. Un instrumento afinado produce la mejor música.» — V.M. Rabolú",
  "«La fuerza física y la fuerza espiritual no son opuestas; son complementarias. El guerrero gnóstico forja ambas.»",
];

/* ─────────────────── COMPONENT ─────────────────── */

export function NutritionPlanView({ onBack }: { onBack: () => void }) {
  const [expandedMeal, setExpandedMeal] = useState<number | null>(0);
  const [showAvoid, setShowAvoid] = useState(false);
  const [wisdomIdx] = useState(() => Math.floor(Math.random() * GNOSTIC_WISDOM.length));

  const totalMacros = MEAL_PLAN.reduce(
    (acc, meal) => {
      meal.items.forEach((item) => {
        acc.calories += item.calories;
        acc.protein += item.protein;
        acc.carbs += item.carbs;
        acc.fat += item.fat;
      });
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <main className="min-h-screen relative overflow-x-hidden flex flex-col items-center p-4 md:p-8 pb-24 md:pb-8 font-sans selection:bg-amber-500 selection:text-black">
      {/* Ambient Background */}
      <div className="ambient-mesh-light" aria-hidden="true">
        <div className="ambient-orb-1" />
        <div className="ambient-orb-2" />
        <div className="ambient-orb-3" />
      </div>

      {/* Header */}
      <header className="w-full max-w-4xl flex items-center justify-between border-b border-zinc-900 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-zinc-800/60 border border-zinc-700/50 text-zinc-400 hover:text-amber-400 hover:border-amber-500/30 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400">
                <Apple className="w-5 h-5" />
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-black tracking-widest text-zinc-100 uppercase">
                COMBUSTIBLE/<span className="text-green-400">GUERRERO</span>
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-400 font-mono tracking-tight mt-0.5">
              PLAN NUTRICIONAL • MÁXIMO RENDIMIENTO • MÍNIMO COSTO
            </p>
          </div>
        </div>
      </header>

      {/* Gnostic Wisdom Quote */}
      <section className="w-full max-w-4xl mb-6">
        <div className="rounded-2xl p-4 border border-amber-500/20 bg-amber-500/5 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-200/80 italic leading-relaxed">{GNOSTIC_WISDOM[wisdomIdx]}</p>
          </div>
        </div>
      </section>

      {/* Daily Macros Summary */}
      <section className="w-full max-w-4xl mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Calorías", value: totalMacros.calories, unit: "kcal", icon: <Flame className="w-4 h-4" />, color: "amber" },
            { label: "Proteína", value: totalMacros.protein, unit: "g", icon: <Beef className="w-4 h-4" />, color: "red" },
            { label: "Carbohidratos", value: totalMacros.carbs, unit: "g", icon: <Wheat className="w-4 h-4" />, color: "yellow" },
            { label: "Grasas", value: totalMacros.fat, unit: "g", icon: <Droplets className="w-4 h-4" />, color: "blue" },
          ].map((m) => (
            <div key={m.label} className="rounded-2xl p-4 border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm text-center">
              <div className={`inline-flex p-2 rounded-xl bg-${m.color}-500/10 text-${m.color}-400 mb-2`}>
                {m.icon}
              </div>
              <p className="text-2xl font-black text-zinc-100">{m.value}<span className="text-sm text-zinc-500 ml-1">{m.unit}</span></p>
              <p className="text-[11px] text-zinc-500 font-mono uppercase tracking-wider">{m.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Creatine — The Only Supplement */}
      <section className="w-full max-w-4xl mb-8">
        <div className="rounded-2xl p-5 border border-cyan-500/20 bg-cyan-500/5 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">Único Suplemento: Creatina Monohidrato</h2>
              <p className="text-xs text-zinc-400">5g/día • Sin carga • Sin ciclado • Para siempre</p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-3 text-sm">
            {[
              { title: "¿Por qué creatina?", text: "El suplemento más estudiado de la historia. Aumenta la resíntesis de ATP (fosfocreatina), mejora fuerza máxima, potencia y recuperación entre series." },
              { title: "¿Cuál comprar?", text: "Monohidrato puro. La marca más barata funciona igual que la más cara. Evitar creatina \"avanzada\" o con aditivos. Buscar sello Creapure si el presupuesto lo permite." },
              { title: "¿Cómo tomar?", text: "5g diarios, todos los días, con cualquier comida. No necesita fase de carga. Tomar con agua o jugo. Constancia > timing." },
            ].map((item) => (
              <div key={item.title} className="rounded-xl p-3 bg-zinc-900/50 border border-zinc-800">
                <p className="font-semibold text-cyan-300 mb-1">{item.title}</p>
                <p className="text-zinc-400 text-xs leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meal Plan */}
      <section className="w-full max-w-4xl mb-8">
        <div className="flex items-center gap-2 mb-4">
          <UtensilsCrossed className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold text-zinc-100 uppercase tracking-wider">Plan de Comidas Diario</h2>
          <span className="ml-auto text-xs text-zinc-500 font-mono flex items-center gap-1">
            <DollarSign className="w-3 h-3" /> Enfocado en ahorro
          </span>
        </div>
        <div className="space-y-3">
          {MEAL_PLAN.map((meal, idx) => {
            const isOpen = expandedMeal === idx;
            const mealCals = meal.items.reduce((s, i) => s + i.calories, 0);
            const mealPro = meal.items.reduce((s, i) => s + i.protein, 0);
            return (
              <div key={idx} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
                <button
                  onClick={() => setExpandedMeal(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                      {meal.icon}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-zinc-100">{meal.label}</p>
                      <p className="text-[11px] text-zinc-500 font-mono">{meal.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-mono text-zinc-300">{mealCals} kcal</p>
                      <p className="text-[10px] text-zinc-500">{mealPro}g proteína</p>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-zinc-800/50">
                    <div className="mt-3 space-y-2">
                      {meal.items.map((item, fi) => (
                        <div key={fi} className="flex items-start justify-between gap-3 py-2 border-b border-zinc-800/30 last:border-0">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-zinc-200">{item.name}</p>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">{item.amount}</span>
                              <span className="text-[10px] text-green-400/60">{item.cost}</span>
                            </div>
                            {item.tip && (
                              <p className="text-[11px] text-amber-400/60 mt-0.5 italic">💡 {item.tip}</p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-mono text-zinc-400">{item.calories} kcal</p>
                            <p className="text-[10px] text-zinc-600">P{item.protein} C{item.carbs} G{item.fat}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Champion Foods */}
      <section className="w-full max-w-4xl mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-green-400" />
          <h2 className="text-lg font-bold text-zinc-100 uppercase tracking-wider">Alimentos del Guerrero</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {FOODS_CHAMPION.map((food) => (
            <div key={food.name} className="rounded-xl p-3 border border-zinc-800 bg-zinc-900/50 hover:border-green-500/30 transition-colors">
              <div className="text-2xl mb-2">{food.icon}</div>
              <p className="text-sm font-bold text-zinc-100">{food.name}</p>
              <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">{food.benefit}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Foods to Avoid */}
      <section className="w-full max-w-4xl mb-8">
        <button
          onClick={() => setShowAvoid(!showAvoid)}
          className="flex items-center gap-2 mb-4 group"
        >
          <Heart className="w-5 h-5 text-red-400" />
          <h2 className="text-lg font-bold text-zinc-100 uppercase tracking-wider group-hover:text-red-400 transition-colors">
            Alimentos a Evitar
          </h2>
          {showAvoid ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
        </button>
        {showAvoid && (
          <div className="space-y-2">
            {FOODS_AVOID.map((food) => (
              <div key={food.name} className="flex items-start gap-3 rounded-xl p-3 border border-red-500/10 bg-red-500/5">
                <span className="text-red-400 mt-0.5 text-lg shrink-0">✕</span>
                <div>
                  <p className="text-sm font-medium text-zinc-200">{food.name}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{food.reason}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Weekly Budget Estimate */}
      <section className="w-full max-w-4xl mb-8">
        <div className="rounded-2xl p-5 border border-green-500/20 bg-green-500/5 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <ShoppingCart className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-bold text-zinc-100">Presupuesto Semanal Estimado</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-zinc-400 mb-2">Mercado semanal aproximado:</p>
              <ul className="space-y-1 text-sm">
                {[
                  ["Huevos (30 unidades)", "$5–8"],
                  ["Avena (1kg)", "$2–3"],
                  ["Arroz (2kg)", "$2–4"],
                  ["Pollo (2kg muslos)", "$6–10"],
                  ["Lentejas/frijoles (1kg)", "$2–3"],
                  ["Atún en lata (5 latas)", "$5–8"],
                  ["Frutas (bananos, temporada)", "$3–5"],
                  ["Verduras (espinaca, zanahoria, tomate)", "$4–6"],
                  ["Leche (4L)", "$3–5"],
                  ["Maní/mantequilla de maní", "$3–4"],
                  ["Papa/batata (2kg)", "$2–3"],
                  ["Pan integral", "$2–3"],
                ].map(([item, price]) => (
                  <li key={item as string} className="flex justify-between text-zinc-300">
                    <span>{item}</span>
                    <span className="text-green-400 font-mono text-xs">{price} USD</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col justify-center items-center rounded-xl bg-zinc-900/50 border border-zinc-800 p-6">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Total semanal estimado</p>
              <p className="text-4xl font-black text-green-400">$39–62</p>
              <p className="text-xs text-zinc-500 mt-1">USD / semana</p>
              <p className="text-xs text-zinc-600 mt-3 text-center">Varía según región y temporada. Comprar en mercados locales y al por mayor reduce costos significativamente.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="w-full max-w-4xl mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Leaf className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-zinc-100 uppercase tracking-wider">Principios del Guerrero Consciente</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            { title: "Comer para Rendir, no para Placer", text: "La comida es combustible sagrado. Cada alimento debe tener un propósito: construir músculo, dar energía o recuperar el sistema nervioso." },
            { title: "Simplicidad sobre Sofisticación", text: "Los alimentos más simples y sin procesar son los más nutritivos. No necesitas suplementos caros ni comidas exóticas." },
            { title: "Consistencia sobre Perfección", text: "Comer bien el 90% del tiempo supera a cualquier dieta perfecta seguida solo una semana. La disciplina forja al guerrero." },
            { title: "El Cuerpo como Templo", text: "Desde la perspectiva gnóstica, el cuerpo físico es el vehículo de la Conciencia. Alimentarlo con pureza y respeto es un acto sagrado." },
            { title: "Hidratación Constante", text: "3+ litros de agua diarios. El agua es vida. Infusiones de hierbas (manzanilla, menta, jengibre) complementan la recuperación." },
            { title: "Escuchar al Cuerpo", text: "La auto-observación gnóstica también aplica a la nutrición. Aprende a distinguir hambre real de hambre emocional o mecánica." },
          ].map((p) => (
            <div key={p.title} className="rounded-xl p-4 border border-zinc-800 bg-zinc-900/50">
              <p className="font-bold text-emerald-300 text-sm mb-1">{p.title}</p>
              <p className="text-xs text-zinc-400 leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-4xl text-center py-6 border-t border-zinc-800/50">
        <p className="text-xs text-zinc-600 font-mono">
          "El guerrero que domina su cuerpo, domina su destino."
        </p>
      </footer>
    </main>
  );
}
