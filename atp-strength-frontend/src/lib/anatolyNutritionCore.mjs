/**
 * Anatoly Power System (APS) — Pure Domain Nutrition Engine (SPEC-0006)
 * Calculates BMR, TDEE, macronutrient distributions, and hydration for elite athletic goals.
 * Zero external dependencies.
 */

export const ANATOLY_GOALS = {
  POWER_BULK: {
    id: "POWER_BULK",
    name: "Power Bulk (Fuerza & Masa)",
    multiplier: 1.15, // +15% caloric surplus
    proteinPerKg: 2.2,
    fatPerKg: 0.9,
    description: "Superávit anabólico limpio para maximizar fuerza bruta, soporte de cargas submáximas y resíntesis de fosfocreatina."
  },
  ANATOLY_SHRED: {
    id: "ANATOLY_SHRED",
    name: "Anatoly Shred (Definición Estética)",
    multiplier: 0.82, // -18% caloric deficit
    proteinPerKg: 2.4,
    fatPerKg: 0.7,
    description: "Déficit controlado con alta proteína para proteger tejido muscular magro mientras se eliminan depósitos adiposos."
  },
  RECOMPOSITION: {
    id: "RECOMPOSITION",
    name: "Recomposición & Potencia",
    multiplier: 1.0, // Maintenance
    proteinPerKg: 2.2,
    fatPerKg: 0.8,
    description: "Balance iso-energético óptimo para ganar fuerza neuromuscular y densidad sin alterar el peso corporal de competencia."
  }
};

export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55, // 3-4 heavy sessions/week (Standard APS)
  heavy: 1.725,    // 5-6 powerlifting/calisthenics sessions
  elite: 1.9       // Competitive athlete double sessions
};

/**
 * Calculates Base Metabolic Rate (BMR) via Katch-McArdle or Mifflin-St Jeor.
 */
export function calculateBmr(params) {
  const { weightKg = 75, heightCm = 175, age = 26, bodyFatPercent = null } = params || {};
  const safeWeight = Math.max(30, Math.min(250, Number(weightKg) || 75));
  const safeHeight = Math.max(100, Math.min(250, Number(heightCm) || 175));
  const safeAge = Math.max(14, Math.min(90, Number(age) || 26));

  if (bodyFatPercent !== null && bodyFatPercent > 3 && bodyFatPercent < 50) {
    const lbm = safeWeight * (1 - bodyFatPercent / 100);
    return Math.round(370 + 21.6 * lbm);
  }

  // Mifflin-St Jeor (Male standard base)
  return Math.round(10 * safeWeight + 6.25 * safeHeight - 5 * safeAge + 5);
}

/**
 * Calculates Total Daily Energy Expenditure (TDEE).
 */
export function calculateTdee(params) {
  const bmr = calculateBmr(params);
  const factor = ACTIVITY_MULTIPLIERS[params.activityLevel] || ACTIVITY_MULTIPLIERS.moderate;
  return Math.round(bmr * factor);
}

/**
 * Computes exact daily macronutrient targets based on athlete parameters and APS goal.
 */
export function calculateApsNutrition({
  weightKg = 75,
  heightCm = 175,
  age = 26,
  bodyFatPercent = null,
  activityLevel = "moderate",
  goal = "POWER_BULK"
}) {
  const safeWeight = Math.max(30, Math.min(250, Number(weightKg) || 75));
  const selectedGoal = ANATOLY_GOALS[goal] || ANATOLY_GOALS.POWER_BULK;
  
  const bmr = calculateBmr({ weightKg: safeWeight, heightCm, age, bodyFatPercent });
  const tdee = calculateTdee({ weightKg: safeWeight, heightCm, age, bodyFatPercent, activityLevel });
  
  const targetCalories = Math.round(tdee * selectedGoal.multiplier);
  
  const proteinGrams = Math.round(safeWeight * selectedGoal.proteinPerKg);
  const fatGrams = Math.round(safeWeight * selectedGoal.fatPerKg);
  
  const proteinCalories = proteinGrams * 4;
  const fatCalories = fatGrams * 9;
  
  const remainingCalories = Math.max(0, targetCalories - (proteinCalories + fatCalories));
  const carbsGrams = Math.round(remainingCalories / 4);

  // Hydration calculation: 35ml/kg baseline + 750ml training compensation
  const waterLiters = Number(((safeWeight * 35 + 750) / 1000).toFixed(1));

  return {
    bmr,
    tdee,
    targetCalories,
    proteinGrams,
    carbsGrams,
    fatGrams,
    waterLiters,
    goalInfo: selectedGoal,
    mealBreakdown: [
      {
        name: "Desayuno de Poder",
        time: "07:00 - 08:30",
        calories: Math.round(targetCalories * 0.25),
        protein: Math.round(proteinGrams * 0.25),
        carbs: Math.round(carbsGrams * 0.25),
        fat: Math.round(fatGrams * 0.25)
      },
      {
        name: "Almuerzo Anabólico",
        time: "12:30 - 14:00",
        calories: Math.round(targetCalories * 0.35),
        protein: Math.round(proteinGrams * 0.35),
        carbs: Math.round(carbsGrams * 0.35),
        fat: Math.round(fatGrams * 0.35)
      },
      {
        name: "Combustible Pre/Post-Entreno",
        time: "17:00 - 18:30",
        calories: Math.round(targetCalories * 0.20),
        protein: Math.round(proteinGrams * 0.20),
        carbs: Math.round(carbsGrams * 0.20),
        fat: Math.round(fatGrams * 0.20)
      },
      {
        name: "Cena Reparadora",
        time: "20:30 - 22:00",
        calories: Math.round(targetCalories * 0.20),
        protein: Math.round(proteinGrams * 0.20),
        carbs: Math.round(carbsGrams * 0.20),
        fat: Math.round(fatGrams * 0.20)
      }
    ]
  };
}

export const ANATOLY_SUPPLEMENT_STACK = [
  {
    name: "Creatina Monohidrato (Creapure)",
    dose: "5g diarios",
    timing: "Post-entreno o con el desayuno",
    purpose: "Saturación intracelular de fosfocreatina para resíntesis explosiva de ATP en series de 1 a 5 repeticiones pesadas.",
    tag: "Esencial"
  },
  {
    name: "Whey Protein Isolate",
    dose: "25g - 30g",
    timing: "Inmediatamente post-entreno",
    purpose: "Entrega veloz de aminoácidos esenciales y leucina para iniciar la síntesis proteica miofibrilar (mTOR).",
    tag: "Recuperación"
  },
  {
    name: "Omega-3 Concentrado (EPA / DHA)",
    dose: "2g - 3g diarios",
    timing: "Con el almuerzo o cena",
    purpose: "Protección articular antiinflamatoria, salud cardiovascular y fluidez de membrana neuromuscular.",
    tag: "Longevidad Articular"
  },
  {
    name: "Complejo de Electrolitos (Na/K/Mg)",
    dose: "1 dosis en 750ml agua",
    timing: "Intra-entrenamiento",
    purpose: "Optimización de la bomba sodio-potasio y prevención de fatiga o calambres en esfuerzo concéntrico máximo.",
    tag: "Conductividad Nerviosa"
  },
  {
    name: "ZMA + Vitamina D3 & K2",
    dose: "1 dosis nocturna",
    timing: "30-45 min antes de dormir",
    purpose: "Profundidad del sueño REM, regulación de testosterona libre y calcificación ósea adaptativa a la sobrecarga.",
    tag: "Regeneración Hormonal"
  }
];
