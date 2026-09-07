"use client";

import { useZenDashboard } from "@/app/hooks/useZenDashboard";
import { ZenDashboardView } from "@/app/components/ZenDashboardView";
import { CoachGuidedView } from "@/app/components/CoachGuidedView";

/**
 * ZenDashboardClient
 * Client component executing in the browser context with direct access to localStorage.
 * Handles view switching between CoachGuidedView and ZenDashboardView without hydration mismatch.
 */
export function ZenDashboardClient() {
  const d = useZenDashboard();
  return d.coachMode ? <CoachGuidedView d={d} /> : <ZenDashboardView d={d} />;
}
