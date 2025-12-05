"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import useAuthGuard from "@/lib/useAuthGuard";
import { apiPost } from "@/lib/api";

export default function Dashboard() {
  const router = useRouter();

  // Protect page & get user info
  const { user, loading } = useAuthGuard();

  // While checking authentication → show nothing
  if (loading) return null;

  const handleLogout = async () => {
    try {
      await apiPost("/auth/logout");
      toast.success("Logged out successfully!");
      router.push("/signin");
    } catch (err: any) {
      toast.error(err.message || "Logout failed");
    }
  };

  const handleDownload = () => {
    window.open(
      "https://maintenance-log-system-backend-1.onrender.com/api/file/download-csv",
      "_blank"
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-6 py-12 text-center">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-black">
        Welcome, {user?.name} 👋
      </h1>

      <Button
        variant="default"
        className="w-[200px] mb-4 cursor-pointer"
        onClick={handleDownload}
      >
        Download CSV
      </Button>

      <Button
        variant="destructive"
        onClick={handleLogout}
        className="text-white w-[200px] shadow-md cursor-pointer"
      >
        Logout
      </Button>
    </div>
  );
}
