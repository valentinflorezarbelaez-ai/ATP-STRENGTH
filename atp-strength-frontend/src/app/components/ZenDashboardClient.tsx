"use client";

import { useState } from "react";
import { useZenDashboard } from "@/app/hooks/useZenDashboard";
import { ZenDashboardView } from "@/app/components/ZenDashboardView";
import { CoachGuidedView } from "@/app/components/CoachGuidedView";
import { NutritionPlanView } from "@/app/components/NutritionPlanView";
import { ErrorBoundary } from "@/app/components/ErrorBoundary";

/**
 * ZenDashboardClient
 * Client component executing in the browser context with direct access to localStorage.
 * Handles view switching between CoachGuidedView, ZenDashboardView, and NutritionPlanView
 * without hydration mismatch.
 */
export function ZenDashboardClient() {
  const d = useZenDashboard();
  const [showNutrition, setShowNutrition] = useState(false);

  if (showNutrition) {
    return (
      <ErrorBoundary>
        <NutritionPlanView onBack={() => setShowNutrition(false)} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      {d.coachMode ? (
        <CoachGuidedView d={d} onShowNutrition={() => setShowNutrition(true)} />
      ) : (
        <ZenDashboardView d={d} onShowNutrition={() => setShowNutrition(true)} />
      )}
    </ErrorBoundary>
  );
}
