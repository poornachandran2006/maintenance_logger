"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet } from "./api";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

/**
 * useAuthGuard (middleware-friendly)
 *
 * - DOES NOT redirect. Middleware / server pages handle redirects.
 * - Loads current user via GET /auth/me (uses cookie via apiGet which includes credentials).
 * - Exposes `refreshAuth()` so callers can re-check after login/logout.
 */
export default function useAuthGuard() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await apiGet<{ user: AuthUser }>("/auth/me");
      if (signal?.aborted) return;
      setUser(res?.user ?? null);
    } catch (err) {
      if (signal?.aborted) return;
      setUser(null);
    } finally {
      if (signal && signal.aborted) return;
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetchUser(controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchUser]);

  // Refresh helper for consumers
  const refreshAuth = useCallback(async () => {
    setLoading(true);
    try {
      await fetchUser();
    } finally {
      // fetchUser sets loading=false in finally, but keep this as safe fallback
      setLoading(false);
    }
  }, [fetchUser]);

  return { user, loading, refreshAuth };
}
