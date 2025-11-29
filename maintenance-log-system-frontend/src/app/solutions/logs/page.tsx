"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FiDatabase,
  FiUsers,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiSearch,
} from "react-icons/fi";
import { LayoutDashboard, MoonIcon, SunIcon } from "lucide-react";
import AuthButton from "@/app/_components/auth-button";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Machine = {
  _id?: string;
  id?: string;
  name: string;
  code?: string;
};

type Log = {
  id: string; // virtual id from backend
  machine_id?: string | null;
  machine_name?: string | null;
  reported_by?: string | null;
  reported_at?: string | null;
  completed_at?: string | null;
  type?: string;
  note?: string;
  reading_value?: any;
  durationMinutes?: number | null;
};

export default function LogsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("logs");

  const [logs, setLogs] = useState<Log[]>([]);
  const [machinesList, setMachinesList] = useState<Machine[]>([]);
  const [workersList, setWorkersList] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create form (minimal fields)
  const [form, setForm] = useState({
    machine_id: "",
    type: "routine",
    note: "",
    reading_value: "",
    completed_at: "",
  });

  // Filters / search / pagination / sort
  const [filterType, setFilterType] = useState<string>("all");
  const [filterMachine, setFilterMachine] = useState<string>("all");
  const [query, setQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"reported_at" | "duration" | "type">(
    "reported_at"
  );
  const [page, setPage] = useState<number>(1);
  const pageSize = 8;

  // Modal state
  const [viewing, setViewing] = useState<Log | null>(null);
  const [editing, setEditing] = useState<Log | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    setDarkMode(document.documentElement.classList.contains("dark"));
    fetchAll();
    fetchMachines();
    fetchWorkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchAll() {
    setLoading(true);
    setError(null);
    try {
      // endpoint assumed
      const data = await apiGet("/maintenance/get");
      if (Array.isArray(data)) setLogs(data);
      else setLogs([]);
    } catch (err: any) {
      console.error("fetch logs error", err);
      setError(String(err?.message || err || "Failed to fetch logs"));
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMachines() {
    try {
      const m = (await apiGet("/machines/get").catch(() => apiGet("/machines"))) || [];
      if (Array.isArray(m)) setMachinesList(m.filter((it: any) => it._id || it.id));
      else setMachinesList([]);
    } catch (err) {
      console.error("fetch machines error", err);
      setMachinesList([]);
    }
  }

  async function fetchWorkers() {
    try {
      const w =
        (await apiGet("/users/get").catch(() => apiGet("/workers/get"))) ||
        (await apiGet("/users").catch(() => apiGet("/workers")));
      if (Array.isArray(w)) setWorkersList(w);
      else setWorkersList([]);
    } catch (err) {
      setWorkersList([]);
    }
  }

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

      if (form.reading_value && form.reading_value.trim()) {
        try {
          payload.reading_value = JSON.parse(form.reading_value);
        } catch {
          payload.reading_value = form.reading_value;
        }
      }

      const created = await apiPost("/maintenance/create", payload);
      // optimistic update
      setLogs((s) => [created, ...s]);
      setForm({ machine_id: "", type: "routine", note: "", reading_value: "", completed_at: "" });
      setPage(1);
    } catch (err: any) {
      console.error("create error", err);
      setError(String(err?.message || err || "Failed to create log"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this log? This action cannot be undone.")) return;
    setDeletingId(id);
    try {
      await apiDelete(`/maintenance/${id}`);
      setLogs((s) => s.filter((l) => l.id !== id));
      if (viewing?.id === id) setViewing(null);
    } catch (err: any) {
      alert("Delete failed: " + String(err?.message || err));
    } finally {
      setDeletingId(null);
    }
  }

  function openEdit(log: Log) {
    setEditing({
      ...log,
      machine_id: log.machine_id || "",
      reading_value: log.reading_value ? JSON.stringify(log.reading_value, null, 2) : "",
      completed_at: log.completed_at ? new Date(log.completed_at).toISOString().slice(0, 16) : "",
    });
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    setError(null);
    try {
      const payload: any = { ...editing };
      payload.machine_id = editing.machine_id || null;
      delete payload.id;

      if (typeof editing.reading_value === "string" && editing.reading_value.trim()) {
        try {
          payload.reading_value = JSON.parse(editing.reading_value as string);
        } catch {
          payload.reading_value = editing.reading_value;
        }
      } else {
        payload.reading_value = editing.reading_value || null;
      }

      // endpoint assumed
      const updated = await apiPut(`/maintenance/update/${editing.id}`, payload);
      setLogs((s) => s.map((l) => (l.id === updated.id ? updated : l)));
      setEditing(null);
    } catch (err: any) {
      console.error("save edit error", err);
      setError(String(err?.message || err || "Update failed"));
    } finally {
      setSaving(false);
    }
  }

  // Derived filtered & sorted logs
  const filtered = useMemo(() => {
    let out = logs.slice();

    if (filterType !== "all") out = out.filter((l) => l.type === filterType);
    if (filterMachine !== "all") out = out.filter((l) => l.machine_id === filterMachine);

    if (query.trim()) {
      const q = query.toLowerCase();
      out = out.filter(
        (l) =>
          (l.note || "").toLowerCase().includes(q) ||
          (l.type || "").toLowerCase().includes(q) ||
          (l.machine_name || "").toLowerCase().includes(q) ||
          (l.machine_id || "").toString().toLowerCase().includes(q)
      );
    }

    out.sort((a, b) => {
      if (sortBy === "reported_at") {
        return new Date(b.reported_at || 0).getTime() - new Date(a.reported_at || 0).getTime();
      }
      if (sortBy === "duration") {
        return (b.durationMinutes || 0) - (a.durationMinutes || 0);
      }
      return (a.type || "").localeCompare(b.type || "");
    });

    return out;
  }, [logs, filterType, filterMachine, query, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const getMachineName = (id?: string | null) => {
    if (!id) return "Unknown / N/A";
    const machine = machinesList.find((m) => (m._id || m.id) === id);
    return machine?.name || "Unknown Machine";
  };

  const getWorkerName = (id?: string | null) => {
    if (!id) return "N/A";
    const worker = workersList.find((w: any) => w.id === id || w._id === id);
    return worker?.name || id;
  };

  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Invalid Date";
    return d.toLocaleString();
  };

  // Small helpers for styling to match machines tone
  const labelClass = darkMode ? "text-white text-sm block mb-1" : "text-black text-sm block mb-1";
  const inputClass =
    "px-3 py-2 rounded border w-full " +
    (darkMode
      ? "bg-gray-700 text-white placeholder-white placeholder-opacity-80 focus:ring-0 focus:outline-none"
      : "bg-gray-200 text-black placeholder-black placeholder-opacity-80 focus:ring-0 focus:outline-none");

  const handleDarkToggle = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      return next;
    });
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "dark bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      {/* NAV */}
      <nav className={`border-b fixed w-full px-6 py-4 flex items-center justify-between z-50 ${darkMode ? "bg-gray-800/50 border-gray-700" : "bg-white/80 border-gray-200"}`}>
        <div className="flex items-center space-x-8">
          <div className="flex items-center">
            <div className="bg-blue-500 p-2 rounded-lg">
              <FiDatabase className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              MaintenanceLog
            </span>
          </div>

          <div className="hidden md:flex space-x-6">
            <Link href="/" className={`px-3 py-2 rounded-md cursor-pointer transition-colors ${activeTab === "home" ? "text-blue-500 font-medium" : darkMode ? "hover:text-gray-300" : "hover:text-gray-700"}`} onClick={() => setActiveTab("home")}>Home</Link>
            <Link href="/features" className={`px-3 py-2 rounded-md cursor-pointer transition-colors ${activeTab === "features" ? "text-blue-500 font-medium" : darkMode ? "hover:text-gray-300" : "hover:text-gray-700"}`} onClick={() => setActiveTab("features")}>Features</Link>
            <Link href="/solutions" className={`px-3 py-2 rounded-md cursor-pointer transition-colors ${activeTab === "solutions" ? "text-blue-500 font-medium" : darkMode ? "hover:text-gray-300" : "hover:text-gray-700"}`} onClick={() => setActiveTab("solutions")}>Solutions</Link>
            <Link href="/pricing" className={`px-3 py-2 rounded-md cursor-pointer transition-colors ${activeTab === "pricing" ? "text-blue-500 font-medium" : darkMode ? "hover:text-gray-300" : "hover:text-gray-700"}`} onClick={() => setActiveTab("pricing")}>Pricing</Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {isMounted && (
              <button onClick={handleDarkToggle} className={`w-12 h-6 flex items-center rounded-full cursor-pointer p-1 transition-colors duration-300 ${darkMode ? "bg-blue-600" : "bg-gray-300"}`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${darkMode ? "translate-x-6" : "translate-x-0"}`} />
              </button>
            )}
            {darkMode ? <SunIcon className="h-5 w-5 text-yellow-300" /> : <MoonIcon className="h-5 w-5 text-gray-600" />}
          </div>

          <Link href="/dashboard" className={`hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600 text-white"}`}>
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>

          {isMounted && <AuthButton darkMode={darkMode} />}
        </div>
      </nav>

      <main className="pt-28 px-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Maintenance Logs</h1>

          <div className="flex items-center gap-3">
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

            <button onClick={() => { setForm({ machine_id: "", type: "routine", note: "", reading_value: "", completed_at: "" }); setEditing(null); setViewing(null); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={`px-4 py-2 bg-gray-300 border rounded-lg ${darkMode ? "bg-gray-600 text-white" : ""}`}>Reset</button>

            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
              <FiPlus /> New Log
            </button>
          </div>
        </div>

        {/* Create form */}
        <section className={`p-6 rounded-xl mb-8 transition-all ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
          <form onSubmit={handleCreate} className="grid lg:grid-cols-4 gap-4 items-end">
            <div>
              <Label>Machine</Label>
              <select value={form.machine_id} onChange={(e) => setForm((s) => ({ ...s, machine_id: e.target.value }))} className={inputClass}>
                <option value="">— select —</option>
                {machinesList.map((m) => (
                  <option key={m._id || m.id} value={m._id || m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Type</Label>
              <select value={form.type} onChange={(e) => setForm((s) => ({ ...s, type: e.target.value }))} className={inputClass}>
                <option value="routine">Routine</option>
                <option value="preventive">Preventive</option>
                <option value="predictive">Predictive</option>
                <option value="breakdown">Breakdown</option>
                <option value="implementation">Implementation</option>
              </select>
            </div>

            <div>
              <Label>Reading (JSON) — optional</Label>
              <Input value={form.reading_value} onChange={(e: any) => setForm((s) => ({ ...s, reading_value: e.target.value }))} placeholder='{"temp":45}' />
            </div>

            <div>
              <Label>Completed at (optional)</Label>
              <input type="datetime-local" value={form.completed_at} onChange={(e) => setForm((s) => ({ ...s, completed_at: e.target.value }))} className={inputClass} />
            </div>

            <div className="lg:col-span-4">
              <Label>Notes</Label>
              <Textarea value={form.note} onChange={(e: any) => setForm((s) => ({ ...s, note: e.target.value }))} rows={3} />
            </div>

            <div className="flex justify-end lg:col-span-4">
              <Button type="submit" className={`${saving ? "opacity-50" : ""}`} disabled={saving}>
                {saving ? "Saving..." : "Add Maintenance Log"}
              </Button>
            </div>
          </form>

          {error && <div className="mt-3 text-sm text-red-500">{error}</div>}
        </section>

        {/* Filters */}
        <section className="mb-6 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex gap-3 items-center">
            <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }} className={inputClass}>
              <option value="all">All Types</option>
              <option value="routine">Routine</option>
              <option value="preventive">Preventive</option>
              <option value="predictive">Predictive</option>
              <option value="breakdown">Breakdown</option>
              <option value="implementation">Implementation</option>
            </select>

            {/* All Machines dropdown - increased minWidth for clarity */}
            <select
              value={filterMachine}
              onChange={(e) => {
                setFilterMachine(e.target.value);
                setPage(1);
              }}
              className={inputClass}
              style={{ minWidth: 220 }}
            >
              <option value="all">All Machines</option>
              {machinesList.map((m) => <option key={m._id || m.id} value={m._id || m.id}>{m.name}</option>)}
            </select>

            {/* Removed the "Newest" dropdown as requested */}
          </div>
        </section>

        {/* Logs grid */}
        <section>
          {loading ? (
            <div className="p-6 rounded-lg bg-white dark:bg-gray-800 border text-center">Loading logs...</div>
          ) : (
            <>
              {filtered.length === 0 ? (
                <div className="p-8 rounded-lg bg-white border text-center">No logs found.</div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {paged.map((log) => (
                    <Card key={log.id} className={`p-4 rounded-xl border shadow-sm transition-transform transform hover:scale-102 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                              <FiDatabase className="h-5 w-5 text-indigo-500" />
                            </div>
                            <div>
                              {/* FIXED: Type color now respects mode */}
                              <div className={`${darkMode ? "text-white" : "text-gray-900"} font-semibold text-lg`}>{log.type || "—"}</div>
                              <div className="text-sm text-gray-500">{log.machine_name || getMachineName(log.machine_id)}</div>
                            </div>
                          </div>

                          <div className="mt-3 text-sm">
                            <div className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>{log.note || "-"}</div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <div className="text-sm text-gray-500">{formatDateTime(log.reported_at)}</div>
                          <div className="flex gap-2">
                            <button onClick={() => setViewing(log)} className="px-2 py-1 rounded-md border hover:bg-gray-100 dark:hover:bg-gray-700">View</button>
                            <button onClick={() => openEdit(log)} className="px-2 py-1 rounded-md border hover:bg-gray-100 dark:hover:bg-gray-700"><FiEdit2 /></button>
                            <button onClick={() => handleDelete(log.id)} className="px-2 py-1 rounded-md border hover:bg-red-50 text-red-600">
                              {deletingId === log.id ? "Deleting..." : <FiTrash2 />}
                            </button>
                          </div>

                          {log.durationMinutes != null && <div className="text-xs text-gray-400">Duration: {Math.round(log.durationMinutes)} min</div>}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Showing count only - pagination controls removed as requested */}
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500">Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}</div>
                <div /> {/* intentionally empty to keep layout spacing (no Prev/Next) */}
              </div>
            </>
          )}
        </section>
      </main>

      {/* Viewing Modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setViewing(null)} />
          <div className={`relative w-full max-w-3xl p-6 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} z-10 shadow-2xl`}>
            <div className="flex justify-between items-start border-b pb-3 mb-4">
              <div>
                <h3 className="text-2xl font-bold text-blue-500">{viewing.type || "N/A"}</h3>
                <div className="text-base text-gray-500 mt-1">{viewing.machine_name || getMachineName(viewing.machine_id)}</div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setViewing(null); openEdit(viewing); }} className="px-3 py-1 rounded-lg border text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Edit</button>
                <button onClick={() => setViewing(null)} className="px-3 py-1 rounded-lg border text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Close</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div>
                <strong className="block text-gray-900">Reported By</strong>
                <div className="text-gray-700">{getWorkerName(viewing.reported_by)}</div>
              </div>

              <div>
                <strong className="block text-gray-900">Status</strong>
                <div className="text-gray-700">{viewing.completed_at ? "Completed" : "In Progress / Pending"}</div>
              </div>

              <div>
                <strong className="block text-gray-900">Reported At</strong>
                <div className="text-gray-700">{formatDateTime(viewing.reported_at)}</div>
              </div>

              <div>
                <strong className="block text-gray-900">Completed At</strong>
                <div className="text-gray-700">{formatDateTime(viewing.completed_at)}</div>
              </div>

              <div>
                <strong className="block text-gray-900">Time Taken / Downtime</strong>
                <div className="text-gray-700 font-semibold">{viewing.durationMinutes != null ? `${Math.round(viewing.durationMinutes)} minutes` : "Not Finished"}</div>
              </div>

              <div className="col-span-2 mt-4">
                <strong className="block text-gray-900">Notes / Description</strong>
                <div className={`mt-1 p-3 rounded-lg ${darkMode ? "bg-gray-900" : "bg-gray-50"} whitespace-pre-wrap text-gray-700`}>{viewing.note || "No notes provided."}</div>
              </div>

              <div className="col-span-2 mt-4">
                <strong className="block text-gray-900">Reading Value (JSON)</strong>
                <pre className={`mt-1 p-3 rounded-lg text-xs overflow-auto ${darkMode ? "bg-gray-900" : "bg-gray-50"} text-gray-700`}>{viewing.reading_value ? JSON.stringify(viewing.reading_value, null, 2) : "No readings logged."}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditing(null)} />
          <div className={`relative w-full max-w-2xl p-6 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} z-10`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Edit Log</h3>
              <div className="flex gap-2">
                <button onClick={() => setEditing(null)} className="px-3 py-1 rounded border">Close</button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <Label>Machine</Label>
                <select value={editing.machine_id || ""} onChange={(e) => setEditing({ ...editing, machine_id: e.target.value })} className={inputClass}>
                  <option value="">— select —</option>
                  {machinesList.map((m) => <option key={m._id || m.id} value={m._id || m.id}>{m.name}</option>)}
                </select>
                <div className="text-xs text-gray-500 mt-1">Current: {getMachineName(editing.machine_id)}</div>
              </div>

              <div>
                <Label>Completed at</Label>
                <input type="datetime-local" value={editing.completed_at ? editing.completed_at.slice(0, 16) : ""} onChange={(e) => setEditing({ ...editing, completed_at: e.target.value })} className={inputClass} />
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea value={editing.note || ""} onChange={(e: any) => setEditing({ ...editing, note: e.target.value })} rows={3} />
              </div>

              <div>
                <Label>Reading (JSON)</Label>
                <Textarea value={editing.reading_value as any} onChange={(e: any) => setEditing({ ...editing, reading_value: e.target.value })} rows={4} />
              </div>

              <div className="flex justify-end gap-2 mt-3">
                <button onClick={() => setEditing(null)} className="px-4 py-2 rounded border">Cancel</button>
                <button onClick={saveEdit} className={`px-4 py-2 rounded ${saving ? "bg-gray-400" : "bg-blue-600 text-white"}`}>{saving ? "Saving..." : "Save changes"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
