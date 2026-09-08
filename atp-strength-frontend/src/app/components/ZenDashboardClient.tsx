"use client";

import { useZenDashboard } from "@/app/hooks/useZenDashboard";
import { ZenDashboardView } from "@/app/components/ZenDashboardView";
import { CoachGuidedView } from "@/app/components/CoachGuidedView";
import { ErrorBoundary } from "@/app/components/ErrorBoundary";

/**
 * ZenDashboardClient
 * Client component executing in the browser context with direct access to localStorage.
 * Handles view switching between CoachGuidedView and ZenDashboardView without hydration mismatch.
 */
export function ZenDashboardClient() {
  const d = useZenDashboard();
  return (
    <ErrorBoundary>
      {d.coachMode ? <CoachGuidedView d={d} /> : <ZenDashboardView d={d} />}
    </ErrorBoundary>
  );
}
