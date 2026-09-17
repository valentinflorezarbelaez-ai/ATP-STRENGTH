"use client";

import { useState } from "react";
import { useZenDashboard } from "@/app/hooks/useZenDashboard";
import { ZenDashboardView } from "@/app/components/ZenDashboardView";
import { CoachGuidedView } from "@/app/components/CoachGuidedView";
import { SpotifyTrainingView } from "@/app/components/SpotifyTrainingView";
import { ErrorBoundary } from "@/app/components/ErrorBoundary";

/**
 * ZenDashboardClient
 * Client component executing in the browser context with direct access to localStorage.
 * Handles view switching between CoachGuidedView, ZenDashboardView, and SpotifyTrainingView
 * without hydration mismatch.
 */
export function ZenDashboardClient() {
  const d = useZenDashboard();
  const [showSpotify, setShowSpotify] = useState(false);

  if (showSpotify) {
    return (
      <ErrorBoundary>
        <SpotifyTrainingView onBack={() => setShowSpotify(false)} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      {d.coachMode ? (
        <CoachGuidedView d={d} onShowSpotify={() => setShowSpotify(true)} />
      ) : (
        <ZenDashboardView d={d} onShowSpotify={() => setShowSpotify(true)} />
      )}
    </ErrorBoundary>
  );
}
