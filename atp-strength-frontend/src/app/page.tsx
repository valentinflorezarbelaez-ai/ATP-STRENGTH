"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import ForgeLanding from "@/app/forge/page";
import {
  getAudioPreferences,
  getAvailableSpanishVoices,
  saveAudioPreferences,
  setVoiceGender,
} from "@/lib/acousticFeedback";

const COACH_VOICE_PROFILE_KEY = "atp_coach_voice_profile";
const COACH_VOICE_PROFILE = "female-neural-v1";

/**
 * Places a distinct female neural coach voice (lazy hydration, no setState-in-effect).
 * One-shot migration so a previously locked AUTO/male URI is replaced.
 * Athletes can still toggle to male from the cockpit afterwards.
 */
function seedDistinctCoachVoice(): void {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem(COACH_VOICE_PROFILE_KEY) === COACH_VOICE_PROFILE) {
      return;
    }

    const prefs = getAudioPreferences();
    const femaleVoices = getAvailableSpanishVoices("FEMALE");
    const currentUri = prefs.preferredVoiceURI || "";
    const alternate =
      femaleVoices.find((voice) => voice.voiceURI !== currentUri) ||
      femaleVoices[0];

    if (alternate) {
      saveAudioPreferences({
        voiceGender: "FEMALE",
        preferredVoiceURI: alternate.voiceURI,
        voicePitch: 1.02,
      });
    } else {
      setVoiceGender("FEMALE");
    }

    localStorage.setItem(COACH_VOICE_PROFILE_KEY, COACH_VOICE_PROFILE);
  } catch {
    // localStorage or SpeechSynthesis may be unavailable during hydration
  }
}

const ZenDashboardClient = dynamic(
  () =>
    import("@/app/components/ZenDashboardClient").then(
      (mod) => mod.ZenDashboardClient
    ),
  {
    ssr: false,
    loading: () => (
      <main className="min-h-screen bg-black text-zinc-100 flex flex-col items-center justify-center p-4">
        <div className="flex items-center gap-3 animate-pulse">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40" />
          <span className="text-sm font-mono tracking-widest text-amber-400">
            CARGANDO MOTOR ZEN...
          </span>
        </div>
      </main>
    ),
  }
);

export default function ZenDashboard() {
  const [showIntro, setShowIntro] = useState(() => {
    seedDistinctCoachVoice();
    if (typeof window !== "undefined") {
      return localStorage.getItem("hasEnteredTemple") !== "true";
    }
    return false;
  });

  const handleEnter = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hasEnteredTemple", "true");
    }
    setShowIntro(false);
  };

  if (showIntro) {
    return <ForgeLanding onEnterDirect={handleEnter} />;
  }

  return <ZenDashboardClient />;
}
