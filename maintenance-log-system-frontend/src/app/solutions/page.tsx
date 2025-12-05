"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import useAuthGuard from "@/lib/useAuthGuard";

export default function SolutionsMainPage() {
  const router = useRouter();
  const { user, loading } = useAuthGuard();

  // While checking authentication → show nothing
  if (loading) return null;

  // If not authenticated, redirect to signin
  if (!user) {
    router.replace("/signin");
    return null;
  }

  return (
    <div className="pt-32 px-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Solutions Dashboard
      </h1>

      <p className="text-center text-gray-500 mb-12">
        Select a module to continue
      </p>

      <div className="grid md:grid-cols-3 gap-6">

        <Link
          href="/solutions/logs"
          className="p-6 rounded-xl border hover:bg-blue-50 transition"
        >
          <h2 className="text-xl font-semibold mb-2">Maintenance Logs</h2>
          <p className="text-sm text-gray-600">Create, edit & manage all logs</p>
        </Link>

        <Link
          href="/solutions/shifts"
          className="p-6 rounded-xl border hover:bg-blue-50 transition"
        >
          <h2 className="text-xl font-semibold mb-2">Shifts & Attendance</h2>
          <p className="text-sm text-gray-600">Manage worker attendance</p>
        </Link>

        <Link
          href="/solutions/machines"
          className="p-6 rounded-xl border hover:bg-blue-50 transition"
        >
          <h2 className="text-xl font-semibold mb-2">Machines</h2>
          <p className="text-sm text-gray-600">Machine data & health</p>
        </Link>

        <Link
          href="/solutions/grading"
          className="p-6 rounded-xl border hover:bg-blue-50 transition"
        >
          <h2 className="text-xl font-semibold mb-2">Performance Grades</h2>
          <p className="text-sm text-gray-600">A–E Grades based on work hours</p>
        </Link>

        <Link
          href="/solutions/analytics"
          className="p-6 rounded-xl border hover:bg-blue-50 transition"
        >
          <h2 className="text-xl font-semibold mb-2">Analytics</h2>
          <p className="text-sm text-gray-600">Charts & insights</p>
        </Link>

      </div>
    </div>
  );
}
