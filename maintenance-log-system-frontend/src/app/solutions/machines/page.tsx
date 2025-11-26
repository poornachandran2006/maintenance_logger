"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FiActivity,
  FiDatabase,
  FiUsers,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiSearch,
} from "react-icons/fi";
import { LayoutDashboard, MoonIcon, SunIcon } from "lucide-react";
import AuthButton from "../../_components/auth-button";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

type Machine = {
  _id?: string;
  id?: string;
  name: string;
  code?: string;
  status?: "running" | "idle" | "maintenance";
  location?: string;
  last_active_at?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export default function MachinesPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("machines");

  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // create form
  const [form, setForm] = useState({
    name: "",
    code: "",
    status: "idle",
    location: "",
    last_active_at: "",
  });

  // ui state
  const [viewing, setViewing] = useState<Machine | null>(null);
  const [editing, setEditing] = useState<Machine | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // search / filter / pagination
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | Machine["status"]>("all");
  const [sortBy, setSortBy] = useState<"name" | "last_active" | "status">("name");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    fetchMachines();
  }, []);

  async function fetchMachines() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet("/machines/get");
      if (Array.isArray(data)) setMachines(data);
      else setMachines([]);
    } catch (err: any) {
      console.error("fetch machines err", err);
      setError(String(err?.message || err || "Failed to fetch machines"));
      setMachines([]);
    } finally {
      setLoading(false);
    }
  }

  function idOf(m: Machine) {
    return (m._id || m.id) as string | undefined;
  }

  // Create
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: any = {
        name: form.name.trim(),
        code: form.code.trim() || undefined,
        status: form.status,
        location: form.location.trim() || undefined,
        last_active_at: form.last_active_at || null,
      };
      const created = await apiPost("/machines/create", payload);
      // push to top
      setMachines((s) => [created, ...s]);
      setForm({
        name: "",
        code: "",
        status: "idle",
        location: "",
        last_active_at: "",
      });
      setPage(1);
    } catch (err: any) {
      console.error(err);
      setError(String(err?.message || err || "Failed to create machine"));
    } finally {
      setSaving(false);
    }
  }

  // Delete
  async function handleDelete(id: string) {
    if (!confirm("Delete this machine? This will unassign logs referencing it.")) return;
    setDeletingId(id);
    try {
      await apiDelete(`/machines/${id}`);
      setMachines((s) => s.filter((m) => idOf(m) !== id));
      if (viewing && idOf(viewing) === id) setViewing(null);
    } catch (err: any) {
      alert("Delete failed: " + String(err?.message || err));
    } finally {
      setDeletingId(null);
    }
  }

  // Open edit modal
  function openEdit(m: Machine) {
    setEditing({
      ...m,
      // keep last_active_at as ISO string or empty
      last_active_at: m.last_active_at ? m.last_active_at : "",
    });
  }

  // Save edit
  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    try {
      const id = idOf(editing);
      if (!id) throw new Error("Missing id");
      const payload: any = {
        name: editing.name,
        code: editing.code,
        status: editing.status,
        location: editing.location,
        last_active_at: editing.last_active_at || null,
      };
      const updated = await apiPut(`/machines/update/${id}`, payload);
      setMachines((s) => s.map((m) => (idOf(m) === id ? updated : m)));
      setEditing(null);
      if (viewing && idOf(viewing) === id) setViewing(updated);
    } catch (err: any) {
      alert("Update failed: " + String(err?.message || err));
    } finally {
      setSaving(false);
    }
  }

  // quick status change
  async function setStatus(m: Machine, status: Machine["status"]) {
    const id = idOf(m);
    if (!id) return;
    try {
      const updated = await apiPut(`/machines/update/${id}`, { status });
      setMachines((s) => s.map((x) => (idOf(x) === id ? updated : x)));
      if (viewing && idOf(viewing) === id) setViewing(updated);
    } catch (err) {
      console.error("status update failed", err);
      alert("Status update failed");
    }
  }

  // Derived filtered / sorted list
  const filtered = useMemo(() => {
    let out = machines.slice();
    if (filterStatus !== "all")
      out = out.filter((m) => (m.status || "idle") === filterStatus);
    if (query.trim()) {
      const q = query.toLowerCase();
      out = out.filter(
        (m) =>
          (m.name || "").toLowerCase().includes(q) ||
          (m.code || "").toLowerCase().includes(q) ||
          (m.location || "").toLowerCase().includes(q)
      );
    }
    if (sortBy === "name") {
      out.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortBy === "last_active") {
      out.sort((a, b) => {
        return (
          new Date(b.last_active_at || 0).getTime() -
          new Date(a.last_active_at || 0).getTime()
        );
      });
    } else if (sortBy === "status") {
      out.sort((a, b) => (a.status || "").localeCompare(b.status || ""));
    }
    return out;
  }, [machines, filterStatus, query, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  // Style helpers for label and input classes
  const labelClass = darkMode
    ? "text-white text-sm block mb-1"
    : "text-black text-sm block mb-1";

  const inputClass =
    "px-3 py-2 rounded border w-full " +
    (darkMode
      ? "bg-gray-700 text-white placeholder-white placeholder-opacity-80 focus:ring-0 focus:outline-none"
      : "bg-gray-200 text-black placeholder-black placeholder-opacity-80 focus:ring-0 focus:outline-none");

  useEffect(() => {
    setIsMounted(true);
    setDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  const handleDarkToggle = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "dark bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* NAV */}
      <nav
        className={`border-b fixed w-full px-6 py-4 flex items-center justify-between z-50 ${
          darkMode
            ? "bg-gray-800/50 border-gray-700"
            : "bg-white/80 border-gray-200"
        }`}
      >
        <div className="flex items-center space-x-8">
          <div className="flex items-center">
            <div className="bg-blue-500 p-2 rounded-lg">
              <FiActivity className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              MaintenanceLog
            </span>
          </div>

          <div className="hidden md:flex space-x-6">
            <Link
              href="/"
              onClick={() => setActiveTab("home")}
              className={`px-3 py-2 rounded-md cursor-pointer transition-colors ${
                activeTab === "home"
                  ? "text-blue-500 font-medium"
                  : darkMode
                  ? "hover:text-gray-300"
                  : "hover:text-gray-700"
              }`}
            >
              Home
            </Link>
            <Link
              href="/features"
              onClick={() => setActiveTab("features")}
              className={`px-3 py-2 rounded-md cursor-pointer transition-colors ${
                activeTab === "features"
                  ? "text-blue-500 font-medium"
                  : darkMode
                  ? "hover:text-gray-300"
                  : "hover:text-gray-700"
              }`}
            >
              Features
            </Link>
            <Link
              href="/solutions"
              onClick={() => setActiveTab("solutions")}
              className={`px-3 py-2 rounded-md cursor-pointer transition-colors ${
                activeTab === "solutions"
                  ? "text-blue-500 font-medium"
                  : darkMode
                  ? "hover:text-gray-300"
                  : "hover:text-gray-700"
              }`}
            >
              Solutions
            </Link>
            <Link
              href="/pricing"
              onClick={() => setActiveTab("pricing")}
              className={`px-3 py-2 rounded-md cursor-pointer transition-colors ${
                activeTab === "pricing"
                  ? "text-blue-500 font-medium"
                  : darkMode
                  ? "hover:text-gray-300"
                  : "hover:text-gray-700"
              }`}
            >
              Pricing
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {/* Only render the proper toggle after client hydration */}
            {isMounted && (
              <button
                onClick={handleDarkToggle}
                className={`w-12 h-6 flex items-center rounded-full cursor-pointer p-1 transition-colors duration-300 ${
                  darkMode ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                    darkMode ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            )}

            {darkMode ? (
              <SunIcon className="h-5 w-5 text-yellow-300" />
            ) : (
              <MoonIcon className="h-5 w-5 text-gray-600" />
            )}
          </div>

          <Link
            href="/dashboard"
            className={`hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              darkMode
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>

          {/* Hydration-safe AuthButton */}
          {isMounted && <AuthButton darkMode={darkMode} />}
        </div>
      </nav>

      <main className="pt-28 px-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Machines</h1>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                placeholder="Search name, code, location..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                className={`${inputClass} pl-10 pr-4 `}
              />
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>

            <button
              onClick={() => {
                setForm({
                  name: "",
                  code: "",
                  status: "idle",
                  location: "",
                  last_active_at: "",
                });
                setEditing(null);
                setViewing(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`px-4 py-2 bg-gray-300 border rounded-lg ${
                darkMode ? "bg-gray-600 text-white" : ""
              }`}
            >
              Reset
            </button>

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
            >
              <FiPlus /> New Machine
            </button>
          </div>
        </div>

        {/* Create form */}
        <section
          className={`p-6 rounded-xl mb-8 transition-all ${
            darkMode
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200"
          }`}
        >
          <form
            onSubmit={handleCreate}
            className="grid lg:grid-cols-4 gap-4 items-end"
          >
            <div>
              <label className={labelClass}>Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter machine name"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Code</label>
              <input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="Machine code (optional)"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((s) => ({ ...s, status: e.target.value })) as any
                }
                className={inputClass}
              >
                <option value="idle">Idle</option>
                <option value="running">Running</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Last active</label>
              <input
                type="datetime-local"
                value={form.last_active_at}
                onChange={(e) =>
                  setForm((s) => ({ ...s, last_active_at: e.target.value }))
                }
                className={inputClass}
              />
            </div>

            <div className="lg:col-span-4">
              <label className={labelClass}>Location</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Enter machine location"
                className={inputClass}
              />
            </div>

            <div className="flex justify-end lg:col-span-4">
              <button
                type="submit"
                disabled={saving}
                className={`px-5 py-2 rounded-lg font-semibold ${
                  saving ? "bg-gray-400" : "bg-blue-600 text-white"
                }`}
              >
                {saving ? "Saving..." : "Add Machine"}
              </button>
            </div>
          </form>

          {error && <div className="mt-3 text-sm text-red-500">{error}</div>}
        </section>

        {/* Filters */}
        <section className="mb-6 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex gap-2 items-center">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value as any);
                setPage(1);
              }}
              className={inputClass}
              style={{ maxWidth: 160 }}
            >
              <option value="all">All Status</option>
              <option value="idle">Idle</option>
              <option value="running">Running</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={inputClass}
              style={{ maxWidth: 160 }}
            >
              <option value="name">Name</option>
              <option value="last_active">Last Active</option>
              <option value="status">Status</option>
            </select>
          </div>
        </section>

        {/* Machines grid */}
        <section>
          {loading ? (
            <div className="p-6 rounded-lg bg-white dark:bg-gray-800 border text-center">
              Loading machines...
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                {paged.map((m) => {
                  const id = idOf(m);
                  return (
                    <article
                      key={id || m.name}
                      className={`p-4 rounded-xl border shadow-sm transition-transform transform hover:scale-102 ${
                        darkMode
                          ? "bg-gray-800 border-gray-700"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                              <FiDatabase className="h-5 w-5 text-indigo-500" />
                            </div>
                            <div>
                              <div className="font-semibold text-lg">
                                {m.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {m.code || "—"}
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 text-sm">
                            <div
                              className={`${
                                darkMode ? "text-gray-300" : "text-gray-700"
                              }`}
                            >
                              {m.location || "-"}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Last active:{" "}
                              {m.last_active_at
                                ? new Date(m.last_active_at).toLocaleString()
                                : "-"}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <div className="text-sm text-gray-500 capitalize">
                            {m.status || "idle"}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setViewing(m)}
                              className="px-2 py-1 rounded-md border hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              View
                            </button>
                            <button
                              onClick={() => openEdit(m)}
                              className="px-2 py-1 rounded-md border hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => id && handleDelete(id)}
                              className="px-2 py-1 rounded-md border hover:bg-red-50 text-red-600"
                            >
                              {deletingId === id ? "Deleting..." : <FiTrash2 />}
                            </button>
                          </div>

                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => setStatus(m, "running")}
                              className="px-2 py-1 rounded border text-sm"
                            >
                              Run
                            </button>
                            <button
                              onClick={() => setStatus(m, "idle")}
                              className="px-2 py-1 rounded border text-sm"
                            >
                              Idle
                            </button>
                            <button
                              onClick={() => setStatus(m, "maintenance")}
                              className="px-2 py-1 rounded border text-sm"
                            >
                              Maintain
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </main>

      {/* Viewing modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setViewing(null)}
          />
          <div
            className={`relative w-full max-w-2xl p-6 rounded-xl ${
              darkMode ? "bg-gray-800" : "bg-white"
            } z-10`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold">{viewing.name}</h3>
                <div className="text-sm text-gray-500">{viewing.code}</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setViewing(null);
                    openEdit(viewing);
                  }}
                  className="px-3 py-1 rounded border"
                >
                  Edit
                </button>
                <button
                  onClick={() => setViewing(null)}
                  className="px-3 py-1 rounded border"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Status</strong>
                <div className="text-gray-500 capitalize">
                  {viewing.status || "idle"}
                </div>
              </div>
              <div>
                <strong>Location</strong>
                <div className="text-gray-500">{viewing.location || "-"}</div>
              </div>
              <div>
                <strong>Last active</strong>
                <div className="text-gray-500">
                  {viewing.last_active_at
                    ? new Date(viewing.last_active_at).toLocaleString()
                    : "-"}
                </div>
              </div>
              <div>
                <strong>Created</strong>
                <div className="text-gray-500">
                  {viewing.createdAt
                    ? new Date(viewing.createdAt).toLocaleString()
                    : "-"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setEditing(null)}
          />
          <div
            className={`relative w-full max-w-2xl p-6 rounded-xl ${
              darkMode ? "bg-gray-800" : "bg-white"
            } z-10`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Edit Machine</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(null)}
                  className="px-3 py-1 rounded border"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className={labelClass}>Name</label>
                <input
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Code</label>
                <input
                  value={editing.code || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, code: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Status</label>
                <select
                  value={editing.status}
                  onChange={(e) =>
                    setEditing({ ...editing, status: e.target.value as any })
                  }
                  className={inputClass}
                >
                  <option value="idle">Idle</option>
                  <option value="running">Running</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Last active</label>
                <input
                  type="datetime-local"
                  value={
                    editing.last_active_at
                      ? editing.last_active_at.slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    setEditing({ ...editing, last_active_at: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Location</label>
                <input
                  value={editing.location || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, location: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 rounded border"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  className={`px-4 py-2 rounded ${
                    saving ? "bg-gray-400" : "bg-blue-600 text-white"
                  }`}
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
