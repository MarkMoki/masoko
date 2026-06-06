"use client";

import { useEffect } from "react";

export function usePWA() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return {
    isInstalled: () =>
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true,
  };
}