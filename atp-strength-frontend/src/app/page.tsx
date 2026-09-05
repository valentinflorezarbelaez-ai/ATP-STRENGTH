"use client";

import { useZenDashboard } from "@/app/hooks/useZenDashboard";
import { ZenDashboardView } from "@/app/components/ZenDashboardView";
import { CoachGuidedView } from "@/app/components/CoachGuidedView";

/**
 * Presentation container
 * Seamlessly switches between CoachGuidedView (warm, step-by-step guidance)
 * and ZenDashboardView (dense analytical pro dashboard).
 */
export default function ZenDashboard() {
  const d = useZenDashboard();
  return d.coachMode ? <CoachGuidedView d={d} /> : <ZenDashboardView d={d} />;
}
