"use client";

import { useZenDashboard } from "@/app/hooks/useZenDashboard";
import { ZenDashboardView } from "@/app/components/ZenDashboardView";
import { CoachGuidedView } from "@/app/components/CoachGuidedView";
import { ErrorBoundary } from "@/app/components/ErrorBoundary";

/**
 * ZenDashboardClient
 * Client component executing in the browser context with direct access to localStorage.
 * Handles view switching between CoachGuidedView and ZenDashboardView.
 * The Spotify button now directly opens Spotify (https://open.spotify.com/intl-es).
 */
export function ZenDashboardClient({ onOpenForge }: { onOpenForge?: () => void }) {
  const d = useZenDashboard();

  const handleOpenSpotifyDirect = () => {
    try {
      window.location.href = "spotify:";
    } catch {}
    window.open("https://open.spotify.com/intl-es", "_blank", "noopener,noreferrer");
  };

  return (
    <ErrorBoundary>
      {d.coachMode ? (
        <CoachGuidedView
          d={d}
          onShowSpotify={handleOpenSpotifyDirect}
          onOpenForge={onOpenForge}
        />
      ) : (
        <ZenDashboardView
          d={d}
          onShowSpotify={handleOpenSpotifyDirect}
          onOpenForge={onOpenForge}
        />
      )}
    </ErrorBoundary>
  );
}
