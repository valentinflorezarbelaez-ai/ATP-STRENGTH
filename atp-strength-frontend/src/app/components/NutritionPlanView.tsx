"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  Flame, Beef, Wheat, Droplets, Pill, ChevronDown, ChevronUp,
  ArrowLeft, UtensilsCrossed,
  ShoppingCart, Sparkles, Shield, Scale, Target, CheckSquare, Square
} from "lucide-react";
import {
  calculateApsNutrition,
  ANATOLY_GOALS,
  ANATOLY_SUPPLEMENT_STACK,
  type AnatolyGoalKey,
  type ActivityLevelKey,
} from "@/lib/anatolyNutrition";

/* ─────────────────── RECIPE & MEAL DATA ─────────────────── */

interface MealRecipe {
  name: string;
  time: string;
  tag: string;
  summary: string;
  ingredients: { name: string; amount: string; protein: number; carbs: number; fat: number; calories: number }[];
  instructions: string[];
}

const ANATOLY_RECIPES: Record<string, MealRecipe[]> = {
  POWER_BULK: [
    {
      name: "Desayuno de Poder (Power Breakfast)",
      time: "07:00 – 08:30 AM",
      tag: "Arranque Anabólico",
      summary: "Sobrecarga de glucógeno y aminoácidos para energizar el sistema nervioso central desde primera hora.",
      ingredients: [
        { name: "Huevos enteros de campo", amount: "4 unidades", protein: 24, carbs: 1, fat: 20, calories: 280 },
        { name: "Avena en hojuelas entera", amount: "100g", protein: 13, carbs: 68, fat: 7, calories: 389 },
        { name: "Miel pura de abejas", amount: "25g", protein: 0, carbs: 21, fat: 0, calories: 82 },
        { name: "Frutos rojos / Arándanos", amount: "80g", protein: 1, carbs: 12, fat: 0, calories: 45 },
        { name: "Tostadas de pan integral o masa madre", amount: "2 rebanadas", protein: 8, carbs: 32, fat: 2, calories: 180 }
      ],
      instructions: [
        "Cocinar los huevos revueltos a fuego medio con una pizca de sal marina y pimienta negra.",
        "Hidratar la avena con agua caliente o leche vegetal, agregando los arándanos frescos y la miel cruda.",
        "Tostar el pan de masa madre y acompañar con café negro o infusión."
      ]
    },
    {
      name: "Almuerzo Anabólico (Prime Strength Lunch)",
      time: "12:30 – 14:00 PM",
      tag: "Fuerza Estructural",
      summary: "Carne roja magra rica en creatina natural y hierro hemo, acompañada de carbohidratos de absorción limpia.",
      ingredients: [
        { name: "Bife de cuadril / Ojo de bife magro", amount: "250g", protein: 55, carbs: 0, fat: 18, calories: 385 },
        { name: "Batata o boniato asado al horno", amount: "300g", protein: 5, carbs: 62, fat: 1, calories: 260 },
        { name: "Espárragos y brócoli al vapor", amount: "150g", protein: 4, carbs: 8, fat: 0, calories: 50 },
        { name: "Aceite de oliva virgen extra (AOVE)", amount: "15ml", protein: 0, carbs: 0, fat: 14, calories: 125 }
      ],
      instructions: [
        "Sellar el bife en sartén de hierro bien caliente durante 3-4 minutos por lado para preservar jugos y micronutrientes.",
        "Asar la batata en rodajas con especias (romero, pimentón dulce).",
        "Saltear los espárragos y brócoli al dente y rociar con el aceite de oliva en crudo."
      ]
    },
    {
      name: "Combustible Pre/Post-Entreno (Anatoly Fuel)",
      time: "17:00 – 18:30 PM",
      tag: "Ventana de Potencia",
      summary: "Reposición inmediata de energía intracelular y soporte anti-catabólico antes o después del esfuerzo de levantamiento.",
      ingredients: [
        { name: "Yogur griego natural (sin azúcar)", amount: "200g", protein: 20, carbs: 8, fat: 6, calories: 165 },
        { name: "Banana madura", amount: "1 grande (120g)", protein: 1, carbs: 28, fat: 0, calories: 105 },
        { name: "Whey Protein Isolate", amount: "1 scoop (30g)", protein: 27, carbs: 1, fat: 1, calories: 120 },
        { name: "Nueces o almendras tostadas", amount: "30g", protein: 5, carbs: 4, fat: 20, calories: 200 }
      ],
      instructions: [
        "Mezclar el yogur griego con la proteína en polvo hasta lograr textura cremosa homogénea.",
        "Añadir la banana cortada en rodajas y los frutos secos para un crujido saciante."
      ]
    },
    {
      name: "Cena Reparadora (Deep Recovery Dinner)",
      time: "20:30 – 22:00 PM",
      tag: "Regeneración Celular",
      summary: "Pescado azul o pollo con grasas antiinflamatorias y carbohidratos suaves para inducir el sueño reparador y recuperación tendinosa.",
      ingredients: [
        { name: "Salmón a la plancha o pechuga de pollo", amount: "220g", protein: 46, carbs: 0, fat: 16, calories: 330 },
        { name: "Arroz jazmín o quinoa cocida", amount: "200g", protein: 6, carbs: 56, fat: 2, calories: 260 },
        { name: "Aguacate / Palta", amount: "1/2 unidad (80g)", protein: 2, carbs: 6, fat: 12, calories: 130 },
        { name: "Ensalada verde con limón", amount: "100g", protein: 1, carbs: 3, fat: 0, calories: 20 }
      ],
      instructions: [
        "Grillar el salmón con piel crujiente o la pechuga marinada con orégano y ajo.",
        "Servir junto con el arroz caliente y el aguacate en láminas.",
        "Cenar al menos 90 minutos antes de dormir para asegurar una digestión óptima."
      ]
    }
  ],
  ANATOLY_SHRED: [
    {
      name: "Desayuno de Definición (Lean Power)",
      time: "07:30 – 08:30 AM",
      tag: "Control Insulínico",
      summary: "Alta densidad proteica con mínimo impacto glucémico para forzar la lipólisis matutina.",
      ingredients: [
        { name: "Claras de huevo + 2 huevos enteros", amount: "6 claras + 2 huevos", protein: 32, carbs: 1, fat: 10, calories: 230 },
        { name: "Avena en hojuelas", amount: "50g", protein: 7, carbs: 34, fat: 3, calories: 195 },
        { name: "Espinacas baby salteadas", amount: "100g", protein: 3, carbs: 3, fat: 0, calories: 25 },
        { name: "Café negro solo", amount: "1 taza", protein: 0, carbs: 0, fat: 0, calories: 2 }
      ],
      instructions: [
        "Hacer una tortilla esponjosa con las claras, los dos huevos enteros y las espinacas frescas.",
        "Acompañar con un porridge simple de avena con canela en polvo."
      ]
    },
    {
      name: "Almuerzo Estético (Shredded Fuel)",
      time: "13:00 – 14:00 PM",
      tag: "Saciedad Máxima",
      summary: "Volumen vegetal alto con pechuga de pollo magra y carbohidrato complejo medido con precisión.",
      ingredients: [
        { name: "Pechuga de pollo a la plancha", amount: "250g", protein: 58, carbs: 0, fat: 4, calories: 275 },
        { name: "Papas al vapor o batata", amount: "180g", protein: 4, carbs: 36, fat: 0, calories: 155 },
        { name: "Ensalada verde gigante (lechuga, pepino, rúcula)", amount: "250g", protein: 3, carbs: 6, fat: 0, calories: 40 },
        { name: "Aceite de oliva virgen extra", amount: "10ml", protein: 0, carbs: 0, fat: 9, calories: 85 }
      ],
      instructions: [
        "Cocinar la pechuga a la plancha con especias antiinflamatorias (cúrcuma, jengibre, pimienta).",
        "Consumir primero la ensalada abundante para maximizar la distensión gástrica y la saciedad."
      ]
    },
    {
      name: "Pre/Post-Entreno Shred",
      time: "17:30 – 18:30 PM",
      tag: "Preservación Magra",
      summary: "Aislamiento de proteína pura para evitar degradación muscular sin aportar calorías vacías.",
      ingredients: [
        { name: "Whey Protein Isolate", amount: "1.5 scoops (40g)", protein: 36, carbs: 1, fat: 1, calories: 155 },
        { name: "Manzana verde con canela", amount: "1 unidad", protein: 0, carbs: 20, fat: 0, calories: 80 }
      ],
      instructions: [
        "Tomar el batido bien frío inmediatamente al terminar la sesión de fuerza.",
        "Comer la manzana verde para reponer glucógeno hepático con bajo índice glucémico."
      ]
    },
    {
      name: "Cena Ligera y Reparadora",
      time: "20:30 – 21:30 PM",
      tag: "Quema Nocturna",
      summary: "Pescado blanco magro rico en selenio y aminoácidos con vegetales de bajo impacto calórico.",
      ingredients: [
        { name: "Filete de merluza, tilapia o bacalao", amount: "250g", protein: 48, carbs: 0, fat: 3, calories: 220 },
        { name: "Calabacín / Zucchini y brócoli grillados", amount: "200g", protein: 4, carbs: 8, fat: 1, calories: 55 },
        { name: "Aguacate / Palta", amount: "40g", protein: 1, carbs: 3, fat: 6, calories: 65 }
      ],
      instructions: [
        "Cocinar el pescado al horno o vapor con rodajas de limón y eneldo.",
        "Acompañar con los vegetales grillados sin aceite añadido."
      ]
    }
  ],
  RECOMPOSITION: [
    {
      name: "Desayuno Equilibrado de Fuerza",
      time: "07:00 – 08:30 AM",
      tag: "Fuerza Estable",
      summary: "Distribución armónica de proteínas, grasas esenciales y carbohidratos complejos.",
      ingredients: [
        { name: "Huevos enteros de campo", amount: "3 unidades", protein: 18, carbs: 1, fat: 15, calories: 210 },
        { name: "Avena integral", amount: "70g", protein: 9, carbs: 48, fat: 5, calories: 270 },
        { name: "Frutos secos variados", amount: "20g", protein: 4, carbs: 3, fat: 12, calories: 130 },
        { name: "Arándanos frescos", amount: "50g", protein: 0, carbs: 7, fat: 0, calories: 30 }
      ],
      instructions: [
        "Huevos revueltos tiernos con especias al gusto.",
        "Avena cocida al dente decorada con los arándanos y nueces picadas."
      ]
    },
    {
      name: "Almuerzo de Alto Rendimiento",
      time: "12:30 – 14:00 PM",
      tag: "Soporte Muscular",
      summary: "Proteína de alto valor biológico combinada con arroz integral y vegetales crujientes.",
      ingredients: [
        { name: "Bife de ternera o lomo de atún fresco", amount: "220g", protein: 50, carbs: 0, fat: 10, calories: 300 },
        { name: "Arroz integral o quinoa", amount: "220g", protein: 6, carbs: 52, fat: 2, calories: 250 },
        { name: "Verduras mixtas asadas", amount: "150g", protein: 3, carbs: 10, fat: 1, calories: 60 },
        { name: "Aceite de oliva virgen extra", amount: "12ml", protein: 0, carbs: 0, fat: 11, calories: 100 }
      ],
      instructions: [
        "Marcar la carne o atún al punto deseado en plancha bien caliente.",
        "Mezclar con el arroz templado y las verduras horneadas."
      ]
    },
    {
      name: "Snack de Activación Neuromuscular",
      time: "17:00 – 18:00 PM",
      tag: "Recarga Glucídica",
      summary: "Fácil digestibilidad para entrenar con potencia explosiva sin pesadez estomacal.",
      ingredients: [
        { name: "Yogur griego desnatado", amount: "180g", protein: 18, carbs: 7, fat: 1, calories: 110 },
        { name: "Banana mediana", amount: "1 unidad", protein: 1, carbs: 25, fat: 0, calories: 95 },
        { name: "Crema de cacahuete pura 100%", amount: "15g", protein: 4, carbs: 2, fat: 8, calories: 95 }
      ],
      instructions: [
        "Consumir 45 a 60 minutos antes de levantar pesas pesadas."
      ]
    },
    {
      name: "Cena de Reparación Miofibrilar",
      time: "20:30 – 21:45 PM",
      tag: "Síntesis Nocturna",
      summary: "Proteína limpia y carbohidrato moderado para inducir el descanso y optimizar la testosterona nocturna.",
      ingredients: [
        { name: "Pechuga de pollo o lomo de salmón", amount: "200g", protein: 44, carbs: 0, fat: 8, calories: 250 },
        { name: "Batata dulce asada", amount: "160g", protein: 3, carbs: 34, fat: 0, calories: 145 },
        { name: "Ensalada verde con semillas de chía", amount: "120g", protein: 3, carbs: 4, fat: 4, calories: 65 }
      ],
      instructions: [
        "Preparar la proteína con hierbas aromáticas.",
        "Disfrutar de una cena tranquila sin pantallas para fomentar la melatonina natural."
      ]
    }
  ]
};

const GROCERY_CHECKLIST = [
  { category: "Proteínas de Élite", items: ["Huevos camperos (docena)", "Bife de cuadril / Ojo de bife", "Pechuga de pollo sin piel", "Salmón fresco o merluza", "Yogur griego natural sin azúcar", "Whey Protein Isolate"] },
  { category: "Carbohidratos Complejos", items: ["Avena en hojuelas entera", "Batata / Boniato", "Arroz jazmín o basmati", "Pan integral de masa madre", "Bananas maduras y arándanos frescos"] },
  { category: "Grasas Saludables & Vegetales", items: ["Aceite de oliva virgen extra (AOVE)", "Aguacates / Paltas maduras", "Nueces y almendras naturales", "Espinacas frescas y brócoli", "Espárragos trigueros"] },
  { category: "Suplementos Anatoly APS", items: ["Creatina Monohidrato Creapure (5g/día)", "Omega-3 ultra concentrado", "Electrolitos en polvo (Na/K/Mg)", "ZMA nocturno + Vitamina D3 & K2"] }
];

/* ─────────────────── COMPONENT ─────────────────── */

export function NutritionPlanView({ onBack }: { onBack: () => void }) {
  // Athlete calculator inputs
  const [weightKg, setWeightKg] = useState<number>(78);
  const [heightCm, setHeightCm] = useState<number>(178);
  const [age, setAge] = useState<number>(26);
  const [bodyFatPercent, setBodyFatPercent] = useState<number | "">("");
  const [activityLevel, setActivityLevel] = useState<ActivityLevelKey>("moderate");
  const [selectedGoal, setSelectedGoal] = useState<AnatolyGoalKey>("POWER_BULK");

  // Accordion state for meals
  const [openMealIndex, setOpenMealIndex] = useState<number | null>(0);

  // Grocery checklist state
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCheckItem = (item: string) => {
    setCheckedItems(prev => ({ ...prev, [item]: !prev[item] }));
  };

  // Live APS Nutrition calculation
  const apsNutrition = useMemo(() => {
    return calculateApsNutrition({
      weightKg,
      heightCm,
      age,
      bodyFatPercent: bodyFatPercent === "" ? null : Number(bodyFatPercent),
      activityLevel,
      goal: selectedGoal
    });
  }, [weightKg, heightCm, age, bodyFatPercent, activityLevel, selectedGoal]);

  const activeRecipes = ANATOLY_RECIPES[selectedGoal] || ANATOLY_RECIPES.POWER_BULK;

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-zinc-100">
      {/* ── HEADER / TOP BAR ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all text-xs font-semibold tracking-wider uppercase border border-zinc-800 hover:border-zinc-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Coach</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            APS ANATOLY POWER SYSTEM
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1.5">
            <Shield className="w-3 h-3" />
            BIO-COMBUSTIBLE
          </span>
        </div>
      </div>

      {/* ── CINEMATIC HERO BANNER ── */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950 shadow-2xl">
        <div className="relative h-48 sm:h-64 w-full">
          <Image
            src="/anatoly/anatoly_nutrition_feast.jpg"
            alt="Banquete de Fuerza Anatoly Power System"
            fill
            className="object-cover opacity-60 mix-blend-luminosity hover:opacity-75 transition-opacity duration-700"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-black tracking-widest uppercase mb-1">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Nutrición Atlética de Élite</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white uppercase">
            EL COMBUSTIBLE DE <span className="text-amber-400">ANATOLY</span> & <span className="text-green-400">ATP STRENGTH</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
            Sin dietas extremas ni restricciones vacías. Alimentos enteros, proteína de alta pureza biológica y sincronización de carbohidratos para resíntesis máxima de fosfocreatina y fuerza explosiva.
          </p>
        </div>
      </div>

      {/* ── GOAL SELECTOR TABS ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <Target className="w-3.5 h-3.5 text-amber-400" />
            <span>Selecciona tu Objetivo Anatoly</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(Object.keys(ANATOLY_GOALS) as AnatolyGoalKey[]).map((key) => {
            const goal = ANATOLY_GOALS[key];
            const isSelected = selectedGoal === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedGoal(key)}
                className={`flex flex-col text-left p-4 rounded-xl border transition-all ${
                  isSelected
                    ? "bg-amber-500/10 border-amber-500 text-white shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30"
                    : "bg-zinc-950/80 border-zinc-900 text-zinc-400 hover:border-zinc-800 hover:text-zinc-200"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-black tracking-wider uppercase">{goal.name}</span>
                  {isSelected && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <p className="mt-1 text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                  {goal.description}
                </p>
                <div className="mt-2 text-[10px] font-mono text-amber-400/80 font-semibold">
                  {goal.proteinPerKg}g proteína/kg • {key === "POWER_BULK" ? "+15% Superávit" : key === "ANATOLY_SHRED" ? "-18% Déficit" : "100% TDEE"}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── INTERACTIVE APS MACRO CALCULATOR ── */}
      <div className="p-5 sm:p-6 rounded-2xl bg-zinc-950 border border-zinc-900 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-zinc-900/80 pb-4">
          <div>
            <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" />
              <span>Calculadora Anatoly de Macros & Calorías Diarias</span>
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Personalizado en tiempo real según tu peso corporal, composición y volumen de sobrecarga.
            </p>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            FÓRMULA: MIFFLIN / KATCH-MCARDLE
          </span>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Peso (kg)</label>
            <input
              type="number"
              min={35}
              max={220}
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value) || 75)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Altura (cm)</label>
            <input
              type="number"
              min={120}
              max={230}
              value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value) || 175)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Edad</label>
            <input
              type="number"
              min={15}
              max={85}
              value={age}
              onChange={(e) => setAge(Number(e.target.value) || 26)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">% Grasa (Opcional)</label>
            <input
              type="number"
              min={4}
              max={45}
              placeholder="Ej: 14"
              value={bodyFatPercent}
              onChange={(e) => setBodyFatPercent(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Actividad</label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value as ActivityLevelKey)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
            >
              <option value="sedentary">Sedentario (x1.2)</option>
              <option value="light">Ligero 1-2 d (x1.37)</option>
              <option value="moderate">Moderado 3-4 d (x1.55)</option>
              <option value="heavy">Intenso 5-6 d (x1.72)</option>
              <option value="elite">Élite / 2x Día (x1.9)</option>
            </select>
          </div>
        </div>

        {/* Dynamic Macro Dashboard Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {/* Calories */}
          <div className="col-span-2 sm:col-span-1 p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/30 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Calorías Meta</span>
            </span>
            <div className="mt-2">
              <span className="text-2xl font-black font-mono text-white">{apsNutrition.targetCalories}</span>
              <span className="text-xs text-amber-400/80 ml-1">kcal</span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono mt-1">TDEE: {apsNutrition.tdee} kcal</span>
          </div>

          {/* Protein */}
          <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
              <Beef className="w-3.5 h-3.5 text-red-400" />
              <span>Proteína</span>
            </span>
            <div className="mt-2">
              <span className="text-2xl font-black font-mono text-white">{apsNutrition.proteinGrams}</span>
              <span className="text-xs text-red-400 ml-1">g</span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono mt-1">
              {Math.round(apsNutrition.proteinGrams * 4)} kcal
            </span>
          </div>

          {/* Carbs */}
          <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1">
              <Wheat className="w-3.5 h-3.5 text-yellow-400" />
              <span>Carbohidratos</span>
            </span>
            <div className="mt-2">
              <span className="text-2xl font-black font-mono text-white">{apsNutrition.carbsGrams}</span>
              <span className="text-xs text-yellow-400 ml-1">g</span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono mt-1">
              {Math.round(apsNutrition.carbsGrams * 4)} kcal
            </span>
          </div>

          {/* Fats */}
          <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-emerald-400" />
              <span>Grasas</span>
            </span>
            <div className="mt-2">
              <span className="text-2xl font-black font-mono text-white">{apsNutrition.fatGrams}</span>
              <span className="text-xs text-emerald-400 ml-1">g</span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono mt-1">
              {Math.round(apsNutrition.fatGrams * 9)} kcal
            </span>
          </div>

          {/* Water */}
          <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-sky-400" />
              <span>Hidratación</span>
            </span>
            <div className="mt-2">
              <span className="text-2xl font-black font-mono text-white">{apsNutrition.waterLiters}</span>
              <span className="text-xs text-sky-400 ml-1">L</span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono mt-1">+750ml entreno</span>
          </div>
        </div>
      </div>

      {/* ── ANATOLY DAILY MEALS & RECIPES ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <div>
            <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-amber-400" />
              <span>Planes de Comida Diarios Anatoly ({apsNutrition.goalInfo.name})</span>
            </h2>
            <p className="text-[11px] text-zinc-400">
              Desglose de platos exactos, ingredientes y distribución calórica por franja horaria.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {activeRecipes.map((meal, idx) => {
            const isOpen = openMealIndex === idx;
            const targetMeal = apsNutrition.mealBreakdown[idx] || { calories: 0, protein: 0, carbs: 0, fat: 0 };

            return (
              <div
                key={meal.name}
                className="rounded-xl border border-zinc-900 bg-zinc-950 overflow-hidden transition-all"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => setOpenMealIndex(isOpen ? null : idx)}
                  className="w-full p-4 flex items-center justify-between hover:bg-zinc-900/40 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-amber-400 font-mono font-bold text-xs">
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-white">{meal.name}</span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {meal.tag}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-400 font-mono">{meal.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-3 text-xs font-mono">
                      <span className="text-zinc-300 font-bold">{targetMeal.calories} kcal</span>
                      <span className="text-red-400">{targetMeal.protein}g P</span>
                      <span className="text-yellow-400">{targetMeal.carbs}g C</span>
                      <span className="text-emerald-400">{targetMeal.fat}g G</span>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                  </div>
                </button>

                {/* Accordion Body */}
                {isOpen && (
                  <div className="p-4 sm:p-5 border-t border-zinc-900 bg-zinc-950/60 space-y-4 animate-fade-in">
                    <p className="text-xs text-zinc-300 italic">{meal.summary}</p>

                    {/* Ingredients List */}
                    <div>
                      <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Ingredientes & Porciones</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {meal.ingredients.map((ing) => (
                          <div
                            key={ing.name}
                            className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between text-xs"
                          >
                            <span className="font-medium text-zinc-200">{ing.name}</span>
                            <span className="text-[11px] font-mono font-semibold text-amber-400">{ing.amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Preparation Instructions */}
                    <div>
                      <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Instrucciones Anatoly</h4>
                      <ul className="space-y-1.5 text-xs text-zinc-300">
                        {meal.instructions.map((inst, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-amber-400 font-bold">•</span>
                            <span>{inst}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ANATOLY 5-PILLAR SUPPLEMENT STACK ── */}
      <div className="p-5 sm:p-6 rounded-2xl bg-zinc-950 border border-zinc-900 shadow-xl space-y-4">
        <div className="border-b border-zinc-900 pb-3">
          <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
            <Pill className="w-4 h-4 text-amber-400" />
            <span>Pila Estratégica de Suplementación Anatoly (APS Stack)</span>
          </h2>
          <p className="text-[11px] text-zinc-400">
            Los suplementos son secundarios a la comida real. Esta pila seleccionada optimiza la recuperación y soporte articular.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {ANATOLY_SUPPLEMENT_STACK.map((supp) => (
            <div
              key={supp.name}
              className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 flex flex-col justify-between hover:border-amber-500/40 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white">{supp.name}</span>
                  <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                    {supp.tag}
                  </span>
                </div>
                <div className="text-xs font-mono text-amber-400 font-semibold mb-2">
                  Dosis: {supp.dose} • {supp.timing}
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  {supp.purpose}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SMART GROCERY CHECKLIST ── */}
      <div className="p-5 sm:p-6 rounded-2xl bg-zinc-950 border border-zinc-900 shadow-xl space-y-4">
        <div className="border-b border-zinc-900 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-green-400" />
              <span>Lista de Compras del Atleta Anatoly</span>
            </h2>
            <p className="text-[11px] text-zinc-400">
              Marca los alimentos adquiridos para tu semana de entrenamiento y nutrición de poder.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {GROCERY_CHECKLIST.map((group) => (
            <div key={group.category} className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-900 space-y-2.5">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                {group.category}
              </h3>
              <div className="space-y-1.5">
                {group.items.map((item) => {
                  const isChecked = !!checkedItems[item];
                  return (
                    <button
                      key={item}
                      onClick={() => toggleCheckItem(item)}
                      className="w-full flex items-center gap-2.5 text-left text-xs py-1 px-1.5 rounded hover:bg-zinc-800/40 transition-colors"
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-green-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-zinc-500 shrink-0" />
                      )}
                      <span className={isChecked ? "line-through text-zinc-500" : "text-zinc-200"}>
                        {item}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
