"use client";

import { useZenDashboard } from "@/app/hooks/useZenDashboard";
import { ZenDashboardView } from "@/app/components/ZenDashboardView";
import { CoachGuidedView } from "@/app/components/CoachGuidedView";
import { ErrorBoundary } from "@/app/components/ErrorBoundary";

/**
 * ZenDashboardClient
 * Client component executing in the browser context with direct access to localStorage.
 * Handles view switching between CoachGuidedView and ZenDashboardView.
 * Supports athlete switching and Spotify integration.
 */
export function ZenDashboardClient({
  onOpenForge,
  onSwitchAthlete,
}: {
  onOpenForge?: () => void;
  onSwitchAthlete?: () => void;
}) {
  const d = useZenDashboard();

  const handleOpenSpotifyDirect = () => {
    try {
      window.location.href = "spotify:";
    } catch {}
    window.open("https://open.spotify.com/intl-es", "_blank", "noopener,noreferrer");
  };

  const handleSwitchAthleteOrOpenGate = () => {
    if (onSwitchAthlete) {
      onSwitchAthlete();
    } else {
      const nextId = d.activeAthleteId === "valentin" ? "jacobo" : "valentin";
      d.switchAthlete(nextId);
    }
  };

  return (
    <ErrorBoundary>
      {d.coachMode ? (
        <CoachGuidedView
          d={d}
          onShowSpotify={handleOpenSpotifyDirect}
          onOpenForge={onOpenForge}
          onSwitchAthlete={handleSwitchAthleteOrOpenGate}
        />
      ) : (
        <ZenDashboardView
          d={d}
          onShowSpotify={handleOpenSpotifyDirect}
          onOpenForge={onOpenForge}
          onSwitchAthlete={handleSwitchAthleteOrOpenGate}
        />
      )}
    </ErrorBoundary>
  );
}
