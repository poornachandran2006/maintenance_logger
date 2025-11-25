// maintenance-log-system-frontend/src/solutions/logs/page.tsx

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

// Assuming machinesList items have the MongoDB _id and name
type Machine = {
    _id: string; // MongoDB identifier
    name: string;
}

type Log = {
  id: string; // Virtual ID from backend
  machine_id?: string | null; // MongoDB _id string or null
  machine_name?: string | null; // New field added to model/controller
  reported_by?: string;
  reported_at?: string;
  completed_at?: string | null;
  type?: string;
  note?: string;
  reading_value?: any;
  durationMinutes?: number;
};

export default function LogsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("logs");

  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create form
  const [form, setForm] = useState({
    machine_id: "", // MUST be the _id string
    type: "routine",
    note: "",
    reading_value: "",
    completed_at: "",
  });

  // Filters / search / pagination / sort
  const [filterType, setFilterType] = useState<string>("all");
  const [filterMachine, setFilterMachine] = useState<string>("all"); 
  const [filterWorker, setFilterWorker] = useState<string>("all");
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

  // Aux lists (machines & workers)
  const [machinesList, setMachinesList] = useState<Machine[]>([]); // Use Machine type
  const [workersList, setWorkersList] = useState<any[]>([]);

  useEffect(() => {
    fetchAll();
    fetchMachines();
    fetchWorkers();
  }, []);

  async function fetchAll() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet("/maintenance/get"); 
      if (Array.isArray(data)) setLogs(data);
      else setLogs([]);
    } catch (err: any) {
      console.error("fetch logs error", err);
      setError(String(err?.message || err));
    } finally {
      setLoading(false);
    }
  }

  // Machines endpoint assumed: /machines/get OR /machines
  async function fetchMachines() {
    try {
      const m = await apiGet("/machines/get").catch(() => apiGet("/machines"));
      // Ensure we only store objects with an _id for the dropdown
      if (Array.isArray(m)) setMachinesList(m.filter(item => item._id)); 
      else setMachinesList([]);
    } catch (err) {
      // silently ignore if no endpoint
      setMachinesList([]);
    }
  }

  // Workers endpoint assumed: /users/get or /workers/get
  async function fetchWorkers() {
    try {
      const w =
        (await apiGet("/users/get").catch(() => apiGet("/workers/get"))) ||
        (await apiGet("/users").catch(() => apiGet("/workers")));
      if (Array.isArray(w)) setWorkersList(w);
      else setWorkersList([]);
    } catch {
      setWorkersList([]);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: any = {
        // FIX: Send machine_id as string ("" if empty) - controller handles null conversion
        machine_id: form.machine_id, 
        type: form.type,
        note: form.note || "",
        completed_at: form.completed_at || null,
      };
      
      // FIX: Improved reading_value parsing logic
      if (form.reading_value.trim()) {
        try {
          // Attempt to parse to a JS object
          payload.reading_value = JSON.parse(form.reading_value);
        } catch {
          // Fallback: send raw string if JSON parsing fails, controller will handle
          payload.reading_value = form.reading_value;
        }
      }

      // Assuming POST endpoint is /maintenance/create
      const created = await apiPost("/maintenance/create", payload); 
      // optimistic: push to list top
      setLogs((s) => [created, ...s]);
      setForm({ machine_id: "", type: "routine", note: "", reading_value: "", completed_at: "" });
    } catch (err: any) {
      console.error(err);
      setError(String(err?.message || err || "Failed to create log"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this log? This action cannot be undone.")) return;
    setDeletingId(id);
    try {
      // Assuming DELETE endpoint is /maintenance/:id
      await apiDelete(`/maintenance/${id}`); 
      setLogs((s) => s.filter((l) => l.id !== id));
      if (viewing?.id === id) setViewing(null);
    } catch (err: any) {
      alert("Delete failed: " + String(err?.message || err));
    } finally {
      setDeletingId(null);
    }
  }

  async function openEdit(log: Log) {
    // FIX: When opening edit, ensure reading_value is stringified,
    // and use machine_id (the ObjectId string) for the dropdown selection.
    setEditing({
      ...log,
      // CRITICAL: Ensure machine_id is passed for selection
      machine_id: log.machine_id || "", 
      // Ensure reading_value is stringified for the textarea input
      reading_value: log.reading_value ? JSON.stringify(log.reading_value, null, 2) : "",
      // Fix for datetime-local: slice the ISO string
      completed_at: log.completed_at ? new Date(log.completed_at).toISOString().slice(0, 16) : "",
    });
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    setError(null);
    try {
      const payload: any = {
        ...editing,
      };
      
      // CRITICAL FIX: Ensure machine_id is sent, NOT machine name
      payload.machine_id = editing.machine_id || null;
      // Remove deprecated/redundant keys that shouldn't be saved
      delete payload.machine; // Remove machine name field if we only want machine_id
      delete payload.id; // Remove id (Mongoose uses _id)
      
      // FIX: Reading value parsing logic (from string input to object/string)
      if (typeof editing.reading_value === 'string' && editing.reading_value.trim()) {
        try {
          // Attempt to parse to a JS object
          payload.reading_value = JSON.parse(editing.reading_value as string);
        } catch {
          // Fallback: send raw string
          payload.reading_value = editing.reading_value;
        }
      } else {
          // If it's already an object (which shouldn't happen if openEdit is correct) or null
          payload.reading_value = editing.reading_value || null;
      }
      
      // Assuming PUT endpoint is /maintenance/update/:id
      const updated = await apiPut(`/maintenance/update/${editing.id}`, payload); 
      setLogs((s) => s.map((l) => (l.id === updated.id ? updated : l)));
      setEditing(null);
    } catch (err: any) {
      console.error(err);
      setError(String(err?.message || err || "Update failed"));
    } finally {
      setSaving(false);
    }
  }

  // Derived filtered & sorted logs
  const filtered = useMemo(() => {
    let out = logs.slice();

    if (filterType !== "all") out = out.filter((l) => l.type === filterType);
    
    // FIX: Filter must check against the machine_id (the MongoDB ObjectId string)
    if (filterMachine !== "all") out = out.filter((l) => l.machine_id === filterMachine); 
    
    if (filterWorker !== "all") out = out.filter((l) => l.reported_by === filterWorker);

    if (query.trim()) {
      const q = query.toLowerCase();
      out = out.filter(
        (l) =>
          (l.note || "").toLowerCase().includes(q) ||
          (l.type || "").toLowerCase().includes(q) ||
          (l.machine_name || "").toLowerCase().includes(q) || // Use machine_name from log
          (l.machine_id || "").toString().toLowerCase().includes(q)
      );
    }

    // sort
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
  }, [logs, filterType, filterMachine, filterWorker, query, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  // Helper to find machine name for display
  const getMachineName = (id: string | null | undefined) => {
      if (!id) return "Unknown / N/A";
      const machine = machinesList.find(m => m._id === id);
      return machine?.name || "Unknown Machine";
  }
  
  // Helper to find worker name for display (basic implementation)
  const getWorkerName = (id: string | null | undefined) => {
      if (!id) return "N/A";
      const worker = workersList.find((w: any) => w.id === id || w._id === id);
      return worker?.name || id; // Fallback to ID if name not found
  }

  const formatDateTime = (dateString: string | null | undefined) => {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleString();
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "dark bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      {/* NAVBAR omitted */}

      <main className="pt-28 px-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Maintenance Logs</h1>
          {/* ... Search and buttons ... */}
        </div>

        {/* Create form / Quick Add */}
        <section className={`p-6 rounded-xl mb-8 transition-all ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
          <form onSubmit={handleCreate} className="grid lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-sm block mb-1">Machine</label>
              {/* CRITICAL FIX: The value MUST be m._id */}
              <select 
                  value={form.machine_id} 
                  onChange={(e) => setForm((s) => ({ ...s, machine_id: e.target.value }))} 
                  className="px-3 py-2 rounded border w-full"
              >
                <option value="">— select —</option>
                {machinesList.map((m: Machine) => 
                    <option 
                        key={m._id} 
                        value={m._id} // ONLY send the MongoDB _id string
                    >
                        {m.name}
                    </option>
                )}
              </select>
            </div>

            <div>
              <label className="text-sm block mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm((s) => ({ ...s, type: e.target.value }))} className="px-3 py-2 rounded border w-full">
                <option value="routine">Routine</option>
                <option value="preventive">Preventive</option>
                <option value="predictive">Predictive</option>
                <option value="breakdown">Breakdown</option>
                <option value="implementation">Implementation</option>
              </select>
            </div>

            <div>
              <label className="text-sm block mb-1">Reading (JSON) — optional</label>
              <input value={form.reading_value} onChange={(e) => setForm((s) => ({ ...s, reading_value: e.target.value }))} placeholder='{"temp":45}' className="px-3 py-2 rounded border w-full" />
            </div>

            <div>
              <label className="text-sm block mb-1">Completed at (optional)</label>
              <input type="datetime-local" value={form.completed_at} onChange={(e) => setForm((s) => ({ ...s, completed_at: e.target.value }))} className="px-3 py-2 rounded border w-full" />
            </div>

            <div className="lg:col-span-4">
              <label className="text-sm block mb-1">Notes</label>
              <textarea value={form.note} onChange={(e) => setForm((s) => ({ ...s, note: e.target.value }))} className="w-full px-3 py-2 rounded border" rows={3} />
            </div>

            <div className="flex justify-end lg:col-span-4">
              <button type="submit" disabled={saving} className={`px-5 py-2 rounded-lg font-semibold ${saving ? "bg-gray-400" : "bg-blue-600 text-white"}`}>
                {saving ? "Saving..." : "Add Maintenance Log"}
              </button>
            </div>
          </form>
          {error && <div className="mt-3 text-sm text-red-500">{error}</div>}
        </section>

        {/* Filters */}
        <section className="mb-6 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex gap-3 items-center">
            <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }} className="px-3 py-2 rounded border">
              <option value="all">All Types</option>
              <option value="routine">Routine</option>
              <option value="preventive">Preventive</option>
              <option value="predictive">Predictive</option>
              <option value="breakdown">Breakdown</option>
              <option value="implementation">Implementation</option>
            </select>

            <select value={filterMachine} onChange={(e) => { setFilterMachine(e.target.value); setPage(1); }} className="px-3 py-2 rounded border">
              <option value="all">All Machines</option>
              {/* CRITICAL FIX: Filter options must now ONLY use the MongoDB _id */}
              {machinesList.map((m: Machine) => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>

            <select value={filterWorker} onChange={(e) => { setFilterWorker(e.target.value); setPage(1); }} className="px-3 py-2 rounded border">
              <option value="all">All Workers</option>
              {workersList.map((w: any) => <option key={w.id || w.worker_id} value={w.id || w.worker_id || w.name}>{w.name || w.email || w.id}</option>)}
            </select>
          </div>

          <div className="flex gap-3 items-center">
            <label className="text-sm">Sort</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="px-3 py-2 rounded border">
              <option value="reported_at">Newest</option>
              <option value="duration">Duration</option>
              <option value="type">Type</option>
            </select>
          </div>
        </section>

        {/* Logs grid / table */}
        <section>
          {loading ? (
            <div className="p-6 rounded-lg bg-white dark:bg-gray-800 border text-center">Loading logs...</div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                {paged.map((log) => (
                  <article key={log.id} className={`p-4 rounded-xl border shadow-sm transition-transform transform hover:scale-102 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                            <FiDatabase className="h-5 w-5 text-indigo-500" />
                          </div>
                          <div>
                            <div className="font-semibold text-lg">{log.type || "—"}</div>
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
                          <button onClick={() => openEdit(log)} className="px-2 py-1 rounded-md border hover:bg-gray-100 dark:hover:bg-gray-700"><FiEdit2/></button>
                          <button onClick={() => handleDelete(log.id)} className="px-2 py-1 rounded-md border hover:bg-red-50 text-red-600">
                            {deletingId === log.id ? "Deleting..." : <FiTrash2/>}
                          </button>
                        </div>
                        {log.durationMinutes != null && <div className="text-xs text-gray-400">Duration: {Math.round(log.durationMinutes)} min</div>}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              {/* Pagination omitted */}
            </>
          )}
        </section>
      </main>

      {/* 🚀 VIEWING MODAL (TEXT COLOR FIX APPLIED) */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setViewing(null)} />
          <div className={`relative w-full max-w-3xl p-6 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} z-10 shadow-2xl`}>
            
            <div className="flex justify-between items-start border-b pb-3 mb-4">
              <div>
                <h3 className="text-2xl font-bold text-blue-500">{viewing.type || 'N/A'}</h3>
                <div className="text-base text-gray-500 mt-1">{viewing.machine_name || getMachineName(viewing.machine_id)}</div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setViewing(null); openEdit(viewing); }} className="px-3 py-1 rounded-lg border text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Edit</button>
                <button onClick={() => setViewing(null)} className="px-3 py-1 rounded-lg border text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Close</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                
              <div className="col-span-1">
                {/* LABEL COLOR FIX: Use a consistently dark color for labels (text-gray-900) */}
                <strong className="block text-gray-900">Reported By</strong> 
                {/* VALUE COLOR FIX: Use a consistently dark color for values (text-gray-700) */}
                <div className="text-gray-700">{getWorkerName(viewing.reported_by)}</div>
              </div>

              <div className="col-span-1">
                {/* LABEL COLOR FIX */}
                <strong className="block text-gray-900">Status</strong>
                {/* VALUE COLOR FIX */}
                <div className="text-gray-700">
                    {viewing.completed_at ? 'Completed' : 'In Progress / Pending'}
                </div>
              </div>

              <div className="col-span-1">
                {/* LABEL COLOR FIX */}
                <strong className="block text-gray-900">Reported At</strong>
                {/* VALUE COLOR FIX */}
                <div className="text-gray-700">{formatDateTime(viewing.reported_at)}</div>
              </div>
              
              <div className="col-span-1">
                {/* LABEL COLOR FIX */}
                <strong className="block text-gray-900">Completed At</strong>
                {/* VALUE COLOR FIX */}
                <div className="text-gray-700">{formatDateTime(viewing.completed_at)}</div>
              </div>
              
              <div className="col-span-1">
                {/* LABEL COLOR FIX */}
                <strong className="block text-gray-900">Time Taken / Downtime</strong>
                {/* VALUE COLOR FIX */}
                <div className="text-gray-700 font-semibold">
                    {viewing.durationMinutes != null ? `${Math.round(viewing.durationMinutes)} minutes` : 'Not Finished'}
                </div>
              </div>
              
              <div className="col-span-2 mt-4">
                {/* LABEL COLOR FIX */}
                <strong className="block text-gray-900">Notes / Description</strong>
                {/* VALUE TEXT BOX FIX: Ensure text inside the box is dark (text-gray-700) */}
                <div className={`mt-1 p-3 rounded-lg ${darkMode ? "bg-gray-900" : "bg-gray-50"} whitespace-pre-wrap text-gray-700`}>
                    {viewing.note || 'No notes provided.'}
                </div>
              </div>

              <div className="col-span-2 mt-4">
                {/* LABEL COLOR FIX */}
                <strong className="block text-gray-900">Reading Value (JSON)</strong>
                {/* VALUE TEXT BOX FIX: Ensure text inside the box is dark (text-gray-700) */}
                <pre className={`mt-1 p-3 rounded-lg text-xs overflow-auto ${darkMode ? "bg-gray-900" : "bg-gray-50"} text-gray-700`}>
                    {viewing.reading_value ? JSON.stringify(viewing.reading_value, null, 2) : 'No readings logged.'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal omitted */}
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
              {/* Type select omitted for brevity */}
              <div className="mb-3">
                <label className="text-sm">Machine</label>
                {/* CRITICAL FIX: Use a SELECT here to send the machine_id (ObjectId) string */}
                <select 
                    value={editing.machine_id || ""} // Bind to the machine_id string
                    onChange={(e) => setEditing({ ...editing, machine_id: e.target.value })} 
                    className="w-full px-3 py-2 rounded border"
                >
                    <option value="">— select —</option>
                    {machinesList.map((m: Machine) => 
                        <option 
                            key={m._id} 
                            value={m._id} // ONLY send the MongoDB _id string
                        >
                            {m.name}
                        </option>
                    )}
                </select>
                <div className="text-xs text-gray-500 mt-1">Current: {getMachineName(editing.machine_id)}</div>
              </div>

              <div>
                <label className="text-sm">Completed at</label>
                <input 
                    type="datetime-local" 
                    // FIX: Ensure the value is in the correct format for the input
                    value={editing.completed_at ? editing.completed_at.slice(0, 16) : ""} 
                    onChange={(e) => setEditing({ ...editing, completed_at: e.target.value })} 
                    className="w-full px-3 py-2 rounded border" 
                />
              </div>

              {/* Notes and Reading fields omitted for brevity */}
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