"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

import {
  FiDatabase,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiSearch,
  FiLogOut,
  FiActivity,
} from "react-icons/fi";

import { MoonIcon, SunIcon, LayoutDashboard } from "lucide-react";

import AuthButton from "@/app/_components/auth-button";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function LogsClientPage() {
  const router = useRouter();
  const pathname = usePathname();

  // UI state
  const [darkMode, setDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Data states
  const [logs, setLogs] = useState<any[]>([]);
  const [machinesList, setMachinesList] = useState<any[]>([]);
  const [workersList, setWorkersList] = useState<any[]>([]);
  const [attendanceList, setAttendanceList] = useState<any[]>([]);

  const [logsLoading, setLogsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create Log Form
  const [form, setForm] = useState({
    machine_id: "",
    type: "routine",
    note: "",
    reading_value: "",
    completed_at: "",
  });

  // Filters & Pagination
  const [filterType, setFilterType] = useState("all");
  const [filterMachine, setFilterMachine] = useState("all");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("reported_at");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [viewing, setViewing] = useState<any>(null);
  const [editing, setEditing] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // =================================================================
  // INITIAL MOUNT → Fix for hydration-safe dark mode
  // =================================================================
  useEffect(() => {
    setIsMounted(true);
    setDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  // =================================================================
  // FETCH DATA (no auth check here — server wrapper handles auth)
  // =================================================================
  useEffect(() => {
    fetchAll();
    fetchMachines();
    fetchWorkers();
    fetchAttendance();
  }, []);

  async function fetchAll() {
    setLogsLoading(true);
    try {
      const data = await apiGet<any[]>("/maintenance/get");
      setLogs(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load logs");
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  }

  async function fetchMachines() {
    try {
      const data = await apiGet<any[]>("/machines/get");
      setMachinesList(Array.isArray(data) ? data : []);
    } catch {
      setMachinesList([]);
    }
  }

  async function fetchWorkers() {
    try {
      const data = await apiGet<any[]>("/users/get");
      setWorkersList(Array.isArray(data) ? data : []);
    } catch {
      setWorkersList([]);
    }
  }

  async function fetchAttendance() {
    try {
      const data = await apiGet<any[]>("/attendance/get");
      setAttendanceList(Array.isArray(data) ? data : []);
    } catch {
      setAttendanceList([]);
    }
  }

  // =================================================================
  // CREATE LOG
  // =================================================================
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload: any = {
        machine_id: form.machine_id || null,
        type: form.type,
        note: form.note || "",
        completed_at: form.completed_at || null,
      };

      if (form.reading_value.trim()) {
        try {
          payload.reading_value = JSON.parse(form.reading_value);
        } catch {
          payload.reading_value = form.reading_value;
        }
      }

      const created = await apiPost("/maintenance/create", payload);
      setLogs((prev) => [created, ...prev]);

      setForm({
        machine_id: "",
        type: "routine",
        note: "",
        reading_value: "",
        completed_at: "",
      });
    } catch (err: any) {
      setError(err.message || "Failed to create log");
    } finally {
      setSaving(false);
    }
  }

  // =================================================================
  // DELETE LOG
  // =================================================================
  async function handleDelete(id: string) {
    if (!confirm("Delete this log?")) return;
    setDeletingId(id);

    try {
      await apiDelete(`/maintenance/${id}`);
      setLogs((prev) => prev.filter((x) => x._id !== id && x.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete log");
    } finally {
      setDeletingId(null);
    }
  }

  // =================================================================
  // OPEN EDIT LOG
  // =================================================================
  function openEdit(log: any) {
    setEditing({
      ...log,
      reading_value: log.reading_value
        ? JSON.stringify(log.reading_value, null, 2)
        : "",
      completed_at: log.completed_at ? log.completed_at.slice(0, 16) : "",
    });
  }

  async function saveEdit() {
    if (!editing) return;

    setSaving(true);

    try {
      const payload: any = { ...editing };
      delete payload.id;

      if (typeof editing.reading_value === "string") {
        try {
          payload.reading_value = JSON.parse(editing.reading_value);
        } catch {
          payload.reading_value = editing.reading_value;
        }
      }

      const updated = await apiPut(
        `/maintenance/update/${editing._id}`,
        payload
      );

      setLogs((old) =>
        old.map((x) => (x._id === updated._id ? updated : x))
      );

      setEditing(null);
    } catch (err: any) {
      setError(err.message || "Failed to update log");
    } finally {
      setSaving(false);
    }
  }

  // =================================================================
  // FILTERS / SEARCH / SORT
  // =================================================================
  const filtered = useMemo(() => {
    let list = [...logs];

    if (filterType !== "all") list = list.filter((l) => l.type === filterType);
    if (filterMachine !== "all")
      list = list.filter((l) => l.machine_id === filterMachine);

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (l) =>
          (l.note || "").toLowerCase().includes(q) ||
          (l.type || "").toLowerCase().includes(q) ||
          (l.machine_name || "").toLowerCase().includes(q)
      );
    }

    if (sortBy === "reported_at") {
      list.sort(
        (a, b) =>
          new Date(b.reported_at || "").getTime() -
          new Date(a.reported_at || "").getTime()
      );
    } else if (sortBy === "duration") {
      list.sort((a, b) => (b.durationMinutes || 0) - (a.durationMinutes || 0));
    }

    return list;
  }, [logs, filterType, filterMachine, query, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  // =================================================================
  // UI HELPERS
  // =================================================================
  function formatDate(d?: string) {
    if (!d) return "N/A";
    return new Date(d).toLocaleString();
  }

  const inputClass =
    "px-3 py-2 rounded border w-full " +
    (darkMode
      ? "bg-gray-700 text-white border-gray-600"
      : "bg-gray-100 text-black border-gray-300");

  const labelClass =
    darkMode ? "text-white text-sm mb-1 block" : "text-black text-sm mb-1 block";

  function handleDarkToggle() {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      return next;
    });
  }

  // =================================================================
  // UI
  // =================================================================
  return (
    <div
      className={`min-h-screen flex transition-colors duration-300 ${
        darkMode ? "bg-gray-950 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* SIDEBAR */}
      <aside
        className={`w-64 flex flex-col border-r ${
          darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
        }`}
      >
        <div className="px-4 py-4 flex items-center gap-3 border-b border-gray-700/40">
          <div className="bg-blue-500 p-2 rounded-lg">
            <FiActivity className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-lg font-bold">MaintenanceLog</div>
            <div className="text-xs text-gray-400">Logs Panel</div>
          </div>
        </div>

        <div className="px-4 py-4 flex items-center justify-between border-b border-gray-800/40">
          <div className="text-sm">
            <div className="font-medium">Logged User</div>
          </div>

          {isMounted && (
            <button
              onClick={handleDarkToggle}
              className={`w-12 h-6 flex items-center rounded-full cursor-pointer p-1 transition-colors duration-300 ${
                darkMode ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  darkMode ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          )}
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 text-sm">
          <Link
            href="/dashboard"
            className={`flex items-center gap-2 px-3 py-2 rounded-md ${
              pathname === "/dashboard"
                ? "bg-blue-600 text-white"
                : darkMode
                ? "hover:bg-gray-800"
                : "hover:bg-gray-100"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/solutions/logs"
            className={`flex items-center gap-2 px-3 py-2 rounded-md ${
              pathname === "/solutions/logs"
                ? "bg-blue-600 text-white"
                : darkMode
                ? "hover:bg-gray-800"
                : "hover:bg-gray-100"
            }`}
          >
            <FiDatabase className="h-4 w-4" />
            <span>Logs</span>
          </Link>

          <Link
            href="/solutions/machines"
            className={`flex items-center gap-2 px-3 py-2 rounded-md ${
              pathname === "/solutions/machines"
                ? "bg-blue-600 text-white"
                : darkMode
                ? "hover:bg-gray-800"
                : "hover:bg-gray-100"
            }`}
          >
            <FiActivity className="h-4 w-4" />
            <span>Machines</span>
          </Link>

          <Link
            href="/solutions/shifts"
            className={`flex items-center gap-2 px-3 py-2 rounded-md ${
              pathname === "/solutions/shifts"
                ? "bg-blue-600 text-white"
                : darkMode
                ? "hover:bg-gray-800"
                : "hover:bg-gray-100"
            }`}
          >
            <FiActivity className="h-4 w-4" />
            <span>Shifts</span>
          </Link>
        </nav>

        <div className="px-4 py-4 border-t border-gray-800/40 flex items-center justify-between">
          <AuthButton darkMode={darkMode} />
          <button
            onClick={() => {
              apiPost("/auth/logout").then(() => router.push("/signin"));
            }}
            className="flex items-center gap-2 text-sm text-red-500"
          >
            <FiLogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 px-8 py-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Maintenance Logs</h1>
            <p className="text-sm text-gray-500 mt-1">
              View and manage your maintenance log history.
            </p>
          </div>

          <div className="relative">
            <Input
              placeholder="Search notes, type, machine..."
              value={query}
              onChange={(e: any) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="pl-10 pr-4"
            />
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
          </div>
        </div>

        {/* CREATE LOG FORM */}
        <section
          className={`p-6 rounded-xl mb-8 border ${
            darkMode
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-200"
          }`}
        >
          <h2 className="text-lg font-semibold mb-4">Create Log Entry</h2>

          <form onSubmit={handleCreate} className="grid lg:grid-cols-4 gap-4">
            <div>
              <Label className={labelClass}>Machine</Label>
              <select
                value={form.machine_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, machine_id: e.target.value }))
                }
                className={inputClass}
              >
                <option value="">— Select —</option>
                {machinesList.map((m: any) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className={labelClass}>Type</Label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, type: e.target.value }))
                }
                className={inputClass}
              >
                <option value="routine">Routine</option>
                <option value="preventive">Preventive</option>
                <option value="predictive">Predictive</option>
                <option value="breakdown">Breakdown</option>
                <option value="implementation">Implementation</option>
              </select>
            </div>

            <div>
              <Label className={labelClass}>Reading (JSON)</Label>
              <Input
                value={form.reading_value}
                onChange={(e: any) =>
                  setForm((f) => ({ ...f, reading_value: e.target.value }))
                }
                placeholder='{"temp":45}'
                className={inputClass}
              />
            </div>

            <div>
              <Label className={labelClass}>Completed At</Label>
              <input
                type="datetime-local"
                value={form.completed_at}
                onChange={(e) =>
                  setForm((f) => ({ ...f, completed_at: e.target.value }))
                }
                className={inputClass}
              />
            </div>

            <div className="lg:col-span-4">
              <Label className={labelClass}>Notes</Label>
              <Textarea
                value={form.note}
                onChange={(e: any) =>
                  setForm((f) => ({ ...f, note: e.target.value }))
                }
                rows={3}
                className={inputClass}
              />
            </div>

            <div className="flex justify-end lg:col-span-4">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Add Log"}
              </Button>
            </div>
          </form>

          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        </section>

        {/* FILTERS */}
        <section className="mb-6 flex gap-3 flex-wrap items-center">
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setPage(1);
            }}
            className={inputClass}
          >
            <option value="all">All Types</option>
            <option value="routine">Routine</option>
            <option value="preventive">Preventive</option>
            <option value="predictive">Predictive</option>
            <option value="breakdown">Breakdown</option>
            <option value="implementation">Implementation</option>
          </select>

          <select
            value={filterMachine}
            onChange={(e) => {
              setFilterMachine(e.target.value);
              setPage(1);
            }}
            className={inputClass}
          >
            <option value="all">All Machines</option>
            {machinesList.map((m: any) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>
        </section>

        {/* LOGS GRID */}
        <section>
          {logsLoading ? (
            <div
              className={`p-6 rounded-lg border text-center ${
                darkMode ? "bg-gray-900 border-gray-800" : "bg-white"
              }`}
            >
              Loading logs...
            </div>
          ) : filtered.length === 0 ? (
            <div
              className={`p-8 rounded-lg border text-center ${
                darkMode ? "bg-gray-900 border-gray-800" : "bg-white"
              }`}
            >
              No logs found.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {paged.map((log: any) => (
                <Card
                  key={log._id}
                  className={`p-4 rounded-xl border shadow-sm ${
                    darkMode
                      ? "bg-gray-900 border-gray-800"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            darkMode ? "bg-gray-800" : "bg-gray-100"
                          }`}
                        >
                          <FiDatabase className="h-5 w-5 text-indigo-500" />
                        </div>

                        <div>
                          <div
                            className={`font-semibold text-lg capitalize ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {log.type || "—"}
                          </div>

                          <div className="text-sm text-gray-500">
                            {log.machine_name || "Machine"}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 text-sm">
                        <div
                          className={`${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {log.note || "-"}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="text-xs text-gray-500">
                        {formatDate(log.reported_at)}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewing(log)}
                          className="px-2 py-1 rounded-md border text-xs hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          View
                        </button>

                        <button
                          onClick={() => openEdit(log)}
                          className="px-2 py-1 rounded-md border text-xs hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <FiEdit2 />
                        </button>

                        <button
                          onClick={() => handleDelete(log._id)}
                          className="px-2 py-1 rounded-md border text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                        >
                          {deletingId === log._id ? "Deleting..." : <FiTrash2 />}
                        </button>
                      </div>

                      {log.durationMinutes != null && (
                        <div className="text-xs text-gray-400">
                          Duration: {Math.round(log.durationMinutes)} min
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-6 text-sm text-gray-500">
            <div>
              Showing {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, filtered.length)} of{" "}
              {filtered.length}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
