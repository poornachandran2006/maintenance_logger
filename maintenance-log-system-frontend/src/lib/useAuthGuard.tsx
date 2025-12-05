"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { apiGet } from "./api";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function useAuthGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const PUBLIC_ROUTES = ["/signin", "/signup"];

  useEffect(() => {
    async function validateSession() {
      try {
        const res = await apiGet<{ user: AuthUser }>("/auth/me");
        setUser(res.user);

        // ------------------------------
        // ⭐ NEW LOGIC:
        // Logged-in users should NOT see /signin or /signup
        // ------------------------------
        if (PUBLIC_ROUTES.includes(pathname)) {
          router.replace("/home");
        }

      } catch (err) {
        // User NOT logged in
        setUser(null);

        // If the user visits ANY private route → send to signin
        if (!PUBLIC_ROUTES.includes(pathname)) {
          router.replace("/signin");
        }

      } finally {
        setLoading(false);
      }
    }

    validateSession();
  }, [pathname, router]);

  return { user, loading };
}
