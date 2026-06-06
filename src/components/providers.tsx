"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ToastProvider } from "@/hooks/use-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return (
    <QueryClientProvider client={client}>
      <ToastProvider>
        {children}
      </ToastProvider>
    </QueryClientProvider>
  );
}
