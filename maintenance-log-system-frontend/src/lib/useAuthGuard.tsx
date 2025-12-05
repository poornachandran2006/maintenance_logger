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

        // ⭐ If logged-in user tries to visit signin/signup → redirect to /home
        if (PUBLIC_ROUTES.includes(pathname)) {
          router.replace("/home");
        }
      } catch (err) {
        setUser(null);

        // ⭐ If not logged in and on a private page → redirect to signin
        if (!PUBLIC_ROUTES.includes(pathname)) {
          router.replace("/signin");
        }
      } finally {
        // ⭐ VERY IMPORTANT — show loading spinner until check completes
        setLoading(true);
        setTimeout(() => setLoading(false), 300); // small delay for smooth UI
      }
    }

    validateSession();
  }, [pathname, router]);

  return { user, loading };
}
