"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Session = {
  userId: string;
  role: string;
};

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    apiFetch<Session>("/api/auth/me")
      .then(setSession)
      .catch(() => setSession(null));
  }, []);

  return session;
}