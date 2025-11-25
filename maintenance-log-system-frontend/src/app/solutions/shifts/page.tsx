"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FiClock,
  FiUsers,
  FiPlus,
  FiSearch,
  FiDownload,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { LayoutDashboard, MoonIcon, SunIcon } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";

function AuthButton({ darkMode }: { darkMode?: boolean }) {
  return (
    <button className={`px-4 py-2 rounded-lg ${darkMode ? "bg-gray-700 text-white" : "bg-white border"}`}>
      Sign in
    </button>
  );
}

type Attendance = {
  id: string;
  worker_id?: string;
  worker_name?: string;
  shift?: string;
  checkin_at?: string | null;
  checkout_at?: string | null;
  breakMinutes?: number;
  effectiveMinutes?: number | null;
  note?: string;
};

export default function AttendancePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("solutions");

  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([
    { id: "shift1", name: "Shift 1", start: "06:00", end: "14:00" },
    { id: "shift2", name: "Shift 2", start: "14:00", end: "22:00" },
    { id: "shift3", name: "Shift 3", start: "22:00", end: "06:00" },
    { id: "general", name: "General", start: "", end: "" },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filterWorker, setFilterWorker] = useState<string>("all");
  const [filterShift, setFilterShift] = useState<string>("all");
  const [query, setQuery] = useState<string>("");

  const [creating, setCreating] = useState(false);
  const [checkinPayload, setCheckinPayload] = useState({ worker_id: "", shift: "shift1", note: "" });

  useEffect(() => {
    fetchAll();
    fetchWorkers();
    fetchShifts();
  }, []);

  async function fetchAll() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet("/attendance/get");
      if (Array.isArray(data)) setAttendance(data);
      else setAttendance([]);
    } catch (err: any) {
      console.error("attendance fetch error", err);
      setError(String(err?.message || err));
    } finally {
      setLoading(false);
    }
  }

  async function fetchWorkers() {
    try {
      const w = await apiGet("/workers/get").catch(() => apiGet("/users/get")).catch(() => []);
      if (Array.isArray(w)) setWorkers(w);
      else setWorkers([]);
    } catch {
      setWorkers([]);
    }
  }

  async function fetchShifts() {
    try {
      const s = await apiGet("/shifts/get").catch(() => []);
      if (Array.isArray(s) && s.length) setShifts(s);
    } catch {
      /* ignore — we use default shifts above */
    }
  }

  function computeEffectiveMinutes(checkin?: string | null, checkout?: string | null, breakMinutes?: number) {
    if (!checkin) return null;
    try {
      const inTs = new Date(checkin).getTime();
      const outTs = checkout ? new Date(checkout).getTime() : Date.now();
      const diffMin = Math.max(0, Math.round((outTs - inTs) / 60000));
      const effective = Math.max(0, diffMin - (breakMinutes || 0));
      return effective;
    } catch {
      return null;
    }
  }

  const filtered = useMemo(() => {
    let out = attendance.slice();
    if (filterWorker !== "all") out = out.filter((a) => (a.worker_id || a.worker_name) === filterWorker);
    if (filterShift !== "all") out = out.filter((a) => a.shift === filterShift);
    if (query.trim()) {
      const q = query.toLowerCase();
      out = out.filter(
        (a) =>
          (a.worker_name || "").toLowerCase().includes(q) ||
          (a.shift || "").toLowerCase().includes(q) ||
          (a.note || "").toLowerCase().includes(q)
      );
    }
    return out.sort((a, b) => new Date(b.checkin_at || 0).getTime() - new Date(a.checkin_at || 0).getTime());
  }, [attendance, filterWorker, filterShift, query]);

  async function doCheckin(e?: React.FormEvent) {
    e?.preventDefault();
    if (!checkinPayload.worker_id) return alert("Select worker");
    setCreating(true);
    try {
      const res = await apiPost("/attendance/checkin", checkinPayload);
      setAttendance((s) => [res, ...s]);
      setCheckinPayload({ worker_id: "", shift: "shift1", note: "" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      alert("Check-in failed: " + (err?.message || err));
    } finally {
      setCreating(false);
    }
  }

  async function doCheckout(att: Attendance) {
    if (!att?.id) return;
    const breakMinutesStr = prompt("Enter break minutes (number) — will be subtracted from effective hours", "0") || "0";
    const breakMinutes = Math.max(0, Number(breakMinutesStr) || 0);
    try {
      const updated = await apiPost("/attendance/checkout", { attendance_id: att.id, breakMinutes, note: "" });
      setAttendance((s) => s.map((x) => (x.id === updated.id ? updated : x)));
    } catch (err: any) {
      alert("Checkout failed: " + (err?.message || err));
    }
  }

  function fmtMinutes(mins?: number | null) {
    if (mins == null) return "-";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h) return `${h}h ${m}m`;
    return `${m}m`;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "dark bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      <nav className={`border-b fixed w-full px-6 py-4 flex items-center justify-between z-50 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
        <div className="flex items-center space-x-8">
          <div className="flex items-center">
            <div className="bg-blue-500 p-2 rounded-lg"><FiClock className="h-6 w-6 text-white" /></div>
            <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">MaintenanceLog</span>
          </div>
          <div className="hidden md:flex space-x-6">
            <Link href="/" onClick={() => setActiveTab("home")} className={`px-3 py-2 rounded-md cursor-pointer transition-colors ${activeTab === "home" ? "text-blue-500 font-medium" : darkMode ? "hover:text-gray-300" : "hover:text-gray-700"}`}>Home</Link>
            <Link href="/features" onClick={() => setActiveTab("features")} className={`px-3 py-2 rounded-md cursor-pointer transition-colors ${activeTab === "features" ? "text-blue-500 font-medium" : darkMode ? "hover:text-gray-300" : "hover:text-gray-700"}`}>Features</Link>
            <Link href="/solutions" onClick={() => setActiveTab("solutions")} className={`px-3 py-2 rounded-md cursor-pointer transition-colors ${activeTab === "solutions" ? "text-blue-500 font-medium" : darkMode ? "hover:text-gray-300" : "hover:text-gray-700"}`}>Solutions</Link>
            <Link href="/pricing" onClick={() => setActiveTab("pricing")} className={`px-3 py-2 rounded-md cursor-pointer transition-colors ${activeTab === "pricing" ? "text-blue-500 font-medium" : darkMode ? "hover:text-gray-300" : "hover:text-gray-700"}`}>Pricing</Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button onClick={() => { setDarkMode(!darkMode); document.documentElement.classList.toggle("dark"); }} className={`w-12 h-6 flex items-center rounded-full cursor-pointer p-1 transition-colors duration-300 ${darkMode ? "bg-blue-600" : "bg-gray-300"}`}>
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${darkMode ? "translate-x-6" : "translate-x-0"}`} />
            </button>
            {darkMode ? <SunIcon className="h-5 w-5 text-yellow-300" /> : <MoonIcon className="h-5 w-5 text-gray-600" />}
          </div>

          <Link href="/dashboard" className={`hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600 text-white"}`}>
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>

          <AuthButton darkMode={darkMode} />
        </div>
      </nav>

      <main className="pt-28 px-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Attendance & Shift Tracking</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input placeholder="Search worker/shift/note..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10 pr-4 py-2 rounded-lg border w-64 focus:outline-none" />
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            <button onClick={fetchAll} className="px-4 py-2 bg-white border rounded-lg">Refresh</button>
            <button onClick={() => window.print()} className="px-4 py-2 bg-white border rounded-lg flex items-center gap-2"><FiDownload />Export</button>
          </div>
        </div>

        <section className={`p-6 rounded-xl mb-8 transition-all ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
          <form onSubmit={(e) => doCheckin(e)} className="grid lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="text-sm block mb-1">Worker</label>
              <select value={checkinPayload.worker_id} onChange={(e) => setCheckinPayload((s) => ({ ...s, worker_id: e.target.value }))} className="px-3 py-2 rounded border w-full">
                <option value="">— select worker —</option>
                {workers.map((w: any) => <option key={w.id || w._id} value={w.id || w._id}>{w.name || w.fullname || w.email}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm block mb-1">Shift</label>
              <select value={checkinPayload.shift} onChange={(e) => setCheckinPayload((s) => ({ ...s, shift: e.target.value }))} className="px-3 py-2 rounded border w-full">
                {shifts.map((s) => <option key={s.id || s.name} value={s.id || s.name}>{s.name}</option>)}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="text-sm block mb-1">Note (optional)</label>
              <input value={checkinPayload.note} onChange={(e) => setCheckinPayload((s) => ({ ...s, note: e.target.value }))} placeholder="e.g. started preventive check on machine X" className="px-3 py-2 rounded border w-full" />
            </div>

            <div className="flex items-center gap-3">
              <button type="submit" disabled={creating} className={`px-5 py-2 rounded-lg font-semibold ${creating ? "bg-gray-400" : "bg-blue-600 text-white"}`}>{creating ? "Checking in..." : <><FiPlus/> Check In</>}</button>
            </div>
          </form>
          {error && <div className="mt-3 text-sm text-red-500">{error}</div>}
        </section>

        <section className="mb-6 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex gap-3 items-center">
            <select value={filterWorker} onChange={(e) => setFilterWorker(e.target.value)} className="px-3 py-2 rounded border">
              <option value="all">All Workers</option>
              {workers.map((w) => <option key={w.id || w._id} value={w.id || w._id}>{w.name || w.email || w._id}</option>)}
            </select>

            <select value={filterShift} onChange={(e) => setFilterShift(e.target.value)} className="px-3 py-2 rounded border">
              <option value="all">All Shifts</option>
              {shifts.map((s) => <option key={s.id || s.name} value={s.id || s.name}>{s.name}</option>)}
            </select>
          </div>

          <div className="text-sm text-gray-500">Showing {filtered.length} records</div>
        </section>

        <section>
          {loading ? (
            <div className="p-6 rounded-lg bg-white dark:bg-gray-800 border text-center">Loading attendance...</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filtered.map((a) => (
                <article key={a.id} className={`p-4 rounded-xl border shadow-sm transition-transform transform hover:scale-102 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                          <FiUsers className="h-5 w-5 text-indigo-500" />
                        </div>
                        <div>
                          <div className="font-semibold text-lg">{a.worker_name || a.worker_id || "Unknown"}</div>
                          <div className="text-sm text-gray-500">{a.shift || "-"}</div>
                        </div>
                      </div>

                      <div className="mt-3 text-sm">
                        <div className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>{a.note || "-"}</div>
                        <div className="mt-2 text-xs text-gray-400">Check-in: {a.checkin_at ? new Date(a.checkin_at).toLocaleString() : "-"}</div>
                        <div className="text-xs text-gray-400">Check-out: {a.checkout_at ? new Date(a.checkout_at).toLocaleString() : "-"}</div>
                        <div className="text-xs text-gray-400">Break: {a.breakMinutes ?? 0} min • Effective: {fmtMinutes(a.effectiveMinutes ?? computeEffectiveMinutes(a.checkin_at, a.checkout_at, a.breakMinutes))}</div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="text-sm text-gray-500">{a.checkout_at ? "Completed" : "In Progress"}</div>
                      {!a.checkout_at ? (
                        <button onClick={() => doCheckout(a)} className="px-3 py-1 rounded-md border hover:bg-gray-100 dark:hover:bg-gray-700">Check Out</button>
                      ) : (
                        <div className="text-xs text-gray-500">ID: {a.id}</div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className={`border-t py-12 px-6 ${darkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"}`}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="bg-blue-500 p-2 rounded-lg"><FiClock className="h-6 w-6 text-white" /></div>
              <span className="ml-3 text-2xl font-bold">MaintenanceLog</span>
            </div>
            <div className="flex space-x-6">
              <Link href="#" className={`hover:text-blue-500 transition-colors ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Privacy</Link>
              <Link href="#" className={`hover:text-blue-500 transition-colors ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Terms</Link>
              <Link href="#" className={`hover:text-blue-500 transition-colors ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Contact</Link>
            </div>
          </div>
          <div className={`mt-8 pt-8 border-t text-center ${darkMode ? "border-gray-700 text-gray-500" : "border-gray-200 text-gray-400"}`}>© {new Date().getFullYear()} MaintenanceLog. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
