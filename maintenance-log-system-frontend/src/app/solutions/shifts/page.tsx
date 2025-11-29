"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FiClock, FiPlus, FiTrash2, FiEdit2, FiSearch } from "react-icons/fi";
import { LayoutDashboard, MoonIcon, SunIcon } from "lucide-react";
import AuthButton from "@/app/_components/auth-button";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Shift = {
  id?: string;
  name: string;
  start_time: string; // "HH:MM:SS"
  end_time: string; // "HH:MM:SS"
  break_minutes: number;
};

type Attendance = {
  id?: string;
  worker_id: string;
  shift_id: string;
  machine_id?: string | null;
  check_in?: string | null; // ISO timestamps
  check_out?: string | null;
  effective_hours?: number | null; // computed by backend or by us
  expected_hours?: number | null;
  performance_rating?: string | null;
  worker_name?: string | null; // optional display field
  machine_name?: string | null;
};

export default function ShiftsPage() {
  // UI state (match logs machines tone)
  const [darkMode, setDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("shifts");

  // domain state
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [workersList, setWorkersList] = useState<any[]>([]);
  const [machinesList, setMachinesList] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // create/edit shift form
  const [shiftForm, setShiftForm] = useState<Shift>({
    name: "",
    start_time: "06:00:00",
    end_time: "14:30:00",
    break_minutes: 45,
  });
  const [editingShift, setEditingShift] = useState<Shift | null>(null);

  // attendance form (check-in/out)
  const [attendanceForm, setAttendanceForm] = useState({
    worker_id: "",
    shift_id: "",
    machine_id: "",
  });

  // filters/search
  const [filterShift, setFilterShift] = useState<string>("all");
  const [query, setQuery] = useState<string>("");

  useEffect(() => {
    setIsMounted(true);
    setDarkMode(document.documentElement.classList.contains("dark"));
    fetchInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchInitial() {
    setLoading(true);
    try {
      const [s, a, w, m] = await Promise.all([
        apiGet("/shifts/get").catch(() => []),
        apiGet("/attendance/get").catch(() => []),
        apiGet("/users/get").catch(() => []),
        apiGet("/machines/get").catch(() => []),
      ]);
      setShifts(Array.isArray(s) ? s : []);
      setAttendance(Array.isArray(a) ? a : []);
      setWorkersList(Array.isArray(w) ? w : []);
      setMachinesList(Array.isArray(m) ? m : []);
    } catch (err: any) {
      console.error("fetch initial error", err);
      setError(String(err?.message || err));
    } finally {
      setLoading(false);
    }
  }

  // SHIFT CRUD -------------------------------------------------
  async function createShift(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: shiftForm.name.trim(),
        start_time: shiftForm.start_time,
        end_time: shiftForm.end_time,
        break_minutes: Number(shiftForm.break_minutes || 0),
      };
      const created = await apiPost("/shifts/create", payload);
      setShifts((s) => [created, ...s]);
      setShiftForm({ name: "", start_time: "06:00:00", end_time: "14:30:00", break_minutes: 45 });
    } catch (err: any) {
      console.error(err);
      setError(String(err?.message || err || "Create failed"));
    } finally {
      setSaving(false);
    }
  }

  function openEditShift(s: Shift) {
    setEditingShift({ ...s });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveShift() {
    if (!editingShift || !editingShift.name) return;
    setSaving(true);
    setError(null);
    try {
      const id = editingShift.id;
      const payload = {
        name: editingShift.name,
        start_time: editingShift.start_time,
        end_time: editingShift.end_time,
        break_minutes: Number(editingShift.break_minutes || 0),
      };
      const updated = await apiPut(`/shifts/update/${id}`, payload);
      setShifts((s) => s.map((x) => (x.id === updated.id ? updated : x)));
      setEditingShift(null);
    } catch (err: any) {
      console.error(err);
      setError(String(err?.message || err || "Update failed"));
    } finally {
      setSaving(false);
    }
  }

  async function deleteShift(id?: string) {
    if (!id) return;
    if (!confirm("Delete this shift? Existing attendance entries remain (you may want to archive)")) return;
    try {
      await apiDelete(`/shifts/${id}`);
      setShifts((s) => s.filter((x) => x.id !== id));
    } catch (err: any) {
      alert("Delete failed: " + String(err?.message || err));
    }
  }

  // ATTENDANCE: check-in (create) & check-out (update)
  async function checkIn(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        worker_id: attendanceForm.worker_id,
        shift_id: attendanceForm.shift_id,
        machine_id: attendanceForm.machine_id || null,
        check_in: new Date().toISOString(),
      };
      const created = await apiPost("/attendance/checkin", payload);
      setAttendance((s) => [created, ...s]);
      // clear worker selection for next check-in
      setAttendanceForm({ worker_id: "", shift_id: attendanceForm.shift_id, machine_id: "" });
    } catch (err: any) {
      console.error("checkin error", err);
      setError(String(err?.message || err || "Check-in failed"));
    } finally {
      setSaving(false);
    }
  }

  async function checkOut(record: Attendance) {
    if (!record.id) return;
    if (!confirm("Check out and compute effective hours?")) return;
    try {
      const payload = { check_out: new Date().toISOString() };
      const updated = await apiPut(`/attendance/checkout/${record.id}`, payload);
      setAttendance((s) => s.map((r) => (r.id === updated.id ? updated : r)));
    } catch (err: any) {
      alert("Check-out failed: " + String(err?.message || err));
    }
  }

  // Derived list + filters
  const filteredAttendance = useMemo(() => {
    let out = attendance.slice();
    if (filterShift !== "all") out = out.filter((a) => a.shift_id === filterShift);
    if (query.trim()) {
      const q = query.toLowerCase();
      out = out.filter(
        (r) =>
          (r.worker_name || "").toLowerCase().includes(q) ||
          (r.machine_name || "").toLowerCase().includes(q)
      );
    }
    return out;
  }, [attendance, filterShift, query]);

  // helpers
  const formatTime = (iso?: string | null) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString();
  };

  const computeExpectedHours = (s: Shift) => {
    // expected = (end - start) - break
    const [sh, sm] = s.start_time.split(":").map(Number);
    const [eh, em] = s.end_time.split(":").map(Number);
    // handle day wrap (shift 3)
    let start = sh * 60 + sm;
    let end = eh * 60 + em;
    if (end <= start) end += 24 * 60;
    const total = end - start;
    const effective = Math.max(0, total - (s.break_minutes || 0));
    return Math.round((effective / 60) * 100) / 100; // hours
  };

  const handleDarkToggle = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      return next;
    });
  };

  // small styling utils (use same classes as logs/machines)
  const inputClass =
    "px-3 py-2 rounded border w-full " +
    (darkMode ? "bg-gray-700 text-white placeholder-white" : "bg-gray-200 text-black placeholder-black");

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "dark bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      {/* NAV (same tone as logs/machines) */}
      <nav className={`border-b fixed w-full px-6 py-4 flex items-center justify-between z-50 ${darkMode ? "bg-gray-800/50 border-gray-700" : "bg-white/80 border-gray-200"}`}>
        <div className="flex items-center space-x-8">
          <div className="flex items-center">
            <div className="bg-blue-500 p-2 rounded-lg"><FiClock className="h-6 w-6 text-white" /></div>
            <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">MaintenanceLog</span>
          </div>

          <div className="hidden md:flex space-x-6">
            <Link href="/" onClick={() => setActiveTab("home")} className={`px-3 py-2 rounded-md ${activeTab === "home" ? "text-blue-500 font-medium" : (darkMode ? "hover:text-gray-300" : "hover:text-gray-700")}`}>Home</Link>
            <Link href="/solutions" onClick={() => setActiveTab("solutions")} className={`px-3 py-2 rounded-md ${activeTab === "solutions" ? "text-blue-500 font-medium" : (darkMode ? "hover:text-gray-300" : "hover:text-gray-700")}`}>Solutions</Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {isMounted && <button onClick={handleDarkToggle} className={`w-12 h-6 flex items-center rounded-full p-1 ${darkMode ? "bg-blue-600" : "bg-gray-300"}`}><div className={`bg-white w-4 h-4 rounded-full transform ${darkMode ? "translate-x-6" : "translate-x-0"}`} /></button>}
          {darkMode ? <SunIcon className="h-5 w-5 text-yellow-300" /> : <MoonIcon className="h-5 w-5 text-gray-600" />}

          <Link href="/dashboard" className={`hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg ${darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600 text-white"}`}><LayoutDashboard className="h-5 w-5" /><span>Dashboard</span></Link>

          {isMounted && <AuthButton darkMode={darkMode} />}
        </div>
      </nav>

      <main className="pt-28 px-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Shifts & Attendance</h1>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Input placeholder="Search workers or machines..." value={query} onChange={(e: any) => setQuery(e.target.value)} className="pl-10 pr-4" />
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>

            <button onClick={() => { setShiftForm({ name: "", start_time: "06:00:00", end_time: "14:30:00", break_minutes: 45 }); setEditingShift(null); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={`px-4 py-2 bg-gray-300 rounded-lg ${darkMode ? "bg-gray-600 text-white" : ""}`}>Reset</button>

            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"><FiPlus /> New Shift</button>
          </div>
        </div>

        {/* CREATE / EDIT SHIFT FORM */}
        <section className={`p-6 rounded-xl mb-8 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
          <form onSubmit={createShift} className="grid lg:grid-cols-4 gap-4 items-end">
            <div>
              <Label>Shift name</Label>
              <Input value={shiftForm.name} onChange={(e: any) => setShiftForm((s) => ({ ...s, name: e.target.value }))} placeholder="Shift 1, Shift 2, General" />
            </div>

            <div>
              <Label>Start time</Label>
              <input type="time" value={shiftForm.start_time.slice(0, 8)} onChange={(e) => setShiftForm((s) => ({ ...s, start_time: e.target.value + ":00" }))} className={inputClass} />
            </div>

            <div>
              <Label>End time</Label>
              <input type="time" value={shiftForm.end_time.slice(0, 8)} onChange={(e) => setShiftForm((s) => ({ ...s, end_time: e.target.value + ":00" }))} className={inputClass} />
            </div>

            <div>
              <Label>Break (minutes)</Label>
              <Input type="number" value={String(shiftForm.break_minutes)} onChange={(e: any) => setShiftForm((s) => ({ ...s, break_minutes: Number(e.target.value || 0) }))} />
            </div>

            <div className="lg:col-span-4 flex justify-end gap-2">
              {editingShift ? (
                <>
                  <Button onClick={() => { setShiftForm({ name: "", start_time: "06:00:00", end_time: "14:30:00", break_minutes: 45 }); setEditingShift(null); }}>Cancel</Button>
                  <Button onClick={saveShift} className={`${saving ? "opacity-50" : ""}`}>{saving ? "Saving..." : "Save changes"}</Button>
                </>
              ) : (
                <Button type="submit" className={`${saving ? "opacity-50" : ""}`} disabled={saving}>{saving ? "Saving..." : "Create shift"}</Button>
              )}
            </div>
          </form>
          {error && <div className="mt-3 text-sm text-red-500">{error}</div>}
        </section>

        {/* Attendance check-in */}
        <section className="mb-8">
          <Card className={`p-4 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
            <div className="grid md:grid-cols-4 gap-4 items-end">
              <div>
                <Label>Worker</Label>
                <select value={attendanceForm.worker_id} onChange={(e) => setAttendanceForm((s) => ({ ...s, worker_id: e.target.value }))} className={inputClass}>
                  <option value="">— select worker —</option>
                  {workersList.map((w: any) => <option key={w.id || w._id} value={w.id || w._id}>{w.name || w.email || w.id}</option>)}
                </select>
              </div>

              <div>
                <Label>Shift</Label>
                <select value={attendanceForm.shift_id} onChange={(e) => setAttendanceForm((s) => ({ ...s, shift_id: e.target.value }))} className={inputClass}>
                  <option value="">— select shift —</option>
                  {shifts.map((s) => <option key={s.id || s.name} value={s.id || s.name}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <Label>Machine (optional)</Label>
                <select value={attendanceForm.machine_id} onChange={(e) => setAttendanceForm((s) => ({ ...s, machine_id: e.target.value }))} className={inputClass}>
                  <option value="">— none —</option>
                  {machinesList.map((m) => <option key={m.id || m._id} value={m.id || m._id}>{m.name}</option>)}
                </select>
              </div>

              <div className="flex gap-2 items-center">
                <div>
                  <Label className="invisible">action</Label>
                  <Button onClick={checkIn} disabled={saving || !attendanceForm.worker_id || !attendanceForm.shift_id}>{saving ? "Processing..." : "Check In"}</Button>
                </div>
                <div>
                  <Label className="invisible">action</Label>
                  <Button onClick={() => { /* noop - check-out is on each record row */ }}>Check Out on record</Button>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Filters + list */}
        <section className="mb-4 flex items-center gap-3">
          <select value={filterShift} onChange={(e) => setFilterShift(e.target.value)} className={inputClass} style={{ minWidth: 220 }}>
            <option value="all">All Shifts</option>
            {shifts.map((s) => <option key={s.id || s.name} value={s.id || s.name}>{s.name}</option>)}
          </select>
        </section>

        {/* Attendance list */}
        <section>
          {loading ? (
            <div className="p-6 rounded-lg text-center">Loading...</div>
          ) : filteredAttendance.length === 0 ? (
            <div className="p-6 rounded-lg bg-white border text-center">No attendance records.</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredAttendance.map((r) => (
                <Card key={r.id} className={`p-4 rounded-xl ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                          <FiClock className="h-5 w-5 text-indigo-500" />
                        </div>
                        <div>
                          <div className="font-semibold text-lg">{r.worker_name || r.worker_id}</div>
                          <div className="text-sm text-gray-500">{r.machine_name || "-"}</div>
                        </div>
                      </div>

                      <div className="mt-3 text-sm text-gray-700">
                        <div>Shift: {shifts.find((s) => (s.id || s.name) === r.shift_id)?.name || r.shift_id}</div>
                        <div>Check-in: {formatTime(r.check_in)}</div>
                        <div>Check-out: {formatTime(r.check_out)}</div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div className="text-sm text-gray-500">Expected: {(() => {
                        const sh = shifts.find((s) => (s.id || s.name) === r.shift_id);
                        return sh ? `${computeExpectedHours(sh)} hrs` : "-";
                      })()}</div>

                      <div className="flex gap-2">
                        <button onClick={() => checkOut(r)} className="px-2 py-1 rounded-md border hover:bg-gray-100 dark:hover:bg-gray-700">Check Out</button>
                        <button onClick={() => {
                          if (!confirm("Delete attendance?")) return;
                          apiDelete(`/attendance/${r.id}`).then(() => setAttendance((s) => s.filter(x => x.id !== r.id))).catch((err) => alert(String(err)));
                        }} className="px-2 py-1 rounded-md border text-red-600 hover:bg-red-50">Delete</button>
                      </div>

                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
