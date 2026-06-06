"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  }

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-16 left-0 right-0 z-50 mx-4 rounded-lg border bg-background p-4 shadow-lg md:mx-auto md:max-w-md">
      <div className="flex items-center gap-3">
        <Download className="h-5 w-5 text-primary" />
        <div className="flex-1">
          <p className="font-semibold text-sm">Install Masoko App</p>
          <p className="text-xs text-muted-foreground">
            Add to your home screen for quick access
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleInstall}>
            Install
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowPrompt(false)}
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}