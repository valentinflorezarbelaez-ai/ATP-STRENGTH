"use client";

import React, { useEffect, useState } from "react";
import { Download, Share, CheckCircle2, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIosTip, setShowIosTip] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[PWA] Service Worker registrado con alcance:", reg.scope);
        })
        .catch((err) => {
          console.warn("[PWA] Fallo al registrar Service Worker:", err);
        });
    }

    // 2. Check standalone display mode
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    // 3. Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setIsIOS(isIosDevice);

    // 4. Capture beforeinstallprompt (Chromium / Android / Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIosTip(true);
    }
  };

  // If already running standalone or installed or dismissed, don't show the prompt
  if (isStandalone || installed || dismissed) {
    return null;
  }

  // Show if either deferredPrompt is available OR if on iOS (and not standalone)
  if (!deferredPrompt && !isIOS) {
    return null;
  }

  return (
    <>
      <div className="w-full max-w-6xl mb-4">
        <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-amber-950/40 via-zinc-900 to-black border border-amber-500/30 rounded-xl shadow-lg shadow-amber-950/20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-wide">
                Instalar NEURO//STRENGTH
              </p>
              <p className="text-xs text-zinc-400">
                Acceso táctil directo, pantalla completa Zen y resíntesis de ATP offline.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-black rounded-lg transition-all transform active:scale-95 cursor-pointer shadow-md shadow-amber-500/20"
            >
              {isIOS ? "Ver cómo instalar" : "Instalar"}
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 text-zinc-500 hover:text-zinc-300 rounded-lg transition-colors cursor-pointer"
              title="Cerrar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal / Tip para iOS Safari */}
      {showIosTip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-sm w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold uppercase tracking-widest text-amber-400">
                Instalar en iOS Safari
              </span>
              <button
                onClick={() => setShowIosTip(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed">
              Para instalar la experiencia completa e inmersiva de NEURO//STRENGTH:
            </p>

            <ol className="text-xs text-zinc-400 space-y-3 font-mono">
              <li className="flex items-center gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  1
                </span>
                <span>
                  Toca el botón <Share className="w-3.5 h-3.5 inline mx-1 text-white" />{" "}
                  <strong>Compartir</strong> en la barra de Safari.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  2
                </span>
                <span>
                  Baja y selecciona <strong>&quot;Agregar a pantalla de inicio&quot;</strong>.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
                <span>¡Listo! Ábrela desde tu pantalla de inicio como una App nativa.</span>
              </li>
            </ol>

            <button
              onClick={() => setShowIosTip(false)}
              className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-mono font-bold tracking-wider transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
