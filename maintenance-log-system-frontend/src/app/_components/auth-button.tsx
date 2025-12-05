"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiLogIn, FiLogOut } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiGet, apiPost } from "@/lib/api";

interface AuthButtonProps {
  darkMode: boolean;
}

export default function AuthButton({ darkMode }: AuthButtonProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Check session correctly using /auth/me
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await apiGet("/auth/me");
        if (res?.user) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch {
        setIsLoggedIn(false);
      }
    }

    checkAuth();
  }, []);

  // Logout user
  const handleLogout = async () => {
    setLoading(true);
    try {
      await apiPost("/auth/logout");
      toast.success("Logged out successfully!");

      setIsLoggedIn(false);
      router.push("/signin");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Logout failed");
    } finally {
      setLoading(false);
    }
  };

  // If logged in → Show LOG OUT
  if (isLoggedIn) {
    return (
      <button
        onClick={handleLogout}
        disabled={loading}
        className={`flex items-center space-x-2 border px-4 py-2 rounded-lg transition-colors cursor-pointer ${
          darkMode
            ? "border-gray-600 hover:bg-gray-800"
            : "border-gray-300 hover:bg-gray-100"
        } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
      >
        <FiLogOut className="h-5 w-5" />
        <span>{loading ? "Logging out..." : "Log Out"}</span>
      </button>
    );
  }

  // If not logged in → Show SIGN IN
  return (
    <Link href="/signin">
      <button
        className={`flex items-center space-x-2 border px-4 py-2 rounded-lg transition-colors cursor-pointer ${
          darkMode
            ? "border-gray-600 hover:bg-gray-800"
            : "border-gray-300 hover:bg-gray-100"
        }`}
      >
        <FiLogIn className="h-5 w-5" />
        <span>Sign In</span>
      </button>
    </Link>
  );
}
