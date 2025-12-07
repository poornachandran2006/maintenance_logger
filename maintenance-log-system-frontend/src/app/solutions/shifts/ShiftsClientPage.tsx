"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FiClock, FiSearch, FiActivity } from "react-icons/fi";
import { LayoutDashboard, MoonIcon, SunIcon } from "lucide-react";
import AuthButton from "@/app/_components/auth-button";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Shift = {
  id?: string;
  _id?: string;
  name: string;
  start_time: string;
  end_time: string;
  break_minutes: number;
};

type Attendance = {
  id?: string;
  _id?: string;
  worker_id: string;
  shift_id: string;
  machine_id?: string | null;
  check_in?: string | null;
  check_out?: string | null;
  worker_name?: string | null;
  machine_name?: string | null;
};

export default function ShiftsClientPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("solutions");

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [workersList, setWorkersList] = useState<any[]>([]);
  const [machinesList, setMachinesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // SHIFT FORM
  const [shiftForm, setShiftForm] = useState({
    name: "",
    start_time: "",
    end_time: "",
    break_minutes: 0,
  });

  // ATTENDANCE FORM
  const [attendanceForm, setAttendanceForm] = useState({
    worker_id: "",
    shift_id: "",
    machine_id: "",
  });

  const [filterShift, setFilterShift] = useState<string>("all");
  const [query, setQuery] = useState<string>("");

  // =============================
  // INITIAL FETCH
  // =============================
  useEffect(() => {
    setIsMounted(true);
    setDarkMode(document.documentElement.classList.contains("dark"));
    fetchInitial();
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
      setError(String(err?.message || err));
    } finally {
      setLoading(false);
    }
  }

  // =============================
  // CREATE SHIFT
  // =============================
  async function addShift(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: shiftForm.name,
        start_time: shiftForm.start_time,
        end_time: shiftForm.end_time,
        break_minutes: shiftForm.break_minutes,
      };

      const created = await apiPost("/shifts/create", payload);

      setShifts((prev) => [created, ...prev]);

      setShiftForm({
        name: "",
        start_time: "",
        end_time: "",
        break_minutes: 0,
      });
    } catch (err: any) {
      alert(err?.message || "Failed to create shift");
    } finally {
      setSaving(false);
    }
  }

  // =============================
  // CHECK IN
  // =============================
  async function checkIn(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        worker_id: attendanceForm.worker_id.trim(),
        shift_id: attendanceForm.shift_id,
        machine_id: attendanceForm.machine_id || null,
        check_in: new Date().toISOString(),
      };

      if (!payload.worker_id) {
        alert("Worker name cannot be empty");
        setSaving(false);
        return;
      }

      const created = await apiPost("/attendance/checkin", payload);

      setAttendance((p) => [created, ...p]);

      const newShifts = await apiGet("/shifts/get");
      setShifts(newShifts);

      setAttendanceForm((s) => ({
        ...s,
        worker_id: "",
        machine_id: "",
      }));
    } catch (err: any) {
      alert(String(err?.message || err));
    } finally {
      setSaving(false);
    }
  }

  // =============================
  // CHECK OUT
  // =============================
  async function checkOut(record: Attendance) {
    const id = record.id || record._id;
    if (!id) return;

    if (!confirm("Check out and compute effective hours?")) return;

    try {
      const updated = await apiPut(`/attendance/checkout/${id}`, {
        check_out: new Date().toISOString(),
      });

      setAttendance((s) =>
        s.map((r) =>
          (r.id || r._id) === (updated.id || updated._id) ? updated : r
        )
      );
    } catch (err: any) {
      alert("Check-out failed: " + String(err));
    }
  }

  // =============================
  // LABELS
  // =============================
  const getShiftLabel = (s: Shift) => {
    const lower = s.name.toLowerCase();
    if (lower.includes("shift 1")) return "Shift 1 (06:00 – 14:30)";
    if (lower.includes("shift 2")) return "Shift 2 (14:30 – 23:00)";
    if (lower.includes("shift 3")) return "Shift 3 (23:00 – 06:00)";
    if (lower.includes("general")) return "General Shift (08:30 – 17:00)";
    return s.name;
  };

  // =============================
  // FILTERS
  // =============================
  const filteredAttendance = useMemo(() => {
    let out = [...attendance];

    if (filterShift !== "all") {
      out = out.filter((a) => a.shift_id === filterShift);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      out = out.filter(
        (r) =>
          (r.worker_name || r.worker_id || "").toLowerCase().includes(q) ||
          (r.machine_name || "").toLowerCase().includes(q)
      );
    }

    return out;
  }, [attendance, filterShift, query]);

  const formatTime = (iso?: string | null) => {
    if (!iso) return "-";
    return new Date(iso).toLocaleString();
  };

  const computeExpectedHours = (s: Shift) => {
    const [sh, sm] = s.start_time.split(":").map(Number);
    const [eh, em] = s.end_time.split(":").map(Number);

    let start = sh * 60 + sm;
    let end = eh * 60 + em;
    if (end <= start) end += 24 * 60;

    const total = end - start - (s.break_minutes || 0);
    return Math.round((total / 60) * 100) / 100;
  };

  const inputClass =
    "px-3 py-2 rounded border w-full " +
    (darkMode
      ? "bg-gray-700 text-white placeholder-gray-300"
      : "bg-gray-200 text-black placeholder-gray-700");

  const handleDarkToggle = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      return next;
    });
  };

  // =============================
  // UI RENDER
  // =============================
  return (
    <div
      className={`min-h-screen ${
        darkMode ? "dark bg-gray-900 text-white" : "bg-gray-50 text-black"
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
              className={`px-3 py-2 rounded-md cursor-pointer ${
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
              className={`px-3 py-2 rounded-md cursor-pointer ${
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
              className={`px-3 py-2 rounded-md cursor-pointer ${
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
              className={`px-3 py-2 rounded-md cursor-pointer ${
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
          {/* Dark Mode Toggle */}
          {isMounted && (
            <button
              onClick={handleDarkToggle}
              className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors ${
                darkMode ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
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

          {/* Dashboard Button */}
          <Link
            href="/dashboard"
            className={`hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg ${
              darkMode
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>

          {isMounted && <AuthButton darkMode={darkMode} />}
        </div>
      </nav>

      {/* MAIN BODY */}
      <main className="pt-28 px-6 max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Shifts & Attendance</h1>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Input
                placeholder="Search workers or machines..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-4"
              />
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>

            <button
              onClick={() => {
                setFilterShift("all");
                setQuery("");
                fetchInitial();
              }}
              className={`px-4 py-2 rounded-lg ${
                darkMode ? "bg-gray-600 text-white" : "bg-gray-300"
              }`}
            >
              Reset
            </button>
          </div>
        </div>

        {/* CHECK IN SECTION */}
        <section className="mb-8">
          <Card
            className={`p-4 ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <form onSubmit={checkIn}>
              <div className="grid md:grid-cols-4 gap-4 items-end">
                {/* Worker */}
                <div>
                  <Label className={darkMode ? "text-white" : "text-black"}>
                    Worker Name
                  </Label>
                  <input
                    type="text"
                    value={attendanceForm.worker_id}
                    onChange={(e) =>
                      setAttendanceForm((s) => ({
                        ...s,
                        worker_id: e.target.value,
                      }))
                    }
                    placeholder="Enter worker name"
                    className={inputClass + " h-11"}
                  />
                </div>

                {/* Shift */}
                <div>
                  <Label className={darkMode ? "text-white" : "text-black"}>
                    Shift
                  </Label>
                  <select
                    value={attendanceForm.shift_id}
                    onChange={(e) =>
                      setAttendanceForm((s) => ({
                        ...s,
                        shift_id: e.target.value,
                      }))
                    }
                    className={inputClass}
                  >
                    <option value="">— select shift —</option>
                    {shifts.map((s) => (
                      <option key={s.id || s._id} value={s.id || s._id}>
                        {getShiftLabel(s)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Machine */}
                <div>
                  <Label className={darkMode ? "text-white" : "text-black"}>
                    Machine (optional)
                  </Label>
                  <select
                    value={attendanceForm.machine_id}
                    onChange={(e) =>
                      setAttendanceForm((s) => ({
                        ...s,
                        machine_id: e.target.value,
                      }))
                    }
                    className={inputClass}
                  >
                    <option value="">— none —</option>
                    {machinesList.map((m) => (
                      <option key={m.id || m._id} value={m.id || m._id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Buttons */}
                <div className="flex gap-2 items-center">
                  <Button
                    type="submit"
                    disabled={
                      saving ||
                      !attendanceForm.worker_id.trim() ||
                      !attendanceForm.shift_id
                    }
                  >
                    {saving ? "Processing..." : "Check In"}
                  </Button>

                  <Button disabled>Check Out on record</Button>
                </div>
              </div>
            </form>
          </Card>
        </section>

        {/* SHIFT FILTER */}
        <section className="mb-4 flex items-center gap-3">
          <select
            value={filterShift}
            onChange={(e) => setFilterShift(e.target.value)}
            className={inputClass}
            style={{ maxWidth: 260 }}
          >
            <option value="all">All Shifts</option>
            {shifts.map((s) => (
              <option key={s.id || s._id} value={s.id || s._id}>
                {getShiftLabel(s)}
              </option>
            ))}
          </select>
        </section>

        {/* ATTENDANCE LIST */}
        <section>
          {loading ? (
            <div className="p-6 rounded-lg text-center">Loading...</div>
          ) : filteredAttendance.length === 0 ? (
            <div
              className={`p-6 rounded-lg border text-center ${
                darkMode ? "bg-gray-800 border-gray-700" : "bg-white"
              }`}
            >
              No attendance records.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredAttendance.map((r) => {
                const shift = shifts.find(
                  (s) => (s.id || s._id) === r.shift_id
                );

                return (
                  <Card
                    key={r.id || r._id}
                    className={`p-4 rounded-xl ${
                      darkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      {/* LEFT SIDE */}
                      <div>
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              darkMode ? "bg-gray-900" : "bg-gray-100"
                            }`}
                          >
                            <FiClock className="h-5 w-5 text-indigo-500" />
                          </div>

                          <div>
                            <div
                              className={`font-semibold text-lg ${
                                darkMode ? "text-white" : "text-black"
                              }`}
                            >
                              {r.worker_name || r.worker_id}
                            </div>

                            <div
                              className={
                                darkMode
                                  ? "text-gray-400 text-sm"
                                  : "text-gray-600 text-sm"
                              }
                            >
                              {r.machine_name || "-"}
                            </div>
                          </div>
                        </div>

                        {/* DETAILS */}
                        <div
                          className={`mt-3 text-sm ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          <div>
                            Shift: {shift ? getShiftLabel(shift) : "-"}
                          </div>
                          <div>Check-in: {formatTime(r.check_in)}</div>
                          <div>Check-out: {formatTime(r.check_out)}</div>
                        </div>
                      </div>

                      {/* RIGHT SIDE */}
                      <div className="flex flex-col items-end gap-3">
                        <div
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Expected: {shift ? computeExpectedHours(shift) : "-"}{" "}
                          hrs
                        </div>

                        <div className="flex gap-2">
                          {/* CHECK OUT */}
                          <button
                            onClick={() => checkOut(r)}
                            className={`px-2 py-1 rounded-md border ${
                              darkMode
                                ? "border-gray-600 text-white hover:bg-gray-700"
                                : "border-gray-300 text-black hover:bg-gray-100"
                            }`}
                          >
                            Check Out
                          </button>

                          {/* DELETE */}
                          <button
                            onClick={() => {
                              if (!confirm("Delete attendance?")) return;
                              apiDelete(`/attendance/${r.id || r._id}`).then(
                                () =>
                                  setAttendance((s) =>
                                    s.filter(
                                      (x) =>
                                        (x.id || x._id) !== (r.id || r._id)
                                    )
                                  )
                              );
                            }}
                            className="px-2 py-1 rounded-md border text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
