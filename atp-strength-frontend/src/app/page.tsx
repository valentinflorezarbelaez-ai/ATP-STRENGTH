"use client";

import { useZenDashboard } from "@/app/hooks/useZenDashboard";
import { ZenDashboardView } from "@/app/components/ZenDashboardView";

/** Presentation container — state/hooks live in useZenDashboard; UI in ZenDashboardView. */
export default function ZenDashboard() {
  const d = useZenDashboard();
  return <ZenDashboardView d={d} />;
}
